import { NBA_DAILY_WEIGHTED_CYCLE, NBA_OWNER_PREVIEW_ORDER, nbaOwnerPreviewDaily, nbaRegularSeasonDaily, type NbaDailyGame } from "./nbaDailySchedule";
import type { OfficialDailySetupPublication } from "../play/todaysChallengeRuntime";

/** Zero-based appearance of a single game on a scheduled publication date. */
export function nbaDailyGameAppearance(day: string, gameType: NbaDailyGame): number {
  const slot = nbaRegularSeasonDaily(day);
  if (!slot || !slot.isPublicationDay || slot.gameType !== gameType) {
    throw new Error("NBA Daily publication must match its scheduled Central day and game.");
  }
  let count = 0;
  for (let index = 0; index < slot.appearanceIndex; index++) {
    if (NBA_DAILY_WEIGHTED_CYCLE[index % NBA_DAILY_WEIGHTED_CYCLE.length] === gameType) count++;
  }
  return count;
}

export function nbaLeanDailyPublication(
  day: string, scheduleVersion: string, gameType: string,
  expected: NbaDailyGame, builder: (ordinal: number) => OfficialDailySetupPublication,
) {
  if (!scheduleVersion.trim() || gameType !== expected) throw new Error("NBA Daily game identity mismatch.");
  if (scheduleVersion === "nba-daily-launch-oct29-bar-trivia-v1") {
    throw new Error("The October 29 public Bar Trivia must use its existing verified saved board, never regenerate it.");
  }
  const ordinal = scheduleVersion === "nba-daily-owner-prelaunch-v1"
    ? (nbaOwnerPreviewDaily(day) === expected ? 20 + NBA_OWNER_PREVIEW_ORDER.indexOf(expected)
      : (() => { throw new Error("NBA owner prelaunch game/day mismatch."); })())
    : nbaDailyGameAppearance(day, expected);
  return { ...builder(ordinal), gameType: expected, scheduleVersion };
}
