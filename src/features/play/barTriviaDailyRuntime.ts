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
import { footballBarTriviaLeagueForDay, lockedWeightedGameForDay } from "./dailyChallengeRotation";
import { footballThemedBarTriviaRunForDay } from "./footballTeamThemeDailyPacks";
import { footballTriviaFamilyMemberIds } from "./barTriviaFootballConcepts";
import { seededLineupRandom, stableLineupHash } from "./lineupModel";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyRuntimeContext,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const BAR_TRIVIA_DAILY_CONTENT_VERSION = "bar-trivia-daily-v3-six-month-fact-rotation";
export const BAR_TRIVIA_DAILY_SCORING_VERSION = "play-official-score-v1";

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

/**
 * Replay seeded, eligible past Bar Trivia Daily dates to avoid repeating the
 * same question in the next three appearances of its league. No database
 * reads, score changes, or mutation of historical official Daily setups.
 * This replay begins from the original September 29 launch, and uses the
 * current curated bank (legacy published boards stay immutable in storage).
 */
const BAR_TRIVIA_FIRST_DAY = "2026-09-29";
/** Six calendar months of ID AND recognizable fact-family history, per league. */
const BAR_TRIVIA_RECENT_LOOKBACK_DAYS = 184;
const DAY_MS = 86_400_000;

function wasBarTriviaDailyAppearance(league: BarTriviaLeague, day: string): boolean {
  if (league === "mlb") return false;
  if (day === BAR_TRIVIA_FIRST_DAY) return league === "ufc" || league === "nfl";
  if (day < "2026-10-01") return false;
  const sport = league === "ufc" ? "ufc" : "football";
  if (lockedWeightedGameForDay(sport, day) !== "bar_trivia") return false;
  return sport === "ufc" || footballBarTriviaLeagueForDay(day) === league;
}

function dailyBarTriviaRun(
  league: BarTriviaLeague,
  day: string,
  scheduleVersion: string,
): BarTriviaQuestion[] {
  const target = new Date(day + "T12:00:00.000Z").getTime();
  const beginning = new Date(BAR_TRIVIA_FIRST_DAY + "T12:00:00.000Z").getTime();
  const historyIds: Array<{ timestamp: number; ids: string[] }> = [];
  let latest: BarTriviaQuestion[] = [];

  // Historical/MLB previews do not participate in the NFL/CFB/UFC Daily cadence.
  const first = league === "mlb" || !Number.isFinite(target) || target < beginning
    ? target : beginning;

  for (let timestamp = first; timestamp <= target; timestamp += DAY_MS) {
    const candidateDay = new Date(timestamp).toISOString().slice(0, 10);
    if (candidateDay !== day && !wasBarTriviaDailyAppearance(league, candidateDay)) continue;
    const recentIds = historyIds
      .filter((entry) => timestamp - entry.timestamp <= BAR_TRIVIA_RECENT_LOOKBACK_DAYS * DAY_MS)
      .flatMap((entry) => entry.ids.flatMap(footballTriviaFamilyMemberIds));
    const themed = league === "nfl" ? footballThemedBarTriviaRunForDay(candidateDay) : null;
    const run = themed
      ? [...themed]
      : buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, league, {
          random: seededLineupRandom(
            BAR_TRIVIA_DAILY_CONTENT_VERSION, league, scheduleVersion, candidateDay, "questions",
          ),
          now: candidateDay + "T12:00:00.000Z",
          recentQuestionIds: recentIds,
        });
    latest = run;
    historyIds.unshift({ timestamp, ids: run.map((question) => question.id) });
    while (historyIds.length && timestamp - historyIds[historyIds.length - 1]!.timestamp > BAR_TRIVIA_RECENT_LOOKBACK_DAYS * DAY_MS) {
      historyIds.pop();
    }
  }

  if (latest.length !== 10) throw new Error("The Bar Trivia Daily lineup is unavailable.");
  return latest;
}

export function buildBarTriviaDailySetup(
  league: BarTriviaLeague,
  day: string,
  scheduleVersion: string,
): OfficialDailySetupPublication {
  const run = dailyBarTriviaRun(league, day, scheduleVersion);
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
