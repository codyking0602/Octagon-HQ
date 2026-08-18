import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import {
  forbiddenBrowserCredentialPatterns,
  isPublicSupabaseKey,
  validatePublicSupabaseConfig,
} from "./public-supabase-config.mjs";

export const requiredApplicationMarkers = [
  "STANDINGS & EVENTS",
  "GROUP STANDINGS",
  "EVENT ARCHIVE",
  "OPEN FULL RECAP",
  "Event Standings",
  "get_my_pick_history",
  "SCORING & UNDERDOG LOCK RULES",
  "Correct pick +4",
  "LOCK FOR ",
  "MAIN EVENT SPOTLIGHT",
  "WATCH SPOTLIGHT",
  "pick-fighter-thumbnail",
  "get_my_event_underdog_lock",
  "set_my_event_underdog_lock",
  "PICKS LOCKED",
  "AWAITING RESULTS",
  "NOT PICKED",
  "VIEW FIGHT-BY-FIGHT RESULTS",
  "+400+",
  "HOW EVERYONE PICKED",
  "group_picks",
  "Fight Night Control",
  "MASTER LOCK",
  "+10 MIN",
  "+20 MIN",
  "SET TIME",
  "DEADLINE FINAL",
  "LOCK ALL PICKS",
  "COMPLETE EVENT",
  "get_pick_control_event",
  "adjust_pick_event_lock_time",
  "adjust_pick_bout_lock_time",
  "Event Setup",
  "SYNC NEXT UFC EVENT",
  "PUBLISH CARD",
  "get_pick_event_setup",
];

export const requiredShareArtwork = [
  "picks-recap.svg",
  "ranking-update.svg",
];

export const forbiddenAuctionPrivateMarkers = [
  "generation_weight",
  "private_generation_class",
  "private_item_reference",
  "pending_bid",
  "future_deck",
  "category_intent",
  "rarity_weight",
  "rarity_band",
  "rarity_class",
  "grading_inputs",
  "grading_formula",
  "grading_weights",
  "intermediate_score",
  "category_grade",
  "item_grade",
  "winner_explanation",
  "best_purchase",
  "overpay",
  "missed_opportunity",
  "random_seed",
  "Anderson Silva vs Forrest Griffin — UFC 101",
];

export async function verifyProductionArtifact({ dist = "dist", env = process.env } = {}) {
  const config = validatePublicSupabaseConfig({
    url: env.VITE_SUPABASE_URL,
    publishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
    expectedHostname: env.VITE_EXPECTED_SUPABASE_HOSTNAME,
  });
  const files = await walk(dist);
  if (!files.some((file) => file.endsWith("index.html"))) throw new Error("dist/index.html is missing.");

  const workerPath = join(dist, "_worker.js");
  const assetsIgnorePath = join(dist, ".assetsignore");
  const previewCatalogPath = join(dist, "preview-data", "rankings.json");
  for (const requiredPath of [workerPath, assetsIgnorePath, previewCatalogPath]) {
    if (!files.includes(requiredPath)) throw new Error(`${requiredPath} is missing.`);
  }

  for (const artwork of requiredShareArtwork) {
    const artworkPath = join(dist, "assets", "share", artwork);
    if (!files.includes(artworkPath)) throw new Error(`${artworkPath} is missing.`);
  }

  const worker = await readFile(workerPath, "utf8");
  for (const marker of [
    "X-Octagon-Preview",
    "X-Octagon-Preview-Image",
    "og:title",
    "og:image:width",
    "twitter:card",
    "share-preview",
    "image/png",
    "get_rich_preview_data",
    "picks-recap",
    "major-ranking-update",
    "auction-result",
    "jon-jones",
  ]) {
    if (!worker.includes(marker)) throw new Error(`Compiled rich preview Worker is missing marker: ${marker}.`);
  }

  const assetsIgnore = await readFile(assetsIgnorePath, "utf8");
  if (!assetsIgnore.split(/\r?\n/).includes("_worker.js")) {
    throw new Error("dist/.assetsignore must exclude _worker.js from public static assets.");
  }

  const previewCatalog = JSON.parse(await readFile(previewCatalogPath, "utf8"));
  if (
    previewCatalog.version !== 2
    || !Array.isArray(previewCatalog.fighters)
    || previewCatalog.fighters.length < 1
    || !Array.isArray(previewCatalog.games)
    || previewCatalog.games.length < 1
    || !previewCatalog.fighterAssets
    || typeof previewCatalog.fighterAssets !== "object"
  ) {
    throw new Error("The complete rich preview catalog is missing or invalid.");
  }
  for (const fighter of previewCatalog.fighters) {
    if (!fighter.slug || !fighter.displayName || !fighter.imagePath || !Number.isFinite(fighter.rank) || !Number.isFinite(fighter.ovr)) {
      throw new Error("The rich preview catalog contains an incomplete fighter.");
    }
  }

  const gameIds = new Set();
  for (const game of previewCatalog.games) {
    if (!game.id || !game.title || !game.description || !game.imagePath) {
      throw new Error("The rich preview catalog contains an incomplete game.");
    }
    if (gameIds.has(game.id)) throw new Error(`The rich preview catalog contains duplicate game ${game.id}.`);
    gameIds.add(game.id);

    const artworkPath = join(dist, String(game.imagePath).replace(/^\/+/, ""));
    if (!files.includes(artworkPath)) {
      throw new Error(`The rich preview catalog references missing game artwork: ${artworkPath}.`);
    }
  }

  const compiledFiles = files.filter((file) => file.endsWith(".html") || file.endsWith(".js"));
  const contents = await Promise.all(compiledFiles.map((file) => readFile(file, "utf8")));
  const artifact = contents.join("\n");

  for (const placeholder of ["your-project-id", "your-publishable-key"]) {
    if (artifact.includes(placeholder)) throw new Error(`Compiled artifact contains forbidden placeholder ${placeholder}.`);
  }
  if (!artifact.includes(config.expectedHostname)) {
    throw new Error(`Compiled artifact does not contain expected hostname ${config.expectedHostname}.`);
  }
  if (!artifact.includes(config.publishableKey) || !isPublicSupabaseKey(config.publishableKey)) {
    throw new Error("Compiled artifact does not contain the validated public Supabase key.");
  }
  for (const pattern of forbiddenBrowserCredentialPatterns) {
    if (pattern.test(artifact)) throw new Error(`Compiled artifact contains an administrative credential pattern: ${pattern}.`);
  }
  for (const marker of forbiddenAuctionPrivateMarkers) {
    if (artifact.includes(marker)) throw new Error(`Compiled artifact contains private Auction marker: ${marker}.`);
  }
  for (const marker of requiredApplicationMarkers) {
    if (!artifact.includes(marker)) throw new Error(`Compiled artifact is missing required application marker: ${marker}.`);
  }

  return {
    files: compiledFiles.length,
    hostname: config.expectedHostname,
    previewFighters: previewCatalog.fighters.length,
    previewGames: previewCatalog.games.length,
  };
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }))).flat();
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = await verifyProductionArtifact();
  console.log(
    `Verified ${result.files} compiled files for ${result.hostname}, including ${result.previewFighters} fighter and ${result.previewGames} game previews.`,
  );
}
