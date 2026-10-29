import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
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

  it("keeps frontend and server NBA weighted cycles identical after the anti-collision cutover", () => {
    const sql = readFileSync("supabase/migrations/202612310889_nba_public_oct30_daily_cutover.sql","utf8");
    const schedule = sql.match(/VALUES \('nba-daily-regular-v3-oct30-public'[\s\S]*?array\[([\s\S]*?)\]::text\[\],'nba'\)/);
    expect(schedule).not.toBeNull();
    const backendCycle = [...schedule![1]!.matchAll(/'([a-z_]+)'/g)].map(match => match[1]);
    expect(backendCycle).toEqual(NBA_DAILY_WEIGHTED_CYCLE);
    expect(nbaRegularSeasonDaily("2026-11-25")?.gameType).toBe("who_am_i");
  });

  it("publishes the reviewed Bar Trivia Oct 29–31, then alternates with UFC from Nov 1", () => {
    expect(NBA_GAMES_LAUNCH_DAY).toBe("2026-10-29");
    expect(NBA_REGULAR_SEASON_LAST_DAY).toBe("2027-04-11");
    expect(nbaRegularSeasonDaily("2026-10-28")).toBeNull();
    expect(nbaRegularSeasonDaily("2026-10-29")).toMatchObject({
      day:"2026-10-29",nextDay:"2026-11-01",gameType:"bar_trivia",appearanceIndex:0,isPublicationDay:true,
    });
    for (const day of ["2026-10-30","2026-10-31"]) {
      expect(nbaRegularSeasonDaily(day)).toMatchObject({
        day:"2026-10-29",nextDay:"2026-11-01",gameType:"bar_trivia",appearanceIndex:0,isPublicationDay:false,
      });
    }
    expect(nbaRegularSeasonDaily("2026-11-01")).toMatchObject({
      day:"2026-11-01",nextDay:"2026-11-03",gameType:"average_fan",appearanceIndex:1,isPublicationDay:true,
    });
    expect(nbaRegularSeasonDaily("2026-11-02")).toMatchObject({day:"2026-11-01",isPublicationDay:false});
    expect(nbaRegularSeasonDaily("2026-11-03")).toMatchObject({
      day:"2026-11-03",nextDay:"2026-11-05",gameType:"sports_feud",appearanceIndex:2,isPublicationDay:true,
    });
    expect(nbaRegularSeasonDaily("2027-04-11")?.appearanceIndex).toBe(81);
    expect(nbaRegularSeasonDaily("2027-04-12")).toBeNull();
  });
  it("retains exactly 82 official appearances including the launch board", () => {
    let count = 0;
    for (let at = Date.UTC(2026,9,29); at <= Date.UTC(2027,3,11); at += 86400000) {
      const slot = nbaRegularSeasonDaily(new Date(at).toISOString().slice(0,10));
      if (slot?.isPublicationDay) count++;
    }
    expect(count).toBe(82);
  });
  it("retains owner preview segregation without leaking its scores to the public", () => {
    const games=Array.from({length:7},(_,index)=>
      nbaOwnerPreviewDaily(new Date(Date.UTC(2026,9,23+index)).toISOString().slice(0,10)));
    expect(new Set(games).size).toBe(7);
    expect(nbaOwnerPreviewDaily("2026-10-22")).toBeNull();
    expect(nbaOwnerPreviewDaily("2026-10-30")).toBeNull();
  });
  it("opens official NBA Daily with the owner-reviewed Oct 29 public board", () => {
    expect(NBA_OFFICIAL_GAMES_RELEASE_READY).toBe(true);
    expect(nbaCanAccessPublicCasual("2026-10-28")).toBe(false);
    expect(nbaCanAccessPublicCasual("2026-10-29")).toBe(true);
    expect(nbaCanAccessReleasedGames("2026-10-28")).toBe(false);
    expect(nbaCanAccessReleasedGames("2026-10-29")).toBe(true);
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
