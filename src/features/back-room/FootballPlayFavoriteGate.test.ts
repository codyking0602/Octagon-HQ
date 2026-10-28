import { describe, expect, it } from "vitest";
import playV2Source from "../play/PlayV2Page.tsx?raw";
import todayHubSource from "../play/TodayChallengeHub.tsx?raw";
import footballPlaySource from "./FootballBackRoomPage.tsx?raw";

describe("Football Play favorite-team gate", () => {
  it("opens the Football Play hub without requiring a saved team preference", () => {
    expect(footballPlaySource).not.toContain("FootballEntryGate");
    expect(footballPlaySource).not.toContain("Pick your side.");
    expect(footballPlaySource).not.toContain("useProfilePreferences");
    expect(footballPlaySource).not.toContain("footballTeam");
    expect(footballPlaySource).not.toContain("showTransition");
    expect(footballPlaySource).not.toContain("FootballEntryTransition");
    expect(footballPlaySource).toContain('<PlayV2Page sport="football" />');
    expect(playV2Source).toContain('className="page play-v2"');
    expect(footballPlaySource).not.toContain("FootballGamesEarlyAccessBanner");
    expect(playV2Source).toContain('<DailyCompact sport={sport} profileId={profileId} />');
    expect(todayHubSource).toContain("TODAY’S CHALLENGE");
    expect(playV2Source).toContain('<GameRoom sport={sport} />');
    expect(playV2Source).toContain("ALL GAMES");
  });
});
