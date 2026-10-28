import { describe, expect, it } from "vitest";
import { nbaAverageFanQuestionBank } from "../games/nbaAverageFanBank";
import { averageFanQuestionBoardTopics } from "../games/averageFanContentBanks";
import {
  allocateNbaAverageFanRound,
  emptyNbaAverageFanRotation,
  NBA_AVERAGE_FAN_BUCKETS,
} from "./nbaAverageFanRotation";

const inventory = Object.fromEntries(NBA_AVERAGE_FAN_BUCKETS.map((bucket) => [
  bucket, nbaAverageFanQuestionBank.filter((q) => bucket === "final" ? q.protectedFinal : !q.protectedFinal && String(q.grade) === bucket).length,
]));

describe("NBA Average Fan quality-first four-month rotation", () => {
  it("has precisely 20 games of vetted inventory in each difficulty bucket", () => {
    expect(inventory).toEqual({ "2": 40, "3": 40, "4": 40, "5": 40, final: 20 });
    expect(nbaAverageFanQuestionBank).toHaveLength(180);
  });

  it.each(["oct22-first", "later-start", "owner-repeat", "rotation-edge"])(
    "allocates 20 complete games without any repeated question IDs: %s",
    (session) => {
      let history = emptyNbaAverageFanRotation();
      const seen = new Set<string>();
      const seenByBucket = new Map(NBA_AVERAGE_FAN_BUCKETS.map((bucket) => [bucket, new Set<string>()]));
      for (let index = 0; index < 20; index++) {
        const allocated = allocateNbaAverageFanRound(history, `${session}-run-${index}`);
        history = allocated.history;
        const { questions, finalQuestion } = allocated.board;
        expect(questions).toHaveLength(8);
        expect(finalQuestion.protectedFinal).toBe(true);
        for (const grade of [2, 3, 4, 5]) {
          expect(questions.filter((question) => question.grade === grade)).toHaveLength(2);
        }
        for (const question of [...questions, finalQuestion]) {
          expect(seen.has(question.id), `Repeated in run ${index + 1}: ${question.id}`).toBe(false);
          seen.add(question.id);
          const bucket = question.protectedFinal ? "final" : String(question.grade);
          seenByBucket.get(bucket as "2" | "3" | "4" | "5" | "final")!.add(question.id);
        }
        // A Final must not point to a named player, team or historic matchup that
        // was already the subject of one of the eight regular board questions.
        const boardTopics = new Set(questions.flatMap(averageFanQuestionBoardTopics));
        const finalTopics = averageFanQuestionBoardTopics(finalQuestion);
        expect(finalTopics.filter((topic) => boardTopics.has(topic))).toEqual([]);
      }
      expect(seen.size).toBe(180);
      for (const bucket of NBA_AVERAGE_FAN_BUCKETS) {
        expect(seenByBucket.get(bucket)?.size).toBe(inventory[bucket]);
        expect(history.used[bucket]).toHaveLength(inventory[bucket]);
      }
      // Exactly at exhaustion, the next run may recycle prior questions.
      const recycled = allocateNbaAverageFanRound(history, `${session}-run-21`);
      expect(recycled.board.questions).toHaveLength(8);
      expect(recycled.history.used["2"]).toHaveLength(2);
      expect(recycled.history.used.final).toHaveLength(1);
    },
  );

  it("reuses the exact Daily-style owner preview board for the same Central date", () => {
    const first = allocateNbaAverageFanRound(emptyNbaAverageFanRotation(), "nba-daily-1", { day: "2026-10-22" });
    const again = allocateNbaAverageFanRound(first.history, "nba-daily-different-seed", { day: "2026-10-22" });
    expect(again.reusedDaily).toBe(true);
    expect(again.board.questions.map((q) => q.id)).toEqual(first.board.questions.map((q) => q.id));
    expect(again.board.finalQuestion.id).toBe(first.board.finalQuestion.id);
    expect(again.history.used).toEqual(first.history.used);
    const tomorrow = allocateNbaAverageFanRound(again.history, "nba-daily-2", { day: "2026-10-23" });
    expect(tomorrow.reusedDaily).toBe(false);
    expect(tomorrow.board.questions.map((q) => q.id).some((id) =>
      first.board.questions.some((q) => q.id === id))).toBe(false);
    expect(tomorrow.board.finalQuestion.id).not.toBe(first.board.finalQuestion.id);
  });

  it("stores only question identifiers and dates, not player answers or scores", () => {
    const first = allocateNbaAverageFanRound(emptyNbaAverageFanRotation(), "private-owner-run", { day: "2026-10-22" });
    const snapshot = JSON.stringify(first.history);
    expect(snapshot).not.toContain("score");
    expect(snapshot).not.toContain("answer");
    expect(snapshot).not.toContain("player");
    expect(snapshot).toContain("average-fan:nba:");
    expect(snapshot).toContain("2026-10-22");
  });
});
