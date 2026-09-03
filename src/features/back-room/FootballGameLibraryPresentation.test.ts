import { describe, expect, it } from "vitest";
import { playLandingGameIds } from "../play/PlayLandingPresentation";
import playLandingSource from "../play/PlayLandingPresentation.tsx?raw";
import { playGameDefinition } from "../play/playRegistry";
import footballHomeSource from "./FootballBackRoomPage.tsx?raw";

describe("Football HQ game library presentation", () => {
  it("uses the shared Play library while preserving distinct implemented game identities", () => {
    expect(footballHomeSource).toContain('<PlayLandingGameLibrary sport="football"');

    const games = playLandingGameIds("football").map((id) => playGameDefinition(id, "football"));
    expect(games.map((game) => game.id)).toEqual([
      "find-leader",
      "wavelength",
      "blind-resume",
      "hit-the-number",
    ]);
    expect(new Set(games.map((game) => game.icon)).size).toBe(games.length);
    expect(games.every((game) => game.route.startsWith("/football/"))).toBe(true);
  });

  it("keeps compact shared card copy and plain Blind Resume wording without Daily-only cards", () => {
    const games = playLandingGameIds("football").map((id) => playGameDefinition(id, "football"));
    const blindResume = games.find((game) => game.id === "blind-resume");

    expect(playLandingSource).toContain("play-landing-game-card__status");
    expect(playLandingSource).toContain("{game.description}");
    expect(blindResume?.description).toMatch(/resume/i);
    expect(blindResume?.description).not.toMatch(/rank|tier/i);
    expect(games.map((game) => game.id)).not.toContain("blind-rank");
    expect(games.map((game) => game.id)).not.toContain("keep-cut");
  });
});
