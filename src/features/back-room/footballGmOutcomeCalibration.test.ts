import { describe, expect, it } from "vitest";
import { footballGmOutcomeProbabilities, footballGmSeasonRoll } from "./footballGmStrategy";

describe("The GM grade-driven postseason calibration", () => {
  it("gives elite team grades elite playoff floors", () => {
    const grade90 = footballGmOutcomeProbabilities(90);
    const grade92 = footballGmOutcomeProbabilities(92);

    expect(grade90.Champion).toBeCloseTo(0.232, 10);
    expect(grade90["Missed Playoffs"] + grade90["Wild Card"] + grade90.Divisional).toBeCloseTo(0.422, 10);
    expect(grade92.Champion).toBeCloseTo(0.434, 10);
    expect(grade92["Missed Playoffs"] + grade92["Wild Card"] + grade92.Divisional).toBeCloseTo(0.217, 10);
  });

  it("uses one postseason environment for both GMs in the same head-to-head season", () => {
    const matchSeed = "0123456789abcdef0123456789abcdef";
    const left = `${matchSeed}:11111111-1111-4111-8111-111111111111`;
    const right = `${matchSeed}:22222222-2222-4222-8222-222222222222`;

    for (const year of [1, 2, 3] as const) {
      expect(footballGmSeasonRoll(left, year)).toBe(footballGmSeasonRoll(right, year));
    }
  });
});
