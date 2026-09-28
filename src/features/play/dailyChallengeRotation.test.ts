import { describe, expect, it } from "vitest";
import {
  DAILY_WEIGHTED_ROTATION_CUTOVER_DAY,
  FOOTBALL_LOCKED_WEIGHTED_CYCLE,
  UFC_LOCKED_WEIGHTED_CYCLE,
  footballBarTriviaLeagueForDay,
  lockedWeightedGameForDay,
} from "./dailyChallengeRotation";

function counts(cycle: readonly string[]) {
  return cycle.reduce<Record<string, number>>((result, game) => {
    result[game] = (result[game] ?? 0) + 1;
    return result;
  }, {});
}

function addDays(day: string, offset: number) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, date! + offset)).toISOString().slice(0, 10);
}

describe("locked Daily Challenge rotation", () => {
  it("uses the approved Football and UFC weights exactly", () => {
    expect(FOOTBALL_LOCKED_WEIGHTED_CYCLE).toHaveLength(22);
    expect(counts(FOOTBALL_LOCKED_WEIGHTED_CYCLE)).toEqual({
      sports_feud: 4,
      millionaire: 4,
      bar_trivia: 3,
      wavelength: 3,
      who_am_i: 3,
      find_leader: 3,
      hit_the_number: 2,
    });
    expect(FOOTBALL_LOCKED_WEIGHTED_CYCLE).not.toContain("blind_resume");

    expect(UFC_LOCKED_WEIGHTED_CYCLE).toHaveLength(24);
    expect(counts(UFC_LOCKED_WEIGHTED_CYCLE)).toEqual({
      sports_feud: 4,
      millionaire: 4,
      bar_trivia: 3,
      wavelength: 3,
      who_am_i: 3,
      find_leader: 3,
      hit_the_number: 2,
      blind_resume: 2,
    });
  });

  it("forces the September 29 Bar Trivia debut for both sports", () => {
    expect(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY).toBe("2026-09-29");
    expect(lockedWeightedGameForDay("football", "2026-09-29")).toBe("bar_trivia");
    expect(lockedWeightedGameForDay("ufc", "2026-09-29")).toBe("bar_trivia");
  });

  it("starts Football Bar Trivia with NFL and alternates NFL and CFB by appearance", () => {
    const appearances: Array<{ day: string; league: string }> = [];
    for (let offset = 0; appearances.length < 10; offset += 1) {
      const day = addDays(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY, offset);
      if (lockedWeightedGameForDay("football", day) === "bar_trivia") {
        appearances.push({ day, league: footballBarTriviaLeagueForDay(day) });
      }
    }

    expect(appearances.slice(0, 6)).toEqual([
      { day: "2026-09-29", league: "nfl" },
      { day: "2026-10-05", league: "cfb" },
      { day: "2026-10-13", league: "nfl" },
      { day: "2026-10-21", league: "cfb" },
      { day: "2026-10-27", league: "nfl" },
      { day: "2026-11-04", league: "cfb" },
    ]);
    expect(appearances.map((appearance) => appearance.league)).toEqual(
      appearances.map((_appearance, index) => index % 2 === 0 ? "nfl" : "cfb"),
    );
  });

  it("is deterministic and minimizes cross-sport same-game dates without changing weights", () => {
    for (let offset = 0; offset < 264; offset += 1) {
      const day = addDays(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY, offset);
      expect(lockedWeightedGameForDay("football", day)).toBe(
        lockedWeightedGameForDay("football", day),
      );
      expect(lockedWeightedGameForDay("ufc", day)).toBe(
        lockedWeightedGameForDay("ufc", day),
      );
    }

    const collisions = Array.from({ length: 264 }, (_, offset) => offset)
      .filter((offset) => {
        const day = addDays(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY, offset);
        return lockedWeightedGameForDay("football", day) === lockedWeightedGameForDay("ufc", day);
      });

    expect(collisions).toEqual([0, 72, 168]);
    expect(collisions.map((offset) => lockedWeightedGameForDay(
      "football",
      addDays(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY, offset),
    ))).toEqual(["bar_trivia", "bar_trivia", "bar_trivia"]);
    expect(collisions.filter((offset) => offset < 60)).toEqual([0]);
  });
});
