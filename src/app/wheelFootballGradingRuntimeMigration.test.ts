import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310243_wheel_football_nfl_grading_runtime.sql",
  "utf8",
);

describe("Wheel of Football NFL grading runtime migration", () => {
  it("keeps authoritative grades private and resolves by team, family, and normalized name", () => {
    expect(migration).toContain("create table if not exists private.wheel_football_nfl_grades");
    expect(migration).toContain("revoke all on private.wheel_football_nfl_grades from public, anon, authenticated");
    expect(migration).toContain("private.resolve_wheel_football_nfl_grade");
    expect(migration).toContain("source.team_code = upper(trim(p_team_code))");
    expect(migration).toContain("source.grade_position = trim(p_grade_position)");
    expect(migration).toContain("private.wheel_football_normalized_name");
    expect(migration).toContain("source.normalized_name = private.wheel_football_normalized_name(p_display_name)");
  });

  it("freezes the resolved grade/version/date on every stored pick", () => {
    expect(migration).toContain("selected_grade smallint");
    expect(migration).toContain("grade_version text");
    expect(migration).toContain("grade_effective_date date");
    expect(migration).toContain("Pre-grading v1 picks intentionally remain NULL");
    expect(migration).not.toContain("alter column selected_grade set not null");
    expect(migration).toContain("v_selected_grade");
    expect(migration).toContain("v_grade_version");
    expect(migration).toContain("v_grade_effective_date");
    expect(migration).toContain("selected_grade,");
    expect(migration).toContain("v_selected_grade,");
  });

  it("grades completed rosters from frozen picks and never re-reads master grades", () => {
    const finalizer = migration.slice(
      migration.indexOf("create or replace function private.finalize_wheel_football_grades"),
      migration.indexOf("create or replace function private.wheel_football_state_json"),
    );

    expect(finalizer).toContain("count(pick.selected_grade)");
    expect(finalizer).toContain("avg(pick.selected_grade::numeric)");
    expect(finalizer).not.toContain("wheel_football_nfl_grades source");
    expect(finalizer).toContain("v_creator_final := round(v_creator_raw * 2 - 100, 1)");
    expect(finalizer).toContain("v_recipient_final := round(v_recipient_raw * 2 - 100, 1)");
    expect(finalizer).toContain("when v_creator_raw > v_recipient_raw then");
    expect(finalizer).toContain("when v_recipient_raw > v_creator_raw then");
  });

  it("reveals only final team grades after natural completion", () => {
    const stateJson = migration.slice(
      migration.indexOf("create or replace function private.wheel_football_state_json"),
      migration.indexOf("create or replace function private.pick_wheel_football"),
    );

    expect(stateJson).toContain("'creator_final_grade'");
    expect(stateJson).toContain("'recipient_final_grade'");
    expect(stateJson).toContain("'winner_profile_id'");
    expect(stateJson).toContain("match.forfeited_by_profile_id is null");
    expect(stateJson).not.toContain("'selected_grade'");
    expect(stateJson).not.toContain("'grade_version'");
    expect(stateJson).not.toContain("'grade_effective_date'");
    expect(stateJson).not.toContain("'creator_raw_grade'");
    expect(stateJson).not.toContain("'recipient_raw_grade'");
  });
});
