import { describe, expect, it } from "vitest";
import { replayBehaviorFor } from "./lineupModel";
import { playGameDefinition, playGames, type PlayGameId } from "./playRegistry";

const expectedIds: PlayGameId[] = [
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
    }
  });

  it("keeps Find the Leader as the sole official daily challenge", () => {
    const dailyGames = playGames.filter((game) => game.lineup.dailyEligible);
    expect(dailyGames.map((game) => game.id)).toEqual(["find-leader"]);
    expect(dailyGames[0]?.lineup).toMatchObject({
      defaultType: "daily",
      replayBehavior: "same-daily-lineup",
      newLineupControl: "none",
      repetitionPolicy: "fixed-daily",
      historyRecording: "official-daily",
    });
  });

  it("gives casual games new lineups and exact challenges fixed replay behavior", () => {
    for (const gameId of ["wavelength", "blind-resume", "blind-rank", "keep-cut"] as const) {
      const contract = playGameDefinition(gameId).lineup;
      expect(contract.defaultType).toBe("replayable");
      expect(contract.supportedTypes).toContain("curated");
      expect(contract.replayBehavior).toBe("new-lineup");
      expect(contract.historyRecording).toBe("casual-and-challenge");
    }

    expect(playGameDefinition("better-than").lineup).toMatchObject({
      defaultType: "curated",
      supportedTypes: ["curated"],
      replayBehavior: "same-curated-challenge",
      newLineupControl: "builder-reset",
      repetitionPolicy: "fixed-curated",
      historyRecording: "challenge-completion",
    });
  });

  it("keeps all six games challenge eligible with defined completion states", () => {
    expect(playGames.every((game) => game.lineup.challengeEligible)).toBe(true);
    expect(playGameDefinition("wavelength").lineup.completionState).toBe("fourth-guess-locked");
    expect(playGameDefinition("blind-resume").lineup.completionState).toBe("five-picks-complete");
    expect(playGameDefinition("blind-rank").lineup.completionState).toBe("five-slots-locked");
    expect(playGameDefinition("keep-cut").lineup.completionState).toBe("eight-decisions-locked");
    expect(playGameDefinition("better-than").lineup.completionState).toBe("claim-locked");
  });
});
