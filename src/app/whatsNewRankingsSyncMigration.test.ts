import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200011_whats_new_rankings_sync.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/whats_new_rankings_sync.sql",
  "utf8",
);
const script = readFileSync("scripts/sync-ranking-whats-new.mjs", "utf8");
const syncWorkflow = readFileSync(
  ".github/workflows/sync-whats-new-rankings.yml",
  "utf8",
);
const watchlistCard = readFileSync(
  "src/features/home/ShanesWatchlistCard.tsx",
  "utf8",
);
const contract = readFileSync("docs/whats-new-foundation.md", "utf8");

describe("What's New Rankings and fighter producers", () => {
  it("stores only private comparison snapshots behind one service-only sync", () => {
    expect(migration).toContain("create table if not exists private.ranking_whats_new_snapshot");
    expect(migration).toContain("create table if not exists private.fighters_to_watch_whats_new_snapshot");
    expect(migration).toContain("alter table private.ranking_whats_new_snapshot enable row level security");
    expect(migration).toContain("alter table private.fighters_to_watch_whats_new_snapshot enable row level security");
    expect(migration).toContain("revoke all on private.ranking_whats_new_snapshot from public, anon, authenticated");
    expect(migration).toContain("revoke all on private.fighters_to_watch_whats_new_snapshot from public, anon, authenticated");
    expect(migration).toContain("create or replace function public.sync_ranking_whats_new");
    expect(migration).toContain("if auth.role() <> 'service_role'");
    expect(migration).toContain("to service_role");
    expect(migration).not.toContain("grant select on private.ranking_whats_new_snapshot to authenticated");
  });

  it("uses the existing publisher for approved meaningful updates", () => {
    expect(migration).toContain("perform public.publish_whats_new_item");
    expect(migration).toContain("'new_fighter'");
    expect(migration).toContain("'ranking_movement'");
    expect(migration).toContain("'major_ranking_update'");
    expect(migration).toContain("'fighters_to_watch'");
    expect(migration).toContain("abs(prior.ranking_position - row_data.rank) >= 3");
    expect(migration).toContain("if v_meaningful_movements >= 5 then");
    expect(migration).toContain("'/fighters/' || v_row.fighter_slug");
    expect(migration).toContain("'/#shanes-watchlist'");
    expect(migration).not.toContain("insert into private.whats_new_items");
  });

  it("creates quiet baselines and replaces them from canonical models", () => {
    expect(migration).toContain("if v_has_ranking_baseline then");
    expect(migration).toContain("if v_has_watchlist_baseline then");
    expect(migration).toContain("'ranking_baseline_created', not v_has_ranking_baseline");
    expect(migration).toContain("'watchlist_baseline_created', not v_has_watchlist_baseline");
    expect(migration).toContain("delete from private.ranking_whats_new_snapshot");
    expect(migration).toContain("delete from private.fighters_to_watch_whats_new_snapshot");
    expect(script).toContain('vite.ssrLoadModule("/src/features/rankings/rankingModel.ts")');
    expect(script).toContain('vite.ssrLoadModule("/src/features/home/shanesWatchlist.ts")');
    expect(script).toContain("rankingModel.allTime.map");
    expect(script).toContain("watchlistModel.shanesWatchlist.fighters.map");
    expect(script).toContain("p_watchlist_rows: watchlistRows");
    expect(script).toContain('client.rpc("sync_ranking_whats_new"');
    expect(script).not.toContain("localStorage");
    expect(script).not.toContain("window.");
  });

  it("runs only after the exact current main frontend is live", () => {
    expect(syncWorkflow).toContain("workflow_run:");
    expect(syncWorkflow).toContain("Deploy Cloudflare Frontend");
    expect(syncWorkflow).toContain("github.event.workflow_run.conclusion == 'success'");
    expect(syncWorkflow).toContain('sourceBranch === "main"');
    expect(syncWorkflow).toContain('sourceEvent === "push"');
    expect(syncWorkflow).toContain("main.commit.sha === sourceSha");
    expect(syncWorkflow).toContain('ref: ${{ env.SOURCE_SHA }}');
    expect(syncWorkflow).toContain("persist-credentials: false");
    expect(syncWorkflow).toContain("deployment.json?expected=${SOURCE_SHA}");
    expect(syncWorkflow).toContain("marker.sha !== expectedSha");
    expect(syncWorkflow).toContain('SOURCE_SHA="$SOURCE_SHA"');
    expect(syncWorkflow).toContain("RANKING_SYNC_MAX_ATTEMPTS: 20");
    expect(syncWorkflow).toContain('echo "::add-mask::$service_role_key"');
    expect(script).toContain("for (let attempt = 1; attempt <= maxAttempts; attempt += 1)");
    expect(script).toContain('error.code === "PGRST202"');
  });

  it("locks thresholds, aggregation, watchlist deep link, and no-noise behavior", () => {
    expect(contract).toContain("first production synchronization quietly creates both comparison baselines");
    expect(contract).toContain("moving at least three positions");
    expect(contract).toContain("One- and two-position moves are intentionally ignored");
    expect(contract).toContain("five or more fighters move at least three spots");
    expect(contract).toContain("A watchlist ID absent from the prior production watchlist snapshot");
    expect(contract).toContain("PR-head deployments never synchronize production comparison state");
    expect(contract).toContain("comparison evidence only");
    expect(watchlistCard).toContain('id="shanes-watchlist"');
  });

  it("keeps rollback proof for all meaningful producers, idempotency, and privacy", () => {
    expect(integrationSql).toContain("initial Rankings and Fighters sync did not create quiet baselines");
    expect(integrationSql).toContain("new ranked fighter update was not published correctly");
    expect(integrationSql).toContain("one- or two-position ranking movement created feed noise");
    expect(integrationSql).toContain("new Fighters to Watch update was not published correctly");
    expect(integrationSql).toContain("major Rankings shakeup was not consolidated correctly");
    expect(integrationSql).toContain("major ranking update also published duplicate individual movement cards");
    expect(integrationSql).toContain("idempotent Rankings and Fighters sync created duplicate items");
    expect(integrationSql).toContain("authenticated role can execute the Rankings and Fighters What''s New sync");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
