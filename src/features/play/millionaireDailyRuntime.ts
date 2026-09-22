import {
  advanceMillionaireRuntime,
  assertMillionaireRun,
  createMillionaireState,
  type MillionaireAction,
  type MillionaireLifeline,
  type MillionaireRun,
  type MillionaireState,
} from "../games/millionaireEngine";
import {
  MILLIONAIRE_CHOICE_IDS,
  millionairePublicQuestion,
  type MillionaireChoiceId,
  type MillionaireRuntimeQuestion,
} from "../games/millionaireAuthority";
import {
  MILLIONAIRE_TIME_BANK_MS,
  millionaireTimeoutTransition,
  type MillionaireLeague,
} from "./MillionaireCasualModel";
import {
  MILLIONAIRE_DAILY_RUN_COUNT,
  millionaireDailyRun,
} from "./millionaireDailyQuestionBank";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyRuntimeContext,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const MILLIONAIRE_DAILY_CONTENT_VERSION = "millionaire-daily-v4-two-minute-bank" as const;
export const MILLIONAIRE_DAILY_SCORING_VERSION = "play-official-score-v1" as const;
export const MILLIONAIRE_DAILY_ANCHOR = "2026-09-19" as const;
export const FOOTBALL_MILLIONAIRE_DAILY_ANCHOR = MILLIONAIRE_DAILY_ANCHOR;
const MILLIONAIRE_LEGACY_TIME_BANK_MS = 150_000;
const MILLIONAIRE_ANSWER_POSITION_PATTERN = [0, 1, 2, 3, 1, 2, 3, 0] as const;

function balanceRun(run: MillionaireRun, runIndex: number): MillionaireRun {
  return run.map((question, questionIndex) => {
    const answer = question.choices.find((choice) => choice.id === question.correctChoiceId)!;
    const slot = (MILLIONAIRE_ANSWER_POSITION_PATTERN[questionIndex]! + runIndex) % 4;
    const others = question.choices.filter((choice) => choice.id !== question.correctChoiceId);
    let otherIndex = 0;
    const choices = MILLIONAIRE_CHOICE_IDS.map((id, index) => ({
      id,
      text: index === slot ? answer.text : others[otherIndex++]!.text,
    })) as unknown as MillionaireRuntimeQuestion["choices"];
    const correctChoiceId = MILLIONAIRE_CHOICE_IDS[slot]!;
    const second = MILLIONAIRE_CHOICE_IDS[(slot + 1) % 4]!;
    const removalChoiceIds = MILLIONAIRE_CHOICE_IDS.filter(
      (id) => id !== correctChoiceId && id !== second,
    );

    return {
      ...question,
      choices,
      correctChoiceId,
      fiftyFifty: {
        survivorChoiceIds: [correctChoiceId, second],
        removalChoiceIds: [removalChoiceIds[0]!, removalChoiceIds[1]!],
      },
    };
  }) as unknown as MillionaireRun;
}

const SPORTS_FEUD_DAILY_CUTOVER = "2026-09-23";
const PRE_SPORTS_FEUD_MILLIONAIRE_APPEARANCES = 1;

const FOOTBALL_MILLIONAIRE_LEGACY_CYCLE_LENGTH = 22;
const FOOTBALL_MILLIONAIRE_LEGACY_SLOTS = [0, 7, 13, 19] as const;
const FOOTBALL_MILLIONAIRE_CYCLE_LENGTH = 26;
const FOOTBALL_MILLIONAIRE_SLOTS = [5, 13, 21, 25] as const;

const UFC_MILLIONAIRE_LEGACY_CYCLE_LENGTH = 26;
const UFC_MILLIONAIRE_LEGACY_SLOTS = [0, 8, 15, 23] as const;
const UFC_MILLIONAIRE_CYCLE_LENGTH = 30;
const UFC_MILLIONAIRE_SLOTS = [6, 15, 23, 29] as const;

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

function centralDayNumber(day: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) throw new Error("Millionaire daily day must use YYYY-MM-DD.");
  return Math.floor(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86_400_000);
}

function appearanceIndex(
  day: string,
  anchor: string,
  cycleLength: number,
  slots: readonly number[],
  label: string,
) {
  const offset = centralDayNumber(day) - centralDayNumber(anchor);
  const cycle = Math.floor(offset / cycleLength);
  const slot = ((offset % cycleLength) + cycleLength) % cycleLength;
  const position = slots.indexOf(slot);
  if (position < 0) {
    throw new Error(`${label} Millionaire is not scheduled on ${day}.`);
  }
  return cycle * slots.length + position;
}

export function millionaireFootballDailyAppearance(day: string) {
  if (day < SPORTS_FEUD_DAILY_CUTOVER) {
    return appearanceIndex(
      day,
      FOOTBALL_MILLIONAIRE_DAILY_ANCHOR,
      FOOTBALL_MILLIONAIRE_LEGACY_CYCLE_LENGTH,
      FOOTBALL_MILLIONAIRE_LEGACY_SLOTS,
      "Football",
    );
  }
  return PRE_SPORTS_FEUD_MILLIONAIRE_APPEARANCES + appearanceIndex(
    day,
    SPORTS_FEUD_DAILY_CUTOVER,
    FOOTBALL_MILLIONAIRE_CYCLE_LENGTH,
    FOOTBALL_MILLIONAIRE_SLOTS,
    "Football",
  );
}

export function millionaireUfcDailyAppearance(day: string) {
  if (day < SPORTS_FEUD_DAILY_CUTOVER) {
    return appearanceIndex(
      day,
      MILLIONAIRE_DAILY_ANCHOR,
      UFC_MILLIONAIRE_LEGACY_CYCLE_LENGTH,
      UFC_MILLIONAIRE_LEGACY_SLOTS,
      "UFC",
    );
  }
  return PRE_SPORTS_FEUD_MILLIONAIRE_APPEARANCES + appearanceIndex(
    day,
    SPORTS_FEUD_DAILY_CUTOVER,
    UFC_MILLIONAIRE_CYCLE_LENGTH,
    UFC_MILLIONAIRE_SLOTS,
    "UFC",
  );
}

export function millionaireFootballDailyLeague(day: string): "cfb" | "nfl" {
  return millionaireFootballDailyAppearance(day) % 2 === 0 ? "cfb" : "nfl";
}

export function millionaireDailyLeague(sport: "ufc" | "football", day: string): MillionaireLeague {
  return sport === "ufc" ? "ufc" : millionaireFootballDailyLeague(day);
}

export function millionaireDailyLeagueAppearance(sport: "ufc" | "football", day: string) {
  if (sport === "ufc") return millionaireUfcDailyAppearance(day);
  return Math.floor(millionaireFootballDailyAppearance(day) / 2);
}

export function millionaireDailyRunIndex(sport: "ufc" | "football", day: string) {
  const appearance = millionaireDailyLeagueAppearance(sport, day);
  return ((appearance % MILLIONAIRE_DAILY_RUN_COUNT) + MILLIONAIRE_DAILY_RUN_COUNT)
    % MILLIONAIRE_DAILY_RUN_COUNT;
}

export function millionaireDailyHostNumber(sport: "ufc" | "football", day: string) {
  const appearance = millionaireDailyLeagueAppearance(sport, day);
  return ((appearance % 3) + 3) % 3 + 1;
}

function proofFor(run: MillionaireRun, league: MillionaireLeague, day: string, scheduleVersion: string) {
  return [
    MILLIONAIRE_DAILY_CONTENT_VERSION,
    league,
    day,
    scheduleVersion,
    ...run.map((question) => `${question.id}:${question.correctChoiceId}`),
  ].join("|");
}

function publicState(state: MillionaireState, timeRemainingMs: number, transition?: {
  questionReveal?: { questionId: string; correctChoiceId: MillionaireChoiceId; explanation: string } | null;
  lifelineReveal?: unknown;
  answerOutcome?: unknown;
}) {
  return {
    complete: state.status !== "playing",
    status: state.status,
    current_question_index: state.currentQuestionIndex,
    completed_questions: state.completedQuestions,
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
    final_money: state.finalMoney ?? 0,
    base_score: state.baseScore,
    lifelines_used: lifelineCount(state),
    time_remaining_ms: timeRemainingMs,
  };
}

export function buildMillionaireDailySetup(
  sport: "ufc" | "football",
  day: string,
  scheduleVersion: string,
): OfficialDailySetupPublication {
  const league = millionaireDailyLeague(sport, day);
  const runIndex = millionaireDailyRunIndex(sport, day);
  const hostNumber = millionaireDailyHostNumber(sport, day);
  const run = balanceRun(millionaireDailyRun(league, runIndex), runIndex);
  assertMillionaireRun(run);
  const state = createMillionaireState(run);
  const proof = proofFor(run, league, day, scheduleVersion);
  return {
    setupKey: `${MILLIONAIRE_DAILY_CONTENT_VERSION}:${scheduleVersion}:${day}:${league}`,
    contentVersion: MILLIONAIRE_DAILY_CONTENT_VERSION,
    scoringVersion: MILLIONAIRE_DAILY_SCORING_VERSION,
    publicSetup: {
      runtime_version: MILLIONAIRE_DAILY_CONTENT_VERSION,
      league,
      run_number: runIndex + 1,
      host_number: hostNumber,
      question_count: 8,
      time_bank_ms: MILLIONAIRE_TIME_BANK_MS,
      questions: run.map(millionairePublicQuestion),
      initial_state: publicState(state, MILLIONAIRE_TIME_BANK_MS),
    },
    revealSetup: {
      league,
      run_number: runIndex + 1,
      host_number: hostNumber,
      questions: run.map((question) => ({
        id: question.id,
        correct_choice_id: question.correctChoiceId,
        explanation: question.explanation,
      })),
    },
    privateSetupEvidence: {
      league,
      run_number: runIndex + 1,
      host_number: hostNumber,
      proof,
      run,
    },
    privateGradingEvidence: {
      proof,
    },
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
    publicState: publicState(transition.state, timeRemainingMs, transition),
    complete,
    finalSubmission: final,
  };
}
