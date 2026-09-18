import { describe, expect, it } from "vitest";
import type { MillionaireRuntimeQuestion } from "../games/millionaireAuthority";
import {
  advanceMillionaireDailyRuntime,
  buildMillionaireDailySetup,
  millionaireDailyLeague,
  millionaireFootballDailyLeague,
} from "./millionaireDailyRuntime";
import type { OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";

function contextFor(sport: "ufc" | "football", day = "2026-09-19"): OfficialDailyRuntimeContext {
  const publication = buildMillionaireDailySetup(
    sport,
    day,
    sport === "ufc" ? "play-rotation-v8-millionaire" : "football-daily-v10-millionaire",
  );
  return {
    gameType: "millionaire",
    setupKey: publication.setupKey,
    publicSetup: publication.publicSetup,
    revealSetup: publication.revealSetup,
    privateSetupEvidence: publication.privateSetupEvidence,
    privateGradingEvidence: publication.privateGradingEvidence,
    submissionState: {},
    publicState: publication.publicSetup.initial_state as Record<string, unknown>,
  };
}

function privateRun(context: OfficialDailyRuntimeContext) {
  return context.privateSetupEvidence.run as MillionaireRuntimeQuestion[];
}

function advance(context: OfficialDailyRuntimeContext, action: Record<string, unknown>) {
  const result = advanceMillionaireDailyRuntime(context, {
    ...action,
    time_remaining_ms: 120_000,
  });
  return {
    result,
    context: {
      ...context,
      submissionState: result.submissionState,
      publicState: result.publicState,
    } satisfies OfficialDailyRuntimeContext,
  };
}

describe("Millionaire official Daily runtime", () => {
  it("debuts CFB for Football and UFC for UFC on September 19", () => {
    expect(millionaireDailyLeague("football", "2026-09-19")).toBe("cfb");
    expect(millionaireDailyLeague("ufc", "2026-09-19")).toBe("ufc");
    expect(millionaireFootballDailyLeague("2026-09-26")).toBe("nfl");
  });

  it("publishes eight public questions without leaking the answer key", () => {
    const publication = buildMillionaireDailySetup(
      "football",
      "2026-09-19",
      "football-daily-v10-millionaire",
    );
    const questions = publication.publicSetup.questions as Record<string, unknown>[];
    expect(questions).toHaveLength(8);
    expect(questions.map((question) => question.level)).toEqual([
      "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8",
    ]);
    expect(questions.every((question) => !("correctChoiceId" in question))).toBe(true);
    expect(publication.privateSetupEvidence.proof).toBeTruthy();
    expect(publication.privateGradingEvidence.proof).toBe(publication.privateSetupEvidence.proof);
  });

  it("banks 90 before Q8 and drops a Q8 miss back to the 80-point checkpoint", () => {
    let walkContext = contextFor("football");
    for (let index = 0; index < 7; index += 1) {
      const question = privateRun(walkContext)[index]!;
      walkContext = advance(walkContext, {
        type: "answer",
        choice_id: question.correctChoiceId,
      }).context;
    }
    expect(walkContext.publicState.completed_questions).toBe(7);
    expect(walkContext.publicState.base_score).toBe(90);
    const walked = advance(walkContext, { type: "walk_away" }).result;
    expect(walked.complete).toBe(true);
    expect(walked.finalSubmission).toMatchObject({
      outcome: "walked-away",
      completed_questions: 7,
      final_money: 500_000,
      base_score: 90,
    });

    let riskContext = contextFor("football");
    for (let index = 0; index < 7; index += 1) {
      const question = privateRun(riskContext)[index]!;
      riskContext = advance(riskContext, {
        type: "answer",
        choice_id: question.correctChoiceId,
      }).context;
    }
    const q8 = privateRun(riskContext)[7]!;
    const miss = q8.choices.find((choice) => choice.id !== q8.correctChoiceId)!;
    const lost = advance(riskContext, { type: "answer", choice_id: miss.id }).result;
    expect(lost.complete).toBe(true);
    expect(lost.finalSubmission).toMatchObject({
      outcome: "lost",
      completed_questions: 7,
      final_money: 100_000,
      base_score: 80,
    });
  });

  it("keeps Stat Sheet private until the lifeline is used", () => {
    const context = contextFor("ufc");
    expect(JSON.stringify(context.publicSetup)).not.toContain("statSheet");
    const revealed = advance(context, {
      type: "use_lifeline",
      lifeline: "stat-sheet",
    }).result;
    expect((revealed.publicState.last_lifeline_reveal as Record<string, unknown>).type).toBe("stat-sheet");
    expect((revealed.publicState.last_lifeline_reveal as Record<string, unknown>).text).toBeTruthy();
  });
});
