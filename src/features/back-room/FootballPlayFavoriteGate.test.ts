import { describe, expect, it } from "vitest";
import footballPlaySource from "./FootballBackRoomPage.tsx?raw";

describe("Football Play favorite-team gate", () => {
  it("opens the Football Play hub without requiring a saved team preference", () => {
    expect(footballPlaySource).not.toContain("FootballEntryGate");
    expect(footballPlaySource).not.toContain("Pick your side.");
    expect(footballPlaySource).not.toContain("useProfilePreferences");
    expect(footballPlaySource).not.toContain("footballTeam");
    expect(footballPlaySource).toContain("const showTransition = entryRequested;");
    expect(footballPlaySource).toContain('className="page football-room-page"');
    expect(footballPlaySource).toContain("!showTransition ? <FootballGamesEarlyAccessBanner /> : null");
    expect(footballPlaySource).toContain("TODAY’S CHALLENGE");
    expect(footballPlaySource).toContain("ALL GAMES");
  });
});
