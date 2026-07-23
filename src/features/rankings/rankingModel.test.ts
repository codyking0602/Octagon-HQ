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
  it("loads exactly 80 typed input fighters without calculated ownership fields", () => {
    expect(canonicalRankingInputs.counts).toEqual({ fighters: 80, men: 65, women: 15 });
    expect(canonicalRankingInputs.fighters).toHaveLength(80);
    expect(new Set(canonicalRankingInputs.fighters.map((fighter) => fighter.fighter))).toHaveLength(80);
    expect(new Set(canonicalRankingInputs.fighters.map((fighter) => fighter.presentation.slug))).toHaveLength(80);

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

  it("recalculates every V1 category, modifier, total, rank, OVR, and visible stat", () => {
    expect(calculatedRankingProjection.rows).toHaveLength(80);
    calculatedRankingProjection.rows.forEach((row) => {
      const expected = parityByFighter.get(row.fighter);
      expect(expected, `${row.fighter} must exist in the V1 parity fixture`).toBeDefined();
      const metadata = row.metadata;
      if (
        row.fighter === "Jon Jones" &&
        metadata &&
        metadata.visibleStats.adjustedTitleWins !== expected!.visibleStats.adjustedTitleWins
      ) {
        console.log(
          "JON_TITLE_DIAGNOSTIC",
          JSON.stringify(
            {
              expected: expected!.visibleStats.adjustedTitleWins,
              received: metadata.visibleStats.adjustedTitleWins,
              championshipTraceCredit: metadata.traces.championship.adjustedTitleCredit,
              rows: metadata.input.facts.fights
                .filter(
                  (fight) =>
                    fight.championshipType !== "none" ||
                    fight.championshipManualCredit !== null ||
                    fight.championshipOpponentStrength !== null,
                )
                .map((fight) => ({
                  id: fight.id,
                  result: fight.scoringDisposition,
                  type: fight.championshipType,
                  eligible: fight.championshipEligible,
                  manual: fight.championshipManualCredit,
                  strength: fight.championshipOpponentStrength,
                })),
            },
            null,
            2,
          ),
        );
      }
      expect(row.board, `${row.fighter} board`).toBe(expected!.board);
      expect(row.categories, `${row.fighter} categories`).toEqual(expected!.categories);
      expect(row.modifiers, `${row.fighter} modifiers`).toEqual(expected!.modifiers);
      expect(row.weighted, `${row.fighter} weighted categories`).toEqual(expected!.weighted);
      expect(row.totals, `${row.fighter} totals`).toEqual(expected!.totals);
      expect(row.tieBreakers, `${row.fighter} tie breakers`).toEqual(expected!.tieBreakers);
      expect(row.rank, `${row.fighter} rank`).toBe(expected!.rank);
      expect(row.ovr, `${row.fighter} OVR`).toBe(expected!.ovr);
      expect(row.metadata?.visibleStats, `${row.fighter} visible stats`).toEqual(
        expected!.visibleStats,
      );
    });
  });

  it("preserves the exact men's and women's production boards", () => {
    expect(calculatedRankingProjection.men.map((fighter) => fighter.fighter)).toEqual(
      v1ProductionRankingParityFixture.boards.men,
    );
    expect(calculatedRankingProjection.women.map((fighter) => fighter.fighter)).toEqual(
      v1ProductionRankingParityFixture.boards.women,
    );
    expect(menAllTime).toHaveLength(65);
    expect(womenAllTime).toHaveLength(15);
    expect(allTime).toHaveLength(80);
    expect(menAllTime[0]).toMatchObject({ fighter: "Jon Jones", rank: 1, ovr: 99 });
    expect(womenAllTime[0].fighter).toBe(v1ProductionRankingParityFixture.boards.women[0]);
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
