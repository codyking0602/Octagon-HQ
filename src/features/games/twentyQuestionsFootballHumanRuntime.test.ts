import { describe, expect, it } from "vitest";
import { getFootballTwentyQuestionsRuntimeUniverse } from "./twentyQuestionsFootballRuntimeAuthority";

function familyForQuestion(id: string) {
  const parts = id.split(":");
  return parts.length > 1 ? parts.slice(0, -1).join(":") : id;
}

describe("Football 20 Questions human runtime", () => {
  it("keeps the NFL bank broad and human while preserving fallback separation depth", () => {
    const universe = getFootballTwentyQuestionsRuntimeUniverse("NFL");
    const ids = universe.questions.map((question) => question.id);
    const familyCounts = new Map<string, number>();
    for (const id of ids) familyCounts.set(familyForQuestion(id), (familyCounts.get(familyForQuestion(id)) ?? 0) + 1);

    expect(ids.some((id) => id.startsWith("position:"))).toBe(true);
    expect(ids.some((id) => id.includes(":era:"))).toBe(true);
    expect(ids.some((id) => id.startsWith("franchise:"))).toBe(true);
    expect(ids.some((id) => id.startsWith("team:region:") || id.startsWith("team:color:") || id.startsWith("team:conference:") || id.startsWith("team:division:"))).toBe(true);
    expect(ids.some((id) => /award|championship|super-bowl/.test(id))).toBe(true);
    expect(ids.filter((id) => id.includes("-fine:")).length).toBeLessThan(universe.questions.length / 3);
    expect(Math.max(...[...familyCounts.values()])).toBeLessThan(40);
  });

  it("keeps the College bank centered on era, position, school/program, historical conference, and achievements", () => {
    const universe = getFootballTwentyQuestionsRuntimeUniverse("CFB");
    const ids = universe.questions.map((question) => question.id);

    expect(ids.some((id) => id.startsWith("position:"))).toBe(true);
    expect(ids.some((id) => id.includes(":era:"))).toBe(true);
    expect(ids.some((id) => id.startsWith("program:") || id.startsWith("player-program:"))).toBe(true);
    expect(ids.some((id) => id.startsWith("historical-conference:"))).toBe(true);
    expect(ids.some((id) => id.includes("heisman") || id.includes("national-title"))).toBe(true);
    expect(ids.filter((id) => id.includes("-fine:")).length).toBeLessThan(universe.questions.length / 3);
  });
});
