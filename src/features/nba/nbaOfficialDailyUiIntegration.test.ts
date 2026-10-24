import { describe, expect, it } from "vitest";
import routerSource from "../../app/router.tsx?raw";
import hubSource from "./NbaPlayPage.tsx?raw";
import officialPageSource from "./NbaOfficialDailyPage.tsx?raw";
import officialWhoSource from "../play/OfficialWhoAmIDailyView.tsx?raw";
import officialAverageFanSource from "../play/OfficialAverageFanDailyView.tsx?raw";
import officialFeudSource from "../play/OfficialSportsFeudDailyView.tsx?raw";
import { NBA_DAILY_GAME_LABELS, NBA_OFFICIAL_GAMES_RELEASE_READY, nbaRegularSeasonDaily } from "./nbaDailySchedule";

describe("NBA official Daily client release safety and all nine presentations", () => {
  it("routes through the existing NBA gate, and never unlocks on date alone", () => {
    expect(NBA_OFFICIAL_GAMES_RELEASE_READY).toBe(false);
    expect(routerSource).toContain('path: "nba/today"');
    expect(routerSource).toContain("<NbaPreviewGate><NbaOfficialDailyPage /></NbaPreviewGate>");
    expect(officialPageSource).toContain('const ownerTest = params.get("mode") === "owner-test"');
    expect(officialPageSource).toContain('const releaseEnabled = ownerTest || (NBA_OFFICIAL_GAMES_RELEASE_READY &&');
    expect(officialPageSource).toContain("enabled: releaseEnabled && signedIn");
    expect(hubSource).toContain('{published || ownerTest ? <TodayChallengeHub sport={ownerTest ? "nba_preview" : "nba"} />');
    expect(hubSource).toContain('createTodayChallengeRepository(undefined, ownerTest ? "nba_preview" : "nba")');
    expect(hubSource).toContain("enabled: (published || ownerTest) && Boolean(profile?.id)");
    expect(nbaRegularSeasonDaily("2026-11-01")?.gameType).toBe("average_fan");
    expect(nbaRegularSeasonDaily("2026-11-02")?.day).toBe("2026-11-01");
  });
  it("uses server revisioned progression, not browser-generated official scores, for all nine games", () => {
    expect(Object.keys(NBA_DAILY_GAME_LABELS)).toHaveLength(9);
    for (const type of Object.keys(NBA_DAILY_GAME_LABELS)) {
      expect(officialPageSource).toContain('projection.gameType === "' + type + '"');
    }
    expect(officialPageSource).toContain('useTodayChallengeRuntime({');
    expect(officialPageSource).toContain("void runtime.advance(action, options)");
    expect(officialPageSource).toContain('onToggle={result || busy ? null');
    expect(officialPageSource).toContain('onEliminate={attempt || busy ? null');
    expect(officialPageSource).toContain('onAdvance({ choice: "higher" })'.replace("onAdvance", "advance"));
    expect(officialPageSource).toContain('if (attempt) {\n    return <NbaHigherLowerLeaderboardResult');
  });
  it("preserves NBA-specific identity, hosts and Average Fan subject formatting in shared official views", () => {
    expect(officialWhoSource).toContain('configuredSport === "nba"');
    expect(officialAverageFanSource).toContain('value === "nba"');
    expect(officialFeudSource).toContain('domain === "nba" ? "NBA HQ"');
    expect(officialPageSource).toContain("nbaFindLeaderHeadshot");
    expect(officialPageSource).toContain("nbaWavelengthCategoryLabel");
    expect(officialPageSource).toContain("nbaHitHeadshot");
    expect(officialPageSource).toContain('sport="nba"');
  });
});
