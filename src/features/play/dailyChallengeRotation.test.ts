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
  it("preserves the historical October 1 launch weights before the future 4x cutover", () => {
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

  it("swaps October 1 and October 2 so Average Fan relaunches one day later", () => {
    expect(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY).toBe("2026-10-01");
    expect(lockedWeightedGameForDay("football", "2026-10-01")).toBe("bar_trivia");
    expect(lockedWeightedGameForDay("ufc", "2026-10-01")).toBe("who_am_i");
    expect(lockedWeightedGameForDay("football", "2026-10-02")).toBe("average_fan");
    expect(lockedWeightedGameForDay("ufc", "2026-10-02")).toBe("average_fan");
    expect(lockedWeightedGameForDay("football", "2026-10-03")).toBe("millionaire");
    expect(lockedWeightedGameForDay("ufc", "2026-10-03")).toBe("blind_resume");
  });

  it("preserves pre-cutover NFL/CFB Bar Trivia game identities and alternating league order", () => {
    expect(footballBarTriviaLeagueForDay("2026-09-29")).toBe("nfl");
    expect(footballBarTriviaLeagueForDay("2026-10-01")).toBe("cfb");
    expect(footballBarTriviaLeagueForDay("2026-10-14")).toBe("nfl");
    expect(footballBarTriviaLeagueForDay("2026-10-22")).toBe("cfb");
    expect(footballBarTriviaLeagueForDay("2026-10-29")).toBe("nfl");
    expect(footballBarTriviaLeagueForDay("2026-11-09")).toBe("cfb");
    expect(footballBarTriviaLeagueForDay("2026-11-15")).toBe("nfl");
  });

  it("keeps the only near-term UFC/Football collision on the intentional Oct 2 Average Fan retry", () => {
    const collisions = Array.from({ length: 24 }, (_, offset) => offset)
      .filter((offset) => {
        const day = addDays(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY, offset);
        return lockedWeightedGameForDay("football", day) === lockedWeightedGameForDay("ufc", day);
      });

    expect(collisions).toEqual([1]);
  });
});
