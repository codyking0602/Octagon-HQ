import { describe, expect, it } from "vitest";
import { getFootballFact, type FootballFactMetricId } from "./footballFactualStats";
import {
  FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE,
  FOOTBALL_HIT_THE_NUMBER_PICK_COUNT,
  FOOTBALL_HIT_THE_NUMBER_POOL_SIZE,
  createFootballHitTheNumberPlan,
  footballHitTheNumberPlanQuality,
  footballHitTheNumberSelectionSatisfies,
  footballHitTheNumberSubjects,
  footballHitTheNumberValue,
  gradeFootballHitTheNumberSelection,
  type FootballHitTheNumberDomainId,
  type FootballHitTheNumberFormatId,
} from "./footballHitTheNumberModel";

const metricByDomain: Readonly<Record<FootballHitTheNumberDomainId, FootballFactMetricId>> = {
  "nfl-qb-passing": "nfl-career-passing-yards",
  "nfl-rb-rushing": "nfl-career-rushing-yards",
  "cfb-champion-scoring": "cfb-team-points-per-game",
};

describe("Football Hit the Number maturity", () => {
  it("uses the audited Football fact owner for every playable objective value", () => {
    expect(footballHitTheNumberSubjects).toHaveLength(35);
    expect(new Set(footballHitTheNumberSubjects.map((subject) => subject.id)).size).toBe(35);

    for (const subject of footballHitTheNumberSubjects) {
      const fact = getFootballFact(subject.id, metricByDomain[subject.domainId]);
      expect(fact, subject.id).not.toBeNull();
      expect(fact!.fact.value).toBeGreaterThan(0);
      expect(fact!.sources.length).toBeGreaterThan(0);
      expect(fact!.sources.every((source) => source.reviewedOn === "2026-08-22")).toBe(true);
    }
  });

  it("keeps the approved 40/25/20/15 format profile as the single generation contract", () => {
    expect(FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE).toEqual([
      { value: "classic", weight: 40 },
      { value: "themed-lineup", weight: 25 },
      { value: "one-from-each", weight: 20 },
      { value: "build-the-team", weight: 15 },
    ]);
  });

  it("builds deterministic, solvable, quality-gated boards from canonical values", () => {
    for (let index = 0; index < 120; index += 1) {
      const seed = `football-hit-number-deterministic-${index}`;
      const first = createFootballHitTheNumberPlan(seed);
      const second = createFootballHitTheNumberPlan(seed);

      expect(second).toEqual(first);
      expect(first.pickCount).toBe(FOOTBALL_HIT_THE_NUMBER_PICK_COUNT);
      expect(first.subjectIds).toHaveLength(FOOTBALL_HIT_THE_NUMBER_POOL_SIZE);
      expect(new Set(first.subjectIds).size).toBe(FOOTBALL_HIT_THE_NUMBER_POOL_SIZE);
      expect(first.solutionSubjectIds).toHaveLength(FOOTBALL_HIT_THE_NUMBER_PICK_COUNT);
      expect(new Set(first.solutionSubjectIds).size).toBe(FOOTBALL_HIT_THE_NUMBER_PICK_COUNT);
      expect(first.solutionSubjectIds.every((subjectId) => first.subjectIds.includes(subjectId))).toBe(true);
      expect(footballHitTheNumberSelectionSatisfies(first, first.solutionSubjectIds)).toBe(true);
      expect(footballHitTheNumberPlanQuality(first).passes).toBe(true);

      const expectedTarget = first.solutionSubjectIds.reduce(
        (sum, subjectId) => sum + footballHitTheNumberValue(subjectId, first.metricId),
        0,
      );
      expect(first.target).toBeCloseTo(expectedTarget, 6);
      expect(gradeFootballHitTheNumberSelection(first, first.solutionSubjectIds)).toMatchObject({
        status: "perfect",
        score: 100,
        total: expectedTarget,
        target: expectedTarget,
      });
    }
  });

  it("exercises every format/domain while staying close to the approved format mix", () => {
    const formats = new Map<FootballHitTheNumberFormatId, number>([
      ["classic", 0],
      ["themed-lineup", 0],
      ["one-from-each", 0],
      ["build-the-team", 0],
    ]);
    const domains = new Set<FootballHitTheNumberDomainId>();
    const runs = 400;

    for (let index = 0; index < runs; index += 1) {
      const plan = createFootballHitTheNumberPlan(`football-hit-number-mix-${index}`);
      formats.set(plan.formatId, formats.get(plan.formatId)! + 1);
      domains.add(plan.domainId);
      expect(footballHitTheNumberPlanQuality(plan).passes).toBe(true);
      expect(footballHitTheNumberSelectionSatisfies(plan, plan.solutionSubjectIds)).toBe(true);
    }

    expect(domains).toEqual(new Set<FootballHitTheNumberDomainId>([
      "nfl-qb-passing",
      "nfl-rb-rushing",
      "cfb-champion-scoring",
    ]));
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
