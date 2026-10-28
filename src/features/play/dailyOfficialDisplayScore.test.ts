import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { TodayChallengeProjection } from "./todayChallengeRepository";
import { dailyOfficialDisplayScore } from "./DailyTwoGameStatus";

function completed(
  sport: "ufc" | "football" | "nba" | "nba_preview",
  gameType: string,
  roundScores: number[] | null = [80, 90],
): TodayChallengeProjection {
  const series = roundScores ? {
    format_version: "daily-two-game-average-v1", complete: true,
    round_scores: roundScores, average_score: 85, game_index: 1,
  } : null;
  return {
    sport, gameType, centralDay: "2026-11-04",
    publicState: series ? { daily_series: series } : {},
    officialAttempt: {
      normalizedScore: 90,
      publicResult: series ? { daily_series: series } : {},
    },
  } as unknown as TodayChallengeProjection;
}

describe("canonical completed Daily score on every screen", () => {
  it.each(["ufc", "football", "nba", "nba_preview"] as const)(
    "shows the rounded two-game average, never the second-game score, for %s",
    sport => {
      for (const gameType of ["find_leader", "hit_the_number", "wavelength", "higher_lower"]) {
        expect(dailyOfficialDisplayScore(completed(sport, gameType), 85)).toBe(85);
      }
    },
  );

  it("recomputes the rounded mean from both saved games even if the final attempt and cached mean are stale", () => {
    const projection = completed("nba_preview", "find_leader");
    expect(dailyOfficialDisplayScore(projection, 85)).toBe(85);
    const oddScores = completed("football", "hit_the_number", [81, 90]);
    expect(dailyOfficialDisplayScore(oddScores, 85)).toBe(86);
  });

  it("uses the official leaderboard score when an older two-game projection lacks child scores", () => {
    expect(dailyOfficialDisplayScore(completed("nba_preview", "find_leader", null), 85)).toBe(85);
    expect(dailyOfficialDisplayScore(completed("nba", "wavelength", null))).toBe(90);
  });

  it("never changes a single-game score, or displays a score before completion", () => {
    expect(dailyOfficialDisplayScore(completed("ufc", "millionaire"), 85)).toBe(90);
    expect(dailyOfficialDisplayScore(completed("football", "who_am_i"), 85)).toBe(90);
    const unfinished = completed("nba", "find_leader");
    unfinished.officialAttempt = null;
    expect(dailyOfficialDisplayScore(unfinished, 85)).toBeNull();
  });

  it("routes NBA Play, Basketball HQ, NBA saved result, UFC/Football Play and Home, and Daily hub through the same selector", () => {
    const paths = [
      "src/features/nba/NbaPlayPage.tsx",
      "src/features/nba/NbaOwnerHomeHq.tsx",
      "src/features/nba/NbaOfficialDailyPage.tsx",
      "src/features/play/PlayV2Page.tsx",
      "src/features/home/HomePage.tsx",
      "src/features/play/TodayChallengeHub.tsx",
    ];
    for (const path of paths) {
      expect(readFileSync(path, "utf8"), path).toContain("dailyOfficialDisplayScore(");
    }
  });
});
