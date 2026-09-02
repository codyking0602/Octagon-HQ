import { describe, expect, it } from "vitest";

import {
  buildFootballComparisonCandidatePool,
  footballComparisonCategorySpecs,
} from "./footballComparisonAuthority";
import { FOOTBALL_RANKING_FRAMEWORK_VERSION } from "./footballRankingFramework";

describe("Football Stage 15 NFL bounded season ranking models", () => {
  it("keeps QB single-season greatness bounded to season-specific passing evidence", () => {
    expect(FOOTBALL_RANKING_FRAMEWORK_VERSION).toBe("stage15-v3");

    const spec = footballComparisonCategorySpecs["nfl-qb-seasons"];
    expect(spec.query).toMatchObject({ kind: "player-season", league: "NFL", position: "QB" });
    expect(spec.metrics.map((metric) => metric.metricId)).toEqual([
      "nfl-season-passing-yards",
      "nfl-season-passing-touchdowns",
      "nfl-season-passer-rating",
      "nfl-season-interceptions",
    ]);
    expect(spec.metrics.reduce((sum, metric) => sum + metric.weight, 0)).toBeCloseTo(1, 10);

    const dataDerived = buildFootballComparisonCandidatePool("nfl-qb-seasons", [])
      .filter((candidate) => candidate.evaluationSource === "canonical-facts");
    expect(dataDerived.length).toBeGreaterThan(0);

    for (const candidate of dataDerived) {
      expect(candidate.rankingSemantic).toBe("single-season-greatness");
      expect(candidate.rankingVersion).toBe("stage15-v3");
      expect(candidate.factMetricIds.length).toBeGreaterThanOrEqual(3);
      expect(candidate.factMetricIds.every((metricId) => metricId.startsWith("nfl-season-"))).toBe(true);
      expect(candidate.factMetricIds.some((metricId) => metricId.includes("career"))).toBe(false);
      expect(candidate.rankingCoverage).toBeLessThanOrEqual(0.70);
    }
  });

  it("judges NFL team seasons from bounded regular-season strength plus one postseason result", () => {
    const spec = footballComparisonCategorySpecs["nfl-team-seasons"];
    expect(spec.query).toMatchObject({ kind: "team-season", league: "NFL" });
    expect(spec.metrics.map((metric) => metric.metricId)).toEqual([
      "nfl-team-points-per-game",
      "nfl-team-opponent-points-per-game",
    ]);

    const dataDerived = buildFootballComparisonCandidatePool("nfl-team-seasons", [])
      .filter((candidate) => candidate.evaluationSource === "canonical-facts");
    expect(dataDerived.length).toBeGreaterThan(0);

    const withRecordAndPostseason = dataDerived.find((candidate) =>
      candidate.factMetricIds.includes("nfl-team-overall-wins")
      && candidate.factMetricIds.includes("nfl-team-overall-losses")
      && candidate.factMetricIds.includes("nfl-team-overall-ties")
      && candidate.factMetricIds.includes("nfl-team-playoff-berth")
      && candidate.factMetricIds.includes("nfl-team-conference-championship-game")
      && candidate.factMetricIds.includes("nfl-team-super-bowl-appearance")
      && candidate.factMetricIds.includes("nfl-super-bowl-title"),
    );
    expect(withRecordAndPostseason).toBeDefined();
    expect(withRecordAndPostseason?.rankingSemantic).toBe("team-season-greatness");
    expect(withRecordAndPostseason?.rankingVersion).toBe("stage15-v3");
    expect(withRecordAndPostseason?.rankingCoverage).toBeCloseTo(0.90);
    expect(withRecordAndPostseason?.ratingBasis).toContain("canonical metric");
  });

  it("keeps reviewed Rank Five rows as optional overrides rather than universe membership", () => {
    for (const packId of ["nfl-qb-seasons", "nfl-team-seasons"] as const) {
      const withoutReviewedRows = buildFootballComparisonCandidatePool(packId, []);
      expect(withoutReviewedRows.length).toBeGreaterThan(0);
      expect(withoutReviewedRows.some((candidate) => candidate.evaluationSource === "canonical-facts")).toBe(true);
    }
  });
});
