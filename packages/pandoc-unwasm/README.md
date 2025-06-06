# pandoc-unwasm

![npm version](https://img.shields.io/npm/v/pandoc-unwasm)
![npm downloads](https://img.shields.io/npm/dw/pandoc-unwasm)
![npm license](https://img.shields.io/npm/l/pandoc-unwasm)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://www.contributor-covenant.org/version/2/1/code_of_conduct/)

> A modern JavaScript library that provides universal access to Pandoc document conversion functionality across all runtime environments using WebAssembly.

## Overview

pandoc-unwasm combines the power of [pandoc-wasm](https://github.com/tweag/pandoc-wasm) (Pandoc compiled to WebAssembly) with [unwasm](https://github.com/unjs/unwasm) (universal WebAssembly tooling) to create a seamless document conversion experience that works everywhere JavaScript runs.

This library enables you to:

- Convert between 40+ document formats using Pandoc's proven conversion engine
- Run document conversion entirely client-side in browsers
- Use the same API across Node.js, Bun, Deno, Edge Functions, and more
- Process documents without server dependencies or external services

## Requirements

- JavaScript runtime with WebAssembly support
- ES2018+ or Node.js 16+ (for Node.js environments)
- Modern browser with WebAssembly support (for browser environments)

## Installation

```bash
# npm
$ npm install pandoc-unwasm

# yarn
$ yarn add pandoc-unwasm

# pnpm
$ pnpm add pandoc-unwasm

# bun
$ bun add pandoc-unwasm
```

## Quick Start

```typescript
import { pandoc } from "pandoc-unwasm";

// Convert Markdown to HTML
const html = await pandoc.convert("# Hello World\n\nThis is **bold** text.", {
  from: "markdown",
  to: "html",
});

console.log(html);
// Output: <h1 id="hello-world">Hello World</h1>
// <p>This is <strong>bold</strong> text.</p>
```

### Advanced Usage with unwasm

This library leverages [unwasm](https://github.com/unjs/unwasm) for universal WebAssembly support, providing automatic optimization for different runtime environments:

```typescript
import { createPandoc, pandoc } from "pandoc-unwasm";

// Use the default singleton instance
const html = await pandoc.convert(markdown, { from: "markdown", to: "html" });

// Create a custom instance with specific WASM options
const customPandoc = createPandoc({
  debug: true,
  memory: { initial: 512, maximum: 2048 },
});

// Get runtime information
const version = await pandoc.getVersion();
const inputFormats = await pandoc.getInputFormats();
const outputFormats = await pandoc.getOutputFormats();
```

unwasm automatically handles:

- **Module Loading**: Optimized for each runtime environment
- **Import Resolution**: Automatic handling of WASM imports
- **Memory Management**: Efficient memory allocation and cleanup
- **Error Handling**: Graceful fallbacks and error reporting

## Runtime Support

Works across all major JavaScript runtimes:

- **Node.js** 16+ - Full support with native performance
- **Browsers** - All modern browsers with WebAssembly support
- **Bun** - Native runtime support
- **Deno** - Compatible imports available
- **Serverless/Edge** - Cloudflare Workers, Vercel Edge, Netlify Edge, etc.

## Key Features

### Universal Document Conversion

Convert between 40+ formats including Markdown, HTML, LaTeX, DOCX, PDF, and more using Pandoc's proven conversion engine.

### Cross-Runtime Compatibility

Same API works everywhere JavaScript runs - no runtime-specific adaptations needed.

### Client-Side Processing

No server required - runs entirely in JavaScript environments with WebAssembly.

### Full Pandoc Feature Set

Access to Pandoc's complete conversion capabilities, extensions, filters, and citation processing.

### Zero Configuration

Works out of the box with smart defaults and automatic format detection.

### Type-Safe API

Full TypeScript support with comprehensive type definitions.

### High Performance

WebAssembly-powered conversion with native-level speed after initial load.

### Optimized Bundle

Lazy loading of WebAssembly module keeps initial bundle size minimal.

## Format Support

### Input Formats

Markdown (all variants), HTML, LaTeX, reStructuredText, DOCX, ODT, EPUB, MediaWiki, Org-mode, Textile, AsciiDoc, and more.

### Output Formats

HTML, LaTeX, PDF, DOCX, EPUB, reveal.js slides, Beamer presentations, and more.

## Basic Usage Examples

### Convert with Options

```typescript
const result = await pandoc.convert(markdownContent, {
  from: "markdown+smart",
  to: "html5",
  options: {
    standalone: true,
    toc: true,
    numberSections: true,
  },
});
```

### Academic Writing

```typescript
const latex = await pandoc.convert(markdown, {
  from: "markdown+citations",
  to: "latex",
  options: {
    citeproc: true,
    bibliography: "refs.bib",
  },
});
```

### Presentation Slides

```typescript
const slides = await pandoc.convert(markdown, {
  from: "markdown",
  to: "revealjs",
  options: {
    slideLevel: 2,
    theme: "simple",
  },
});
```

## API Reference

```typescript
interface PandocUnwasm {
  convert(input: string, options: ConversionOptions): Promise<string>;
  getInputFormats(): Promise<string[]>;
  getOutputFormats(): Promise<string[]>;
  getVersion(): Promise<string>;
}

interface ConversionOptions {
  from: string;
  to: string;
  options?: Record<string, any>;
  filters?: string[];
  metadata?: Record<string, any>;
}
```

## Performance

- **First Load**: 1-2 seconds for WebAssembly initialization
- **Subsequent Calls**: Near-native performance
- **Bundle Size**: ~2MB library + ~8MB WebAssembly module (lazy loaded)
- **Memory**: Efficient with automatic cleanup

```typescript
// Pre-warm for better performance
await pandoc.getVersion();
```

## Browser Support

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome  | 57+             |
| Firefox | 52+             |
| Safari  | 11+             |
| Edge    | 16+             |

## Error Handling

```typescript
import { pandoc, PandocError } from "pandoc-unwasm";

try {
  const result = await pandoc.convert(input, options);
} catch (error) {
  if (error instanceof PandocError) {
    console.error("Conversion failed:", error.message);
  }
}
```

## Full Documentation

For complete documentation, examples, and advanced usage, see the [main project repository](https://github.com/DemoMacro/pandoc-unwasm).

## License

[MIT](LICENSE) &copy; [Demo Macro](https://imst.xyz/)
