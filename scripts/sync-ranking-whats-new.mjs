#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const sourceSha = process.env.SOURCE_SHA?.trim().toLowerCase();

if (!supabaseUrl || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(supabaseUrl)) {
  throw new Error("A valid production SUPABASE_URL is required.");
}
if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required.");
}
if (!sourceSha || !/^[0-9a-f]{40}$/.test(sourceSha)) {
  throw new Error("SOURCE_SHA must be the exact 40-character deployment SHA.");
}

const vite = await createServer({
  root,
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const [rankingModel, watchlistModel] = await Promise.all([
    vite.ssrLoadModule("/src/features/rankings/rankingModel.ts"),
    vite.ssrLoadModule("/src/features/home/shanesWatchlist.ts"),
  ]);

  const rows = rankingModel.allTime.map((fighter) => ({
    slug: fighter.slug,
    name: fighter.name,
    board: fighter.board,
    rank: fighter.rank,
  }));
  const watchlistRows = watchlistModel.shanesWatchlist.fighters.map((fighter) => ({
    id: fighter.id,
    name: fighter.name,
    note: fighter.scoutingNote,
  }));

  if (!rows.length || new Set(rows.map((row) => row.slug)).size !== rows.length) {
    throw new Error("The canonical ranking model did not produce one unique row per fighter.");
  }
  if (new Set(watchlistRows.map((row) => row.id)).size !== watchlistRows.length) {
    throw new Error("Fighters to Watch did not produce one unique row per fighter.");
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.rpc("sync_ranking_whats_new", {
    p_source_sha: sourceSha,
    p_rows: rows,
    p_watchlist_rows: watchlistRows,
  });

  if (error) throw new Error(`Rankings and Fighters What's New sync failed: ${error.message}`);

  const result = data && typeof data === "object" ? data : {};
  console.log([
    "Rankings and Fighters What's New sync complete.",
    `Ranked fighters: ${result.fighter_count ?? rows.length}.`,
    `Watchlist fighters: ${result.watchlist_count ?? watchlistRows.length}.`,
    `Ranking baseline created: ${result.ranking_baseline_created === true ? "yes" : "no"}.`,
    `Watchlist baseline created: ${result.watchlist_baseline_created === true ? "yes" : "no"}.`,
    `New fighters published: ${result.new_fighters_published ?? 0}.`,
    `Meaningful movements detected: ${result.meaningful_movements_detected ?? 0}.`,
    `Movement items published: ${result.ranking_movements_published ?? 0}.`,
    `Major ranking updates published: ${result.major_ranking_updates_published ?? 0}.`,
    `Fighters to Watch published: ${result.fighters_to_watch_published ?? 0}.`,
  ].join(" "));
} finally {
  await vite.close();
}
