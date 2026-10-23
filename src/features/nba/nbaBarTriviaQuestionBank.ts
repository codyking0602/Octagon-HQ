import type { BarTriviaQuestion } from "../games/barTriviaEngine";
import { NBA_BAR_TRIVIA_EASY } from "./nbaBarTriviaEasy";
import { NBA_BAR_TRIVIA_EASY_SUPPLEMENT } from "./nbaBarTriviaEasySupplement";
import { NBA_BAR_TRIVIA_EASY_CULTURE } from "./nbaBarTriviaEasyCulture";
import { NBA_BAR_TRIVIA_MEDIUM } from "./nbaBarTriviaMedium";
import { NBA_BAR_TRIVIA_MEDIUM_SUPPLEMENT } from "./nbaBarTriviaMediumSupplement";
import { NBA_BAR_TRIVIA_HARD } from "./nbaBarTriviaHard";
import { NBA_BAR_TRIVIA_LAST_CALL } from "./nbaBarTriviaLastCall";
import { NBA_BAR_TRIVIA_LAST_CALL_SUPPLEMENT } from "./nbaBarTriviaLastCallSupplement";
import { NBA_BAR_TRIVIA_RETIRED_IDS } from "./nbaBarTriviaRetirements";

/**
 * NBA-only Bar Trivia editorial bank for deterministic Daily publication.
 * No Casual questions, browser-local question history, or official results.
 * Excluded source rows remain visible in the authored source files for review.
 */
const authored: readonly BarTriviaQuestion[] = [
  ...NBA_BAR_TRIVIA_EASY,
  ...NBA_BAR_TRIVIA_EASY_SUPPLEMENT,
  ...NBA_BAR_TRIVIA_EASY_CULTURE,
  ...NBA_BAR_TRIVIA_MEDIUM,
  ...NBA_BAR_TRIVIA_MEDIUM_SUPPLEMENT,
  ...NBA_BAR_TRIVIA_HARD,
  ...NBA_BAR_TRIVIA_LAST_CALL,
  ...NBA_BAR_TRIVIA_LAST_CALL_SUPPLEMENT,
];

export const NBA_BAR_TRIVIA_QUESTION_BANK: readonly BarTriviaQuestion[] =
  authored.filter((question) => !NBA_BAR_TRIVIA_RETIRED_IDS.has(question.id));
