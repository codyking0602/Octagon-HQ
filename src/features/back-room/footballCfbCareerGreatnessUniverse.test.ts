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
  });

  it("keeps unsupported component evidence unresolved instead of silently scoring it as zero", () => {
    const unresolved = footballCfbCareerGreatnessUniverse.filter((row) => row.reviewFlags.includes("missing-component-evidence"));
    expect(unresolved.length).toBeGreaterThan(0);
    expect(unresolved.every((row) => row.calculation.evidenceCompleteness !== "complete")).toBe(true);
    expect(unresolved.some((row) => row.calculation.peak.min === 0 && row.calculation.peak.max > 0)).toBe(true);
  });

  it("automatically separates historical coverage gaps and tier-sensitive cases for PR 3 review", () => {
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
