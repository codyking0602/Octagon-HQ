import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  footballGmRepairLegacyYearOne,
  footballGmSharedPlayoffOutcomes,
} from "./footballGmSharedPostseason";
import type { FootballGmSeasonResultV2 } from "./footballGmStrategy";

const players = (left: number, right: number) => [
  { key: "11111111-1111-4111-8111-111111111111", grade: left },
  { key: "22222222-2222-4222-8222-222222222222", grade: right },
] as const;

const titleOutcomes = new Set(["Champion", "Super Bowl Loss"]);

describe("GM joint 32-team postseason", () => {
  it("never duplicates a Super Bowl champion or loser across 200 seasons", () => {
    for (let i = 0; i < 200; i += 1) {
      for (const year of [1, 2, 3] as const) {
        // Includes the originally reported two-elite-team edge case.
        const outcomes = footballGmSharedPlayoffOutcomes({
          matchSeed: `match-${i}`,
          year,
          players: players(95, 96),
        });
        const finishes = Object.values(outcomes);
        expect(finishes.filter((finish) => finish === "Champion").length).toBeLessThanOrEqual(1);
        expect(finishes.filter((finish) => finish === "Super Bowl Loss").length).toBeLessThanOrEqual(1);
        if (finishes.some((finish) => finish === "Champion") && finishes.some((finish) => finish === "Super Bowl Loss")) {
          expect(new Set(finishes).size).toBe(2);
        }
        expect(finishes).toHaveLength(2);
      }
    }
  });

  it("produces exactly the same outcomes for the same match from either participant's view", () => {
    for (let i = 0; i < 60; i += 1) {
      const input = { matchSeed: `stable-${i}`, year: 1 as const };
      const left = footballGmSharedPlayoffOutcomes({ ...input, players: players(89, 91) });
      const pair = players(89, 91);
      const right = footballGmSharedPlayoffOutcomes({ ...input, players: [pair[1], pair[0]] });
      expect(right).toEqual(left);
      expect(footballGmSharedPlayoffOutcomes({ ...input, players: players(89, 91) })).toEqual(left);
    }
  });

  it("keeps underdogs live but materially favors stronger front offices over many seasons", () => {
    let favored = 0;
    let underdog = 0;
    let different = 0;
    for (let i = 0; i < 300; i += 1) {
      const outcomes = footballGmSharedPlayoffOutcomes({
        matchSeed: `talent-${i}`,
        year: (i % 3 + 1) as 1 | 2 | 3,
        players: players(94, 80),
      });
      if (outcomes[players(94, 80)[0].key] === "Champion") favored += 1;
      if (outcomes[players(94, 80)[1].key] === "Champion") underdog += 1;
      if (Object.values(outcomes).some((finish) => titleOutcomes.has(finish))) different += 1;
    }
    expect(favored).toBeGreaterThan(underdog);
    expect(favored).toBeGreaterThan(20);
    expect(different).toBeGreaterThan(0);
  });

  it("repairs older impossible double-finalists without changing awarded offseason priority", () => {
    const season = (finish: "Champion" | "Super Bowl Loss"): FootballGmSeasonResultV2 => ({
      year: 1,
      rawTeamGrade: 90,
      weakLinkPenalty: 0,
      continuityAdjustment: 0,
      teamGrade: 90,
      finish,
      postseasonBonus: finish === "Champion" ? 7 : 5,
      titleOdds: 32,
    });
    for (const original of ["Champion", "Super Bowl Loss"] as const) {
      const repaired = footballGmRepairLegacyYearOne(
        season(original), season(original), "left", "left", "right",
      );
      expect(repaired?.map((row) => row.finish)).toEqual(["Super Bowl Loss", "Champion"]);
      expect(repaired?.map((row) => row.postseasonBonus)).toEqual([5, 7]);
    }
    expect(footballGmRepairLegacyYearOne(season("Champion"), season("Champion"), null, "left", "right")).toBeNull();
  });

  it("locks both final three-year results together in Supabase", () => {
    const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/202612310280_football_gm_shared_postseason.sql"), "utf8");
    expect(sql).toContain("opponentResolvedSeasons");
    expect(sql).toContain("A season cannot contain duplicate Super Bowl outcomes");
    expect(sql).toContain("jsonb_set(");
    expect(sql).toContain("p_run_state - 'opponentResolvedSeasons'");
  });
});
