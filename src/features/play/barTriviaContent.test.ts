import { describe, expect, it } from "vitest";
import { BAR_TRIVIA_QUESTION_BANK } from "./barTriviaQuestionBank";

describe("Bar Trivia PR1 question bank", () => {
  it("ships a complete seed set for all three sports and every round", () => {
    for (const league of ["nfl", "cfb", "ufc"] as const) {
      const questions = BAR_TRIVIA_QUESTION_BANK.filter((question) => question.league === league);
      expect(questions.length).toBeGreaterThanOrEqual(18);
      expect(questions.filter((question) => question.round === "round1").length).toBeGreaterThanOrEqual(5);
      expect(questions.filter((question) => question.round === "round2").length).toBeGreaterThanOrEqual(5);
      expect(questions.filter((question) => question.round === "round3").length).toBeGreaterThanOrEqual(5);
      expect(questions.filter((question) => question.round === "last-call").length).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps every question four-choice, answerable, and reveal-ready", () => {
    const ids = BAR_TRIVIA_QUESTION_BANK.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const question of BAR_TRIVIA_QUESTION_BANK) {
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices).size).toBe(4);
      expect(question.choices).toContain(question.answer);
      expect(question.prompt.length).toBeGreaterThan(20);
      expect(question.explanation.length).toBeGreaterThan(20);
      expect(question.sourceId).toBeTruthy();
    }
  });

  it("avoids the retired Fact Check stat-threshold format in the seed bank", () => {
    const prompts = BAR_TRIVIA_QUESTION_BANK.map((question) => question.prompt.toLowerCase());
    expect(prompts.some((prompt) => prompt.includes("career passing yards"))).toBe(false);
    expect(prompts.some((prompt) => prompt.includes("career rushing yards"))).toBe(false);
  });
});
