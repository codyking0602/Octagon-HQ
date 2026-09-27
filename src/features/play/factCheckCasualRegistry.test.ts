import { describe, expect, it } from "vitest";
import { playGameDefinition, playGamesForSport } from "./playRegistry";

describe("Football Fact Check Casual registry", () => {
  it("registers Fact Check as replayable owner-review Casual only", () => {
    const game = playGameDefinition("fact-check", "football");

    expect(game.route).toBe("/football/fact-check");
    expect(game.availability).toBe("preview");
    expect(game.lineup.defaultType).toBe("replayable");
    expect(game.lineup.supportedTypes).toEqual(["replayable"]);
    expect(game.lineup.replayBehavior).toBe("new-lineup");
    expect(game.lineup.repetitionPolicy).toBe("recent-items-deprioritized");
    expect(game.lineup.lineupSize).toBe(10);
    expect(game.lineup.completionState).toBe("fact-check-settled");
    expect(game.lineup.challengeEligible).toBe(false);
    expect(game.lineup.dailyEligible).toBe(false);
    expect(game.lineup.streakEligible).toBe(false);
    expect(game.lineup.reminderEligible).toBe(false);
    expect(game.lineup.historyRecording).toBe("casual-only");
  });

  it("does not enter the public Football game registry while owner-only", () => {
    expect(playGamesForSport("football").some((game) => game.id === "fact-check")).toBe(false);
  });
});
