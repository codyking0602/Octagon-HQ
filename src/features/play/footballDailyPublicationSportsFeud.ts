import { buildFamilyFeudDailySetup } from "./familyFeudDailyRuntime";
import {
  buildSportsFeudPack,
  footballSportsFeudDomainForDay,
} from "./sportsFeudDailyBanks";
import type { OfficialDailyGameType } from "./todaysChallengeRuntime";
import { persistenceSetup } from "./footballDailyPublicationShared";

export function buildFootballDailyPersistenceSetup(
  day: string,
  scheduleVersion: string,
  gameType: OfficialDailyGameType,
) {
  if (gameType !== "sports_feud") {
    throw new Error("Football Sports Feud publication runtime received the wrong game type.");
  }
  const domain = footballSportsFeudDomainForDay(day);
  return persistenceSetup(
    gameType,
    day,
    scheduleVersion,
    buildFamilyFeudDailySetup(buildSportsFeudPack(domain, day), day, scheduleVersion),
  );
}
