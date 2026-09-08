import { describe, expect, it } from "vitest";
import {
  chooseTwentyQuestionsFootballLeague,
  type TwentyQuestionsUniverse,
} from "./twentyQuestionsEngine";
import { getFootballTwentyQuestionsUniverse } from "./twentyQuestionsFootballAuthority";
import {
  FOOTBALL_TWENTY_QUESTIONS_RUNTIME_MAX_QUESTIONS,
  getFootballTwentyQuestionsRuntimeUniverse,
} from "./twentyQuestionsFootballRuntimeAuthority";
import { createTwentyQuestionsRound } from "./twentyQuestionsRuntime";
import {
  UFC_TWENTY_QUESTIONS_RUNTIME_MAX_QUESTIONS,
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

function expectPairwiseSeparable(universe: TwentyQuestionsUniverse) {
  for (let leftIndex = 0; leftIndex < universe.subjects.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < universe.subjects.length; rightIndex += 1) {
      const left = universe.subjects[leftIndex]!;
      const right = universe.subjects[rightIndex]!;
      expect(
        universe.questions.some((question) => question.answer(left.id) !== question.answer(right.id)),
        `${universe.league} question bank cannot distinguish ${left.name} from ${right.name}`,
      ).toBe(true);
    }
  }
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

  it("ships a deep deterministic UFC bank that can distinguish every fighter pair", () => {
    const universe = getUfcTwentyQuestionsUniverse();
    expect(universe.questions.length).toBeGreaterThan(50);
    expect(universe.questions.length).toBeLessThanOrEqual(UFC_TWENTY_QUESTIONS_RUNTIME_MAX_QUESTIONS);
    expect(new Set(universe.questions.map((question) => question.id)).size).toBe(universe.questions.length);
    expect(universe.questions.some((question) => question.id.startsWith("stat:losses:"))).toBe(true);
    expect(universe.questions.some((question) => question.id.startsWith("stat:divisions-competed:"))).toBe(true);
    expect(universe.questions.some((question) => question.id.startsWith("stat:interim-title"))).toBe(true);
    for (const question of universe.questions) {
      expect([5, 6, 7, 8]).toContain(question.internalCost);
      const before = question.internalCost;
      for (const subject of universe.subjects) expect(typeof question.answer(subject.id)).toBe("boolean");
      expect(question.internalCost).toBe(before);
    }
    expectPairwiseSeparable(universe);
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

    it(`${league} runtime is deep enough to distinguish every eligible subject pair`, () => {
      const universe = getFootballTwentyQuestionsRuntimeUniverse(league);
      expect(universe.subjects).toHaveLength(120);
      expect(universe.questions.length).toBeGreaterThan(50);
      expect(universe.questions.length).toBeLessThanOrEqual(FOOTBALL_TWENTY_QUESTIONS_RUNTIME_MAX_QUESTIONS);
      expect(new Set(universe.questions.map((question) => question.id)).size).toBe(universe.questions.length);
      for (const question of universe.questions) {
        for (const subject of universe.subjects) expect(typeof question.answer(subject.id)).toBe("boolean");
      }
      expectPairwiseSeparable(universe);
    });
  }
});
