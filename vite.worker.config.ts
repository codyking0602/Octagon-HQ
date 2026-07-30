import { defineConfig, loadEnv } from "vite";
import { validatePublicSupabaseConfig } from "./scripts/public-supabase-config.mjs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  validatePublicSupabaseConfig({
    url: env.VITE_SUPABASE_URL,
    publishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
    expectedHostname: env.VITE_EXPECTED_SUPABASE_HOSTNAME,
  });

  return {
    define: {
      __OCTAGON_SUPABASE_URL__: JSON.stringify(env.VITE_SUPABASE_URL),
      __OCTAGON_SUPABASE_PUBLISHABLE_KEY__: JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY),
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
