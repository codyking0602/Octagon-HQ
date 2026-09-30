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
  it("adds Average Fan without reducing the locked game weights", () => {
    expect(FOOTBALL_LOCKED_WEIGHTED_CYCLE).toHaveLength(26);
    expect(counts(FOOTBALL_LOCKED_WEIGHTED_CYCLE)).toEqual({
      sports_feud: 4,
      millionaire: 4,
      average_fan: 4,
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

  it("preserves September 29 and cuts the new immutable rotation on September 30", () => {
    expect(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY).toBe("2026-09-30");
    expect(lockedWeightedGameForDay("football", "2026-09-29")).toBe("bar_trivia");
    expect(lockedWeightedGameForDay("ufc", "2026-09-29")).toBe("bar_trivia");
    expect(lockedWeightedGameForDay("football", "2026-09-30")).toBe("wavelength");
    expect(lockedWeightedGameForDay("ufc", "2026-09-30")).toBe("sports_feud");
    expect(lockedWeightedGameForDay("football", "2026-10-01")).toBe("average_fan");
    expect(lockedWeightedGameForDay("ufc", "2026-10-02")).toBe("average_fan");
  });

  it("continues Football Bar Trivia NFL/CFB alternation across the schedule cutover", () => {
    const appearances = ["2026-09-29"];
    for (let offset = 0; appearances.length < 6; offset += 1) {
      const day = addDays(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY, offset);
      if (lockedWeightedGameForDay("football", day) === "bar_trivia") appearances.push(day);
    }
    expect(appearances).toEqual([
      "2026-09-29",
      "2026-10-06",
      "2026-10-16",
      "2026-10-25",
      "2026-11-01",
      "2026-11-11",
    ]);
    expect(appearances.map(footballBarTriviaLeagueForDay)).toEqual([
      "nfl", "cfb", "nfl", "cfb", "nfl", "cfb",
    ]);
  });

  it("keeps Average Fan staggered between sports in the opening window", () => {
    const football = Array.from({ length: 30 }, (_, offset) => offset)
      .filter((offset) => lockedWeightedGameForDay("football", addDays(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY, offset)) === "average_fan")
      .map((offset) => addDays(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY, offset));
    const ufc = Array.from({ length: 30 }, (_, offset) => offset)
      .filter((offset) => lockedWeightedGameForDay("ufc", addDays(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY, offset)) === "average_fan")
      .map((offset) => addDays(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY, offset));

    expect(football.slice(0, 4)).toEqual(["2026-10-01", "2026-10-07", "2026-10-13", "2026-10-19"]);
    expect(ufc.slice(0, 5)).toEqual(["2026-10-02", "2026-10-08", "2026-10-14", "2026-10-20", "2026-10-26"]);
    expect(football.filter((day) => ufc.includes(day))).toEqual([]);
  });
});
