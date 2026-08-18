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
  "Fight by Fight",
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
];

function isSafeRelativeAssetPath(value) {
  return typeof value === "string"
    && value.length > 0
    && value.startsWith("/")
    && !value.startsWith("//")
    && !value.includes("..")
    && !value.includes("\\")
    && !/^\/[a-z][a-z0-9+.-]*:/i.test(value);
}

export async function verifyProductionArtifact({ dist = "dist", env = process.env } = {}) {
  const files = await walk(dist);
  const indexPath = join(dist, "index.html");
  const workerPath = join(dist, "_worker.js");
  const headersPath = join(dist, "_headers");
  const assetIgnorePath = join(dist, ".assetsignore");
  const previewCatalogPath = join(dist, "preview-data", "rankings.json");
  const previewGamesPath = join(dist, "preview-data", "games.json");
  const previewArtworkPath = join(dist, "preview-data", "artwork");

  for (const required of [indexPath, workerPath, headersPath, assetIgnorePath, previewCatalogPath, previewGamesPath]) {
    if (!files.includes(required)) throw new Error(`Production artifact is missing required file: ${required}.`);
  }

  const assetIgnore = await readFile(assetIgnorePath, "utf8");
  if (!assetIgnore.split(/\r?\n/).includes("_worker.js")) {
    throw new Error("The production asset manifest must exclude _worker.js from static asset serving.");
  }

  const headers = await readFile(headersPath, "utf8");
  if (!headers.includes("Cache-Control: no-cache")) {
    throw new Error("The production SPA shell must be delivered with Cache-Control: no-cache.");
  }

  const config = validatePublicSupabaseConfig({
    url: env.VITE_SUPABASE_URL,
    publishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
    expectedHostname: env.VITE_EXPECTED_SUPABASE_HOSTNAME,
  });

  const previewCatalog = JSON.parse(await readFile(previewCatalogPath, "utf8"));
  const previewGames = JSON.parse(await readFile(previewGamesPath, "utf8"));
  if (!Array.isArray(previewCatalog.fighters) || !Array.isArray(previewGames.games)) {
    throw new Error("The production preview data is malformed.");
  }

  const previewFighterSlugs = new Set(previewCatalog.fighters.map((fighter) => fighter.slug));
  for (const fighter of previewCatalog.fighters) {
    if (!fighter.slug || !fighter.displayName || !fighter.imagePath || !Number.isFinite(fighter.rank) || !Number.isFinite(fighter.ovr)) {
      throw new Error("The rich preview catalog contains an incomplete fighter.");
    }
  }

  const previewCatalogGames = Array.isArray(previewCatalog.games) ? previewCatalog.games : [];
  const previewGamesById = new Map(previewGames.games.map((game) => [game.id, game]));
  const allPreviewGames = previewCatalogGames.length ? previewCatalogGames : previewGames.games;
  if (!Array.isArray(allPreviewGames)) {
    throw new Error("The complete rich preview catalog is missing or invalid.");
  }

  const gameIds = new Set();
  for (const game of allPreviewGames) {
    if (!game.id || !game.title || !game.description || !game.imagePath) {
      throw new Error("The rich preview catalog contains an incomplete game.");
    }
    if (gameIds.has(game.id)) throw new Error(`The rich preview catalog contains duplicate game ${game.id}.`);
    gameIds.add(game.id);

    const source = previewGamesById.get(game.id) ?? game;
    if (!source || !isSafeRelativeAssetPath(source.imagePath)) {
      throw new Error(`The rich preview catalog contains an unsafe game image path for ${game.id}.`);
    }
    const artworkPath = join(dist, String(source.imagePath).replace(/^\/+/, ""));
    if (!files.includes(artworkPath)) {
      throw new Error(`The rich preview catalog references missing game artwork: ${artworkPath}.`);
    }
  }

  for (const artwork of requiredShareArtwork) {
    if (!files.includes(join(previewArtworkPath, artwork))) {
      throw new Error(`Production artifact is missing required share artwork: ${artwork}.`);
    }
  }

  if (
    previewFighterSlugs.size !== previewCatalog.fighters.length
    || previewCatalog.fighters.length === 0
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

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = await verifyProductionArtifact();
    console.log(`Verified production artifact: ${result.files} compiled files, ${result.previewFighters} fighters, ${result.previewGames} games, Supabase host ${result.hostname}.`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
