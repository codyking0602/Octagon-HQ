import type { OfficialDailySetupPublication } from "../play/todaysChallengeRuntime";
import { buildAverageFanDailySetup } from "../play/averageFanDailyRuntime";
import { buildFamilyFeudDailySetup } from "../play/familyFeudDailyRuntime";
import { BAR_TRIVIA_MAX_SCORE, createBarTriviaState, type BarTriviaQuestion } from "../games/barTriviaEngine";
import { BAR_TRIVIA_DAILY_SCORING_VERSION } from "../play/barTriviaDailyRuntime";
import { stableLineupHash } from "../play/lineupModel";
import {
  NBA_DAILY_WEIGHTED_CYCLE, nbaRegularSeasonDaily, type NbaDailyGame,
} from "./nbaDailySchedule";
import { buildNbaSportsFeudDailyPack } from "./nbaSportsFeudDailyRotation";
import { buildNbaBarTriviaDailyBoard } from "./nbaBarTriviaDailyRotation";
import { buildNbaOfficialMillionaireRun } from "./nbaMillionaireDailyRotation";
import { buildNbaMillionaireDailySetup } from "../play/millionaireDailyRuntime";
import { buildNbaWhoAmIOfficialRounds } from "./nbaWhoAmIDailyRotation";
import { buildTwoRoundWhoAmIDailyPublication } from "../play/whoAmITwoRoundDailyRuntime";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "../play/officialScoreContract";
import { buildNbaFindLeaderDailyPublication } from "./nbaFindLeaderDailyPublication";
import { buildNbaWavelengthDailyPublication } from "./nbaWavelengthDailyPublication";
import { buildNbaHitNumberDailyPublication } from "./nbaHitNumberDailyPublication";
import { buildNbaHigherLowerDailyPublication } from "./nbaHigherLowerDailyPublication";

/**
 * Publication-only foundation using the existing canonical server graders.
 * None of these publications is accessible to clients until the NBA
 * authenticated Daily runtime and the remaining six games are wired.
 */
export const NBA_SERVER_READY_GAME_TYPES = [
  "average_fan", "sports_feud", "bar_trivia", "millionaire", "who_am_i", "find_leader", "wavelength", "hit_the_number", "higher_lower",
] as const satisfies readonly NbaDailyGame[];

export const NBA_BAR_TRIVIA_DAILY_CONTENT_VERSION = "nba-bar-trivia-server-v1";

/** Zero-based appearance of a single game on a scheduled publication date. */
export function nbaDailyGameAppearance(day: string, gameType: NbaDailyGame): number {
  const slot = nbaRegularSeasonDaily(day);
  if (!slot || !slot.isPublicationDay || slot.gameType !== gameType) {
    throw new Error("NBA Daily publication must match its scheduled Central day and game.");
  }
  let count = 0;
  for (let index = 0; index < slot.appearanceIndex; index++) {
    if (NBA_DAILY_WEIGHTED_CYCLE[index % NBA_DAILY_WEIGHTED_CYCLE.length] === gameType) count++;
  }
  return count;
}

function publicQuestion(question: BarTriviaQuestion) {
  return {
    id: question.id, league: question.league, round: question.round,
    difficulty: question.difficulty, category: question.category,
    prompt: question.prompt, choices: [...question.choices], contentType: question.contentType,
  };
}

function barTriviaPublication(day: string, scheduleVersion: string, ordinal: number): OfficialDailySetupPublication {
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

export function buildNbaServerDailyPublication(
  day: string,
  scheduleVersion: string,
  gameType: (typeof NBA_SERVER_READY_GAME_TYPES)[number],
  publicationHistory?: unknown,
) {
  if (!scheduleVersion.trim()) throw new Error("NBA Daily schedule version is required.");
  const ordinal = nbaDailyGameAppearance(day, gameType);
  const publication = gameType === "higher_lower"
    ? buildNbaHigherLowerDailyPublication(day, scheduleVersion, ordinal)
    : gameType === "hit_the_number"
      ? buildNbaHitNumberDailyPublication(day, scheduleVersion, ordinal)
    : gameType === "wavelength"
      ? buildNbaWavelengthDailyPublication(day, scheduleVersion, ordinal)
    : gameType === "find_leader"
    ? buildNbaFindLeaderDailyPublication(day, scheduleVersion, ordinal)
    : gameType === "who_am_i"
    ? buildTwoRoundWhoAmIDailyPublication(
        buildNbaWhoAmIOfficialRounds(ordinal),
        day, scheduleVersion, "nba-official-daily-v1", OFFICIAL_SCORE_CONTRACT_VERSION,
      )
    : gameType === "millionaire"
    ? buildNbaMillionaireDailySetup(day, scheduleVersion, ordinal, buildNbaOfficialMillionaireRun(ordinal))
    : gameType === "average_fan"
    ? buildAverageFanDailySetup("nba", day, scheduleVersion, publicationHistory)
    : gameType === "sports_feud"
      ? buildFamilyFeudDailySetup(buildNbaSportsFeudDailyPack(ordinal), day, scheduleVersion)
      : barTriviaPublication(day, scheduleVersion, ordinal);
  return { ...publication, gameType, scheduleVersion };
}
