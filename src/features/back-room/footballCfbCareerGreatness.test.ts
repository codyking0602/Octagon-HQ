import { describe, expect, it } from "vitest";

import {
  calculateFootballCfbCareerGreatness,
  footballCfbCareerGreatnessModels,
  footballCfbKickerPeakComponents,
  footballCfbPunterPeakComponents,
  scoreFootballCfbOlDraftEvaluation,
  type FootballCfbCareerGreatnessInput,
  type FootballCfbCareerGreatnessPoolId,
  type FootballCfbGreatnessComponentSpec,
  type FootballCfbGreatnessEvidence,
} from "./footballComparisonAuthority";

const known = (value: number): FootballCfbGreatnessEvidence => ({ status: "known", value });

function evidenceAtScore(
  components: readonly FootballCfbGreatnessComponentSpec[],
  targetScore: number,
  targetMax: number,
): Record<string, FootballCfbGreatnessEvidence> {
  return Object.fromEntries(components.map((component) => [
    component.id,
    known(component.maxPoints * (targetScore / targetMax)),
  ]));
}

function standardInput(
  poolId: Exclude<FootballCfbCareerGreatnessPoolId, "OL" | "K / P">,
  peak: number,
  support: number,
): FootballCfbCareerGreatnessInput {
  const model = footballCfbCareerGreatnessModels[poolId];
  return {
    poolId,
    peak: evidenceAtScore(model.peakComponents, peak, model.peakMax),
    support: evidenceAtScore(model.supportComponents, support, model.supportMax),
    ...(poolId === "QB" ? { qbNationalTitleAsPrimary: { status: "known" as const, value: false } } : {}),
  };
}

function olInput(basePeak: number, support: number, draft: FootballCfbCareerGreatnessInput["olDraftEvaluation"]): FootballCfbCareerGreatnessInput {
  const model = footballCfbCareerGreatnessModels.OL;
  const nonDraft = model.peakComponents.filter((component) => component.id !== "nfl-draft-evaluation");
  return {
    poolId: "OL",
    peak: evidenceAtScore(nonDraft, basePeak, 80),
    support: evidenceAtScore(model.supportComponents, support, model.supportMax),
    olDraftEvaluation: draft,
  };
}

function specialistInput(role: "K" | "P" | "K/P", kickerPeak: number, punterPeak: number, support: number): FootballCfbCareerGreatnessInput {
  const model = footballCfbCareerGreatnessModels["K / P"];
  return {
    poolId: "K / P",
    peak: {},
    support: evidenceAtScore(model.supportComponents, support, model.supportMax),
    specialistRole: role,
    ...(role !== "P" ? { kickerPeak: evidenceAtScore(footballCfbKickerPeakComponents, kickerPeak, 70) } : {}),
    ...(role !== "K" ? { punterPeak: evidenceAtScore(footballCfbPunterPeakComponents, punterPeak, 70) } : {}),
  };
}

describe("CFB player-career greatness calculator architecture", () => {
  it("locks all nine permanent pools and their component ceilings", () => {
    expect(Object.keys(footballCfbCareerGreatnessModels)).toEqual([
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

    for (const model of Object.values(footballCfbCareerGreatnessModels)) {
      if (model.poolId !== "K / P") {
        expect(model.peakComponents.reduce((sum, component) => sum + component.maxPoints, 0), `${model.poolId} raw Peak`).toBe(model.peakRawMax);
      }
      expect(model.supportComponents.reduce((sum, component) => sum + component.maxPoints, 0), `${model.poolId} Support`).toBe(model.supportMax);
    }
    expect(footballCfbKickerPeakComponents.reduce((sum, component) => sum + component.maxPoints, 0)).toBe(70);
    expect(footballCfbPunterPeakComponents.reduce((sum, component) => sum + component.maxPoints, 0)).toBe(70);
  });

  it("preserves the locked QB title-sensitive and exceptional-resume gates", () => {
    const titleApex = standardInput("QB", 58, 0);
    expect(calculateFootballCfbCareerGreatness({
      ...titleApex,
      qbNationalTitleAsPrimary: { status: "known", value: true },
    }).preliminaryTier).toBe("Tier 1");
    expect(calculateFootballCfbCareerGreatness(titleApex).preliminaryTier).toBeNull();

    expect(calculateFootballCfbCareerGreatness(standardInput("QB", 54, 33)).preliminaryTier).toBe("Tier 1");
    expect(calculateFootballCfbCareerGreatness(standardInput("QB", 54, 14)).preliminaryTier).toBe("Tier 2");
    expect(calculateFootballCfbCareerGreatness(standardInput("QB", 48, 12)).preliminaryTier).toBe("Tier 3");
  });

  it.each([
    ["RB", 67, 10, "Tier 1", 55, 10, "Tier 2", 50, 6, "Tier 3"],
    ["WR", 66, 8, "Tier 1", 58, 8, "Tier 2", 52, 5, "Tier 3"],
    ["TE", 68, 10, "Tier 1", 60, 8, "Tier 2", 54, 5, "Tier 3"],
    ["DL / EDGE", 68, 8, "Tier 1", 61, 8, "Tier 2", 54, 5, "Tier 3"],
    ["LB", 68, 8, "Tier 1", 61, 8, "Tier 2", 54, 5, "Tier 3"],
    ["Secondary", 68, 8, "Tier 1", 60, 8, "Tier 2", 53, 5, "Tier 3"],
  ] as const)(
    "%s honors exact Tier 1/2/3 gate boundaries",
    (poolId, tier1Peak, tier1Support, tier1, tier2Peak, tier2Support, tier2, tier3Peak, tier3Support, tier3) => {
      expect(calculateFootballCfbCareerGreatness(standardInput(poolId, tier1Peak, tier1Support)).preliminaryTier).toBe(tier1);
      expect(calculateFootballCfbCareerGreatness(standardInput(poolId, tier2Peak, tier2Support)).preliminaryTier).toBe(tier2);
      expect(calculateFootballCfbCareerGreatness(standardInput(poolId, tier3Peak, tier3Support)).preliminaryTier).toBe(tier3);
    },
  );

  it("keeps OL draft evaluation to five corroborating points and flags a draft-only tier promotion", () => {
    expect([
      "top-five",
      "top-ten-or-first-ol-round-one",
      "other-first-round",
      "second-round",
      "third-round",
      "later-or-undrafted",
    ].map((value) => scoreFootballCfbOlDraftEvaluation(value as Parameters<typeof scoreFootballCfbOlDraftEvaluation>[0]))).toEqual([5, 4, 3, 2, 1, 0]);

    const result = calculateFootballCfbCareerGreatness(olInput(80, 0, { status: "known", value: "second-round" }));
    expect(result.peak.exact).toBe(82);
    expect(result.preliminaryTier).toBe("Tier 1");
    expect(result.flags).toContain("ol-draft-tier-promotion-review");

    expect(calculateFootballCfbCareerGreatness(olInput(72, 0, { status: "known", value: "later-or-undrafted" })).preliminaryTier).toBe("Tier 2");
    expect(calculateFootballCfbCareerGreatness(olInput(63, 0, { status: "known", value: "later-or-undrafted" })).preliminaryTier).toBe("Tier 3");
  });

  it("does not turn missing evidence into zero when the missing points can change a tier", () => {
    const input = standardInput("TE", 70, 10);
    const result = calculateFootballCfbCareerGreatness({
      ...input,
      peak: {
        ...input.peak,
        "competition-proof": { status: "missing" },
      },
    });

    expect(result.peak.min).toBe(65);
    expect(result.peak.max).toBe(70);
    expect(result.preliminaryTier).toBeNull();
    expect(result.bestPossibleTier).toBe("Tier 1");
    expect(result.worstPossibleTier).toBe("Tier 2");
    expect(result.evidenceCompleteness).toBe("incomplete");
    expect(result.flags).toEqual(expect.arrayContaining([
      "missing-evidence",
      "tier-outcome-sensitive-to-missing-evidence",
    ]));
  });

  it("normalizes structurally unavailable historical specialist evidence instead of scoring it as zero", () => {
    const input = specialistInput("P", 0, 70, 8);
    const punterPeak = { ...input.punterPeak! };
    punterPeak["net-return-suppression"] = { status: "structurally-unavailable" };
    const result = calculateFootballCfbCareerGreatness({ ...input, punterPeak });

    expect(result.peak.exact).toBe(70);
    expect(result.evidenceCompleteness).toBe("structurally-normalized");
    expect(result.flags).toContain("structurally-normalized");
  });

  it("uses the higher K/P branch plus only the locked secondary-branch bonus and caps Peak at 70", () => {
    expect(calculateFootballCfbCareerGreatness(specialistInput("K/P", 64, 61, 15)).peak.exact).toBe(67);
    expect(calculateFootballCfbCareerGreatness(specialistInput("K/P", 68, 65, 15)).peak.exact).toBe(70);
  });

  it("enforces the Secondary special-teams contribution cap", () => {
    const input = standardInput("Secondary", 68, 8);
    expect(() => calculateFootballCfbCareerGreatness({
      ...input,
      secondaryOffenseSpecialTeamsVersatilityPoints: 5.01,
    })).toThrow(/between 0 and 5/);
  });

  it("rejects alternate or NFL-career evidence keys instead of letting them affect CFB greatness", () => {
    const input = standardInput("TE", 68, 10);
    expect(() => calculateFootballCfbCareerGreatness({
      ...input,
      peak: {
        ...input.peak,
        "nfl-career-all-pros": known(99),
      },
    })).toThrow(/canonical component contract/);
  });
});
