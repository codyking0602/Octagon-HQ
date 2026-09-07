import { describe, expect, it } from "vitest";
import {
  TWENTY_QUESTIONS_LIMIT,
  TWENTY_QUESTIONS_START_SCORE,
  TWENTY_QUESTIONS_WRONG_GUESS_PENALTY,
  chooseTwentyQuestionsFootballLeague,
  formatTwentyQuestionsScoreImpact,
  twentyQuestionsCostForSplit,
  twentyQuestionsFinalScore,
  twentyQuestionsScoreAfterQuestion,
  twentyQuestionsScoreAfterWrongGuess,
  twentyQuestionsScoreImpact,
} from "./twentyQuestionsEngine";

describe("20 Questions scoring contract", () => {
  it("uses the locked 10-question cap and 100-point start", () => {
    expect(TWENTY_QUESTIONS_LIMIT).toBe(10);
    expect(TWENTY_QUESTIONS_START_SCORE).toBe(100);
    expect(TWENTY_QUESTIONS_WRONG_GUESS_PENALTY).toBe(10);
  });

  it("converts internal 5-8 calibration to the actual player-facing score impact", () => {
    expect([5, 6, 7, 8].map((cost) => twentyQuestionsScoreImpact(cost as 5 | 6 | 7 | 8)))
      .toEqual([2, 2.4, 2.8, 3.2]);
    expect([5, 6, 7, 8].map((cost) => formatTwentyQuestionsScoreImpact(cost as 5 | 6 | 7 | 8)))
      .toEqual(["−2.0 pts", "−2.4 pts", "−2.8 pts", "−3.2 pts"]);
  });

  it("prices questions once from their full-universe split", () => {
    expect(twentyQuestionsCostForSplit(5, 100)).toBe(5);
    expect(twentyQuestionsCostForSplit(20, 100)).toBe(6);
    expect(twentyQuestionsCostForSplit(30, 100)).toBe(7);
    expect(twentyQuestionsCostForSplit(40, 100)).toBe(8);
    expect(twentyQuestionsCostForSplit(50, 100)).toBe(8);
  });

  it("applies question and wrong-guess deductions and rounds only the final score", () => {
    let score = 100;
    score = twentyQuestionsScoreAfterQuestion(score, 8);
    expect(score).toBeCloseTo(96.8);
    score = twentyQuestionsScoreAfterWrongGuess(score);
    expect(score).toBeCloseTo(86.8);
    expect(twentyQuestionsFinalScore(score)).toBe(87);
    expect(twentyQuestionsFinalScore(-10)).toBe(0);
    expect(twentyQuestionsFinalScore(110)).toBe(100);
  });

  it("makes ten cheap questions equal 80 before guess penalties", () => {
    let score = 100;
    for (let index = 0; index < 10; index += 1) score = twentyQuestionsScoreAfterQuestion(score, 5);
    expect(score).toBe(80);
  });
});

describe("Football 20 Questions league selection", () => {
  it("uses the locked 50/50 split", () => {
    expect(chooseTwentyQuestionsFootballLeague(() => 0)).toBe("NFL");
    expect(chooseTwentyQuestionsFootballLeague(() => 0.4999)).toBe("NFL");
    expect(chooseTwentyQuestionsFootballLeague(() => 0.5)).toBe("CFB");
    expect(chooseTwentyQuestionsFootballLeague(() => 0.9999)).toBe("CFB");
  });
});
