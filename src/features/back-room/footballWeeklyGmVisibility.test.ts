import { describe, expect, it } from "vitest";
import { canViewWeeklyGmScenario, canViewWeeklyGmStandingResult, canViewWeeklyGmTotal } from "./footballWeeklyGmVisibility";
import type { WeeklyGmAttempt, WeeklyGmStanding } from "./footballWeeklyGmRepository";

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

const opponent: WeeklyGmStanding = {
  profile_id: "troy", display_name: "Troy", elite_score: 91, young_score: 88.9,
  total_score: 179.9, completed_runs: 2, rank: 2,
};

describe("Weekly GM opponent result drill-down", () => {
  it("lets a player who finished both runs inspect either of Troy's results, even with two standings", () => {
    const attempts = { elite: finished, young: finished };
    expect(canViewWeeklyGmStandingResult(opponent, attempts, "elite")).toBe(true);
    expect(canViewWeeklyGmStandingResult(opponent, attempts, "young")).toBe(true);
  });
  it("never reveals a competitor's unreleased scenario or an unscored result", () => {
    expect(canViewWeeklyGmStandingResult(opponent, {}, "elite")).toBe(false);
    expect(canViewWeeklyGmStandingResult(opponent, { elite: finished }, "young")).toBe(false);
    expect(canViewWeeklyGmStandingResult({ ...opponent, young_score: null }, { elite: finished, young: finished }, "young")).toBe(false);
  });
  it("keeps completed archive runs inspectable without current-week spoiler requirements", () => {
    expect(canViewWeeklyGmStandingResult(opponent, {}, "young", true)).toBe(true);
    expect(canViewWeeklyGmStandingResult(opponent, {}, "elite", false, true)).toBe(true);
  });
});
