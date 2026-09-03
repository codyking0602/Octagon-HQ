import { describe, expect, it } from "vitest";
import playLandingSource from "../play/PlayLandingPresentation.tsx?raw";
import todayHubSource from "../play/TodayChallengeHub.tsx?raw";
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
    expect(footballPlaySource).toContain('<TodayChallengeHub sport="football" />');
    expect(todayHubSource).toContain("TODAY’S CHALLENGE");
    expect(footballPlaySource).toContain('<PlayLandingGameLibrary sport="football"');
    expect(playLandingSource).toContain("ALL GAMES");
  });
});
