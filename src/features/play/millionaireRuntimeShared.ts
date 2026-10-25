import {
  millionaireBaseScore,
  millionaireCheckpointMoney,
  millionaireScoreAfterLifelines,
  currentMillionaireQuestion,
  type MillionaireRun,
  type MillionaireState,
  type MillionaireTransitionResult,
} from "../games/millionaireEngine";

// Shared gameplay constants and timeout grading belong to the lean runtime,
// not the casual presentation (which also imports the authored NBA bank).
export const MILLIONAIRE_TIME_BANK_MS = 120_000;

export function millionaireTimeoutTransition(run: MillionaireRun, state: MillionaireState): MillionaireTransitionResult {
  if (state.status !== "playing") throw new Error("Millionaire run is already settled.");
  const current = currentMillionaireQuestion(run, state);
  if (!current) throw new Error("Millionaire current question is unavailable.");
  const firstMissQuestionIndex = state.firstMissQuestionIndex ?? state.currentQuestionIndex;
  const baseScore = millionaireBaseScore(state.completedQuestions, firstMissQuestionIndex);
  const score = millionaireScoreAfterLifelines(baseScore, state.lifelinesUsed);
  return {
    state: {
      ...state,
      status: "lost",
      firstMissQuestionIndex,
      finalMoney: state.finalMoney ?? millionaireCheckpointMoney(state.currentQuestionIndex),
      baseScore,
      score,
    },
    questionReveal: { questionId: current.id, correctChoiceId: current.correctChoiceId, explanation: current.explanation },
    lifelineReveal: null,
    answerOutcome: "wrong",
  };
}

