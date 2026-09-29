import { describe, expect, it } from "vitest";
import {
  AVERAGE_FAN_SUBJECTS,
  validateAverageFanQuestion,
  type AverageFanSport,
} from "./averageFanEngine";
import { averageFanPreviewRun } from "./averageFanPreviewContent";

describe("Average Fan owner preview content", () => {
  for (const sport of ["nfl", "cfb", "ufc"] as const satisfies readonly AverageFanSport[]) {
    it(`builds a valid 10-tile ${sport.toUpperCase()} board plus one protected Final`, () => {
      const run = averageFanPreviewRun(sport);
      expect(run.board).toHaveLength(10);
      expect(run.final.protectedFinal).toBe(true);
      expect(run.final.grade).toBe(5);
      expect(run.board.every((question) => question.protectedFinal === false)).toBe(true);
      expect([...run.board, run.final].flatMap(validateAverageFanQuestion)).toEqual([]);

      for (const grade of [1, 2, 3, 4, 5]) {
        expect(run.board.filter((question) => question.grade === grade)).toHaveLength(2);
      }

      expect([...run.board, run.final].every((question) =>
        (AVERAGE_FAN_SUBJECTS[sport] as readonly string[]).includes(question.subject)
      )).toBe(true);
    });
  }

  it("keeps the 30 board questions at the locked 60/25/15-ish mixed-format target", () => {
    const board = (["nfl", "cfb", "ufc"] as const).flatMap((sport) =>
      averageFanPreviewRun(sport).board
    );
    const counts = board.reduce<Record<string, number>>((totals, question) => {
      totals[question.format] = (totals[question.format] ?? 0) + 1;
      return totals;
    }, {});

    expect(counts).toEqual({
      "short-answer": 18,
      "three-choice": 8,
      "true-false": 4,
    });
  });

  it("uses preview-only identifiers so PR2 content cannot be mistaken for the durable bank", () => {
    for (const sport of ["nfl", "cfb", "ufc"] as const) {
      const run = averageFanPreviewRun(sport);
      expect([...run.board, run.final].every((question) =>
        question.id.startsWith("average-fan-preview-")
      )).toBe(true);
    }
  });
});
