import { describe, expect, it } from "vitest";
import prioritiesJson from "../../../data/generated/football/wheel-football-priorities.json";
import qbJson from "../../../data/generated/football/wheel-nfl-qb-grades-2026-10-03.json";
import rbJson from "../../../data/generated/football/wheel-nfl-rb-grades-2026-10-03.json";
import wrJson from "../../../data/generated/football/wheel-nfl-wr-grades-2026-10-03.json";
import teJson from "../../../data/generated/football/wheel-nfl-te-grades-2026-10-03.json";
import frontSevenJson from "../../../data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json";
import secondaryJson from "../../../data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json";
import headCoachJson from "../../../data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json";
import { normalizedWheelFootballNflName } from "./wheelFootballNflPriority";

type GradeFamily = "QB" | "RB" | "WR" | "TE" | "Front Seven" | "Secondary" | "Head Coach";
type GradeEntry = {
  team: string;
  family: GradeFamily;
  name: string;
  grade: number;
};

const entries: GradeEntry[] = [
  ...qbJson.grades.map((row) => ({ team: row.team, family: "QB" as const, name: row.player, grade: row.grade })),
  ...rbJson.grades.map((row) => ({ team: row.team, family: "RB" as const, name: row.player, grade: row.grade })),
  ...wrJson.grades.map((row) => ({ team: row.team, family: "WR" as const, name: row.player, grade: row.grade })),
  ...teJson.grades.map((row) => ({ team: row.team, family: "TE" as const, name: row.player, grade: row.grade })),
  ...frontSevenJson.grades.map((row) => ({ team: row.team, family: "Front Seven" as const, name: row.player, grade: row.grade })),
  ...secondaryJson.grades.map((row) => ({ team: row.team, family: "Secondary" as const, name: row.player, grade: row.grade })),
  ...headCoachJson.grades.map((row) => ({ team: row.team, family: "Head Coach" as const, name: row.coach, grade: row.grade })),
];

const expectedCounts: Record<GradeFamily, number> = {
  QB: 34,
  RB: 65,
  WR: 103,
  TE: 33,
  "Front Seven": 191,
  Secondary: 168,
  "Head Coach": 32,
};

function key(entry: Pick<GradeEntry, "team" | "family" | "name">) {
  return `${entry.team}|${entry.family}|${normalizedWheelFootballNflName(entry.name)}`;
}

function names(values: readonly string[]) {
  return [...values].map(normalizedWheelFootballNflName).sort();
}

describe("NFL Wheel authoritative grade population", () => {
  it("accounts for exactly the locked 626 grades with no duplicate team/family/name bindings", () => {
    expect(entries).toHaveLength(626);
    for (const [family, count] of Object.entries(expectedCounts)) {
      expect(entries.filter((entry) => entry.family === family)).toHaveLength(count);
    }
    expect(new Set(entries.map(key)).size).toBe(626);
    expect(entries.every((entry) => Number.isInteger(entry.grade) && entry.grade >= 70 && entry.grade <= 100)).toBe(true);
  });

  it("matches the canonical curated population exactly for every non-Flex family", () => {
    for (const [teamCode, team] of Object.entries(prioritiesJson.teams)) {
      const typed = team as typeof team & { TE: string[] };
      const expected: Record<GradeFamily, readonly string[]> = {
        QB: typed.QB,
        RB: typed.RB,
        WR: typed.WR,
        TE: typed.TE,
        "Front Seven": typed["Front Seven"],
        Secondary: typed.Secondary,
        "Head Coach": typed["Head Coach"],
      };

      for (const family of Object.keys(expected) as GradeFamily[]) {
        const actual = entries
          .filter((entry) => entry.team === teamCode && entry.family === family)
          .map((entry) => entry.name);
        expect(names(actual), `${teamCode} ${family}`).toEqual(names(expected[family]));
      }
    }
  });

  it("makes every Flex name inherit exactly one RB/WR/TE authoritative grade", () => {
    for (const [teamCode, team] of Object.entries(prioritiesJson.teams)) {
      for (const flexName of team.Flex) {
        const matches = entries.filter((entry) => (
          entry.team === teamCode
          && ["RB", "WR", "TE"].includes(entry.family)
          && normalizedWheelFootballNflName(entry.name) === normalizedWheelFootballNflName(flexName)
        ));
        expect(matches, `${teamCode} Flex ${flexName}`).toHaveLength(1);
      }
    }
  });

  it("cannot resolve a correct name through the wrong position family", () => {
    const dakKey = normalizedWheelFootballNflName("Dak Prescott");
    expect(entries.filter((entry) => entry.team === "DAL" && entry.family === "QB" && normalizedWheelFootballNflName(entry.name) === dakKey)).toHaveLength(1);
    expect(entries.filter((entry) => entry.team === "DAL" && entry.family === "WR" && normalizedWheelFootballNflName(entry.name) === dakKey)).toHaveLength(0);

    const repeatedNames = new Map<string, GradeEntry[]>();
    for (const entry of entries) {
      const nameKey = normalizedWheelFootballNflName(entry.name);
      repeatedNames.set(nameKey, [...(repeatedNames.get(nameKey) ?? []), entry]);
    }
    for (const group of repeatedNames.values()) {
      if (group.length < 2) continue;
      for (const entry of group) {
        expect(entries.filter((candidate) => key(candidate) === key(entry))).toHaveLength(1);
      }
    }
  });

  it("normalizes the one accented curated name to the same stable identity key", () => {
    expect(normalizedWheelFootballNflName("Jevón Holland")).toBe("jevonholland");
    expect(normalizedWheelFootballNflName("Jevon Holland")).toBe("jevonholland");
  });
});
