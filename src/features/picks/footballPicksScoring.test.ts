import { describe, expect, it } from "vitest";
import {
  FOOTBALL_FUTURES_MAX_POINTS,
  FOOTBALL_FUTURES_RULES,
  FOOTBALL_FUTURES_TOTAL_POINTS,
  footballChampionship,
  footballLockAllowance,
  gradeFootballAts,
  rankFootballChampionship,
  scoreFootballFutures,
  type FootballFuturesPicks,
  type FootballFuturesResults,
} from "./footballPicksScoring";

const final = { pickedTeam: "home" as const, homeScore: 24, awayScore: 20, frozenSpreadHome: -3, isFinal: true };

const perfectFuturesPicks: FootballFuturesPicks = {
  cfbPower4Champions: ["clemson", "kansas-state", "ohio-state", "texas"],
  cfbPlayoffTeams: [
    "clemson", "kansas-state", "ohio-state", "texas", "georgia", "oregon",
    "notre-dame", "penn-state", "alabama", "miami", "lsu", "boise-state",
  ],
  cfbSemifinalists: ["texas", "ohio-state", "georgia", "oregon"],
  cfbHeisman: "arch-manning",
  cfbNationalChampion: "texas",
  nflDivisionChampions: [
    "bills", "ravens", "texans", "chiefs", "cowboys", "packers", "buccaneers", "rams",
  ],
  nflPlayoffTeams: [
    "bills", "ravens", "texans", "chiefs", "cowboys", "packers", "buccaneers", "rams",
    "bengals", "chargers", "eagles", "lions", "49ers", "falcons",
  ],
  nflConferenceChampionshipTeams: ["chiefs", "ravens", "cowboys", "packers"],
  nflMvp: "dak-prescott",
  nflSuperBowlChampion: "cowboys",
};

const perfectFuturesResults: FootballFuturesResults = { ...perfectFuturesPicks };

describe("canonical Football Picks competition rules", () => {
  it("grades normal ATS wins, losses and pushes", () => {
    expect(gradeFootballAts(final)).toEqual({ outcome: "win", points: 1 });
    expect(gradeFootballAts({ ...final, frozenSpreadHome: -5 })).toEqual({ outcome: "loss", points: 0 });
    expect(gradeFootballAts({ ...final, frozenSpreadHome: -4 })).toEqual({ outcome: "push", points: 0.5 });
  });
  it("uses the frozen publication spread rather than accepting a later market line", () => {
    expect(gradeFootballAts({ ...final, frozenSpreadHome: -3 }).points).toBe(1);
  });
  it("makes a Lock worth three total on a win, zero on a loss, and one-half on a push", () => {
    expect(gradeFootballAts({ ...final, isLock: true }).points).toBe(3);
    expect(gradeFootballAts({ ...final, frozenSpreadHome: -5, isLock: true }).points).toBe(0);
    expect(gradeFootballAts({ ...final, frozenSpreadHome: -4, isLock: true }).points).toBe(0.5);
  });
  it.each([[12, 3], [6, 2], [11, 2], [2, 1], [5, 1], [1, 0]])("allows %i games => %i Locks", (games, locks) => {
    expect(footballLockAllowance(games)).toBe(locks);
  });
  it("treats the one-game Super Bowl as a normal pick with no Lock", () => {
    expect(footballLockAllowance(1)).toBe(0);
    expect(gradeFootballAts(final).points).toBe(1);
  });
  it("automatically drops exactly one deterministic lowest week", () => {
    const result = footballChampionship([
      { weekId: "week-1", points: 8, wins: 5, losses: 2, pushes: 1 },
      { weekId: "missed-1", points: 0, wins: 0, losses: 0, pushes: 0 },
      { weekId: "missed-2", points: 0, wins: 0, losses: 0, pushes: 0 },
    ]);
    expect(result).toMatchObject({ rawPoints: 8, adjustedPoints: 8, droppedWeekId: "missed-1", wins: 5, losses: 2, pushes: 1 });
    expect(result.atsPercentage).toBeCloseTo(5 / 7);
  });
  it("keeps every supplied championship week, including the Super Bowl, in one total", () => {
    expect(footballChampionship([
      { weekId: "opening", points: 1, wins: 1, losses: 0, pushes: 0 },
      { weekId: "super-bowl", points: 1, wins: 1, losses: 0, pushes: 0 },
    ]).adjustedPoints).toBe(1);
  });
  it("orders standings only by adjusted championship points and leaves ties stable", () => {
    expect(rankFootballChampionship([{ id: "a", adjustedPoints: 4 }, { id: "b", adjustedPoints: 7 }]).map(row => row.id)).toEqual(["b", "a"]);
  });
  it("does not misgrade unresolved or cancelled games and is deterministic", () => {
    const unresolved = { ...final, isFinal: false };
    expect(gradeFootballAts(unresolved)).toEqual({ outcome: "unresolved", points: 0 });
    expect(gradeFootballAts({ ...final, isCancelled: true })).toEqual({ outcome: "unresolved", points: 0 });
    expect(gradeFootballAts(final)).toEqual(gradeFootballAts(final));
  });
});

describe("canonical 78-point Football Futures rules", () => {
  it("locks the calibrated category counts and 38 + 40 = 78 maximum", () => {
    expect(FOOTBALL_FUTURES_RULES).toEqual({
      cfb: {
        power4Champions: { selections: 4, pointsEach: 2 },
        playoffTeams: { selections: 12, pointsEach: 1 },
        semifinalists: { selections: 4, pointsEach: 2 },
        heisman: { selections: 1, pointsEach: 3 },
        nationalChampion: { selections: 1, pointsEach: 7 },
      },
      nfl: {
        divisionChampions: { selections: 8, pointsEach: 1 },
        playoffTeams: { selections: 14, pointsEach: 1 },
        conferenceChampionshipTeams: { selections: 4, pointsEach: 2 },
        mvp: { selections: 1, pointsEach: 3 },
        superBowlChampion: { selections: 1, pointsEach: 7 },
      },
    });
    expect(FOOTBALL_FUTURES_MAX_POINTS).toEqual({ cfb: 38, nfl: 40, total: 78 });
    expect(FOOTBALL_FUTURES_TOTAL_POINTS).toBe(78);
  });

  it("awards the full 78 only when every Futures selection is correct", () => {
    expect(scoreFootballFutures(perfectFuturesPicks, perfectFuturesResults)).toEqual({
      cfb: {
        power4Champions: 8,
        playoffTeams: 12,
        semifinalists: 8,
        heisman: 3,
        nationalChampion: 7,
        total: 38,
      },
      nfl: {
        divisionChampions: 8,
        playoffTeams: 14,
        conferenceChampionshipTeams: 8,
        mvp: 3,
        superBowlChampion: 7,
        total: 40,
      },
      total: 78,
    });
  });

  it("scores partial results by category without double-counting duplicate result ids", () => {
    const result = scoreFootballFutures(perfectFuturesPicks, {
      cfbPower4Champions: ["texas", "texas"],
      cfbPlayoffTeams: ["texas", "ohio-state", "not-picked"],
      cfbSemifinalists: ["texas"],
      cfbHeisman: null,
      cfbNationalChampion: "texas",
      nflDivisionChampions: ["cowboys", "cowboys"],
      nflPlayoffTeams: ["cowboys", "eagles"],
      nflConferenceChampionshipTeams: ["cowboys"],
      nflMvp: null,
      nflSuperBowlChampion: "chiefs",
    });

    expect(result).toEqual({
      cfb: {
        power4Champions: 2,
        playoffTeams: 2,
        semifinalists: 2,
        heisman: 0,
        nationalChampion: 7,
        total: 13,
      },
      nfl: {
        divisionChampions: 1,
        playoffTeams: 2,
        conferenceChampionshipTeams: 2,
        mvp: 0,
        superBowlChampion: 0,
        total: 5,
      },
      total: 18,
    });
  });
});
