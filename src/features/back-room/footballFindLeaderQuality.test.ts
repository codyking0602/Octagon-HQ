import { describe, expect, it } from "vitest";
import { getFootballFact } from "./footballFactualStats";
import { evaluateFootballFindLeaderQuality } from "./footballFindLeaderQuality";

describe("Football Find the Leader factual quality gate", () => {
  it("accepts a deep, varied canonical receiving pool", () => {
    const subjectIds = [
      "nfl-tony-gonzalez",
      "jason-witten",
      "travis-kelce",
      "antonio-gates",
      "shannon-sharpe",
      "nfl-rob-gronkowski",
      "greg-olsen",
      "jimmy-graham",
    ];
    const values = subjectIds.map((subjectId) => getFootballFact(subjectId, "nfl-career-receiving-yards")?.fact.value);

    expect(values.every((value): value is number => typeof value === "number")).toBe(true);
    expect(evaluateFootballFindLeaderQuality({ unit: "yards", values: values as number[] })).toMatchObject({
      eligible: true,
      reasons: [],
      candidateCount: 8,
      distinctValueCount: 8,
      topTieCount: 1,
    });
  });

  it("rejects shapes that make bad leader questions", () => {
    expect(evaluateFootballFindLeaderQuality({ unit: "flag", values: [1, 0, 1, 0, 1, 0, 1, 0] }).reasons)
      .toContain("binary-flag");
    expect(evaluateFootballFindLeaderQuality({ unit: "count", values: [8, 7, 6, 5, 4, 3, 2] }).reasons)
      .toContain("too-few-candidates");
    expect(evaluateFootballFindLeaderQuality({ unit: "count", values: [3, 3, 2, 2, 2, 1, 1, 1] }).reasons)
      .toContain("too-few-distinct-values");
    expect(evaluateFootballFindLeaderQuality({ unit: "count", values: [10, 10, 9, 8, 7, 6, 5, 4] }).reasons)
      .toContain("tied-leader");
    expect(evaluateFootballFindLeaderQuality({ unit: "count", values: [5, 5, 5, 5, 5, 5, 5, 5] }).reasons)
      .toContain("no-spread");
    expect(evaluateFootballFindLeaderQuality({ unit: "count", values: [1000, 200, 190, 180, 170, 160, 150, 140] }).reasons)
      .toContain("trivial-leader");
    expect(evaluateFootballFindLeaderQuality({ unit: "count", values: [8, 7, 6, 5, 4, 3, 2, Number.NaN] }).reasons)
      .toContain("non-finite-value");
  });
});
