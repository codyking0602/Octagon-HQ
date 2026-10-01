import { describe, expect, it } from "vitest";
import { validateAverageFanQuestion } from "../games/averageFanEngine";
import {
  MLB_AVERAGE_FAN_FIRST_CHALLENGE_KEY,
  MLB_AVERAGE_FAN_FIRST_DATE,
  MLB_AVERAGE_FAN_PRODUCTION_RUNS,
  MLB_AVERAGE_FAN_SECOND_CHALLENGE_KEY,
  MLB_AVERAGE_FAN_SECOND_DATE,
  mlbAverageFanProductionConfig,
} from "./mlbAverageFanProduction";

describe("MLB Average Fan production runs", () => {
  it("locks the two approved postseason dates", () => {
    expect(MLB_AVERAGE_FAN_FIRST_CHALLENGE_KEY).toBe("mlb-2026-play-12");
    expect(MLB_AVERAGE_FAN_FIRST_DATE).toBe("2026-10-07");
    expect(MLB_AVERAGE_FAN_SECOND_CHALLENGE_KEY).toBe("mlb-2026-play-15");
    expect(MLB_AVERAGE_FAN_SECOND_DATE).toBe("2026-10-23");
    expect(MLB_AVERAGE_FAN_PRODUCTION_RUNS).toHaveLength(2);
  });

  it("uses ten unique board questions, two per grade, plus one protected Final", () => {
    for (const run of MLB_AVERAGE_FAN_PRODUCTION_RUNS) {
      expect(run.questions).toHaveLength(10);
      expect(new Set(run.questions.map((question) => question.id)).size).toBe(10);
      expect(run.questions.every((question) => question.sport === "mlb" && !question.protectedFinal)).toBe(true);
      expect(run.finalQuestion.sport).toBe("mlb");
      expect(run.finalQuestion.grade).toBe(5);
      expect(run.finalQuestion.protectedFinal).toBe(true);

      for (const grade of [1, 2, 3, 4, 5] as const) {
        expect(run.questions.filter((question) => question.grade === grade)).toHaveLength(2);
      }

      expect(run.questions.every((question) => validateAverageFanQuestion(question).length === 0)).toBe(true);
      expect(validateAverageFanQuestion(run.finalQuestion)).toEqual([]);
    }
  });

  it("keeps each MLB board on the approved six short / three choice / one true-false mix", () => {
    for (const run of MLB_AVERAGE_FAN_PRODUCTION_RUNS) {
      const counts = run.questions.reduce<Record<string, number>>((acc, question) => {
        acc[question.format] = (acc[question.format] ?? 0) + 1;
        return acc;
      }, {});
      expect(counts).toEqual({
        "four-choice": 3,
        "short-answer": 6,
        "true-false": 1,
      });
    }
  });

  it("does not repeat any board or Final question between the two dates", () => {
    const first = MLB_AVERAGE_FAN_PRODUCTION_RUNS[0]!;
    const second = MLB_AVERAGE_FAN_PRODUCTION_RUNS[1]!;
    const firstIds = new Set([...first.questions.map((question) => question.id), first.finalQuestion.id]);
    expect([...second.questions, second.finalQuestion].every((question) => !firstIds.has(question.id))).toBe(true);
  });

  it("resolves content only for the exact challenge and date", () => {
    expect(mlbAverageFanProductionConfig("mlb-2026-play-12", "2026-10-07"))
      .toBe(MLB_AVERAGE_FAN_PRODUCTION_RUNS[0]);
    expect(mlbAverageFanProductionConfig("mlb-2026-play-15", "2026-10-23"))
      .toBe(MLB_AVERAGE_FAN_PRODUCTION_RUNS[1]);
    expect(mlbAverageFanProductionConfig("mlb-2026-play-12", "2026-10-08")).toBeNull();
    expect(mlbAverageFanProductionConfig("mlb-2026-play-15", "2026-10-22")).toBeNull();
  });
});
