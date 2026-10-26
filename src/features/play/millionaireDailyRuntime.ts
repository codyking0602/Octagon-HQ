import { millionaireDailyPublicState } from "./millionaireDailyAdvance";
export { advanceMillionaireDailyRuntime } from "./millionaireDailyAdvance";
import {
  assertMillionaireRun,
  createMillionaireState,
  type MillionaireRun,
} from "../games/millionaireEngine";
import {
  MILLIONAIRE_CHOICE_IDS,
  millionairePublicQuestion,
  type MillionaireRuntimeQuestion,
} from "../games/millionaireAuthority";
import {
  MILLIONAIRE_TIME_BANK_MS,
  type MillionaireLeague,
} from "./MillionaireCasualModel";
import {
  MILLIONAIRE_DAILY_RUN_COUNT,
  MILLIONAIRE_FUTURE_EDITORIAL_RUN_COUNT,
  millionaireDailyRun,
  millionaireFutureEditorialDailyRun,
} from "./millionaireDailyQuestionBank";
import { footballThemedMillionaireRunForDay } from "./footballTeamThemeDailyPacks";
import { MILLIONAIRE_FUTURE_TARGETED_REWRITES } from "./millionaireEditorialFutureErrata";
import type { OfficialDailySetupPublication } from "./todaysChallengeRuntime";
import {
  FOOTBALL_FUTURE_WEIGHTED_CYCLE,
  UFC_FUTURE_WEIGHTED_CYCLE,
  FOOTBALL_APPROVED_WEIGHTED_CYCLE,
  UFC_APPROVED_WEIGHTED_CYCLE,
  FOOTBALL_TWO_GAME_CUTOVER_DAY,
  UFC_TWO_GAME_CUTOVER_DAY,
  THREE_SPORT_CADENCE_CUTOVER_DAY,
  isUfcPublicationDay,
  lockedWeightedGameForDay,
} from "./dailyChallengeRotation";

export const MILLIONAIRE_DAILY_CONTENT_VERSION = "millionaire-daily-v5-finish-board" as const;
/** Staged candidates only; not an approved or deployed content version. */
export const MILLIONAIRE_FUTURE_EDITORIAL_CONTENT_VERSION = "millionaire-daily-v6-editorial-candidates" as const;
export const MILLIONAIRE_FUTURE_EDITORIAL_CUTOVER = "2026-10-27" as const;
export const MILLIONAIRE_DAILY_SCORING_VERSION = "play-official-score-v1" as const;
export const MILLIONAIRE_DAILY_ANCHOR = "2026-09-19" as const;
export const FOOTBALL_MILLIONAIRE_DAILY_ANCHOR = MILLIONAIRE_DAILY_ANCHOR;
const MILLIONAIRE_ANSWER_POSITION_PATTERN = [0, 1, 2, 3, 1, 2, 3, 0] as const;

function balanceRun(run: MillionaireRun, runIndex: number): MillionaireRun {
  return run.map((question, questionIndex) => {
    const answer = question.choices.find((choice) => choice.id === question.correctChoiceId)!;
    const slot = (MILLIONAIRE_ANSWER_POSITION_PATTERN[questionIndex]! + runIndex) % 4;
    const others = question.choices.filter((choice) => choice.id !== question.correctChoiceId);
    let otherIndex = 0;
    const choices = MILLIONAIRE_CHOICE_IDS.map((id, index) => ({
      id,
      text: index === slot ? answer.text : others[otherIndex++]!.text,
    })) as unknown as MillionaireRuntimeQuestion["choices"];
    const correctChoiceId = MILLIONAIRE_CHOICE_IDS[slot]!;
    const second = MILLIONAIRE_CHOICE_IDS[(slot + 1) % 4]!;
    const removalChoiceIds = MILLIONAIRE_CHOICE_IDS.filter(
      (id) => id !== correctChoiceId && id !== second,
    );

    return {
      ...question,
      choices,
      correctChoiceId,
      fiftyFifty: {
        survivorChoiceIds: [correctChoiceId, second],
        removalChoiceIds: [removalChoiceIds[0]!, removalChoiceIds[1]!],
      },
    };
  }) as unknown as MillionaireRun;
}

const WEIGHTED_DAILY_CUTOVER = "2026-09-24";
const BAR_TRIVIA_WEIGHTED_CUTOVER = "2026-09-29";
const AVERAGE_FAN_WEIGHTED_CUTOVER = "2026-10-01";
const PRE_WEIGHTED_MILLIONAIRE_APPEARANCES = 1;
const PRE_BAR_TRIVIA_WEIGHTED_MILLIONAIRE_APPEARANCES = 2;
const PRE_AVERAGE_FAN_WEIGHTED_MILLIONAIRE_APPEARANCES = 2;

const FOOTBALL_MILLIONAIRE_LEGACY_CYCLE_LENGTH = 22;
const FOOTBALL_MILLIONAIRE_LEGACY_SLOTS = [0, 7, 13, 19] as const;
const FOOTBALL_MILLIONAIRE_CYCLE_LENGTH = 26;
const FOOTBALL_MILLIONAIRE_SLOTS = [0, 5, 11, 16, 21] as const;
const FOOTBALL_BAR_TRIVIA_CYCLE_LENGTH = 22;
const FOOTBALL_BAR_TRIVIA_MILLIONAIRE_SLOTS = [4, 10, 16, 20] as const;
const FOOTBALL_AVERAGE_FAN_CYCLE_LENGTH = 27;
const FOOTBALL_AVERAGE_FAN_MILLIONAIRE_SLOTS = [2, 6, 9, 25] as const;

const UFC_MILLIONAIRE_LEGACY_CYCLE_LENGTH = 26;
const UFC_MILLIONAIRE_LEGACY_SLOTS = [0, 8, 15, 23] as const;
const UFC_MILLIONAIRE_CYCLE_LENGTH = 30;
const UFC_MILLIONAIRE_SLOTS = [2, 7, 13, 20, 27] as const;
const UFC_BAR_TRIVIA_CYCLE_LENGTH = 24;
const UFC_BAR_TRIVIA_MILLIONAIRE_SLOTS = [3, 11, 17, 23] as const;
const UFC_AVERAGE_FAN_CYCLE_LENGTH = 29;
const UFC_AVERAGE_FAN_MILLIONAIRE_SLOTS = [10, 14, 20, 24] as const;

type JsonRecord = Record<string, unknown>;

function centralDayNumber(day: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) throw new Error("Millionaire daily day must use YYYY-MM-DD.");
  return Math.floor(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86_400_000);
}

function appearanceIndex(
  day: string,
  anchor: string,
  cycleLength: number,
  slots: readonly number[],
  label: string,
) {
  const offset = centralDayNumber(day) - centralDayNumber(anchor);
  const cycle = Math.floor(offset / cycleLength);
  const slot = ((offset % cycleLength) + cycleLength) % cycleLength;
  const position = slots.indexOf(slot);
  if (position < 0) {
    throw new Error(`${label} Millionaire is not scheduled on ${day}.`);
  }
  return cycle * slots.length + position;
}

/**
 * New v21 cadence differs from the historical 27/29-day cycles, and UFC
 * publishes every 48 hours. Keep the old ordinal identities for every
 * published pre-cutover board; index only the canonical v21 dates after it.
 *
 * Football appearances 0–4 and UFC appearances 0–5 were already reserved
 * before the new schedules began (including Oct 25 UFC Millionaire).
 */
function futureMillionaireAppearance(sport: "football" | "ufc", day: string) {
  if (lockedWeightedGameForDay(sport, day) !== "millionaire"
    || (sport === "ufc" && !isUfcPublicationDay(day))) {
    throw new Error(`${sport === "ufc" ? "UFC" : "Football"} Millionaire is not scheduled on ${day}.`);
  }
  if ((sport === "football" && day >= FOOTBALL_TWO_GAME_CUTOVER_DAY)
    || (sport === "ufc" && day >= UFC_TWO_GAME_CUTOVER_DAY)) {
    const start = sport === "football" ? FOOTBALL_TWO_GAME_CUTOVER_DAY : UFC_TWO_GAME_CUTOVER_DAY;
    const index = sport === "football"
      ? centralDayNumber(day) - centralDayNumber(start)
      : Math.floor((centralDayNumber(day) - centralDayNumber(start)) / 2);
    const cycle = sport === "football" ? FOOTBALL_APPROVED_WEIGHTED_CYCLE : UFC_APPROVED_WEIGHTED_CYCLE;
    const previous = Math.floor(index / cycle.length) * cycle.filter(game => game === "millionaire").length
      + cycle.slice(0, index % cycle.length).filter(game => game === "millionaire").length;
    // Both sports had six immutable appearances before their v22 cutovers:
    // Football includes Oct 26; UFC includes Oct 25.
    return 6 + previous;
  }
  const daysSinceCutover = centralDayNumber(day) - centralDayNumber(THREE_SPORT_CADENCE_CUTOVER_DAY);
  const occurrence = sport === "ufc" ? Math.floor(daysSinceCutover / 2) : daysSinceCutover;
  const cycle = sport === "ufc" ? UFC_FUTURE_WEIGHTED_CYCLE : FOOTBALL_FUTURE_WEIGHTED_CYCLE;
  const completeCycles = Math.floor(occurrence / cycle.length);
  const cycleIndex = occurrence % cycle.length;
  const previous = completeCycles * cycle.filter(game => game === "millionaire").length
    + cycle.slice(0, cycleIndex).filter(game => game === "millionaire").length;
  return (sport === "ufc" ? 6 : 5) + previous;
}

export function millionaireFootballDailyAppearance(day: string) {
  if (day >= THREE_SPORT_CADENCE_CUTOVER_DAY) {
    return futureMillionaireAppearance("football", day);
  }
  if (day < WEIGHTED_DAILY_CUTOVER) {
    return appearanceIndex(
      day,
      FOOTBALL_MILLIONAIRE_DAILY_ANCHOR,
      FOOTBALL_MILLIONAIRE_LEGACY_CYCLE_LENGTH,
      FOOTBALL_MILLIONAIRE_LEGACY_SLOTS,
      "Football",
    );
  }
  if (day < BAR_TRIVIA_WEIGHTED_CUTOVER) {
    return PRE_WEIGHTED_MILLIONAIRE_APPEARANCES + appearanceIndex(
      day,
      WEIGHTED_DAILY_CUTOVER,
      FOOTBALL_MILLIONAIRE_CYCLE_LENGTH,
      FOOTBALL_MILLIONAIRE_SLOTS,
      "Football",
    );
  }
  if (day < AVERAGE_FAN_WEIGHTED_CUTOVER) {
    return PRE_BAR_TRIVIA_WEIGHTED_MILLIONAIRE_APPEARANCES + appearanceIndex(
      day,
      BAR_TRIVIA_WEIGHTED_CUTOVER,
      FOOTBALL_BAR_TRIVIA_CYCLE_LENGTH,
      FOOTBALL_BAR_TRIVIA_MILLIONAIRE_SLOTS,
      "Football",
    );
  }
  return PRE_AVERAGE_FAN_WEIGHTED_MILLIONAIRE_APPEARANCES + appearanceIndex(
    day,
    AVERAGE_FAN_WEIGHTED_CUTOVER,
    FOOTBALL_AVERAGE_FAN_CYCLE_LENGTH,
    FOOTBALL_AVERAGE_FAN_MILLIONAIRE_SLOTS,
    "Football",
  );
}

export function millionaireUfcDailyAppearance(day: string) {
  if (day >= "2026-10-27") {
    return futureMillionaireAppearance("ufc", day);
  }
  if (day < WEIGHTED_DAILY_CUTOVER) {
    return appearanceIndex(
      day,
      MILLIONAIRE_DAILY_ANCHOR,
      UFC_MILLIONAIRE_LEGACY_CYCLE_LENGTH,
      UFC_MILLIONAIRE_LEGACY_SLOTS,
      "UFC",
    );
  }
  if (day < BAR_TRIVIA_WEIGHTED_CUTOVER) {
    return PRE_WEIGHTED_MILLIONAIRE_APPEARANCES + appearanceIndex(
      day,
      WEIGHTED_DAILY_CUTOVER,
      UFC_MILLIONAIRE_CYCLE_LENGTH,
      UFC_MILLIONAIRE_SLOTS,
      "UFC",
    );
  }
  if (day < AVERAGE_FAN_WEIGHTED_CUTOVER) {
    return PRE_BAR_TRIVIA_WEIGHTED_MILLIONAIRE_APPEARANCES + appearanceIndex(
      day,
      BAR_TRIVIA_WEIGHTED_CUTOVER,
      UFC_BAR_TRIVIA_CYCLE_LENGTH,
      UFC_BAR_TRIVIA_MILLIONAIRE_SLOTS,
      "UFC",
    );
  }
  return PRE_AVERAGE_FAN_WEIGHTED_MILLIONAIRE_APPEARANCES + appearanceIndex(
    day,
    AVERAGE_FAN_WEIGHTED_CUTOVER,
    UFC_AVERAGE_FAN_CYCLE_LENGTH,
    UFC_AVERAGE_FAN_MILLIONAIRE_SLOTS,
    "UFC",
  );
}

export function millionaireFootballDailyLeague(day: string): "cfb" | "nfl" {
  return millionaireFootballDailyAppearance(day) % 2 === 0 ? "cfb" : "nfl";
}

export function millionaireDailyLeague(sport: "ufc" | "football", day: string): MillionaireLeague {
  return sport === "ufc" ? "ufc" : millionaireFootballDailyLeague(day);
}

export function millionaireDailyLeagueAppearance(sport: "ufc" | "football", day: string) {
  if (sport === "ufc") return millionaireUfcDailyAppearance(day);
  return Math.floor(millionaireFootballDailyAppearance(day) / 2);
}

export function millionaireDailyRunIndex(sport: "ufc" | "football", day: string) {
  const appearance = millionaireDailyLeagueAppearance(sport, day);
  const count = day >= MILLIONAIRE_FUTURE_EDITORIAL_CUTOVER
    ? MILLIONAIRE_FUTURE_EDITORIAL_RUN_COUNT : MILLIONAIRE_DAILY_RUN_COUNT;
  return ((appearance % count) + count) % count;
}

export function millionaireDailyHostNumber(sport: "ufc" | "football", day: string) {
  const appearance = millionaireDailyLeagueAppearance(sport, day);
  return ((appearance % 3) + 3) % 3 + 1;
}

/** One moderate-difficulty memorial question; preserve the eight-question ladder and lifelines. */
function withDitkaMemorialQuestion(run: MillionaireRun): MillionaireRun {
  return run.map((question, index) => index !== 2 ? question : {
    ...question,
    id: "cfb-mike-ditka-memorial-2026-10-10-q3",
    type: "college-football-history",
    prompt: "In which NFL season did Mike Ditka lead the Chicago Bears to their only Super Bowl championship?",
    choices: [
      { id: "A", text: "1984" },
      { id: "B", text: "1985" },
      { id: "C", text: "1986" },
      { id: "D", text: "1987" },
    ],
    correctChoiceId: "B",
    explanation: "Ditka led the 1985 Chicago Bears to a 15–1 season and victory in Super Bowl XX, played in January 1986.",
    statSheet: "Under Ditka, Chicago defeated New England 46–10 in Super Bowl XX, capping an iconic 15–1 regular season.",
    fiftyFifty: {
      survivorChoiceIds: ["B", "C"],
      removalChoiceIds: ["A", "D"],
    },
  }) as unknown as MillionaireRun;
}

/**
 * Narrow future-only editorial errata. Never rewrite a previously published
 * board: historical run identities and private proofs stay unchanged.
 *
 * Primary records:
 * NFL / AP January 2026 first-team All-Pro:
 * https://www.nfl.com/news/2025-all-pro-team-matthew-stafford-bijan-robinson-jaxon-smith-njigba-highlight-roster
 * College Football Playoff 2025-season national championship (January 2026):
 * https://collegefootballplayoff.com/sports/2026/1/27/NCG-recap
 * UFC athlete record for UFC 285 fourth-round flyweight title change:
 * https://www.ufc.com/athlete/valentina-shevchenko
 */
function futureMillionaireErrata(
  run: MillionaireRun,
  league: MillionaireLeague,
  runIndex: number,
  day: string,
): MillionaireRun {
  if (day < "2026-10-27") return run;
  return run.map((question, index) => {
    const newQuestion = MILLIONAIRE_FUTURE_TARGETED_REWRITES[`${league}:${runIndex}:${index}`];
    if (newQuestion) {
      // Do not mutate the legacy question authority or any persisted result.
      // With independent future v6 IDs even historic caches remain auditable.
      return {
        ...question,
        id: newQuestion.id,
        type: newQuestion.type,
        prompt: newQuestion.prompt,
        choices: MILLIONAIRE_CHOICE_IDS.map((id, choiceIndex) => ({
          id,
          text: newQuestion.choices[choiceIndex]!,
        })) as unknown as MillionaireRuntimeQuestion["choices"],
        correctChoiceId: "A",
        explanation: newQuestion.explanation,
        statSheet: newQuestion.statSheet,
        fiftyFifty: {
          survivorChoiceIds: ["A", "B"],
          removalChoiceIds: ["C", "D"],
        },
      };
    }
    // In January 2026 Stafford became a first-team All-Pro; the legacy
    // "never first-team All-Pro" question is factually false.
    if (league === "nfl" && runIndex === 0 && index === 5) {
      return {
        ...question,
        id: "millionaire-nfl-2025-ap-all-pro-q6-future",
        type: "awards-2025",
        prompt: "Which quarterback earned his first career AP first-team All-Pro selection for the 2025 NFL season?",
        choices: [
          { id: "A", text: "Matthew Stafford" },
          { id: "B", text: "Drake Maye" },
          { id: "C", text: "Josh Allen" },
          { id: "D", text: "Lamar Jackson" },
        ],
        correctChoiceId: "A",
        explanation: "Matthew Stafford earned his first AP first-team All-Pro selection after the 2025 season, his 17th NFL season.",
        statSheet: "The veteran led the league with 4,707 passing yards and 46 passing touchdowns in the 2025 regular season.",
        fiftyFifty: {
          survivorChoiceIds: ["A", "B"],
          removalChoiceIds: ["C", "D"],
        },
      };
    }
    // The 2025 *season* winner was Indiana, while the championship GAME
    // played in January 2025 was won by Ohio State. Name the season.
    if (league === "cfb" && runIndex === 9 && index === 0) {
      return {
        ...question,
        id: "millionaire-cfb-2025-season-title-q1-future",
        prompt: "Which program won the national championship for the 2025 college football season?",
        explanation: "Indiana completed a 16-0 season by defeating Miami in the January 2026 College Football Playoff national championship game.",
      };
    }
    // Three additional Stat Sheets disclosed the correct fighter by surname.
    // UFC fighter/event records: ufc.com/athlete/jessica-andrade,
    // ufc.com/event/ufc-281, and ufc.com/news/on-this-day-ufc-history-serra-shocks-world.
    if (league === "ufc" && runIndex === 5 && index === 5) {
      return {
        ...question,
        id: "millionaire-ufc-237-strawweight-q6-future",
        statSheet: "The belt changed hands in Brazil via a second-round slam finish at UFC 237.",
      };
    }
    if (league === "ufc" && runIndex === 6 && index === 3 && question.id === "millionaire-ufc-run-7-q4") {
      return {
        ...question,
        id: "millionaire-ufc-281-middleweight-q4-future",
        statSheet: "A dramatic fifth-round stoppage at Madison Square Garden ended the champion's title reign.",
      };
    }
    if (league === "ufc" && runIndex === 7 && index === 2 && question.id === "millionaire-ufc-run-8-q3") {
      return {
        ...question,
        id: "millionaire-ufc-69-welterweight-q3-future",
        statSheet: "The upset happened at UFC 69 after the challenger won Season 4 of The Ultimate Fighter.",
      };
    }
    // Grasso's surname was previously written verbatim in the Stat Sheet.
    if (league === "ufc" && runIndex === 9 && index === 6) {
      return {
        ...question,
        id: "millionaire-ufc-285-flyweight-2023-q7-future",
        statSheet: "The belt changed hands by fourth-round submission at UFC 285 after seven successful defenses by the longtime champion.",
      };
    }
    return question;
  }) as unknown as MillionaireRun;
}

function proofFor(run: MillionaireRun, league: MillionaireLeague, day: string, scheduleVersion: string,
  contentVersion: string = MILLIONAIRE_DAILY_CONTENT_VERSION) {
  return [
    contentVersion,
    league,
    day,
    scheduleVersion,
    ...run.map((question) => `${question.id}:${question.correctChoiceId}`),
  ].join("|");
}

function millionairePublicationFromRun(
  league: MillionaireLeague,
  day: string,
  scheduleVersion: string,
  runIndex: number,
  hostNumber: number,
  run: MillionaireRun,
  contentVersion: string = MILLIONAIRE_DAILY_CONTENT_VERSION,
): OfficialDailySetupPublication {
  const state = createMillionaireState(run);
  const proof = proofFor(run, league, day, scheduleVersion, contentVersion);
  return {
    setupKey: `${contentVersion}:${scheduleVersion}:${day}:${league}`,
    contentVersion,
    scoringVersion: MILLIONAIRE_DAILY_SCORING_VERSION,
    publicSetup: {
      runtime_version: contentVersion,
      league,
      run_number: runIndex + 1,
      host_number: hostNumber,
      question_count: 8,
      time_bank_ms: MILLIONAIRE_TIME_BANK_MS,
      questions: run.map(millionairePublicQuestion),
      initial_state: millionaireDailyPublicState(state, MILLIONAIRE_TIME_BANK_MS),
    },
    revealSetup: {
      league,
      run_number: runIndex + 1,
      host_number: hostNumber,
      questions: run.map((question) => ({
        id: question.id,
        correct_choice_id: question.correctChoiceId,
        explanation: question.explanation,
      })),
    },
    privateSetupEvidence: {
      league,
      run_number: runIndex + 1,
      host_number: hostNumber,
      proof,
      run,
    },
    privateGradingEvidence: {
      proof,
    },
  };
}

export function buildNbaMillionaireDailySetup(
  day: string,
  scheduleVersion: string,
  runIndex: number,
  authoredRun: MillionaireRun,
): OfficialDailySetupPublication {
  if (!Number.isSafeInteger(runIndex) || runIndex < 0) {
    throw new Error("NBA Millionaire appearance ordinal must be a nonnegative integer.");
  }
  return millionairePublicationFromRun(
    "nba", day, scheduleVersion, runIndex, (runIndex % 3) + 1,
    balanceRun(authoredRun, runIndex),
  );
}

export function buildMillionaireDailySetup(
  sport: "ufc" | "football",
  day: string,
  scheduleVersion: string,
): OfficialDailySetupPublication {
  const league = millionaireDailyLeague(sport, day);
  const runIndex = millionaireDailyRunIndex(sport, day);
  const hostNumber = millionaireDailyHostNumber(sport, day);
  const themedRun = sport === "football" ? footballThemedMillionaireRunForDay(day) : null;
  const baseRun = futureMillionaireErrata(
    themedRun ?? (day >= MILLIONAIRE_FUTURE_EDITORIAL_CUTOVER
      ? millionaireFutureEditorialDailyRun(league, runIndex)
      : millionaireDailyRun(league, runIndex)), league, runIndex, day,
  );
  const run = balanceRun(
    sport === "football" && day === "2026-10-10" && league === "cfb"
      ? withDitkaMemorialQuestion(baseRun)
      : baseRun,
    runIndex,
  );
  assertMillionaireRun(run);
  return millionairePublicationFromRun(league, day, scheduleVersion, runIndex, hostNumber, run,
    day >= MILLIONAIRE_FUTURE_EDITORIAL_CUTOVER
      ? MILLIONAIRE_FUTURE_EDITORIAL_CONTENT_VERSION : MILLIONAIRE_DAILY_CONTENT_VERSION);
}
