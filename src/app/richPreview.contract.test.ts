import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
}

const wrangler = source("../../wrangler.jsonc");
const packageJson = source("../../package.json");
const viteConfig = source("../../vite.config.ts");
const workerConfig = source("../../vite.worker.config.ts");
const worker = source("../../worker/index.ts");
const previewModel = source("../../worker/previewModel.ts");
const previewCard = source("../../worker/previewCard.ts");
const liveVerifier = source("../../scripts/verify-live-rich-previews.mjs");
const liveWorkflow = source("../../.github/workflows/verify-live-rich-previews.yml");
const architecture = source("../../docs/rich-preview-architecture.md");
const migration = source("../../supabase/migrations/202608200028_dynamic_rich_preview_data.sql");
const assetsIgnore = source("../../public/.assetsignore");

describe("rich preview ownership", () => {
  it("uses one Worker and one Browser Run binding for every approved preview surface", () => {
    expect(wrangler).toContain('"main": "./dist/_worker.js"');
    expect(wrangler).toContain('"binding": "ASSETS"');
    expect(wrangler).toContain('"browser"');
    expect(wrangler).toContain('"binding": "BROWSER"');
    for (const route of [
      '"/fighters/*"',
      '"/rankings"',
      '"/picks"',
      '"/play"',
      '"/play/*"',
      '"/share-preview/*"',
    ]) {
      expect(wrangler).toContain(route);
    }
    expect(wrangler).not.toContain('"run_worker_first": true');
    expect(assetsIgnore).toContain("_worker.js");
  });

  it("embeds compact preview catalogs from canonical app owners", () => {
    expect(viteConfig).toContain('import { allTime } from "./src/features/rankings/rankingModel"');
    expect(viteConfig).toContain('import { playGames } from "./src/features/play/playRegistry"');
    expect(viteConfig).toContain('version: 2 as const');
    expect(viteConfig).toContain("fighterAssets: deployedFighterAssets()");
    expect(viteConfig).toContain('fileName: "preview-data/rankings.json"');
    expect(workerConfig).toContain('"preview-data", "rankings.json"');
    expect(workerConfig).toContain("__OCTAGON_PREVIEW_CATALOG__");
    expect(worker).not.toContain("preview-data/rankings.json");
    expect(worker).not.toContain("rankingInputs");
  });

  it("bundles one server metadata owner and one rendered PNG card owner", () => {
    expect(packageJson).toContain("vite build --config vite.worker.config.ts");
    expect(workerConfig).toContain('fileName: () => "_worker.js"');
    expect(workerConfig).toContain("emptyOutDir: false");
    expect(workerConfig).toContain("__OCTAGON_SUPABASE_URL__");
    expect(workerConfig).toContain("__OCTAGON_SUPABASE_PUBLISHABLE_KEY__");
    expect(worker).toContain("HTMLRewriter");
    expect(worker).toContain('quickAction("screenshot"');
    expect(worker).toContain("og:image:width");
    expect(worker).toContain("og:image:height");
    expect(worker).toContain("image/png");
    expect(worker).toContain("X-Octagon-Preview-Image");
    expect(previewCard).toContain("renderPreviewCardHtml");
    expect(previewCard).toContain("previewCardImagePath");
    expect(previewCard).toContain("width:1200px;height:630px");
  });

  it("uses one deliberately small public RPC for dynamic cards", () => {
    expect(worker).toContain("get_rich_preview_data");
    expect(worker).toContain("dynamicPreviewRequest");
    expect(migration).toContain("create or replace function public.get_rich_preview_data");
    expect(migration).toContain("grant execute on function public.get_rich_preview_data(text, text) to anon, authenticated");
    expect(migration).toContain("revoke all on private.rich_preview_major_ranking_updates from public, anon, authenticated");
    expect(worker).not.toContain("localStorage");
    expect(worker).not.toContain("sessionStorage");
  });

  it("covers the complete approved rollout without a second resolver", () => {
    for (const marker of [
      '"challenge"',
      '"game-result"',
      '"picks-recap"',
      '"major-ranking-update"',
    ]) {
      expect(previewModel).toContain(marker);
    }
    expect(architecture).toContain("Fighter profiles");
    expect(architecture).toContain("Fighter comparisons");
    expect(architecture).toContain("Picks recaps");
    expect(architecture).toContain("Challenge invitations");
    expect(architecture).toContain("Completed matchup results");
    expect(architecture).toContain("Major ranking updates");
  });

  it("requires exact live crawler and PNG proof after production deployment", () => {
    expect(liveWorkflow).toContain("Deploy Cloudflare Frontend");
    expect(liveWorkflow).toContain("Verify live rich preview cards");
    expect(liveWorkflow).toContain("workflow_run.head_sha");
    expect(liveVerifier).toContain("x-octagon-preview");
    expect(liveVerifier).toContain("share-preview");
    expect(liveVerifier).toContain("image/png");
    expect(liveVerifier).toContain("readUInt32BE(16)");
    expect(liveVerifier).toContain("readUInt32BE(20)");
  });

  it("normalizes legacy ranking copy and accented career spelling", () => {
    const previewSources = `${previewModel}\n${previewCard}\n${architecture}`;
    const legacyLabel = ["G", "O", "A", "T"].join("");
    expect(previewSources).toContain("resume");
    expect(previewSources).not.toMatch(/r[éÉ]sum[éÉ]/);
    expect(previewSources.toUpperCase()).not.toContain(`UFC ${legacyLabel}`);
  });
});
