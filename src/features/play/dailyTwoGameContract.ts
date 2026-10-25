export const DAILY_TWO_GAME_FORMAT_VERSION = "daily-two-game-average-v1" as const;
export const DAILY_TWO_GAME_SCORING_VERSION = "daily-two-game-average-score-v1" as const;
export const DAILY_TWO_GAME_CUTOVER_DAY = "2026-09-27" as const;

export const DAILY_HIGHER_LOWER_TWO_GAME_CUTOVER_DAY = "2026-10-26" as const;

export type DailyTwoGameType = "find_leader" | "wavelength" | "hit_the_number" | "higher_lower";

const DAILY_TWO_GAME_TYPES = new Set<string>([
  "find_leader",
  "wavelength",
  "hit_the_number",
]);

export function dailyUsesTwoGameAverage(gameType: string, day: string) {
  if (gameType === "higher_lower") return day >= DAILY_HIGHER_LOWER_TWO_GAME_CUTOVER_DAY;
  return day >= DAILY_TWO_GAME_CUTOVER_DAY && DAILY_TWO_GAME_TYPES.has(gameType);
}
