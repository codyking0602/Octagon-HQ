import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { playGameDefinition, playGamesForSport } from "./playRegistry";

const router = readFileSync("src/app/router.tsx", "utf8");

describe("Average Fan Daily-only registry", () => {
  it("keeps Football and UFC Average Fan registered for Daily without Casual replay", () => {
    const football = playGameDefinition("average-fan", "football");
    const ufc = playGameDefinition("average-fan", "ufc");

    expect(football.route).toBe("/play/average-fan");
    expect(ufc.route).toBe("/play/average-fan");

    for (const game of [football, ufc]) {
      expect(game.availability).toBe("preview");
      expect(game.lineup.defaultType).toBe("daily");
      expect(game.lineup.supportedTypes).toEqual(["daily"]);
      expect(game.lineup.replayBehavior).toBe("same-curated-challenge");
      expect(game.lineup.lineupSize).toBe(10);
      expect(game.lineup.completionState).toBe("average-fan-settled");
      expect(game.lineup.dailyEligible).toBe(true);
      expect(game.lineup.challengeEligible).toBe(false);
      expect(game.lineup.streakEligible).toBe(true);
      expect(game.lineup.reminderEligible).toBe(true);
      expect(game.lineup.historyRecording).toBe("official-daily");
    }
  });

  it("keeps Average Fan out of the public Casual game registries", () => {
    expect(playGamesForSport("football").some((game) => game.id === "average-fan")).toBe(false);
    expect(playGamesForSport("ufc").some((game) => game.id === "average-fan")).toBe(false);
  });

  it("closes public Casual access while preserving the Daily route and hidden owner preview", () => {
    expect(router).toContain('path: "play/average-fan", element: <TodayChallengeGameRoute gameType="average_fan" casual={<Navigate to="/play" replace />} />');
    expect(router).toContain('path: "play/average-fan-preview", element: <OwnerAverageFanDailyPreviewPage />');
    expect(router).not.toContain("AverageFanPrototypePage");
  });
});
