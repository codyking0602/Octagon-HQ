import { describe, expect, it } from "vitest";
import { playLandingGameIds } from "../play/PlayLandingPresentation";
import playLandingSource from "../play/PlayLandingPresentation.tsx?raw";
import playV2Source from "../play/PlayV2Page.tsx?raw";
import ufcHomeSource from "../play/TodayChallengeHubPage.tsx?raw";
import { playGameDefinition } from "../play/playRegistry";
import todayHubSource from "../play/TodayChallengeHub.tsx?raw";
import footballHomeSource from "./FootballBackRoomPage.tsx?raw";
import footballFindLeaderSource from "./FootballFindLeaderPage.tsx?raw";
import footballFindLeaderPresentationSource from "./FootballFindLeaderPresentation.tsx?raw";
import footballHitNumberSource from "./FootballHitTheNumberPage.tsx?raw";
import footballHitNumberPresentationSource from "./FootballHitTheNumberPresentation.tsx?raw";
import footballTodaySource from "./FootballTodayChallengePage.tsx?raw";
import footballWavelengthSource from "./FootballWavelengthPage.tsx?raw";
import footballWavelengthPresentationSource from "./FootballWavelengthPresentation.tsx?raw";

describe("Football HQ game library presentation", () => {
  it("uses the shared Play library while preserving distinct replayable game identities", () => {
    expect(footballHomeSource).toContain('<PlayV2Page sport="football" />');
    expect(playV2Source).toContain("playLandingGameIds(sport)");
    expect(playV2Source).toContain("playLandingDestination(sport, game.id)");

    const games = playLandingGameIds("football").map((id) => playGameDefinition(id, "football"));
    expect(games.map((game) => game.id)).toEqual([
      "gm-football",
      "wheel-football",
      "draft-room",
      "find-leader",
      "who-am-i",
      "higher-lower",
    ]);
    expect(playGameDefinition("20-questions", "football").availability).toBe("retired");
    expect(playGameDefinition("who-am-i", "football").availability).toBeUndefined();
    expect(playGameDefinition("draft-room", "football").availability).toBeUndefined();
    expect(playGameDefinition("wheel-football", "football").availability).toBeUndefined();
    expect(playGameDefinition("higher-lower", "football").availability).toBeUndefined();
    expect(new Set(games.map((game) => game.icon)).size).toBe(games.length);
    expect(games.every((game) => game.route.startsWith("/football/"))).toBe(true);
  });

  it("keeps Daily-only comparison games out of the casual Football library", () => {
    const games = playLandingGameIds("football").map((id) => playGameDefinition(id, "football"));
    const blindResumeDefinition = playGameDefinition("blind-resume", "football");

    expect(playLandingSource).toContain("play-landing-game-card__status");
    expect(playLandingSource).not.toContain("TEMP CASUAL");
    expect(playLandingSource).toContain("{game.description}");
    expect(blindResumeDefinition.title).toBe("Blind Resume");
    expect(blindResumeDefinition.description).toMatch(/résumé/i);
    expect(blindResumeDefinition.description).not.toMatch(/rank|tier/i);
    expect(games.map((game) => game.id)).not.toContain("blind-resume");
    expect(games.map((game) => game.id)).not.toContain("blind-rank");
    expect(games.map((game) => game.id)).not.toContain("keep-cut");
  });

  it("shares the casual Football Find the Leader presentation with official Daily", () => {
    expect(footballFindLeaderSource).toContain("<FootballFindLeaderPresentation");
    expect(footballTodaySource).toContain("<FootballFindLeaderPresentation");
    expect(footballTodaySource).toContain('eyebrow="TODAY’S CHALLENGE"');
    expect(footballFindLeaderPresentationSource).toContain('className="football-find-grid"');
    expect(footballFindLeaderPresentationSource).toContain('className="football-find-reveal"');
  });

  it("shares replayable Wavelength and Hit the Number presentation owners with official Daily", () => {
    expect(footballWavelengthSource).toContain("<FootballWavelengthPresentation");
    expect(footballTodaySource).toContain("<FootballWavelengthPresentation");
    expect(footballWavelengthPresentationSource).toContain('className="wavelength-guess-panel"');

    expect(footballHitNumberSource).toContain("<FootballHitTheNumberPresentation");
    expect(footballTodaySource).toContain("<FootballHitTheNumberPresentation");
    expect(footballHitNumberPresentationSource).toContain('className="hit-number-play-area"');
    expect(footballHitNumberPresentationSource).toContain('data-testid="hit-number-role-slots"');
  });

  it("uses the same Today Challenge presentation owner as UFC", () => {
    expect(footballHomeSource).toContain('<PlayV2Page sport="football" />');
    expect(ufcHomeSource).toContain('<PlayV2Page sport="ufc" />');
    expect(playV2Source).toContain('<DailyCompact sport={sport} profileId={profileId} />');
    expect(playV2Source).toContain('useTodayChallengeRuntime({ profileId, enabled: true, sport })');
    expect(playV2Source).toContain('useTodayChallengeOverview({');
    expect(playV2Source).toContain('DailyAnswerDetail');
    expect(footballHomeSource).not.toContain("football-daily-hq");
    expect(footballHomeSource).not.toContain("useTodayChallengeRuntime");
    expect(footballHomeSource).not.toContain("useTodayChallengeOverview");

    expect(todayHubSource).toContain('sport = "ufc"');
    expect(todayHubSource).toContain('data-sport={sport}');
    expect(todayHubSource).toContain('sport === "football" ? "/football/today"');
    expect(todayHubSource).toContain('className="today-hub-card"');
    expect(todayHubSource).toContain('className="today-hub__pager"');
  });
});
