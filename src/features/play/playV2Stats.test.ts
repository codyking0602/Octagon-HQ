import { describe, expect, it } from "vitest";
import { playV2Score, summarizePlayV2History } from "./playV2Stats";
import type { TodayChallengeHistoryRow } from "./todayChallengeRepository";

function result(day: string, gameType: TodayChallengeHistoryRow["gameType"], score: number): TodayChallengeHistoryRow {
  return {
    day, gameType, normalizedScore: score, nativeScore: score,
    scheduleVersion: "test",
    completedAt: day + "T19:00:00.000Z",
    publicResult: {},
  };
}

describe("Play 2.0 official performance metrics", () => {
  it("does not manufacture an average for empty history", () => {
    expect(summarizePlayV2History([])).toMatchObject({
      count: 0, average: null, best: null, recent: [], byGame: [],
    });
    expect(playV2Score(null)).toBe("—");
  });

  it("calculates genuine normalized score averages and per-game summaries", () => {
    const history = [
      result("2026-10-06", "sports_feud", 70),
      result("2026-10-05", "find_leader", 90),
      result("2026-10-07", "sports_feud", 80),
      result("2026-10-08", "find_leader", 100),
    ];
    const stats = summarizePlayV2History(history);
    expect(stats.count).toBe(4);
    expect(stats.average).toBe(85);
    expect(stats.best).toBe(100);
    expect(stats.recent.map((item) => item.normalizedScore)).toEqual([100, 80, 70, 90]);
    expect(stats.byGame).toEqual(expect.arrayContaining([
      expect.objectContaining({ gameType: "sports_feud", count: 2, average: 75, best: 80, latest: 80 }),
      expect.objectContaining({ gameType: "find_leader", count: 2, average: 95, best: 100, latest: 100 }),
    ]));
  });

  it("compares the latest five scores against the previous five and keeps the latest ten", () => {
    const scores = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99];
    const rows = scores.map((score, index) => result("2026-09-" + String(index + 1).padStart(2, "0"), "wavelength", score));
    const stats = summarizePlayV2History(rows);
    expect(stats.count).toBe(11);
    expect(stats.recent).toHaveLength(10);
    expect(stats.best).toBe(99);
    expect(stats.lastFiveAverage).toBe(89.8);
    expect(stats.previousFiveAverage).toBe(65);
  });

  it("drops invalid score records instead of silently skewing averages", () => {
    const summary = summarizePlayV2History([
      result("2026-10-01", "who_am_i", 80),
      result("2026-10-02", "who_am_i", Number.NaN),
      result("2026-10-03", "who_am_i", 105),
    ]);
    expect(summary.count).toBe(1);
    expect(summary.average).toBe(80);
  });
});
