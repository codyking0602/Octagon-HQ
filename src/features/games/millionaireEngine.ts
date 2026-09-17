import {
  MILLIONAIRE_LEVELS,
  MILLIONAIRE_MONEY_BY_LEVEL,
  millionaireLevelNumber,
  millionairePublicQuestion,
  type MillionaireChoiceId,
  type MillionairePublicQuestion,
  type MillionaireRuntimeQuestion,
} from "./millionaireAuthority";

export const MILLIONAIRE_OCTAGON_SCORE_BY_LEVEL = {
  Q1: 25,
  Q2: 35,
  Q3: 45,
  Q4: 55,
  Q5: 68,
  Q6: 80,
  Q7: 90,
  Q8: 100,
} as const;

export const MILLIONAIRE_CHECKPOINT_LEVELS = [3, 6] as const;
export const MILLIONAIRE_WALK_AWAY_QUESTION_LEVELS = [7, 8] as const;
export const MILLIONAIRE_LIFELINE_PENALTY = 2;

export type MillionaireRun = readonly [
  MillionaireRuntimeQuestion,
  MillionaireRuntimeQuestion,
  MillionaireRuntimeQuestion,
  MillionaireRuntimeQuestion,
  MillionaireRuntimeQuestion,
  MillionaireRuntimeQuestion,
  MillionaireRuntimeQuestion,
  MillionaireRuntimeQuestion,
];

export type MillionaireLifeline = "fifty-fifty" | "stat-sheet" | "double-dip";
export type MillionaireStatus = "playing" | "won" | "lost" | "walked-away";

export interface MillionaireLifelineUsage {
  fiftyFifty: boolean;
  statSheet: boolean;
  doubleDip: boolean;
}

export interface MillionaireQuestionState {
  fiftyFiftyApplied: boolean;
  removedChoiceIds: readonly MillionaireChoiceId[];
  statSheetRevealed: boolean;
  doubleDipActive: boolean;
  doubleDipWrongChoiceIds: readonly MillionaireChoiceId[];
}

export interface MillionaireState {
  status: MillionaireStatus;
  currentQuestionIndex: number;
  completedQuestions: number;
  currentMoney: number;
  finalMoney: number | null;
  baseScore: number;
  score: number;
  lifelinesUsed: MillionaireLifelineUsage;
  questionState: MillionaireQuestionState;
}

export type MillionaireAction =
  | { type: "answer"; choiceId: MillionaireChoiceId }
  | { type: "use_lifeline"; lifeline: MillionaireLifeline }
  | { type: "walk_away" };

export interface MillionaireQuestionReveal {
  questionId: string;
  correctChoiceId: MillionaireChoiceId;
  explanation: string;
}

export type MillionaireLifelineReveal =
  | { type: "fifty-fifty"; removedChoiceIds: readonly MillionaireChoiceId[] }
  | { type: "stat-sheet"; text: string }
  | { type: "double-dip" }
  | null;

export type MillionaireAnswerOutcome = "correct" | "wrong" | "double-dip-continue" | null;

export interface MillionaireTransitionResult {
  state: MillionaireState;
  questionReveal: MillionaireQuestionReveal | null;
  lifelineReveal: MillionaireLifelineReveal;
  answerOutcome: MillionaireAnswerOutcome;
}

function freshQuestionState(): MillionaireQuestionState {
  return {
    fiftyFiftyApplied: false,
    removedChoiceIds: [],
    statSheetRevealed: false,
    doubleDipActive: false,
    doubleDipWrongChoiceIds: [],
  };
}

function usedLifelineCount(usage: MillionaireLifelineUsage) {
  return Number(usage.fiftyFifty) + Number(usage.statSheet) + Number(usage.doubleDip);
}

export function millionaireScoreForCompletedQuestions(completedQuestions: number) {
  if (completedQuestions <= 0) return 0;
  const level = MILLIONAIRE_LEVELS[Math.min(completedQuestions, MILLIONAIRE_LEVELS.length) - 1];
  return level ? MILLIONAIRE_OCTAGON_SCORE_BY_LEVEL[level] : 0;
}

export function millionaireScoreAfterLifelines(baseScore: number, usage: MillionaireLifelineUsage) {
  return Math.max(0, Math.min(100, baseScore - usedLifelineCount(usage) * MILLIONAIRE_LIFELINE_PENALTY));
}

export function millionaireCheckpointMoney(completedQuestions: number) {
  if (completedQuestions >= 6) return MILLIONAIRE_MONEY_BY_LEVEL.Q6;
  if (completedQuestions >= 3) return MILLIONAIRE_MONEY_BY_LEVEL.Q3;
  return 0;
}

export function assertMillionaireRun(run: readonly MillionaireRuntimeQuestion[]): asserts run is MillionaireRun {
  if (run.length !== 8) throw new Error("Millionaire run must contain exactly eight questions.");
  const ids = new Set<string>();
  const sport = run[0]?.sport;

  run.forEach((question, index) => {
    const expectedLevel = MILLIONAIRE_LEVELS[index];
    if (question.level !== expectedLevel) {
      throw new Error(`Millionaire question ${index + 1} must be ${expectedLevel}.`);
    }
    if (question.money !== MILLIONAIRE_MONEY_BY_LEVEL[expectedLevel]) {
      throw new Error(`Millionaire ${expectedLevel} money does not match the locked ladder.`);
    }
    if (question.sport !== sport) throw new Error("Millionaire run must stay inside one sport scope.");
    if (ids.has(question.id)) throw new Error(`Millionaire run repeats question ${question.id}.`);
    ids.add(question.id);
  });
}

export function createMillionaireState(run: readonly MillionaireRuntimeQuestion[]): MillionaireState {
  assertMillionaireRun(run);
  return {
    status: "playing",
    currentQuestionIndex: 0,
    completedQuestions: 0,
    currentMoney: 0,
    finalMoney: null,
    baseScore: 0,
    score: 0,
    lifelinesUsed: {
      fiftyFifty: false,
      statSheet: false,
      doubleDip: false,
    },
    questionState: freshQuestionState(),
  };
}

export function currentMillionaireQuestion(run: MillionaireRun, state: MillionaireState) {
  return run[state.currentQuestionIndex] ?? null;
}

export function currentMillionairePublicQuestion(run: MillionaireRun, state: MillionaireState): MillionairePublicQuestion | null {
  const question = currentMillionaireQuestion(run, state);
  return question ? millionairePublicQuestion(question) : null;
}

export function millionaireCanWalkAway(state: MillionaireState) {
  if (state.status !== "playing" || state.questionState.doubleDipActive) return false;
  const questionLevel = state.currentQuestionIndex + 1;
  return MILLIONAIRE_WALK_AWAY_QUESTION_LEVELS.includes(questionLevel as 7 | 8);
}

function revealFor(question: MillionaireRuntimeQuestion): MillionaireQuestionReveal {
  return {
    questionId: question.id,
    correctChoiceId: question.correctChoiceId,
    explanation: question.explanation,
  };
}

function scoringState(completedQuestions: number, lifelinesUsed: MillionaireLifelineUsage) {
  const baseScore = millionaireScoreForCompletedQuestions(completedQuestions);
  return {
    baseScore,
    score: millionaireScoreAfterLifelines(baseScore, lifelinesUsed),
  };
}

function lifelineAlreadyUsed(usage: MillionaireLifelineUsage, lifeline: MillionaireLifeline) {
  if (lifeline === "fifty-fifty") return usage.fiftyFifty;
  if (lifeline === "stat-sheet") return usage.statSheet;
  return usage.doubleDip;
}

function withLifelineUsed(usage: MillionaireLifelineUsage, lifeline: MillionaireLifeline): MillionaireLifelineUsage {
  if (lifeline === "fifty-fifty") return { ...usage, fiftyFifty: true };
  if (lifeline === "stat-sheet") return { ...usage, statSheet: true };
  return { ...usage, doubleDip: true };
}

function assertPlayable(state: MillionaireState) {
  if (state.status !== "playing") throw new Error("Millionaire run is already settled.");
}

function useLifeline(run: MillionaireRun, state: MillionaireState, lifeline: MillionaireLifeline): MillionaireTransitionResult {
  assertPlayable(state);
  const question = currentMillionaireQuestion(run, state);
  if (!question) throw new Error("Millionaire current question is unavailable.");
  if (millionaireLevelNumber(question.level) === 8) throw new Error("Lifelines are disabled on Q8.");
  if (lifelineAlreadyUsed(state.lifelinesUsed, lifeline)) throw new Error(`${lifeline} has already been used.`);

  const compatibility = question.lifelineCompatibility;
  if (lifeline === "fifty-fifty" && !compatibility.fiftyFifty) throw new Error("50/50 is not compatible with this question.");
  if (lifeline === "stat-sheet" && !compatibility.statSheet) throw new Error("Stat Sheet is not compatible with this question.");
  if (lifeline === "double-dip" && !compatibility.doubleDip) throw new Error("Double Dip is not compatible with this question.");

  if (lifeline === "fifty-fifty" && state.questionState.doubleDipActive) {
    throw new Error("50/50 and Double Dip cannot be used on the same question.");
  }
  if (lifeline === "double-dip" && state.questionState.fiftyFiftyApplied) {
    throw new Error("50/50 and Double Dip cannot be used on the same question.");
  }

  const lifelinesUsed = withLifelineUsed(state.lifelinesUsed, lifeline);
  const score = millionaireScoreAfterLifelines(state.baseScore, lifelinesUsed);

  if (lifeline === "fifty-fifty") {
    const removedChoiceIds = [...question.fiftyFifty.removalChoiceIds];
    return {
      state: {
        ...state,
        score,
        lifelinesUsed,
        questionState: {
          ...state.questionState,
          fiftyFiftyApplied: true,
          removedChoiceIds,
        },
      },
      questionReveal: null,
      lifelineReveal: { type: "fifty-fifty", removedChoiceIds },
      answerOutcome: null,
    };
  }

  if (lifeline === "stat-sheet") {
    if (!question.statSheet) throw new Error("Stat Sheet content is unavailable.");
    return {
      state: {
        ...state,
        score,
        lifelinesUsed,
        questionState: {
          ...state.questionState,
          statSheetRevealed: true,
        },
      },
      questionReveal: null,
      lifelineReveal: { type: "stat-sheet", text: question.statSheet },
      answerOutcome: null,
    };
  }

  return {
    state: {
      ...state,
      score,
      lifelinesUsed,
      questionState: {
        ...state.questionState,
        doubleDipActive: true,
      },
    },
    questionReveal: null,
    lifelineReveal: { type: "double-dip" },
    answerOutcome: null,
  };
}

function answer(run: MillionaireRun, state: MillionaireState, choiceId: MillionaireChoiceId): MillionaireTransitionResult {
  assertPlayable(state);
  const question = currentMillionaireQuestion(run, state);
  if (!question) throw new Error("Millionaire current question is unavailable.");
  if (!question.choices.some((choice) => choice.id === choiceId)) throw new Error("Answer choice is unavailable.");
  if (state.questionState.removedChoiceIds.includes(choiceId)) throw new Error("A removed 50/50 choice cannot be submitted.");
  if (state.questionState.doubleDipWrongChoiceIds.includes(choiceId)) throw new Error("A failed Double Dip choice cannot be submitted twice.");

  if (choiceId === question.correctChoiceId) {
    const completedQuestions = state.currentQuestionIndex + 1;
    const currentMoney = question.money;
    const scoring = scoringState(completedQuestions, state.lifelinesUsed);
    const won = completedQuestions === 8;
    return {
      state: {
        ...state,
        status: won ? "won" : "playing",
        currentQuestionIndex: won ? state.currentQuestionIndex : state.currentQuestionIndex + 1,
        completedQuestions,
        currentMoney,
        finalMoney: won ? currentMoney : null,
        ...scoring,
        questionState: won ? state.questionState : freshQuestionState(),
      },
      questionReveal: revealFor(question),
      lifelineReveal: null,
      answerOutcome: "correct",
    };
  }

  if (state.questionState.doubleDipActive && state.questionState.doubleDipWrongChoiceIds.length === 0) {
    return {
      state: {
        ...state,
        questionState: {
          ...state.questionState,
          doubleDipWrongChoiceIds: [choiceId],
        },
      },
      questionReveal: null,
      lifelineReveal: null,
      answerOutcome: "double-dip-continue",
    };
  }

  const finalMoney = millionaireCheckpointMoney(state.completedQuestions);
  const scoring = scoringState(state.completedQuestions, state.lifelinesUsed);
  return {
    state: {
      ...state,
      status: "lost",
      finalMoney,
      ...scoring,
    },
    questionReveal: revealFor(question),
    lifelineReveal: null,
    answerOutcome: "wrong",
  };
}

function walkAway(state: MillionaireState): MillionaireTransitionResult {
  assertPlayable(state);
  if (!millionaireCanWalkAway(state)) throw new Error("Walk away is only available before Q7 or Q8 and not during Double Dip.");
  const scoring = scoringState(state.completedQuestions, state.lifelinesUsed);
  return {
    state: {
      ...state,
      status: "walked-away",
      finalMoney: state.currentMoney,
      ...scoring,
    },
    questionReveal: null,
    lifelineReveal: null,
    answerOutcome: null,
  };
}

export function advanceMillionaireRuntime(
  run: MillionaireRun,
  state: MillionaireState,
  action: MillionaireAction,
): MillionaireTransitionResult {
  if (action.type === "use_lifeline") return useLifeline(run, state, action.lifeline);
  if (action.type === "answer") return answer(run, state, action.choiceId);
  return walkAway(state);
}
