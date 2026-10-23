import {
  BAR_TRIVIA_ROUND_SLOTS,
  buildBarTriviaRun,
  pickBarTriviaDoubleRound,
  type BarTriviaQuestion,
  type BarTriviaDoubleRound,
} from "../games/barTriviaEngine";
import { seededLineupRandom } from "../play/lineupModel";
import { NBA_BAR_TRIVIA_QUESTION_BANK } from "./nbaBarTriviaQuestionBank";
import { NBA_BAR_TRIVIA_CURRENT_EVENTS } from "./nbaBarTriviaCurrentEvents";

/**
 * Zero-based NBA Bar Trivia appearance ordinal (not the calendar day).
 * Publisher integration will supply this from the NBA Daily schedule after
 * owner approval; preview does not write official attempts or score.
 *
 * Curated inventory guarantees 20 complete appearances without
 * reusing a question. Verified news is optional and expires automatically. Do not inflate this value without new reviewed content.
 */
export const NBA_BAR_TRIVIA_UNIQUE_APPEARANCES = 20;

export interface NbaBarTriviaDailyBoard {
  questions: readonly BarTriviaQuestion[];
  doubleRound: BarTriviaDoubleRound;
}

const cycles = new Map<string, readonly NbaBarTriviaDailyBoard[]>();

/** Assess calendar date-only publications at midday, not UTC midnight. */
function toPublicationTime(asOf: Date | string): Date {
  const date = typeof asOf === "string" && /^\d{4}-\d{2}-\d{2}$/.test(asOf)
    ? new Date(asOf + "T18:00:00.000Z")
    : new Date(asOf);
  if (!Number.isFinite(date.getTime())) throw new Error("NBA Bar Trivia publication time is invalid.");
  return date;
}


function buildCycle(cycle: number, asOf: Date): readonly NbaBarTriviaDailyBoard[] {
  const used = new Set<string>();
  const result: NbaBarTriviaDailyBoard[] = [];
  for (let slot = 0; slot < NBA_BAR_TRIVIA_UNIQUE_APPEARANCES; slot += 1) {
    const random = seededLineupRandom("nba-bar-trivia-daily-preview-v2-200", String(cycle), String(slot), "questions");
    const questions = buildBarTriviaRun([...NBA_BAR_TRIVIA_QUESTION_BANK, ...NBA_BAR_TRIVIA_CURRENT_EVENTS], "nba", {
      random,
      recentQuestionIds: [...used],
      now: asOf,
      // At most two verified, unexpired current events; evergreen fills the rest.
      currentEventTarget: 2,
    });
    for (const [index, question] of questions.entries()) {
      if (question.round !== BAR_TRIVIA_ROUND_SLOTS[index]) {
        throw new Error("NBA Bar Trivia round distribution was changed.");
      }
      if (used.has(question.id)) {
        throw new Error("NBA Bar Trivia exhausted its curated no-repeat question supply.");
      }
      used.add(question.id);
    }
    result.push({
      questions,
      doubleRound: pickBarTriviaDoubleRound(
        seededLineupRandom("nba-bar-trivia-daily-preview-v1", String(cycle), String(slot), "double-round"),
      ),
    });
  }
  return result;
}

export function buildNbaBarTriviaDailyBoard(
  appearanceIndex: number,
  asOf: Date | string = new Date(),
): NbaBarTriviaDailyBoard {
  if (!Number.isSafeInteger(appearanceIndex) || appearanceIndex < 0) {
    throw new Error("NBA Bar Trivia appearance index must be a nonnegative integer.");
  }
  const cycle = Math.floor(appearanceIndex / NBA_BAR_TRIVIA_UNIQUE_APPEARANCES);
  const publicationTime = toPublicationTime(asOf);
  // Date and cycle both matter: a stale story can never remain in cached boards.
  const cacheKey = `${cycle}:${publicationTime.toISOString().slice(0, 10)}`;
  let boards = cycles.get(cacheKey);
  if (!boards) {
    boards = buildCycle(cycle, publicationTime);
    cycles.set(cacheKey, boards);
  }
  return boards[appearanceIndex % NBA_BAR_TRIVIA_UNIQUE_APPEARANCES]!;
}
