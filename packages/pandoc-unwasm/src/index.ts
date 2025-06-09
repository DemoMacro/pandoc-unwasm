/**
 * Universal Pandoc document converter powered by WebAssembly
 * Works across all JavaScript runtimes: Node.js, Browser, Bun, Deno, Edge Functions, etc.
 */

import {
  ConsoleStdout,
  File,
  OpenFile,
  PreopenDirectory,
  WASI,
} from "@bjorn3/browser_wasi_shim";
import type {
  ConversionOptions,
  PandocErrorDetails,
  PandocInfo,
  PandocInstanceInterface,
  PandocResult,
  PandocWasmExports,
  WasmInitOptions,
} from "./types.d";

// Custom error class
export class PandocError extends Error {
  public readonly code: string;
  public readonly details?: PandocErrorDetails;

  constructor(
    message: string,
    code = "PANDOC_ERROR",
    details?: PandocErrorDetails,
  ) {
    super(message);
    this.name = "PandocError";
    this.code = code;
    this.details = details;
  }
}

class PandocInstance implements PandocInstanceInterface {
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private wasmInstance: WebAssembly.Instance | null = null;
  private wasmModule: WebAssembly.Module | null = null;
  private inputFile: File | null = null;
  private outputFile: File | null = null;
  private wasi: WASI | null = null;
  private hsInitialized = false;
  private allocatedPointers: number[] = []; // Track allocated memory pointers

  constructor(private options: WasmInitOptions = {}) {}

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInitialize();
    await this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      if (this.options.debug) {
        console.log("🚀 [Step 1] Loading Pandoc WASM module...");
      }

      // Load the WASM file
      let wasmBytes: Uint8Array;

      // Always use fetch to load the WASM file for consistency
      // across all environments.
      const wasmUrl = new URL("../assets/bin/pandoc.wasm", import.meta.url);
      const response = await fetch(wasmUrl);
      if (!response.ok) {
        throw new PandocError(
          `Failed to fetch WASM module: ${response.statusText}`,
          "FETCH_ERROR",
        );
      }
      wasmBytes = new Uint8Array(await response.arrayBuffer());

      if (this.options.debug) {
        console.log(`✅ [Step 1] WASM file loaded: ${wasmBytes.length} bytes`);
        console.log("🔧 [Step 2] Compiling WASM module...");
      }

      // Compile WASM module
      this.wasmModule = await WebAssembly.compile(wasmBytes);

      if (this.options.debug) {
        console.log("✅ [Step 2] WASM module compiled successfully");
        console.log("⚙️ [Step 3] Setting up WASI...");
      }

      // Setup WASI
      await this.setupWASI();

      if (this.options.debug) {
        console.log("✅ [Step 3] WASI setup completed");
        console.log("🔌 [Step 4] Creating WASM instance...");
      }

      // Create WASM instance
      if (!this.wasi) {
        throw new PandocError("WASI not initialized", "WASI_ERROR");
      }

      const memoryDescriptor: WebAssembly.MemoryDescriptor = {
        initial: 256,
        maximum: 1024,
        ...this.options.memory,
      };
      const memory = new WebAssembly.Memory(memoryDescriptor);

      const importObject: WebAssembly.Imports = {
        wasi_snapshot_preview1: this.wasi
          .wasiImport as WebAssembly.ModuleImports,
        env: {
          memory,
          __hs_environ_get: () => 0,
          __hs_environ_sizes_get: () => 0,
          __hs_clock_time_get: () => 0,
        },
      };

      this.wasmInstance = await WebAssembly.instantiate(
        this.wasmModule,
        importObject,
      );

      if (this.options.debug) {
        console.log("✅ [Step 4] WASM instance created");
        console.log("🎯 [Step 5] Initializing WASI...");
      }

      // Initialize WASI
      this.wasi.initialize(
        this.wasmInstance as unknown as {
          exports: { memory: WebAssembly.Memory };
        },
      );

      if (this.options.debug) {
        console.log("✅ [Step 5] WASI initialized");
        console.log("🔧 [Step 6] Calling __wasm_call_ctors...");
      }

      // Initialize the WASM module
      const exports = this.wasmInstance.exports as unknown as PandocWasmExports;
      exports.__wasm_call_ctors();

      if (this.options.debug) {
        console.log("✅ [Step 6] __wasm_call_ctors completed");
        console.log("🏗️ [Step 7] Initializing Haskell runtime...");
      }

      // Initialize Haskell runtime - this is where it might hang
      await this.initializeHaskellRuntime();

      if (this.options.debug) {
        console.log("✅ [Step 7] Haskell runtime initialized");
      }

      this.initialized = true;

      if (this.options.debug) {
        console.log("🎉 Pandoc WASM module fully initialized successfully");
        console.log(
          "Available exports:",
          Object.keys(this.wasmInstance.exports),
        );
      }
    } catch (error) {
      if (this.options.debug) {
        console.error("❌ Failed to initialize Pandoc WASM:", error);
      }
      throw new PandocError(
        "Failed to initialize Pandoc WASM module",
        "INIT_ERROR",
        { originalError: error },
      );
    }
  }

  private async setupWASI(): Promise<void> {
    const args = ["pandoc", "+RTS", "-H64m", "-RTS"];
    const env: string[] = [];
    this.inputFile = new File(new Uint8Array(), { readonly: true });
    this.outputFile = new File(new Uint8Array());

    const fds = [
      new OpenFile(new File(new Uint8Array(), { readonly: true })), // stdin
      ConsoleStdout.lineBuffered((msg) =>
        this.options.debug ? console.log(`[WASI stdout] ${msg}`) : null,
      ),
      ConsoleStdout.lineBuffered((msg) =>
        this.options.debug ? console.warn(`[WASI stderr] ${msg}`) : null,
      ),
      new PreopenDirectory(
        "/",
        new Map([
          ["in", this.inputFile],
          ["out", this.outputFile],
        ]),
      ),
    ];

    this.wasi = new WASI(args, env, fds, {
      debug: this.options.debug,
    });
  }

  private async initializeHaskellRuntime(): Promise<void> {
    if (this.hsInitialized || !this.wasmInstance) return;

    const exports = this.wasmInstance.exports as unknown as PandocWasmExports;
    const args = ["pandoc", "+RTS", "-H64m", "-RTS"];

    try {
      if (this.options.debug) {
        console.log("  🔧 [Step 7.1] Setting up Haskell runtime arguments...");
        console.log("    RTS args:", args);
      }

      // Allocate memory for argc
      const argc_ptr = exports.malloc(4);
      this.allocatedPointers.push(argc_ptr);
      this.memoryDataView().setUint32(argc_ptr, args.length, true);

      // Allocate memory for argv
      const argv = exports.malloc(4 * (args.length + 1));
      this.allocatedPointers.push(argv);

      for (let i = 0; i < args.length; i++) {
        const arg = exports.malloc(args[i].length + 1);
        this.allocatedPointers.push(arg);
        new TextEncoder().encodeInto(
          args[i],
          new Uint8Array(exports.memory.buffer, arg, args[i].length),
        );
        this.memoryDataView().setUint8(arg + args[i].length, 0);
        this.memoryDataView().setUint32(argv + 4 * i, arg, true);
      }
      this.memoryDataView().setUint32(argv + 4 * args.length, 0, true);

      const argv_ptr = exports.malloc(4);
      this.allocatedPointers.push(argv_ptr);
      this.memoryDataView().setUint32(argv_ptr, argv, true);

      if (this.options.debug) {
        console.log("  🚀 [Step 7.5] Calling hs_init_with_rtsopts...");
      }

      exports.hs_init_with_rtsopts(argc_ptr, argv_ptr);

      if (this.options.debug) {
        console.log("  ✅ [Step 7.6] hs_init_with_rtsopts completed");
      }

      this.hsInitialized = true;
    } catch (error) {
      if (this.options.debug) {
        console.error("  ❌ Failed to initialize Haskell runtime:", error);
      }
      throw new PandocError(
        "Failed to initialize Haskell runtime",
        "HS_INIT_ERROR",
        { originalError: error },
      );
    }
  }

  private memoryDataView(): DataView {
    if (!this.wasmInstance) {
      throw new PandocError("WASM instance not initialized", "NOT_INITIALIZED");
    }
    const exports = this.wasmInstance.exports as unknown as PandocWasmExports;
    return new DataView(exports.memory.buffer);
  }

  private buildPandocArgs(options: ConversionOptions): string {
    const args: string[] = [];

    // Add input format
    if (options.from) {
      args.push("-f", options.from);
    }

    // Add output format
    if (options.to) {
      args.push("-t", options.to);
    }

    // Add additional options
    if (options.options) {
      for (const [key, value] of Object.entries(options.options)) {
        if (typeof value === "boolean" && value) {
          args.push(`--${key}`);
        } else if (value !== undefined && value !== null) {
          args.push(`--${key}`, String(value));
        }
      }
    }

    // Add filters
    if (options.filters) {
      for (const filter of options.filters) {
        args.push("--filter", filter);
      }
    }

    // Add metadata
    if (options.metadata) {
      for (const [key, value] of Object.entries(options.metadata)) {
        args.push("--metadata", `${key}:${value}`);
      }
    }

    return args.join(" ");
  }

  public async convert(
    input: string,
    options: ConversionOptions,
  ): Promise<string> {
    await this.initialize();

    if (
      !this.wasmInstance ||
      !this.hsInitialized ||
      !this.inputFile ||
      !this.outputFile
    ) {
      throw new PandocError(
        "WASM instance not properly initialized",
        "NOT_INITIALIZED",
      );
    }

    if (this.options.debug) {
      console.log("Converting with options:", options);
      console.log("Input length:", input.length);
    }

    try {
      const exports = this.wasmInstance.exports as unknown as PandocWasmExports;

      // Build pandoc arguments
      const argsStr = this.buildPandocArgs(options);

      if (this.options.debug) {
        console.log("Pandoc arguments:", argsStr);
      }

      // Setup input and clear output
      if (!this.inputFile || !this.outputFile) {
        throw new PandocError("Input/output files not initialized", "IO_ERROR");
      }
      this.inputFile.data = new TextEncoder().encode(input);
      this.outputFile.data = new Uint8Array();

      // Allocate memory for arguments
      const args_ptr = exports.malloc(argsStr.length);
      this.allocatedPointers.push(args_ptr);

      new TextEncoder().encodeInto(
        argsStr,
        new Uint8Array(exports.memory.buffer, args_ptr, argsStr.length),
      );

      // Call pandoc wasm_main
      const exitCode = exports.wasm_main(args_ptr, argsStr.length);

      // Get output
      const output = new TextDecoder("utf-8", { fatal: true }).decode(
        this.outputFile.data,
      );

      if (this.options.debug) {
        console.log(`Conversion completed with exit code: ${exitCode}`);
        console.log(`Output length: ${output.length} characters`);
      }

      return output;
    } catch (error) {
      if (this.options.debug) {
        console.error("Conversion error:", error);
      }

      throw new PandocError(`Conversion failed: ${error}`, "CONVERSION_ERROR", {
        originalError: error,
      });
    }
  }

  public async getVersion(): Promise<string> {
    // For now, return a default version
    // TODO: Extract version from pandoc WASM
    return "3.1.9";
  }

  public async getInputFormats(): Promise<string[]> {
    // TODO: Extract from pandoc WASM
    return [
      "commonmark",
      "creole",
      "csv",
      "docbook",
      "docx",
      "dokuwiki",
      "epub",
      "fb2",
      "gfm",
      "haddock",
      "html",
      "ipynb",
      "jats",
      "jira",
      "json",
      "latex",
      "man",
      "markdown",
      "markdown_mmd",
      "markdown_phpextra",
      "markdown_strict",
      "mediawiki",
      "muse",
      "native",
      "odt",
      "opml",
      "org",
      "rst",
      "rtf",
      "t2t",
      "textile",
      "tikiwiki",
      "twiki",
      "vimwiki",
    ];
  }

  public async getOutputFormats(): Promise<string[]> {
    // TODO: Extract from pandoc WASM
    return [
      "asciidoc",
      "asciidoctor",
      "beamer",
      "commonmark",
      "context",
      "docbook",
      "docbook4",
      "docbook5",
      "docx",
      "dokuwiki",
      "dzslides",
      "epub",
      "epub2",
      "epub3",
      "fb2",
      "gfm",
      "haddock",
      "html",
      "html4",
      "html5",
      "icml",
      "ipynb",
      "jats",
      "jira",
      "json",
      "latex",
      "man",
      "markdown",
      "markdown_mmd",
      "markdown_phpextra",
      "markdown_strict",
      "mediawiki",
      "ms",
      "muse",
      "native",
      "odt",
      "opml",
      "opendocument",
      "org",
      "pdf",
      "plain",
      "pptx",
      "revealjs",
      "rst",
      "rtf",
      "s5",
      "slideous",
      "slidy",
      "tei",
      "texinfo",
      "textile",
      "xwiki",
      "zimwiki",
    ];
  }

  public async getInfo(): Promise<PandocInfo> {
    const [version, inputFormats, outputFormats] = await Promise.all([
      this.getVersion(),
      this.getInputFormats(),
      this.getOutputFormats(),
    ]);

    return {
      version,
      inputFormats,
      outputFormats,
    };
  }
}

// Create default instance
const defaultInstance = new PandocInstance();

// Main API
export const pandoc: PandocInstanceInterface = {
  /**
   * Convert document content from one format to another
   */
  convert: (input: string, options: ConversionOptions): Promise<string> =>
    defaultInstance.convert(input, options),

  /**
   * Get Pandoc version
   */
  getVersion: (): Promise<string> => defaultInstance.getVersion(),

  /**
   * Get list of supported input formats
   */
  getInputFormats: (): Promise<string[]> => defaultInstance.getInputFormats(),

  /**
   * Get list of supported output formats
   */
  getOutputFormats: (): Promise<string[]> => defaultInstance.getOutputFormats(),

  /**
   * Get complete Pandoc information
   */
  getInfo: (): Promise<PandocInfo> => defaultInstance.getInfo(),
};

/**
 * Create a custom Pandoc instance with specific options
 */
export function createPandoc(
  options: WasmInitOptions = {},
): PandocInstanceInterface {
  const instance = new PandocInstance(options);

  return {
    convert: (
      input: string,
      conversionOptions: ConversionOptions,
    ): Promise<string> => instance.convert(input, conversionOptions),
    getVersion: (): Promise<string> => instance.getVersion(),
    getInputFormats: (): Promise<string[]> => instance.getInputFormats(),
    getOutputFormats: (): Promise<string[]> => instance.getOutputFormats(),
    getInfo: (): Promise<PandocInfo> => instance.getInfo(),
  };
}

// Export types
export type {
  ConversionOptions,
  WasmInitOptions,
  PandocResult,
  PandocInfo,
  PandocInstanceInterface,
};

// Default export
export default pandoc;
