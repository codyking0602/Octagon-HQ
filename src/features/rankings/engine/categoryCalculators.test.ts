import { describe, expect, it } from "vitest";
import {
  calculateApex,
  calculateChampionship,
  calculateEraDepth,
  calculateEraDepthCurve,
  calculateLongevity,
  calculateLossContext,
  calculateOpponentQuality,
  calculatePrimeDominance,
  calculateRawLossPenalty,
} from "./categoryCalculators";
import type { CanonicalFight } from "./schemas";

function fight(
  overrides: Partial<CanonicalFight> & Pick<CanonicalFight, "id" | "date">,
): CanonicalFight {
  return {
    id: overrides.id,
    date: overrides.date,
    opponent: overrides.opponent ?? `Opponent ${overrides.id}`,
    officialResult: overrides.officialResult ?? "win",
    scoringDisposition: overrides.scoringDisposition ?? "count-win",
    methodCategory: overrides.methodCategory ?? "decision",
    qualityTier: overrides.qualityTier ?? "none",
    championshipType: overrides.championshipType ?? "none",
    rounds: {
      status: overrides.rounds?.status ?? "audited",
      won: overrides.rounds?.won ?? 3,
      lost: overrides.rounds?.lost ?? 0,
      drawn: overrides.rounds?.drawn ?? 0,
    },
    ...(overrides.lossClassification
      ? { lossClassification: overrides.lossClassification }
      : {}),
  };
}

describe("pure V1 category calculations", () => {
  it("calculates Championship, Opponent Quality, and Peak Apex from judgment inputs", () => {
    expect(
      calculateChampionship({
        fighter: "Test Champion",
        benchmarkCredit: 20,
        inputs: [{ finalAdjustedCredit: 6 }, { finalAdjustedCredit: 4 }],
      }),
    ).toMatchObject({
      score: 15,
      adjustedTitleCredit: 10,
    });

    const opponentQuality = calculateOpponentQuality({
      fighter: "Test Opponent Quality",
      benchmarkCredit: 6.75,
      inputs: Array.from({ length: 7 }, (_, index) => ({
        opponent: `Opponent ${index + 1}`,
        date: `2020-01-${String(index + 1).padStart(2, "0")}`,
        finalCredit: 1,
      })),
    });
    expect(opponentQuality.score).toBe(30);
    expect(opponentQuality.diminishedCredit).toBe(6.75);
    expect(opponentQuality.inputs.at(-1)).toMatchObject({ slot: 7, countedRate: 0.75 });

    expect(
      calculateApex({
        fighter: "Test Apex",
        performances: [
          { fightId: "fight-1", rating: 9 },
          { fightId: "fight-2", rating: 8 },
        ],
        components: {
          twoPerformanceStrength: 1.7,
          proof: 1.5,
          bestFighterClaim: 1.2,
          aura: 0.8,
        },
      }),
    ).toMatchObject({
      score: 5.2,
      ratingsAverage: 8.5,
      formulaTwoPerformanceStrength: 1.7,
      twoPerformanceDifference: 0,
    });
  });

  it("applies the locked 9/9/5/7 Prime Dominance formula and sample multiplier", () => {
    const result = calculatePrimeDominance({
      fighter: "One Fight Prime",
      window: { start: "2021-01-01", end: "2021-01-01" },
      fights: [
        fight({
          id: "prime-1",
          date: "2021-01-01",
          opponent: "Elite Opponent",
          qualityTier: "champion-level",
          methodCategory: "ko-tko",
        }),
      ],
    });

    expect(result.score).toBe(19.17);
    expect(result.stats).toMatchObject({
      scoredFightCount: 1,
      finishWins: 1,
      rawScore: 27.38,
      baseSampleMultiplier: 0.7,
      sampleMultiplier: 0.7,
    });
    expect(result.stats.components).toEqual({
      primeRecord: 9,
      roundControl: 9,
      finishPressure: 5,
      eliteLevelValidation: 4.38,
    });
  });

  it("preserves tournament compression and the four-sample elite-density floor", () => {
    const result = calculatePrimeDominance({
      fighter: "Dense Elite Prime",
      window: { start: "2020-01-01", end: "2023-01-01" },
      fights: [
        fight({ id: "elite-1", date: "2020-01-01", qualityTier: "top-five" }),
        fight({ id: "elite-2", date: "2021-01-01", qualityTier: "top-five" }),
        fight({ id: "elite-3", date: "2022-01-01", qualityTier: "top-five" }),
        fight({ id: "elite-4", date: "2023-01-01", qualityTier: "top-five" }),
      ],
    });

    expect(result.stats).toMatchObject({
      effectivePrimeSampleCount: 4,
      longestConsecutiveEliteSamples: 4,
      baseSampleMultiplier: 0.85,
      sampleMultiplier: 0.9,
      eliteDensityFloorApplied: true,
    });

    const tournament = calculatePrimeDominance({
      fighter: "Tournament Prime",
      window: { start: "1999-01-01", end: null },
      fights: [
        fight({
          id: "tournament-semi",
          date: "1999-01-01",
          championshipType: "tournament",
        }),
        fight({
          id: "tournament-final",
          date: "1999-01-01",
          championshipType: "tournament",
        }),
      ],
    });

    expect(tournament.stats).toMatchObject({
      scoredFightCount: 2,
      effectivePrimeSampleCount: 1,
      tournamentEventCount: 1,
      tournamentBoutCount: 2,
      compressedTournamentBoutCount: 1,
    });
    expect(tournament.stats.eliteLevelValidation.volumeUnits).toBe(1.5);
  });

  it("caps longevity gaps at 18 months and keeps no contests as activity anchors", () => {
    const result = calculateLongevity({
      fighter: "Longevity Test",
      window: { start: "2020-01-01", end: "2022-01-01" },
      modelAsOfDate: "2026-07-13",
      statusMultiplier: 1,
      divisionMultiplier: 1,
      fights: [
        fight({ id: "anchor-1", date: "2020-01-01" }),
        fight({
          id: "anchor-2",
          date: "2022-01-01",
          officialResult: "no-contest",
          scoringDisposition: "excluded-no-contest",
        }),
      ],
    });

    expect(result.score).toBe(3.75);
    expect(result.stats).toMatchObject({
      fightCount: 2,
      activityIncludesNoContestAnchors: true,
      gapAdjustedMonths: 18,
      activeEliteYears: 1.5,
      cappedGapCount: 1,
      countedEliteMonths: 18,
    });
  });

  it("implements every locked per-loss rule including upward-division relief", () => {
    expect(
      calculateRawLossPenalty({
        phase: "pre-prime",
        elite: true,
        finished: false,
        upwardDivision: false,
        penaltyEligible: true,
      }),
    ).toEqual({ base: -0.75, finishExtra: 0, rawPenalty: -0.75 });

    expect(
      calculateRawLossPenalty({
        phase: "pre-prime",
        elite: false,
        finished: false,
        upwardDivision: false,
        penaltyEligible: true,
      }),
    ).toEqual({ base: -1.25, finishExtra: 0, rawPenalty: -1.25 });

    expect(
      calculateRawLossPenalty({
        phase: "prime",
        elite: false,
        finished: true,
        upwardDivision: false,
        penaltyEligible: true,
      }),
    ).toEqual({ base: -4, finishExtra: -0.75, rawPenalty: -4.75 });

    expect(
      calculateRawLossPenalty({
        phase: "prime",
        elite: true,
        finished: true,
        upwardDivision: true,
        penaltyEligible: true,
      }),
    ).toEqual({ base: -0.75, finishExtra: -0.5, rawPenalty: -1.25 });

    expect(
      calculateRawLossPenalty({
        phase: "post-prime",
        elite: false,
        finished: true,
        upwardDivision: false,
        penaltyEligible: true,
      }),
    ).toEqual({ base: 0, finishExtra: 0, rawPenalty: 0 });
  });

  it("aggregates severity, frequency, prime volume, technical exceptions, and division discount", () => {
    const result = calculateLossContext({
      fighter: "Loss Context Test",
      window: { start: "2020-01-01", end: "2024-01-01" },
      divisionMultiplier: 1.1,
      fights: [
        fight({
          id: "pre-elite-loss",
          date: "2019-01-01",
          officialResult: "loss",
          scoringDisposition: "count-loss",
          qualityTier: "top-five",
          rounds: { status: "audited", won: 1, lost: 2, drawn: 0 },
        }),
        fight({
          id: "prime-non-elite-finish",
          date: "2021-01-01",
          officialResult: "loss",
          scoringDisposition: "count-loss",
          methodCategory: "ko-tko",
          rounds: { status: "audited", won: 0, lost: 1, drawn: 0 },
        }),
        fight({
          id: "prime-upward-elite-finish",
          date: "2022-01-01",
          officialResult: "loss",
          scoringDisposition: "count-loss",
          qualityTier: "champion-level",
          methodCategory: "submission",
          lossClassification: { divisionContext: "upward" },
          rounds: { status: "audited", won: 0, lost: 1, drawn: 0 },
        }),
        fight({
          id: "technical-dq",
          date: "2023-01-01",
          officialResult: "loss",
          scoringDisposition: "technical-exception",
          methodCategory: "dq",
          rounds: { status: "audited", won: 0, lost: 0, drawn: 0 },
        }),
      ],
    });

    expect(result).toMatchObject({
      penalty: -4.68,
      exposure: 4,
      severity: 3,
      frequency: 2.5,
      primeVolumeFloor: 2,
      preDivision: 5.5,
      divisionDiscountPct: 0.15,
    });
    expect(result.events.find((event) => event.fightId === "technical-dq")).toMatchObject({
      technicalException: true,
      penaltyEligible: false,
      rawPenalty: 0,
    });
  });

  it("uses the locked era-depth curve unless an approved resolution exists", () => {
    expect(calculateEraDepthCurve(1.05)).toBe(0.75);
    expect(calculateEraDepthCurve(0.85)).toBe(-1.39);
    expect(
      calculateEraDepth({
        fighter: "Resolved Era",
        depthIndex: 0.85,
        approvedAdjustment: -0.5,
      }),
    ).toEqual({
      fighter: "Resolved Era",
      adjustment: -0.5,
      depthIndex: 0.85,
      recomputedAdjustment: -1.39,
      resolutionApplied: true,
    });
  });
});
