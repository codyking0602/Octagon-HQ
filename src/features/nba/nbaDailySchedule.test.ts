import { describe, expect, it } from "vitest";
import {
  NBA_CASUAL_GAME_TYPES, NBA_DAILY_GAME_LABELS, NBA_DAILY_WEIGHTED_CYCLE,
  NBA_DAILY_WEIGHTS, NBA_GAMES_LAUNCH_DAY, NBA_OFFICIAL_GAMES_RELEASE_READY,
  NBA_REGULAR_SEASON_LAST_DAY, nbaCanAccessReleasedGames, nbaCentralDay,
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

  it("runs every other day Nov 1 to Apr 11, with 81 regular-season appearances", () => {
    expect(NBA_GAMES_LAUNCH_DAY).toBe("2026-11-01");
    expect(NBA_REGULAR_SEASON_LAST_DAY).toBe("2027-04-11");
    expect(nbaRegularSeasonDaily("2026-10-31")).toBeNull();
    expect(nbaRegularSeasonDaily("2026-11-01")).toMatchObject({
      day: "2026-11-01", nextDay: "2026-11-03", appearanceIndex: 0, isPublicationDay: true,
    });
    expect(nbaRegularSeasonDaily("2026-11-02")).toMatchObject({
      day: "2026-11-01", nextDay: "2026-11-03", appearanceIndex: 0, isPublicationDay: false,
    });
    expect(nbaRegularSeasonDaily("2027-04-11")?.appearanceIndex).toBe(80);
    expect(nbaRegularSeasonDaily("2027-04-12")).toBeNull();
  });

  it("previews all nine games on distinct owner-only days before public launch", () => {
    const games = Array.from({ length: 9 }, (_, index) =>
      nbaOwnerPreviewDaily(new Date(Date.UTC(2026, 9, 23 + index)).toISOString().slice(0, 10)));
    expect(new Set(games).size).toBe(9);
    expect(nbaOwnerPreviewDaily("2026-10-22")).toBeNull();
    expect(nbaOwnerPreviewDaily("2026-11-01")).toBeNull();
  });

  it("does not let a date alone release locally scored previews", () => {
    expect(NBA_OFFICIAL_GAMES_RELEASE_READY).toBe(false);
    expect(nbaCanAccessReleasedGames("2026-11-01")).toBe(false);
    expect(nbaCanAccessReleasedGames("2027-01-01")).toBe(false);
    expect(() => nbaRegularSeasonDaily("2026-02-30")).toThrow("Invalid NBA Central date.");
  });

  it("derives dates using Chicago time rather than client local timezone", () => {
    expect(nbaCentralDay(new Date("2026-11-01T04:30:00Z"))).toBe("2026-10-31");
    expect(nbaCentralDay(new Date("2026-11-01T06:30:00Z"))).toBe("2026-11-01");
  });
});
