import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dailyTwoGameOfficialAverageScore } from "../play/DailyTwoGameStatus";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";

describe("Home Daily two-game official average", () => {
  it("uses both saved game scores instead of the last completed game's score", () => {
    const projection = {
      officialAttempt: { normalizedScore: 100, publicResult: {} },
      publicState: {
        format_version: "daily-two-game-average-v1",
        complete: true,
        round_index: 1,
        round_scores: [10, 100],
      },
    } as unknown as TodayChallengeProjection;
    expect(dailyTwoGameOfficialAverageScore(projection)).toBe(55);
    const source = readFileSync(new URL("./HomePage.tsx", import.meta.url), "utf8");
    expect(source).toContain("dailyTwoGameOfficialAverageScore(projection!)");
    expect(source).toContain("ownLeaderboardEntry?.normalizedScore");
    expect(source).toContain("<strong>{displayedScore}<small>/100</small></strong>");
    expect(source).not.toContain("<strong>{attempt.normalizedScore}<small>/100</small></strong>");
  });
});
