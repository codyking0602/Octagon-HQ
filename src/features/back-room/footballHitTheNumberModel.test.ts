import { describe, expect, it } from "vitest";
import { getFootballFindLeaderFact } from "./footballFactualStats";
import {
  FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE,
  FOOTBALL_HIT_THE_NUMBER_MAX_PICKS,
  FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG,
  FOOTBALL_HIT_THE_NUMBER_MIN_PICKS,
  FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE,
  createFootballHitTheNumberPlan,
  footballHitTheNumberPlanQuality,
  footballHitTheNumberRandomPoolSize,
  footballHitTheNumberSelectionSatisfies,
  footballHitTheNumberSubjects,
  footballHitTheNumberValue,
  gradeFootballHitTheNumberSelection,
  type FootballHitTheNumberFormatId,
} from "./footballHitTheNumberModel";

describe("Football Hit the Number parity plus", () => {
  it("keeps one 35-subject factual roster while exposing 18 meaningful NFL/CFB metric boards", () => {
    expect(footballHitTheNumberSubjects).toHaveLength(35);
    expect(new Set(footballHitTheNumberSubjects.map((subject) => subject.id)).size).toBe(35);
    expect(FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG).toHaveLength(18);
    expect(new Set(FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.map((row) => row.metricId)).size).toBe(18);
    expect(FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.filter((row) => row.league === "NFL")).toHaveLength(9);
    expect(FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG.filter((row) => row.league === "CFB")).toHaveLength(9);
  });

  it("uses the existing audited Football factual owner for every playable objective value", () => {
    const seenMetrics = new Set<string>();
    for (let index = 0; index < 500; index += 1) {
      const plan = createFootballHitTheNumberPlan(`football-hit-number-facts-${index}`);
      seenMetrics.add(plan.metricId);
      for (const subjectId of plan.subjectIds) {
        const fact = getFootballFindLeaderFact(subjectId, plan.metricId);
        expect(fact, `${plan.metricId}:${subjectId}`).not.toBeNull();
        expect(Number.isFinite(fact!.value)).toBe(true);
        expect(fact!.sources.length).toBeGreaterThan(0);
        expect(fact!.sources.every((source) => source.reviewedOn === "2026-08-22")).toBe(true);
      }
    }
    expect(seenMetrics.size).toBe(18);
  });

  it("matches the mature UFC format and 4-7 pick generation profiles", () => {
    expect(FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE).toEqual([
      { value: "classic", weight: 40 },
      { value: "themed-lineup", weight: 25 },
      { value: "one-from-each", weight: 20 },
      { value: "build-the-team", weight: 15 },
    ]);
    expect(FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE).toEqual([
      { value: 4, weight: 15 },
      { value: 5, weight: 35 },
      { value: 6, weight: 35 },
      { value: 7, weight: 15 },
    ]);
  });

  it("builds deterministic, solvable, quality-gated Open Roster and Random Pool boards", () => {
    for (const boardType of ["open-roster", "random-pool"] as const) {
      for (let index = 0; index < 160; index += 1) {
        const seed = `football-hit-number-${boardType}-${index}`;
        const first = createFootballHitTheNumberPlan(seed, boardType);
        const second = createFootballHitTheNumberPlan(seed, boardType);

        expect(second).toEqual(first);
        expect(first.boardType).toBe(boardType);
        expect(first.pickCount).toBeGreaterThanOrEqual(FOOTBALL_HIT_THE_NUMBER_MIN_PICKS);
        expect(first.pickCount).toBeLessThanOrEqual(FOOTBALL_HIT_THE_NUMBER_MAX_PICKS);
        expect(new Set(first.subjectIds).size).toBe(first.subjectIds.length);
        expect(first.subjectIds.length).toBeGreaterThanOrEqual(first.pickCount);
        if (boardType === "random-pool") {
          expect(first.subjectIds.length).toBeLessThanOrEqual(footballHitTheNumberRandomPoolSize(first.pickCount));
        }
        expect(first.solutionSubjectIds).toHaveLength(first.pickCount);
        expect(new Set(first.solutionSubjectIds).size).toBe(first.pickCount);
        expect(first.solutionSubjectIds.every((subjectId) => first.subjectIds.includes(subjectId))).toBe(true);
        expect(footballHitTheNumberSelectionSatisfies(first, first.solutionSubjectIds)).toBe(true);
        expect(footballHitTheNumberPlanQuality(first).passes).toBe(true);
        if (first.formatId === "one-from-each" || first.formatId === "build-the-team") {
          expect(first.pickCount).toBe(5);
          expect(first.slots).toHaveLength(5);
        }

        const expectedTarget = first.solutionSubjectIds.reduce(
          (sum, subjectId) => sum + footballHitTheNumberValue(subjectId, first.metricId),
          0,
        );
        expect(first.target).toBeCloseTo(expectedTarget, 8);
        expect(gradeFootballHitTheNumberSelection(first, first.solutionSubjectIds)).toMatchObject({
          status: "perfect",
          score: 100,
          total: expectedTarget,
          target: expectedTarget,
        });
      }
    }
  });

  it("rotates all 18 metrics with roughly half CFB exposure and all four pick counts over time", () => {
    const formats = new Map<FootballHitTheNumberFormatId, number>([
      ["classic", 0],
      ["themed-lineup", 0],
      ["one-from-each", 0],
      ["build-the-team", 0],
    ]);
    const metrics = new Set<string>();
    const picks = new Set<number>();
    let cfb = 0;
    const runs = 1_200;

    for (let index = 0; index < runs; index += 1) {
      const plan = createFootballHitTheNumberPlan(`football-hit-number-mix-${index}`);
      formats.set(plan.formatId, formats.get(plan.formatId)! + 1);
      metrics.add(plan.metricId);
      picks.add(plan.pickCount);
      if (plan.league === "CFB") cfb += 1;
      expect(footballHitTheNumberPlanQuality(plan).passes).toBe(true);
      expect(footballHitTheNumberSelectionSatisfies(plan, plan.solutionSubjectIds)).toBe(true);
    }

    expect(metrics.size).toBe(18);
    expect(picks).toEqual(new Set([4, 5, 6, 7]));
    expect(cfb / runs).toBeGreaterThanOrEqual(0.45);
    expect(cfb / runs).toBeLessThanOrEqual(0.55);
    expect([...formats.values()].every((count) => count > 0)).toBe(true);
    expect(formats.get("classic")! / runs).toBeGreaterThanOrEqual(0.32);
    expect(formats.get("classic")! / runs).toBeLessThanOrEqual(0.48);
    expect(formats.get("themed-lineup")! / runs).toBeGreaterThanOrEqual(0.17);
    expect(formats.get("themed-lineup")! / runs).toBeLessThanOrEqual(0.33);
    expect(formats.get("one-from-each")! / runs).toBeGreaterThanOrEqual(0.12);
    expect(formats.get("one-from-each")! / runs).toBeLessThanOrEqual(0.28);
    expect(formats.get("build-the-team")! / runs).toBeGreaterThanOrEqual(0.07);
    expect(formats.get("build-the-team")! / runs).toBeLessThanOrEqual(0.23);
  });
});
