import { describe, expect, it } from "vitest";
import { averageFanQuestionBoardTopics } from "../games/averageFanContentBanks";
import { AVERAGE_FAN_PLAYABLE_GRADES } from "../games/averageFanEngine";
import { nbaAverageFanQuestionBank } from "../games/nbaAverageFanBank";
import {
  NBA_AVERAGE_FAN_ROTATION_GAMES,
  nextNbaAverageFanRotatingBoard,
  parseNbaAverageFanRotation,
  type NbaAverageFanRotation,
} from "./nbaAverageFanRotation";

const empty = (): NbaAverageFanRotation => ({ games: 0, questionIds: [] });

describe("NBA Average Fan question-only four-month rotation", () => {
  it("has enough independent curated inventory for twenty 9-question games", () => {
    for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
      expect(nbaAverageFanQuestionBank.filter((q) => q.grade === grade && !q.protectedFinal)).toHaveLength(40);
    }
    expect(nbaAverageFanQuestionBank.filter((q) => q.protectedFinal)).toHaveLength(20);
    expect(nbaAverageFanQuestionBank).toHaveLength(180);
  });

  it("never repeats a question in the first twenty NBA Casual games, across each grade and protected Finals", () => {
    for (const trial of ["first", "second", "third"]) {
      let history = empty();
      const seen = new Set<string>();
      for (let game = 0; game < NBA_AVERAGE_FAN_ROTATION_GAMES; game++) {
        const outcome = nextNbaAverageFanRotatingBoard(`four-month-${trial}-${game}`, history);
        const { board, next } = outcome;
        expect(board.questions).toHaveLength(8);
        const all = [...board.questions, board.finalQuestion];
        expect(all).toHaveLength(9);
        for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
          expect(board.questions.filter((q) => q.grade === grade)).toHaveLength(2);
        }
        expect(board.finalQuestion.protectedFinal).toBe(true);
        const topics = new Set(board.questions.flatMap(averageFanQuestionBoardTopics));
        expect(averageFanQuestionBoardTopics(board.finalQuestion).every((topic) => !topics.has(topic))).toBe(true);
        for (const question of all) {
          expect(seen.has(question.id), `repeat in ${trial} game ${game + 1}: ${question.id}`).toBe(false);
          seen.add(question.id);
        }
        expect(next.games).toBe(game + 1);
        expect(next.questionIds).toHaveLength((game + 1) * 9);
        history = next;
      }
      expect(seen.size).toBe(180);
      const cycleTwo = nextNbaAverageFanRotatingBoard(`new-cycle-${trial}`, history);
      expect(cycleTwo.next.games).toBe(1);
      expect(cycleTwo.next.questionIds).toHaveLength(9);
    }
  });

  it("recovers safely from invalid or stale localStorage data without persisting player results", () => {
    expect(parseNbaAverageFanRotation(null)).toEqual(empty());
    expect(parseNbaAverageFanRotation("not-json")).toEqual(empty());
    expect(parseNbaAverageFanRotation(JSON.stringify({ games: 2, questionIds: ["a"] }))).toEqual(empty());
    expect(parseNbaAverageFanRotation(JSON.stringify({ games: 1, questionIds: Array(9).fill("same") }))).toEqual(empty());
    const history = nextNbaAverageFanRotatingBoard("valid", empty()).next;
    expect(parseNbaAverageFanRotation(JSON.stringify(history))).toEqual(history);
    expect(JSON.stringify(history)).not.toMatch(/answer|score|result|profile/i);
  });
});
