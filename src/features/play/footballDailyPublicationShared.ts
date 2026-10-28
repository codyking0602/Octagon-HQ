import type {
  OfficialDailyGameType,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const FOOTBALL_DAILY_RUNTIME_VERSION = "football-official-daily-v1" as const;
export const FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION = "football-blind-resume-daily-v4" as const;
export const FOOTBALL_BLIND_RESUME_DAILY_SCORING_VERSION = "football-blind-resume-score-v4" as const;
export const FOOTBALL_HIT_THE_NUMBER_DAILY_CONTENT_VERSION = "football-hit-the-number-daily-v3" as const;
export const FOOTBALL_DAILY_DOUBLE_CONTENT_VERSION = "football-daily-double-v1" as const;
export const SHARED_DAILY_DOUBLE_GRADING_VERSION = "daily-rank-keep-combo-v1" as const;
export const SHARED_DAILY_DOUBLE_SCORING_VERSION = "play-official-score-v4" as const;

export type FootballDailyPersistenceSetup = Omit<OfficialDailySetupPublication, "scoringVersion"> & {
  gameType: OfficialDailyGameType;
  scheduleVersion: string;
  scoringVersion: string;
};

export function assertFootballDailyDay(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error("Football official daily day must use YYYY-MM-DD.");
  }
}

export function persistenceSetup(
  gameType: OfficialDailyGameType,
  day: string,
  scheduleVersion: string,
  publication: OfficialDailySetupPublication,
): FootballDailyPersistenceSetup {
  assertFootballDailyDay(day);
  return {
    gameType,
    scheduleVersion,
    ...publication,
  };
}
