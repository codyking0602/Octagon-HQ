import { describe, expect, it } from "vitest";
import {
  playGameCatalog,
  playGameDefinition,
  playGameIdentity,
  playGames,
  playGamesForSport,
} from "./playRegistry";

const footballGamesExpected = [
  { id: "blind-rank", route: "/back-room/football/rank-five" },
  { id: "keep-cut", route: "/back-room/football/keep-cut" },
  { id: "wavelength", route: "/back-room/football/wavelength" },
  { id: "blind-resume", route: "/back-room/football/blind-resume" },
  { id: "hit-the-number", route: "/back-room/football/hit-the-number" },
  { id: "find-leader", route: "/back-room/football/find-leader" },
] as const;

describe("sport-aware Play registry", () => {
  it("preserves the existing UFC registry as the default Play surface", () => {
    expect(playGames).toEqual(playGamesForSport("ufc"));
    expect(playGames.every((game) => game.sport === "ufc")).toBe(true);
    expect(playGameDefinition("wavelength")).toBe(playGameDefinition("wavelength", "ufc"));
    expect(playGameDefinition("wavelength").route).toBe("/play/wavelength");
  });

  it("registers exactly the six existing Football games on their current standalone routes", () => {
    const footballGames = playGamesForSport("football");
    expect(footballGames.map(({ id, route }) => ({ id, route }))).toEqual(footballGamesExpected);
    expect(footballGames).toHaveLength(6);

    for (const game of footballGames) {
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

  it("turns on shared challenge support for Football without duplicating the daily platform", () => {
    for (const game of playGamesForSport("football")) {
      expect(game.lineup).toMatchObject({
        defaultType: "replayable",
        supportedTypes: ["replayable", "curated"],
        replayBehavior: "new-lineup",
        challengeEligible: true,
        dailyEligible: false,
        streakEligible: false,
        reminderEligible: false,
        historyRecording: "casual-and-challenge",
      });
    }
  });
});
