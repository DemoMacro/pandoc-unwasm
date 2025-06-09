const fs = require("node:fs");

async function checkWasmExports() {
  try {
    console.log("Loading pandoc.wasm...");
    const wasmBuffer = fs.readFileSync("pandoc.wasm");
    console.log(`File size: ${wasmBuffer.length} bytes`);

    const module = await WebAssembly.compile(wasmBuffer);
    const exports = WebAssembly.Module.exports(module);

    console.log(`\nTotal exports: ${exports.length}`);

    // Show first 50 exports
    console.log("\n=== First 50 exports ===");
    for (let i = 0; i < Math.min(50, exports.length); i++) {
      const exp = exports[i];
      console.log(`${i + 1}: ${exp.name} - ${exp.kind}`);
    }

    // Search for Haskell runtime functions
    console.log("\n=== Haskell runtime functions (hs_*) ===");
    const hsFunctions = exports.filter((exp) => exp.name.startsWith("hs_"));
    if (hsFunctions.length > 0) {
      for (const exp of hsFunctions) {
        console.log(`${exp.name} - ${exp.kind}`);
      }
    } else {
      console.log("No hs_ functions found");
    }

    // Search for main functions
    console.log("\n=== Main functions ===");
    const mainFunctions = exports.filter((exp) => exp.name.includes("main"));
    if (mainFunctions.length > 0) {
      for (const exp of mainFunctions) {
        console.log(`${exp.name} - ${exp.kind}`);
      }
    } else {
      console.log("No main functions found");
    }

    // Search for pandoc functions
    console.log("\n=== Pandoc functions ===");
    const pandocFunctions = exports.filter((exp) =>
      exp.name.includes("pandoc"),
    );
    if (pandocFunctions.length > 0) {
      for (const exp of pandocFunctions) {
        console.log(`${exp.name} - ${exp.kind}`);
      }
    } else {
      console.log("No pandoc functions found");
    }

    // Search for init functions
    console.log("\n=== Init functions ===");
    const initFunctions = exports.filter((exp) => exp.name.includes("init"));
    if (initFunctions.length > 0) {
      for (const exp of initFunctions) {
        console.log(`${exp.name} - ${exp.kind}`);
      }
    } else {
      console.log("No init functions found");
    }

    // Search for convert functions
    console.log("\n=== Convert functions ===");
    const convertFunctions = exports.filter(
      (exp) => exp.name.includes("convert") || exp.name.includes("Convert"),
    );
    if (convertFunctions.length > 0) {
      for (const exp of convertFunctions) {
        console.log(`${exp.name} - ${exp.kind}`);
      }
    } else {
      console.log("No convert functions found");
    }

    // Search for memory management functions
    console.log("\n=== Memory management functions ===");
    const memFunctions = exports.filter(
      (exp) =>
        exp.name.includes("malloc") ||
        exp.name.includes("free") ||
        exp.name.includes("memory") ||
        exp.name === "memory",
    );
    if (memFunctions.length > 0) {
      for (const exp of memFunctions) {
        console.log(`${exp.name} - ${exp.kind}`);
      }
    } else {
      console.log("No memory functions found");
    }

    // Additional searches for WASI and other relevant functions
    console.log("\n=== WASI functions ===");
    const wasiFunctions = exports.filter(
      (exp) => exp.name.includes("wasi") || exp.name.startsWith("_"),
    );
    console.log(`Found ${wasiFunctions.length} WASI/underscore functions`);
    if (wasiFunctions.length > 0 && wasiFunctions.length <= 20) {
      for (const exp of wasiFunctions) {
        console.log(`${exp.name} - ${exp.kind}`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkWasmExports();
