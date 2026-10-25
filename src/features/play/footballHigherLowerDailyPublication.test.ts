import { describe, expect, it } from "vitest";
import { createFootballHigherLowerBoard } from "../back-room/footballHigherLowerModel";
import { advanceFootballHigherLowerDaily } from "./footballHigherLowerDailyAdvance";
import {
  buildFootballHigherLowerDailyPublication,
  footballHigherLowerComparisonKey,
  type FootballHigherLowerDailyHistoryRow,
} from "./footballHigherLowerDailyPublication";
import type { OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";

const addDays = (day: string, n: number) => new Date(Date.parse(day + "T00:00:00Z") + n * 86_400_000).toISOString().slice(0,10);

describe("Football Higher or Lower official Daily (future-only)", () => {
  it("has 14 repeat-free ten-question Daily boards over a 182-day 2× reference period", () => {
    const history: FootballHigherLowerDailyHistoryRow[] = [];
    const all = new Set<string>();
    const usedDates = new Set<string>();
    for (let n = 0; n < 14; n++) {
      // Every 26 days has two Daily positions: 14 appearances in 182 days.
      const day = addDays("2026-10-31", n * 13);
      usedDates.add(day);
      const publication = buildFootballHigherLowerDailyPublication(day, "football-daily-future-test", history);
      const board = publication.privateSetupEvidence.board as ReturnType<typeof createFootballHigherLowerBoard>;
      expect(board.questions).toHaveLength(10);
      expect(board.questions.filter(q => q.league === "NFL")).toHaveLength(5);
      expect(board.questions.filter(q => q.league === "CFB")).toHaveLength(5);
      expect(board.questions.map(q => q.answer)).toEqual(
        board.questions.map(q => q.hidden.value > q.known.value ? "higher" : "lower"),
      );
      for (const question of board.questions) {
        const key = footballHigherLowerComparisonKey(question.id);
        expect(all.has(key)).toBe(false);
        all.add(key);
      }
      const first = publication.publicSetup.initial_state as Record<string, unknown>;
      const firstQuestion = first.current_question as { hidden: Record<string, unknown>; answer?: unknown };
      expect(firstQuestion.answer).toBeUndefined();
      expect(firstQuestion.hidden.value).toBeUndefined();
      expect(firstQuestion.hidden.formattedValue).toBeUndefined();
      history.unshift({ day, question_ids: board.questions.map(q => q.id) });
    }
    expect(usedDates.size).toBe(14);
    expect(all.size).toBe(140);
  });

  it("persists ten independent choices, reveals the right answer only after each choice", () => {
    const publication = buildFootballHigherLowerDailyPublication("2026-10-31", "football-official-test");
    const state = publication.publicSetup.initial_state as Record<string, unknown>;
    const ctx: OfficialDailyRuntimeContext = {
      gameType: "higher_lower",
      setupKey: publication.setupKey,
      publicSetup: publication.publicSetup,
      revealSetup: publication.revealSetup,
      privateSetupEvidence: publication.privateSetupEvidence,
      privateGradingEvidence: publication.privateGradingEvidence,
      publicState: state, submissionState: {},
    };
    expect(() => advanceFootballHigherLowerDaily(ctx,{choice:"tie"})).toThrow();
    for (let i = 0; i < 10; i++) {
      const question = (publication.privateSetupEvidence.board as ReturnType<typeof createFootballHigherLowerBoard>).questions[i]!;
      const result = advanceFootballHigherLowerDaily(ctx,{choice:question.answer});
      expect(result.publicState.correct_count).toBe(i+1);
      expect(result.complete).toBe(i===9);
      if (i < 9) expect(JSON.stringify(result.publicState.current_question)).not.toContain('"answer"');
      ctx.publicState=result.publicState;ctx.submissionState=result.submissionState;
    }
    expect(ctx.publicState.score).toBe(100);
    expect((ctx.submissionState.final_submission as {answers:unknown[]}).answers).toHaveLength(10);
  });

  it("rejects invalid publication history rather than silently reusing comparisons", () => {
    expect(() => buildFootballHigherLowerDailyPublication("2026-10-31", "test", null)).toThrow();
    expect(() => buildFootballHigherLowerDailyPublication("2026-10-31", "test", [{day:"x",question_ids:[2]}])).toThrow();
  });
});
