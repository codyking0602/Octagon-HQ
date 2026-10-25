import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  DAILY_WEIGHTED_ROTATION_CUTOVER_DAY,
  FOOTBALL_LOCKED_WEIGHTED_CYCLE,
  UFC_LOCKED_WEIGHTED_CYCLE,
  FOOTBALL_FUTURE_WEIGHTED_CYCLE,
  UFC_FUTURE_WEIGHTED_CYCLE,
  THREE_SPORT_CADENCE_CUTOVER_DAY,
  footballBarTriviaLeagueForDay,
  lockedWeightedGameForDay,
  ufcActiveDailyDay,
  isUfcPublicationDay,
} from "./dailyChallengeRotation";
import { NBA_DAILY_WEIGHTED_CYCLE, NBA_DAILY_WEIGHTS, nbaRegularSeasonDaily } from "../nba/nbaDailySchedule";

function add(day: string, offset: number) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, date! + offset)).toISOString().slice(0, 10);
}
function counts(cycle: readonly string[]) {
  return cycle.reduce<Record<string, number>>((result, game) => {
    result[game] = (result[game] ?? 0) + 1;
    return result;
  }, {});
}
const start = "2026-10-25";
const horizon = Array.from({ length: 182 }, (_, index) => add(start, index));

describe("locked three-sport Daily scheduling policy", () => {
  it("matches every future SQL canonical cycle to the TypeScript content-calendar mirror", () => {
    const migration = readFileSync(new URL("../../../supabase/migrations/202612310406_lock_three_sport_daily_cadence.sql", import.meta.url), "utf8");
    function sqlCycle(version: string) {
      const marker = `('${version}','America/Chicago'`;
      const start = migration.indexOf(marker);
      expect(start).toBeGreaterThanOrEqual(0);
      const open = migration.indexOf("array[", start) + 6;
      const close = migration.indexOf("]::text[]", open);
      expect(close).toBeGreaterThan(open);
      return [...migration.slice(open, close).matchAll(/'([a-z_]+)'/g)].map((match) => match[1]);
    }
    expect(sqlCycle("football-daily-v21-locked-oct25")).toEqual(FOOTBALL_FUTURE_WEIGHTED_CYCLE);
    expect(sqlCycle("ufc-daily-v21-48h-oct25")).toEqual(UFC_FUTURE_WEIGHTED_CYCLE);
    expect(sqlCycle("nba-daily-regular-v2-locked")).toEqual(NBA_DAILY_WEIGHTED_CYCLE);
  });

  it("preserves historical October boards and the Football NFL/CFB Bar Trivia parity", () => {
    expect(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY).toBe("2026-10-01");
    expect(THREE_SPORT_CADENCE_CUTOVER_DAY).toBe(start);
    expect(FOOTBALL_LOCKED_WEIGHTED_CYCLE).toHaveLength(27);
    expect(UFC_LOCKED_WEIGHTED_CYCLE).toHaveLength(29);
    expect(lockedWeightedGameForDay("football", "2026-10-01")).toBe("bar_trivia");
    expect(lockedWeightedGameForDay("ufc", "2026-10-02")).toBe("average_fan");
    expect(lockedWeightedGameForDay("ufc", "2026-10-24")).toBe("bar_trivia");
    expect(footballBarTriviaLeagueForDay("2026-09-29")).toBe("nfl");
    expect(footballBarTriviaLeagueForDay("2026-10-22")).toBe("cfb");
    expect(footballBarTriviaLeagueForDay("2026-11-01")).toBe("nfl");
  });

  it("preserves all approved active weights without scheduling unfinished Higher or Lower", () => {
    expect(counts(FOOTBALL_FUTURE_WEIGHTED_CYCLE)).toEqual({
      who_am_i: 3, millionaire: 4, find_leader: 3, hit_the_number: 2,
      wavelength: 3, sports_feud: 4, average_fan: 4, bar_trivia: 3,
    });
    expect(counts(UFC_FUTURE_WEIGHTED_CYCLE)).toEqual({
      find_leader: 3, sports_feud: 4, millionaire: 4, wavelength: 3,
      bar_trivia: 3, average_fan: 4, blind_resume: 2,
      who_am_i: 3, hit_the_number: 2,
    });
    expect(counts(NBA_DAILY_WEIGHTED_CYCLE)).toEqual(NBA_DAILY_WEIGHTS);
    expect(FOOTBALL_FUTURE_WEIGHTED_CYCLE).not.toContain("higher_lower");
    expect(UFC_FUTURE_WEIGHTED_CYCLE).not.toContain("higher_lower");
  });

  it("publishes Football daily, UFC on Oct 25/27/29, NBA on Nov 1/3/5, with no drift", () => {
    let football = 0, ufc = 0, nba = 0;
    for (const day of horizon) {
      football++;
      const uf = isUfcPublicationDay(day);
      const nb = nbaRegularSeasonDaily(day);
      if (uf) ufc++;
      if (nb?.isPublicationDay) nba++;
      if (day >= "2026-11-01" && day <= "2027-04-11") {
        expect(uf && nb?.isPublicationDay).toBe(false);
      }
      expect(ufcActiveDailyDay(day)).toBe(
        add(start, Math.floor((Date.parse(day) - Date.parse(start)) / 172800000) * 2),
      );
    }
    expect([football, ufc, nba]).toEqual([182, 91, 81]);
    expect(isUfcPublicationDay("2026-10-25")).toBe(true);
    expect(isUfcPublicationDay("2026-10-26")).toBe(false);
    expect(ufcActiveDailyDay("2026-11-01")).toBe("2026-10-31");
    expect(nbaRegularSeasonDaily("2027-04-12")).toBeNull();
  });

  it("has no identical cross-sport game on the same publication date in six months", () => {
    for (const day of horizon) {
      const football = lockedWeightedGameForDay("football", day);
      const ufc = isUfcPublicationDay(day) ? lockedWeightedGameForDay("ufc", day) : null;
      const nba = nbaRegularSeasonDaily(day);
      const nbaGame = nba?.isPublicationDay ? nba.gameType : null;
      expect(football).not.toBe(ufc);
      expect(football).not.toBe(nbaGame);
      expect(ufc && ufc === nbaGame).toBeFalsy();
    }
  });

  it("bounds cyclic appearance spacing, including rollover, without misleading clusters", () => {
    for (const [cycle, daysPerSlot] of [
      [FOOTBALL_FUTURE_WEIGHTED_CYCLE, 1],
      [UFC_FUTURE_WEIGHTED_CYCLE, 2],
      [NBA_DAILY_WEIGHTED_CYCLE, 2],
    ] as const) {
      const byType = counts(cycle);
      for (const [game, count] of Object.entries(byType)) {
        const locations = cycle.map((type, index) => type === game ? index : -1).filter((i) => i >= 0);
        const gaps = locations.map((at, index) =>
          ((locations[(index + 1) % locations.length]! - at + cycle.length) % cycle.length) * daysPerSlot);
        const ideal = cycle.length * daysPerSlot / count;
        expect(Math.min(...gaps)).toBeGreaterThanOrEqual(ideal - 5);
        expect(Math.max(...gaps)).toBeLessThanOrEqual(ideal + 5);
      }
    }
  });

  it("replays deterministically across refresh/retry and 48-hour board boundaries", () => {
    const first = horizon.map((d) => [d,
      lockedWeightedGameForDay("football", d),
      lockedWeightedGameForDay("ufc", d),
      nbaRegularSeasonDaily(d)?.gameType ?? null,
    ]);
    expect(horizon.map((d) => [d, lockedWeightedGameForDay("football", d),
      lockedWeightedGameForDay("ufc", d), nbaRegularSeasonDaily(d)?.gameType ?? null])).toEqual(first);
    expect(lockedWeightedGameForDay("ufc", "2026-10-25")).toBe(lockedWeightedGameForDay("ufc", "2026-10-26"));
    expect(lockedWeightedGameForDay("ufc", "2026-10-26")).not.toBe(lockedWeightedGameForDay("ufc", "2026-10-27"));
  });
});
