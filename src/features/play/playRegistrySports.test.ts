import { describe, expect, it } from "vitest";
import {
  playGameCatalog,
  playGameDefinition,
  playGameIdentity,
  playGames,
  playGamesForSport,
  type PlayGameId,
} from "./playRegistry";

const footballGameIds: PlayGameId[] = [
  "blind-rank",
  "keep-cut",
  "wavelength",
  "blind-resume",
  "hit-the-number",
  "find-leader",
];

const footballRoutes: Record<(typeof footballGameIds)[number], string> = {
  "blind-rank": "/back-room/football/rank-five",
  "keep-cut": "/back-room/football/keep-cut",
  wavelength: "/back-room/football/wavelength",
  "blind-resume": "/back-room/football/blind-resume",
  "hit-the-number": "/back-room/football/hit-the-number",
  "find-leader": "/back-room/football/find-leader",
  auction: "",
  "better-than": "",
};

describe("sport-aware Play registry", () => {
  it("preserves the existing UFC registry as the default Play surface", () => {
    expect(playGames).toEqual(playGamesForSport("ufc"));
    expect(playGames.every((game) => game.sport === "ufc")).toBe(true);
    expect(playGameDefinition("wavelength")).toBe(playGameDefinition("wavelength", "ufc"));
    expect(playGameDefinition("wavelength").route).toBe("/play/wavelength");
  });

  it("registers exactly the six existing Football games on their current standalone routes", () => {
    const footballGames = playGamesForSport("football");
    expect(footballGames.map((game) => game.id)).toEqual(footballGameIds);
    expect(footballGames).toHaveLength(6);

    for (const game of footballGames) {
      expect(game.route).toBe(footballRoutes[game.id]);
      expect(playGameDefinition(game.id, "football")).toBe(game);
    }
  });

  it("keeps overlapping game ids collision-free through the sport-scoped identity", () => {
    const ufcWavelength = playGameIdentity("ufc", "wavelength");
    const footballWavelength = playGameIdentity("football", "wavelength");

    expect(ufcWavelength).toEqual({
      sport: "ufc",
      gameId: "wavelength",
      key: "ufc:wavelength",
    });
    expect(footballWavelength).toEqual({
      sport: "football",
      gameId: "wavelength",
      key: "football:wavelength",
    });
    expect(ufcWavelength.key).not.toBe(footballWavelength.key);
    expect(new Set(playGameCatalog.map((game) => `${game.sport}:${game.id}`)).size).toBe(playGameCatalog.length);
  });

  it("does not turn on Football daily, challenge, streak, reminder, or curated platform behavior early", () => {
    for (const game of playGamesForSport("football")) {
      expect(game.lineup).toMatchObject({
        defaultType: "replayable",
        supportedTypes: ["replayable"],
        replayBehavior: "new-lineup",
        challengeEligible: false,
        dailyEligible: false,
        streakEligible: false,
        reminderEligible: false,
        historyRecording: "casual-only",
      });
    }
  });
});
