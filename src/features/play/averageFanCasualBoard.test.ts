import { describe, expect, it } from "vitest";
import {
  AVERAGE_FAN_BOARD_QUESTION_COUNT,
  AVERAGE_FAN_PLAYABLE_GRADES,
  type AverageFanSport,
} from "../games/averageFanEngine";
import { buildAverageFanCasualBoard } from "./averageFanCasualBoard";

const SPORTS: readonly Exclude<AverageFanSport, "mlb">[] = ["nfl", "cfb", "ufc"];

describe("Average Fan canonical Casual board", () => {
  it.each(SPORTS)("builds a complete %s game from the canonical bank", (sport) => {
    const board = buildAverageFanCasualBoard(
      sport,
      `test-${sport}-one`,
      "2026-09-29T12:00:00.000Z",
    );

    expect(board.sport).toBe(sport);
    expect(board.questions).toHaveLength(AVERAGE_FAN_BOARD_QUESTION_COUNT);
    expect(new Set(board.questions.map((question) => question.id)).size).toBe(AVERAGE_FAN_BOARD_QUESTION_COUNT);

    for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
      expect(board.questions.filter((question) => question.grade === grade)).toHaveLength(2);
    }

    expect(board.questions.every((question) => question.sport === sport)).toBe(true);
    expect(board.questions.every((question) => !question.protectedFinal)).toBe(true);
    expect(board.questions.filter((question) => question.contentType === "current-event").length).toBeLessThanOrEqual(1);

    expect(board.finalQuestion.sport).toBe(sport);
    expect(board.finalQuestion.grade).toBe(5);
    expect(board.finalQuestion.protectedFinal).toBe(true);
    expect(board.questions.some((question) => question.id === board.finalQuestion.id)).toBe(false);
  });

  it.each(SPORTS)("changes the %s lineup when Casual requests a new game", (sport) => {
    const first = buildAverageFanCasualBoard(
      sport,
      `test-${sport}-first`,
      "2026-09-29T12:00:00.000Z",
    );
    const second = buildAverageFanCasualBoard(
      sport,
      `test-${sport}-second`,
      "2026-09-29T12:00:00.000Z",
    );

    expect(second.questions.map((question) => question.id))
      .not.toEqual(first.questions.map((question) => question.id));
  });

  it.each(SPORTS)("keeps subject usage balanced on the %s board", (sport) => {
    const board = buildAverageFanCasualBoard(
      sport,
      `test-${sport}-balance`,
      "2026-09-29T12:00:00.000Z",
    );
    const counts = board.questions.reduce<Record<string, number>>((result, question) => {
      result[question.subject] = (result[question.subject] ?? 0) + 1;
      return result;
    }, {});
    const values = Object.values(counts);

    expect(values.length).toBe(4);
    expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1);
  });
});
