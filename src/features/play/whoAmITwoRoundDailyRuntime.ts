import type { WhoAmIRound } from "../games/whoAmIEngine";
import {
  advanceWhoAmIDailyRuntime,
  buildWhoAmIDailyPublication,
} from "./whoAmIDailyRuntime";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyRuntimeContext,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const WHO_AM_I_TWO_ROUND_FORMAT_VERSION = "who-am-i-two-round-v1" as const;
export const WHO_AM_I_AUTHORED_DAILY_CONTENT_VERSION = "who-am-i-authored-daily-v1" as const;

type JsonRecord = Record<string, unknown>;

export interface WhoAmITwoRoundDailyRound {
  round: WhoAmIRound;
  scriptId: string;
}

function record(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as JsonRecord;
}

function records(value: unknown, label: string): JsonRecord[] {
  if (!Array.isArray(value) || value.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new Error(`${label} must be an object array.`);
  }
  return value as JsonRecord[];
}

function childPublication(
  entry: WhoAmITwoRoundDailyRound,
  index: number,
  day: string,
  scheduleVersion: string,
  runtimeVersion: string,
  scoringVersion: OfficialDailySetupPublication["scoringVersion"],
) {
  const base = buildWhoAmIDailyPublication(
    entry.round,
    day,
    scheduleVersion,
    runtimeVersion,
    scoringVersion,
  );
  return {
    setup_key: `${base.setupKey}:round-${index + 1}`,
    public_setup: base.publicSetup,
    reveal_setup: { ...base.revealSetup, script_id: entry.scriptId },
    private_setup_evidence: { ...base.privateSetupEvidence, script_id: entry.scriptId },
    private_grading_evidence: {
      ...base.privateGradingEvidence,
      league: entry.round.league,
      script_id: entry.scriptId,
    },
  };
}

export function buildTwoRoundWhoAmIDailyPublication(
  rounds: readonly [WhoAmITwoRoundDailyRound, WhoAmITwoRoundDailyRound],
  day: string,
  scheduleVersion: string,
  runtimeVersion: string,
  scoringVersion: OfficialDailySetupPublication["scoringVersion"],
): OfficialDailySetupPublication {
  if (rounds[0].round.sport !== rounds[1].round.sport) {
    throw new Error("Who Am I two-round Daily must stay within one sport.");
  }
  const children = rounds.map((entry, index) => childPublication(
    entry,
    index,
    day,
    scheduleVersion,
    runtimeVersion,
    scoringVersion,
  ));
  const firstState = record(children[0]!.public_setup.initial_state, "Who Am I first-round state");

  return {
    setupKey: `${WHO_AM_I_AUTHORED_DAILY_CONTENT_VERSION}:${runtimeVersion}:${scheduleVersion}:${day}:${rounds[0].round.sport}`,
    contentVersion: WHO_AM_I_AUTHORED_DAILY_CONTENT_VERSION,
    scoringVersion,
    publicSetup: {
      runtime_version: runtimeVersion,
      format_version: WHO_AM_I_TWO_ROUND_FORMAT_VERSION,
      sport: rounds[0].round.sport,
      round_count: 2,
      rounds: children.map((child) => child.public_setup),
      initial_state: {
        complete: false,
        format_version: WHO_AM_I_TWO_ROUND_FORMAT_VERSION,
        round_index: 0,
        round_count: 2,
        awaiting_next: false,
        completed_rounds: [],
        round_scores: [],
        active_round: firstState,
        active_reveal: null,
        score: null,
      },
    },
    revealSetup: {
      format_version: WHO_AM_I_TWO_ROUND_FORMAT_VERSION,
      rounds: children.map((child) => child.reveal_setup),
    },
    privateSetupEvidence: {
      format_version: WHO_AM_I_TWO_ROUND_FORMAT_VERSION,
      sport: rounds[0].round.sport,
      rounds: children,
    },
    privateGradingEvidence: {
      format_version: WHO_AM_I_TWO_ROUND_FORMAT_VERSION,
      rounds: children.map((child) => child.private_grading_evidence),
    },
  };
}

function twoRoundChildren(context: OfficialDailyRuntimeContext) {
  const rows = records(context.privateSetupEvidence.rounds, "Who Am I two-round evidence");
  if (rows.length !== 2) throw new Error("Who Am I authored Daily requires exactly two rounds.");
  return rows;
}

function childContext(
  context: OfficialDailyRuntimeContext,
  index: number,
  submissionState: JsonRecord,
  publicState: JsonRecord,
): OfficialDailyRuntimeContext {
  const child = twoRoundChildren(context)[index]!;
  return {
    gameType: "who_am_i",
    setupKey: String(child.setup_key ?? ""),
    publicSetup: record(child.public_setup, "Who Am I child public setup"),
    revealSetup: record(child.reveal_setup, "Who Am I child reveal setup"),
    privateSetupEvidence: record(child.private_setup_evidence, "Who Am I child setup evidence"),
    privateGradingEvidence: record(child.private_grading_evidence, "Who Am I child grading evidence"),
    submissionState,
    publicState,
  };
}

function childSummary(index: number, advanced: OfficialDailyAdvanceResult, child: JsonRecord) {
  const evidence = record(child.private_setup_evidence, "Who Am I child evidence");
  return {
    round_index: index,
    league: String(evidence.league ?? ""),
    score: Number(advanced.publicState.score ?? 0),
    outcome: String(advanced.publicState.outcome ?? ""),
    revealed_count: Number(advanced.publicState.revealed_count ?? 0),
    wrong_guesses: Number(advanced.publicState.wrong_guesses ?? 0),
    recovery_wrong_guesses: Number(advanced.publicState.recovery_wrong_guesses ?? 0),
  };
}

export function advanceTwoRoundWhoAmIDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: unknown,
): OfficialDailyAdvanceResult {
  const parsed = record(action, "Who Am I action");
  const index = Number(context.publicState.round_index ?? 0);
  if (!Number.isInteger(index) || index < 0 || index > 1) {
    throw new Error("Who Am I active round index is invalid.");
  }
  if (context.publicState.complete === true) {
    throw new Error("The official Who Am I Daily is already complete.");
  }

  const children = twoRoundChildren(context);
  const savedRounds = records(context.submissionState.rounds ?? [], "Who Am I saved rounds");
  const completed = records(context.publicState.completed_rounds ?? [], "Who Am I completed rounds");
  const scores = Array.isArray(context.publicState.round_scores)
    ? context.publicState.round_scores.map(Number)
    : [];

  if (context.publicState.awaiting_next === true) {
    if (parsed.type !== "next_round" || index !== 0 || completed.length !== 1) {
      throw new Error("Finish the Who Am I round transition before continuing.");
    }
    const nextState = record(
      record(children[1]!.public_setup, "Who Am I second-round setup").initial_state,
      "Who Am I second-round initial state",
    );
    return {
      submissionState: { rounds: savedRounds, final_submission: null },
      publicState: {
        complete: false,
        format_version: WHO_AM_I_TWO_ROUND_FORMAT_VERSION,
        round_index: 1,
        round_count: 2,
        awaiting_next: false,
        completed_rounds: completed,
        round_scores: scores,
        active_round: nextState,
        active_reveal: null,
        score: null,
      },
      complete: false,
      finalSubmission: null,
    };
  }

  if (parsed.type === "next_round") {
    throw new Error("The current Who Am I identity is not complete.");
  }

  const activePublic = record(context.publicState.active_round, "Who Am I active round");
  const activeSubmission = savedRounds[index] ?? {};
  const advanced = advanceWhoAmIDailyRuntime(
    childContext(context, index, activeSubmission, activePublic),
    parsed,
  );
  const nextSaved = [...savedRounds];
  nextSaved[index] = advanced.submissionState;

  if (!advanced.complete) {
    return {
      submissionState: { rounds: nextSaved, final_submission: null },
      publicState: { ...context.publicState, active_round: advanced.publicState, active_reveal: null },
      complete: false,
      finalSubmission: null,
    };
  }

  const summary = childSummary(index, advanced, children[index]!);
  const nextCompleted = [...completed, summary];
  const nextScores = [...scores, summary.score];

  if (index === 0) {
    return {
      submissionState: { rounds: nextSaved, final_submission: null },
      publicState: {
        complete: false,
        format_version: WHO_AM_I_TWO_ROUND_FORMAT_VERSION,
        round_index: 0,
        round_count: 2,
        awaiting_next: true,
        completed_rounds: nextCompleted,
        round_scores: nextScores,
        active_round: advanced.publicState,
        active_reveal: record(children[0]!.reveal_setup, "Who Am I first-round reveal"),
        score: null,
      },
      complete: false,
      finalSubmission: null,
    };
  }

  const firstFinal = record(nextSaved[0]?.final_submission, "Who Am I first-round final submission");
  const secondFinal = record(advanced.finalSubmission, "Who Am I second-round final submission");
  const finalSubmission = {
    format_version: WHO_AM_I_TWO_ROUND_FORMAT_VERSION,
    rounds: [firstFinal, secondFinal],
  };
  const score = Math.round((nextScores[0]! + nextScores[1]!) / 2);

  return {
    submissionState: { rounds: nextSaved, final_submission: finalSubmission },
    publicState: {
      complete: true,
      format_version: WHO_AM_I_TWO_ROUND_FORMAT_VERSION,
      round_index: 1,
      round_count: 2,
      awaiting_next: false,
      completed_rounds: nextCompleted,
      round_scores: nextScores,
      active_round: advanced.publicState,
      active_reveal: record(children[1]!.reveal_setup, "Who Am I second-round reveal"),
      score,
    },
    complete: true,
    finalSubmission,
  };
}

export function advanceCanonicalWhoAmIDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: unknown,
): OfficialDailyAdvanceResult {
  return context.privateSetupEvidence.format_version === WHO_AM_I_TWO_ROUND_FORMAT_VERSION
    ? advanceTwoRoundWhoAmIDailyRuntime(context, action)
    : advanceWhoAmIDailyRuntime(context, action);
}
