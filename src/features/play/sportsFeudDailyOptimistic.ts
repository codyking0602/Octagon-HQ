import type { TodayChallengeProjection } from "./todayChallengeRepository";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

export interface SportsFeudFastMoneyOptimisticAction {
  questionIndex: number;
  questionId: string;
  answer: string;
  timeRemainingMs: number;
}

export function optimisticSportsFeudFastMoneyPublicState(
  publicState: JsonRecord,
  publicSetup: JsonRecord,
  action: SportsFeudFastMoneyOptimisticAction,
) {
  const state = record(publicState);
  if (state.phase !== "fast-money" || state.complete === true) return state;

  const fast = record(state.fast_money);
  const currentIndex = Number(fast.question_index ?? fast.answered_count ?? 0);
  const currentQuestion = record(fast.current_question);
  if (
    currentIndex !== action.questionIndex
    || (typeof currentQuestion.id === "string" && currentQuestion.id !== action.questionId)
  ) {
    return state;
  }

  const prompts = records(publicSetup.fast_money_prompts);
  const nextIndex = action.questionIndex + 1;
  const nextPrompt = prompts[nextIndex] ?? null;
  const submittedAnswers = records(fast.submitted_answers);
  const submitted = [
    ...submittedAnswers,
    { submitted_answer: action.answer.trim() || "NO ANSWER" },
  ];

  return {
    ...state,
    fast_money: {
      ...fast,
      answered_count: Math.max(Number(fast.answered_count ?? 0), nextIndex),
      question_index: nextPrompt ? nextIndex : null,
      current_question: nextPrompt
        ? { id: String(nextPrompt.id ?? ""), prompt: String(nextPrompt.prompt ?? "") }
        : null,
      time_remaining_ms: Math.max(0, Math.floor(action.timeRemainingMs)),
      submitted_answers: submitted,
      client_pending_complete: nextIndex >= prompts.length,
    },
    last_feedback: null,
  };
}

export function optimisticSportsFeudFastMoneyProjection(
  projection: TodayChallengeProjection,
  action: SportsFeudFastMoneyOptimisticAction,
): TodayChallengeProjection {
  return {
    ...projection,
    publicState: optimisticSportsFeudFastMoneyPublicState(
      projection.publicState,
      projection.publicSetup,
      action,
    ),
  };
}

export function optimisticSportsFeudFastMoneyTimeout(
  projection: TodayChallengeProjection,
): TodayChallengeProjection {
  const state = record(projection.publicState);
  if (state.phase !== "fast-money" || state.complete === true) return projection;
  const fast = record(state.fast_money);
  return {
    ...projection,
    publicState: {
      ...state,
      fast_money: {
        ...fast,
        time_remaining_ms: 0,
        question_index: null,
        current_question: null,
        client_pending_complete: true,
      },
      last_feedback: null,
    },
  };
}
