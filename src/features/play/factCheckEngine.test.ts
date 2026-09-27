import { describe, expect, it } from "vitest";
import {
  FACT_CHECK_DIFFICULTY_PLAN,
  buildFactCheckRun,
  createFactCheckState,
  isFactCheckItemActive,
  submitFactCheckAnswer,
  type FactCheckItem,
} from "../games/factCheckEngine";
import { FOOTBALL_FACT_CHECK_BANK } from "./footballFactCheckBank";

describe("Fact Check engine", () => {
  it("builds a ten-question run with the locked easy-to-hard shape and no duplicates", () => {
    const run = buildFactCheckRun(FOOTBALL_FACT_CHECK_BANK, {
      onDate: "2026-09-27",
      random: () => 0,
    });

    expect(run).toHaveLength(10);
    expect(run.map((item) => item.difficulty)).toEqual(FACT_CHECK_DIFFICULTY_PLAN);
    expect(new Set(run.map((item) => item.id)).size).toBe(10);
    expect(new Set(run.map((item) => item.format)).size).toBeGreaterThanOrEqual(3);
  });

  it("supports weekly facts with explicit activation and expiration dates", () => {
    const weekly: FactCheckItem = {
      id: "weekly-test",
      sport: "football",
      league: "cfb",
      format: "true_false",
      difficulty: 1,
      prompt: "Weekly test fact.",
      choices: ["TRUE", "FALSE"],
      answer: "TRUE",
      explanation: "Test.",
      recency: "weekly",
      activeFrom: "2026-09-21",
      expiresAfter: "2026-09-27",
    };

    expect(isFactCheckItemActive(weekly, "2026-09-20")).toBe(false);
    expect(isFactCheckItemActive(weekly, "2026-09-21")).toBe(true);
    expect(isFactCheckItemActive(weekly, "2026-09-27")).toBe(true);
    expect(isFactCheckItemActive(weekly, "2026-09-28")).toBe(false);
  });

  it("scores streaks and consumes Lock It only when it is actually used", () => {
    const run = buildFactCheckRun(FOOTBALL_FACT_CHECK_BANK, {
      onDate: "2026-09-27",
      random: () => 0,
    });
    const first = run[0]!;
    const second = run[1]!;

    const opening = createFactCheckState();
    const firstAnswer = submitFactCheckAnswer(run, opening, first.answer, true);
    expect(firstAnswer.result.correct).toBe(true);
    expect(firstAnswer.result.points).toBe(20);
    expect(firstAnswer.state.locksRemaining).toBe(1);
    expect(firstAnswer.state.streak).toBe(1);

    const wrongChoice = second.choices.find((choice) => choice !== second.answer)!;
    const secondAnswer = submitFactCheckAnswer(run, firstAnswer.state, wrongChoice, false);
    expect(secondAnswer.result.correct).toBe(false);
    expect(secondAnswer.result.points).toBe(0);
    expect(secondAnswer.state.locksRemaining).toBe(1);
    expect(secondAnswer.state.streak).toBe(0);
  });

  it("keeps every seeded answer inside its two visible choices", () => {
    for (const item of FOOTBALL_FACT_CHECK_BANK) {
      expect(item.choices).toHaveLength(2);
      expect(item.choices).toContain(item.answer);
      expect(item.explanation.length).toBeGreaterThan(10);
    }
  });
});
