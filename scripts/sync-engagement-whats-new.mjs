#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const sourceSha = process.env.SOURCE_SHA?.trim().toLowerCase();
const maxAttempts = Math.min(20, Math.max(1, Number(process.env.ENGAGEMENT_SYNC_MAX_ATTEMPTS ?? 1)));
const retryDelayMs = Math.min(30_000, Math.max(1_000, Number(process.env.ENGAGEMENT_SYNC_RETRY_DELAY_MS ?? 15_000)));

if (!supabaseUrl || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(supabaseUrl)) {
  throw new Error("A valid production SUPABASE_URL is required.");
}
if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required.");
}
if (!sourceSha || !/^[0-9a-f]{40}$/.test(sourceSha)) {
  throw new Error("SOURCE_SHA must be the exact 40-character deployment SHA.");
}
if (!Number.isInteger(maxAttempts) || !Number.isInteger(retryDelayMs)) {
  throw new Error("Engagement synchronization retry settings must be integers.");
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const vite = await createServer({
  root,
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const [registryModule, catalogModule] = await Promise.all([
    vite.ssrLoadModule("/src/features/play/playRegistry.ts"),
    vite.ssrLoadModule("/src/features/play/engagementUpdateCatalog.ts"),
  ]);

  const games = registryModule.playGames.map((game) => ({
    id: game.id,
    title: game.title,
    summary: game.description,
    route: `/play/${game.id}`,
  }));
  const challenges = catalogModule.challengeUpdates.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    route: item.route,
    action_label: item.actionLabel,
  }));
  const achievements = catalogModule.achievementUpdates.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    route: item.route,
    action_label: item.actionLabel,
  }));

  if (!games.length || new Set(games.map((game) => game.id)).size !== games.length) {
    throw new Error("The canonical Play registry did not produce one unique row per game.");
  }
  if (new Set(challenges.map((item) => item.id)).size !== challenges.length) {
    throw new Error("The challenge update catalog contains duplicate IDs.");
  }
  if (new Set(achievements.map((item) => item.id)).size !== achievements.length) {
    throw new Error("The achievement update catalog contains duplicate IDs.");
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let result = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const { data, error } = await client.rpc("sync_engagement_whats_new", {
      p_source_sha: sourceSha,
      p_games: games,
      p_challenges: challenges,
      p_achievements: achievements,
    });

    if (!error) {
      result = data && typeof data === "object" ? data : {};
      break;
    }

    const migrationStillDeploying = error.code === "PGRST202"
      || /sync_engagement_whats_new/i.test(error.message ?? "");
    if (!migrationStillDeploying || attempt === maxAttempts) {
      throw new Error(`Games, challenges, and achievements What's New sync failed: ${error.message}`);
    }

    console.log(`Engagement sync RPC is not available yet; retrying (${attempt}/${maxAttempts}).`);
    await wait(retryDelayMs);
  }

  if (!result) throw new Error("Engagement What's New sync returned no result.");

  console.log([
    "Games, challenges, and achievements What's New sync complete.",
    `Games: ${result.game_count ?? games.length}.`,
    `Challenges: ${result.challenge_count ?? challenges.length}.`,
    `Achievements: ${result.achievement_count ?? achievements.length}.`,
    `Game baseline created: ${result.game_baseline_created === true ? "yes" : "no"}.`,
    `Challenge baseline created: ${result.challenge_baseline_created === true ? "yes" : "no"}.`,
    `Achievement baseline created: ${result.achievement_baseline_created === true ? "yes" : "no"}.`,
    `New games published: ${result.new_games_published ?? 0}.`,
    `New challenges published: ${result.new_challenges_published ?? 0}.`,
    `New achievements published: ${result.new_achievements_published ?? 0}.`,
  ].join(" "));
} finally {
  await vite.close();
}
