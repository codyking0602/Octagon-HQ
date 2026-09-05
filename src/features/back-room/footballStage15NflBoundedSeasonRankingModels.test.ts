import { describe, expect, it } from "vitest";

import { footballComparisonCategorySpecs } from "./footballComparisonAuthority";
import { getFootballRankFivePack } from "./footballRankFiveModel";
import { FOOTBALL_RANKING_FRAMEWORK_VERSION } from "./footballRankingFramework";

describe("Football Stage 15 NFL bounded season ranking models", () => {
  it("keeps the retired QB single-season analytical contract bounded to season-specific passing evidence", () => {
    expect(FOOTBALL_RANKING_FRAMEWORK_VERSION).toBe("stage15-v4");

    const spec = footballComparisonCategorySpecs["nfl-qb-seasons"];
    expect(spec.query).toMatchObject({ kind: "player-season", league: "NFL", position: "QB" });
    expect(spec.metrics.map((metric) => metric.metricId)).toEqual([
      "nfl-season-passing-yards",
      "nfl-season-passing-touchdowns",
      "nfl-season-passer-rating",
      "nfl-season-interceptions",
    ]);
    expect(spec.metrics.reduce((sum, metric) => sum + metric.weight, 0)).toBeCloseTo(1, 10);
  });

  it("keeps the retired NFL team-season analytical contract bounded to regular-season strength", () => {
    const spec = footballComparisonCategorySpecs["nfl-team-seasons"];
    expect(spec.query).toMatchObject({ kind: "team-season", league: "NFL" });
    expect(spec.metrics.map((metric) => metric.metricId)).toEqual([
      "nfl-team-points-per-game",
      "nfl-team-opponent-points-per-game",
    ]);
    expect(spec.metrics.reduce((sum, metric) => sum + metric.weight, 0)).toBeCloseTo(0.4, 10);
  });

  it("does not restore retired single-season analytical categories as Rank Five products", () => {
    expect(() => getFootballRankFivePack("nfl-qb-seasons")).toThrow("Unsupported Football Rank 5 pack");
    expect(() => getFootballRankFivePack("nfl-team-seasons")).toThrow("Unsupported Football Rank 5 pack");
  });
});
