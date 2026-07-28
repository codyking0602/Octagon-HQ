import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608100001_live_pick_odds_application.sql",
  "utf8",
);
const scoringMigration = readFileSync(
  "supabase/migrations/202608020001_picks_v2_scoring.sql",
  "utf8",
);
const runner = readFileSync("supabase/functions/run-pick-monitoring/index.ts", "utf8");
const storageModel = readFileSync(
  "src/features/picks-monitoring/monitoringStorageModel.ts",
  "utf8",
);

describe("automatic live Picks odds ownership", () => {
  it("adds one service-role boundary over the existing evidence writer", () => {
    expect(migration).toContain(
      "create or replace function public.record_pick_monitoring_run_and_apply_odds(p_payload jsonb)",
    );
    expect(migration).toContain("v_run_id := public.record_pick_monitoring_run(p_payload)");
    expect(migration).toContain(
      "grant execute on function public.record_pick_monitoring_run_and_apply_odds(jsonb)\n  to service_role",
    );
    expect(migration).toContain("service role required to record and apply pick monitoring odds");
    expect(runner).toContain('admin.rpc("record_pick_monitoring_run_and_apply_odds"');
    expect(runner).toContain('admin.rpc("record_scheduled_pick_monitoring_run"');
  });

  it("keeps scheduled evidence, odds, and cadence completion atomic", () => {
    expect(migration).toContain(
      "v_run_id := public.record_pick_monitoring_run_and_apply_odds(p_payload)",
    );
    expect(migration).toContain("update public.pick_monitoring_schedule_state");
    expect(migration).toContain("scheduled pick monitoring claim is missing or stale");
    expect(migration).not.toContain("perform public.record_pick_monitoring_run_and_apply_odds");
  });

  it("requires an exact recorded provider snapshot and canonical corner orientation", () => {
    expect(storageModel).toContain("canonical_red_fighter_slug");
    expect(storageModel).toContain("canonical_blue_fighter_slug");
    expect(storageModel).toContain("canonical_red_american_odds");
    expect(storageModel).toContain("canonical_blue_american_odds");
    expect(migration).toContain("from public.pick_monitoring_odds_snapshots snapshot");
    expect(migration).toContain("snapshot.run_id = v_run_id");
    expect(migration).toContain("snapshot.source_event_id = v_source_event_id");
    expect(migration).toContain("snapshot.commence_time = v_commence_time");
    expect(migration).toContain("v_bout.red_fighter_slug is distinct from v_red_slug");
    expect(migration).toContain("v_bout.blue_fighter_slug is distinct from v_blue_slug");
    expect(migration).toContain(
      "abs(extract(epoch from (v_commence_time - v_event.starts_at))) > 64800",
    );
  });

  it("preserves the last valid line on lock, stale data, conflicts, and identical replays", () => {
    expect(migration).toContain("v_event.status <> 'upcoming' or now() >= v_event.locks_at");
    expect(migration).toContain("v_fetched_at >= v_event.locks_at");
    expect(migration).toContain("v_sportsbook_updated_at < v_bout.odds_updated_at");
    expect(migration).toContain("v_sportsbook_updated_at = v_bout.odds_updated_at");
    expect(migration).toContain("red_american_odds is distinct from v_red_odds");
    expect(migration).toContain("blue_american_odds is distinct from v_blue_odds");
  });

  it("updates only the existing odds-owned canonical fields", () => {
    expect(migration).toContain("update public.pick_bouts");
    expect(migration).toContain("set red_american_odds = v_red_odds");
    expect(migration).toContain("blue_american_odds = v_blue_odds");
    expect(migration).toContain("odds_source = v_sportsbook_title");
    expect(migration).toContain("odds_updated_at = v_sportsbook_updated_at");
    expect(migration).not.toContain("update public.pick_events\n");
    expect(migration).not.toContain("update public.profile_event_picks");
    expect(migration).not.toContain("update public.profile_event_underdog_locks");
    expect(migration).not.toContain("insert into public.pick_bouts");
    expect(migration).not.toContain("delete from public.pick_bouts");
  });

  it("preserves the existing lock-time freeze and scoring owners", () => {
    expect(scoringMigration).toContain("create or replace function public.prevent_locked_pick_bout_odds_changes()");
    expect(scoringMigration).toContain("create or replace function public.freeze_pick_event_underdog_odds()");
    expect(scoringMigration).toContain("lock.frozen_american_odds");
    expect(scoringMigration).toContain("public.pick_underdog_bonus(frozen_american_odds)");
    expect(migration).not.toContain("create or replace function public.pick_underdog_bonus");
    expect(migration).not.toContain("create or replace function public.freeze_pick_event_underdog_odds");
  });

  it("keeps one player projection and exposes sportsbook provenance", () => {
    expect(migration).toContain("create or replace function public.get_current_pick_event()");
    expect(migration).toContain("'odds_source',bout.odds_source");
    expect(migration).toContain("'odds_updated_at',bout.odds_updated_at");
    expect(migration).not.toContain("create or replace function public.get_live_pick_odds");
  });
});
