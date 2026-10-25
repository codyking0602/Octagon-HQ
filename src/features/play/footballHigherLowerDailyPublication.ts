import {
  createFootballHigherLowerBoard,
  FOOTBALL_HIGHER_LOWER_QUESTION_COUNT,
  type FootballHigherLowerQuestion,
} from "../back-room/footballHigherLowerModel";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "./officialScoreContract";
import type { OfficialDailySetupPublication } from "./todaysChallengeRuntime";

export const FOOTBALL_HIGHER_LOWER_DAILY_CONTENT_VERSION = "football-higher-lower-official-v1";

/** Preserve the semantic matchup across a higher/lower flip. */
export function footballHigherLowerComparisonKey(questionId: string) {
  return questionId.replace(/:(?:higher|lower)$/, "");
}

export interface FootballHigherLowerDailyHistoryRow {
  day: string;
  question_ids: string[];
}

export function footballHigherLowerPublicQuestion(question: FootballHigherLowerQuestion) {
  const { answer: _answer, hidden, ...safe } = question;
  const { value: _value, formattedValue: _formattedValue, ...publicHidden } = hidden;
  return { ...safe, hidden: publicHidden };
}

export function buildFootballHigherLowerDailyPublication(
  day: string,
  scheduleVersion: string,
  history: unknown = [],
): OfficialDailySetupPublication {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !scheduleVersion.trim()) {
    throw new Error("Football Higher or Lower requires a valid Central day and schedule version.");
  }
  if (!Array.isArray(history)) throw new Error("Football Higher or Lower history is unavailable.");
  const excluded = new Set<string>();
  for (const row of history as FootballHigherLowerDailyHistoryRow[]) {
    if (!row || typeof row.day !== "string" || !Array.isArray(row.question_ids)
      || row.question_ids.some(id => typeof id !== "string")) {
      throw new Error("Football Higher or Lower published history is invalid.");
    }
    for (const id of row.question_ids) excluded.add(footballHigherLowerComparisonKey(id));
  }
  const seed = [
    FOOTBALL_HIGHER_LOWER_DAILY_CONTENT_VERSION, scheduleVersion, day, "mixed-nfl-cfb",
  ].join("|");
  const board = createFootballHigherLowerBoard(seed, "MIXED", excluded);
  if (board.questions.length !== FOOTBALL_HIGHER_LOWER_QUESTION_COUNT) {
    throw new Error("Football Higher or Lower needs ten verified comparisons.");
  }
  if (board.questions.some(question => excluded.has(footballHigherLowerComparisonKey(question.id)))) {
    throw new Error("Football Higher or Lower repeated an official Daily matchup.");
  }
  return {
    setupKey: FOOTBALL_HIGHER_LOWER_DAILY_CONTENT_VERSION + ":" + scheduleVersion + ":" + day,
    contentVersion: FOOTBALL_HIGHER_LOWER_DAILY_CONTENT_VERSION,
    scoringVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: FOOTBALL_HIGHER_LOWER_DAILY_CONTENT_VERSION,
      league: "MIXED",
      question_count: FOOTBALL_HIGHER_LOWER_QUESTION_COUNT,
      initial_state: {
        complete: false,
        index: 0,
        correct_count: 0,
        answers: [],
        current_question: footballHigherLowerPublicQuestion(board.questions[0]!),
        last_result: null,
      },
    },
    revealSetup: {
      questions: board.questions.map(question => ({
        id: question.id, answer: question.answer,
        metricLabel: question.metricLabel, known: question.known, hidden: question.hidden,
      })),
    },
    privateSetupEvidence: { board },
    privateGradingEvidence: {
      question_ids: board.questions.map(question => question.id),
      correct_choices: board.questions.map(question => question.answer),
    },
  };
}
