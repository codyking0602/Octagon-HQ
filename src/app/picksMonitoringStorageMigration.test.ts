import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608070001_pick_monitoring_storage.sql",
  "utf8",
);

const scoring = readFileSync(
  "supabase/migrations/202608020001_picks_v2_scoring.sql",
  "utf8",
);

describe("Phase 1 monitoring storage", () => {
  it("creates one private ledger for runs, findings, and odds snapshots", () => {
    expect(migration).toContain("create table if not exists public.pick_monitoring_runs");
    expect(migration).toContain("create table if not exists public.pick_monitoring_findings");
    expect(migration).toContain("create table if not exists public.pick_monitoring_odds_snapshots");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain(
      "revoke all on table public.pick_monitoring_runs, public.pick_monitoring_findings",
    );
    expect(migration).not.toContain("grant select on public.pick_monitoring");
  });

  it("keeps recording service-owned and atomic", () => {
    expect(migration).toContain("create or replace function public.record_pick_monitoring_run(p_payload jsonb)");
    expect(migration).toContain("service role required to record pick monitoring evidence");
    expect(migration).toContain("grant execute on function public.record_pick_monitoring_run(jsonb) to service_role");
    expect(migration).not.toContain("grant execute on function public.record_pick_monitoring_run(jsonb) to authenticated");
    expect(migration).toContain("insert into public.pick_monitoring_runs");
    expect(migration).toContain("insert into public.pick_monitoring_findings");
    expect(migration).toContain("insert into public.pick_monitoring_odds_snapshots");
  });

  it("stores reviewable findings without weakening immutable evidence", () => {
    expect(migration).toContain("review_status text not null default 'new'");
    expect(migration).toContain("review_status in ('new','reviewed','dismissed')");
    expect(migration).toContain("pick monitoring evidence is append-only");
    expect(migration).toContain("pick monitoring finding evidence is immutable");
    expect(migration).toContain("to_jsonb(new) - 'review_status' - 'reviewed_at' - 'reviewed_by'");
  });

  it("captures the canonical lock and marks only strictly pre-lock snapshots eligible", () => {
    expect(migration).toContain("select event.locks_at into v_observed_locks_at");
    expect(migration).toContain("monitoring lock snapshot does not match canonical event");
    expect(migration).toContain("eligible_before_lock boolean generated always as");
    expect(migration).toContain("fetched_at < observed_locks_at");
    expect(migration).not.toContain("fetched_at <= observed_locks_at");
    expect(scoring).toContain("create or replace function public.prevent_locked_pick_bout_odds_changes");
    expect(scoring).toContain("now() >= v_event.locks_at");
  });

  it("does not mutate cards, live odds, picks, locks, publication, or scoring", () => {
    expect(migration).not.toContain("update public.pick_bouts");
    expect(migration).not.toContain("update public.pick_events");
    expect(migration).not.toContain("update public.profile_event_picks");
    expect(migration).not.toContain("publish_pick_event_draft");
    expect(migration).not.toContain("transition_pick_event");
    expect(migration).not.toContain("set_my_event_underdog_lock");
    expect(migration).not.toContain("pg_cron");
  });
});
