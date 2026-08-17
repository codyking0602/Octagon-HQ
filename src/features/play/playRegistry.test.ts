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
  "better-than",
];

const officialDailyIds: PlayGameId[] = [
  "find-leader",
  "wavelength",
  "blind-resume",
  "blind-rank",
  "keep-cut",
];

describe("Play game lineup contracts", () => {
  it("requires an intentional complete contract for every live game", () => {
    expect(playGames.map((game) => game.id)).toEqual(expectedIds);
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

  it("declares the five canonical official daily, streak, and reminder-eligible games", () => {
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

  it("ships Hit the Number as casual replayable play before its official Daily integration", () => {
    expect(playGameDefinition("hit-the-number").lineup).toMatchObject({
      defaultType: "replayable",
      supportedTypes: ["replayable"],
      replayBehavior: "new-lineup",
      newLineupControl: "button-and-result-replay",
      repetitionPolicy: "recent-items-deprioritized",
      lineupSize: "variable",
      completionState: "target-selection-locked",
      challengeEligible: false,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "casual-only",
    });
  });

  it("preserves casual new-lineup play and exact direct challenges for the existing challenge games", () => {
    for (const gameId of officialDailyIds) {
      const contract = playGameDefinition(gameId).lineup;
      expect(contract.defaultType).toBe("replayable");
      expect(contract.supportedTypes).toContain("curated");
      expect(contract.replayBehavior).toBe("new-lineup");
    }

    expect(playGameDefinition("better-than").lineup).toMatchObject({
      defaultType: "curated",
      supportedTypes: ["curated"],
      replayBehavior: "same-curated-challenge",
      newLineupControl: "builder-reset",
      repetitionPolicy: "fixed-curated",
      historyRecording: "challenge-completion",
      streakEligible: false,
      reminderEligible: false,
    });
  });

  it("uses the canonical centered VS icon for Better Than", () => {
    expect(playGameDefinition("better-than").icon).toBe("VS");
  });

  it("keeps established games challenge eligible and gives every game a defined completion state", () => {
    expect(playGames.filter((game) => game.id !== "hit-the-number").every((game) => game.lineup.challengeEligible)).toBe(true);
    expect(playGameDefinition("find-leader").lineup.completionState).toBe("leader-eliminated-or-nine-safe");
    expect(playGameDefinition("wavelength").lineup.completionState).toBe("fourth-guess-locked");
    expect(playGameDefinition("blind-resume").lineup.completionState).toBe("five-picks-complete");
    expect(playGameDefinition("blind-rank").lineup.completionState).toBe("five-slots-locked");
    expect(playGameDefinition("keep-cut").lineup.completionState).toBe("eight-decisions-locked");
    expect(playGameDefinition("better-than").lineup.completionState).toBe("claim-locked");
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
