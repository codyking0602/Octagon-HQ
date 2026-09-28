import type { OfficialDailyGameType } from "./todaysChallengeRuntime";

export const DAILY_WEIGHTED_ROTATION_CUTOVER_DAY = "2026-09-29";

export const FOOTBALL_LOCKED_WEIGHTED_CYCLE: readonly OfficialDailyGameType[] = [
  "bar_trivia",
  "wavelength",
  "sports_feud",
  "who_am_i",
  "millionaire",
  "find_leader",
  "bar_trivia",
  "hit_the_number",
  "sports_feud",
  "wavelength",
  "millionaire",
  "who_am_i",
  "sports_feud",
  "find_leader",
  "bar_trivia",
  "hit_the_number",
  "millionaire",
  "wavelength",
  "sports_feud",
  "who_am_i",
  "millionaire",
  "find_leader",
];

export const UFC_LOCKED_WEIGHTED_CYCLE: readonly OfficialDailyGameType[] = [
  "bar_trivia",
  "sports_feud",
  "wavelength",
  "millionaire",
  "who_am_i",
  "blind_resume",
  "find_leader",
  "sports_feud",
  "hit_the_number",
  "bar_trivia",
  "wavelength",
  "millionaire",
  "who_am_i",
  "sports_feud",
  "find_leader",
  "blind_resume",
  "hit_the_number",
  "millionaire",
  "wavelength",
  "sports_feud",
  "who_am_i",
  "bar_trivia",
  "find_leader",
  "millionaire",
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
  const offset = dayNumber(day) - dayNumber(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY);
  if (offset < 0 || lockedWeightedGameForDay("football", day) !== "bar_trivia") {
    throw new Error("Football Bar Trivia league is only defined for Bar Trivia Daily dates.");
  }
  const fullCycles = Math.floor(offset / FOOTBALL_LOCKED_WEIGHTED_CYCLE.length);
  const slot = offset % FOOTBALL_LOCKED_WEIGHTED_CYCLE.length;
  const beforeInCycle = FOOTBALL_LOCKED_WEIGHTED_CYCLE
    .slice(0, slot)
    .filter((game) => game === "bar_trivia").length;
  return fullCycles * FOOTBALL_LOCKED_WEIGHTED_CYCLE.filter((game) => game === "bar_trivia").length
    + beforeInCycle;
}

export function footballBarTriviaLeagueForDay(day: string): "nfl" | "cfb" {
  return footballBarTriviaAppearanceIndex(day) % 2 === 0 ? "nfl" : "cfb";
}
