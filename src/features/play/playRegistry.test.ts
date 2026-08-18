import { describe, expect, it } from "vitest";
import { replayBehaviorFor } from "./lineupModel";
import { playGameDefinition, playGames, type PlayGameId } from "./playRegistry";

const expectedIds: PlayGameId[] = [
  "auction",
  "hit-the-number",
  "find-leader",
  "wavelength",
  "blind-resume",
  "blind-rank",
  "keep-cut",
];

const officialDailyIds: PlayGameId[] = [
  "hit-the-number",
  "find-leader",
  "wavelength",
  "blind-resume",
  "blind-rank",
  "keep-cut",
];

describe("Play game lineup contracts", () => {
  it("requires an intentional complete contract for every live game", () => {
    expect(playGames.map((game) => game.id)).toEqual(expectedIds);
    expect(playGames.map((game) => game.id)).not.toContain("better-than");
    expect(new Set(playGames.map((game) => game.id)).size).toBe(playGames.length);

    for (const game of playGames) {
      expect(game.lineup.supportedTypes).toContain(game.lineup.defaultType);
      expect(game.lineup.replayBehavior).toBe(replayBehaviorFor(game.lineup.defaultType));
      expect(game.lineup.lineupSize === "variable" || game.lineup.lineupSize > 0).toBe(true);
      expect(game.lineup.difficultyModel.trim()).not.toBe("");
      expect(game.lineup.completionState).toBeTruthy();
      expect(game.lineup.newLineupControl).toBeTruthy();
      expect(game.lineup.repetitionPolicy).toBeTruthy();
      expect(typeof game.lineup.streakEligible).toBe("boolean");
      expect(typeof game.lineup.reminderEligible).toBe("boolean");
    }
  });

  it("declares the six canonical official daily, streak, and reminder-eligible games", () => {
    const dailyGames = playGames.filter((game) => game.lineup.dailyEligible);
    const streakGames = playGames.filter((game) => game.lineup.streakEligible);
    const reminderGames = playGames.filter((game) => game.lineup.reminderEligible);
    expect(dailyGames.map((game) => game.id)).toEqual(officialDailyIds);
    expect(streakGames.map((game) => game.id)).toEqual(officialDailyIds);
    expect(reminderGames.map((game) => game.id)).toEqual(officialDailyIds);

    for (const gameId of officialDailyIds) {
      expect(playGameDefinition(gameId).lineup).toMatchObject({
        supportedTypes: ["daily", "replayable", "curated"],
        historyRecording: "official-daily-and-casual",
        dailyEligible: true,
        streakEligible: true,
        reminderEligible: true,
      });
    }
  });

  it("declares Hit the Number as the existing replayable game plus official Daily", () => {
    expect(playGameDefinition("hit-the-number").lineup).toMatchObject({
      defaultType: "replayable",
      supportedTypes: ["daily", "replayable", "curated"],
      replayBehavior: "new-lineup",
      newLineupControl: "button-and-result-replay",
      repetitionPolicy: "recent-items-deprioritized",
      lineupSize: "variable",
      completionState: "target-selection-locked",
      challengeEligible: true,
      dailyEligible: true,
      streakEligible: true,
      reminderEligible: true,
      historyRecording: "official-daily-and-casual",
    });
  });

  it("preserves casual new-lineup play and exact direct challenges for the Daily challenge games", () => {
    for (const gameId of officialDailyIds) {
      const contract = playGameDefinition(gameId).lineup;
      expect(contract.defaultType).toBe("replayable");
      expect(contract.supportedTypes).toContain("curated");
      expect(contract.replayBehavior).toBe("new-lineup");
    }
  });

  it("keeps every live game challenge eligible and gives every live game a defined completion state", () => {
    expect(playGames.every((game) => game.lineup.challengeEligible)).toBe(true);
    expect(playGameDefinition("find-leader").lineup.completionState).toBe("leader-eliminated-or-nine-safe");
    expect(playGameDefinition("wavelength").lineup.completionState).toBe("fourth-guess-locked");
    expect(playGameDefinition("blind-resume").lineup.completionState).toBe("five-picks-complete");
    expect(playGameDefinition("blind-rank").lineup.completionState).toBe("five-slots-locked");
    expect(playGameDefinition("keep-cut").lineup.completionState).toBe("eight-decisions-locked");
    expect(playGameDefinition("auction").lineup.completionState).toBe("auction-complete");
    expect(playGameDefinition("hit-the-number").lineup.completionState).toBe("target-selection-locked");
  });

  it("keeps Keep Cut blind and locked instead of exposing the full board", () => {
    const game = playGameDefinition("keep-cut");
    expect(game.description).toContain("one at a time");
    expect(game.description).toContain("lock four keeps and four cuts");
    expect(game.lineup.difficultyModel).toContain("revealed one fighter at a time");
    expect(game.lineup.difficultyModel).toContain("decision locked");
  });
});
