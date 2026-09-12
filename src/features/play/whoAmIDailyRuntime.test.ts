import { describe, expect, it } from "vitest";
import {
  WHO_AM_I_CLUE_LIMIT,
  whoAmIRecoveryScore,
  whoAmIScore,
} from "../games/whoAmIEngine";
import {
  advanceFootballOfficialDailyRuntime,
  buildFootballOfficialDailySetup,
} from "./footballTodayChallengeRuntime";
import {
  advanceOfficialDailyRuntime,
  buildOfficialDailySetup,
  initialOfficialDailyPublicState,
  type OfficialDailyRuntimeContext,
  type OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

type JsonRecord = Record<string, unknown>;

function contextFor(
  gameType: "who_am_i",
  setup: OfficialDailySetupPublication,
): OfficialDailyRuntimeContext {
  return {
    gameType,
    setupKey: setup.setupKey,
    publicSetup: setup.publicSetup,
    revealSetup: setup.revealSetup,
    privateSetupEvidence: setup.privateSetupEvidence,
    privateGradingEvidence: setup.privateGradingEvidence,
    submissionState: {},
    publicState: initialOfficialDailyPublicState(setup.publicSetup),
  };
}

function record(value: unknown) {
  return value as JsonRecord;
}

function rows(value: unknown) {
  return value as JsonRecord[];
}

describe("official Who Am I Daily runtime", () => {
  it("builds deterministic UFC and Football boards without casual recent-subject exclusions", () => {
    const ufc = buildOfficialDailySetup("who_am_i", "2026-10-01", "test-who-am-i-v1");
    const ufcAgain = buildOfficialDailySetup("who_am_i", "2026-10-01", "test-who-am-i-v1");
    expect(ufcAgain).toEqual(ufc);
    expect(ufc.contentVersion).toBe("who-am-i-daily-v1");
    expect(ufc.publicSetup.league).toBe("UFC");

    const football = buildFootballOfficialDailySetup("who_am_i", "2026-10-01", "test-football-who-am-i-v1");
    const footballAgain = buildFootballOfficialDailySetup("who_am_i", "2026-10-01", "test-football-who-am-i-v1");
    expect(footballAgain).toEqual(football);
    expect(football.contentVersion).toBe("who-am-i-daily-v1");
    expect(["NFL", "CFB"]).toContain(football.publicSetup.league);

    const publicJson = JSON.stringify({
      publicSetup: ufc.publicSetup,
      publicState: ufc.publicSetup.initial_state,
    });
    expect(publicJson).not.toContain("hidden_subject_id");
    expect(publicJson).not.toContain('"identity"');
    expect(rows(record(ufc.publicSetup.initial_state).clues)).toHaveLength(2);
    expect(rows(ufc.privateSetupEvidence.clues)).toHaveLength(WHO_AM_I_CLUE_LIMIT);
  });

  it("matches casual natural scoring, including the ten-point wrong-guess penalty", () => {
    const setup = buildOfficialDailySetup("who_am_i", "2026-10-02", "test-who-am-i-v1");
    let context = contextFor("who_am_i", setup);
    const hiddenId = String(setup.privateGradingEvidence.hidden_subject_id);
    const wrongId = (setup.privateGradingEvidence.subject_ids as string[]).find((id) => id !== hiddenId)!;

    context = {
      ...context,
      ...(() => {
        const next = advanceOfficialDailyRuntime(context, { type: "reveal" });
        return { submissionState: next.submissionState, publicState: next.publicState };
      })(),
    };
    context = {
      ...context,
      ...(() => {
        const next = advanceOfficialDailyRuntime(context, { type: "reveal" });
        return { submissionState: next.submissionState, publicState: next.publicState };
      })(),
    };
    expect(context.publicState.revealed_count).toBe(6);

    const missed = advanceOfficialDailyRuntime(context, { type: "guess", subject_id: wrongId });
    expect(missed.complete).toBe(false);
    expect(missed.publicState.score).toBeNull();
    expect(missed.publicState.wrong_guesses).toBe(1);

    context = {
      ...context,
      submissionState: missed.submissionState,
      publicState: missed.publicState,
    };
    const solved = advanceOfficialDailyRuntime(context, { type: "guess", subject_id: hiddenId });
    expect(solved.complete).toBe(true);
    expect(solved.publicState.score).toBe(whoAmIScore(6, 1));
    expect(solved.publicState.score).toBe(80);
    expect(record(solved.finalSubmission).outcome).toBe("natural");
  });

  it("uses the same deterministic five-name Recovery Board and 45/30/0 scoring", () => {
    const setup = buildOfficialDailySetup("who_am_i", "2026-10-03", "test-who-am-i-v1");
    let context = contextFor("who_am_i", setup);
    const hiddenId = String(setup.privateGradingEvidence.hidden_subject_id);

    while (Number(context.publicState.revealed_count) < WHO_AM_I_CLUE_LIMIT) {
      const next = advanceOfficialDailyRuntime(context, { type: "reveal" });
      context = { ...context, submissionState: next.submissionState, publicState: next.publicState };
    }

    const recovery = advanceOfficialDailyRuntime(context, { type: "enter_recovery" });
    expect(recovery.complete).toBe(false);
    expect(recovery.publicState.phase).toBe("recovery");
    const choices = rows(recovery.publicState.recovery_choices);
    expect(choices).toHaveLength(5);
    expect(choices.map((choice) => choice.id)).toContain(hiddenId);

    context = { ...context, submissionState: recovery.submissionState, publicState: recovery.publicState };
    const wrongChoice = choices.find((choice) => choice.id !== hiddenId)!;
    const firstMiss = advanceOfficialDailyRuntime(context, { type: "recovery_guess", subject_id: wrongChoice.id });
    expect(firstMiss.complete).toBe(false);
    expect(firstMiss.publicState.recovery_wrong_guesses).toBe(1);
    expect(whoAmIRecoveryScore(1)).toBe(30);

    context = { ...context, submissionState: firstMiss.submissionState, publicState: firstMiss.publicState };
    const rescued = advanceOfficialDailyRuntime(context, { type: "recovery_guess", subject_id: hiddenId });
    expect(rescued.complete).toBe(true);
    expect(rescued.publicState.score).toBe(30);
    expect(record(rescued.finalSubmission).outcome).toBe("recovered");

    const fresh = contextFor("who_am_i", setup);
    let missContext = fresh;
    while (Number(missContext.publicState.revealed_count) < WHO_AM_I_CLUE_LIMIT) {
      const next = advanceOfficialDailyRuntime(missContext, { type: "reveal" });
      missContext = { ...missContext, submissionState: next.submissionState, publicState: next.publicState };
    }
    const opened = advanceOfficialDailyRuntime(missContext, { type: "enter_recovery" });
    missContext = { ...missContext, submissionState: opened.submissionState, publicState: opened.publicState };
    const missChoices = rows(opened.publicState.recovery_choices).filter((choice) => choice.id !== hiddenId);
    for (const choice of missChoices.slice(0, 2)) {
      const next = advanceOfficialDailyRuntime(missContext, { type: "recovery_guess", subject_id: choice.id });
      missContext = { ...missContext, submissionState: next.submissionState, publicState: next.publicState };
    }
    expect(missContext.publicState.complete).toBe(true);
    expect(missContext.publicState.score).toBe(0);
  });

  it("uses the shared Who Am I Daily state machine in the Football runtime", () => {
    const setup = buildFootballOfficialDailySetup("who_am_i", "2026-10-04", "test-football-who-am-i-v1");
    let context = contextFor("who_am_i", setup);
    const hiddenId = String(setup.privateGradingEvidence.hidden_subject_id);
    const solved = advanceFootballOfficialDailyRuntime(context, { type: "guess", subject_id: hiddenId });
    expect(solved.complete).toBe(true);
    expect(solved.publicState.score).toBe(100);
    expect(record(solved.finalSubmission).outcome).toBe("natural");
  });
});
