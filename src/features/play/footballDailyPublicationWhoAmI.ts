import { createFootballWhoAmIDailyRound } from "../games/footballWhoAmIDailyAuthority";
import { createFootballWhoAmIAuthoredDailyRounds } from "./footballWhoAmIAuthoredDaily";
import { parseWhoAmIAuthoredPublicationHistory } from "./whoAmIAuthoredDailySelection";
import { seededLineupRandom } from "./lineupModel";
import { buildWhoAmIDailyPublication } from "./whoAmIDailyRuntime";
import { buildTwoRoundWhoAmIDailyPublication } from "./whoAmITwoRoundDailyRuntime";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "./officialScoreContract";
import type { OfficialDailyGameType } from "./todaysChallengeRuntime";
import {
  FOOTBALL_DAILY_RUNTIME_VERSION,
  persistenceSetup,
} from "./footballDailyPublicationShared";

const FOOTBALL_AUTHORED_WHO_AM_I_SCHEDULE_VERSION = "football-daily-v12-sports-feud";
const FOOTBALL_AUTHORED_WHO_AM_I_CUTOVER_DAY = "2026-09-23";

export function buildFootballDailyPersistenceSetup(
  day: string,
  scheduleVersion: string,
  gameType: OfficialDailyGameType,
  publicationHistory?: unknown,
) {
  if (gameType !== "who_am_i") throw new Error("Football Who Am I publication runtime received the wrong game type.");

  const authored = scheduleVersion === FOOTBALL_AUTHORED_WHO_AM_I_SCHEDULE_VERSION
    && day >= FOOTBALL_AUTHORED_WHO_AM_I_CUTOVER_DAY;
  const publication = authored
    ? buildTwoRoundWhoAmIDailyPublication(
        createFootballWhoAmIAuthoredDailyRounds(
          day,
          parseWhoAmIAuthoredPublicationHistory(publicationHistory),
        ),
        day,
        scheduleVersion,
        FOOTBALL_DAILY_RUNTIME_VERSION,
        OFFICIAL_SCORE_CONTRACT_VERSION,
      )
    : buildWhoAmIDailyPublication(
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
