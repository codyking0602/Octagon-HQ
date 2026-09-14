import { createFootballWhoAmIDailyRound } from "../games/footballWhoAmIDailyAuthority";
import { seededLineupRandom } from "./lineupModel";
import { buildWhoAmIDailyPublication } from "./whoAmIDailyRuntime";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "./officialScoreContract";
import type { OfficialDailyGameType } from "./todaysChallengeRuntime";
import {
  FOOTBALL_DAILY_RUNTIME_VERSION,
  persistenceSetup,
} from "./footballDailyPublicationShared";

export function buildFootballDailyPersistenceSetup(
  day: string,
  scheduleVersion: string,
  gameType: OfficialDailyGameType,
) {
  if (gameType !== "who_am_i") throw new Error("Football Who Am I publication runtime received the wrong game type.");
  const publication = buildWhoAmIDailyPublication(
    createFootballWhoAmIDailyRound(
      seededLineupRandom(FOOTBALL_DAILY_RUNTIME_VERSION, "who-am-i", scheduleVersion, day, "round"),
    ),
    day,
    scheduleVersion,
    FOOTBALL_DAILY_RUNTIME_VERSION,
    OFFICIAL_SCORE_CONTRACT_VERSION,
  );
  return persistenceSetup(gameType, day, scheduleVersion, publication);
}
