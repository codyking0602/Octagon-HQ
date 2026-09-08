import { describe, expect, it } from "vitest";
import {
  TWENTY_QUESTIONS_LIMIT,
  twentyQuestionsFinalGuessIsDirectlyPlayable,
  twentyQuestionsRecommendedQuestions,
  type TwentyQuestionsUniverse,
} from "./twentyQuestionsEngine";
import { getFootballTwentyQuestionsRuntimeUniverse } from "./twentyQuestionsFootballRuntimeAuthority";
import { getUfcTwentyQuestionsUniverse } from "./twentyQuestionsUfcAuthority";

function simulateRecommendedPath(universe: TwentyQuestionsUniverse, hiddenSubjectId: string) {
  let remainingSubjects = [...universe.subjects];
  const askedQuestionIds = new Set<string>();

  for (let questionNumber = 0; questionNumber < TWENTY_QUESTIONS_LIMIT && remainingSubjects.length > 1; questionNumber += 1) {
    const availableQuestions = universe.questions.filter((question) => !askedQuestionIds.has(question.id));
    const recommended = twentyQuestionsRecommendedQuestions(availableQuestions, remainingSubjects, 5);
    const question = recommended[0];
    if (!question) break;

    askedQuestionIds.add(question.id);
    const trueAnswer = question.answer(hiddenSubjectId);
    remainingSubjects = remainingSubjects.filter((subject) => question.answer(subject.id) === trueAnswer);
  }

  return {
    askedQuestionIds: [...askedQuestionIds],
    remainingSubjects,
  };
}

function expectUniverseSolvable(universe: TwentyQuestionsUniverse) {
  const failures: string[] = [];

  for (const hiddenSubject of universe.subjects) {
    const result = simulateRecommendedPath(universe, hiddenSubject.id);
    const hiddenStillLive = result.remainingSubjects.some((subject) => subject.id === hiddenSubject.id);
    const solved = result.remainingSubjects.length === 1;
    const playableFinalGuess = twentyQuestionsFinalGuessIsDirectlyPlayable(result.remainingSubjects.length);

    if (!hiddenStillLive || (!solved && !playableFinalGuess)) {
      failures.push(
        `${hiddenSubject.name}: ${result.remainingSubjects.length} remain after ${result.askedQuestionIds.length} questions; `
        + `remaining=[${result.remainingSubjects.map((subject) => subject.name).join(", ")}]; `
        + `asked=[${result.askedQuestionIds.join(", ")}]`,
      );
    }
  }

  expect(failures, `${universe.league} 20 Questions solvability failures:\n${failures.join("\n")}`).toEqual([]);
}

describe("20 Questions actual Recommended-path readiness", () => {
  it("keeps every UFC subject solvable or on a directly playable forced-final board", () => {
    expectUniverseSolvable(getUfcTwentyQuestionsUniverse());
  });

  it("keeps every NFL subject solvable or on a directly playable forced-final board", () => {
    expectUniverseSolvable(getFootballTwentyQuestionsRuntimeUniverse("NFL"));
  });

  it("keeps every CFB subject solvable or on a directly playable forced-final board", () => {
    expectUniverseSolvable(getFootballTwentyQuestionsRuntimeUniverse("CFB"));
  });
});
