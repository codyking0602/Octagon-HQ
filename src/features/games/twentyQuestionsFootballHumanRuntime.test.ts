import { describe, expect, it } from "vitest";
import { getFootballTwentyQuestionsRuntimeUniverse } from "./twentyQuestionsFootballRuntimeAuthority";

function familyForQuestion(id: string) {
  const parts = id.split(":");
  return parts.length > 1 ? parts.slice(0, -1).join(":") : id;
}

function assertHumanRuntimeShape(league: "NFL" | "CFB") {
  const universe = getFootballTwentyQuestionsRuntimeUniverse(league);
  const ids = universe.questions.map((question) => question.id);
  const familyCounts = new Map<string, number>();
  for (const id of ids) familyCounts.set(familyForQuestion(id), (familyCounts.get(familyForQuestion(id)) ?? 0) + 1);

  expect(universe.subjects).toHaveLength(120);
  expect(universe.questions.length).toBeGreaterThan(50);
  expect(universe.questions.length).toBeLessThanOrEqual(360);
  expect(ids.some((id) => id.startsWith("position:"))).toBe(true);
  expect(ids.filter((id) => id.includes("-fine:")).length).toBeLessThan(universe.questions.length / 3);
  expect(Math.max(...[...familyCounts.values()])).toBeLessThan(40);
  for (const question of universe.questions) {
    for (const subject of universe.subjects) expect(typeof question.answer(subject.id)).toBe("boolean");
  }
}

describe("Football 20 Questions human runtime", () => {
  it("keeps the NFL runtime compact, diverse, deterministic, and human-first", () => {
    const universe = getFootballTwentyQuestionsRuntimeUniverse("NFL");
    const ids = universe.questions.map((question) => question.id);
    assertHumanRuntimeShape("NFL");
    expect(ids.some((id) => id.includes(":era:") || id.includes("longevity"))).toBe(true);
  });

  it("keeps the College runtime compact, diverse, deterministic, and human-first", () => {
    assertHumanRuntimeShape("CFB");
  });
});
