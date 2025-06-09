import { PandocError, createPandoc, pandoc } from "pandoc-unwasm";

async function main(): Promise<void> {
  try {
    console.log("🚀 Starting pandoc-unwasm example...");

    // Example 1: Basic Markdown to HTML conversion
    console.log("\n📄 Example 1: Markdown → HTML");
    const markdownInput = `
# Hello World

This is a **Pandoc** example using *WebAssembly*!

## Features

- Universal compatibility
- Client-side processing
- No server dependencies
- Full Pandoc feature set

\`\`\`typescript
const result = await pandoc.convert(input, { 
  from: "markdown", 
  to: "html" 
});
\`\`\`

> This runs entirely in your JavaScript runtime!
`;

    const htmlOutput = await pandoc.convert(markdownInput, {
      from: "markdown",
      to: "html",
    });

    console.log("Input:", markdownInput.trim());
    console.log("Output:", htmlOutput);

    // Example 2: Advanced conversion with options
    console.log("\n📝 Example 2: Advanced HTML with options");
    const advancedHtml = await pandoc.convert(markdownInput, {
      from: "markdown+smart",
      to: "html5",
      options: {
        standalone: true,
        toc: true,
        "toc-depth": 2,
        "number-sections": true,
        template: "default",
      },
    });

    console.log("Advanced HTML output preview:");
    console.log(`${advancedHtml.substring(0, 300)}...`);

    // Example 3: Custom Pandoc instance
    console.log("\n⚙️  Example 3: Custom instance with debug mode");
    const customPandoc = createPandoc({
      debug: true,
      memory: {
        initial: 256,
        maximum: 1024,
      },
    });

    const debugOutput = await customPandoc.convert("# Debug Mode Test", {
      from: "markdown",
      to: "html",
    });

    console.log("Debug output:", debugOutput);

    // Example 4: Get Pandoc information
    console.log("\n📊 Example 4: Pandoc information");
    const info = await pandoc.getInfo();
    console.log("Pandoc version:", info.version);
    console.log("Input formats (first 10):", info.inputFormats.slice(0, 10));
    console.log("Output formats (first 10):", info.outputFormats.slice(0, 10));

    // Example 5: Multiple format conversions
    console.log("\n🔄 Example 5: Multiple format conversions");
    const conversions = [
      { from: "markdown", to: "latex", name: "LaTeX" },
      { from: "markdown", to: "json", name: "JSON AST" },
      { from: "markdown", to: "plain", name: "Plain text" },
    ];

    for (const conversion of conversions) {
      try {
        const result = await pandoc.convert("# Test\n\nThis is a **test**.", {
          from: conversion.from,
          to: conversion.to,
        });
        console.log(`${conversion.name}:`, `${result.substring(0, 100)}...`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log(`${conversion.name}: Conversion failed -`, errorMessage);
      }
    }

    console.log("\n✅ All examples completed successfully!");
  } catch (error) {
    if (error instanceof PandocError) {
      console.error("❌ Pandoc Error:", error.message);
      console.error("Code:", error.code);
      if (error.details) {
        console.error("Details:", error.details);
      }
    } else {
      console.error("❌ Unexpected error:", error);
    }
  }
}

// Run the example
main().catch(console.error);
