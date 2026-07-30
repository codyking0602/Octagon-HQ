import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: "worker/index.ts",
      formats: ["es"],
      fileName: () => "_worker.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
