import { describe, expect, it } from "vitest";

import {
  buildFootballComparisonCandidatePool,
  footballComparisonCategorySpecs,
} from "./footballComparisonAuthority";
import { FOOTBALL_RANKING_FRAMEWORK_VERSION } from "./footballRankingFramework";

const offensiveProfiles = [
  { packId: "nfl-quarterbacks", position: "QB", requiresMvp: true },
  { packId: "nfl-running-backs", position: "RB", requiresMvp: true },
  { packId: "nfl-wide-receivers", position: "WR", requiresMvp: false },
  { packId: "nfl-tight-ends", position: "TE", requiresMvp: false },
] as const;

describe("Football Stage 15 NFL offensive career ranking models", () => {
  it("uses one normalized canonical fact profile per offensive position family", () => {
    expect(FOOTBALL_RANKING_FRAMEWORK_VERSION).toBe("stage15-v4");

    for (const profile of offensiveProfiles) {
      const spec = footballComparisonCategorySpecs[profile.packId];
      const metricIds = spec.metrics.map((metric) => metric.metricId);

      expect(spec.query).toMatchObject({
        kind: "player-career",
        league: "NFL",
        position: profile.position,
      });
      expect(spec.metrics.reduce((sum, metric) => sum + metric.weight, 0)).toBeCloseTo(1, 10);
      expect(new Set(metricIds).size).toBe(metricIds.length);

      expect(metricIds).toContain("nfl-career-games");
      expect(metricIds).toContain("nfl-first-team-all-pros");
      expect(metricIds).toContain("nfl-super-bowl-titles");

      if (profile.requiresMvp) {
        expect(metricIds).toContain("nfl-ap-mvp-awards");
      } else {
        expect(metricIds).not.toContain("nfl-ap-mvp-awards");
      }

      expect(metricIds.filter((metricId) => metricId === "nfl-super-bowl-titles")).toHaveLength(1);
    }
  });

  it("keeps canonical fact eligibility while the approved QB consensus owns QB ratings", () => {
    for (const profile of offensiveProfiles) {
      const pool = buildFootballComparisonCandidatePool(profile.packId, []);
      const spec = footballComparisonCategorySpecs[profile.packId];

      if (profile.packId === "nfl-quarterbacks") {
        const consensusRated = pool.filter((candidate) => candidate.evaluationSource === "historical-consensus");
        expect(consensusRated.length, "nfl-quarterbacks consensus-rated depth").toBeGreaterThan(0);
        for (const candidate of consensusRated) {
          expect(candidate.rankingVersion).toBe("stage15-v4");
          expect(candidate.rankingSemantic).toBe("career-greatness");
          expect(candidate.ratingBasis).toContain("historical consensus");
          expect(candidate.factMetricIds.length).toBeGreaterThanOrEqual(spec.minimumFacts);
        }
        continue;
      }

      const dataDerived = pool.filter((candidate) => candidate.evaluationSource === "canonical-facts");
      expect(dataDerived.length, `${profile.packId} canonical data-derived depth`).toBeGreaterThan(0);

      for (const candidate of dataDerived) {
        expect(candidate.rankingVersion).toBe("stage15-v4");
        expect(candidate.rankingSemantic).toBe("career-greatness");
        expect(candidate.ratingBasis).toContain("stage15-v4");
      }
    }
  });
});
