import type { FactCheckItem } from "../games/factCheckEngine";

const ACTIVE_FROM = "2026-09-27";
const EXPIRES_AFTER = "2026-10-03";
const SOURCE_ID = "ncaa-ap-poll-through-2026-09-26";

function weekly(
  value: Omit<FactCheckItem, "sport" | "recency" | "activeFrom" | "expiresAfter" | "sourceId">,
): FactCheckItem {
  return {
    sport: "football",
    recency: "weekly",
    activeFrom: ACTIVE_FROM,
    expiresAfter: EXPIRES_AFTER,
    sourceId: SOURCE_ID,
    ...value,
  };
}

/**
 * Weekly editorial batch for games through Sept. 26, 2026.
 * Source: NCAA-hosted AP Top 25 table, published Sept. 27, with records and prior ranks.
 * These expire after the next full football week so stale current-event facts never become evergreen.
 */
export const FOOTBALL_FACT_CHECK_WEEKLY_BANK: readonly FactCheckItem[] = [
  weekly({
    id: "weekly-2026-09-27-texas-4-0",
    league: "cfb",
    format: "true_false",
    difficulty: 1,
    prompt: "Texas is 4-0 after its Sept. 26 win at Tennessee.",
    choices: ["TRUE", "FALSE"],
    answer: "TRUE",
    explanation: "True — Texas moved to 4-0 and remained No. 1 in the AP poll.",
  }),
  weekly({
    id: "weekly-2026-09-27-ole-miss-unbeaten",
    league: "cfb",
    format: "true_false",
    difficulty: 1,
    prompt: "Ole Miss is still unbeaten after the Sept. 26 games.",
    choices: ["TRUE", "FALSE"],
    answer: "FALSE",
    explanation: "False — Ole Miss is 3-1 after losing at Florida.",
  }),
  weekly({
    id: "weekly-2026-09-27-florida-top-ten",
    league: "cfb",
    format: "either_or",
    difficulty: 1,
    prompt: "Where is Florida in the new AP poll?",
    choices: ["TOP 10", "OUTSIDE TOP 10"],
    answer: "TOP 10",
    explanation: "Florida jumped to No. 8 after beating Ole Miss.",
  }),
  weekly({
    id: "weekly-2026-09-27-mississippi-state-4-0",
    league: "cfb",
    format: "true_false",
    difficulty: 1,
    prompt: "Mississippi State is 4-0 after the Sept. 26 games.",
    choices: ["TRUE", "FALSE"],
    answer: "TRUE",
    explanation: "True — Mississippi State is 4-0 and moved into the AP poll at No. 16.",
  }),
  weekly({
    id: "weekly-2026-09-27-alabama-4-0",
    league: "cfb",
    format: "true_false",
    difficulty: 1,
    prompt: "Alabama is 4-0 after the Sept. 26 games.",
    choices: ["TRUE", "FALSE"],
    answer: "TRUE",
    explanation: "True — Alabama is 4-0 and ranked No. 7.",
  }),
  weekly({
    id: "weekly-2026-09-27-ohio-state-unbeaten",
    league: "cfb",
    format: "true_false",
    difficulty: 1,
    prompt: "Ohio State is still unbeaten after the Sept. 26 games.",
    choices: ["TRUE", "FALSE"],
    answer: "FALSE",
    explanation: "False — Ohio State is 3-1 in the new AP poll.",
  }),
  weekly({
    id: "weekly-2026-09-27-notre-dame-4-0",
    league: "cfb",
    format: "either_or",
    difficulty: 1,
    prompt: "Notre Dame's record after Sept. 26 is...",
    choices: ["4-0", "3-1"],
    answer: "4-0",
    explanation: "Notre Dame is 4-0 and ranked No. 3.",
  }),
  weekly({
    id: "weekly-2026-09-27-oregon-top-ten",
    league: "cfb",
    format: "either_or",
    difficulty: 2,
    prompt: "Oregon is currently...",
    choices: ["TOP 10", "OUTSIDE TOP 10"],
    answer: "OUTSIDE TOP 10",
    explanation: "Oregon is No. 15 in the AP poll through games of Sept. 26.",
  }),
  weekly({
    id: "weekly-2026-09-27-byu-undefeated",
    league: "cfb",
    format: "true_false",
    difficulty: 1,
    prompt: "BYU is unbeaten in the new AP poll.",
    choices: ["TRUE", "FALSE"],
    answer: "TRUE",
    explanation: "True — BYU is 3-0 and ranked No. 10.",
  }),
  weekly({
    id: "weekly-2026-09-27-lsu-one-loss",
    league: "cfb",
    format: "either_or",
    difficulty: 2,
    prompt: "How many losses does LSU have through Sept. 26?",
    choices: ["ZERO", "ONE"],
    answer: "ONE",
    explanation: "LSU is 3-1 and ranked No. 11.",
  }),
  weekly({
    id: "weekly-2026-09-27-florida-vs-ole-miss-rank",
    league: "cfb",
    format: "either_or",
    difficulty: 2,
    prompt: "Who is ranked higher in the new AP poll?",
    choices: ["FLORIDA", "OLE MISS"],
    answer: "FLORIDA",
    explanation: "Florida is No. 8; Ole Miss is No. 9.",
  }),
  weekly({
    id: "weekly-2026-09-27-msu-vs-tennessee-rank",
    league: "cfb",
    format: "either_or",
    difficulty: 2,
    prompt: "Who is ranked higher in the new AP poll?",
    choices: ["MISSISSIPPI STATE", "TENNESSEE"],
    answer: "MISSISSIPPI STATE",
    explanation: "Mississippi State is No. 16; Tennessee is No. 17.",
  }),
  weekly({
    id: "weekly-2026-09-27-texas-vs-georgia-rank",
    league: "cfb",
    format: "either_or",
    difficulty: 1,
    prompt: "Who is No. 1 in the new AP poll?",
    choices: ["TEXAS", "GEORGIA"],
    answer: "TEXAS",
    explanation: "Texas is No. 1; Georgia is No. 2.",
  }),
  weekly({
    id: "weekly-2026-09-27-florida-jump",
    league: "cfb",
    format: "over_under",
    difficulty: 2,
    prompt: "Florida moved ___ 10 spots in the AP poll after beating Ole Miss.",
    choices: ["OVER", "UNDER"],
    answer: "OVER",
    explanation: "Florida jumped 13 spots, from No. 21 to No. 8.",
  }),
];
