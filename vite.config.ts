import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    const fileEnv = loadEnv(mode, process.cwd(), "");
    const supabaseUrl = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL || "";
    const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
      || fileEnv.VITE_SUPABASE_PUBLISHABLE_KEY
      || "";

    let hostname = "";
    try {
      hostname = new URL(supabaseUrl).hostname;
    } catch {
      // The explicit error below owns the production build failure.
    }

    if (
      !supabaseUrl
      || supabaseUrl.includes("your-project-id")
      || !hostname.endsWith(".supabase.co")
    ) {
      throw new Error("Production VITE_SUPABASE_URL is missing or still uses a placeholder.");
    }

    if (
      !publishableKey
      || publishableKey.includes("your-publishable-key")
      || !(publishableKey.startsWith("sb_publishable_") || publishableKey.startsWith("eyJ"))
    ) {
      throw new Error("Production VITE_SUPABASE_PUBLISHABLE_KEY is missing or invalid.");
    }
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
