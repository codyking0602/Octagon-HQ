import { describe, expect, it } from "vitest";
import { hitTheNumberRandomPoolSize, hitTheNumberStatRows } from "./hitTheNumberEngine";
import {
  HIT_THE_NUMBER_BUILD_TEAM_CATALOG,
  HIT_THE_NUMBER_FORMAT_GENERATION_PROFILE,
  HIT_THE_NUMBER_ONE_FROM_EACH_CATALOG,
  HIT_THE_NUMBER_THEME_CATALOG,
  createHitTheNumberFormatPlan,
  hitTheNumberFormatSelectionSatisfies,
  hitTheNumberSlotAcceptsFighter,
} from "./hitTheNumberFormats";

describe("Hit the Number format foundation", () => {
  it("defines the approved four-format random profile", () => {
    expect(HIT_THE_NUMBER_FORMAT_GENERATION_PROFILE.formats).toEqual([
      { value: "classic", weight: 40 },
      { value: "themed-lineup", weight: 25 },
      { value: "one-from-each", weight: 20 },
      { value: "build-the-team", weight: 15 },
    ]);
    expect(HIT_THE_NUMBER_FORMAT_GENERATION_PROFILE.formats.reduce(
      (sum, row) => sum + row.weight,
      0,
    )).toBe(100);
  });

  it("keeps themes and lineup slots factual and machine-verifiable", () => {
    const allowedKinds = new Set([
      "any",
      "division",
      "champion",
      "ufc-fights-at-least",
      "stat-at-least",
    ]);
    const rules = [
      ...HIT_THE_NUMBER_THEME_CATALOG.flatMap((theme) => theme.rules),
      ...HIT_THE_NUMBER_ONE_FROM_EACH_CATALOG.flatMap((set) => set.slots.flatMap((slot) => slot.rules)),
      ...HIT_THE_NUMBER_BUILD_TEAM_CATALOG.flatMap((set) => set.slots.flatMap((slot) => slot.rules)),
    ];

    expect(HIT_THE_NUMBER_THEME_CATALOG.length).toBeGreaterThanOrEqual(6);
    expect(HIT_THE_NUMBER_ONE_FROM_EACH_CATALOG.length).toBeGreaterThanOrEqual(2);
    expect(HIT_THE_NUMBER_BUILD_TEAM_CATALOG.length).toBeGreaterThanOrEqual(2);
    expect(rules.every((rule) => allowedKinds.has(rule.kind))).toBe(true);
    expect(HIT_THE_NUMBER_ONE_FROM_EACH_CATALOG.every((set) => set.slots.length === 5)).toBe(true);
    expect(HIT_THE_NUMBER_BUILD_TEAM_CATALOG.every((set) => set.slots.length === 5)).toBe(true);
  });

  it("rolls deterministic solvable plans from only seed plus Open/Random", () => {
    const observedFormats = new Set<string>();
    const valuesById = new Map(hitTheNumberStatRows.map((row) => [row.fighterId, row.values]));

    for (let index = 0; index < 240; index += 1) {
      const boardType = index % 2 === 0 ? "open-roster" : "random-pool";
      const options = { seed: `format-${index}`, boardType } as const;
      const plan = createHitTheNumberFormatPlan(options);
      const replay = createHitTheNumberFormatPlan(options);
      observedFormats.add(plan.format.formatId);

      expect(replay).toEqual(plan);
      expect(plan.boardType).toBe(boardType);
      expect(plan.solutionFighterIds).toHaveLength(plan.pickCount);
      expect(new Set(plan.solutionFighterIds).size).toBe(plan.pickCount);
      expect(hitTheNumberFormatSelectionSatisfies(plan.format, plan.solutionFighterIds)).toBe(true);
      expect(plan.solutionFighterIds.reduce(
        (sum, fighterId) => sum + valuesById.get(fighterId)![plan.statId]!,
        0,
      )).toBe(plan.target);

      if (plan.format.formatId === "themed-lineup") {
        expect(hitTheNumberFormatSelectionSatisfies(plan.format, plan.fighterIds)).toBe(true);
      }
      if (plan.format.formatId === "one-from-each" || plan.format.formatId === "build-the-team") {
        expect(plan.pickCount).toBe(5);
        expect(plan.format.slots).toHaveLength(5);
        plan.format.slots.forEach((slot, slotIndex) => {
          expect(hitTheNumberSlotAcceptsFighter(slot, plan.solutionFighterIds[slotIndex]!)).toBe(true);
        });
      }
      if (boardType === "random-pool") {
        expect(plan.fighterIds).toHaveLength(hitTheNumberRandomPoolSize(plan.pickCount));
        expect(plan.fighterIds.length).toBeGreaterThan(plan.pickCount);
        expect(plan.fighterIds.length).toBeLessThanOrEqual(12);
        for (const fighterId of plan.solutionFighterIds) {
          expect(plan.fighterIds).toContain(fighterId);
        }
      }
    }

    expect(observedFormats).toEqual(new Set([
      "classic",
      "themed-lineup",
      "one-from-each",
      "build-the-team",
    ]));
  });

  it("treats constrained lineup roles as explicit fighter-to-slot assignments", () => {
    let foundOrderSensitiveAssignment = false;

    for (let index = 0; index < 400 && !foundOrderSensitiveAssignment; index += 1) {
      const plan = createHitTheNumberFormatPlan({
        seed: `slot-order-${index}`,
        boardType: "open-roster",
      });
      if (plan.format.formatId !== "one-from-each" && plan.format.formatId !== "build-the-team") continue;

      for (let left = 0; left < plan.solutionFighterIds.length; left += 1) {
        for (let right = left + 1; right < plan.solutionFighterIds.length; right += 1) {
          const swapped = [...plan.solutionFighterIds];
          [swapped[left], swapped[right]] = [swapped[right]!, swapped[left]!];
          if (hitTheNumberFormatSelectionSatisfies(plan.format, swapped)) continue;
          foundOrderSensitiveAssignment = true;
          break;
        }
        if (foundOrderSensitiveAssignment) break;
      }
    }

    expect(foundOrderSensitiveAssignment).toBe(true);
  });
});
