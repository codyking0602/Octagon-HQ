import { describe, expect, it } from "vitest";
import { getFootballTwentyQuestionsRuntimeUniverse } from "./twentyQuestionsFootballRuntimeAuthority";

function familyForQuestion(id: string) {
  const parts = id.split(":");
  return parts.length > 1 ? parts.slice(0, -1).join(":") : id;
}

function isEraQuestion(id: string) {
  return id.startsWith("era:") || id.includes(":era:") || id.includes("longevity");
}

describe("Football 20 Questions human runtime", () => {
  it("keeps the NFL bank broad and human while preserving fallback separation depth", () => {
    const universe = getFootballTwentyQuestionsRuntimeUniverse("NFL");
    const ids = universe.questions.map((question) => question.id);
    const familyCounts = new Map<string, number>();
    for (const id of ids) familyCounts.set(familyForQuestion(id), (familyCounts.get(familyForQuestion(id)) ?? 0) + 1);

    expect(ids.some((id) => id.startsWith("position:"))).toBe(true);
    expect(ids.some(isEraQuestion)).toBe(true);
    expect(ids.some((id) => /award|championship|super-bowl|mvp|all-pro|pro-bowl/.test(id))).toBe(true);
    expect(ids.filter((id) => id.includes("-fine:")).length).toBeLessThan(universe.questions.length / 3);
    expect(Math.max(...[...familyCounts.values()])).toBeLessThan(40);
  });

  it("keeps the College bank centered on era, position, affiliation, and achievements", () => {
    const universe = getFootballTwentyQuestionsRuntimeUniverse("CFB");
    const ids = universe.questions.map((question) => question.id);

    expect(ids.some((id) => id.startsWith("position:"))).toBe(true);
    expect(ids.some(isEraQuestion)).toBe(true);
    expect(ids.some((id) => /(program|conference|college|school):/.test(id))).toBe(true);
    expect(ids.some((id) => id.includes("heisman") || id.includes("national-title") || id.includes("championship"))).toBe(true);
    expect(ids.filter((id) => id.includes("-fine:")).length).toBeLessThan(universe.questions.length / 3);
  });
});
