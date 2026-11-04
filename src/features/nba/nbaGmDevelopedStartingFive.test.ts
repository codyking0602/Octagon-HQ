import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  nbaGmDevAssignRoster, nbaGmDevSeasonPicks,
  type NbaGmDevPlayer, type NbaGmDevRun,
} from "./nbaGmDevModel";

const player = (id: string, grade: number, positions: Array<"PG" | "SG" | "SF" | "PF" | "C">) =>
  ({ id, currentGrade: grade, positions }) as NbaGmDevPlayer;
const catalog = [
  player("nba-gm-draft-tyjerome", 80, ["PG", "SG"]),
  player("nba-gm-draft-aaronnesmith", 81, ["SF", "SG"]),
  player("nba-gm-draft-kevindurant", 92, ["SF", "PF"]),
  player("nba-gm-draft-cooperflagg", 87, ["SF", "PF"]),
  player("nba-gm-draft-markwilliams", 79, ["C", "PF"]),
  player("nba-gm-draft-jrueholiday", 80, ["PG", "SG"]),
  player("nba-gm-draft-noahclowney", 76, ["PF", "C"]),
];
const drafted = nbaGmDevAssignRoster(catalog.map(p => p.id), catalog)!;
const current = (year2Clowney = 79.25) => ({
  version: "nba-gm-dev-v2",
  lineupModelVersion: 1,
  picks: drafted,
  yearOnePicks: drafted,
  development: Object.fromEntries(catalog.map(p => [p.id, {
    year2Grade: p.id.endsWith("noahclowney") ? year2Clowney
      : p.id.endsWith("markwilliams") ? 78.72 : p.currentGrade,
    year3Grade: p.id.endsWith("noahclowney") ? 80.51
      : p.id.endsWith("markwilliams") ? 78.13 : p.currentGrade,
    startingGrade: p.currentGrade,
    year2Salary: 0, year3Salary: 0,
  }])),
}) as unknown as NbaGmDevRun;
const at = (picks: ReturnType<typeof nbaGmDevSeasonPicks>, slot: string) =>
  picks.find(p => p.slot === slot)?.playerId;

describe("NBA GM developing starters: backup big promotion", () => {
  it("keeps Mark Williams starting in Year 1 but promotes Noah Clowney in both later years", () => {
    const run = current();
    expect(at(run.yearOnePicks, "C")).toBe("nba-gm-draft-markwilliams");
    expect(at(run.yearOnePicks, "BIG")).toBe("nba-gm-draft-noahclowney");
    for (const year of [2, 3] as const) {
      const picks = nbaGmDevSeasonPicks(run, catalog, year);
      expect(at(picks, "C")).toBe("nba-gm-draft-noahclowney");
      expect(at(picks, "BIG")).toBe("nba-gm-draft-markwilliams");
      expect(new Set(picks.map(p => p.slot)).size).toBe(7);
      expect(new Set(picks.map(p => p.playerId)).size).toBe(7);
    }
    expect(nbaGmDevSeasonPicks(run, catalog, 1)).toEqual(run.yearOnePicks);
    expect(run.yearOnePicks).toEqual(drafted);
  });

  it("optimizes each year's grades separately, rather than promoting too early", () => {
    const run = current(78.0);
    expect(at(nbaGmDevSeasonPicks(run, catalog, 2), "C")).toBe("nba-gm-draft-markwilliams");
    expect(at(nbaGmDevSeasonPicks(run, catalog, 3), "C")).toBe("nba-gm-draft-noahclowney");
  });

  it("preserves completed old saves without the new lineup opt-in", () => {
    const legacy = { ...current(), lineupModelVersion: undefined };
    expect(nbaGmDevSeasonPicks(legacy, catalog, 2)).toEqual(drafted);
    expect(nbaGmDevSeasonPicks(legacy, catalog, 3)).toEqual(drafted);
  });

  it("keeps a deterministic best five regardless of draft ordering", () => {
    const grades = new Map(catalog.map(p => [p.id,
      p.id.endsWith("noahclowney") ? 80.51 :
      p.id.endsWith("markwilliams") ? 78.13 : p.currentGrade] as const));
    const a = nbaGmDevAssignRoster(catalog.map(p => p.id), catalog, grades);
    const b = nbaGmDevAssignRoster([...catalog].reverse().map(p => p.id), catalog, grades);
    expect(a).toEqual(b);
    expect(at(a!, "C")).toBe("nba-gm-draft-noahclowney");
  });

  it("wires backend simulator AND advance to the versioned developed lineup", () => {
    const sql = readFileSync("supabase/migrations/202612310936_nba_gm_developed_season_lineup.sql", "utf8");
    const regression = readFileSync("supabase/tests/nba_gm_developed_season_lineup.sql", "utf8");
    const fit = readFileSync("src/features/nba/NbaGmTeamFit.tsx", "utf8");
    expect(sql).toContain("private.nba_gm_v3_grade(p_state,p.id,p_year)");
    expect(sql).toContain("private.nba_gm_v10_season_lineup(p_state,p_year)");
    expect(sql).toContain("v_picks:=private.nba_gm_v10_season_lineup(v_next,3)");
    expect(sql).toContain("'lineupModelVersion',1");
    expect(regression).toContain("nba-gm-lineup-regression-101");
    expect(regression).toContain("Season % used saved bench slots");
    expect(fit).toContain("nbaGmDevSeasonPicks(run, catalog");
  });
});
