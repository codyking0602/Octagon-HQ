import { describe, expect, it } from "vitest";
import { averageFanAnswersMatch, validateAverageFanQuestion, type AverageFanQuestion } from "../games/averageFanEngine";
import {
  MLB_AVERAGE_FAN_FIRST_CHALLENGE_KEY,
  MLB_AVERAGE_FAN_FIRST_DATE,
  MLB_AVERAGE_FAN_PRODUCTION_RUNS,
  MLB_AVERAGE_FAN_SECOND_CHALLENGE_KEY,
  MLB_AVERAGE_FAN_SECOND_DATE,
  mlbAverageFanProductionConfig,
} from "./mlbAverageFanProduction";

function normalizedHumanInput(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function oneCharacterTypo(question: AverageFanQuestion) {
  const base = normalizedHumanInput(question.answer).toLocaleLowerCase();
  if (base.length < 7 || /^\d+$/.test(base.replace(/\s+/g, ""))) return null;
  const blocked = new Set(
    [...question.aliases, ...(question.fanMisses ?? [])].map((value) => (
      normalizedHumanInput(value).toLocaleLowerCase()
    )),
  );
  for (let index = 1; index < base.length - 1; index += 1) {
    if (!/[a-z0-9]/.test(base[index]!)) continue;
    if (base[index - 1] === " " || base[index + 1] === " ") continue;
    const candidate = base.slice(0, index) + base.slice(index + 1);
    if (candidate.length >= 7 && !blocked.has(candidate)) return candidate;
  }
  return null;
}

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

  it("locks MLB to the same staggered-subject and easy-to-hard grade standards", () => {
    for (const run of MLB_AVERAGE_FAN_PRODUCTION_RUNS) {
      for (const grade of [1, 2, 3, 4, 5] as const) {
        const gradeQuestions = run.questions.filter((question) => question.grade === grade);
        expect(new Set(gradeQuestions.map((question) => question.subject)).size, `${run.challengeKey} grade ${grade}`).toBe(2);
        if (grade <= 2) {
          expect(
            gradeQuestions.filter((question) => question.format === "short-answer").length,
            `${run.challengeKey} grade ${grade}`,
          ).toBeLessThanOrEqual(1);
        }
      }

      expect(run.questions.filter((question) => question.grade === 1).every((question) => question.difficultyNudge <= -2)).toBe(true);
      expect(run.questions.filter((question) => question.grade === 2).every((question) => question.difficultyNudge <= -1)).toBe(true);
      expect(run.questions.filter((question) => question.grade === 4).every((question) => question.difficultyNudge >= 1)).toBe(true);
      expect(run.questions.filter((question) => question.grade === 5).every((question) => question.difficultyNudge >= 2)).toBe(true);
    }
  });

  it("runs every MLB short answer through the shared tolerant matcher", () => {
    let shortAnswerCount = 0;
    let typoCount = 0;

    for (const run of MLB_AVERAGE_FAN_PRODUCTION_RUNS) {
      for (const question of [...run.questions, run.finalQuestion]) {
        if (question.format !== "short-answer") continue;
        shortAnswerCount += 1;

        for (const accepted of [question.answer, ...question.aliases]) {
          expect(averageFanAnswersMatch(question, accepted), `${question.id}: exact ${accepted}`).toBe(true);
          expect(
            averageFanAnswersMatch(question, normalizedHumanInput(accepted)),
            `${question.id}: normalized ${accepted}`,
          ).toBe(true);
        }

        const typo = oneCharacterTypo(question);
        if (typo) {
          typoCount += 1;
          expect(averageFanAnswersMatch(question, typo), `${question.id}: typo ${typo}`).toBe(true);
        }

        for (const miss of question.fanMisses ?? []) {
          expect(averageFanAnswersMatch(question, miss), `${question.id}: authored miss ${miss}`).toBe(false);
        }
      }
    }

    expect(shortAnswerCount).toBe(14);
    expect(typoCount).toBeGreaterThanOrEqual(12);
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
