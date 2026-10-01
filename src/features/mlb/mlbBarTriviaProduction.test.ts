import { describe, expect, it } from "vitest";
import { BAR_TRIVIA_ROUND_SLOTS } from "../games/barTriviaEngine";
import {
  MLB_BAR_TRIVIA_DOUBLE_ROUND,
  MLB_BAR_TRIVIA_PRODUCTION_CHALLENGE_KEY,
  MLB_BAR_TRIVIA_PRODUCTION_DATE,
  MLB_BAR_TRIVIA_PRODUCTION_RUN,
  MLB_BAR_TRIVIA_SECOND_DOUBLE_ROUND,
  MLB_BAR_TRIVIA_SECOND_PRODUCTION_CHALLENGE_KEY,
  MLB_BAR_TRIVIA_SECOND_PRODUCTION_DATE,
  MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN,
  mlbBarTriviaProductionConfig,
} from "./mlbBarTriviaProduction";

describe("MLB Bar Trivia production run", () => {
  it("locks the October 11 official identity and approved 3-3-3-1 game shape", () => {
    expect(MLB_BAR_TRIVIA_PRODUCTION_CHALLENGE_KEY).toBe("mlb-2026-play-11");
    expect(MLB_BAR_TRIVIA_PRODUCTION_DATE).toBe("2026-10-11");
    expect(MLB_BAR_TRIVIA_DOUBLE_ROUND).toBe("round2");
    expect(MLB_BAR_TRIVIA_PRODUCTION_RUN).toHaveLength(10);
    expect(MLB_BAR_TRIVIA_PRODUCTION_RUN.map((question) => question.round)).toEqual(BAR_TRIVIA_ROUND_SLOTS);
    expect(MLB_BAR_TRIVIA_PRODUCTION_RUN.every((question) => question.league === "mlb")).toBe(true);
    expect(new Set(MLB_BAR_TRIVIA_PRODUCTION_RUN.map((question) => question.id)).size).toBe(10);
  });

  it("uses the intentionally easier MLB calibration without answer-position patterns", () => {
    expect(MLB_BAR_TRIVIA_PRODUCTION_RUN.slice(0, 3).every((question) => question.difficulty === "easy")).toBe(true);
    expect(MLB_BAR_TRIVIA_PRODUCTION_RUN.slice(3, 6).every((question) => question.difficulty === "medium")).toBe(true);
    expect(MLB_BAR_TRIVIA_PRODUCTION_RUN.slice(6, 9).every((question) => question.difficulty === "hard")).toBe(true);
    expect(MLB_BAR_TRIVIA_PRODUCTION_RUN[9]!.difficulty).toBe("last-call");

    const answerPositions = MLB_BAR_TRIVIA_PRODUCTION_RUN.map((question) => question.choices.indexOf(question.answer));
    expect(new Set(answerPositions).size).toBe(4);
    expect(MLB_BAR_TRIVIA_PRODUCTION_RUN.every((question) => question.choices.includes(question.answer))).toBe(true);
  });
  it("locks a fresh October 27 run without reusing the October 11 questions", () => {
    expect(MLB_BAR_TRIVIA_SECOND_PRODUCTION_CHALLENGE_KEY).toBe("mlb-2026-play-16");
    expect(MLB_BAR_TRIVIA_SECOND_PRODUCTION_DATE).toBe("2026-10-27");
    expect(MLB_BAR_TRIVIA_SECOND_DOUBLE_ROUND).toBe("round3");
    expect(MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN).toHaveLength(10);
    expect(MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN.map((question) => question.round)).toEqual(BAR_TRIVIA_ROUND_SLOTS);

    const firstIds = new Set(MLB_BAR_TRIVIA_PRODUCTION_RUN.map((question) => question.id));
    expect(MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN.every((question) => !firstIds.has(question.id))).toBe(true);
    expect(new Set(MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN.map((question) => question.id)).size).toBe(10);
  });

  it("keeps the second run on the same easier MLB calibration and all four answer positions", () => {
    expect(MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN.slice(0, 3).every((question) => question.difficulty === "easy")).toBe(true);
    expect(MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN.slice(3, 6).every((question) => question.difficulty === "medium")).toBe(true);
    expect(MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN.slice(6, 9).every((question) => question.difficulty === "hard")).toBe(true);
    expect(MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN[9]!.difficulty).toBe("last-call");

    const answerPositions = MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN.map((question) => question.choices.indexOf(question.answer));
    expect(new Set(answerPositions).size).toBe(4);
    expect(MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN.every((question) => question.choices.includes(question.answer))).toBe(true);
  });

  it("resolves both scheduled Bar Trivia slots and rejects mismatched dates", () => {
    expect(mlbBarTriviaProductionConfig("mlb-2026-play-11", "2026-10-11")?.run)
      .toBe(MLB_BAR_TRIVIA_PRODUCTION_RUN);
    expect(mlbBarTriviaProductionConfig("mlb-2026-play-16", "2026-10-27")?.run)
      .toBe(MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN);
    expect(mlbBarTriviaProductionConfig("mlb-2026-play-16", "2026-10-26")).toBeNull();
  });

});
