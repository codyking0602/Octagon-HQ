import { describe, expect, it } from "vitest";
import {
  footballFindLeaderFeaturedQuestions, footballFindLeaderMetricRows,
  buildFootballFindLeaderBoard, footballFindLeaderCanonicalMetricByMetric,
} from "./footballFindLeaderModel";
import { footballFindLeaderCfbPeakContext } from "./footballFindLeaderCfbPeakContext";

const metrics = [
  "cfb-player-rushing-yards", "cfb-player-rushing-touchdowns",
  "cfb-player-receiving-yards", "cfb-player-receiving-touchdowns",
] as const;

describe("CFB Find the Leader verified best-season identity", () => {
  it("binds every featured CFB player card to the year and school of that exact statistic", () => {
    for (const metricId of metrics) {
      const rows = footballFindLeaderMetricRows(metricId).filter((row) => row.season != null);
      expect(rows.length, metricId).toBeGreaterThanOrEqual(11);
      for (const row of rows) {
        const identity = footballFindLeaderCfbPeakContext(row.id, footballFindLeaderCanonicalMetricByMetric[metricId], row.value);
        expect(identity, row.id).not.toBeNull();
        expect(identity!.season).toBe(row.season);
        expect(row.subtitle).toContain(identity!.school);
      }
      const question = footballFindLeaderFeaturedQuestions.find((definition) => definition.metricId === metricId)!;
      for (let n = 0; n < 12; n += 1) {
        const board = buildFootballFindLeaderBoard(question, `peak-season-${metricId}-${n}`, "featured");
        expect(board, metricId).not.toBeNull();
        for (const candidate of board!.candidates) {
          expect(candidate.season, candidate.id).toEqual(expect.any(Number));
          expect(candidate.subtitle, candidate.id).toMatch(/ · /);
        }
      }
    }
  });

  it("rejects stale-value peak metadata rather than mislabeling a different season", () => {
    const row = footballFindLeaderMetricRows(metrics[0]).find((candidate) => candidate.season != null)!;
    expect(footballFindLeaderCfbPeakContext(
      row.id, footballFindLeaderCanonicalMetricByMetric[metrics[0]], row.value + 1,
    )).toBeNull();
  });
});
