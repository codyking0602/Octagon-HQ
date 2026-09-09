import { describe, expect, it } from "vitest";
import {
  chooseTwentyQuestionsFootballLeague,
  twentyQuestionsRecommendedQuestions,
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

  it("answers canonical UFC championship history correctly for Topuria and established champions", () => {
    const universe = getUfcTwentyQuestionsUniverse();
    const titleFight = universe.questions.find((question) => question.id === "championship:title-challenger");
    const titleWinner = universe.questions.find((question) => question.id === "championship:title-winner");
    const titleDefense = universe.questions.find((question) => question.id === "championship:title-defense");

    expect(titleFight).toBeDefined();
    expect(titleWinner).toBeDefined();
    expect(titleDefense).toBeDefined();
    expect(universe.subjects.some((subject) => subject.id === "ufc:ilia-topuria")).toBe(true);
    expect(universe.subjects.some((subject) => subject.id === "ufc:islam-makhachev")).toBe(true);
    expect(titleFight!.answer("ufc:ilia-topuria")).toBe(true);
    expect(titleWinner!.answer("ufc:ilia-topuria")).toBe(true);
    expect(titleFight!.answer("ufc:islam-makhachev")).toBe(true);
    expect(titleWinner!.answer("ufc:islam-makhachev")).toBe(true);
    expect(titleDefense!.answer("ufc:islam-makhachev")).toBe(true);
  });

  it("prioritizes recognizable UFC identity clues without losing deterministic coverage", () => {
    const universe = getUfcTwentyQuestionsUniverse();
    const ids = universe.questions.map((question) => question.id);
    const divisionQuestions = universe.questions.filter((question) => question.id.startsWith("division:"));
    const namedDivisionQuestions = divisionQuestions.filter((question) => question.id !== "division:primary-under-175");
    const styleQuestions = universe.questions.filter((question) => question.id.startsWith("style:"));

    expect(universe.questions.length).toBeGreaterThan(50);
    expect(universe.questions.length).toBeLessThanOrEqual(UFC_TWENTY_QUESTIONS_RUNTIME_MAX_QUESTIONS);
    expect(new Set(ids).size).toBe(universe.questions.length);
    expect(ids).toContain("identity:woman");
    expect(ids).toContain("division:primary-under-175");
    expect(ids.some((id) => id.startsWith("division:primary:"))).toBe(true);
    expect(ids.some((id) => id.startsWith("era:active-"))).toBe(true);
    expect(ids).toContain("era:pre-2010");
    expect(ids).toContain("championship:title-challenger");
    expect(ids).toContain("championship:title-winner");
    expect(ids).toContain("championship:title-defense");
    expect(ids).toContain("championship:three-plus-title-fights");
    expect(ids).toContain("division-history:multiple");
    expect(ids.some((id) => id.startsWith("faced:"))).toBe(true);
    expect(styleQuestions.length).toBeGreaterThanOrEqual(4);
    expect(styleQuestions.some((question) => question.label.includes("KO/TKO wins than submissions"))).toBe(true);
    expect(styleQuestions.some((question) => question.label.includes("submissions than KO/TKO wins"))).toBe(true);
    expect(styleQuestions.some((question) => question.label.includes("60%"))).toBe(true);
    expect(styleQuestions.every((question) => question.recommendationFamily === "style")).toBe(true);
    expect(ids.some((id) => id.startsWith("stat:losses:"))).toBe(false);
    expect(ids.some((id) => id.includes("active-years"))).toBe(false);
    expect(ids.some((id) => id.includes("opponents-beaten"))).toBe(false);
    expect(ids.some((id) => id.startsWith("stat:ko-tko-wins:"))).toBe(false);
    expect(ids.some((id) => id.startsWith("stat:submission-wins:"))).toBe(false);
    expect(namedDivisionQuestions.every((question) => !/\d+(?:\.\d+)?/.test(question.label))).toBe(true);
    expect(divisionQuestions.every((question) => question.humanValue === 4)).toBe(true);

    for (const question of universe.questions) {
      expect([5, 6, 7, 8]).toContain(question.internalCost);
      const before = question.internalCost;
      for (const subject of universe.subjects) expect(typeof question.answer(subject.id)).toBe("boolean");
      expect(question.internalCost).toBe(before);
    }
    expectPairwiseSeparable(universe);
  });

  it("gives the opening Recommended set a mix of UFC clue families", () => {
    const universe = getUfcTwentyQuestionsUniverse();
    const recommended = twentyQuestionsRecommendedQuestions(universe.questions, universe.subjects, 5);
    const families = recommended.map((question) => question.recommendationFamily);

    expect(recommended).toHaveLength(5);
    expect(new Set(families).size).toBe(5);
    expect(families).toContain("style");
    expect(families).toContain("division");
    expect(families).toContain("era");
    expect(families).toContain("achievement");
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
