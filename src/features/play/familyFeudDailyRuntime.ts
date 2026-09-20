import {
  FAMILY_FEUD_BOARD_ANSWER_COUNT,
  FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT,
  FAMILY_FEUD_FAST_MONEY_RAW_MAX,
  FAMILY_FEUD_FAST_MONEY_TIME_MS,
  FAMILY_FEUD_MAIN_BOARD_MAX,
  FAMILY_FEUD_MAIN_RAW_MAX,
  FAMILY_FEUD_RAW_MAX,
  FAMILY_FEUD_STRIKES_PER_BOARD,
  assertFamilyFeudPack,
  createFamilyFeudState,
  familyFeudScore,
  submitFamilyFeudFastMoneyAnswer,
  submitFamilyFeudMainAnswer,
  timeoutFamilyFeudFastMoney,
  type FamilyFeudOutcome,
  type FamilyFeudPack,
  type FamilyFeudRankedAnswer,
  type FamilyFeudState,
} from "../games/familyFeudEngine";

export const FAMILY_FEUD_DAILY_CONTENT_VERSION = "family-feud-daily-v2" as const;
export const FAMILY_FEUD_DAILY_SCORING_VERSION = "family-feud-score-v2" as const;

export interface FamilyFeudDailyPublication {
  setupKey: string;
  contentVersion: typeof FAMILY_FEUD_DAILY_CONTENT_VERSION;
  scoringVersion: typeof FAMILY_FEUD_DAILY_SCORING_VERSION;
  publicSetup: Record<string, unknown>;
  revealSetup: Record<string, unknown>;
  privateSetupEvidence: Record<string, unknown>;
  privateGradingEvidence: Record<string, unknown>;
}

export interface FamilyFeudDailyRuntimeContext {
  setupKey: string;
  publicSetup: Record<string, unknown>;
  privateSetupEvidence: Record<string, unknown>;
  submissionState: Record<string, unknown>;
}

export interface FamilyFeudDailyAdvanceResult {
  submissionState: Record<string, unknown>;
  publicState: Record<string, unknown>;
  complete: boolean;
  finalSubmission: Record<string, unknown> | null;
}

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(label + " must be an object.");
  }
  return value as JsonRecord;
}

function entityPresentation(pack: FamilyFeudPack, entityId: string) {
  const entity = pack.entities.find((row) => row.id === entityId);
  if (!entity) throw new Error("Family Feud entity " + entityId + " is unavailable.");
  return {
    id: entity.id,
    display_name: entity.displayName,
  };
}

function boardSettled(state: FamilyFeudState, boardIndex: number) {
  const board = state.mainBoards[boardIndex]!;
  return board.revealedEntityIds.length >= FAMILY_FEUD_BOARD_ANSWER_COUNT
    || board.strikes >= FAMILY_FEUD_STRIKES_PER_BOARD;
}

function answerById(
  pack: FamilyFeudPack,
  questionIndex: number,
  entityId: string,
): FamilyFeudRankedAnswer {
  const answer = pack.mainBoards[questionIndex]!.answers.find((row) => row.entityId === entityId);
  if (!answer) throw new Error("Family Feud revealed answer is outside its board.");
  return answer;
}

function mainBoardPublicState(
  pack: FamilyFeudPack,
  state: FamilyFeudState,
  boardIndex: number,
) {
  const question = pack.mainBoards[boardIndex]!;
  const board = state.mainBoards[boardIndex]!;
  const foundIds = new Set(board.revealedEntityIds);
  const settled = boardSettled(state, boardIndex);
  const foundAnswers = board.revealedEntityIds.map((entityId) => answerById(pack, boardIndex, entityId));
  const missedAnswers = settled && foundAnswers.length < FAMILY_FEUD_BOARD_ANSWER_COUNT
    ? question.answers
        .filter((answer) => !foundIds.has(answer.entityId))
        .slice(0, FAMILY_FEUD_BOARD_ANSWER_COUNT - foundAnswers.length)
    : [];
  const displayAnswers = [...foundAnswers, ...missedAnswers];

  return {
    id: question.id,
    prompt: question.prompt,
    strikes: board.strikes,
    strike_limit: FAMILY_FEUD_STRIKES_PER_BOARD,
    required_answers: FAMILY_FEUD_BOARD_ANSWER_COUNT,
    max_points: FAMILY_FEUD_MAIN_BOARD_MAX,
    settled,
    slots: Array.from({ length: FAMILY_FEUD_BOARD_ANSWER_COUNT }, (_value, slotIndex) => {
      const answer = displayAnswers[slotIndex] ?? null;
      const found = Boolean(answer && foundIds.has(answer.entityId));
      return {
        slot_index: slotIndex,
        points: answer?.points ?? null,
        revealed: Boolean(answer),
        found,
        entity: answer ? entityPresentation(pack, answer.entityId) : null,
      };
    }),
  };
}

function fastMoneyReveal(pack: FamilyFeudPack, state: FamilyFeudState) {
  if (state.phase !== "complete") return [];
  return pack.fastMoney.map((question, index) => {
    const result = state.fastMoneyResults[index];
    const canonical = result?.entityId ? entityPresentation(pack, result.entityId) : null;
    const submitted = canonical?.display_name ?? result?.submittedText ?? "NO ANSWER";
    const rankedAnswerIndex = result?.entityId
      ? question.answers.findIndex((answer) => answer.entityId === result.entityId)
      : -1;
    return {
      question_id: question.id,
      prompt: question.prompt,
      submitted_answer: submitted,
      counted: Boolean(result && result.points > 0),
      points: result?.points ?? 0,
      board_rank: rankedAnswerIndex >= 0 ? rankedAnswerIndex + 1 : null,
      accepted_answers: question.answers.map((answer) => ({
        entity: entityPresentation(pack, answer.entityId),
        points: answer.points,
      })),
    };
  });
}

function publicFeedback(pack: FamilyFeudPack, outcome?: FamilyFeudOutcome | null) {
  if (!outcome) return null;
  switch (outcome.type) {
    case "board-correct":
      return {
        type: "correct",
        board_index: outcome.boardIndex,
        slot_index: outcome.slotIndex,
        entity: entityPresentation(pack, outcome.entityId),
        points: outcome.points,
      };
    case "board-strike":
      return {
        type: "strike",
        board_index: outcome.boardIndex,
        strikes: outcome.strikes,
      };
    case "ambiguous":
      return {
        type: "ambiguous",
        message: "BE MORE SPECIFIC",
      };
    case "already-guessed":
      return {
        type: "already-guessed",
        message: "ALREADY GUESSED",
      };
    case "fast-money-answer":
      return {
        type: "accepted",
      };
    case "fast-money-timeout":
      return {
        type: "timeout",
      };
  }
}

export function familyFeudDailyPublicState(
  pack: FamilyFeudPack,
  state: FamilyFeudState,
  outcome?: FamilyFeudOutcome | null,
) {
  const score = familyFeudScore(pack, state);
  const complete = state.phase === "complete";
  const currentFastMoney = state.phase === "fast-money"
    ? pack.fastMoney[state.fastMoneyIndex] ?? null
    : null;

  return {
    complete,
    phase: state.phase,
    main_board_index: state.mainBoardIndex,
    main_boards: pack.mainBoards.map((_board, index) => mainBoardPublicState(pack, state, index)),
    main_points: score.main,
    fast_money: {
      question_count: FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT,
      answered_count: state.fastMoneyResults.length,
      question_index: state.phase === "fast-money" ? state.fastMoneyIndex : null,
      current_question: currentFastMoney
        ? { id: currentFastMoney.id, prompt: currentFastMoney.prompt }
        : null,
      time_remaining_ms: state.fastMoneyTimeRemainingMs,
      results: fastMoneyReveal(pack, state),
      points: complete ? score.fastMoney : null,
    },
    raw_points: complete ? score.raw : null,
    hq_score: complete ? score.hq : null,
    last_feedback: publicFeedback(pack, outcome),
  };
}

function proofFor(
  pack: FamilyFeudPack,
  day: string,
  scheduleVersion: string,
) {
  const questionSignature = [...pack.mainBoards, ...pack.fastMoney]
    .map((question) => question.id + ":" + question.answers.map((answer) => answer.entityId + "=" + answer.points).join(","))
    .join("|");
  return [
    FAMILY_FEUD_DAILY_CONTENT_VERSION,
    pack.sport,
    day,
    scheduleVersion,
    pack.id,
    questionSignature,
  ].join("|");
}

export function buildFamilyFeudDailySetup(
  pack: FamilyFeudPack,
  day: string,
  scheduleVersion: string,
): FamilyFeudDailyPublication {
  assertFamilyFeudPack(pack);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error("Family Feud daily day must use YYYY-MM-DD.");
  }
  if (!scheduleVersion.trim()) throw new Error("Family Feud daily schedule version is required.");

  const state = createFamilyFeudState();
  const proof = proofFor(pack, day, scheduleVersion);

  return {
    setupKey: [
      FAMILY_FEUD_DAILY_CONTENT_VERSION,
      scheduleVersion,
      day,
      pack.sport,
      pack.id,
    ].join(":"),
    contentVersion: FAMILY_FEUD_DAILY_CONTENT_VERSION,
    scoringVersion: FAMILY_FEUD_DAILY_SCORING_VERSION,
    publicSetup: {
      runtime_version: FAMILY_FEUD_DAILY_CONTENT_VERSION,
      sport: pack.sport,
      pack_id: pack.id,
      main_board_count: pack.mainBoards.length,
      answers_required_per_board: FAMILY_FEUD_BOARD_ANSWER_COUNT,
      strike_limit: FAMILY_FEUD_STRIKES_PER_BOARD,
      main_board_max_points: FAMILY_FEUD_MAIN_BOARD_MAX,
      main_max_points: FAMILY_FEUD_MAIN_RAW_MAX,
      fast_money_question_count: FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT,
      fast_money_time_ms: FAMILY_FEUD_FAST_MONEY_TIME_MS,
      fast_money_max_points: FAMILY_FEUD_FAST_MONEY_RAW_MAX,
      hq_score_max: FAMILY_FEUD_RAW_MAX,
      main_boards: pack.mainBoards.map((question) => ({
        id: question.id,
        prompt: question.prompt,
      })),
      fast_money_prompts: pack.fastMoney.map((question) => ({
        id: question.id,
        prompt: question.prompt,
      })),
      initial_state: familyFeudDailyPublicState(pack, state),
    },
    revealSetup: {
      main_boards: pack.mainBoards.map((question) => ({
        id: question.id,
        accepted_answers: question.answers.map((answer, rankIndex) => ({
          rank: rankIndex + 1,
          entity: entityPresentation(pack, answer.entityId),
          points: answer.points,
        })),
      })),
      fast_money: pack.fastMoney.map((question) => ({
        id: question.id,
        accepted_answers: question.answers.map((answer, rankIndex) => ({
          rank: rankIndex + 1,
          entity: entityPresentation(pack, answer.entityId),
          points: answer.points,
        })),
      })),
    },
    privateSetupEvidence: {
      proof,
      pack,
    },
    privateGradingEvidence: {
      proof,
      raw_max: FAMILY_FEUD_RAW_MAX,
    },
  };
}

function stateFromSubmission(context: FamilyFeudDailyRuntimeContext) {
  const raw = context.submissionState.engine_state;
  if (raw == null) return createFamilyFeudState();
  const row = asRecord(raw, "Family Feud persisted state");

  if (!["main", "fast-money", "complete"].includes(String(row.phase ?? ""))) {
    throw new Error("Family Feud persisted phase is invalid.");
  }

  return structuredClone(row) as unknown as FamilyFeudState;
}

function privatePack(context: FamilyFeudDailyRuntimeContext) {
  const raw = context.privateSetupEvidence.pack;
  const pack = asRecord(raw, "Family Feud private pack") as unknown as FamilyFeudPack;
  assertFamilyFeudPack(pack);
  return pack;
}

function finalSubmission(
  context: FamilyFeudDailyRuntimeContext,
  pack: FamilyFeudPack,
  state: FamilyFeudState,
) {
  const score = familyFeudScore(pack, state);
  return {
    proof: String(context.privateSetupEvidence.proof ?? ""),
    native_score: score.raw,
    normalized_score: score.hq,
    main_points: score.main,
    fast_money_points: score.fastMoney,
    fast_money_time_remaining_ms: state.fastMoneyTimeRemainingMs,
  };
}

export function advanceFamilyFeudDailyRuntime(
  context: FamilyFeudDailyRuntimeContext,
  actionValue: unknown,
): FamilyFeudDailyAdvanceResult {
  const pack = privatePack(context);
  const action = asRecord(actionValue, "Family Feud action");
  const state = stateFromSubmission(context);
  if (state.phase === "complete") throw new Error("Family Feud run is already settled.");

  const type = String(action.type ?? "");
  let transition;
  if (type === "timeout") {
    if (state.phase !== "fast-money") throw new Error("Family Feud timeout is only valid in Fast Money.");
    transition = timeoutFamilyFeudFastMoney(state);
  } else if (type === "answer") {
    const answer = typeof action.answer === "string" ? action.answer : "";
    if (state.phase === "main") {
      transition = submitFamilyFeudMainAnswer(pack, state, answer);
    } else {
      const timeRemaining = action.time_remaining_ms == null
        ? undefined
        : Number(action.time_remaining_ms);
      transition = submitFamilyFeudFastMoneyAnswer(pack, state, answer, timeRemaining);
    }
  } else {
    throw new Error("Family Feud action is invalid.");
  }

  const complete = transition.state.phase === "complete";
  const final = complete ? finalSubmission(context, pack, transition.state) : null;
  return {
    submissionState: {
      engine_state: transition.state,
      final_submission: final,
    },
    publicState: familyFeudDailyPublicState(pack, transition.state, transition.outcome),
    complete,
    finalSubmission: final,
  };
}
