import { describe, expect, it } from "vitest";
import { chooseTwentyQuestionsFootballLeague } from "./twentyQuestionsEngine";
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

describe("UFC 20 Questions factual authority", () => {
  it("uses the canonical 100-subject UFC factual universe", () => {
    const universe = getUfcTwentyQuestionsUniverse();
    expect(UFC_TWENTY_QUESTIONS_SUBJECT_COUNT).toBe(100);
    expect(universe.league).toBe("UFC");
    expect(universe.subjects).toHaveLength(100);
    expect(universe.subjects.every((subject) => subject.kind === "fighter")).toBe(true);
    expect(new Set(universe.subjects.map((subject) => subject.id)).size).toBe(100);
  });

  it("keeps every live UFC question deterministic and statically priced", () => {
    const universe = getUfcTwentyQuestionsUniverse();
    expect(universe.questions.length).toBeGreaterThan(20);
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
    it(`${league} has no repeated live question ids and no unknown answers`, () => {
      const universe = getFootballTwentyQuestionsUniverse(league);
      expect(new Set(universe.questions.map((question) => question.id)).size).toBe(universe.questions.length);
      for (const question of universe.questions) {
        for (const subject of universe.subjects) expect(typeof question.answer(subject.id)).toBe("boolean");
      }
    });
  }
});
