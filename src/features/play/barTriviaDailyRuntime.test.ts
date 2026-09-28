import { describe, expect, it } from "vitest";
import {
  BAR_TRIVIA_DAILY_CONTENT_VERSION,
  BAR_TRIVIA_DAILY_SCORING_VERSION,
  advanceBarTriviaDailyRuntime,
  buildBarTriviaDailySetup,
} from "./barTriviaDailyRuntime";
import type { OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";

function contextFromSetup(
  setup: ReturnType<typeof buildBarTriviaDailySetup>,
): OfficialDailyRuntimeContext {
  return {
    gameType: "bar_trivia",
    setupKey: setup.setupKey,
    publicSetup: setup.publicSetup,
    revealSetup: setup.revealSetup,
    privateSetupEvidence: setup.privateSetupEvidence,
    privateGradingEvidence: setup.privateGradingEvidence,
    submissionState: {},
    publicState: setup.publicSetup.initial_state as Record<string, unknown>,
  };
}

describe("Bar Trivia official Daily runtime", () => {
  it("builds the same server-owned run for the same immutable Daily identity", () => {
    const first = buildBarTriviaDailySetup("ufc", "2026-09-29", "play-rotation-v17-bar-trivia-sep29");
    const second = buildBarTriviaDailySetup("ufc", "2026-09-29", "play-rotation-v17-bar-trivia-sep29");

    expect(second).toEqual(first);
    expect(first.contentVersion).toBe(BAR_TRIVIA_DAILY_CONTENT_VERSION);
    expect(first.scoringVersion).toBe(BAR_TRIVIA_DAILY_SCORING_VERSION);
    expect(first.publicSetup.league).toBe("ufc");
    expect(first.publicSetup.question_count).toBe(10);
  });

  it("does not expose answers or explanations before each question is answered", () => {
    const setup = buildBarTriviaDailySetup("nfl", "2026-09-29", "football-daily-v17-bar-trivia-sep29");
    const initial = setup.publicSetup.initial_state as Record<string, unknown>;
    const current = initial.current_question as Record<string, unknown>;
    const privateQuestions = setup.privateSetupEvidence.questions as Array<Record<string, unknown>>;

    expect(current.answer).toBeUndefined();
    expect(current.explanation).toBeUndefined();
    expect(privateQuestions).toHaveLength(10);
    expect(privateQuestions[0]?.answer).toBeTruthy();
    expect(privateQuestions[0]?.explanation).toBeTruthy();
  });

  it("uses the canonical Bar Trivia engine for answer reveal and scoring progress", () => {
    const setup = buildBarTriviaDailySetup("ufc", "2026-09-29", "play-rotation-v17-bar-trivia-sep29");
    const context = contextFromSetup(setup);
    const firstQuestion = (setup.privateSetupEvidence.questions as Array<Record<string, unknown>>)[0]!;
    const answer = String(firstQuestion.answer);
    const advanced = advanceBarTriviaDailyRuntime(context, { choice: answer });
    const lastQuestion = advanced.publicState.last_question as Record<string, unknown>;
    const lastResult = advanced.publicState.last_result as Record<string, unknown>;

    expect(advanced.complete).toBe(false);
    expect(advanced.publicState.index).toBe(1);
    expect(lastQuestion.answer).toBe(answer);
    expect(lastQuestion.explanation).toBeTruthy();
    expect(lastResult.correct).toBe(true);
    expect(Number(advanced.publicState.score)).toBeGreaterThan(0);
  });
});
