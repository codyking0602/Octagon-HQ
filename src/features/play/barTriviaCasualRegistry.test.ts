import { describe, expect, it } from "vitest";
import { playGameDefinition, playGamesForSport } from "./playRegistry";

describe("Bar Trivia owner Casual registry", () => {
  it("registers separate owner-review Casual routes for Football and UFC", () => {
    const football = playGameDefinition("bar-trivia", "football");
    const ufc = playGameDefinition("bar-trivia", "ufc");

    expect(football.route).toBe("/football/bar-trivia");
    expect(ufc.route).toBe("/play/bar-trivia");

    for (const game of [football, ufc]) {
      expect(game.availability).toBe("preview");
      expect(game.lineup.defaultType).toBe("replayable");
      expect(game.lineup.supportedTypes).toEqual(["replayable"]);
      expect(game.lineup.replayBehavior).toBe("new-lineup");
      expect(game.lineup.lineupSize).toBe(10);
      expect(game.lineup.completionState).toBe("bar-trivia-settled");
      expect(game.lineup.dailyEligible).toBe(false);
      expect(game.lineup.challengeEligible).toBe(false);
      expect(game.lineup.historyRecording).toBe("casual-only");
    }
  });

  it("keeps Bar Trivia out of both public game registries while owner-only", () => {
    expect(playGamesForSport("football").some((game) => game.id === "bar-trivia")).toBe(false);
    expect(playGamesForSport("ufc").some((game) => game.id === "bar-trivia")).toBe(false);
  });
});
