import { describe, expect, it } from "vitest";

import {
  calculateFootballCfbCareerGreatness,
  footballCfbScore,
  footballCfbStructurallyUnavailableScore,
  type FootballCfbOlCareerGreatnessInput,
} from "./footballComparisonAuthority";

describe("CFB career greatness evidence regressions", () => {
  it("keeps the result incomplete when normalized OL Peak coexists with unavailable support", () => {
    const input: FootballCfbOlCareerGreatnessInput = {
      pool: "OL",
      peak: {
        nationalOlStandingAllAmerica: footballCfbScore(25),
        majorOlAwardStanding: footballCfbStructurallyUnavailableScore(),
        crossPositionNationalStanding: footballCfbScore(15),
        documentedIndividualDominance: footballCfbScore(10),
        competitionProof: footballCfbScore(5),
        olUnitCentrality: footballCfbScore(5),
      },
      draftEvaluation: { status: "available", band: "top-five" },
      sustain: footballCfbStructurallyUnavailableScore(),
      bigStageImpact: footballCfbScore(5),
    };

    const result = calculateFootballCfbCareerGreatness(input);
    expect(result.peak).toBe(85);
    expect(result.support).toBeNull();
    expect(result.preliminaryTier).toBeNull();
    expect(result.evidenceCompleteness).toBe("incomplete");
    expect(result.reviewFlags).toEqual(expect.arrayContaining([
      "structurally-unavailable-evidence",
      "normalized-structural-evidence",
    ]));
  });
});
