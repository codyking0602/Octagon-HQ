import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310193_cfb_superteam_weekly_launch.sql",
  "utf8",
);

describe("CFB Superteam Weekly Auction launch", () => {
  it("locks the five-player calibrated Sep 29 format", () => {
    expect(migration).toContain("'cfb-superteam','CFB Superteam'");
    expect(migration).toContain("date '2026-09-29'");
    expect(migration).toContain("when 'cfb-superteam' then 8");
    expect(migration).toContain("<>56");
    expect(migration).toContain("50-coalesce(sum(award.winning_bid),0)");
  });

  it("keeps the seven-slot roster and flex contract", () => {
    for (const slot of ["QB", "RB", "WR", "Flex", "Front Seven", "Secondary", "Head Coach"]) {
      expect(migration).toContain(`'${slot}'`);
    }
    expect(migration).toContain("array['RB','Flex']");
    expect(migration).toContain("array['WR','Flex']");
    expect(migration).toContain("array['Flex']");
  });

  it("enforces max two daily wins, ranked claims, rotating ties, and completion reserve", () => {
    expect(migration).toContain("football_weekly_superteam_bid_preferences");
    expect(migration).toContain("claim_rank");
    expect(migration).toContain("football_weekly_superteam_tie_rank");
    expect(migration).toContain(") < 2");
    expect(migration).toContain("v_max_wins:=least(2,v_open_slots)");
    expect(migration).toContain("v_reserve_after:=greatest(v_open_slots-v_max_wins,0)");
    expect(migration).toContain("v_top_commit>v_bankroll-v_reserve_after");
  });

  it("finishes incomplete rosters with the worst eligible unclaimed option for one dollar", () => {
    expect(migration).toContain("complete_football_weekly_superteam_rosters");
    expect(migration).toContain("v_roster_slot=any(authority.eligible_slots)");
    expect(migration).toContain("order by authority.hidden_grade asc");
    expect(migration).toContain("winning_bid=1");
    expect(migration).toContain("having count(award.roster_slot)<>7");
  });

  it("scores the equal-weight seven-player roster and keeps grades private until finals", () => {
    expect(migration).toContain("round(avg(authority.hidden_grade),2)");
    expect(migration).toContain("'grade',authority.hidden_grade");
    const getterStart = migration.indexOf("create or replace function private.get_my_football_weekly_superteam");
    const getterEnd = migration.indexOf("create or replace function private.submit_my_football_weekly_superteam_bids");
    const activeGetter = migration.slice(getterStart, getterEnd);
    expect(activeGetter).not.toContain("'grade',authority.hidden_grade");
  });

  it("gates the real Day 1 preview to Cody without exposing grades", () => {
    expect(migration).toContain("public.get_my_football_weekly_superteam_preview()");
    expect(migration).toContain("public.is_pick_control_owner(v_profile)");
    expect(migration).toContain("profile.normalized_name='CODY'");
    const previewStart = migration.indexOf("create or replace function public.get_my_football_weekly_superteam_preview()");
    const preview = migration.slice(previewStart);
    expect(preview).toContain("board.day_index=1");
    expect(preview).not.toContain("'grade',authority.hidden_grade");
  });
});
