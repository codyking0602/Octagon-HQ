import { describe, expect, it } from "vitest";
import {
  playGameCatalog,
  playGameDefinition,
  playGameIdentity,
  playGames,
  playGamesForSport,
} from "./playRegistry";

const footballGamesExpected = [
  { id: "blind-rank", route: "/football/rank-five" },
  { id: "keep-cut", route: "/football/keep-cut" },
  { id: "wavelength", route: "/football/wavelength" },
  { id: "blind-resume", route: "/football/blind-resume" },
  { id: "hit-the-number", route: "/football/hit-the-number" },
  { id: "20-questions", route: "/football/20-questions" },
  { id: "find-leader", route: "/football/find-leader" },
] as const;

describe("sport-aware Play registry", () => {
  it("preserves the existing UFC registry as the default Play surface", () => {
    expect(playGames).toEqual(playGamesForSport("ufc"));
    expect(playGames.every((game) => game.sport === "ufc")).toBe(true);
    expect(playGameDefinition("wavelength")).toBe(playGameDefinition("wavelength", "ufc"));
    expect(playGameDefinition("wavelength").route).toBe("/play/wavelength");
  });

  it("registers Football games on their canonical Football HQ routes", () => {
    const footballGames = playGamesForSport("football");
    expect(footballGames.map(({ id, route }) => ({ id, route }))).toEqual(footballGamesExpected);
    expect(footballGames).toHaveLength(7);

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

  it("preserves shared challenge support for established Football games while 20 Questions stays replayable-only", () => {
    const footballGames = playGamesForSport("football");
    for (const game of footballGames.filter((candidate) => candidate.id !== "20-questions")) {
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
    expect(playGameDefinition("20-questions", "football").lineup).toMatchObject({
      defaultType: "replayable",
      supportedTypes: ["replayable"],
      replayBehavior: "new-lineup",
      challengeEligible: false,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "casual-only",
    });
  });
});