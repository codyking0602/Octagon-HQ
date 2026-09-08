import { describe, expect, it } from "vitest";
import {
  twentyQuestionsEligibleQuestions,
  twentyQuestionsRecommendedQuestions,
  type TwentyQuestionsUniverse,
} from "./twentyQuestionsEngine";
import { getFootballTwentyQuestionsRuntimeUniverse } from "./twentyQuestionsFootballRuntimeAuthority";

const ENDGAME_FINGERPRINT_FAMILY = "endgame-fingerprint";

function familyForQuestion(id: string) {
  const parts = id.split(":");
  return parts.length > 1 ? parts.slice(0, -1).join(":") : id;
}

function assertPositionSpecificDepth(universe: TwentyQuestionsUniverse, positions: readonly string[]) {
  for (const position of positions) {
    const positionQuestion = universe.questions.find((question) => question.id === `position:${position}`);
    expect(positionQuestion, `${universe.league} is missing the ${position.toUpperCase()} identity clue`).toBeDefined();
    if (!positionQuestion) continue;

    const positionSubjects = universe.subjects.filter((subject) => positionQuestion.answer(subject.id));
    if (positionSubjects.length <= 5) continue;

    const eligible = twentyQuestionsEligibleQuestions(universe.questions, positionSubjects);
    const production = eligible.filter((question) => (
      question.id.startsWith("production:")
      && question.recommendationFamily !== ENDGAME_FINGERPRINT_FAMILY
    ));
    expect(
      production.length,
      `${universe.league} ${position.toUpperCase()} should have multiple meaningful production clues after position is known`,
    ).toBeGreaterThanOrEqual(2);

    const recommended = twentyQuestionsRecommendedQuestions(eligible, positionSubjects, 5);
    expect(recommended.length).toBeGreaterThan(0);
    expect(recommended.some((question) => question.recommendationFamily === ENDGAME_FINGERPRINT_FAMILY)).toBe(false);
    expect(new Set(recommended.map((question) => question.recommendationFamily)).size).toBeGreaterThan(1);
  }
}

function assertHumanRuntimeShape(league: "NFL" | "CFB") {
  const universe = getFootballTwentyQuestionsRuntimeUniverse(league);
  const ids = universe.questions.map((question) => question.id);
  const familyCounts = new Map<string, number>();
  for (const id of ids) familyCounts.set(familyForQuestion(id), (familyCounts.get(familyForQuestion(id)) ?? 0) + 1);

  expect(universe.subjects).toHaveLength(120);
  expect(universe.questions.length).toBeGreaterThan(50);
  expect(universe.questions.length).toBeLessThanOrEqual(360);
  expect(ids.filter((id) => id.startsWith("position:")).length).toBeGreaterThanOrEqual(6);
  expect(ids.filter((id) => id.includes("-fine:")).length).toBeLessThan(universe.questions.length / 3);
  expect(Math.max(...[...familyCounts.values()])).toBeLessThan(40);

  const fingerprintQuestions = universe.questions.filter((question) => (
    question.id.includes("-fine:") || question.id.startsWith("coach:losses:")
  ));
  for (const question of fingerprintQuestions) {
    expect(question.humanValue).toBe(1);
    expect(question.recommendationFamily).toBe(ENDGAME_FINGERPRINT_FAMILY);
  }

  const broadEligible = twentyQuestionsEligibleQuestions(universe.questions, universe.subjects);
  expect(broadEligible.some((question) => question.recommendationFamily === ENDGAME_FINGERPRINT_FAMILY)).toBe(false);

  for (const question of universe.questions) {
    expect(question.humanValue).toBeGreaterThanOrEqual(1);
    expect(question.humanValue).toBeLessThanOrEqual(4);
    expect(question.recommendationFamily).toBeTruthy();
    for (const subject of universe.subjects) expect(typeof question.answer(subject.id)).toBe("boolean");
  }

  assertPositionSpecificDepth(universe, ["qb", "rb", "wr"]);
}

describe("Football 20 Questions human runtime", () => {
  it("keeps the NFL runtime compact, diverse, deterministic, and human-first", () => {
    const universe = getFootballTwentyQuestionsRuntimeUniverse("NFL");
    const ids = universe.questions.map((question) => question.id);
    assertHumanRuntimeShape("NFL");
    expect(ids.some((id) => id.includes(":era:") || id.includes("longevity"))).toBe(true);
  });

  it("keeps the College runtime compact, diverse, deterministic, and human-first", () => {
    const universe = getFootballTwentyQuestionsRuntimeUniverse("CFB");
    const ids = universe.questions.map((question) => question.id);
    assertHumanRuntimeShape("CFB");
    expect(ids.some((id) => id.startsWith("award:heisman:") || id.startsWith("coach:national-titles:"))).toBe(true);
  });
});
