import { describe, expect, it } from "vitest";
import { footballKeepCutPacks } from "./footballKeepCutModel";
import { footballRankFivePacks } from "./footballRankFiveModel";
import {
  FOOTBALL_CONTENT_CLASS_RULES,
  footballComparisonContracts,
  getFootballComparisonContract,
  getFootballRatingBand,
} from "./footballContentContract";

const reviewedNflPackIds = [
  "nfl-quarterbacks",
  "nfl-running-backs",
  "nfl-wide-receivers",
  "nfl-head-coaches",
] as const;

describe("Football content contract", () => {
  it("keeps factual, comparative, and subjective truth boundaries distinct", () => {
    expect(FOOTBALL_CONTENT_CLASS_RULES.factual).toMatchObject({
      truthSource: "canonical-factual-owner",
      hardCorrectAnswer: true,
    });
    expect(FOOTBALL_CONTENT_CLASS_RULES.comparative).toMatchObject({
      truthSource: "canonical-comparison-owner",
      hardCorrectAnswer: true,
    });
    expect(FOOTBALL_CONTENT_CLASS_RULES.subjective).toMatchObject({
      truthSource: "calibrated-opinion",
      hardCorrectAnswer: false,
    });
  });

  it("uses one absolute six-band scale for Football comparison ratings", () => {
    expect(getFootballRatingBand(100)).toBe("elite");
    expect(getFootballRatingBand(92)).toBe("elite");
    expect(getFootballRatingBand(91.99)).toBe("great");
    expect(getFootballRatingBand(82)).toBe("great");
    expect(getFootballRatingBand(81.99)).toBe("good");
    expect(getFootballRatingBand(70)).toBe("good");
    expect(getFootballRatingBand(69.99)).toBe("average");
    expect(getFootballRatingBand(55)).toBe("average");
    expect(getFootballRatingBand(54.99)).toBe("below-average");
    expect(getFootballRatingBand(35)).toBe("below-average");
    expect(getFootballRatingBand(34.99)).toBe("bad");
    expect(getFootballRatingBand(0)).toBe("bad");
    expect(() => getFootballRatingBand(-1)).toThrow();
    expect(() => getFootballRatingBand(101)).toThrow();
  });

  it("requires every current comparison pack to declare a versioned contract", () => {
    const packIds = footballRankFivePacks.map((pack) => pack.id).sort();
    expect(Object.keys(footballComparisonContracts).sort()).toEqual(packIds);

    for (const pack of footballRankFivePacks) {
      const contract = getFootballComparisonContract(pack.id);
      expect(contract.packId).toBe(pack.id);
      expect(contract.contentClass).toBe("comparative");
      expect(contract.methodologyVersion).toMatch(/-v\d+$/);
      expect(contract.question.length).toBeGreaterThan(20);
      expect(contract.scope.length).toBeGreaterThan(40);
      expect(contract.evidenceRequirements).toEqual([
        "factual-resume",
        "era-and-context",
        "whole-pool-calibration",
        "pairwise-sanity-check",
      ]);
      expect(contract.evidenceSummary.length).toBeGreaterThan(40);
    }
  });

  it("marks the PR2 NFL career packs reviewed with complete 100-point rubrics", () => {
    for (const packId of reviewedNflPackIds) {
      const contract = getFootballComparisonContract(packId);
      expect(contract.evidenceStatus).toBe("reviewed");
      expect(contract.evidenceCutoff).toBe("through-2025-season");
      expect(contract.rubric).not.toBeNull();
      expect(contract.rubric?.reduce((sum, component) => sum + component.weight, 0)).toBe(100);
      expect(new Set(contract.rubric?.map((component) => component.id)).size).toBe(contract.rubric?.length);
    }
  });

  it("keeps the CFB legacy packs pending until their dedicated review PR", () => {
    for (const packId of ["college-quarterbacks", "college-programs", "college-team-seasons"] as const) {
      const contract = getFootballComparisonContract(packId);
      expect(contract.evidenceStatus).toBe("legacy-authored-pending-review");
      expect(contract.rubric).toBeNull();
    }
  });

  it("keeps Keep 4 / Cut 4 on the same comparison pack truth as Blind Rank 5", () => {
    expect(footballKeepCutPacks.map((pack) => pack.id)).toEqual(
      footballRankFivePacks.map((pack) => pack.id),
    );

    for (const pack of footballKeepCutPacks) {
      expect(getFootballComparisonContract(pack.id).packId).toBe(pack.id);
    }
  });
});
