import { describe, expect, it } from "vitest";
import {
  chooseTwentyQuestionsFootballLeague,
  TWENTY_QUESTIONS_BANK_LIMIT,
  type TwentyQuestionsUniverse,
} from "./twentyQuestionsEngine";
import { getFootballTwentyQuestionsUniverse } from "./twentyQuestionsFootballAuthority";
import { createTwentyQuestionsRound } from "./twentyQuestionsRuntime";
import {
  UFC_TWENTY_QUESTIONS_SUBJECT_COUNT,
  getUfcTwentyQuestionsUniverse,
} from "./twentyQuestionsUfcAuthority";

function createFootballRound(random: () => number) {
  const league = chooseTwentyQuestionsFootballLeague(random);
  return createTwentyQuestionsRound(
    "football",
    getFootballTwentyQuestionsUniverse(league),
    random,
  );
}

function answerFingerprints(universe: TwentyQuestionsUniverse) {
  return universe.subjects.map((subject) => universe.questions
    .map((question) => question.answer(subject.id) ? "1" : "0")
    .join(""));
}

describe("UFC 20 Questions factual authority", () => {
  it("uses the canonical 100-subject UFC factual universe", () => {
    const universe = getUfcTwentyQuestionsUniverse();
    expect(UFC_TWENTY_QUESTIONS_SUBJECT_COUNT).toBe(100);
    expect(universe.league).toBe("UFC");
    expect(universe.subjects).toHaveLength(100);
    expect(universe.subjects.every((subject) => subject.kind === "fighter")).toBe(true);
    expect(new Set(universe.subjects.map((subject) => subject.id)).size).toBe(100);
  });

  it("keeps the live UFC bank compact, distinguishing, deterministic, and statically priced", () => {
    const universe = getUfcTwentyQuestionsUniverse();
    expect(universe.questions.length).toBeGreaterThan(10);
    expect(universe.questions.length).toBeLessThanOrEqual(TWENTY_QUESTIONS_BANK_LIMIT);
    expect(new Set(answerFingerprints(universe)).size).toBe(universe.subjects.length);
    for (const question of universe.questions) {
      expect([5, 6, 7, 8]).toContain(question.internalCost);
      const before = question.internalCost;
      for (const subject of universe.subjects) expect(typeof question.answer(subject.id)).toBe("boolean");
      expect(question.internalCost).toBe(before);
    }
  });
});

describe("Football 20 Questions runtime", () => {
  it("discloses NFL or CFB before play and never combines the universes", () => {
    const nfl = createFootballRound((() => {
      const values = [0.1, 0.2];
      return () => values.shift() ?? 0;
    })());
    const cfb = createFootballRound((() => {
      const values = [0.9, 0.2];
      return () => values.shift() ?? 0;
    })());
    expect(nfl.universe.league).toBe("NFL");
    expect(cfb.universe.league).toBe("CFB");
    expect(nfl.hiddenSubject.league).toBe("NFL");
    expect(cfb.hiddenSubject.league).toBe("CFB");
    expect(nfl.universe.subjects).toHaveLength(120);
    expect(cfb.universe.subjects).toHaveLength(120);
  });

  for (const league of ["NFL", "CFB"] as const) {
    it(`${league} has a compact distinguishing bank with no repeated ids or unknown answers`, () => {
      const universe = getFootballTwentyQuestionsUniverse(league);
      expect(universe.questions.length).toBeGreaterThan(10);
      expect(universe.questions.length).toBeLessThanOrEqual(TWENTY_QUESTIONS_BANK_LIMIT);
      expect(new Set(universe.questions.map((question) => question.id)).size).toBe(universe.questions.length);
      expect(new Set(answerFingerprints(universe)).size).toBe(universe.subjects.length);
      for (const question of universe.questions) {
        for (const subject of universe.subjects) expect(typeof question.answer(subject.id)).toBe("boolean");
      }
    });
  }
});
