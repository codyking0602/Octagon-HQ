import { describe, expect, it } from "vitest";
import { getFootballFact } from "./footballFactualStats";
import { footballHitTheNumberPeakSeasons } from "./footballHitTheNumberPeakSeasonContext";
import {
  FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE,
  createFootballHitTheNumberPlan,
  footballHitTheNumberAvailableProgressionSubjectIds,
  footballHitTheNumberPlanQuality,
  footballHitTheNumberRandomPoolSize,
  footballHitTheNumberSelectionSatisfies,
  getFootballHitTheNumberSubject,
  gradeFootballHitTheNumberSelection,
} from "./footballHitTheNumberModel";

describe("Football Hit the Number release certification: NFL and CFB", () => {
  it("locks exactly 85% four-pick and 15% five-pick generation, never six", () => {
    expect(FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE).toEqual([
      { value: 4, weight: 85 }, { value: 5, weight: 15 },
    ]);
    expect(footballHitTheNumberRandomPoolSize(4)).toBe(12);
    expect(footballHitTheNumberRandomPoolSize(5)).toBe(14);
    expect(() => footballHitTheNumberRandomPoolSize(6)).toThrow();
    expect(() => footballHitTheNumberRandomPoolSize(7)).toThrow();
  });

  it("certifies representative deterministic plans, factual provenance, legal finishes, and year evidence", () => {
    const formats = new Set<string>();
    const leagues = new Set<string>();
    const sizes = new Set<number>();
    let collegePeakBoards = 0;

    for (let index = 0; index < 96; index++) {
      const seed = `football-htn-release-cert-${index}`;
      const plan = createFootballHitTheNumberPlan(seed, "random-pool");
      expect(createFootballHitTheNumberPlan(seed, "random-pool")).toEqual(plan);
      expect([4, 5]).toContain(plan.pickCount);
      expect(plan.subjectIds).toHaveLength(plan.pickCount === 4 ? 12 : 14);
      expect(footballHitTheNumberPlanQuality(plan).passes).toBe(true);
      expect(footballHitTheNumberSelectionSatisfies(plan, plan.solutionSubjectIds)).toBe(true);
      expect(gradeFootballHitTheNumberSelection(plan, plan.solutionSubjectIds)).toMatchObject({
        status: "perfect", score: 100,
      });

      formats.add(plan.formatId);
      leagues.add(plan.league);
      sizes.add(plan.pickCount);

      const persons = new Set<string>();
      for (const id of plan.subjectIds) {
        const subject = getFootballHitTheNumberSubject(id);
        expect(subject, id).not.toBeNull();
        const fact = getFootballFact(id, plan.metricId);
        expect(fact, `${plan.metricId}:${id}`).not.toBeNull();
        expect(fact!.sources.length).toBeGreaterThan(0);
        expect(Number.isFinite(fact!.fact.value)).toBe(true);
        if (subject!.kind === "player-season") {
          const person = subject!.playerId ?? subject!.name.replace(/\\b\\d{4}\\b/g, "");
          expect(persons.has(person), `Same player twice on ${seed}: ${person}`).toBe(false);
          persons.add(person);
        }
        if (subject!.group === "cfb-player-peak") {
          const years = footballHitTheNumberPeakSeasons(id, plan.metricId);
          expect(years.length, `Missing peak season: ${id}/${plan.metricId}`).toBeGreaterThan(0);
          expect(years.every(year => year >= 1900 && year <= 2026)).toBe(true);
          collegePeakBoards++;
        }
      }

      if (plan.slots.length > 0) {
        const selected: string[] = [];
        for (let slot = 0; slot < plan.pickCount; slot++) {
          const available = footballHitTheNumberAvailableProgressionSubjectIds(plan, selected);
          expect(available, `${seed}:slot ${slot}`).toContain(plan.solutionSubjectIds[slot]);
          expect(available.length).toBeGreaterThan(0);
          selected.push(plan.solutionSubjectIds[slot]!);
        }
        expect(footballHitTheNumberSelectionSatisfies(plan, selected)).toBe(true);
      }
    }
    expect(formats).toEqual(new Set(["classic","themed-lineup","one-from-each","build-the-team"]));
    expect(leagues).toEqual(new Set(["NFL", "CFB"]));
    expect(sizes).toEqual(new Set([4, 5]));
    expect(collegePeakBoards).toBeGreaterThan(0);
  }, 120_000);
});
