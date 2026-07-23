import { describe, expect, it } from "vitest";
import { v1ProductionRankingParityFixture } from "./parityFixture";

const fixture = v1ProductionRankingParityFixture;
const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

function rowsFor(board: "men" | "women") {
  return fixture.fighters
    .filter((fighter) => fighter.board === board)
    .sort((left, right) => left.rank - right.rank);
}

describe("V1 production ranking parity fixture", () => {
  it("is pinned to the audited V1 production owners", () => {
    expect(fixture.source).toMatchObject({
      repository: "codyking0602/ufc-goat-rankings",
      commit: "842ba06ea09c4f40723226f4c4dfd35041cb3314",
      captureEvent: "ufc-production-ranking-ready",
      projectionGlobal: "UFC_CALCULATED_RANKING_PROJECTION",
      modelAsOfDate: "2026-07-13",
    });
    expect(fixture.contract).toMatchObject({
      categoryMax: 30,
      weights: {
        championship: 35,
        opponentQuality: 25,
        primeDominance: 30,
        longevity: 10,
      },
      tieBreakOrder: [
        "totalScore:desc",
        "championship:desc",
        "opponentQuality:desc",
        "fighter:asc",
      ],
    });
  });

  it("contains one complete 80-fighter projection", () => {
    expect(fixture.counts).toEqual({ fighters: 80, men: 65, women: 15 });
    expect(fixture.fighters).toHaveLength(80);
    expect(new Set(fixture.fighters.map((fighter) => fighter.fighter))).toHaveLength(80);
    expect(fixture.boards.men).toHaveLength(65);
    expect(fixture.boards.women).toHaveLength(15);
  });

  it("preserves the actual V1 production order rather than the disposable scaffold", () => {
    expect(fixture.boards.men.slice(0, 10)).toEqual([
      "Jon Jones",
      "Georges St-Pierre",
      "Anderson Silva",
      "Demetrious Johnson",
      "Islam Makhachev",
      "Alexander Volkanovski",
      "Khabib Nurmagomedov",
      "Matt Hughes",
      "Kamaru Usman",
      "Max Holloway",
    ]);

    const men = rowsFor("men");
    const women = rowsFor("women");
    expect(men.map((fighter) => fighter.fighter)).toEqual(fixture.boards.men);
    expect(women.map((fighter) => fighter.fighter)).toEqual(fixture.boards.women);
    expect(men.map((fighter) => fighter.rank)).toEqual(
      Array.from({ length: men.length }, (_, index) => index + 1),
    );
    expect(women.map((fighter) => fighter.rank)).toEqual(
      Array.from({ length: women.length }, (_, index) => index + 1),
    );
  });

  it("keeps every calculated total and tie-break tuple internally consistent", () => {
    fixture.fighters.forEach((fighter) => {
      const weightedBase = Object.values(fighter.weighted).reduce((sum, value) => sum + value, 0);
      const modifierTotal = Object.values(fighter.modifiers).reduce((sum, value) => sum + value, 0);

      expect(fighter.totals.baseScore).toBe(round2(weightedBase));
      expect(fighter.totals.preEraDepthTotalScore).toBe(
        round2(fighter.totals.baseScore + fighter.modifiers.apex + fighter.modifiers.penalty),
      );
      expect(fighter.totals.modifierScore).toBe(round2(modifierTotal));
      expect(fighter.totals.totalScore).toBe(
        round2(fighter.totals.baseScore + fighter.totals.modifierScore),
      );
      expect(fighter.tieBreakers).toEqual({
        totalScore: fighter.totals.totalScore,
        championship: fighter.categories.championship,
        opponentQuality: fighter.categories.opponentQuality,
        fighter: fighter.fighter,
      });
      expect(fighter.penaltyTrace.reconstructedPenalty).toBe(fighter.modifiers.penalty);
    });
  });

  it("preserves the fixed-anchor OVR contract", () => {
    expect(fixture.contract.ovr).toMatchObject({
      floor: 82,
      ceiling: 99,
      curve: 0.85,
      leaderOnly99: true,
    });

    const men = rowsFor("men");
    const women = rowsFor("women");
    expect(men[0]).toMatchObject({ fighter: "Jon Jones", rank: 1, ovr: 99 });
    expect(men.slice(1).some((fighter) => fighter.ovr === 99)).toBe(false);
    expect(women.slice(1).some((fighter) => fighter.ovr === 99)).toBe(false);
  });
});
