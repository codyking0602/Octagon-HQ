import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  FOOTBALL_APPROVED_WEIGHTED_CYCLE,
  UFC_APPROVED_WEIGHTED_CYCLE,
} from "../features/play/dailyChallengeRotation";
import { NBA_DAILY_WEIGHTED_CYCLE } from "../features/nba/nbaDailySchedule";
import { dailyUsesTwoGameAverage } from "../features/play/dailyTwoGameContract";

const football = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");
const ufc = readFileSync("src/features/play/OfficialTodayChallengePage.tsx", "utf8");
const ufcLegacy = readFileSync("src/features/play/OfficialTodayChallengePresentation.tsx", "utf8");
const nba = readFileSync("src/features/nba/NbaOfficialDailyPage.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");

function unique(values: readonly string[]) {
  return [...new Set(values)].sort();
}

/**
 * This is the production-route coverage gate that was missing on November 5.
 * Standalone game tests and schedule tests were green while /football/today
 * showed no Higher or Lower board. Match *actual rendered child components*
 * in the active route, not labels, adapters, or unrelated owner-preview code.
 * Any new game added to a live rotation must declare its playable route here.
 */
describe("every scheduled Daily has a rendered production entry route", () => {
  const footballMain = football.slice(football.indexOf("  if (projection.gameType === \"wavelength\") {"));
  const ufcMain = ufc.slice(ufc.indexOf("export function OfficialTodayChallengeContent("));
  const nbaMain = nba.slice(nba.indexOf("export function NbaOfficialDailyContent("));

  it("keeps the database publisher scoring contract aligned with every scheduled two-game Daily", () => {
    const publisher = readFileSync(
      "supabase/migrations/202612310941_football_higher_lower_two_game_publication.sql",
      "utf8",
    );
    const allowlist = publisher.match(
      /p_game_type in \\(([^)]*)\\)\\s+and p_scoring_version = 'daily-two-game-average-score-v1'/,
    );
    expect(allowlist).not.toBeNull();
    const sqlTypes = [...allowlist![1]!.matchAll(/'([a-z_]+)'/g)].map(match => match[1]);
    const scheduled = [
      ...FOOTBALL_APPROVED_WEIGHTED_CYCLE,
      ...UFC_APPROVED_WEIGHTED_CYCLE,
      ...NBA_DAILY_WEIGHTED_CYCLE,
    ];
    const twoGameTypes = unique(scheduled).filter(game => dailyUsesTwoGameAverage(game, "2026-11-06"));
    expect(unique(sqlTypes)).toEqual(twoGameTypes);
  });

  it("covers every approved Football Daily game on the actual /football/today route", () => {
    const expected = {
      who_am_i: 'projection.gameType === "who_am_i") {',
      millionaire: 'projection.gameType === "millionaire") {',
      find_leader: 'projection.gameType === "find_leader" ? <FindLeader',
      hit_the_number: 'projection.gameType === "hit_the_number" ? <HitTheNumber',
      wavelength: 'projection.gameType === "wavelength") {',
      sports_feud: 'projection.gameType === "sports_feud") {',
      average_fan: 'projection.gameType === "average_fan") {',
      bar_trivia: 'projection.gameType === "bar_trivia") {',
      higher_lower: 'projection.gameType === "higher_lower") {',
    } as const;
    expect(unique(FOOTBALL_APPROVED_WEIGHTED_CYCLE)).toEqual(unique(Object.keys(expected)));
    for (const [game, branch] of Object.entries(expected)) {
      expect(footballMain, `Football primary route must render ${game}`).toContain(branch.replace("\\n", "\n"));
    }
    // Dedicated branches must render a board rather than only status/chrome.
    for (const component of [
      "<Wavelength ", "<OfficialWhoAmIDailyView ", "<OfficialMillionaireDailyView",
      "<OfficialSportsFeudDailyView", "<OfficialAverageFanDailyView",
      "<OfficialBarTriviaDailyView", "<OfficialTodayChallengeContent",
      "<FindLeader ", "<HitTheNumber ",
    ]) {
      expect(footballMain).toContain(component);
    }
    expect(footballMain).toContain("if (!footballTodayHasLegacyBoard(projection.gameType))");
    expect(footballMain).toContain("Today’s board can’t be displayed");
    expect(router).toContain('path: "football/today"');
  });

  it("covers every approved UFC Daily game on its actual official game route", () => {
    const expected = {
      find_leader: "<FindLeaderView",
      sports_feud: "<OfficialSportsFeudDailyView",
      millionaire: "<OfficialMillionaireDailyView",
      wavelength: "<WavelengthView",
      bar_trivia: "<OfficialBarTriviaDailyView",
      average_fan: "<OfficialAverageFanDailyView",
      blind_resume: "<BlindResumeView",
      who_am_i: "<OfficialWhoAmIDailyView",
      hit_the_number: "<OfficialHitTheNumberDailyView",
      higher_lower: "<OfficialUfcHigherLowerDailyView",
    } as const;
    expect(unique(UFC_APPROVED_WEIGHTED_CYCLE)).toEqual(unique(Object.keys(expected)));
    for (const [game, component] of Object.entries(expected)) {
      const source = ["find_leader", "wavelength", "blind_resume"].includes(game) ? ufcLegacy : ufcMain;
      expect(source, `UFC primary route must render ${game}`).toContain(component);
    }
    // Unknown modes must show a visible failure instead of React undefined.
    expect(ufcLegacy).toContain("Today’s board can’t be displayed");
  });

  it("covers every NBA Daily game on the /nba/today route", () => {
    const expected = {
      average_fan: "<OfficialAverageFanDailyView",
      sports_feud: "<OfficialSportsFeudDailyView",
      millionaire: "<OfficialMillionaireDailyView",
      who_am_i: "<OfficialWhoAmIDailyView",
      find_leader: "<NbaOfficialFindLeader",
      wavelength: "<NbaOfficialWavelength",
      bar_trivia: "<OfficialBarTriviaDailyView",
      hit_the_number: "<NbaOfficialHitTheNumber",
      higher_lower: "<NbaOfficialHigherLower",
    } as const;
    expect(unique(NBA_DAILY_WEIGHTED_CYCLE)).toEqual(unique(Object.keys(expected)));
    for (const [game, component] of Object.entries(expected)) {
      expect(nbaMain, `NBA primary route must render ${game}`).toContain(
        `projection.gameType === "${game}" ? ${component}`,
      );
    }
    expect(nbaMain).toContain("Today’s board can’t be displayed");
    expect(router).toContain('path: "nba/today"');
  });
});
