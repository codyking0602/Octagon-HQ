import { describe, expect, it } from "vitest";
import priorities from "../../../data/generated/football/wheel-football-priorities.json";
import qb from "../../../data/generated/football/wheel-nfl-qb-grades-2026-10-03.json";
import rb from "../../../data/generated/football/wheel-nfl-rb-grades-2026-10-03.json";
import wr from "../../../data/generated/football/wheel-nfl-wr-grades-2026-10-03.json";
import te from "../../../data/generated/football/wheel-nfl-te-grades-2026-10-03.json";
import frontSeven from "../../../data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json";
import secondary from "../../../data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json";
import headCoach from "../../../data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json";

type Family = "QB" | "RB" | "WR" | "TE" | "Front Seven" | "Secondary" | "Head Coach";
type GradeRow = { team: string; name: string; grade: number; family: Family };

function normalizedName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function rowsFor(
  family: Family,
  artifact: { grades: readonly Record<string, unknown>[] },
): GradeRow[] {
  return artifact.grades.map((row) => ({
    team: String(row.team),
    name: String(row.player ?? row.coach),
    grade: Number(row.grade),
    family,
  }));
}

const rows: GradeRow[] = [
  ...rowsFor("QB", qb),
  ...rowsFor("RB", rb),
  ...rowsFor("WR", wr),
  ...rowsFor("TE", te),
  ...rowsFor("Front Seven", frontSeven),
  ...rowsFor("Secondary", secondary),
  ...rowsFor("Head Coach", headCoach),
];

function key(row: Pick<GradeRow, "team" | "family" | "name">) {
  return `${row.team}|${row.family}|${normalizedName(row.name)}`;
}

const byKey = new Map(rows.map((row) => [key(row), row]));

function finalGrade(raw: number) {
  return Math.round((raw * 2 - 100) * 10) / 10;
}

describe("NFL Wheel authoritative grade runtime contract", () => {
  it("accounts for all 626 locked grades exactly once", () => {
    expect(rows).toHaveLength(626);
    expect(byKey.size).toBe(626);
    expect(rows.filter((row) => row.family === "QB")).toHaveLength(34);
    expect(rows.filter((row) => row.family === "RB")).toHaveLength(65);
    expect(rows.filter((row) => row.family === "WR")).toHaveLength(103);
    expect(rows.filter((row) => row.family === "TE")).toHaveLength(33);
    expect(rows.filter((row) => row.family === "Front Seven")).toHaveLength(191);
    expect(rows.filter((row) => row.family === "Secondary")).toHaveLength(168);
    expect(rows.filter((row) => row.family === "Head Coach")).toHaveLength(32);
  });

  it("binds every curated priority entry to the correct team and grade family", () => {
    const referenced = new Set<string>();
    const directSlots = ["QB", "RB", "WR", "Front Seven", "Secondary", "Head Coach"] as const;

    for (const [team, teamPriority] of Object.entries(priorities.teams)) {
      for (const slot of directSlots) {
        for (const name of teamPriority[slot]) {
          const gradeKey = key({ team, family: slot, name });
          expect(byKey.has(gradeKey), `${team} ${slot} ${name}`).toBe(true);
          referenced.add(gradeKey);
        }
      }

      for (const name of teamPriority.Flex) {
        const matches = (["RB", "WR", "TE"] as const)
          .map((family) => key({ team, family, name }))
          .filter((gradeKey) => byKey.has(gradeKey));
        expect(matches, `${team} Flex ${name}`).toHaveLength(1);
        referenced.add(matches[0]!);
      }
    }

    expect(referenced.size).toBe(626);
    expect([...byKey.keys()].filter((gradeKey) => !referenced.has(gradeKey))).toEqual([]);
  });

  it("keeps same-name collisions position-safe", () => {
    const hunterWr = byKey.get(key({ team: "JAX", family: "WR", name: "Travis Hunter" }));
    const hunterDb = byKey.get(key({ team: "JAX", family: "Secondary", name: "Travis Hunter" }));

    expect(hunterWr?.grade).toBe(77);
    expect(hunterDb?.grade).toBe(82);
    expect(hunterWr?.grade).not.toBe(hunterDb?.grade);
  });

  it("uses the locked NFL amplified final-grade curve without changing raw winner truth", () => {
    expect(finalGrade(75)).toBe(50);
    expect(finalGrade(80)).toBe(60);
    expect(finalGrade(85)).toBe(70);
    expect(finalGrade(90)).toBe(80);
    expect(finalGrade(95)).toBe(90);
    expect(finalGrade(100)).toBe(100);

    expect(finalGrade(97) - finalGrade(92)).toBe(10);
    expect(finalGrade(92) - finalGrade(87)).toBe(10);
    expect(finalGrade(87) - finalGrade(82)).toBe(10);
    expect(finalGrade(82) - finalGrade(76)).toBe(12);
  });

  it("keeps every roster slot equally weighted so the bottom range matters without dominating", () => {
    const baseline = [82, 82, 82, 82, 82, 82, 82];
    const eliteUpgrade = [...baseline];
    eliteUpgrade[0] = 97;
    const weakDowngrade = [...baseline];
    weakDowngrade[0] = 76;

    const average = (grades: number[]) => grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    const baselineRaw = average(baseline);
    const eliteRaw = average(eliteUpgrade);
    const weakRaw = average(weakDowngrade);

    expect(eliteRaw - baselineRaw).toBeCloseTo(15 / 7, 8);
    expect(baselineRaw - weakRaw).toBeCloseTo(6 / 7, 8);
    expect(finalGrade(eliteRaw) - finalGrade(baselineRaw)).toBeCloseTo(4.3, 1);
    expect(finalGrade(baselineRaw) - finalGrade(weakRaw)).toBeCloseTo(1.7, 1);
  });
});
