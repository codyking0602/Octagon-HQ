import {
  advanceMillionaireRuntime,
  assertMillionaireRun,
  type MillionaireAction,
  type MillionaireLifeline,
  type MillionaireRun,
  type MillionaireState,
} from "../games/millionaireEngine";
import { type MillionaireChoiceId, type MillionaireRuntimeQuestion } from "../games/millionaireAuthority";
import { MILLIONAIRE_TIME_BANK_MS, millionaireTimeoutTransition } from "./millionaireRuntimeShared";
import type { OfficialDailyRuntimeContext, OfficialDailyAdvanceResult } from "./todaysChallengeRuntime";

// Preserve the 2026-09-19 2:30 published board cutoff without bringing in
// the daily authored question bank, NFL themes or other sports' content.
const MILLIONAIRE_LEGACY_TIME_BANK_MS = 150_000;
type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as JsonRecord;
}

function integer(value: unknown, label: string, min: number, max: number) {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) {
    throw new Error(`${label} must be an integer from ${min} through ${max}.`);
  }
  return Number(value);
}


export function millionaireDailyPublicState(state: MillionaireState, timeRemainingMs: number, transition?: {
  questionReveal?: { questionId: string; correctChoiceId: MillionaireChoiceId; explanation: string } | null;
  lifelineReveal?: unknown;
  answerOutcome?: unknown;
}) {
  return {
    complete: state.status !== "playing",
    status: state.status,
    current_question_index: state.currentQuestionIndex,
    completed_questions: state.completedQuestions,
    first_miss_question_index: state.firstMissQuestionIndex,
    current_money: state.currentMoney,
    final_money: state.finalMoney,
    base_score: state.baseScore,
    score: state.score,
    lifelines_used: {
      fifty_fifty: state.lifelinesUsed.fiftyFifty,
      stat_sheet: state.lifelinesUsed.statSheet,
      double_dip: state.lifelinesUsed.doubleDip,
    },
    question_state: {
      fifty_fifty_applied: state.questionState.fiftyFiftyApplied,
      removed_choice_ids: [...state.questionState.removedChoiceIds],
      stat_sheet_revealed: state.questionState.statSheetRevealed,
      double_dip_active: state.questionState.doubleDipActive,
      double_dip_wrong_choice_ids: [...state.questionState.doubleDipWrongChoiceIds],
    },
    time_remaining_ms: timeRemainingMs,
    last_question_reveal: transition?.questionReveal ?? null,
    last_lifeline_reveal: transition?.lifelineReveal ?? null,
    last_answer_outcome: transition?.answerOutcome ?? null,
  };
}

function stateFromPublic(value: unknown): MillionaireState {
  const row = asRecord(value, "Millionaire public state");
  const lifelines = asRecord(row.lifelines_used, "Millionaire lifeline usage");
  const question = asRecord(row.question_state, "Millionaire question state");
  const status = String(row.status ?? "");
  if (!["playing", "won", "lost", "walked-away"].includes(status)) {
    throw new Error("Millionaire status is invalid.");
  }
  const choiceIds = (input: unknown, label: string) => {
    if (!Array.isArray(input) || input.some((id) => !["A", "B", "C", "D"].includes(String(id)))) {
      throw new Error(`${label} is invalid.`);
    }
    return input.map((id) => String(id) as MillionaireChoiceId);
  };
  return {
    status: status as MillionaireState["status"],
    currentQuestionIndex: integer(row.current_question_index, "Millionaire question index", 0, 7),
    completedQuestions: integer(row.completed_questions, "Millionaire completed questions", 0, 8),
    firstMissQuestionIndex: row.first_miss_question_index == null
      ? null
      : integer(row.first_miss_question_index, "Millionaire first miss question index", 0, 7),
    currentMoney: integer(row.current_money, "Millionaire current money", 0, 1_000_000),
    finalMoney: row.final_money == null ? null : integer(row.final_money, "Millionaire final money", 0, 1_000_000),
    baseScore: integer(row.base_score, "Millionaire base score", 0, 100),
    score: integer(row.score, "Millionaire score", 0, 100),
    lifelinesUsed: {
      fiftyFifty: lifelines.fifty_fifty === true,
      statSheet: lifelines.stat_sheet === true,
      doubleDip: lifelines.double_dip === true,
    },
    questionState: {
      fiftyFiftyApplied: question.fifty_fifty_applied === true,
      removedChoiceIds: choiceIds(question.removed_choice_ids ?? [], "Millionaire removed choices"),
      statSheetRevealed: question.stat_sheet_revealed === true,
      doubleDipActive: question.double_dip_active === true,
      doubleDipWrongChoiceIds: choiceIds(question.double_dip_wrong_choice_ids ?? [], "Millionaire Double Dip misses"),
    },
  };
}

function privateRun(context: OfficialDailyRuntimeContext): MillionaireRun {
  const raw = context.privateSetupEvidence.run;
  if (!Array.isArray(raw)) throw new Error("Millionaire private run is unavailable.");
  assertMillionaireRun(raw as MillionaireRuntimeQuestion[]);
  return raw as unknown as MillionaireRun;
}

function lifelineCount(state: MillionaireState) {
  return Number(state.lifelinesUsed.fiftyFifty)
    + Number(state.lifelinesUsed.statSheet)
    + Number(state.lifelinesUsed.doubleDip);
}

function finalSubmission(
  context: OfficialDailyRuntimeContext,
  state: MillionaireState,
  timeRemainingMs: number,
) {
  return {
    proof: String(context.privateSetupEvidence.proof ?? ""),
    outcome: state.status,
    completed_questions: state.completedQuestions,
    first_miss_question: state.firstMissQuestionIndex == null ? null : state.firstMissQuestionIndex + 1,
    final_money: state.finalMoney ?? 0,
    base_score: state.baseScore,
    lifelines_used: lifelineCount(state),
    time_remaining_ms: timeRemainingMs,
  };
}


function runtimeAction(action: JsonRecord): MillionaireAction {
  const type = String(action.type ?? "");
  if (type === "answer") {
    const choiceId = String(action.choice_id ?? "");
    if (!["A", "B", "C", "D"].includes(choiceId)) throw new Error("Millionaire answer choice is invalid.");
    return { type: "answer", choiceId: choiceId as MillionaireChoiceId };
  }
  if (type === "use_lifeline") {
    const lifeline = String(action.lifeline ?? "");
    if (!["fifty-fifty", "stat-sheet", "double-dip"].includes(lifeline)) {
      throw new Error("Millionaire lifeline is invalid.");
    }
    return { type: "use_lifeline", lifeline: lifeline as MillionaireLifeline };
  }
  if (type === "walk_away") return { type: "walk_away" };
  throw new Error("Millionaire action is invalid.");
}

export function advanceMillionaireDailyRuntime(
  context: OfficialDailyRuntimeContext,
  actionValue: unknown,
): OfficialDailyAdvanceResult {
  const action = asRecord(actionValue, "Millionaire action");
  const run = privateRun(context);
  const state = stateFromPublic(context.publicState);
  if (state.status !== "playing") throw new Error("Millionaire run is already settled.");

  // September 19 boards were published with the original 2:30 bank. Accept that
  // persisted state during the cutover, but cap every live action to the new
  // canonical 2:00 bank so today's UFC and Football runs switch safely in place.
  const priorTime = integer(
    context.publicState.time_remaining_ms,
    "Millionaire time remaining",
    0,
    MILLIONAIRE_LEGACY_TIME_BANK_MS,
  );
  const requestedTime = action.time_remaining_ms == null
    ? priorTime
    : integer(action.time_remaining_ms, "Millionaire time remaining", 0, MILLIONAIRE_LEGACY_TIME_BANK_MS);
  const timeRemainingMs = Math.min(priorTime, requestedTime, MILLIONAIRE_TIME_BANK_MS);

  const transition = action.type === "timeout" || timeRemainingMs === 0
    ? millionaireTimeoutTransition(run, state)
    : advanceMillionaireRuntime(run, state, runtimeAction(action));

  const complete = transition.state.status !== "playing";
  const final = complete ? finalSubmission(context, transition.state, timeRemainingMs) : null;
  return {
    submissionState: {
      final_submission: final,
    },
    publicState: millionaireDailyPublicState(transition.state, timeRemainingMs, transition),
    complete,
    finalSubmission: final,
  };
}
