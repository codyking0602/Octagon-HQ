import { buildBarTriviaDailySetup } from "./barTriviaDailyRuntime";
import { footballBarTriviaLeagueForDay } from "./dailyChallengeRotation";
import { persistenceSetup } from "./footballDailyPublicationShared";
import type { OfficialDailyGameType } from "./todaysChallengeRuntime";

export function buildFootballDailyPersistenceSetup(
  day: string,
  scheduleVersion: string,
  gameType: OfficialDailyGameType,
) {
  if (gameType !== "bar_trivia") {
    throw new Error("Football Bar Trivia publication runtime received the wrong game type.");
  }
  return persistenceSetup(
    gameType,
    day,
    scheduleVersion,
    buildBarTriviaDailySetup(footballBarTriviaLeagueForDay(day), day, scheduleVersion),
  );
}
