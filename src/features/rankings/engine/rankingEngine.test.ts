import { describe, expect, it } from "vitest";
import { v1ProductionRankingParityFixture } from "./parityFixture";
import {
  buildRankingProjection,
  calculateOvr,
  calculateWeightedScore,
  type RankingContract,
} from "./rankingEngine";

const fixture = v1ProductionRankingParityFixture;
const contract: RankingContract = fixture.contract;

describe("pure ranking projection engine", () => {
  it("reproduces every captured V1 weighted total, board rank, and OVR", () => {
    const projection = buildRankingProjection(
      fixture.fighters.map((fighter) => ({
        fighter: fighter.fighter,
        board: fighter.board,
        categories: fighter.categories,
        modifiers: fighter.modifiers,
      })),
      contract,
    );

    expect(projection.men.map((fighter) => fighter.fighter)).toEqual(fixture.boards.men);
    expect(projection.women.map((fighter) => fighter.fighter)).toEqual(fixture.boards.women);

    projection.rows.forEach((actual) => {
      const expected = fixture.fighters.find(
        (fighter) => fighter.fighter === actual.fighter && fighter.board === actual.board,
      );
      expect(expected).toBeDefined();
      expect(actual.weighted).toEqual(expected!.weighted);
      expect(actual.totals).toEqual(expected!.totals);
      expect(actual.tieBreakers).toEqual(expected!.tieBreakers);
      expect(actual.rank).toBe(expected!.rank);
      expect(actual.ovr).toBe(expected!.ovr);
    });
  });

  it("rounds each weighted category before constructing the final score", () => {
    expect(
      calculateWeightedScore(
        {
          championship: 17.13,
          opponentQuality: 18.77,
          primeDominance: 19.44,
          longevity: 12.34,
        },
        { apex: 4.27, penalty: -1.23, eraDepth: 0.38 },
        contract,
      ),
    ).toEqual({
      championship: 19.99,
      opponentQuality: 15.64,
      primeDominance: 19.44,
      longevity: 4.11,
      baseScore: 59.18,
      apex: 4.27,
      penalty: -1.23,
      eraDepth: 0.38,
      preEraDepthTotalScore: 62.22,
      modifierScore: 3.42,
      totalScore: 62.6,
    });
  });

  it("uses total, Championship, Opponent Quality, then fighter name as deterministic tie breakers", () => {
    const projection = buildRankingProjection(
      [
        {
          fighter: "Zulu",
          board: "men",
          categories: {
            championship: 20,
            opponentQuality: 20,
            primeDominance: 20,
            longevity: 20,
          },
          modifiers: { apex: 0, penalty: 0, eraDepth: 0 },
        },
        {
          fighter: "Alpha",
          board: "men",
          categories: {
            championship: 20,
            opponentQuality: 20,
            primeDominance: 20,
            longevity: 20,
          },
          modifiers: { apex: 0, penalty: 0, eraDepth: 0 },
        },
        {
          fighter: "Championship Edge",
          board: "men",
          categories: {
            championship: 21,
            opponentQuality: 18.6,
            primeDominance: 20,
            longevity: 20,
          },
          modifiers: { apex: 0, penalty: 0, eraDepth: 0 },
        },
      ],
      contract,
    );

    expect(projection.men.map((fighter) => fighter.fighter)).toEqual([
      "Championship Edge",
      "Alpha",
      "Zulu",
    ]);
  });

  it("reserves 99 OVR for a board leader", () => {
    expect(calculateOvr(500, "men", 1, contract.ovr)).toBe(99);
    expect(calculateOvr(500, "men", 2, contract.ovr)).toBe(98);
    expect(calculateOvr(-500, "men", 1, contract.ovr)).toBe(82);
  });
});
