import { describe, expect, it } from "vitest";

import {
  buildFootballComparisonCandidatePool,
  footballComparisonCategorySpecs,
} from "./footballComparisonAuthority";
import { getFootballFact } from "./footballFactualStatsCore";

const reviewedCareerAnchors = [
  { id: "cfb-cam-newton", games: 20, passingYards: 2908, passingTouchdowns: 30, rushingYards: 1586, rushingTouchdowns: 24 },
  { id: "cfb-joe-burrow", games: 39, passingYards: 8852, passingTouchdowns: 78, rushingYards: 820, rushingTouchdowns: 13 },
  { id: "cfb-vince-young", games: 37, passingYards: 6040, passingTouchdowns: 44, rushingYards: 3127, rushingTouchdowns: 37 },
  { id: "cfb-tim-tebow", games: 55, passingYards: 9285, passingTouchdowns: 88, rushingYards: 2947, rushingTouchdowns: 57 },
  { id: "cfb-baker-mayfield", games: 48, passingYards: 14607, passingTouchdowns: 131, rushingYards: 1083, rushingTouchdowns: 21 },
] as const;

describe("Football Stage 16 CFB quarterback career ranking model", () => {
  it("scores college career greatness with career, longevity, peak, efficiency, and honors evidence only", () => {
    const spec = footballComparisonCategorySpecs["college-quarterbacks"];
    const metricIds = spec.metrics.map((metric) => metric.metricId);

    expect(spec.query).toMatchObject({
      kind: "player-career",
      league: "CFB",
      position: "QB",
    });
    expect(spec.minimumFacts).toBe(5);
    expect(spec.metrics.reduce((sum, metric) => sum + metric.weight, 0)).toBeCloseTo(1, 10);
    expect(new Set(metricIds).size).toBe(metricIds.length);

    expect(metricIds).toEqual(expect.arrayContaining([
      "cfb-career-games",
      "cfb-career-passing-yards",
      "cfb-career-passing-touchdowns",
      "cfb-career-rushing-yards",
      "cfb-career-rushing-touchdowns",
      "cfb-career-interceptions-thrown",
      "cfb-best-season-passing-yards",
      "cfb-best-season-passing-touchdowns",
      "cfb-best-season-passer-rating",
      "cfb-best-season-interceptions",
      "cfb-heisman-awards",
    ]));
    expect(metricIds.every((metricId) => metricId.startsWith("cfb-"))).toBe(true);
  });

  it("owns complete reviewed career totals before the generated CFB projection gap-fill", () => {
    for (const anchor of reviewedCareerAnchors) {
      expect(getFootballFact(anchor.id, "cfb-career-games")?.fact.value, `${anchor.id}:games`).toBe(anchor.games);
      expect(getFootballFact(anchor.id, "cfb-career-passing-yards")?.fact.value, `${anchor.id}:pass-yards`).toBe(anchor.passingYards);
      expect(getFootballFact(anchor.id, "cfb-career-passing-touchdowns")?.fact.value, `${anchor.id}:pass-td`).toBe(anchor.passingTouchdowns);
      expect(getFootballFact(anchor.id, "cfb-career-rushing-yards")?.fact.value, `${anchor.id}:rush-yards`).toBe(anchor.rushingYards);
      expect(getFootballFact(anchor.id, "cfb-career-rushing-touchdowns")?.fact.value, `${anchor.id}:rush-td`).toBe(anchor.rushingTouchdowns);
      expect(getFootballFact(anchor.id, "cfb-career-passing-yards")?.sources.map((source) => source.id)).toContain("cfr-player-stat-lines");
    }
  });

  it("builds canonical CFB career candidates without importing NFL evidence", () => {
    const pool = buildFootballComparisonCandidatePool("college-quarterbacks", []);

    for (const anchor of reviewedCareerAnchors) {
      const candidate = pool.find((row) => row.canonicalSubjectId === anchor.id);
      expect(candidate, anchor.id).toBeDefined();
      expect(candidate?.evaluationSource, anchor.id).toBe("canonical-facts");
      expect(candidate?.rankingSemantic, anchor.id).toBe("career-greatness");
      expect(candidate?.factMetricIds, anchor.id).toContain("cfb-career-passing-yards");
      expect(candidate?.factMetricIds.some((metricId) => metricId.startsWith("nfl-")), anchor.id).toBe(false);
    }
  });
});
