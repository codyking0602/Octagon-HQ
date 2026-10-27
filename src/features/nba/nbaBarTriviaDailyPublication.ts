import type { OfficialDailySetupPublication } from "../play/todaysChallengeRuntime";
import { BAR_TRIVIA_MAX_SCORE, createBarTriviaState, type BarTriviaQuestion } from "../games/barTriviaEngine";
import { BAR_TRIVIA_DAILY_SCORING_VERSION } from "../play/barTriviaDailyRuntime";
import { stableLineupHash } from "../play/lineupModel";
import { buildNbaBarTriviaDailyBoard } from "./nbaBarTriviaDailyRotation";

export const NBA_BAR_TRIVIA_DAILY_CONTENT_VERSION = "nba-bar-trivia-server-v1";

function publicQuestion(question: BarTriviaQuestion) {
  return {
    id: question.id, league: question.league, round: question.round,
    difficulty: question.difficulty, category: question.category,
    prompt: question.prompt, choices: [...question.choices], contentType: question.contentType,
  };
}

export function barTriviaPublication(day: string, scheduleVersion: string, ordinal: number): OfficialDailySetupPublication {
  const { questions, doubleRound } = buildNbaBarTriviaDailyBoard(ordinal, day);
  const initial = createBarTriviaState(doubleRound);
  const proof = `${NBA_BAR_TRIVIA_DAILY_CONTENT_VERSION}:${stableLineupHash(
    [scheduleVersion, day, ordinal, doubleRound, ...questions.map(q => q.id)].join("|"),
  )}`;

  return {
    setupKey: `${NBA_BAR_TRIVIA_DAILY_CONTENT_VERSION}:${scheduleVersion}:${day}:${ordinal}`,
    contentVersion: NBA_BAR_TRIVIA_DAILY_CONTENT_VERSION,
    scoringVersion: BAR_TRIVIA_DAILY_SCORING_VERSION,
    publicSetup: {
      league: "nba",
      question_count: questions.length,
      initial_state: {
        complete: initial.complete, index: initial.index,
        score: initial.score, raw_score: initial.rawScore,
        streak: initial.streak, best_streak: initial.bestStreak,
        correct_count: initial.correctCount, wager: initial.wager,
        double_round: doubleRound, answers: [],
        current_question: questions[0] ? publicQuestion(questions[0]) : null,
        last_result: null, last_question: null,
      },
    },
    revealSetup: {
      league: "nba",
      questions: questions.map(q => ({ ...publicQuestion(q), answer: q.answer, explanation: q.explanation })),
    },
    privateSetupEvidence: { league: "nba", questions, double_round: doubleRound, proof },
    privateGradingEvidence: { league: "nba", proof, max_score: BAR_TRIVIA_MAX_SCORE },
  };
}
