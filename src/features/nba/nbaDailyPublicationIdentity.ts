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
    // The special Oct 29–31 launch is Bar Trivia. The 28-game weighted
    // regular cycle starts on Nov 1, one appearance later.
    const previous = index === 0 ? "bar_trivia"
      : NBA_DAILY_WEIGHTED_CYCLE[(index - 1) % NBA_DAILY_WEIGHTED_CYCLE.length];
    if (previous === gameType) count++;
  }
  return count;
}

export function nbaLeanDailyPublication(
  day: string, scheduleVersion: string, gameType: string,
  expected: NbaDailyGame, builder: (ordinal: number) => OfficialDailySetupPublication,
) {
  if (!scheduleVersion.trim() || gameType !== expected) throw new Error("NBA Daily game identity mismatch.");
  const ordinal = scheduleVersion === "nba-daily-owner-prelaunch-v1"
    ? (nbaOwnerPreviewDaily(day) === expected ? 20 + NBA_OWNER_PREVIEW_ORDER.indexOf(expected)
      : (() => { throw new Error("NBA owner prelaunch game/day mismatch."); })())
    : nbaDailyGameAppearance(day, expected);
  return { ...builder(ordinal), gameType: expected, scheduleVersion };
}
