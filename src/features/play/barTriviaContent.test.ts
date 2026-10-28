import { describe, expect, it } from "vitest";
import { BAR_TRIVIA_QUESTION_BANK } from "./barTriviaQuestionBank";

describe("Bar Trivia question bank", () => {
  it("keeps usable quality-first depth for all three sports and every round", () => {
    const targets = {
      // Safety floors support ten-question runs; keep/cut editorial decisions
      // must not be reversed just to satisfy historic quantity quotas.
      nfl: { total: 140, round1: 55, round2: 35, round3: 25, lastCall: 10 },
      cfb: { total: 140, round1: 55, round2: 30, round3: 25, lastCall: 10 },
      ufc: { total: 220, round1: 55, round2: 50, round3: 35, lastCall: 15 },
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
    expect(currentEvents.length).toBeGreaterThanOrEqual(30);
    // Current-event facts expire; retiring weak articles is better than
    // keeping a fixed quota of weak/unrecognizable news.
    for (const league of ["nfl", "cfb", "ufc"] as const) {
      expect(currentEvents.filter((question) => question.league === league).length).toBeGreaterThanOrEqual(5);
    }

    for (const question of currentEvents) {
      expect(question.activeFrom).toBeTruthy();
      expect(question.expiresAt).toBeTruthy();
      expect(question.sourceUrl).toMatch(/^https:\/\//);
      expect(question.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(question.activeFrom!).getTime()).toBeLessThan(new Date(question.expiresAt!).getTime());
    }
  });

  it("keeps the recalibrated difficulty aligned to the playable round", () => {
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

  it("keeps a deep genuinely easy evergreen pool for every sport", () => {
    for (const league of ["nfl", "cfb", "ufc"] as const) {
      const easy = BAR_TRIVIA_QUESTION_BANK.filter(
        (question) =>
          question.league === league &&
          question.contentType === "evergreen" &&
          question.round === "round1" &&
          question.difficulty === "easy",
      );
      expect(easy.length).toBeGreaterThanOrEqual(60);
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

  it("never makes an arbitrary UFC event number or Super Bowl number the answer", () => {
    const allowedUfcMilestones = new Set(["UFC 100", "UFC 200", "UFC 300"]);

    for (const question of BAR_TRIVIA_QUESTION_BANK) {
      const answer = question.answer.trim();
      const superBowlNumberAnswer = /^Super Bowl\s+[IVXLCDM\d]+$/i.test(answer);
      const ufcNumberAnswer = /^UFC(?:\s+on\s+\S+\s+\d+|\s+\d+(?::|$))/i.test(answer);

      expect(superBowlNumberAnswer).toBe(false);
      if (ufcNumberAnswer) {
        expect(allowedUfcMilestones.has(answer)).toBe(true);
      }
    }
  });

  it("avoids the retired Fact Check stat-threshold format in the seed bank", () => {
    const prompts = BAR_TRIVIA_QUESTION_BANK.map((question) => question.prompt.toLowerCase());
    expect(prompts.some((prompt) => prompt.includes("career passing yards"))).toBe(false);
    expect(prompts.some((prompt) => prompt.includes("career rushing yards"))).toBe(false);
  });
});
