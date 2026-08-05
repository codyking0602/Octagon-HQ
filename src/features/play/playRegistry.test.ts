import { describe, expect, it } from "vitest";
import { replayBehaviorFor } from "./lineupModel";
import { playGameDefinition, playGames, type PlayGameId } from "./playRegistry";

const expectedIds: PlayGameId[] = [
  "auction",
  "find-leader",
  "wavelength",
  "blind-resume",
  "blind-rank",
  "keep-cut",
  "better-than",
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

  it("keeps Find the Leader as the sole official daily, streak, and reminder-eligible game", () => {
    const dailyGames = playGames.filter((game) => game.lineup.dailyEligible);
    const streakGames = playGames.filter((game) => game.lineup.streakEligible);
    const reminderGames = playGames.filter((game) => game.lineup.reminderEligible);
    expect(dailyGames.map((game) => game.id)).toEqual(["find-leader"]);
    expect(streakGames.map((game) => game.id)).toEqual(["find-leader"]);
    expect(reminderGames.map((game) => game.id)).toEqual(["find-leader"]);
    expect(dailyGames[0]?.lineup).toMatchObject({
      defaultType: "replayable",
      supportedTypes: ["daily", "replayable", "curated"],
      replayBehavior: "new-lineup",
      newLineupControl: "result-replay",
      repetitionPolicy: "recent-fighters-deprioritized",
      historyRecording: "official-daily-and-casual",
      streakEligible: true,
      reminderEligible: true,
    });
  });

  it("gives every casual game a new lineup and exact challenges fixed replay behavior", () => {
    for (const gameId of ["find-leader", "wavelength", "blind-resume", "blind-rank", "keep-cut"] as const) {
      const contract = playGameDefinition(gameId).lineup;
      expect(contract.defaultType).toBe("replayable");
      expect(contract.supportedTypes).toContain("curated");
      expect(contract.replayBehavior).toBe("new-lineup");
    }

    expect(playGameDefinition("find-leader").lineup.historyRecording).toBe("official-daily-and-casual");
    for (const gameId of ["wavelength", "blind-resume", "blind-rank", "keep-cut"] as const) {
      const contract = playGameDefinition(gameId).lineup;
      expect(contract.historyRecording).toBe("casual-and-challenge");
      expect(contract.streakEligible).toBe(false);
      expect(contract.reminderEligible).toBe(false);
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

  it("keeps every game challenge eligible with defined completion states", () => {
    expect(playGames.every((game) => game.lineup.challengeEligible)).toBe(true);
    expect(playGameDefinition("find-leader").lineup.completionState).toBe("leader-eliminated-or-nine-safe");
    expect(playGameDefinition("wavelength").lineup.completionState).toBe("fourth-guess-locked");
    expect(playGameDefinition("blind-resume").lineup.completionState).toBe("five-picks-complete");
    expect(playGameDefinition("blind-rank").lineup.completionState).toBe("five-slots-locked");
    expect(playGameDefinition("keep-cut").lineup.completionState).toBe("eight-decisions-locked");
    expect(playGameDefinition("better-than").lineup.completionState).toBe("claim-locked");
    expect(playGameDefinition("auction").lineup.completionState).toBe("auction-complete");
  });

  it("keeps Keep Cut blind and locked instead of exposing the full board", () => {
    const game = playGameDefinition("keep-cut");
    expect(game.description).toContain("one at a time");
    expect(game.description).toContain("lock four keeps and four cuts");
    expect(game.lineup.difficultyModel).toContain("revealed one fighter at a time");
    expect(game.lineup.difficultyModel).toContain("decision locked");
  });
});
