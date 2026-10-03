import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import qbJson from "../../data/generated/football/wheel-nfl-qb-grades-2026-10-03.json";
import rbJson from "../../data/generated/football/wheel-nfl-rb-grades-2026-10-03.json";
import wrJson from "../../data/generated/football/wheel-nfl-wr-grades-2026-10-03.json";
import teJson from "../../data/generated/football/wheel-nfl-te-grades-2026-10-03.json";
import frontSevenJson from "../../data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json";
import secondaryJson from "../../data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json";
import headCoachJson from "../../data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json";

const migration = readFileSync(
  "supabase/migrations/202612310243_wheel_football_nfl_grading_runtime.sql",
  "utf8",
);

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function sql(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

const specs = [
  ["QB", qbJson, "player"],
  ["RB", rbJson, "player"],
  ["WR", wrJson, "player"],
  ["TE", teJson, "player"],
  ["Front Seven", frontSevenJson, "player"],
  ["Secondary", secondaryJson, "player"],
  ["Head Coach", headCoachJson, "coach"],
] as const;

describe("Wheel of Football grading runtime migration", () => {
  it("seeds every one of the 626 canonical artifact grades exactly", () => {
    let count = 0;
    for (const [family, artifact, nameField] of specs) {
      for (const row of artifact.grades) {
        const name = row[nameField] as string;
        const tuple = `(${sql(row.team)}, ${sql(family)}, ${sql(name)}, ${sql(normalize(name))}, ${row.grade}, ${sql(artifact.effectiveDate)}::date, ${sql(artifact.version)},`;
        expect(migration, `${family} ${row.team} ${name}`).toContain(tuple);
        count += 1;
      }
    }
    expect(count).toBe(626);
  });

  it("resolves grades server-side by team, position family, and normalized name", () => {
    expect(migration).toContain("create table if not exists private.wheel_football_nfl_grades");
    expect(migration).toContain("primary key (team_code, grade_family, name_key)");
    expect(migration).toContain("grade.team_code = upper(trim(coalesce(p_team_code, '')))");
    expect(migration).toContain("grade.grade_family = private.wheel_football_grade_family");
    expect(migration).toContain("grade.name_key = private.wheel_football_grade_name_key(p_display_name)");
    expect(migration).toContain("No authoritative Wheel grade found");
    expect(migration).not.toContain("p_selection_grade");
  });

  it("freezes the selected grade instead of recomputing historical games from the master table", () => {
    expect(migration).toContain("selection_grade smallint");
    expect(migration).toContain("grade_effective_date date");
    expect(migration).toContain("grade_version text");
    expect(migration).toContain("grade_source_artifact text");
    expect(migration).toContain("pick.selection_grade");
    expect(migration).toContain("private.wheel_football_grading_result_json");

    const stateStart = migration.indexOf("create or replace function private.wheel_football_state_json");
    const stateEnd = migration.indexOf("create or replace function private.create_wheel_football_challenge", stateStart);
    const stateFunction = migration.slice(stateStart, stateEnd);
    expect(stateFunction).not.toContain("private.wheel_football_nfl_grades");
    expect(stateFunction).toContain("case when grading.result is null then null else pick.selection_grade end");
  });

  it("keeps grades hidden until natural completion and never reveals them on a forfeit", () => {
    expect(migration).toContain("v_match.phase <> 'complete'");
    expect(migration).toContain("v_match.forfeited_at is not null");
    expect(migration).toContain("'grading_result', grading.result");
    expect(migration).toContain("'grade', case when grading.result is null then null else pick.selection_grade end");
  });

  it("starts future matches graded, adopts active matches once, and leaves completed v1 games legacy", () => {
    expect(migration).toContain("'football-wheel-v2-grades'");
    expect(migration).toContain("'nfl-wheel-grade-runtime-v1'");
    expect(migration).toContain("if v_match.grading_runtime_version is not null then");
    expect(migration).toContain("Existing picks are frozen");
    expect(migration).toContain("match.completed_at is null");
    expect(migration).toContain("match.phase <> 'complete'");
    expect(migration).toContain("Cannot activate NFL Wheel grading: an active historical pick does not resolve");
    expect(migration).not.toMatch(/where match\.completed_at is not null[\s\S]{0,180}grading_runtime_version/i);
  });

  it("uses seven equal raw grades for the winner and curves only the displayed team score", () => {
    expect(migration).toContain("v_creator_total > v_recipient_total");
    expect(migration).toContain("v_recipient_total > v_creator_total");
    expect(migration).toContain("round(v_creator_total::numeric / 7::numeric, 2)");
    expect(migration).toContain("((p_grade_total::numeric / p_pick_count::numeric) * 2) - 100");
  });
});
