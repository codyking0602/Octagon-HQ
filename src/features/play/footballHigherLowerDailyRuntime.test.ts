import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildFootballHigherLowerDailyPublication,
  advanceFootballHigherLowerDailyRuntime,
} from "./footballHigherLowerDailyRuntime";
import { parseFootballHigherLowerBoard } from "../back-room/footballHigherLowerModel";
import type { OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";
import { buildFootballDailyPersistenceSetup } from "./footballDailyPublicationAll";
import { footballTodayGameForDay } from "./footballTodayChallengeSession";
import { FOOTBALL_LOCKED_WEIGHTED_CYCLE } from "./dailyChallengeRotation";
import { NBA_OFFICIAL_GAMES_RELEASE_READY } from "../nba/nbaDailySchedule";

const day = "2026-11-11";
const schedule = "football-higher-lower-draft-test";

function context(): OfficialDailyRuntimeContext {
  const p = buildFootballHigherLowerDailyPublication(day, schedule);
  return {
    gameType: "higher_lower",
    setupKey: p.setupKey,
    publicSetup: p.publicSetup,
    revealSetup: p.revealSetup,
    privateSetupEvidence: p.privateSetupEvidence,
    privateGradingEvidence: p.privateGradingEvidence,
    submissionState: {},
    publicState: p.publicSetup.initial_state as Record<string, unknown>,
  };
}

describe("Football Higher or Lower official Daily (staged)", () => {
  it("publishes a repeatable, balanced 10-question board without revealing the hidden answer", () => {
    const p = buildFootballHigherLowerDailyPublication(day, schedule);
    const board = parseFootballHigherLowerBoard(p.privateSetupEvidence.board);
    expect(board).not.toBeNull();
    expect(board!.questions).toHaveLength(10);
    expect(board!.questions.filter(q => q.league === "NFL")).toHaveLength(5);
    expect(board!.questions.filter(q => q.league === "CFB")).toHaveLength(5);
    expect(p.scoringVersion).toBe("play-official-score-v1");
    expect(p.privateGradingEvidence).toEqual({
      question_ids: board!.questions.map(q => q.id),
      correct_choices: board!.questions.map(q => q.answer),
    });
    const first = (p.publicSetup.initial_state as Record<string, unknown>).current_question as Record<string, unknown>;
    expect(first).not.toHaveProperty("answer");
    expect(first.hidden).not.toHaveProperty("value");
    expect(first.hidden).not.toHaveProperty("formattedValue");
    expect(buildFootballHigherLowerDailyPublication(day, schedule)).toEqual(p);
    expect(buildFootballDailyPersistenceSetup(day, schedule, "higher_lower").gameType).toBe("higher_lower");
  });

  it("rejects invalid actions, preserves saved state, and independently scores ten answers", () => {
    let run = context();
    expect(() => advanceFootballHigherLowerDailyRuntime(run, { choice: "tie" })).toThrow();
    const board = parseFootballHigherLowerBoard(run.privateSetupEvidence.board)!;
    for (const [index, question] of board.questions.entries()) {
      const choice = index === 0 ? (question.answer === "higher" ? "lower" : "higher") : question.answer;
      const next = advanceFootballHigherLowerDailyRuntime(run, { choice });
      expect(next.publicState.index).toBe(index + 1);
      expect(next.publicState.correct_count).toBe(index);
      if (index < 9) {
        const current = next.publicState.current_question as Record<string, unknown>;
        expect(current).not.toHaveProperty("answer");
        expect(current.hidden).not.toHaveProperty("value");
        expect(next.complete).toBe(false);
      }
      run = { ...run, submissionState: next.submissionState, publicState: next.publicState };
      if (index === 9) {
        expect(next.complete).toBe(true);
        expect(next.finalSubmission).toMatchObject({ native_score: 9, normalized_score: 90 });
        expect((next.finalSubmission as Record<string, unknown>).answers).toHaveLength(10);
        expect(() => advanceFootballHigherLowerDailyRuntime(run, { choice: "higher" })).toThrow();
      }
    }
  });

  it("uses the existing protected SQL ten-answer grader and leaderboard reveal", () => {
    const sql = readFileSync("supabase/migrations/202612310322_nba_official_daily_schedule_and_authority.sql", "utf8");
    expect(sql).toContain("if p_game_type = 'higher_lower' and p_scoring_version = 'play-official-score-v1'");
    expect(sql).toContain("private.grade_nba_higher_lower_daily(p_submission,p_grading_evidence)");
    expect(sql).toContain("'reveal_questions', coalesce(setup.reveal_setup->'questions'");
    expect(sql).toContain("v_answer->>'question_id' is distinct from v_ids->>v_index");
  });

  it("cannot activate an old Football rotation or public NBA release by adding a publisher", () => {
    expect(FOOTBALL_LOCKED_WEIGHTED_CYCLE).not.toContain("higher_lower");
    expect(footballTodayGameForDay(day)).not.toBe("higher_lower");
    expect(NBA_OFFICIAL_GAMES_RELEASE_READY).toBe(false);
  });
});
