import { describe, expect, it } from "vitest";

import {
  buildFootballComparisonCandidatePool,
  buildFootballNflBoundedEraCandidatePool,
  buildFootballNflFranchiseCandidatePool,
  footballComparisonCategorySpecs,
  footballNflBoundedEraRankingSpec,
  footballNflFranchiseRankingSpec,
} from "./footballComparisonAuthority";
import { getFootballFact } from "./footballFactualStatsCore";
import { FOOTBALL_RANKING_FRAMEWORK_VERSION } from "./footballRankingFramework";
import { queryFootballSubjects } from "./footballSubjectRegistry";

const coachMetrics = [
  "nfl-coach-best-season-win-percentage-since-1999",
  "nfl-coach-win-percentage-since-1999",
  "nfl-coach-seasons-since-1999",
  "nfl-coach-postseason-resume-since-1999",
] as const;

const franchiseMetrics = [
  "nfl-franchise-best-season-win-percentage-since-1999",
  "nfl-franchise-win-percentage-since-1999",
  "nfl-franchise-seasons-since-1999",
  "nfl-franchise-postseason-resume-since-1999",
] as const;

const eraMetrics = [
  "nfl-franchise-era-best-season-win-percentage",
  "nfl-franchise-era-win-percentage",
  "nfl-franchise-era-season-count",
  "nfl-franchise-era-postseason-resume",
] as const;

function expectNormalizedSpec(
  spec: { metrics: readonly { metricId: string; weight: number }[] },
  metricIds: readonly string[],
) {
  expect(spec.metrics.map((metric) => metric.metricId)).toEqual(metricIds);
  expect(spec.metrics.reduce((sum, metric) => sum + metric.weight, 0)).toBeCloseTo(1, 10);
  expect(new Set(spec.metrics.map((metric) => metric.metricId)).size).toBe(spec.metrics.length);
}

describe("Football Stage 15 NFL coach, franchise and bounded-era ranking models", () => {
  it("uses canonical NFL coach membership and a calculated Stage 15F coach profile", () => {
    expect(FOOTBALL_RANKING_FRAMEWORK_VERSION).toBe("stage15-v4");

    const spec = footballComparisonCategorySpecs["nfl-head-coaches"];
    expect(spec.query).toMatchObject({ kind: "coach", league: "NFL" });
    expectNormalizedSpec(spec, coachMetrics);

    const canonicalCoachUniverse = queryFootballSubjects(spec.query);
    expect(canonicalCoachUniverse.length).toBeGreaterThan(0);
    expect(canonicalCoachUniverse.some((subject) => subject.name === "Bill Belichick")).toBe(true);

    const dataDerived = buildFootballComparisonCandidatePool("nfl-head-coaches", [])
      .filter((candidate) => candidate.evaluationSource === "canonical-facts");
    expect(dataDerived.length).toBeGreaterThan(0);

    for (const candidate of dataDerived) {
      expect(candidate.rankingVersion).toBe("stage15-v4");
      expect(candidate.rankingSemantic).toBe("coach-greatness");
      expect(candidate.factMetricIds).toEqual(expect.arrayContaining([...coachMetrics]));
      expect(candidate.rankingCoverage).toBeCloseTo(0.80);
    }
  });

  it("keeps reviewed coach ratings optional rather than using them as universe membership", () => {
    const withoutReviewedRows = buildFootballComparisonCandidatePool("nfl-head-coaches", []);
    expect(withoutReviewedRows.length).toBeGreaterThan(0);
    expect(withoutReviewedRows.some((candidate) => candidate.evaluationSource === "canonical-facts")).toBe(true);
    expect(withoutReviewedRows.every((candidate) => candidate.evaluationSource !== "reviewed")).toBe(true);
  });

  it("calculates the NFL franchise model from the canonical franchise universe", () => {
    expect(footballNflFranchiseRankingSpec.query).toMatchObject({ kind: "franchise", league: "NFL" });
    expectNormalizedSpec(footballNflFranchiseRankingSpec, franchiseMetrics);

    const pool = buildFootballNflFranchiseCandidatePool();
    expect(pool.length).toBeGreaterThan(20);
    expect(pool.every((candidate) => candidate.evaluationSource === "canonical-facts")).toBe(true);
    expect(pool.every((candidate) => candidate.rankingVersion === "stage15-v4")).toBe(true);
    expect(pool.every((candidate) => candidate.rankingSemantic === "program-franchise-greatness")).toBe(true);
    expect(pool.every((candidate) => candidate.rankingCoverage === 0.75)).toBe(true);
    expect(pool.every((candidate) => candidate.factMetricIds.length === 4)).toBe(true);
  });

  it("rates only NFL eras whose complete bounded window is covered by the pinned source", () => {
    expect(footballNflBoundedEraRankingSpec.query).toMatchObject({ kind: "program-era", league: "NFL" });
    expectNormalizedSpec(footballNflBoundedEraRankingSpec, eraMetrics);

    const pool = buildFootballNflBoundedEraCandidatePool();
    expect(pool.length).toBeGreaterThan(0);
    expect(pool.every((candidate) => candidate.evaluationSource === "canonical-facts")).toBe(true);
    expect(pool.every((candidate) => candidate.rankingVersion === "stage15-v4")).toBe(true);
    expect(pool.every((candidate) => candidate.rankingSemantic === "bounded-era-greatness")).toBe(true);
    expect(pool.every((candidate) => candidate.rankingCoverage === 0.80)).toBe(true);
    expect(pool.some((candidate) => candidate.canonicalSubjectId === "nfl-era-patriots-belichick-brady")).toBe(true);

    expect(getFootballFact("nfl-era-patriots-belichick-brady", "nfl-franchise-era-season-count")?.fact.value).toBe(19);
    expect(getFootballFact("nfl-era-colts-peyton-manning", "nfl-franchise-era-season-count")).toBeNull();
    expect(pool.some((candidate) => candidate.canonicalSubjectId === "nfl-era-colts-peyton-manning")).toBe(false);
  });

  it("uses one postseason résumé metric per Stage 15F/G model instead of stacking postseason outcomes", () => {
    expect(coachMetrics.filter((metricId) => metricId.includes("postseason"))).toHaveLength(1);
    expect(franchiseMetrics.filter((metricId) => metricId.includes("postseason"))).toHaveLength(1);
    expect(eraMetrics.filter((metricId) => metricId.includes("postseason"))).toHaveLength(1);
  });
});
