import { describe, expect, it } from "vitest";
import {
  challengePlayRoute,
} from "../challenges/challengeRuntime";
import {
  challengeResultScoreLabel,
} from "../challenges/ChallengeResultDetails";
import type { ChallengeJson, PlayChallenge } from "../challenges/challengeModel";
import { playGamesForSport, type PlayGameId } from "./playRegistry";

const footballChallengeGames: readonly { id: PlayGameId; route: string }[] = [
  { id: "blind-rank", route: "/back-room/football/rank-five" },
  { id: "keep-cut", route: "/back-room/football/keep-cut" },
  { id: "wavelength", route: "/back-room/football/wavelength" },
  { id: "blind-resume", route: "/back-room/football/blind-resume" },
  { id: "hit-the-number", route: "/back-room/football/hit-the-number" },
  { id: "find-leader", route: "/back-room/football/find-leader" },
];

function challenge(
  gameId: PlayGameId,
  route: string,
  overrides: Partial<PlayChallenge> = {},
): PlayChallenge {
  return {
    code: "FB1234",
    gameId,
    gameVersion: `football-${gameId}-v1`,
    gameTitle: `Football ${gameId}`,
    summary: "Football challenge",
    creatorId: "creator",
    recipientId: "recipient",
    playUrl: `https://octagon.hq-app.workers.dev${route}`,
    setup: {},
    creatorResult: {},
    responderResult: null,
    openedAt: null,
    completedAt: null,
    declinedAt: null,
    createdAt: "2026-08-23T00:00:00.000Z",
    ...overrides,
  } as PlayChallenge;
}

describe("Football standalone challenge integration parity", () => {
  it("makes all six Football games challenge-capable without creating another daily owner", () => {
    const games = playGamesForSport("football");
    expect(games.map((game) => game.id)).toEqual(footballChallengeGames.map((game) => game.id));

    for (const game of games) {
      expect(game.lineup.challengeEligible).toBe(true);
      expect(game.lineup.supportedTypes).toContain("curated");
      expect(game.lineup.historyRecording).toBe("casual-and-challenge");
      expect(game.lineup.dailyEligible).toBe(false);
      expect(game.lineup.streakEligible).toBe(false);
      expect(game.lineup.reminderEligible).toBe(false);
    }
  });

  it("routes every Football profile challenge back into its canonical Football game", () => {
    for (const game of footballChallengeGames) {
      const routed = challengePlayRoute(challenge(game.id, game.route));
      const expectedParam = game.id === "find-leader" ? "challenge=FB1234" : "match=FB1234";
      expect(routed).toBe(`${game.route}?${expectedParam}`);
    }
  });

  it("uses the sport-aware registry route when a stored Football play URL is missing", () => {
    expect(challengePlayRoute(challenge("wavelength", "/back-room/football/wavelength", {
      playUrl: "",
    }))).toBe("/back-room/football/wavelength?match=FB1234");

    expect(challengePlayRoute(challenge("wavelength", "/play/wavelength", {
      gameVersion: "wavelength-v2",
      playUrl: "",
    }))).toBe("/play/wavelength?match=FB1234");
  });

  it("formats Football Blind Resume scores as the shared 100-point contract", () => {
    const result = {
      score: 83,
      record: { wins: 4, losses: 1 },
    } as ChallengeJson;
    expect(challengeResultScoreLabel(
      challenge("blind-resume", "/back-room/football/blind-resume"),
      result,
    )).toBe("83/100 · 4-1");
  });
});
