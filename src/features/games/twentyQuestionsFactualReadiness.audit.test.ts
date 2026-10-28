import { describe, expect, it } from "vitest";
import {
  FOOTBALL_TWENTY_QUESTIONS_COACH_COUNT,
  FOOTBALL_TWENTY_QUESTIONS_PLAYER_COUNT,
  footballTwentyQuestionsReadiness,
  getFootballTwentyQuestionsUniverse,
} from "./twentyQuestionsFootballAuthority";

describe("Football 20 Questions factual readiness audit", () => {
  for (const league of ["NFL", "CFB"] as const) {
    it(`${league} uses the canonical 100-player + 20-coach launch universe`, () => {
      const universe = getFootballTwentyQuestionsUniverse(league);
      const readiness = footballTwentyQuestionsReadiness(league);

      expect(universe.subjects).toHaveLength(
        FOOTBALL_TWENTY_QUESTIONS_PLAYER_COUNT + FOOTBALL_TWENTY_QUESTIONS_COACH_COUNT,
      );
      expect(readiness).toMatchObject({
        subjectCount: 120,
        playerCount: 100,
        coachCount: 20,
        unknownLiveAnswers: 0,
      });
      expect(readiness.questionCount).toBeGreaterThan(0);
    });

    it(`${league} exposes only deterministic Yes/No predicates for every live subject`, () => {
      const universe = getFootballTwentyQuestionsUniverse(league);
      for (const question of universe.questions) {
        for (const subject of universe.subjects) {
          expect(typeof question.answer(subject.id)).toBe("boolean");
        }
      }
    });

    it(`${league} keeps question pricing static on the full universe`, () => {
      const universe = getFootballTwentyQuestionsUniverse(league);
      expect(new Set(universe.questions.map((question) => question.internalCost)).size).toBeGreaterThan(1);
      for (const question of universe.questions) {
        expect([5, 6, 7, 8]).toContain(question.internalCost);
        const before = question.internalCost;
        universe.subjects.slice(0, 10).forEach((subject) => question.answer(subject.id));
        expect(question.internalCost).toBe(before);
      }
    });
  }
});
