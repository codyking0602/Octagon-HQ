import { readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, loadEnv } from "vite";
import { validatePublicSupabaseConfig } from "./scripts/public-supabase-config.mjs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  validatePublicSupabaseConfig({
    url: env.VITE_SUPABASE_URL,
    publishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
    expectedHostname: env.VITE_EXPECTED_SUPABASE_HOSTNAME,
  });

  const catalogPath = join(process.cwd(), "dist", "preview-data", "rankings.json");
  const catalogSource = readFileSync(catalogPath, "utf8");
  const catalog = JSON.parse(catalogSource) as { version?: unknown; fighters?: unknown; games?: unknown };
  if (catalog.version !== 2 || !Array.isArray(catalog.fighters) || !Array.isArray(catalog.games)) {
    throw new Error("The Worker build requires the validated rich preview catalog from the application build.");
  }

  return {
    define: {
      __OCTAGON_SUPABASE_URL__: JSON.stringify(env.VITE_SUPABASE_URL),
      __OCTAGON_SUPABASE_PUBLISHABLE_KEY__: JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY),
      __OCTAGON_PREVIEW_CATALOG__: JSON.stringify(catalogSource),
    },
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
  };
});
