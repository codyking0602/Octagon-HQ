import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200011_whats_new_rankings_sync.sql",
  "utf8",
);
const repairMigration = readFileSync(
  "supabase/migrations/202608200027_repair_whats_new_watchlist_sync.sql",
  "utf8",
);
const previewMigration = readFileSync(
  "supabase/migrations/202608200028_dynamic_rich_preview_data.sql",
  "utf8",
);
const trimRepairMigration = readFileSync(
  "supabase/migrations/202608200029_fix_ranking_whats_new_trim.sql",
  "utf8",
);
const gableBackfillMigration = readFileSync(
  "supabase/migrations/202608200030_backfill_gable_whats_new.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/whats_new_rankings_sync.sql",
  "utf8",
);
const repairIntegrationSql = readFileSync(
  "supabase/tests/whats_new_watchlist_sync_repair.sql",
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
    expect(repairMigration).toContain("create table if not exists private.fighters_to_watch_whats_new_seen");
    expect(repairMigration).toContain("alter table private.fighters_to_watch_whats_new_seen enable row level security");
    expect(repairMigration).toContain("revoke all on private.fighters_to_watch_whats_new_seen from public, anon, authenticated");
    expect(previewMigration).toContain("create table if not exists private.rich_preview_major_ranking_updates");
    expect(previewMigration).toContain("revoke all on private.rich_preview_major_ranking_updates from public, anon, authenticated");
    expect(previewMigration).toContain("if auth.role() <> 'service_role'");
    expect(previewMigration).toContain("to service_role");
  });

  it("repairs contract-v3 trim resolution without changing sync ownership", () => {
    expect(trimRepairMigration).toContain("create or replace function public.sync_ranking_whats_new(");
    expect(trimRepairMigration).toContain("security definer");
    expect(trimRepairMigration).toContain("set search_path = ''");
    expect(trimRepairMigration).toContain("lower(pg_catalog.btrim(p_source_sha))");
    expect(trimRepairMigration).toContain("lower(pg_catalog.btrim(row_data.slug))");
    expect(trimRepairMigration).toContain("pg_catalog.btrim(row_data.name)");
    expect(trimRepairMigration).toContain("lower(pg_catalog.btrim(row_data.board))");
    expect(trimRepairMigration).not.toContain("pg_catalog.trim(");
    expect(trimRepairMigration).toContain("private.sync_ranking_whats_new_v2_core(");
    expect(trimRepairMigration).toContain("p_watchlist_rows");
    expect(trimRepairMigration).toContain("'sync_contract_version', 3");
    expect(trimRepairMigration).not.toContain("set schema private");
    expect(trimRepairMigration).not.toContain("rename to sync_ranking_whats_new_v2_core");
    expect(trimRepairMigration).toContain("from public, anon, authenticated;");
    expect(trimRepairMigration).toContain("grant execute on function public.sync_ranking_whats_new(text, jsonb, jsonb)");
    expect(trimRepairMigration).toContain("to service_role;");
  });

  it("uses the existing publisher for approved meaningful updates", () => {
    expect(migration).toContain("perform public.publish_whats_new_item");
    expect(migration).toContain("'new_fighter'");
    expect(migration).toContain("'ranking_movement'");
    expect(migration).toContain("'major_ranking_update'");
    expect(repairMigration).toContain("perform public.publish_whats_new_item");
    expect(repairMigration).toContain("'fighters_to_watch'");
    expect(repairMigration).toContain("'fighters-to-watch:new:' || v_row.watch_id");
    expect(migration).toContain("abs(prior.ranking_position - row_data.rank) >= 3");
    expect(migration).toContain("if v_meaningful_movements >= 5 then");
    expect(migration).toContain("'/fighters/' || v_row.fighter_slug");
    expect(repairMigration).toContain("'/fighters-to-watch'");
    expect(previewMigration).toContain("private.sync_ranking_whats_new_v2_core");
    expect(previewMigration).toContain("'/rankings?update=' || v_source_sha");
    expect(repairMigration).not.toContain("insert into private.whats_new_items");
  });

  it("keeps durable watchlist history and preview evidence separate", () => {
    expect(repairMigration).toContain("set schema private");
    expect(repairMigration).toContain("rename to sync_ranking_whats_new_core");
    expect(repairMigration).toContain("delete from private.fighters_to_watch_whats_new_snapshot");
    expect(repairMigration).toContain("left join private.fighters_to_watch_whats_new_seen seen");
    expect(repairMigration).toContain("on conflict (watch_id) do update");
    expect(repairMigration).toContain("'sync_contract_version', 2");
    expect(previewMigration).toContain("rename to sync_ranking_whats_new_v2_core");
    expect(previewMigration).toContain("'sync_contract_version', 3");
    expect(previewMigration).toContain("'rich_preview_movement_count'");
    expect(repairMigration).toContain("'watchlist_baseline_created', false");
    expect(repairMigration).toContain("'fatima-kline'");
    expect(repairMigration).toContain("'abdul-rakhman-yakhyaev'");
    expect(repairMigration).toContain("'daniil-donchenko'");
    expect(repairMigration).not.toMatch(/values[\s\S]*'gable-steveson'[\s\S]*on conflict \(watch_id\) do nothing/);
    expect(script).toContain("const requiredContractVersion = 3");
    expect(script).toContain("candidate.sync_contract_version === requiredContractVersion");
    expect(script).toContain("is not deployed yet; retrying");
    expect(script).toContain('vite.ssrLoadModule("/src/features/rankings/rankingModel.ts")');
    expect(script).toContain('vite.ssrLoadModule("/src/features/home/shanesWatchlist.ts")');
    expect(script).toContain("rankingModel.allTime.map");
    expect(script).toContain("watchlistModel.shanesWatchlist.fighters.map");
    expect(script).toContain("p_watchlist_rows: watchlistRows");
    expect(script).not.toContain("localStorage");
    expect(script).not.toContain("window.");
  });

  it("guarantees the missed Gable announcement through one idempotent backend repair", () => {
    expect(gableBackfillMigration).toContain("'fighters-to-watch:new:gable-steveson'");
    expect(gableBackfillMigration).toContain("'Gable Steveson added to Fighters to Watch'");
    expect(gableBackfillMigration).toContain("'/fighters-to-watch'");
    expect(gableBackfillMigration).toContain("on conflict (source_key) do update");
    expect(gableBackfillMigration).toContain("published_at = excluded.published_at");
    expect(gableBackfillMigration).toContain("insert into private.fighters_to_watch_whats_new_seen");
    expect(gableBackfillMigration).toContain("'fba223d1e485a64debaf3d873d45a14f45f68ad6'");
    expect(gableBackfillMigration).toContain("source_key <> 'fighters-to-watch:new:gable-steveson'");
  });

  it("reconciles the exact live deployment immediately and after missed callbacks", () => {
    expect(syncWorkflow).toContain("workflow_run:");
    expect(syncWorkflow).toContain("Deploy Cloudflare Frontend");
    expect(syncWorkflow).toContain("workflow_dispatch:");
    expect(syncWorkflow).toContain('cron: "17 * * * *"');
    expect(syncWorkflow).toContain("github.event_name != 'workflow_run'");
    expect(syncWorkflow).toContain("/deployment.json?reconcile=${Date.now()}");
    expect(syncWorkflow).toContain("compareCommitsWithBasehead");
    expect(syncWorkflow).toContain("`${liveSha}...${mainSha}`");
    expect(syncWorkflow).toContain('comparison.status === "ahead" || comparison.status === "identical"');
    expect(syncWorkflow).toContain("comparison.merge_base_commit.sha.toLowerCase() !== liveSha");
    expect(syncWorkflow).toContain("reconciling actual live source");
    expect(syncWorkflow).toContain('ref: ${{ steps.guard.outputs.source_sha }}');
    expect(syncWorkflow).toContain("persist-credentials: false");
    expect(syncWorkflow).toContain("deployment.json?expected=${SOURCE_SHA}");
    expect(syncWorkflow).toContain("marker.sha !== expectedSha");
    expect(syncWorkflow).toContain('SOURCE_SHA="$SOURCE_SHA"');
    expect(syncWorkflow).toContain("RANKING_SYNC_MAX_ATTEMPTS: 20");
    expect(syncWorkflow).toContain('echo "::add-mask::$service_role_key"');
    expect(script).toContain("for (let attempt = 1; attempt <= maxAttempts; attempt += 1)");
    expect(script).toContain('error.code === "PGRST202"');
    expect(syncWorkflow).not.toContain("main.commit.sha === sourceSha");
  });

  it("locks thresholds, aggregation, watchlist deep links, and no-noise behavior", () => {
    expect(contract).toContain("historical rollout baseline is stored as durable seen-ID evidence");
    expect(contract).toContain("A delayed or skipped deployment cannot silently absorb a new watchlist ID");
    expect(contract).toContain("A one-time backend repair guarantees the missed Gable Steveson item exists");
    expect(contract).toContain("The actual live deployment is reconciled hourly");
    expect(contract).toContain("moving at least three positions");
    expect(contract).toContain("One- and two-position moves are intentionally ignored");
    expect(contract).toContain("five or more fighters move at least three spots");
    expect(contract).toContain("stable source key based on the watchlist ID");
    expect(contract).toContain("PR-head deployments never publish production updates");
    expect(contract).toContain("comparison evidence only");
    expect(watchlistCard).toContain('id="shanes-watchlist"');
  });

  it("keeps rollback proof for meaningful producers, delayed sync, idempotency, and privacy", () => {
    expect(integrationSql).toContain("initial Rankings and Fighters sync did not create quiet baselines");
    expect(integrationSql).toContain("new ranked fighter update was not published correctly");
    expect(integrationSql).toContain("one- or two-position ranking movement created feed noise");
    expect(integrationSql).toContain("new Fighters to Watch update was not published correctly");
    expect(integrationSql).toContain("major Rankings shakeup was not consolidated correctly");
    expect(integrationSql).toContain("idempotent Rankings and Fighters sync created duplicate items");
    expect(repairIntegrationSql).toContain("Gable backfill did not publish exactly one Fighters to Watch item");
    expect(repairIntegrationSql).toContain("delayed watchlist sync swallowed a new fighter already present in the snapshot");
    expect(repairIntegrationSql).toContain("idempotent repaired watchlist sync created duplicate items");
    expect(repairIntegrationSql).toContain("authenticated role can execute the repaired Rankings and Fighters What''s New sync");
    expect(repairIntegrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
