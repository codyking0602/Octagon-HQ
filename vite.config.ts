import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

function validSupabaseUrl(value: string) {
  if (!value || value.includes("your-project-id")) return false;
  try {
    return new URL(value).hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

function validPublishableKey(value: string) {
  return Boolean(
    value
      && !value.includes("your-publishable-key")
      && (value.startsWith("sb_publishable_") || value.startsWith("eyJ")),
  );
}

export default defineConfig(({ command, mode }) => {
  const browserDefines: Record<string, string> = {};

  if (command === "build") {
    const fileEnv = loadEnv(mode, process.cwd(), "");
    const injectedUrl = process.env.VITE_SUPABASE_URL || "";
    const injectedKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
    const fileUrl = fileEnv.VITE_SUPABASE_URL || "";
    const fileKey = fileEnv.VITE_SUPABASE_PUBLISHABLE_KEY || "";

    const supabaseUrl = validSupabaseUrl(injectedUrl) ? injectedUrl : fileUrl;
    const publishableKey = validPublishableKey(injectedKey) ? injectedKey : fileKey;

    if (!validSupabaseUrl(supabaseUrl)) {
      throw new Error("Production VITE_SUPABASE_URL is missing or still uses a placeholder.");
    }

    if (!validPublishableKey(publishableKey)) {
      throw new Error("Production VITE_SUPABASE_PUBLISHABLE_KEY is missing or invalid.");
    }

    browserDefines["import.meta.env.VITE_SUPABASE_URL"] = JSON.stringify(supabaseUrl);
    browserDefines["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"] = JSON.stringify(publishableKey);
  }

  return {
    plugins: [react()],
    define: browserDefines,
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
