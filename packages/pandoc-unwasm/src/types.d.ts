declare module "#pandoc.wasm" {
  const wasmModule: ArrayBuffer;
  export default wasmModule;
}

// WASM exports interface (based on actual inspection)
export interface PandocWasmExports {
  memory: WebAssembly.Memory;
  malloc: (size: number) => number;
  hs_init_with_rtsopts: (argc_ptr: number, argv_ptr: number) => void;
  wasm_main: (args_ptr: number, args_length: number) => number;
  _start: () => void;
  __wasm_call_ctors: () => void;
}

// Conversion options
export interface ConversionOptions {
  /** Input format (e.g., 'markdown', 'html', 'docx') */
  from: string;
  /** Output format (e.g., 'html', 'markdown', 'docx') */
  to: string;
  /** Include metadata as standalone document */
  standalone?: boolean;
  /** Generate table of contents */
  toc?: boolean;
  /** Template to use for standalone documents */
  template?: string;
  /** Variables to pass to template */
  variables?: Record<string, string>;
  /** Additional pandoc options */
  options?: Record<string, unknown>;
  /** Pandoc filters to apply */
  filters?: string[];
  /** Metadata to include */
  metadata?: Record<string, unknown>;
}

// WASM Initialization Options
export interface WasmInitOptions {
  /** Enable debug mode */
  debug?: boolean;
  /** Memory configuration */
  memory?: {
    initial?: number;
    maximum?: number;
  };
}

// Conversion Result Interface
export interface PandocResult {
  /** Converted content */
  output: string;
  /** Conversion log messages */
  log?: string[];
  /** Exit code (0 = success) */
  exitCode: number;
}

// Pandoc Information Interface
export interface PandocInfo {
  /** Pandoc version */
  version: string;
  /** Supported input formats */
  inputFormats: string[];
  /** Supported output formats */
  outputFormats: string[];
}

// Pandoc Instance Interface
export interface PandocInstanceInterface {
  convert(input: string, options: ConversionOptions): Promise<string>;
  getVersion(): Promise<string>;
  getInputFormats(): Promise<string[]>;
  getOutputFormats(): Promise<string[]>;
  getInfo(): Promise<PandocInfo>;
}

// Error Details Interface
export interface PandocErrorDetails {
  originalError?: unknown;
  [key: string]: unknown;
}
