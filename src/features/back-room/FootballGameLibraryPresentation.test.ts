import { describe, expect, it } from "vitest";
import footballHomeSource from "./FootballBackRoomPage.tsx?raw";

describe("Football HQ game library presentation", () => {
  it("gives all six Football games a distinct visual identity", () => {
    expect(footballHomeSource).toContain('gameId === "hit-the-number"');
    expect(footballHomeSource).toContain('gameId === "find-leader"');
    expect(footballHomeSource).toContain('gameId === "wavelength"');
    expect(footballHomeSource).toContain('gameId === "blind-resume"');
    expect(footballHomeSource).toContain('gameId === "blind-rank"');
    expect(footballHomeSource).toContain('>KEEP</text>');
    expect(footballHomeSource).toContain('>CUT</text>');
    expect(footballHomeSource).toContain('<FootballGameLibraryMark gameId={id} />');
    expect(footballHomeSource).not.toContain("const GAME_MARKS");
  });

  it("uses compact full library copy and plain resume wording", () => {
    expect(footballHomeSource).toContain("const GAME_LIBRARY_DESCRIPTIONS");
    expect(footballHomeSource).toContain("Pick the stronger football resume as the evidence is revealed.");
    expect(footballHomeSource).toContain("NO NAMES. JUST THE RESUME.");
    expect(footballHomeSource).toContain("<p>{GAME_LIBRARY_DESCRIPTIONS[id]}</p>");
  });
});
