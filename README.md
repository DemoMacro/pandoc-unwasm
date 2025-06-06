# pandoc-unwasm

![GitHub](https://img.shields.io/github/license/DemoMacro/pandoc-unwasm)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://www.contributor-covenant.org/version/2/1/code_of_conduct/)

> A modern JavaScript library that provides universal access to Pandoc document conversion functionality across all runtime environments using WebAssembly.

## Overview

pandoc-unwasm combines the power of [pandoc-wasm](https://github.com/tweag/pandoc-wasm) (Pandoc compiled to WebAssembly) with [unwasm](https://github.com/unjs/unwasm) (universal WebAssembly tooling) to create a seamless document conversion experience that works everywhere JavaScript runs.

This library enables you to:

- Convert between 40+ document formats using Pandoc's proven conversion engine
- Run document conversion entirely client-side in browsers
- Use the same API across Node.js, Bun, Deno, Edge Functions, and more
- Process documents without server dependencies or external services

## Features

- 🔄 **Universal Document Conversion** - Convert between Markdown, HTML, LaTeX, DOCX, PDF, and 40+ other formats
- 🌐 **Cross-Runtime Compatibility** - Works in Node.js, browsers, Bun, Deno, Cloudflare Workers, and more
- ⚡ **Client-Side Processing** - No server required, runs entirely in JavaScript environments
- 🎯 **Full Pandoc Feature Set** - Access to Pandoc's complete conversion capabilities and extensions
- 📦 **Zero Configuration** - Works out of the box with smart defaults
- 🔒 **Type-Safe API** - Full TypeScript support with comprehensive type definitions
- 🚀 **High Performance** - WebAssembly-powered conversion with native-level speed
- 📱 **Lightweight** - Optimized bundle size with lazy loading support

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

### Basic Usage

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

### Advanced Usage

```typescript
import { pandoc } from "pandoc-unwasm";

// Convert with custom options
const result = await pandoc.convert(markdownContent, {
  from: "markdown+smart+yaml_metadata_block",
  to: "html5",
  options: {
    standalone: true,
    toc: true,
    tocDepth: 3,
    numberSections: true,
    citeproc: true,
  },
  filters: ["pandoc-crossref"],
  metadata: {
    title: "My Document",
    author: "Author Name",
  },
});
```

### Browser Usage

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      import { pandoc } from "https://unpkg.com/pandoc-unwasm/dist/index.mjs";

      const convertMarkdown = async () => {
        const markdown = document.getElementById("markdown").value;
        const html = await pandoc.convert(markdown, {
          from: "markdown",
          to: "html",
        });
        document.getElementById("output").innerHTML = html;
      };

      window.convertMarkdown = convertMarkdown;
    </script>
  </head>
  <body>
    <textarea id="markdown" placeholder="Enter Markdown here..."></textarea>
    <button onclick="convertMarkdown()">Convert</button>
    <div id="output"></div>
  </body>
</html>
```

## API Reference

### Core API

```typescript
interface PandocUnwasm {
  // Main conversion function
  convert(
    input: string | Buffer | Uint8Array,
    options: ConversionOptions,
  ): Promise<string>;

  // Get supported formats
  getInputFormats(): Promise<string[]>;
  getOutputFormats(): Promise<string[]>;

  // Utility functions
  getVersion(): Promise<string>;
  listExtensions(format: string): Promise<string[]>;
}
```

### Configuration Types

```typescript
interface ConversionOptions {
  from: string; // Input format (e.g., "markdown", "html", "latex")
  to: string; // Output format (e.g., "html", "pdf", "docx")

  // Pandoc options
  options?: {
    standalone?: boolean; // Produce standalone document
    toc?: boolean; // Generate table of contents
    tocDepth?: number; // TOC depth (1-6)
    numberSections?: boolean; // Number section headings
    sectionDivs?: boolean; // Wrap sections in div tags
    citeproc?: boolean; // Process citations
    bibliography?: string; // Bibliography file
    csl?: string; // Citation style file
    template?: string; // Custom template
    variables?: Record<string, any>; // Template variables
    [key: string]: any; // Additional Pandoc options
  };

  // Filters and extensions
  filters?: string[]; // Pandoc filters to apply
  extensions?: string[]; // Format extensions to enable

  // Metadata
  metadata?: Record<string, any>;

  // Advanced options
  dataDir?: string; // Pandoc data directory
  extractMedia?: string; // Extract media to directory
  wrapText?: "auto" | "none" | "preserve";
  columns?: number; // Line length for text wrapping
}

interface ConversionResult {
  output: string; // Converted content
  warnings?: string[]; // Conversion warnings
  log?: string[]; // Processing log
}

// Supported formats (examples)
type InputFormat =
  | "markdown"
  | "markdown_strict"
  | "markdown_phpextra"
  | "markdown_github"
  | "html"
  | "html4"
  | "html5"
  | "latex"
  | "tex"
  | "rst"
  | "textile"
  | "mediawiki"
  | "org"
  | "docx"
  | "odt"
  | "epub"
  | "json"
  | "native"
  | string;

type OutputFormat =
  | "html"
  | "html4"
  | "html5"
  | "latex"
  | "tex"
  | "context"
  | "texinfo"
  | "markdown"
  | "markdown_strict"
  | "markdown_phpextra"
  | "markdown_github"
  | "rst"
  | "textile"
  | "mediawiki"
  | "org"
  | "asciidoc"
  | "docx"
  | "odt"
  | "epub"
  | "epub3"
  | "pdf"
  | "beamer"
  | "slidy"
  | "slidous"
  | "dzslides"
  | "revealjs"
  | "rtf"
  | "plain"
  | "json"
  | "native"
  | string;
```

## Runtime Support

pandoc-unwasm works across all major JavaScript runtimes:

### Node.js

```typescript
import { pandoc } from "pandoc-unwasm";
// Works with Node.js 16+
```

### Browsers

```typescript
import { pandoc } from "pandoc-unwasm";
// Works in all modern browsers with WebAssembly support
```

### Bun

```typescript
import { pandoc } from "pandoc-unwasm";
// Native support for Bun runtime
```

### Deno

```typescript
import { pandoc } from "https://deno.land/x/pandoc_unwasm/mod.ts";
// Deno-compatible imports
```

### Serverless/Edge Functions

```typescript
// Cloudflare Workers, Vercel Edge, Netlify Edge, etc.
import { pandoc } from "pandoc-unwasm";
// Optimized for edge runtime environments
```

## Format Support

pandoc-unwasm supports the same extensive format coverage as Pandoc:

### Input Formats

- **Markdown variants**: CommonMark, GitHub Flavored Markdown, MultiMarkdown, Pandoc Markdown
- **Web formats**: HTML4, HTML5, XHTML
- **Academic formats**: LaTeX, ConTeXt, reStructuredText
- **Office documents**: DOCX, ODT, RTF
- **Wiki formats**: MediaWiki, DokuWiki, TikiWiki
- **Other formats**: Org-mode, Textile, AsciiDoc, EPUB, JSON, and more

### Output Formats

- **Web formats**: HTML4, HTML5, XHTML
- **Presentation formats**: reveal.js, Slidy, Slideous, DZSlides, Beamer
- **Academic formats**: LaTeX, ConTeXt, reStructuredText, Texinfo
- **Office documents**: DOCX, ODT, RTF, EPUB
- **Other formats**: PDF (via LaTeX), Plain text, JSON, and more

## Examples

### Document Processing Pipeline

```typescript
import { pandoc } from "pandoc-unwasm";

class DocumentProcessor {
  async convertAcademicPaper(markdown: string) {
    return pandoc.convert(markdown, {
      from: "markdown+citations+yaml_metadata_block",
      to: "latex",
      options: {
        standalone: true,
        numberSections: true,
        citeproc: true,
        template: "academic-paper",
      },
      metadata: {
        documentclass: "article",
        geometry: "margin=1in",
        fontsize: "12pt",
      },
    });
  }

  async createWebSlides(markdown: string) {
    return pandoc.convert(markdown, {
      from: "markdown",
      to: "revealjs",
      options: {
        standalone: true,
        slideLevel: 2,
        theme: "simple",
        transition: "slide",
      },
    });
  }

  async generateEbook(chapters: string[]) {
    const combined = chapters.join("\n\n---\n\n");
    return pandoc.convert(combined, {
      from: "markdown",
      to: "epub3",
      options: {
        standalone: true,
        toc: true,
        tocDepth: 2,
      },
      metadata: {
        title: "My Book",
        author: "Author Name",
        lang: "en-US",
      },
    });
  }
}
```

### Batch Processing

```typescript
import { pandoc } from "pandoc-unwasm";

async function batchConvert(files: Array<{ name: string; content: string }>) {
  const results = await Promise.all(
    files.map(async (file) => {
      const output = await pandoc.convert(file.content, {
        from: "markdown",
        to: "html",
        options: { standalone: true },
      });

      return {
        name: file.name.replace(".md", ".html"),
        content: output,
      };
    }),
  );

  return results;
}
```

## Error Handling

```typescript
import { pandoc, PandocError } from "pandoc-unwasm";

try {
  const result = await pandoc.convert(input, options);
  console.log(result);
} catch (error) {
  if (error instanceof PandocError) {
    console.error("Pandoc conversion failed:", error.message);
    console.error("Exit code:", error.exitCode);
    console.error("Stderr:", error.stderr);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## Performance Considerations

- **First Load**: Initial WebAssembly loading may take 1-2 seconds
- **Subsequent Calls**: Very fast, native-level performance
- **Memory Usage**: Efficient memory management with automatic cleanup
- **Bundle Size**: Core library is ~2MB, WebAssembly module is ~8MB
- **Lazy Loading**: WebAssembly module loads only when first used

```typescript
// Pre-load for better performance
import { pandoc } from "pandoc-unwasm";

// Warm up the WebAssembly module
await pandoc.getVersion();
```

## Browser Compatibility

| Browser | Version | WebAssembly Support |
| ------- | ------- | ------------------- |
| Chrome  | 57+     | ✅ Full Support     |
| Firefox | 52+     | ✅ Full Support     |
| Safari  | 11+     | ✅ Full Support     |
| Edge    | 16+     | ✅ Full Support     |

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Acknowledgments

- [Pandoc](https://pandoc.org/) - The universal document converter by John MacFarlane
- [pandoc-wasm](https://github.com/tweag/pandoc-wasm) - Pandoc compiled to WebAssembly
- [unwasm](https://github.com/unjs/unwasm) - Universal WebAssembly tooling for JavaScript

## License

- [MIT](LICENSE) &copy; [Demo Macro](https://imst.xyz/)
