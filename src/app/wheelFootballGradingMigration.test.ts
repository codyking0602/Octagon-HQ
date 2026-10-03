import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310241_wheel_football_locked_grading.sql",
  "utf8",
);
const repository = readFileSync("src/features/play/wheelFootballRepository.ts", "utf8");
const page = readFileSync("src/features/back-room/FootballWheelPage.tsx", "utf8");

const gradeFiles = [
  ["QB", "data/generated/football/wheel-nfl-qb-grades-2026-10-03.json"],
  ["RB", "data/generated/football/wheel-nfl-rb-grades-2026-10-03.json"],
  ["WR", "data/generated/football/wheel-nfl-wr-grades-2026-10-03.json"],
  ["TE", "data/generated/football/wheel-nfl-te-grades-2026-10-03.json"],
  ["Front Seven", "data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json"],
  ["Secondary", "data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json"],
  ["Head Coach", "data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json"],
] as const;

function normalized(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

describe("Wheel of Football locked grading runtime", () => {
  it("copies all 626 canonical artifact rows exactly into the private runtime authority", () => {
    const expected = new Map<string, number>();
    for (const [family, path] of gradeFiles) {
      const artifact = JSON.parse(readFileSync(path, "utf8")) as {
        grades: Array<{ team: string; player?: string; coach?: string; grade: number }>;
      };
      for (const row of artifact.grades) {
        const name = row.player ?? row.coach;
        expect(name).toBeTruthy();
        expected.set(`${row.team}|${family}|${normalized(name!)}`, row.grade);
      }
    }

    const actual = new Map<string, number>();
    const pattern = /\('([A-Z]+)','([^']+)','([^']+)','((?:''|[^'])*)',([0-9.]+),'\d{4}-\d{2}-\d{2}','((?:''|[^'])*)','((?:''|[^'])*)'\)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(migration))) {
      actual.set(`${match[1]}|${match[2]}|${match[3]}`, Number(match[5]));
    }

    expect(expected.size).toBe(626);
    expect(actual.size).toBe(626);
    expect(actual).toEqual(expected);
  });

  it("resolves grades by team + position family + identity with no fallback", () => {
    expect(migration).toContain("authority.team_code = v_team");
    expect(migration).toContain("authority.position_group = v_group");
    expect(migration).toContain("authority.name_key = v_key");
    expect(migration).toContain("Missing locked Wheel grade");
    expect(migration).not.toContain("fallback");
    expect(migration).not.toMatch(/coalesce\s*\(\s*authority\.hidden_grade/i);
  });

  it("keeps Flex on the selected RB/WR/TE grade and collision identities separated", () => {
    expect(migration).toContain("if v_slot = 'Flex' and v_position in ('RB','WR','TE') then return v_position;");
    expect(migration).toContain("('JAX','WR','travishunter','Travis Hunter',77.0");
    expect(migration).toContain("('JAX','Secondary','travishunter','Travis Hunter',82.0");
    expect(migration).toContain("('SEA','Front Seven','byronmurphyii','Byron Murphy II',89.0");
    expect(migration).toContain("('MIN','Secondary','byronmurphyjr','Byron Murphy Jr.',86.0");
  });

  it("freezes the grade snapshot on insert and never publishes individual grades", () => {
    expect(migration).toContain("before insert on private.wheel_football_picks");
    expect(migration).toContain("new.hidden_grade := v_grade");
    expect(migration).toContain("new.hidden_grade_version := v_version");
    expect(migration).toContain("new.hidden_grade_effective_date := v_effective_date");
    expect(migration).not.toContain("update private.wheel_football_picks");
    expect(repository).not.toContain("hidden_grade");
    expect(repository).not.toContain("raw_grade");
    expect(page).not.toContain("hidden_grade");
    expect(page).not.toContain("raw_grade");
  });

  it("persists only final grades for natural completions and preserves pre-runtime history", () => {
    expect(migration).toContain("'finalGrade', v_creator_final");
    expect(migration).toContain("'finalGrade', v_recipient_final");
    expect(migration).toContain("if v_creator_raw is null or v_recipient_raw is null then");
    expect(migration).toContain("Pre-runtime historical matches keep their original v1 result");
    expect(migration).toContain("'creator_final_grade'");
    expect(migration).toContain("'recipient_final_grade'");
    expect(migration).not.toContain("'creator_raw_grade'");
    expect(migration).not.toContain("'recipient_raw_grade'");
  });
});
