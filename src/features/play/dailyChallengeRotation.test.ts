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
  it("adds Average Fan as an exact 5x game without reducing existing weights", () => {
    expect(FOOTBALL_LOCKED_WEIGHTED_CYCLE).toHaveLength(27);
    expect(counts(FOOTBALL_LOCKED_WEIGHTED_CYCLE)).toEqual({
      sports_feud: 4,
      millionaire: 4,
      average_fan: 5,
      bar_trivia: 3,
      wavelength: 3,
      who_am_i: 3,
      find_leader: 3,
      hit_the_number: 2,
    });
    expect(FOOTBALL_LOCKED_WEIGHTED_CYCLE).not.toContain("blind_resume");

    expect(UFC_LOCKED_WEIGHTED_CYCLE).toHaveLength(29);
    expect(counts(UFC_LOCKED_WEIGHTED_CYCLE)).toEqual({
      average_fan: 5,
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

  it("launches Average Fan in both sports on October 1", () => {
    expect(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY).toBe("2026-10-01");
    expect(lockedWeightedGameForDay("football", "2026-10-01")).toBe("average_fan");
    expect(lockedWeightedGameForDay("ufc", "2026-10-01")).toBe("average_fan");
  });

  it("continues Football Bar Trivia NFL/CFB alternation after the Sep 29 NFL debut", () => {
    expect(footballBarTriviaLeagueForDay("2026-09-29")).toBe("nfl");
    const appearances = Array.from({ length: 100 }, (_, offset) => offset)
      .filter((offset) => lockedWeightedGameForDay("football", addDays(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY, offset)) === "bar_trivia")
      .slice(0, 6)
      .map((offset) => addDays(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY, offset));

    expect(appearances).toEqual([
      "2026-10-02",
      "2026-10-14",
      "2026-10-22",
      "2026-10-29",
      "2026-11-10",
      "2026-11-18",
    ]);
    expect(appearances.map(footballBarTriviaLeagueForDay)).toEqual([
      "cfb", "nfl", "cfb", "nfl", "cfb", "nfl",
    ]);
  });

  it("avoids UFC/Football challenge collisions after launch whenever possible", () => {
    const collisions = Array.from({ length: 180 }, (_, offset) => offset)
      .filter((offset) => {
        const day = addDays(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY, offset);
        return lockedWeightedGameForDay("football", day) === lockedWeightedGameForDay("ufc", day);
      });

    expect(collisions).toEqual([0]);
  });
});
