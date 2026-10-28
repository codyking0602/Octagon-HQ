import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/202608020001_picks_v2_scoring.sql", "utf8");
const integrationSql = readFileSync("supabase/tests/picks_v2_scoring.sql", "utf8");

describe("Picks V2 authoritative scoring migration", () => {
  it("uses the real lock clock as the odds mutation boundary", () => {
    expect(sql).toContain("primary key (profile_id, event_id)");
    expect(sql).toContain("prevent_locked_pick_bout_odds_changes");
    expect(sql).toContain("now() >= v_event.locks_at");
    expect(sql).toContain("odds are locked for this event");
    expect(sql).toContain("frozen_at = case");
    expect(sql).toContain("then new.locks_at");
    expect(sql).toContain("else null");
    expect(sql).toContain("underdog lock is closed");
  });

  it("preserves result lifecycle fields while adding odds", () => {
    expect(sql).toContain("'red_american_odds',bout.red_american_odds");
    expect(sql).toContain("'blue_american_odds',bout.blue_american_odds");
    expect(sql).toContain("'result_status',bout.result_status");
    expect(sql).toContain("'result_recorded_at',bout.result_recorded_at");
  });

  it("owns base, bonus, total, missing, excluded, and tied ranks in RPC projections", () => {
    expect(sql).toContain("4*count(*)");
    expect(sql).toContain("pick_underdog_bonus");
    expect(sql).toContain("'draw','no_contest','cancelled'");
    expect(sql).toContain("then 'missing'");
    expect(sql).toContain("count(*) filter(where entered)::integer events_entered");
    expect(sql).toContain("'total_points'");
    expect(sql).toContain("rank() over(partition by event_id order by base_points+lock_bonus desc,correct desc)");
  });

  it("keeps official result mutation unavailable to browser roles", () => {
    expect(sql).not.toMatch(/grant execute on function public\.record_official_pick_bout_result[^;]+authenticated/s);
    expect(sql).toContain("revoke all on table public.profile_event_underdog_locks from public, anon, authenticated");
  });

  it("keeps rollback-only integration coverage for the reviewed failure modes", () => {
    expect(integrationSql).toContain("odds changed after locks_at but before stored status advanced");
    expect(integrationSql).toContain("invalid or missing odds blocked event locking");
    expect(integrationSql).toContain("changing away from a selected fighter did not clear the lock");
    expect(integrationSql).toContain("losing lock, zero-entry, and group totals did not reconcile");
    expect(integrationSql).toContain("shared rank");
    expect(integrationSql).toContain("browser role can mutate official results");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
