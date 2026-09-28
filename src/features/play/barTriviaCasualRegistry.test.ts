import { describe, expect, it } from "vitest";
import { playGameDefinition, playGamesForSport } from "./playRegistry";

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
});
