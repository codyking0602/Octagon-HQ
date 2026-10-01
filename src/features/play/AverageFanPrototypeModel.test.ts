import { describe, expect, it } from "vitest";
import { validateAverageFanQuestion } from "../games/averageFanEngine";
import {
  AVERAGE_FAN_MONEY_LADDER,
  AVERAGE_FAN_UFC_PREVIEW_BOARD,
  AVERAGE_FAN_UFC_PREVIEW_FINAL,
  averageFanGradeLabel,
  averageFanMoneyLabel,
  resolveAverageFanPreviewAnswer,
} from "./AverageFanPrototypeModel";

describe("Average Fan owner preview pack", () => {
  it("builds the locked eight-tile board with two questions per playable grade", () => {
    expect(AVERAGE_FAN_UFC_PREVIEW_BOARD).toHaveLength(8);
    for (const grade of [2, 3, 4, 5]) {
      expect(AVERAGE_FAN_UFC_PREVIEW_BOARD.filter((question) => question.grade === grade)).toHaveLength(2);
    }
    expect(AVERAGE_FAN_UFC_PREVIEW_BOARD.every((question) => !question.protectedFinal)).toBe(true);
  });

  it("exercises all three canonical answer formats", () => {
    expect(new Set(AVERAGE_FAN_UFC_PREVIEW_BOARD.map((question) => question.format)))
      .toEqual(new Set(["short-answer", "four-choice", "true-false"]));
  });

  it("keeps the Final isolated, protected, and schema-valid", () => {
    expect(AVERAGE_FAN_UFC_PREVIEW_FINAL.protectedFinal).toBe(true);
    expect(AVERAGE_FAN_UFC_PREVIEW_FINAL.grade).toBe(5);
    expect(validateAverageFanQuestion(AVERAGE_FAN_UFC_PREVIEW_FINAL)).toEqual([]);
    expect(AVERAGE_FAN_UFC_PREVIEW_BOARD.some((question) => question.id === AVERAGE_FAN_UFC_PREVIEW_FINAL.id))
      .toBe(false);
  });

  it("keeps every preview board question inside the canonical PR1 schema", () => {
    for (const question of AVERAGE_FAN_UFC_PREVIEW_BOARD) {
      expect(validateAverageFanQuestion(question)).toEqual([]);
    }
  });

  it("consumes Save only on a wrong player answer and mirrors the deterministic fan outcome", () => {
    const question = AVERAGE_FAN_UFC_PREVIEW_BOARD[0]!;
    const correct = resolveAverageFanPreviewAnswer({
      question,
      fan: "shane",
      playerAnswer: question.answer,
      saveAvailable: true,
    });
    expect(correct.correct).toBe(true);
    expect(correct.saveConsumed).toBe(false);
    expect(correct.saved).toBe(false);

    const wrongWithoutSave = resolveAverageFanPreviewAnswer({
      question,
      fan: "shane",
      playerAnswer: "__definitely wrong__",
      saveAvailable: false,
    });
    expect(wrongWithoutSave.correct).toBe(false);
    expect(wrongWithoutSave.saveConsumed).toBe(false);
    expect(wrongWithoutSave.saved).toBe(false);

    const wrongWithSave = resolveAverageFanPreviewAnswer({
      question,
      fan: "shane",
      playerAnswer: "__definitely wrong__",
      saveAvailable: true,
    });
    expect(wrongWithSave.correct).toBe(false);
    expect(wrongWithSave.saveConsumed).toBe(true);
    expect(wrongWithSave.saved).toBe(wrongWithSave.fanAnswer.correct);
  });

  it("uses the locked money ladder and display helpers", () => {
    expect(AVERAGE_FAN_MONEY_LADDER).toEqual([
      1_000,
      2_000,
      5_000,
      10_000,
      25_000,
      50_000,
      100_000,
      500_000,
    ]);
    expect(averageFanMoneyLabel(1_000_000)).toBe("$1,000,000");
    expect(averageFanGradeLabel(2)).toBe("2nd Grade");
    expect(averageFanGradeLabel(5)).toBe("5th Grade");
  });
});
