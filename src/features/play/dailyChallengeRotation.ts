import type { OfficialDailyGameType } from "./todaysChallengeRuntime";

export const DAILY_WEIGHTED_ROTATION_CUTOVER_DAY = "2026-10-01";

export const FOOTBALL_LOCKED_WEIGHTED_CYCLE: readonly OfficialDailyGameType[] = [
  "average_fan",
  "sports_feud",
  "hit_the_number",
  "sports_feud",
  "bar_trivia",
  "wavelength",
  "millionaire",
  "average_fan",
  "millionaire",
  "hit_the_number",
  "bar_trivia",
  "wavelength",
  "find_leader",
  "average_fan",
  "find_leader",
  "who_am_i",
  "find_leader",
  "wavelength",
  "millionaire",
  "average_fan",
  "sports_feud",
  "who_am_i",
  "millionaire",
  "average_fan",
  "bar_trivia",
  "who_am_i",
  "sports_feud",
];

export const UFC_LOCKED_WEIGHTED_CYCLE: readonly OfficialDailyGameType[] = [
  "average_fan",
  "find_leader",
  "wavelength",
  "bar_trivia",
  "average_fan",
  "bar_trivia",
  "hit_the_number",
  "sports_feud",
  "average_fan",
  "millionaire",
  "blind_resume",
  "millionaire",
  "wavelength",
  "hit_the_number",
  "average_fan",
  "millionaire",
  "wavelength",
  "blind_resume",
  "who_am_i",
  "sports_feud",
  "find_leader",
  "sports_feud",
  "average_fan",
  "find_leader",
  "who_am_i",
  "sports_feud",
  "millionaire",
  "who_am_i",
  "bar_trivia",
];

function dayNumber(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Daily rotation day must use YYYY-MM-DD.");
  const [year, month, date] = day.split("-").map(Number);
  const stamp = Date.UTC(year!, month! - 1, date!);
  if (new Date(stamp).toISOString().slice(0, 10) !== day) throw new Error("Daily rotation day is invalid.");
  return Math.floor(stamp / 86_400_000);
}

export function lockedWeightedGameForDay(
  sport: "football" | "ufc",
  day: string,
): OfficialDailyGameType {
  const cycle = sport === "football" ? FOOTBALL_LOCKED_WEIGHTED_CYCLE : UFC_LOCKED_WEIGHTED_CYCLE;
  const offset = dayNumber(day) - dayNumber(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY);
  const index = ((offset % cycle.length) + cycle.length) % cycle.length;
  return cycle[index]!;
}

export function footballBarTriviaAppearanceIndex(day: string) {
  if (day === "2026-09-29") return 0;
  const offset = dayNumber(day) - dayNumber(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY);
  if (offset < 0 || lockedWeightedGameForDay("football", day) !== "bar_trivia") {
    throw new Error("Football Bar Trivia league is only defined for Bar Trivia Daily dates.");
  }
  const fullCycles = Math.floor(offset / FOOTBALL_LOCKED_WEIGHTED_CYCLE.length);
  const slot = offset % FOOTBALL_LOCKED_WEIGHTED_CYCLE.length;
  const beforeInCycle = FOOTBALL_LOCKED_WEIGHTED_CYCLE
    .slice(0, slot)
    .filter((game) => game === "bar_trivia").length;
  return 1
    + fullCycles * FOOTBALL_LOCKED_WEIGHTED_CYCLE.filter((game) => game === "bar_trivia").length
    + beforeInCycle;
}

export function footballBarTriviaLeagueForDay(day: string): "nfl" | "cfb" {
  return footballBarTriviaAppearanceIndex(day) % 2 === 0 ? "nfl" : "cfb";
}
