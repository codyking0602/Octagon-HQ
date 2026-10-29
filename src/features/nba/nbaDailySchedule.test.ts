import { describe, expect, it } from "vitest";
import {
  NBA_CASUAL_GAME_TYPES, NBA_DAILY_GAME_LABELS, NBA_DAILY_WEIGHTED_CYCLE,
  NBA_DAILY_WEIGHTS, NBA_GAMES_LAUNCH_DAY, NBA_OFFICIAL_GAMES_RELEASE_READY,
  NBA_REGULAR_SEASON_LAST_DAY, nbaCanAccessPublicCasual, nbaCanAccessReleasedGames, nbaCentralDay,
  nbaOwnerPreviewDaily, nbaRegularSeasonDaily,
} from "./nbaDailySchedule";

describe("NBA official games release plan", () => {
  it("holds a balanced 28-appearance cycle using exactly nine Daily games", () => {
    expect(NBA_DAILY_WEIGHTED_CYCLE).toHaveLength(28);
    expect(Object.keys(NBA_DAILY_GAME_LABELS)).toHaveLength(9);
    for (const [game, weight] of Object.entries(NBA_DAILY_WEIGHTS)) {
      expect(NBA_DAILY_WEIGHTED_CYCLE.filter((entry) => entry === game)).toHaveLength(weight);
    }
    expect(new Set(NBA_DAILY_WEIGHTED_CYCLE).size).toBe(9);
    for (let i = 1; i < NBA_DAILY_WEIGHTED_CYCLE.length; i++) {
      expect(NBA_DAILY_WEIGHTED_CYCLE[i]).not.toBe(NBA_DAILY_WEIGHTED_CYCLE[i - 1]);
    }
    expect(NBA_CASUAL_GAME_TYPES).toEqual(["who_am_i", "find_leader", "hit_the_number", "higher_lower"]);
  });

  it("starts official NBA Daily October 30, opposite UFC, for 82 seasonal appearances", () => {
    expect(NBA_GAMES_LAUNCH_DAY).toBe("2026-10-30");
    expect(NBA_REGULAR_SEASON_LAST_DAY).toBe("2027-04-11");
    expect(nbaRegularSeasonDaily("2026-10-29")).toBeNull();
    expect(nbaRegularSeasonDaily("2026-10-30")).toMatchObject({
      day:"2026-10-30",nextDay:"2026-11-01",appearanceIndex:0,isPublicationDay:true,
    });
    expect(nbaRegularSeasonDaily("2026-10-31")).toMatchObject({
      day:"2026-10-30",nextDay:"2026-11-01",appearanceIndex:0,isPublicationDay:false,
    });
    expect(nbaRegularSeasonDaily("2026-11-01")).toMatchObject({
      day:"2026-11-01",nextDay:"2026-11-03",appearanceIndex:1,isPublicationDay:true,
    });
    expect(nbaRegularSeasonDaily("2027-04-11")?.appearanceIndex).toBe(81);
    expect(nbaRegularSeasonDaily("2027-04-12")).toBeNull();
  });
  it("retains owner preview segregation without leaking its scores to the public", () => {
    const games=Array.from({length:7},(_,index)=>
      nbaOwnerPreviewDaily(new Date(Date.UTC(2026,9,23+index)).toISOString().slice(0,10)));
    expect(new Set(games).size).toBe(7);
    expect(nbaOwnerPreviewDaily("2026-10-22")).toBeNull();
    expect(nbaOwnerPreviewDaily("2026-10-30")).toBeNull();
  });
  it("opens casual NBA immediately but official Daily no earlier than Oct 30", () => {
    expect(NBA_OFFICIAL_GAMES_RELEASE_READY).toBe(true);
    expect(nbaCanAccessPublicCasual("2026-10-28")).toBe(false);
    expect(nbaCanAccessPublicCasual("2026-10-29")).toBe(true);
    expect(nbaCanAccessReleasedGames("2026-10-29")).toBe(false);
    expect(nbaCanAccessReleasedGames("2026-10-30")).toBe(true);
    expect(nbaCanAccessReleasedGames("2027-04-12")).toBe(false);
    expect(nbaCanAccessPublicCasual("2027-04-12")).toBe(true);
    expect(() => nbaRegularSeasonDaily("2026-02-30")).toThrow("Invalid NBA Central date.");
  });
  it("derives dates using Chicago time rather than client local timezone", () => {
    expect(nbaCentralDay(new Date("2026-11-01T04:30:00Z"))).toBe("2026-10-31");
    expect(nbaCentralDay(new Date("2026-11-01T06:30:00Z"))).toBe("2026-11-01");
  });
});
