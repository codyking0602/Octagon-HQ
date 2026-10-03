import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310240_wheel_football_full_grading.sql",
  "utf8",
);

describe("Wheel of Football complete hidden grading migration", () => {
  it("owns a private current-NFL authority with full player and coach coverage", () => {
    expect(migration).toContain("create table if not exists private.wheel_football_grade_authority");
    expect(migration).toContain("revoke all on private.wheel_football_grade_authority from public, anon, authenticated");
    expect(migration.split("('ea-m27:")).toHaveLength(1821);
    expect(migration.split("('coach:")).toHaveLength(33);
    expect(migration).toContain("'m27-week3-2026-10-02'");
    expect(migration).toContain("'Octagon HQ current-head-coach audit'");
  });

  it("freezes a server-owned current grade onto every pick", () => {
    expect(migration).toContain("add column if not exists hidden_grade numeric(4,1)");
    expect(migration).toContain("create or replace function private.grade_wheel_football_pick()");
    expect(migration).toContain("before insert or update of team_code, display_name, position_abbreviation");
    expect(migration).toContain("new.hidden_grade := v_grade");
    expect(migration).toContain("new.grade_version := v_version");
  });

  it("resolves trades by normalized player identity before using team for same-name collisions", () => {
    expect(migration).toContain("where authority.name_key = v_name_key");
    expect(migration).toContain("and authority.position_family = v_family");
    expect(migration).toContain("if v_count = 1 then");
    expect(migration).toContain("and authority.team_code = upper(trim(p_team_code))");
  });

  it("keeps seven slots equal-weight and uses the wider Wheel display curve", () => {
    expect(migration).toContain("when count(*) = 7 and count(pick.hidden_grade) = 7");
    expect(migration).toContain("then round(avg(pick.hidden_grade), 1)");
    expect(migration).toContain("round((p_raw_grade * 2) - 100)");
    expect(migration).toContain("raw 75/80/85/90/95/100 maps to 50/60/70/80/90/100");
  });

  it("reveals grades only for naturally completed seven-pick matchups, never forfeits", () => {
    const revealClause = "case when match.phase = 'complete' and match.forfeited_at is null then pick.hidden_grade else null end";
    expect(migration.split(revealClause)).toHaveLength(3);
    expect(migration).toContain("'result', case when match.phase = 'complete' and match.forfeited_at is null");
    expect(migration).toContain("'forfeited_by_profile_id', match.forfeited_by_profile_id");
    expect(migration).toContain("'forfeited_at', match.forfeited_at");
  });

  it("keeps an auditable emergency fallback only for post-authority roster additions", () => {
    expect(migration).toContain("'fallback-unmatched-current-roster'");
    expect(migration).toContain("hidden_grade := 70.0");
  });
});
