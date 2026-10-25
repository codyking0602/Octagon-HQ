import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildOfficialDailySetup, advanceOfficialDailyRuntime, type OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";
import {
  buildUfcHigherLowerDailyPublication, advanceUfcHigherLowerDailyRuntime,
} from "./ufcHigherLowerDailyRuntime";
import { todayChallengeAdapter } from "./todaysChallengeAdapters";
import { parseUfcHigherLowerBoard } from "./ufcHigherLowerModel";
import { playGameDefinition } from "./playRegistry";

const day = "2026-11-02";
const schedule = "ufc-higher-lower-staged-test";
function context(): OfficialDailyRuntimeContext {
  const p = buildUfcHigherLowerDailyPublication(day,schedule);
  return {
    gameType: "higher_lower", setupKey: p.setupKey,
    publicSetup: p.publicSetup, revealSetup: p.revealSetup,
    privateSetupEvidence: p.privateSetupEvidence,
    privateGradingEvidence: p.privateGradingEvidence,
    submissionState: {}, publicState: p.publicSetup.initial_state as Record<string,unknown>,
  };
}
describe("UFC Higher or Lower staged official Daily", () => {
  it("reuses the canonical UFC runtime without a calendar switch", () => {
    const a = buildOfficialDailySetup("higher_lower", day, schedule);
    const b = buildUfcHigherLowerDailyPublication(day, schedule);
    expect(a).toEqual(b);
    expect(b).toEqual(buildUfcHigherLowerDailyPublication(day,schedule));
    expect(todayChallengeAdapter("higher_lower","ufc")?.casualRoute).toBe("/play/higher-lower");
    expect(todayChallengeAdapter("higher_lower","football")?.casualRoute).toBe("/football/higher-lower");
    expect(todayChallengeAdapter("higher_lower","nba")?.casualRoute).toBe("/nba/higher-lower");
    expect(playGameDefinition("higher-lower","ufc").lineup.dailyEligible).toBe(false);
  },120000);
  it("publishes ten server-frozen questions without exposing secret ids, correct directions, or hidden values", () => {
    const p=buildUfcHigherLowerDailyPublication(day,schedule);
    const board=parseUfcHigherLowerBoard(p.privateSetupEvidence.board)!;
    expect(board.questions).toHaveLength(10);
    expect(p.privateGradingEvidence).toEqual({
      question_ids:board.questions.map(q=>q.id),
      correct_choices:board.questions.map(q=>q.answer),
    });
    const question=(p.publicSetup.initial_state as Record<string,unknown>).current_question as Record<string,unknown>;
    expect(question).not.toHaveProperty("answer");
    expect(question.id).toBe("ufc-daily-comparison-1");
    expect(question.id).not.toEqual(board.questions[0]!.id);
    expect(question.hidden).not.toHaveProperty("value");
    expect(question.hidden).not.toHaveProperty("formattedValue");
    expect(JSON.stringify(question)).not.toContain(board.questions[0]!.answer + '"');
  },120000);
  it("rejects forged actions, resumes from saved answers, and grades exactly 10 responses", () => {
    let ctx=context();
    expect(() => advanceUfcHigherLowerDailyRuntime(ctx,{choice:"tie"})).toThrow();
    const board=parseUfcHigherLowerBoard(ctx.privateSetupEvidence.board)!;
    for(const [i,q] of board.questions.entries()) {
      const choice=i===0 ? (q.answer==="higher"?"lower":"higher") : q.answer;
      const next=advanceOfficialDailyRuntime(ctx,{choice});
      expect(next.publicState.index).toBe(i+1);
      if(i<9) {
        const question=next.publicState.current_question as Record<string,unknown>;
        expect(question.id).toBe("ufc-daily-comparison-"+(i+2));
        expect(question).not.toHaveProperty("answer");
        expect(question.hidden).not.toHaveProperty("value");
        expect(question.hidden).not.toHaveProperty("formattedValue");
        expect(next.complete).toBe(false);
      }
      ctx={...ctx,submissionState:next.submissionState,publicState:next.publicState};
      if(i===9) {
        expect(next.complete).toBe(true);
        expect(next.finalSubmission).toMatchObject({native_score:9,normalized_score:90});
        expect((next.finalSubmission as Record<string,unknown>).answers).toHaveLength(10);
        expect(() => advanceOfficialDailyRuntime(ctx,{choice:"higher"})).toThrow();
      }
    }
    const tampered={...ctx,publicState:{...ctx.publicState,complete:false,index:9,answers:[...(ctx.publicState.answers as unknown[]).slice(0,9),{question_id:"fake",choice:"lower"}]}};
    expect(() => advanceOfficialDailyRuntime(tampered,{choice:"higher"})).toThrow();
  },120000);
  it("uses the existing protected ten-answer SQL grader and leaderboard reveal gates", () => {
    const sql=readFileSync("supabase/migrations/202612310322_nba_official_daily_schedule_and_authority.sql","utf8");
    expect(sql).toContain("if p_game_type = 'higher_lower' and p_scoring_version = 'play-official-score-v1'");
    expect(sql).toContain("private.grade_nba_higher_lower_daily(p_submission,p_grading_evidence)");
    expect(sql).toContain("'reveal_questions', coalesce(setup.reveal_setup->'questions'");
    expect(sql).toContain("v_answer->>'question_id' is distinct from v_ids->>v_index");
  });
});
