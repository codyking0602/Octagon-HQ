import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310239_wheel_football_grading.sql",
  "utf8",
);

describe("Wheel of Football hidden grading migration", () => {
  it("owns a private current-NFL authority with complete launch coverage and coaches", () => {
    expect(migration).toContain("create table if not exists private.wheel_football_grade_authority");
    expect(migration).toContain("revoke all on private.wheel_football_grade_authority from public, anon, authenticated");
    expect(migration.split("('ea-m27:")).toHaveLength(1821);
    expect(migration.split("('coach:")).toHaveLength(33);
    expect(migration).toContain("'m27-week3-2026-10-02'");
    expect(migration).toContain("'Octagon HQ current-head-coach audit'");
  });

  it("freezes a server-owned grade onto every pick without changing the picker contract", () => {
    expect(migration).toContain("add column if not exists hidden_grade numeric(4,1)");
    expect(migration).toContain("create or replace function private.grade_wheel_football_pick()");
    expect(migration).toContain("before insert or update of team_code, display_name, position_abbreviation");
    expect(migration).toContain("new.hidden_grade := v_grade");
    expect(migration).toContain("new.grade_version := v_version");
    expect(migration).toContain("'fallback-unmatched-current-roster'");
  });

  it("keeps seven slots equal-weight and the raw average authoritative", () => {
    expect(migration).toContain("when count(*) = 7 and count(pick.hidden_grade) = 7");
    expect(migration).toContain("then round(avg(pick.hidden_grade), 1)");
    expect(migration).toContain("p_raw_grade * 5 - 380");
    expect(migration).toContain("greatest(0, least(100");
    expect(migration).toContain("winner_profile_id");
  });

  it("never exposes hidden player grades until the matchup is complete", () => {
    const revealClause = "case when match.phase = 'complete' then pick.hidden_grade else null end";
    expect(migration.split(revealClause)).toHaveLength(3);
    expect(migration).toContain("'result', case when match.phase = 'complete'");
    expect(migration).toContain("jsonb_strip_nulls");
  });
});
