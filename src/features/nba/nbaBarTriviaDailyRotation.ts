import {
  BAR_TRIVIA_ROUND_SLOTS,
  buildBarTriviaRun,
  pickBarTriviaDoubleRound,
  type BarTriviaQuestion,
  type BarTriviaDoubleRound,
} from "../games/barTriviaEngine";
import { seededLineupRandom } from "../play/lineupModel";
import { NBA_BAR_TRIVIA_QUESTION_BANK } from "./nbaBarTriviaQuestionBank";

/**
 * Zero-based NBA Bar Trivia appearance ordinal (not the calendar day).
 * Publisher integration will supply this from the NBA Daily schedule after
 * owner approval; preview does not write official attempts or score.
 *
 * Curated inventory currently guarantees 11 complete appearances without
 * reusing a question. Do not inflate this value without new reviewed content.
 */
export const NBA_BAR_TRIVIA_UNIQUE_APPEARANCES = 11;

export interface NbaBarTriviaDailyBoard {
  questions: readonly BarTriviaQuestion[];
  doubleRound: BarTriviaDoubleRound;
}

const cycles = new Map<number, readonly NbaBarTriviaDailyBoard[]>();

function buildCycle(cycle: number): readonly NbaBarTriviaDailyBoard[] {
  const used = new Set<string>();
  const result: NbaBarTriviaDailyBoard[] = [];
  for (let slot = 0; slot < NBA_BAR_TRIVIA_UNIQUE_APPEARANCES; slot += 1) {
    const random = seededLineupRandom("nba-bar-trivia-daily-preview-v1", String(cycle), String(slot), "questions");
    const questions = buildBarTriviaRun(NBA_BAR_TRIVIA_QUESTION_BANK, "nba", {
      random,
      recentQuestionIds: [...used],
      currentEventTarget: 0,
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

export function buildNbaBarTriviaDailyBoard(appearanceIndex: number): NbaBarTriviaDailyBoard {
  if (!Number.isSafeInteger(appearanceIndex) || appearanceIndex < 0) {
    throw new Error("NBA Bar Trivia appearance index must be a nonnegative integer.");
  }
  const cycle = Math.floor(appearanceIndex / NBA_BAR_TRIVIA_UNIQUE_APPEARANCES);
  let boards = cycles.get(cycle);
  if (!boards) {
    boards = buildCycle(cycle);
    cycles.set(cycle, boards);
  }
  return boards[appearanceIndex % NBA_BAR_TRIVIA_UNIQUE_APPEARANCES]!;
}
