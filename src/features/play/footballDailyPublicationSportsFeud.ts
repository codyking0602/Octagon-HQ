import { buildFamilyFeudDailySetup } from "./familyFeudDailyRuntime";
import {
  buildSportsFeudPack,
  buildFootballFeudRebuildPack,
  FOOTBALL_FEUD_REBUILD_CUTOVER_DAY,
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
    buildFamilyFeudDailySetup(day >= FOOTBALL_FEUD_REBUILD_CUTOVER_DAY
      ? buildFootballFeudRebuildPack(domain, day)
      : buildSportsFeudPack(domain, day), day, scheduleVersion),
  );
}
