import { buildFootballHigherLowerDailyPersistenceSetup } from "./footballHigherLowerDailyRuntime";
import type { OfficialDailyGameType } from "./todaysChallengeRuntime";

export function buildFootballDailyPersistenceSetup(
  day: string,
  scheduleVersion: string,
  gameType: OfficialDailyGameType,
  publicationHistory?: unknown,
) {
  if (gameType !== "higher_lower") {
    throw new Error("Football Higher or Lower publication runtime received the wrong game type.");
  }
  return buildFootballHigherLowerDailyPersistenceSetup(
    day,
    scheduleVersion,
    Array.isArray(publicationHistory) ? publicationHistory : [],
  );
}
