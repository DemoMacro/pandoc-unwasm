import { defineConfig } from "tsdown";
import { rollup as unwasm } from "unwasm/plugin";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  exports: {
    all: true,
  },
  minify: true,
  plugins: [
    unwasm({
      esmImport: true,
      lazy: true,
    }),
  ],
  outputOptions: {
    sourcemap: false,
    exports: "named",
  },
});
