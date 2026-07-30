import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vitest/config";
import { loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { validatePublicSupabaseConfig } from "./scripts/public-supabase-config.mjs";
import { playGames } from "./src/features/play/playRegistry";
import { allTime } from "./src/features/rankings/rankingModel";

function deployedAssetPath(path: string) {
  return existsSync(join(process.cwd(), "public", path.replace(/^\/+/, "")));
}

function previewImagePath(profileUrl: string, thumbUrl: string) {
  if (deployedAssetPath(profileUrl)) return profileUrl;
  if (deployedAssetPath(thumbUrl)) return thumbUrl;
  return "/assets/app-icon.png";
}

const legacyRankingLabel = new RegExp("\\bG\\.?O\\.?A\\.?T\\.?\\b", "gi");
const accentedCareerLabel = new RegExp("r(?:é|e)sum(?:é|e)", "gi");

function plainBuildCopy(value: string) {
  return value
    .replace(legacyRankingLabel, "")
    .replace(accentedCareerLabel, "resume")
    .replace(/\s+/g, " ")
    .trim();
}

function deployedFighterAssets() {
  const directory = join(process.cwd(), "public", "assets", "fighters");
  const assets = new Map<string, { profile?: string; thumb?: string }>();
  if (!existsSync(directory)) return {};

  for (const fileName of readdirSync(directory)) {
    if (!fileName.endsWith(".webp")) continue;
    const isThumb = fileName.endsWith("-thumb.webp");
    const slug = fileName.replace(isThumb ? /-thumb\.webp$/ : /\.webp$/, "");
    const row = assets.get(slug) ?? {};
    const path = `/assets/fighters/${fileName}`;
    if (isThumb) row.thumb = path;
    else row.profile = path;
    assets.set(slug, row);
  }

  return Object.fromEntries(
    [...assets.entries()].map(([slug, row]) => [slug, row.profile ?? row.thumb ?? "/assets/app-icon.png"]),
  );
}

function richPreviewCatalogPlugin(): Plugin {
  return {
    name: "octagon-rich-preview-catalog",
    apply: "build",
    generateBundle() {
      const catalog = {
        version: 2 as const,
        fighters: allTime.map((fighter) => ({
          slug: fighter.slug,
          displayName: plainBuildCopy(fighter.displayName),
          board: fighter.board,
          rank: fighter.rank,
          ovr: fighter.ovr,
          division: plainBuildCopy(fighter.division),
          oneLiner: plainBuildCopy(fighter.oneLiner),
          imagePath: previewImagePath(fighter.profileUrl, fighter.thumbUrl),
        })),
        games: playGames.map((game) => ({
          id: game.id,
          title: plainBuildCopy(game.title),
          description: plainBuildCopy(game.description),
          imagePath: `/assets/share/${game.id}.svg`,
        })),
        fighterAssets: deployedFighterAssets(),
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
  const deploymentSha = (env.VITE_DEPLOYMENT_SHA ?? process.env.SOURCE_SHA ?? "").trim().toLowerCase();
  if (deploymentSha && !/^[0-9a-f]{40}$/.test(deploymentSha)) {
    throw new Error("VITE_DEPLOYMENT_SHA or SOURCE_SHA must be an exact 40-character commit SHA.");
  }
  if (mode === "production") {
    validatePublicSupabaseConfig({
      url: env.VITE_SUPABASE_URL,
      publishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
      expectedHostname: env.VITE_EXPECTED_SUPABASE_HOSTNAME,
    });
  }

  return {
    plugins: [react(), richPreviewCatalogPlugin()],
    define: {
      __OCTAGON_DEPLOYMENT_SHA__: JSON.stringify(deploymentSha),
    },
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
