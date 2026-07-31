import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "./data/rankingInputs";
import { v1ProductionRankingParityFixture } from "./engine/parityFixture";
import {
  allTime,
  calculatedRankingProjection,
  menAllTime,
  womenAllTime,
} from "./rankingModel";

const parityByFighter = new Map(
  v1ProductionRankingParityFixture.fighters.map((fighter) => [fighter.fighter, fighter]),
);

function calculatedRow(fighter: string) {
  const row = calculatedRankingProjection.rows.find((candidate) => candidate.fighter === fighter);
  if (!row) throw new Error(`Missing calculated row for ${fighter}.`);
  return row;
}

describe("complete calculation-backed ranking model", () => {
  it("loads one typed input per V2 roster fighter without calculated ownership fields", () => {
    expect(canonicalRankingInputs.counts.fighters).toBe(canonicalRankingInputs.fighters.length);
    expect(canonicalRankingInputs.counts.men).toBe(
      canonicalRankingInputs.fighters.filter((fighter) => fighter.board === "men").length,
    );
    expect(canonicalRankingInputs.counts.women).toBe(
      canonicalRankingInputs.fighters.filter((fighter) => fighter.board === "women").length,
    );
    expect(new Set(canonicalRankingInputs.fighters.map((fighter) => fighter.fighter))).toHaveLength(
      canonicalRankingInputs.counts.fighters,
    );
    expect(
      new Set(canonicalRankingInputs.fighters.map((fighter) => fighter.presentation.slug)),
    ).toHaveLength(canonicalRankingInputs.counts.fighters);

    const forbidden = new Set([
      "rank",
      "ovr",
      "overallOvr",
      "totalScore",
      "rawScore",
      "championshipScore",
      "opponentQualityScore",
      "primeDominanceScore",
      "longevityScore",
    ]);
    canonicalRankingInputs.fighters.forEach((fighter) => {
      expect(Object.keys(fighter).filter((field) => forbidden.has(field))).toEqual([]);
    });
  });

  it("preserves every migrated fighter's audited calculations while allowing V2 expansion", () => {
    v1ProductionRankingParityFixture.fighters.forEach((expected) => {
      const row = calculatedRow(expected.fighter);
      expect(row.board, `${row.fighter} board`).toBe(expected.board);
      expect(row.categories, `${row.fighter} categories`).toEqual(expected.categories);
      expect(row.modifiers, `${row.fighter} modifiers`).toEqual(expected.modifiers);
      expect(row.weighted, `${row.fighter} weighted categories`).toEqual(expected.weighted);
      expect(row.totals, `${row.fighter} totals`).toEqual(expected.totals);
      expect(row.tieBreakers, `${row.fighter} tie breakers`).toEqual(expected.tieBreakers);
      expect(row.metadata?.visibleStats, `${row.fighter} visible stats`).toEqual(
        expected.visibleStats,
      );
    });
  });

  it("keeps the migrated board order intact inside the expandable V2 boards", () => {
    const historicalMen = new Set(v1ProductionRankingParityFixture.boards.men);
    const historicalWomen = new Set(v1ProductionRankingParityFixture.boards.women);

    expect(
      calculatedRankingProjection.men
        .map((fighter) => fighter.fighter)
        .filter((fighter) => historicalMen.has(fighter)),
    ).toEqual(v1ProductionRankingParityFixture.boards.men);
    expect(
      calculatedRankingProjection.women
        .map((fighter) => fighter.fighter)
        .filter((fighter) => historicalWomen.has(fighter)),
    ).toEqual(v1ProductionRankingParityFixture.boards.women);
    expect(menAllTime).toHaveLength(canonicalRankingInputs.counts.men);
    expect(womenAllTime).toHaveLength(canonicalRankingInputs.counts.women);
    expect(allTime).toHaveLength(canonicalRankingInputs.counts.fighters);
    expect(menAllTime[0]).toMatchObject({ fighter: "Jon Jones", rank: 1, ovr: 99 });
  });

  it("retains the locked loss-context exceptions from canonical facts", () => {
    const jones = calculatedRow("Jon Jones");
    const hamill = jones.metadata?.traces.penalty.events.find(
      (event) => event.opponent === "Matt Hamill",
    );
    expect(hamill).toMatchObject({
      technicalException: true,
      penaltyEligible: false,
      rawPenalty: 0,
    });

    const volk = calculatedRow("Alexander Volkanovski");
    const islamLosses = volk.metadata?.traces.penalty.events.filter(
      (event) => event.opponent === "Islam Makhachev",
    );
    expect(islamLosses).toHaveLength(2);
    expect(islamLosses?.every((event) => event.upwardDivision && event.elite)).toBe(true);

    const khabib = calculatedRow("Khabib Nurmagomedov");
    expect(khabib.modifiers.penalty).toBe(0);
  });
});
