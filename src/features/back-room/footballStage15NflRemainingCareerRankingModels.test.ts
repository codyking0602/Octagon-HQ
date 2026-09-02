import { describe, expect, it } from "vitest";

import {
  buildFootballComparisonCandidatePool,
  buildFootballNflCareerFamilyCandidatePool,
  footballNflCareerRankingFamilyModels,
  type FootballNflCareerRankingFamilyId,
} from "./footballComparisonAuthority";
import { getFootballFact } from "./footballFactualStatsCore";
import { FOOTBALL_RANKING_FRAMEWORK_VERSION } from "./footballRankingFramework";
import { getFootballSubject } from "./footballSubjectRegistry";

const familyPositions: Readonly<Record<FootballNflCareerRankingFamilyId, readonly string[]>> = {
  OL: ["OL"],
  "DL / EDGE": ["DL"],
  LB: ["LB"],
  Secondary: ["DB"],
  "K / P": ["K", "P"],
};

function metricIdsFor(familyId: FootballNflCareerRankingFamilyId, position: string) {
  const spec = footballNflCareerRankingFamilyModels[familyId].positionSpecs[position as "OL" | "DL" | "LB" | "DB" | "K" | "P"];
  expect(spec, `${familyId}:${position} score profile`).toBeDefined();
  return spec!.metrics.map((metric) => metric.metricId);
}

describe("Football Stage 15 NFL remaining career ranking models", () => {
  it("defines one canonical Stage 15 family model for OL, each defensive family, and K/P", () => {
    expect(FOOTBALL_RANKING_FRAMEWORK_VERSION).toBe("stage15-v4");
    expect(Object.keys(footballNflCareerRankingFamilyModels)).toEqual([
      "OL",
      "DL / EDGE",
      "LB",
      "Secondary",
      "K / P",
    ]);

    for (const [familyId, positions] of Object.entries(familyPositions) as [FootballNflCareerRankingFamilyId, readonly string[]][]) {
      const model = footballNflCareerRankingFamilyModels[familyId];
      expect(model.positions).toEqual(positions);
      for (const position of positions) {
        const spec = model.positionSpecs[position as "OL" | "DL" | "LB" | "DB" | "K" | "P"]!;
        expect(spec.query).toMatchObject({ kind: "player-career", league: "NFL", position });
        expect(spec.metrics.reduce((sum, metric) => sum + metric.weight, 0)).toBeCloseTo(1, 10);
        expect(new Set(spec.metrics.map((metric) => metric.metricId)).size).toBe(spec.metrics.length);
        expect(spec.metrics.map((metric) => metric.metricId)).toContain("nfl-career-games");
        expect(spec.metrics.map((metric) => metric.metricId)).toContain("nfl-first-team-all-pros");
        expect(spec.metrics.map((metric) => metric.metricId)).toContain("nfl-super-bowl-titles");
      }
    }
  });

  it("routes the combined defensive pool through family-relative models before cross-position comparison", () => {
    const combined = buildFootballComparisonCandidatePool("nfl-defensive-players", []);

    for (const familyId of ["DL / EDGE", "LB", "Secondary"] as const) {
      const familyPool = buildFootballNflCareerFamilyCandidatePool(familyId);
      const target = familyPool.find((candidate) => candidate.evaluationSource === "canonical-facts");
      expect(target, `${familyId} data-derived candidate`).toBeDefined();

      const combinedTarget = combined.find((candidate) => candidate.canonicalSubjectId === target?.canonicalSubjectId);
      expect(combinedTarget, `${familyId} survives combined defensive pool`).toBeDefined();
      expect(combinedTarget?.rating).toBe(target?.rating);
      expect(combinedTarget?.rankingCoverage).toBe(target?.rankingCoverage);
      expect(combinedTarget?.rankingConfidence).toBe(target?.rankingConfidence);
      expect(combinedTarget?.factMetricIds).toEqual(target?.factMetricIds);

      const subject = target ? getFootballSubject(target.canonicalSubjectId) : undefined;
      const allowedMetrics = new Set(metricIdsFor(familyId, subject?.position ?? ""));
      expect(target?.factMetricIds.every((metricId) => allowedMetrics.has(metricId))).toBe(true);
    }
  });

  it("hydrates a real OL factual pool without fabricating performance dimensions", () => {
    const pool = buildFootballNflCareerFamilyCandidatePool("OL");
    const dataDerived = pool.filter((candidate) => candidate.evaluationSource === "canonical-facts");
    const allowedMetrics = new Set(metricIdsFor("OL", "OL"));

    expect(dataDerived.length).toBeGreaterThan(4);
    expect(dataDerived.some((candidate) => candidate.canonicalSubjectId === "nfl-mike-webster")).toBe(true);
    expect(dataDerived.every((candidate) => candidate.factMetricIds.length > 0)).toBe(true);
    expect(dataDerived.every((candidate) => candidate.factMetricIds.every((metricId) => allowedMetrics.has(metricId)))).toBe(true);
    expect(dataDerived.every((candidate) => candidate.rankingSemantic === "career-greatness")).toBe(true);

    expect(getFootballFact("nfl-mike-webster", "nfl-career-games")?.fact.value).toBe(245);
    expect(getFootballFact("nfl-mike-webster", "nfl-first-team-all-pros")?.fact.value).toBe(5);
    expect(getFootballFact("nfl-mike-webster", "nfl-super-bowl-titles")?.fact.value).toBe(4);
  });

  it("keeps K and P production position-specific inside the shared specialist family", () => {
    const pool = buildFootballNflCareerFamilyCandidatePool("K / P");
    const kickers = pool.filter((candidate) => getFootballSubject(candidate.canonicalSubjectId)?.position === "K");
    const punters = pool.filter((candidate) => getFootballSubject(candidate.canonicalSubjectId)?.position === "P");

    expect(kickers.length).toBeGreaterThan(0);
    expect(punters.length).toBeGreaterThan(0);

    const kickerMetrics = new Set(metricIdsFor("K / P", "K"));
    const punterMetrics = new Set(metricIdsFor("K / P", "P"));
    expect([...kickerMetrics].some((metricId) => metricId.includes("field-goal"))).toBe(true);
    expect([...kickerMetrics].some((metricId) => metricId.includes("punt"))).toBe(false);
    expect([...punterMetrics].some((metricId) => metricId.includes("punt"))).toBe(true);
    expect([...punterMetrics].some((metricId) => metricId.includes("field-goal"))).toBe(false);

    expect(kickers.every((candidate) => candidate.factMetricIds.every((metricId) => kickerMetrics.has(metricId)))).toBe(true);
    expect(punters.every((candidate) => candidate.factMetricIds.every((metricId) => punterMetrics.has(metricId)))).toBe(true);
  });
});
