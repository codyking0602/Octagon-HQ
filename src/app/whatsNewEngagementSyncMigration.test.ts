import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200012_whats_new_engagement_sync.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/whats_new_engagement_sync.sql",
  "utf8",
);
const script = readFileSync("scripts/sync-engagement-whats-new.mjs", "utf8");
const workflow = readFileSync(
  ".github/workflows/sync-whats-new-rankings.yml",
  "utf8",
);
const catalog = readFileSync(
  "src/features/play/engagementUpdateCatalog.ts",
  "utf8",
);
const registry = readFileSync("src/features/play/playRegistry.ts", "utf8");
const contract = readFileSync("docs/whats-new-foundation.md", "utf8");

describe("What's New games, challenges, and achievements producers", () => {
  it("keeps private comparison snapshots behind one service-only sync", () => {
    expect(migration).toContain("create table if not exists private.game_whats_new_snapshot");
    expect(migration).toContain("create table if not exists private.challenge_whats_new_snapshot");
    expect(migration).toContain("create table if not exists private.achievement_whats_new_snapshot");
    expect(migration).toContain("create table if not exists private.engagement_whats_new_sync_state");
    expect(migration).toContain("create or replace function public.sync_engagement_whats_new");
    expect(migration).toContain("if auth.role() <> 'service_role'");
    expect(migration).toContain("to service_role");
    expect(migration).not.toContain("grant select on private.game_whats_new_snapshot to authenticated");
  });

  it("uses the existing publisher for only approved new permanent entries", () => {
    expect(migration).toContain("perform public.publish_whats_new_item");
    expect(migration).toContain("'new_game'");
    expect(migration).toContain("'new_challenge'");
    expect(migration).toContain("'achievement'");
    expect(migration).toContain("'PLAY GAME'");
    expect(migration).not.toContain("insert into private.whats_new_items");
    expect(migration).not.toContain("public.play_challenges");
  });

  it("loads the canonical Play registry and explicit engagement catalog", () => {
    expect(registry).toContain("export const playGames");
    expect(script).toContain('vite.ssrLoadModule("/src/features/play/playRegistry.ts")');
    expect(script).toContain('vite.ssrLoadModule("/src/features/play/engagementUpdateCatalog.ts")');
    expect(script).toContain("registryModule.playGames.map");
    expect(script).toContain("catalogModule.challengeUpdates.map");
    expect(script).toContain("catalogModule.achievementUpdates.map");
    expect(script).toContain('client.rpc("sync_engagement_whats_new"');
    expect(catalog).toContain("Personal profile-to-profile challenge deliveries stay private");
    expect(catalog).toContain("export const challengeUpdates");
    expect(catalog).toContain("export const achievementUpdates");
    expect(script).not.toContain("localStorage");
    expect(script).not.toContain("window.");
  });

  it("shares the exact post-frontend deployment owner without adding another workflow", () => {
    expect(workflow).toContain("name: Sync Canonical What's New Models");
    expect(workflow).toContain("Deploy Cloudflare Frontend");
    expect(workflow).toContain('workflowRun.head_branch !== "main"');
    expect(workflow).toContain('workflowRun.event !== "push"');
    expect(workflow).toContain("main.commit.sha.toLowerCase()");
    expect(workflow).toContain("deployment.json?reconcile=${Date.now()}");
    expect(workflow).toContain("node scripts/sync-ranking-whats-new.mjs");
    expect(workflow).toContain("node scripts/sync-engagement-whats-new.mjs");
    expect(workflow).toContain("ENGAGEMENT_SYNC_MAX_ATTEMPTS: 20");
    expect(workflow).toContain('SOURCE_SHA="$SOURCE_SHA"');
    expect(workflow).toContain('echo "::add-mask::$service_role_key"');
    expect(script).toContain("for (let attempt = 1; attempt <= maxAttempts; attempt += 1)");
    expect(script).toContain('error.code === "PGRST202"');
  });

  it("creates quiet baselines, ignores copy edits, and documents the privacy boundary", () => {
    expect(migration).toContain("if v_has_game_baseline then");
    expect(migration).toContain("if v_has_challenge_baseline then");
    expect(migration).toContain("if v_has_achievement_baseline then");
    expect(migration).toContain("where model_key = 'challenges'");
    expect(migration).toContain("where model_key = 'achievements'");
    expect(migration).toContain("delete from private.game_whats_new_snapshot");
    expect(migration).toContain("delete from private.challenge_whats_new_snapshot");
    expect(migration).toContain("delete from private.achievement_whats_new_snapshot");
    expect(contract).toContain("first production synchronization quietly creates all three comparison baselines");
    expect(contract).toContain("Personal profile-to-profile challenge deliveries never enter the global feed");
    expect(contract).toContain("Copy edits to existing entries do not create feed noise");
    expect(contract).toContain("All approved automatic producer families are connected");
  });

  it("keeps rollback proof for publication, idempotency, empty baselines, copy-noise, and privacy", () => {
    expect(integrationSql).toContain("initial engagement sync did not create quiet baselines");
    expect(integrationSql).toContain("empty challenge and achievement baselines were not persisted");
    expect(integrationSql).toContain("new game update was not published correctly");
    expect(integrationSql).toContain("new app-level challenge update was not published correctly");
    expect(integrationSql).toContain("new meaningful achievement update was not published correctly");
    expect(integrationSql).toContain("idempotent engagement sync created duplicate items");
    expect(integrationSql).toContain("copy-only engagement edits created feed noise");
    expect(integrationSql).toContain("authenticated role can execute the engagement What''s New sync");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
