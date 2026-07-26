import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/202608020001_picks_v2_scoring.sql", "utf8");

describe("Picks V2 authoritative scoring migration", () => {
  it("locks one selection per profile and event and freezes odds at transition", () => {
    expect(sql).toContain("primary key (profile_id, event_id)");
    expect(sql).toContain("old.status='upcoming' and new.status='locked'");
    expect(sql).toContain("frozen_american_odds");
    expect(sql).toContain("frozen_at is null");
    expect(sql).toContain("underdog lock is closed");
  });

  it("owns base, bonus, total, missing, and excluded scoring in RPC projections", () => {
    expect(sql).toContain("4*count(*)");
    expect(sql).toContain("pick_underdog_bonus");
    expect(sql).toContain("'draw','no_contest','cancelled'");
    expect(sql).toContain("then 'missing'");
    expect(sql).toContain("'total_points'");
    expect(sql).toContain("rank() over(partition by event_id order by base_points+lock_bonus desc,correct desc)");
  });

  it("keeps official result mutation unavailable to browser roles", () => {
    expect(sql).not.toMatch(/grant execute on function public\.record_official_pick_bout_result[^;]+authenticated/s);
    expect(sql).toContain("revoke all on table public.profile_event_underdog_locks from public, anon, authenticated");
  });
});
