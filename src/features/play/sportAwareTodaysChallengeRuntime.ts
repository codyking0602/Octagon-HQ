import type { PlaySport } from "./playRegistry";
import {
  advanceFootballOfficialDailyRuntime,
  buildFootballOfficialDailySetup,
} from "./footballTodayChallengeRuntime";
import {
  advanceOfficialDailyRuntime as advanceUfcOfficialDailyRuntime,
  buildOfficialDailySetup as buildUfcOfficialDailySetup,
  type OfficialDailyGameType,
  type OfficialDailyRuntimeContext,
} from "./todaysChallengeRuntime";

export type { OfficialDailyGameType, OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";

export function buildOfficialDailySetup(
  gameType: OfficialDailyGameType,
  day: string,
  scheduleVersion: string,
  sport: PlaySport = "ufc",
) {
  return sport === "football"
    ? buildFootballOfficialDailySetup(gameType, day, scheduleVersion)
    : buildUfcOfficialDailySetup(gameType, day, scheduleVersion);
}

export function advanceOfficialDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: unknown,
  sport: PlaySport = "ufc",
) {
  return sport === "football"
    ? advanceFootballOfficialDailyRuntime(context, action)
    : advanceUfcOfficialDailyRuntime(context, action);
}
