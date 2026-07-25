import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { validatePublicSupabaseConfig } from "./scripts/public-supabase-config.mjs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (mode === "production") {
    validatePublicSupabaseConfig({
      url: env.VITE_SUPABASE_URL,
      publishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
      expectedHostname: env.VITE_EXPECTED_SUPABASE_HOSTNAME,
    });
  }

  return {
    plugins: [react()],
    build: {
      target: "es2022",
      sourcemap: true,
    },
    test: {
      environment: "jsdom",
      setupFiles: "./vitest.setup.ts",
      css: true,
    },
  };
});
