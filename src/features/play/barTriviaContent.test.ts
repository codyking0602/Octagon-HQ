import { describe, expect, it } from "vitest";
import { BAR_TRIVIA_QUESTION_BANK } from "./barTriviaQuestionBank";

describe("Bar Trivia question bank", () => {
  it("ships a complete seed set for all three sports and every round", () => {
    const targets = {
      nfl: { total: 200, round1: 60, round2: 60, round3: 60, lastCall: 20 },
      cfb: { total: 200, round1: 60, round2: 60, round3: 60, lastCall: 20 },
      ufc: { total: 320, round1: 90, round2: 90, round3: 90, lastCall: 30 },
    } as const;

    for (const league of ["nfl", "cfb", "ufc"] as const) {
      const questions = BAR_TRIVIA_QUESTION_BANK.filter((question) => question.league === league);
      const evergreen = questions.filter((question) => question.contentType === "evergreen");
      const target = targets[league];
      expect(evergreen.length).toBeGreaterThanOrEqual(target.total);
      expect(evergreen.filter((question) => question.round === "round1").length).toBeGreaterThanOrEqual(target.round1);
      expect(evergreen.filter((question) => question.round === "round2").length).toBeGreaterThanOrEqual(target.round2);
      expect(evergreen.filter((question) => question.round === "round3").length).toBeGreaterThanOrEqual(target.round3);
      expect(evergreen.filter((question) => question.round === "last-call").length).toBeGreaterThanOrEqual(target.lastCall);
    }
  });

  it("keeps every question four-choice, answerable, and reveal-ready", () => {
    const ids = BAR_TRIVIA_QUESTION_BANK.map((question) => question.id);
    const prompts = BAR_TRIVIA_QUESTION_BANK.map((question) => question.prompt.trim().toLowerCase());
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(prompts).size).toBe(prompts.length);

    for (const question of BAR_TRIVIA_QUESTION_BANK) {
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices).size).toBe(4);
      expect(question.choices).toContain(question.answer);
      expect(question.prompt.length).toBeGreaterThan(20);
      expect(question.explanation.length).toBeGreaterThan(20);
      expect(question.sourceId).toBeTruthy();
      expect(["easy", "medium", "hard", "last-call"]).toContain(question.difficulty);
      expect(["evergreen", "current-event"]).toContain(question.contentType);
    }
  });

  it("gives every current-event question an explicit eligibility window and verifiable source", () => {
    const currentEvents = BAR_TRIVIA_QUESTION_BANK.filter((question) => question.contentType === "current-event");
    expect(currentEvents.length).toBeGreaterThanOrEqual(3);

    for (const question of currentEvents) {
      expect(question.activeFrom).toBeTruthy();
      expect(question.expiresAt).toBeTruthy();
      expect(question.sourceUrl).toMatch(/^https:\/\//);
      expect(question.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(question.activeFrom!).getTime()).toBeLessThan(new Date(question.expiresAt!).getTime());
    }
  });

  it("keeps authored difficulty aligned to the round unless explicitly escalated later", () => {
    const expected = {
      round1: "easy",
      round2: "medium",
      round3: "hard",
      "last-call": "last-call",
    } as const;

    for (const question of BAR_TRIVIA_QUESTION_BANK) {
      expect(question.difficulty).toBe(expected[question.round]);
    }
  });

  it("keeps each sport broad enough to avoid a one-theme trivia bank", () => {
    for (const league of ["nfl", "cfb", "ufc"] as const) {
      const evergreen = BAR_TRIVIA_QUESTION_BANK.filter(
        (question) => question.league === league && question.contentType === "evergreen",
      );
      expect(new Set(evergreen.map((question) => question.category)).size).toBeGreaterThanOrEqual(10);
    }
  });

  it("avoids the retired Fact Check stat-threshold format in the seed bank", () => {
    const prompts = BAR_TRIVIA_QUESTION_BANK.map((question) => question.prompt.toLowerCase());
    expect(prompts.some((prompt) => prompt.includes("career passing yards"))).toBe(false);
    expect(prompts.some((prompt) => prompt.includes("career rushing yards"))).toBe(false);
  });
});
