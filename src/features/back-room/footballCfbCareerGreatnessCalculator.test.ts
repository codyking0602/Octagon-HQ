import { describe, expect, it } from "vitest";

import {
  calculateFootballCfbCareerGreatness,
  calculateFootballCfbRbSustain,
  calculateFootballCfbWrSustain,
  footballCfbCareerGreatnessPoolSpecs,
  footballCfbMissingScore,
  footballCfbScore,
  footballCfbStructurallyUnavailableScore,
  scoreFootballCfbOlDraftEvaluation,
  type FootballCfbDlEdgeCareerGreatnessInput,
  type FootballCfbKickerPeakInput,
  type FootballCfbKpCareerGreatnessInput,
  type FootballCfbLbCareerGreatnessInput,
  type FootballCfbOlCareerGreatnessInput,
  type FootballCfbQbCareerGreatnessInput,
  type FootballCfbRbCareerGreatnessInput,
  type FootballCfbScoreEvidence,
  type FootballCfbSecondaryCareerGreatnessInput,
  type FootballCfbTeCareerGreatnessInput,
  type FootballCfbWrCareerGreatnessInput,
} from "./footballComparisonAuthority";

type Maximums = Readonly<Record<string, number>>;

type EvidenceFor<T extends Maximums> = {
  readonly [K in keyof T]: FootballCfbScoreEvidence;
};

function peakAt<T extends Maximums>(maximums: T, target: number): EvidenceFor<T> {
  const total = Object.values(maximums).reduce((sum, value) => sum + value, 0);
  return Object.fromEntries(
    Object.entries(maximums).map(([key, max]) => [key, footballCfbScore(max * target / total)]),
  ) as EvidenceFor<T>;
}

function standardSupport(total: number) {
  const sustain = Math.min(10, total);
  const awardsNationalStanding = Math.min(15, Math.max(0, total - sustain));
  const bigStageImpact = Math.min(5, Math.max(0, total - sustain - awardsNationalStanding));
  expect(sustain + awardsNationalStanding + bigStageImpact).toBeCloseTo(total, 10);
  return {
    sustain: footballCfbScore(sustain),
    awardsNationalStanding: footballCfbScore(awardsNationalStanding),
    bigStageImpact: footballCfbScore(bigStageImpact),
  };
}

function qbInput(peak: number, support: number, nationalTitleAsPrimaryQb = false): FootballCfbQbCareerGreatnessInput {
  const sustain = Math.min(10, support);
  const awardsNationalStanding = Math.min(15, Math.max(0, support - sustain));
  const winningPostseason = Math.min(15, Math.max(0, support - sustain - awardsNationalStanding));
  expect(sustain + awardsNationalStanding + winningPostseason).toBeCloseTo(support, 10);
  return {
    pool: "QB",
    peak: peakAt(footballCfbCareerGreatnessPoolSpecs.QB.peakComponentMaximums, peak),
    sustain: footballCfbScore(sustain),
    awardsNationalStanding: footballCfbScore(awardsNationalStanding),
    winningPostseason: footballCfbScore(winningPostseason),
    nationalTitleAsPrimaryQb,
  };
}

function rbInput(peak: number, support: number): FootballCfbRbCareerGreatnessInput {
  return {
    pool: "RB",
    peak: peakAt(footballCfbCareerGreatnessPoolSpecs.RB.peakComponentMaximums, peak),
    ...standardSupport(support),
  };
}

function wrInput(peak: number, support: number): FootballCfbWrCareerGreatnessInput {
  return {
    pool: "WR",
    peak: peakAt(footballCfbCareerGreatnessPoolSpecs.WR.peakComponentMaximums, peak),
    ...standardSupport(support),
  };
}

function teInput(peak: number, support: number): FootballCfbTeCareerGreatnessInput {
  return {
    pool: "TE",
    peak: peakAt(footballCfbCareerGreatnessPoolSpecs.TE.peakComponentMaximums, peak),
    ...standardSupport(support),
  };
}

function dlInput(peak: number, support: number): FootballCfbDlEdgeCareerGreatnessInput {
  return {
    pool: "DL / EDGE",
    peak: peakAt(footballCfbCareerGreatnessPoolSpecs["DL / EDGE"].peakComponentMaximums, peak),
    ...standardSupport(support),
  };
}

function lbInput(peak: number, support: number): FootballCfbLbCareerGreatnessInput {
  return {
    pool: "LB",
    peak: peakAt(footballCfbCareerGreatnessPoolSpecs.LB.peakComponentMaximums, peak),
    ...standardSupport(support),
  };
}

function secondaryInput(peak: number, support: number): FootballCfbSecondaryCareerGreatnessInput {
  return {
    pool: "Secondary",
    peak: peakAt(footballCfbCareerGreatnessPoolSpecs.Secondary.peakComponentMaximums, peak),
    ...standardSupport(support),
  };
}

function kickerPeakAt(target: number): FootballCfbKickerPeakInput {
  return peakAt(footballCfbCareerGreatnessPoolSpecs["K / P"].kickerPeakComponentMaximums, target);
}

function kpInput(peak: number, support: number): FootballCfbKpCareerGreatnessInput {
  return {
    pool: "K / P",
    kickerPeak: kickerPeakAt(peak),
    punterPeak: null,
    ...standardSupport(support),
  };
}

describe("CFB career greatness calculator authority", () => {
  it("locks the nine permanent pool shapes without creating an official hidden overall score", () => {
    expect(Object.keys(footballCfbCareerGreatnessPoolSpecs)).toEqual([
      "QB",
      "RB",
      "WR",
      "TE",
      "OL",
      "DL / EDGE",
      "LB",
      "Secondary",
      "K / P",
    ]);
    expect(footballCfbCareerGreatnessPoolSpecs.QB.peakMax).toBe(60);
    expect(footballCfbCareerGreatnessPoolSpecs.QB.supportMax).toBe(40);
    expect(footballCfbCareerGreatnessPoolSpecs.OL.peakMax).toBe(85);
    expect(footballCfbCareerGreatnessPoolSpecs.OL.supportMax).toBe(15);
    for (const pool of ["RB", "WR", "TE", "DL / EDGE", "LB", "Secondary", "K / P"] as const) {
      expect(footballCfbCareerGreatnessPoolSpecs[pool].peakMax).toBe(70);
      expect(footballCfbCareerGreatnessPoolSpecs[pool].supportMax).toBe(30);
    }

    const result = calculateFootballCfbCareerGreatness(wrInput(63, 14));
    expect(result).toMatchObject({ peak: 63, support: 14, preliminaryTier: 1 });
    expect(result).not.toHaveProperty("overall");
    expect(result).not.toHaveProperty("rating");
    expect(result).not.toHaveProperty("recognizabilityTier");
  });

  it("preserves the locked QB title, support, and exceptional-resume routes", () => {
    const titleOnly = qbInput(58, 0, true);
    expect(calculateFootballCfbCareerGreatness(titleOnly).preliminaryTier).toBe(1);

    const belowTitlePeak = qbInput(57.99, 15, true);
    expect(calculateFootballCfbCareerGreatness(belowTitlePeak).preliminaryTier).toBe(2);

    const titleWithRepeatStanding = qbInput(54, 17, true);
    expect(calculateFootballCfbCareerGreatness(titleWithRepeatStanding).preliminaryTier).toBe(1);

    const noTitleApexResume = qbInput(54, 33, false);
    expect(calculateFootballCfbCareerGreatness(noTitleApexResume).preliminaryTier).toBe(1);
    expect(calculateFootballCfbCareerGreatness(qbInput(54, 14, false)).preliminaryTier).toBe(2);
    expect(calculateFootballCfbCareerGreatness(qbInput(48, 12, false)).preliminaryTier).toBe(3);
    expect(calculateFootballCfbCareerGreatness(qbInput(45, 27, false)).preliminaryTier).toBe(3);
  });

  it.each([
    ["RB", () => rbInput(67, 10), () => rbInput(55, 10), () => rbInput(50, 6)],
    ["WR", () => wrInput(66, 8), () => wrInput(58, 8), () => wrInput(52, 5)],
    ["TE", () => teInput(68, 10), () => teInput(60, 8), () => teInput(54, 5)],
    ["DL / EDGE", () => dlInput(68, 8), () => dlInput(61, 8), () => dlInput(54, 5)],
    ["LB", () => lbInput(68, 8), () => lbInput(61, 8), () => lbInput(54, 5)],
    ["Secondary", () => secondaryInput(68, 8), () => secondaryInput(60, 8), () => secondaryInput(53, 5)],
    ["K / P", () => kpInput(68, 8), () => kpInput(60, 8), () => kpInput(53, 5)],
  ] as const)("holds the locked %s Tier 1/2/3 first-route boundaries", (_pool, tier1, tier2, tier3) => {
    expect(calculateFootballCfbCareerGreatness(tier1()).preliminaryTier).toBe(1);
    expect(calculateFootballCfbCareerGreatness(tier2()).preliminaryTier).toBe(2);
    expect(calculateFootballCfbCareerGreatness(tier3()).preliminaryTier).toBe(3);
  });

  it("encodes RB/WR repeat-season diminishing returns instead of raw longevity", () => {
    expect(calculateFootballCfbRbSustain(footballCfbScore(52), footballCfbScore(48))).toEqual(footballCfbScore(10));
    expect(calculateFootballCfbRbSustain(footballCfbScore(48), footballCfbScore(44))).toEqual(footballCfbScore(7));
    expect(calculateFootballCfbWrSustain(footballCfbScore(60), footballCfbScore(56))).toEqual(footballCfbScore(10));
    expect(calculateFootballCfbWrSustain(footballCfbScore(56), footballCfbScore(52))).toEqual(footballCfbScore(7));
  });

  it("keeps unknown evidence unknown rather than silently converting it to zero", () => {
    const input = wrInput(66, 8);
    const result = calculateFootballCfbCareerGreatness({
      ...input,
      peak: { ...input.peak, receivingDominance: footballCfbMissingScore() },
    });

    expect(result.peak).toBeNull();
    expect(result.preliminaryTier).toBeNull();
    expect(result.evidenceCompleteness).toBe("incomplete");
    expect(result.reviewFlags).toContain("missing-evidence");
  });

  it("normalizes only the locked OL/K-P structural-evidence exceptions and flags the normalization", () => {
    const ol: FootballCfbOlCareerGreatnessInput = {
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
      sustain: footballCfbScore(10),
      bigStageImpact: footballCfbScore(5),
    };
    const olResult = calculateFootballCfbCareerGreatness(ol);
    expect(olResult.peak).toBeCloseTo(85, 10);
    expect(olResult.evidenceCompleteness).toBe("normalized-structural");
    expect(olResult.reviewFlags).toEqual(expect.arrayContaining([
      "structurally-unavailable-evidence",
      "normalized-structural-evidence",
    ]));

    const kp: FootballCfbKpCareerGreatnessInput = {
      pool: "K / P",
      kickerPeak: null,
      punterPeak: {
        grossDistanceDominance: footballCfbScore(20),
        fieldPositionPlacement: footballCfbScore(20),
        netReturnSuppression: footballCfbStructurallyUnavailableScore(),
        workloadRepeatExecution: footballCfbScore(5),
        eraRelativeDominance: footballCfbScore(5),
        competitionProof: footballCfbScore(5),
      },
      ...standardSupport(8),
    };
    const kpResult = calculateFootballCfbCareerGreatness(kp);
    expect(kpResult.punterPeak).toBeCloseTo(70, 10);
    expect(kpResult.reviewFlags).toContain("normalized-structural-evidence");
  });

  it("maps OL draft corroboration exactly and flags a tier manufactured by draft credit", () => {
    expect(scoreFootballCfbOlDraftEvaluation({ status: "available", band: "top-five" })).toEqual(footballCfbScore(5));
    expect(scoreFootballCfbOlDraftEvaluation({ status: "available", band: "top-ten-or-first-ol-round-one" })).toEqual(footballCfbScore(4));
    expect(scoreFootballCfbOlDraftEvaluation({ status: "available", band: "other-first-round" })).toEqual(footballCfbScore(3));
    expect(scoreFootballCfbOlDraftEvaluation({ status: "available", band: "second-round" })).toEqual(footballCfbScore(2));
    expect(scoreFootballCfbOlDraftEvaluation({ status: "available", band: "third-round" })).toEqual(footballCfbScore(1));
    expect(scoreFootballCfbOlDraftEvaluation({ status: "available", band: "later-or-undrafted" })).toEqual(footballCfbScore(0));

    const regularMaximums = {
      nationalOlStandingAllAmerica: 25,
      majorOlAwardStanding: 20,
      crossPositionNationalStanding: 15,
      documentedIndividualDominance: 10,
      competitionProof: 5,
      olUnitCentrality: 5,
    } as const;
    const input: FootballCfbOlCareerGreatnessInput = {
      pool: "OL",
      peak: peakAt(regularMaximums, 77),
      draftEvaluation: { status: "available", band: "top-five" },
      sustain: footballCfbScore(0),
      bigStageImpact: footballCfbScore(0),
    };
    const result = calculateFootballCfbCareerGreatness(input);
    expect(result.peak).toBeCloseTo(82, 10);
    expect(result.preliminaryTier).toBe(1);
    expect(result.reviewFlags).toContain("ol-draft-tier-dependence");
  });

  it("uses the higher K/P branch plus the locked capped secondary-role bonus", () => {
    const dual: FootballCfbKpCareerGreatnessInput = {
      pool: "K / P",
      kickerPeak: kickerPeakAt(60),
      punterPeak: peakAt(footballCfbCareerGreatnessPoolSpecs["K / P"].punterPeakComponentMaximums, 56),
      ...standardSupport(8),
    };
    const result = calculateFootballCfbCareerGreatness(dual);
    expect(result.kickerPeak).toBeCloseTo(60, 10);
    expect(result.punterPeak).toBeCloseTo(56, 10);
    expect(result.dualRoleBonus).toBe(2);
    expect(result.peak).toBeCloseTo(62, 10);
  });

  it("enforces Secondary return/offense value as a bounded versatility aid, not a GOAT shortcut", () => {
    const input = secondaryInput(60, 24);
    expect(() => calculateFootballCfbCareerGreatness({
      ...input,
      offenseSpecialTeamsVersatilityPoints: 6,
    })).toThrow(/between 0 and 5/);

    const peakKeys = Object.keys(footballCfbCareerGreatnessPoolSpecs.Secondary.peakComponentMaximums);
    expect(peakKeys).toContain("coverageDominanceSuppression");
    expect(peakKeys).not.toContain("interceptions");
  });

  it("has no NFL-career input path, so NFL aura cannot change CFB greatness", () => {
    const input = teInput(64, 15);
    const withNflAura = { ...input, nflCareerAllPros: 10, nflCareerHallOfFame: true };
    expect(calculateFootballCfbCareerGreatness(withNflAura)).toEqual(calculateFootballCfbCareerGreatness(input));
  });
});
