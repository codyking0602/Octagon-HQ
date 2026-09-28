import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { playGameDefinition, playGamesForSport } from "./playRegistry";

const router = readFileSync("src/app/router.tsx", "utf8");

describe("Bar Trivia Daily-only registry", () => {
  it("keeps Football and UFC Bar Trivia registered for Daily without Casual replay", () => {
    const football = playGameDefinition("bar-trivia", "football");
    const ufc = playGameDefinition("bar-trivia", "ufc");

    expect(football.route).toBe("/football/bar-trivia");
    expect(ufc.route).toBe("/play/bar-trivia");

    for (const game of [football, ufc]) {
      expect(game.availability).toBe("preview");
      expect(game.lineup.defaultType).toBe("daily");
      expect(game.lineup.supportedTypes).toEqual(["daily"]);
      expect(game.lineup.replayBehavior).toBe("same-curated-challenge");
      expect(game.lineup.lineupSize).toBe(10);
      expect(game.lineup.completionState).toBe("bar-trivia-settled");
      expect(game.lineup.dailyEligible).toBe(true);
      expect(game.lineup.challengeEligible).toBe(false);
      expect(game.lineup.streakEligible).toBe(true);
      expect(game.lineup.reminderEligible).toBe(true);
      expect(game.lineup.historyRecording).toBe("official-daily");
    }
  });

  it("keeps Bar Trivia out of the public Casual game registries", () => {
    expect(playGamesForSport("football").some((game) => game.id === "bar-trivia")).toBe(false);
    expect(playGamesForSport("ufc").some((game) => game.id === "bar-trivia")).toBe(false);
  });

  it("closes every former Casual Bar Trivia URL while preserving the UFC Daily route", () => {
    expect(router).toContain('path: "play/bar-trivia", element: <TodayChallengeGameRoute gameType="bar_trivia" casual={<Navigate to="/play" replace />} />');
    expect(router).toContain('path: "football/bar-trivia", element: <Navigate to="/football" replace />');
    expect(router).toContain('path: "mlb/bar-trivia", element: <Navigate to="/mlb" replace />');
  });
});
