import { buildAverageFanDailySetup } from "./averageFanDailyRuntime";
import { persistenceSetup } from "./footballDailyPublicationShared";
import type { OfficialDailyGameType } from "./todaysChallengeRuntime";

export function buildFootballDailyPersistenceSetup(
  day: string,
  scheduleVersion: string,
  gameType: OfficialDailyGameType,
  publicationHistory?: unknown,
) {
  if (gameType !== "average_fan") {
    throw new Error("Football Average Fan publication runtime received the wrong game type.");
  }
  return persistenceSetup(
    gameType,
    day,
    scheduleVersion,
    buildAverageFanDailySetup("football", day, scheduleVersion, publicationHistory),
  );
}
