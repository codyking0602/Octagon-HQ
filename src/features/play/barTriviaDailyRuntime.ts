import { barTriviaDailyPublicState, barTriviaRevealedQuestion } from "./barTriviaDailyAdvanceRuntime";
export { advanceBarTriviaDailyRuntime } from "./barTriviaDailyAdvanceRuntime";
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
import { seededLineupRandom, stableLineupHash } from "./lineupModel";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyRuntimeContext,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const BAR_TRIVIA_DAILY_CONTENT_VERSION = "bar-trivia-daily-v2-recent-rotation";
export const BAR_TRIVIA_DAILY_SCORING_VERSION = "play-official-score-v1";

type JsonRecord = Record<string, unknown>;

/**
 * Replay seeded, eligible past Bar Trivia Daily dates to avoid repeating the
 * same question in the next three appearances of its league. No database
 * reads, score changes, or mutation of historical official Daily setups.
 * This replay begins from the original September 29 launch, and uses the
 * current curated bank (legacy published boards stay immutable in storage).
 */
const BAR_TRIVIA_FIRST_DAY = "2026-09-29";
const BAR_TRIVIA_RECENT_APPEARANCES = 3;
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
  const historyIds: string[][] = [];
  let latest: BarTriviaQuestion[] = [];

  // Historical/MLB previews do not participate in the NFL/CFB/UFC Daily cadence.
  const first = league === "mlb" || !Number.isFinite(target) || target < beginning
    ? target : beginning;

  for (let timestamp = first; timestamp <= target; timestamp += DAY_MS) {
    const candidateDay = new Date(timestamp).toISOString().slice(0, 10);
    if (candidateDay !== day && !wasBarTriviaDailyAppearance(league, candidateDay)) continue;
    const recentIds = historyIds.flat();
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
    historyIds.unshift(run.map((question) => question.id));
    if (historyIds.length > BAR_TRIVIA_RECENT_APPEARANCES) historyIds.pop();
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
      initial_state: barTriviaDailyPublicState(run, initial),
    },
    revealSetup: {
      league,
      questions: run.map(barTriviaRevealedQuestion),
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
