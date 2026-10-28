import { describe, expect, it } from "vitest";

import {
  footballCfbCareerGreatnessUniverse,
  footballCfbCareerGreatnessUniverseHealthFloors,
  footballCfbCareerGreatnessUniversePoolCounts,
} from "./footballCfbCareerGreatnessUniverse";

describe("CFB career greatness full-universe calculation", () => {
  it("runs the complete recognizable Stage 12 CFB player-career universe through the nine permanent pools", () => {
    const ids = footballCfbCareerGreatnessUniverse.map((row) => row.subjectId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(425);

    for (const [poolId, minimum] of Object.entries(footballCfbCareerGreatnessUniverseHealthFloors)) {
      expect(footballCfbCareerGreatnessUniversePoolCounts[poolId as keyof typeof footballCfbCareerGreatnessUniversePoolCounts], poolId)
        .toBeGreaterThanOrEqual(minimum);
    }
  });

  it("keeps recognizability as membership metadata rather than a greatness score input", () => {
    expect(footballCfbCareerGreatnessUniverse.every((row) => ["A", "B", "C"].includes(row.recognizabilityTier))).toBe(true);
    for (const row of footballCfbCareerGreatnessUniverse) {
      expect(row.calculation.poolId).toBe(row.poolId);
      expect(row.calculation).not.toHaveProperty("recognizabilityTier");
      expect(row.calculation).not.toHaveProperty("total");
    }
  });

  it("uses only canonical CFB factual metric ids and never imports NFL career performance", () => {
    const factBacked = footballCfbCareerGreatnessUniverse.filter((row) => row.canonicalFactMetricIds.length > 0);
    expect(factBacked.length).toBeGreaterThan(0);
    expect(factBacked.every((row) => row.canonicalFactMetricIds.every((metricId) => metricId.startsWith("cfb-")))).toBe(true);
    expect(factBacked.every((row) => row.consumedFactMetricIds.every((metricId) => metricId.startsWith("cfb-")))).toBe(true);
  });

  it("actually consumes modern and pre-2014 best-season facts instead of blanking every Peak component", () => {
    const byId = new Map(footballCfbCareerGreatnessUniverse.map((row) => [row.subjectId, row]));
    const burrow = byId.get("cfb-joe-burrow");
    const henry = byId.get("cfb-derrick-henry");
    const smith = byId.get("cfb-devonta-smith");
    const donald = byId.get("cfb-aaron-donald");

    expect(burrow?.factBackedComponentIds).toEqual(expect.arrayContaining([
      "passing-efficiency-dominance",
      "total-offensive-value",
      "scoring-creation",
    ]));
    expect(burrow?.calculation.peak.min).toBeGreaterThan(0);
    expect(henry?.factBackedComponentIds).toContain("rushing-dominance");
    expect(henry?.calculation.peak.min).toBeGreaterThan(0);
    expect(smith?.factBackedComponentIds).toEqual(expect.arrayContaining([
      "receiving-dominance",
      "efficiency-explosiveness",
      "scoring-dominance",
    ]));
    expect(smith?.calculation.peak.min).toBeGreaterThan(0);

    expect(donald?.canonicalFactMetricIds).toEqual(expect.arrayContaining([
      "cfb-best-season-sacks",
      "cfb-best-season-tackles-for-loss",
    ]));
    expect(donald?.factBackedComponentIds).toContain("backfield-disruption");
    expect(donald?.calculation.peak.min).toBeGreaterThan(0);
    expect(donald?.reviewFlags).not.toContain("missing-historical-evidence");
  });

  it("does not turn career accumulation into Peak when only best-season proof belongs there", () => {
    const burrow = footballCfbCareerGreatnessUniverse.find((row) => row.subjectId === "cfb-joe-burrow");
    expect(burrow?.canonicalFactMetricIds).toContain("cfb-career-passing-yards");
    expect(burrow?.consumedFactMetricIds).not.toContain("cfb-career-passing-yards");
    expect(burrow?.unconsumedCanonicalFactMetricIds).toContain("cfb-career-passing-yards");
  });

  it("keeps unsupported component evidence unresolved instead of silently scoring it as zero", () => {
    const unresolved = footballCfbCareerGreatnessUniverse.filter((row) => row.reviewFlags.includes("missing-component-evidence"));
    expect(unresolved.length).toBeGreaterThan(0);
    expect(unresolved.every((row) => row.calculation.evidenceCompleteness !== "complete")).toBe(true);
    expect(unresolved.some((row) => row.calculation.peak.min === 0 && row.calculation.peak.max > 0)).toBe(true);
  });

  it("automatically separates true historical gaps and tier-sensitive cases for targeted review", () => {
    expect(footballCfbCareerGreatnessUniverse.some((row) => row.reviewFlags.includes("missing-historical-evidence"))).toBe(true);
    expect(footballCfbCareerGreatnessUniverse.some((row) => row.reviewFlags.includes("tier-boundary-review"))).toBe(true);
  });

  it("does not manually assign Tier 1-3 when missing point evidence can change the outcome", () => {
    const tierSensitive = footballCfbCareerGreatnessUniverse.filter((row) => (
      row.calculation.bestPossibleTier !== row.calculation.worstPossibleTier
    ));
    expect(tierSensitive.length).toBeGreaterThan(0);
    expect(tierSensitive.every((row) => row.calculation.preliminaryTier == null)).toBe(true);
  });
});
