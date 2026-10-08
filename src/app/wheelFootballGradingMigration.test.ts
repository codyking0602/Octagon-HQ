import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310243_wheel_football_locked_grading.sql",
  "utf8",
);
const identityMigration = readFileSync(
  "supabase/migrations/202612310255_wheel_football_generation_suffix_identity.sql",
  "utf8",
);
const ownerGradeRevision = readFileSync(
  "supabase/migrations/202612310283_wheel_nfl_owner_approved_grade_updates.sql",
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
    const historical = new Map(actual);
    const revisedKeys = new Set<string>();
    pattern.lastIndex = 0;
    while ((match = pattern.exec(ownerGradeRevision))) {
      const key = `${match[1]}|${match[2]}|${match[3]}`;
      expect(historical.has(key), key).toBe(true);
      expect(revisedKeys.has(key), key).toBe(false);
      expect(historical.get(key), key).not.toBe(Number(match[5]));
      revisedKeys.add(key);
      actual.set(key, Number(match[5]));
    }
    expect(revisedKeys.size).toBe(34);
    expect(ownerGradeRevision).toContain("'2026-10-08'");
    expect(ownerGradeRevision).not.toContain("wheel_football_picks");
    expect(actual).toEqual(expected);
  });

  it("resolves grades by team + position family + identity with no fallback", () => {
    expect(migration).toContain("authority.team_code = v_team");
    expect(migration).toContain("authority.position_group = v_group");
    expect(migration).toContain("authority.name_key = v_key");
    expect(migration).toContain("authority.effective_date <= current_date");
    expect(migration).toContain("order by authority.effective_date desc");
    expect(migration).toContain("primary key (team_code, position_group, name_key, effective_date)");
    expect(migration).toContain("Missing locked Wheel grade");
    expect(migration).not.toContain("fallback");
    expect(migration).not.toMatch(/coalesce\s*\(\s*authority\.hidden_grade/i);
  });

  it("allows only an unambiguous generational-suffix identity fallback", () => {
    expect(identityMigration).toContain("authority.name_key = v_key");
    expect(identityMigration).toContain("count(distinct authority.name_key)");
    expect(identityMigration).toContain("v_alias_count = 1");
    expect(identityMigration).toContain("wheel_football_grade_base_name_key(authority.display_name) = v_base_key");
    expect(identityMigration).toContain("v_team text := trim(coalesce(p_team_code, ''))");
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
    expect(migration).toContain("where match.phase <> 'complete'");
    expect(migration).toContain("and pick.hidden_grade is null");
    expect(migration).not.toContain("after update on private.wheel_football_grade_authority");
    expect(repository).not.toContain("hidden_grade");
    expect(repository).not.toContain("raw_grade");
    expect(page).not.toContain("hidden_grade");
    expect(page).not.toContain("raw_grade");
  });

  it("snapshots already-active picks once without retroactively rewriting completed v1 history", () => {
    expect(migration).toContain("where match.phase <> 'complete'");
    expect(migration).toContain("and pick.hidden_grade is null");
    expect(migration).toContain("hidden_grade_version = v_grade.grade_version");
    expect(migration).toContain("hidden_grade_effective_date = v_grade.effective_date");
    expect(migration).not.toContain("where match.phase = 'complete'\n      and pick.hidden_grade is null");
  });

  it("keeps future authority revisions append-only while stored picks stay frozen", () => {
    expect(migration).toContain("primary key (team_code, position_group, name_key, effective_date)");
    expect(migration).toContain("on conflict (team_code, position_group, name_key, effective_date) do update");
    expect(migration).toContain("order by authority.effective_date desc");
    expect(migration).toContain("before insert on private.wheel_football_picks");
    expect(migration).not.toContain("after update on private.wheel_football_grade_authority");
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
