import { describe, expect, it } from "vitest";
import { nbaHitNumberSubjects } from "./nbaHitTheNumberSubjects";
import {
  NBA_HIT_THE_NUMBER_FORMAT_PROFILE,
  NBA_HIT_THE_NUMBER_PICK_PROFILE,
  NBA_HIT_THE_NUMBER_POOL_SIZE,
  NBA_HIT_THE_NUMBER_STAT_CATALOG,
  createNbaHitTheNumberPlan,
  formatNbaHitTheNumberValue,
  getNbaHitTheNumberSubject,
  gradeNbaHitTheNumberSelection,
  nbaHitTheNumberAvailableProgressionSubjectIds,
  nbaHitTheNumberPlanQuality,
  nbaHitTheNumberSelectionSatisfies,
  nbaHitTheNumberValue,
  type NbaHitNumberPlan,
} from "./nbaHitTheNumberModel";

describe("NBA Hit the Number locked content and Football parity", () => {
  it("exposes only four or five picks, with four overwhelmingly favored", () => {
    expect(NBA_HIT_THE_NUMBER_PICK_PROFILE.map((value) => value.value)).toEqual([4, 5]);
    expect(NBA_HIT_THE_NUMBER_PICK_PROFILE[0].weight).toBe(85);
    expect(NBA_HIT_THE_NUMBER_POOL_SIZE).toEqual({ 4: 12, 5: 14 });
  });
  it("supports exactly six knowable, per-game statistics and four existing formats", () => {
    expect(NBA_HIT_THE_NUMBER_STAT_CATALOG.map((metric) => metric.id)).toEqual([
      "career-ppg", "career-apg", "career-rpg",
      "season-ppg", "season-apg", "season-rpg",
    ]);
    expect(NBA_HIT_THE_NUMBER_FORMAT_PROFILE.map((format) => format.value)).toEqual([
      "classic", "themed-lineup", "one-from-each", "build-the-team",
    ]);
  });
  it("keeps sourced data scoped to retired career totals or completed 2024-25 seasons", () => {
    expect(nbaHitNumberSubjects.length).toBeGreaterThanOrEqual(80);
    expect(nbaHitNumberSubjects.filter((subject) => subject.scope === "career").length).toBeGreaterThan(30);
    expect(nbaHitNumberSubjects.filter((subject) => subject.scope === "season").length).toBeGreaterThan(30);
    expect(new Set(nbaHitNumberSubjects.map((subject) => subject.id)).size).toBe(nbaHitNumberSubjects.length);
    for (const subject of nbaHitNumberSubjects) {
      expect(subject.games).toBeGreaterThanOrEqual(40);
      expect(subject.ppg).toBeGreaterThan(0);
      expect(subject.apg).toBeGreaterThanOrEqual(0);
      expect(subject.rpg).toBeGreaterThan(0);
      expect(subject.image).toMatch(/^https:\/\/cdn\.nba\.com\/headshots\/nba\//);
      if (subject.scope === "season") expect(subject.season).toBe("2024–25");
    }
  });
  it("makes deterministic, balanced, playable boards across seeds", () => {
    for (let i = 0; i < 30; i += 1) {
      const seed = `nba-quality-smoke-${i}`;
      const plan = createNbaHitTheNumberPlan(seed);
      const replay = createNbaHitTheNumberPlan(seed);
      expect(replay).toEqual(plan);
      expect([4, 5]).toContain(plan.pickCount);
      expect(plan.subjectIds).toHaveLength(NBA_HIT_THE_NUMBER_POOL_SIZE[plan.pickCount]);
      expect(new Set(plan.subjectIds).size).toBe(plan.subjectIds.length);
      expect(plan.target).toBeGreaterThan(0);
      expect(nbaHitTheNumberPlanQuality(plan).passes).toBe(true);
      expect(plan.subjectIds.every((id) => getNbaHitTheNumberSubject(id)?.scope === plan.domainId)).toBe(true);
      for (const id of plan.subjectIds) {
        expect(Number.isFinite(nbaHitTheNumberValue(id, plan.metricId))).toBe(true);
      }
      expect(formatNbaHitTheNumberValue(plan, plan.target)).toMatch(/^\d+\.\d$/);
    }
  });
  it("never accepts duplicate or off-board picks, and grades with existing shared scoring", () => {
    const plan = createNbaHitTheNumberPlan("nba-selection-lock");
    const completed: string[] = [];
    while (completed.length < plan.pickCount) {
      const candidates = plan.slots.length
        ? nbaHitTheNumberAvailableProgressionSubjectIds(plan, completed)
        : plan.subjectIds.filter((id) => !completed.includes(id));
      expect(candidates.length).toBeGreaterThan(0);
      completed.push(candidates[0]!);
    }
    expect(nbaHitTheNumberSelectionSatisfies(plan, completed)).toBe(true);
    expect(nbaHitTheNumberSelectionSatisfies(plan, completed.slice(1))).toBe(false);
    expect(nbaHitTheNumberSelectionSatisfies(plan, Array(plan.pickCount).fill(completed[0]))).toBe(false);
    const result = gradeNbaHitTheNumberSelection(plan, completed);
    expect(result.selections).toHaveLength(plan.pickCount);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    if (result.status === "bust") expect(result.score).toBeLessThan(50);
    else expect(result.score).toBeGreaterThanOrEqual(50);
  });
  it("keeps season-year context visible and does not mutate the source data", () => {
    const subject = nbaHitNumberSubjects.find((row) => row.scope === "season")!;
    expect(subject.season).toBe("2024–25");
    const plan: NbaHitNumberPlan = createNbaHitTheNumberPlan("nba-facts-scope");
    expect(plan.metricLabel).toMatch(/(Career|2024–25)/);
  });
});
