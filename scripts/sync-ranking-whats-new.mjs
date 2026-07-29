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
  const rankingModel = await vite.ssrLoadModule("/src/features/rankings/rankingModel.ts");
  const rows = rankingModel.allTime.map((fighter) => ({
    slug: fighter.slug,
    name: fighter.name,
    board: fighter.board,
    rank: fighter.rank,
  }));

  if (!rows.length || new Set(rows.map((row) => row.slug)).size !== rows.length) {
    throw new Error("The canonical ranking model did not produce one unique row per fighter.");
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.rpc("sync_ranking_whats_new", {
    p_source_sha: sourceSha,
    p_rows: rows,
  });

  if (error) throw new Error(`Ranking What's New sync failed: ${error.message}`);

  const result = data && typeof data === "object" ? data : {};
  console.log([
    "Ranking What's New sync complete.",
    `Fighters: ${result.fighter_count ?? rows.length}.`,
    `Baseline created: ${result.baseline_created === true ? "yes" : "no"}.`,
    `New fighters published: ${result.new_fighters_published ?? 0}.`,
    `Ranking movements published: ${result.ranking_movements_published ?? 0}.`,
  ].join(" "));
} finally {
  await vite.close();
}
