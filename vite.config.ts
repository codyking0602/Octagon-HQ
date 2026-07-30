import { defineConfig } from "vitest/config";
import { loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { validatePublicSupabaseConfig } from "./scripts/public-supabase-config.mjs";
import { allTime } from "./src/features/rankings/rankingModel";

function richPreviewCatalogPlugin(): Plugin {
  return {
    name: "octagon-rich-preview-catalog",
    apply: "build",
    generateBundle() {
      const catalog = {
        version: 1 as const,
        fighters: allTime.map((fighter) => ({
          slug: fighter.slug,
          displayName: fighter.displayName,
          board: fighter.board,
          rank: fighter.rank,
          ovr: fighter.ovr,
          division: fighter.division,
          oneLiner: fighter.oneLiner,
          imagePath: fighter.profileUrl,
        })),
      };
      this.emitFile({
        type: "asset",
        fileName: "preview-data/rankings.json",
        source: `${JSON.stringify(catalog, null, 2)}\n`,
      });
    },
  };
}

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
    plugins: [react(), richPreviewCatalogPlugin()],
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
