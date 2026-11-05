import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FOOTBALL_APPROVED_WEIGHTED_CYCLE, UFC_APPROVED_WEIGHTED_CYCLE } from "../features/play/dailyChallengeRotation";
import { NBA_DAILY_WEIGHTED_CYCLE } from "../features/nba/nbaDailySchedule";

// Every game in the approved production calendars must have BOTH a real
// publication route and a visible player interaction. A label or Game 1/2
// progress bar alone is not sufficient. November 5's blank board slipped past
// component-only testing because FootballTodayChallengePage omitted a branch.
const football = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");
const ufc = readFileSync("src/features/play/OfficialTodayChallengePage.tsx", "utf8");
const ufcLegacy = readFileSync("src/features/play/OfficialTodayChallengePresentation.tsx", "utf8");
const nba = readFileSync("src/features/nba/NbaOfficialDailyPage.tsx", "utf8");
const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const footballPublisher = readFileSync("src/features/play/footballDailyPublicationAll.ts", "utf8");
const scoringPublisher = readFileSync("supabase/migrations/202612310941_football_higher_lower_two_game_publication.sql", "utf8");
const monitoring = readFileSync(".github/workflows/monitor-three-sport-daily-playability.yml", "utf8");
const unique = (cycle: readonly string[]) => [...new Set(cycle)].sort();

function branch(source: string, game: string) {
  const start = source.indexOf('if (projection.gameType === "' + game + '") {');
  expect(start, `No explicit route for ${game}`).toBeGreaterThan(-1);
  const next = source.indexOf('if (projection.gameType === "', start + 5);
  return source.slice(start, next < 0 ? undefined : next);
}

describe("all three official Daily calendars have playable primary routes", () => {
  it("covers every approved Football family in the actual /football/today route", () => {
    const early: Record<string, string> = {
      wavelength: "<Wavelength", who_am_i: "<OfficialWhoAmIDailyView",
      sports_feud: "<OfficialSportsFeudDailyView", average_fan: "<OfficialAverageFanDailyView",
      bar_trivia: "<OfficialBarTriviaDailyView", higher_lower: "<OfficialTodayChallengeContent",
      millionaire: "<OfficialMillionaireDailyView",
    };
    const fallback: Record<string, string> = {
      find_leader: "<FindLeader projection={projection}",
      hit_the_number: "<HitTheNumber projection={projection}",
    };
    const scheduled = unique(FOOTBALL_APPROVED_WEIGHTED_CYCLE);
    expect(scheduled).toEqual(Object.keys({ ...early, ...fallback }).sort());
    expect(football).toContain('const blindResume = projection.gameType === "blind_resume"');
    expect(football).toContain('const twoGameSeries = dailyTwoGameSeriesState(projection)');
    expect(football).toContain('if (twoGameSeries?.awaitingNext)');
    for (const game of scheduled) {
      if (early[game]) expect(branch(football, game)).toContain(early[game]);
      else expect(football).toContain('projection.gameType === "' + game + '" ? ' + fallback[game]);
      expect(footballPublisher).toContain('case "' + game + '":');
      expect(edge).toContain('if (gameType === "' + game + '")');
    }
    // The shared presenter is what converts active_round into the playable
    // Higher or Lower question. The route must not regress to the empty shell.
    expect(ufc).toContain("projection.publicState.active_round");
    expect(ufc).toContain("<OfficialFootballHigherLowerDailyView");
    expect(football).toContain('import { OfficialTodayChallengeContent }');
  });

  it("covers every scheduled UFC game on its official route, including the legacy five-game switch", () => {
    const direct: Record<string, string> = {
      hit_the_number: "<OfficialHitTheNumberDailyView",
      who_am_i: "<OfficialWhoAmIDailyView",
      millionaire: "<OfficialMillionaireDailyView",
      sports_feud: "<OfficialSportsFeudDailyView",
      bar_trivia: "<OfficialBarTriviaDailyView",
      average_fan: "<OfficialAverageFanDailyView",
      higher_lower: "<OfficialUfcHigherLowerDailyView",
    };
    const legacy: Record<string, string> = {
      find_leader: "<FindLeaderView",
      wavelength: "<WavelengthView",
      blind_resume: "<BlindResumeView",
    };
    const scheduled = unique(UFC_APPROVED_WEIGHTED_CYCLE);
    expect(scheduled).toEqual(Object.keys({ ...direct, ...legacy }).sort());
    for (const game of scheduled) {
      if (direct[game]) expect(ufc).toContain(direct[game]);
      else expect(ufcLegacy).toContain('case "' + game + '": return ' + legacy[game]);
    }
    expect(ufc).toContain("<DailyTwoGameStatus");
    expect(ufc).toContain('if (twoGameSeries?.awaitingNext)');
  });

  it("covers all nine NBA game families on /nba/today, including Higher or Lower two-game final", () => {
    const games = unique(NBA_DAILY_WEIGHTED_CYCLE);
    expect(games).toHaveLength(9);
    for (const game of games) {
      expect(nba).toContain('projection.gameType === "' + game + '" ? ');
    }
    expect(nba).toContain('if (projection.gameType === "higher_lower" && twoGame?.complete');
    expect(nba).toContain("nbaOfficialActiveRound(projection)");
    expect(nba).toContain('<DailyTwoGameLeaderboardResult projection={projection} sport="nba"');
    expect(nba).toContain('path'); // Route verified separately in nbaOfficialDailyUiIntegration.test.ts.
  });

  it("guards production scoring and actively monitors published and playable setups", () => {
    expect(scoringPublisher).toContain("('wavelength', 'find_leader', 'hit_the_number', 'higher_lower')");
    expect(scoringPublisher).toContain("publish_daily_challenge_setup");
    expect(monitoring).toContain('cron: "*/30 * * * *"');
    expect(monitoring).toContain("check-three-sport-daily-playability.mjs");
    expect(monitoring).toContain("issues: write");
    expect(monitoring).toContain("if: always()");
  });
});
