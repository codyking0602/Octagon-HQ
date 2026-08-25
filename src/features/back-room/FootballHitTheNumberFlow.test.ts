import { describe, expect, it } from "vitest";
import footballHitTheNumberPageSource from "./FootballHitTheNumberPage.tsx?raw";
import {
  FOOTBALL_HIT_THE_NUMBER_DEFAULT_BOARD_TYPE,
  createFootballHitTheNumberPlan,
  footballHitTheNumberActiveBuildSlot,
  footballHitTheNumberAvailableBuildSubjectIds,
  footballHitTheNumberSelectionSatisfies,
  type FootballHitTheNumberPlan,
} from "./footballHitTheNumberModel";

function buildTheTeamPlan() {
  for (let index = 0; index < 500; index += 1) {
    const plan = createFootballHitTheNumberPlan(`football-build-flow-${index}`);
    if (plan.formatId === "build-the-team") return plan;
  }
  throw new Error("Could not resolve a Build the Team board for the focused flow test.");
}

describe("Football Hit the Number Build the Team flow", () => {
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
    expect(footballHitTheNumberPageSource).toContain('className="hit-number-new-board"');
    expect(footballHitTheNumberPageSource).toContain("NEW LINEUP");
    expect(footballHitTheNumberPageSource).toContain("plan.configurationLabel");
  });

  it("advances Build the Team through the five canonical tiers in order", () => {
    const plan = buildTheTeamPlan() as FootballHitTheNumberPlan;
    expect(plan.slots.map((slot) => slot.label)).toEqual([
      "Elite Tier",
      "High Tier",
      "Middle Tier",
      "Value Tier",
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

  it("keeps tier filtering in the canonical model and uses it from the existing page owner", () => {
    expect(footballHitTheNumberPageSource).toContain("footballHitTheNumberActiveBuildSlot");
    expect(footballHitTheNumberPageSource).toContain("footballHitTheNumberAvailableBuildSubjectIds");
    expect(footballHitTheNumberPageSource).toContain("displayedSubjectIds");
    expect(footballHitTheNumberPageSource).toContain('plan.formatId === "build-the-team"');
    expect(footballHitTheNumberPageSource).toContain("activeBuildSlot.label");
  });
});
