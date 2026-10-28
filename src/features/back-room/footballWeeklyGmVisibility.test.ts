import { describe, expect, it } from "vitest";
import { canViewWeeklyGmScenario, canViewWeeklyGmTotal } from "./footballWeeklyGmVisibility";
import type { WeeklyGmAttempt } from "./footballWeeklyGmRepository";

const finished: WeeklyGmAttempt = { seed: "a", state: null, completed: true, score: 91 };
const unfinished: WeeklyGmAttempt = { seed: "b", state: null, completed: false, score: null };

describe("Weekly GM spoiler-free leaderboard", () => {
  it("hides both individual scores and totals before either franchise", () => {
    expect(canViewWeeklyGmScenario({}, "elite")).toBe(false);
    expect(canViewWeeklyGmScenario({}, "young")).toBe(false);
    expect(canViewWeeklyGmTotal({})).toBe(false);
  });
  it("unlocks only the matching opponent run after the player's first run", () => {
    const attempts = { elite: finished, young: unfinished };
    expect(canViewWeeklyGmScenario(attempts, "elite")).toBe(true);
    expect(canViewWeeklyGmScenario(attempts, "young")).toBe(false);
    expect(canViewWeeklyGmTotal(attempts)).toBe(false);
  });
  it("reveals totals only when both of the player's runs are finished", () => {
    const attempts = { elite: finished, young: finished };
    expect(canViewWeeklyGmTotal(attempts)).toBe(true);
    expect(canViewWeeklyGmTotal({}, true)).toBe(true);
  });
});
