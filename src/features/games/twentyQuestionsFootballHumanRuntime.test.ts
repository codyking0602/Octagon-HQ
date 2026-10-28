import { describe, expect, it } from "vitest";
import runtimeSnapshot from "./generated/twentyQuestionsFootballRuntime.json";

describe("retired Football 20 Questions runtime", () => {
  it.each(["NFL", "CFB"] as const)("keeps the %s runtime snapshot empty after product retirement", (league) => {
    const runtime = runtimeSnapshot[league];
    expect(runtime.subjects).toEqual([]);
    expect(runtime.questions).toEqual([]);
    expect(runtime.sourceQuestionCount).toBe(0);
  });
});
