import { buildMillionaireDailySetup } from "./millionaireDailyRuntime";
import type { OfficialDailyGameType } from "./todaysChallengeRuntime";
import { persistenceSetup } from "./footballDailyPublicationShared";

export function buildFootballDailyPersistenceSetup(
  day: string,
  scheduleVersion: string,
  gameType: OfficialDailyGameType,
) {
  if (gameType !== "millionaire") {
    throw new Error("Football Millionaire publication runtime received the wrong game type.");
  }
  return persistenceSetup(
    gameType,
    day,
    scheduleVersion,
    buildMillionaireDailySetup("football", day, scheduleVersion),
  );
}
