import {
  BAR_TRIVIA_MAX_SCORE,
  buildBarTriviaRun,
  createBarTriviaState,
  pickBarTriviaDoubleRound,
  setBarTriviaWager,
  submitBarTriviaAnswer,
  type BarTriviaAnswerResult,
  type BarTriviaLeague,
  type BarTriviaQuestion,
  type BarTriviaState,
} from "../games/barTriviaEngine";
import { BAR_TRIVIA_QUESTION_BANK } from "./barTriviaQuestionBank";
import { seededLineupRandom, stableLineupHash } from "./lineupModel";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyRuntimeContext,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const BAR_TRIVIA_DAILY_CONTENT_VERSION = "bar-trivia-daily-v1";
export const BAR_TRIVIA_DAILY_SCORING_VERSION = "bar-trivia-daily-score-v1";

type JsonRecord = Record<string, unknown>;

function publicQuestion(question: BarTriviaQuestion) {
  return {
    id: question.id,
    league: question.league,
    round: question.round,
    difficulty: question.difficulty,
    category: question.category,
    prompt: question.prompt,
    choices: [...question.choices],
    contentType: question.contentType,
  };
}

function revealedQuestion(question: BarTriviaQuestion) {
  return {
    ...publicQuestion(question),
    answer: question.answer,
    explanation: question.explanation,
  };
}

function stateFromPublic(value: JsonRecord): BarTriviaState {
  const doubleRound = value.double_round;
  if (doubleRound !== "round1" && doubleRound !== "round2" && doubleRound !== "round3") {
    throw new Error("Bar Trivia Double Round evidence is invalid.");
  }
  const answers = Array.isArray(value.answers)
    ? value.answers.filter((row): row is BarTriviaAnswerResult => Boolean(row) && typeof row === "object")
    : [];
  return {
    index: Number(value.index ?? 0),
    score: Number(value.score ?? 0),
    rawScore: Number(value.raw_score ?? 0),
    streak: Number(value.streak ?? 0),
    bestStreak: Number(value.best_streak ?? 0),
    correctCount: Number(value.correct_count ?? 0),
    wager: value.wager == null ? null : Number(value.wager),
    doubleRound,
    answers,
    complete: value.complete === true,
  };
}

function publicState(
  run: readonly BarTriviaQuestion[],
  state: BarTriviaState,
  lastResult: BarTriviaAnswerResult | null = null,
) {
  const lastQuestion = lastResult ? run[Math.max(0, state.index - 1)] ?? null : null;
  const currentQuestion = state.complete ? null : run[state.index] ?? null;
  return {
    complete: state.complete,
    index: state.index,
    score: state.score,
    raw_score: state.rawScore,
    streak: state.streak,
    best_streak: state.bestStreak,
    correct_count: state.correctCount,
    wager: state.wager,
    double_round: state.doubleRound,
    answers: state.answers.map((answer) => ({ ...answer })),
    current_question: currentQuestion ? publicQuestion(currentQuestion) : null,
    last_result: lastResult ? { ...lastResult } : null,
    last_question: lastQuestion ? revealedQuestion(lastQuestion) : null,
  };
}

function fullRun(value: unknown): BarTriviaQuestion[] {
  if (!Array.isArray(value) || value.length !== 10) {
    throw new Error("Bar Trivia official question run is unavailable.");
  }
  return value.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      throw new Error("Bar Trivia official question evidence is invalid.");
    }
    return row as BarTriviaQuestion;
  });
}

export function buildBarTriviaDailySetup(
  league: BarTriviaLeague,
  day: string,
  scheduleVersion: string,
): OfficialDailySetupPublication {
  const random = seededLineupRandom(
    BAR_TRIVIA_DAILY_CONTENT_VERSION,
    league,
    scheduleVersion,
    day,
    "questions",
  );
  const run = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, league, {
    random,
    now: `${day}T12:00:00.000Z`,
  });
  const doubleRound = pickBarTriviaDoubleRound(seededLineupRandom(
    BAR_TRIVIA_DAILY_CONTENT_VERSION,
    league,
    scheduleVersion,
    day,
    "double-round",
  ));
  const initial = createBarTriviaState(doubleRound);
  const proof = `${BAR_TRIVIA_DAILY_CONTENT_VERSION}:${stableLineupHash(
    `${league}|${scheduleVersion}|${day}|${run.map((question) => question.id).join("|")}|${doubleRound}`,
  )}`;

  return {
    setupKey: `${BAR_TRIVIA_DAILY_CONTENT_VERSION}:${scheduleVersion}:${day}:${league}`,
    contentVersion: BAR_TRIVIA_DAILY_CONTENT_VERSION,
    scoringVersion: BAR_TRIVIA_DAILY_SCORING_VERSION as OfficialDailySetupPublication["scoringVersion"],
    publicSetup: {
      league,
      question_count: run.length,
      initial_state: publicState(run, initial),
    },
    revealSetup: {
      league,
      questions: run.map(revealedQuestion),
    },
    privateSetupEvidence: {
      league,
      questions: run,
      double_round: doubleRound,
      proof,
    },
    privateGradingEvidence: {
      league,
      proof,
      max_score: BAR_TRIVIA_MAX_SCORE,
    },
  };
}

export function advanceBarTriviaDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: JsonRecord,
): OfficialDailyAdvanceResult {
  const run = fullRun(context.privateSetupEvidence.questions);
  const state = stateFromPublic(context.publicState);
  if (state.complete) throw new Error("The official Bar Trivia run is already complete.");

  if (action.wager != null) {
    const wager = Number(action.wager);
    if (!Number.isFinite(wager)) throw new Error("Bar Trivia wager is invalid.");
    const next = setBarTriviaWager(state, wager);
    if (next === state || next.wager == null) throw new Error("Bar Trivia wager is not available yet.");
    return {
      submissionState: { final_submission: null },
      publicState: publicState(run, next),
      complete: false,
      finalSubmission: null,
    };
  }

  const choice = String(action.choice ?? "");
  if (!choice) throw new Error("Bar Trivia answer choice is required.");
  const transition = submitBarTriviaAnswer(run, state, choice);
  const finalSubmission = transition.state.complete
    ? {
        proof: String(context.privateSetupEvidence.proof ?? ""),
        native_score: transition.state.score,
        normalized_score: transition.state.score,
        correct_count: transition.state.correctCount,
        best_streak: transition.state.bestStreak,
        double_round: transition.state.doubleRound,
        wager: transition.state.wager ?? 0,
      }
    : null;

  return {
    submissionState: { final_submission: finalSubmission },
    publicState: publicState(run, transition.state, transition.result),
    complete: transition.state.complete,
    finalSubmission,
  };
}
