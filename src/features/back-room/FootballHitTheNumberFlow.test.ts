import { describe, expect, it } from "vitest";
import footballHitTheNumberPageSource from "./FootballHitTheNumberPage.tsx?raw";
import {
  FOOTBALL_HIT_THE_NUMBER_DEFAULT_BOARD_TYPE,
  createFootballHitTheNumberPlan,
  footballHitTheNumberActiveBuildSlot,
  footballHitTheNumberAvailableBuildSubjectIds,
  footballHitTheNumberSelectionSatisfies,
  getFootballHitTheNumberSubject,
  type FootballHitTheNumberFormatId,
  type FootballHitTheNumberPlan,
} from "./footballHitTheNumberModel";

function planForFormat(formatId: FootballHitTheNumberFormatId) {
  for (let index = 0; index < 800; index += 1) {
    const plan = createFootballHitTheNumberPlan(`football-${formatId}-flow-${index}`);
    if (plan.formatId === formatId) return plan;
  }
  throw new Error(`Could not resolve a ${formatId} board for the focused flow test.`);
}

describe("Football Hit the Number slot progression", () => {
  it("keeps Football on its single generated-pool mode while using the UFC Hit the Number shell", () => {
    expect(FOOTBALL_HIT_THE_NUMBER_DEFAULT_BOARD_TYPE).toBe("random-pool");
    for (let index = 0; index < 80; index += 1) {
      expect(createFootballHitTheNumberPlan(`football-random-first-${index}`).boardType).toBe("random-pool");
    }

    expect(footballHitTheNumberPageSource).not.toContain("ROSTER MODE");
    expect(footballHitTheNumberPageSource).not.toContain("OPEN ROSTER");
    expect(footballHitTheNumberPageSource).not.toContain("RANDOM POOL");
    expect(footballHitTheNumberPageSource).not.toContain("hit-number-mode-toggle");
    expect(footballHitTheNumberPageSource).not.toContain("chooseBoardType");
    expect(footballHitTheNumberPageSource).toContain('className="hit-number-heading"');
    expect(footballHitTheNumberPageSource).toContain('className="hit-number-target"');
    expect(footballHitTheNumberPageSource).toContain('className="hit-number-slots"');
    expect(footballHitTheNumberPageSource).toContain('className="hit-number-role-slots"');
    expect(footballHitTheNumberPageSource).toContain('className="hit-number-new-board"');
    expect(footballHitTheNumberPageSource).toContain("NEW LINEUP");
    expect(footballHitTheNumberPageSource).toContain("plan.configurationLabel");
  });

  it("advances Build the Team through the five canonical metric tiers in order", () => {
    const plan = planForFormat("build-the-team") as FootballHitTheNumberPlan;
    expect(plan.slots.map((slot) => slot.label)).toEqual([
      "Tier 1",
      "Tier 2",
      "Tier 3",
      "Tier 4",
      "Wild Card",
    ]);

    const selectedIds: string[] = [];
    for (let index = 0; index < plan.slots.length; index += 1) {
      expect(footballHitTheNumberActiveBuildSlot(plan, selectedIds)?.label).toBe(plan.slots[index]!.label);
      const available = footballHitTheNumberAvailableBuildSubjectIds(plan, selectedIds);
      expect(available.length).toBeGreaterThan(0);
      expect(selectedIds.every((subjectId) => !available.includes(subjectId))).toBe(true);
      expect(available).toContain(plan.solutionSubjectIds[index]);
      selectedIds.push(plan.solutionSubjectIds[index]!);
    }

    expect(footballHitTheNumberActiveBuildSlot(plan, selectedIds)).toBeNull();
    expect(footballHitTheNumberAvailableBuildSubjectIds(plan, selectedIds)).toEqual([]);
    expect(footballHitTheNumberSelectionSatisfies(plan, selectedIds)).toBe(true);
  });

  it("keeps One From Each ordered by deep real champion eras instead of production tiers", () => {
    const plan = planForFormat("one-from-each") as FootballHitTheNumberPlan;
    expect(plan.league).toBe("CFB");
    expect(plan.slots.map((slot) => slot.id)).toEqual([
      "1995-2002",
      "2003-08",
      "2009-14",
      "2015-22",
      "wild-card",
    ]);

    const seasons = plan.solutionSubjectIds.map((subjectId) => getFootballHitTheNumberSubject(subjectId)?.season ?? null);
    expect(seasons[0]).toBeGreaterThanOrEqual(1995);
    expect(seasons[0]).toBeLessThanOrEqual(2002);
    expect(seasons[1]).toBeGreaterThanOrEqual(2003);
    expect(seasons[1]).toBeLessThanOrEqual(2008);
    expect(seasons[2]).toBeGreaterThanOrEqual(2009);
    expect(seasons[2]).toBeLessThanOrEqual(2014);
    expect(seasons[3]).toBeGreaterThanOrEqual(2015);
    expect(seasons[3]).toBeLessThanOrEqual(2022);
    expect(seasons[4]).not.toBeNull();
    expect(footballHitTheNumberSelectionSatisfies(plan, plan.solutionSubjectIds)).toBe(true);
  });

  it("uses one guided role-slot flow for both constrained formats without changing the game owner", () => {
    expect(footballHitTheNumberPageSource).toContain("isSlotProgression(plan)");
    expect(footballHitTheNumberPageSource).toContain('plan.formatId === "one-from-each"');
    expect(footballHitTheNumberPageSource).toContain('plan.formatId === "build-the-team"');
    expect(footballHitTheNumberPageSource).toContain("activeProgressionSlot(plan, selectedIds)");
    expect(footballHitTheNumberPageSource).toContain("availableProgressionSubjectIds(plan, selectedIds)");
    expect(footballHitTheNumberPageSource).toContain("oneFromEachSlotAccepts(activeSlot.id, subjectId)");
    expect(footballHitTheNumberPageSource).toContain("rewindToSlot(index)");
    expect(footballHitTheNumberPageSource).toContain("plan.slots.map((slot, index)");
    expect(footballHitTheNumberPageSource).toContain('"CHOOSING"');
    expect(footballHitTheNumberPageSource).toContain('"CHANGE"');
    expect(footballHitTheNumberPageSource).toContain('"UP NEXT"');
  });
});
