import { describe, expect, it } from "vitest";
import {
  BAR_TRIVIA_ROUND_NAMES,
  BAR_TRIVIA_ROUND_SLOTS,
} from "../games/barTriviaEngine";
import { MLB_BAR_TRIVIA_MOCK_RUN } from "./mlbBarTriviaMockRun";

describe("MLB Bar Trivia Casual calibration run", () => {
  it("uses the locked 3-3-3-1 Bar Trivia shape without entering the production bank", () => {
    expect(MLB_BAR_TRIVIA_MOCK_RUN).toHaveLength(10);
    expect(MLB_BAR_TRIVIA_MOCK_RUN.map((question) => question.round)).toEqual(BAR_TRIVIA_ROUND_SLOTS);
    expect(MLB_BAR_TRIVIA_MOCK_RUN.every((question) => question.league === "mlb")).toBe(true);
    expect(new Set(MLB_BAR_TRIVIA_MOCK_RUN.map((question) => question.id)).size).toBe(10);
    expect(MLB_BAR_TRIVIA_MOCK_RUN.every((question) => question.choices.includes(question.answer))).toBe(true);
  });

  it("calibrates MLB one full level easier than the football and UFC banks", () => {
    expect(MLB_BAR_TRIVIA_MOCK_RUN.slice(0, 3).map((question) => question.difficulty)).toEqual([
      "easy",
      "easy",
      "easy",
    ]);
    expect(MLB_BAR_TRIVIA_MOCK_RUN.slice(3, 6).map((question) => question.difficulty)).toEqual([
      "medium",
      "medium",
      "medium",
    ]);
    expect(MLB_BAR_TRIVIA_MOCK_RUN.slice(6, 9).map((question) => question.difficulty)).toEqual([
      "hard",
      "hard",
      "hard",
    ]);
    expect(MLB_BAR_TRIVIA_MOCK_RUN[9]!.difficulty).toBe("last-call");

    expect(MLB_BAR_TRIVIA_MOCK_RUN.slice(0, 3).map((question) => question.answer)).toEqual([
      "Babe Ruth",
      "Barry Bonds",
      "Derek Jeter",
    ]);
  });

  it("uses MLB-specific round language", () => {
    expect(BAR_TRIVIA_ROUND_NAMES.mlb).toEqual({
      round1: "Around the Diamond",
      round2: "Deep Cuts",
      round3: "Late Innings",
      "last-call": "Last Call",
    });
  });
});
