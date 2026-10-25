import type { OfficialDailyGameType } from "./todaysChallengeRuntime";

// Historical October 1 rotations must remain immutable for published boards.
export const DAILY_WEIGHTED_ROTATION_CUTOVER_DAY = "2026-10-01";

export const FOOTBALL_LOCKED_WEIGHTED_CYCLE: readonly OfficialDailyGameType[] = [
  "average_fan",
  "bar_trivia",
  "millionaire",
  "sports_feud",
  "who_am_i",
  "average_fan",
  "millionaire",
  "average_fan",
  "sports_feud",
  "millionaire",
  "find_leader",
  "hit_the_number",
  "find_leader",
  "bar_trivia",
  "sports_feud",
  "average_fan",
  "wavelength",
  "average_fan",
  "sports_feud",
  "find_leader",
  "wavelength",
  "bar_trivia",
  "who_am_i",
  "wavelength",
  "hit_the_number",
  "millionaire",
  "who_am_i",
];

export const UFC_LOCKED_WEIGHTED_CYCLE: readonly OfficialDailyGameType[] = [
  "average_fan",
  "who_am_i",
  "blind_resume",
  "find_leader",
  "bar_trivia",
  "sports_feud",
  "bar_trivia",
  "sports_feud",
  "average_fan",
  "sports_feud",
  "millionaire",
  "sports_feud",
  "average_fan",
  "hit_the_number",
  "millionaire",
  "blind_resume",
  "average_fan",
  "who_am_i",
  "average_fan",
  "who_am_i",
  "millionaire",
  "find_leader",
  "wavelength",
  "bar_trivia",
  "millionaire",
  "find_leader",
  "hit_the_number",
  "wavelength",
  "wavelength",
];

export const DAILY_GAME_DATE_OVERRIDES: Readonly<
  Record<"football" | "ufc", Readonly<Record<string, OfficialDailyGameType>>>
> = {
  football: {
    "2026-10-01": "bar_trivia",
    "2026-10-02": "average_fan",
  },
  ufc: {
    "2026-10-01": "who_am_i",
    "2026-10-02": "average_fan",
  },
};

export const FOOTBALL_FUTURE_WEIGHTED_CYCLE: readonly OfficialDailyGameType[] = [
  "who_am_i",
  "millionaire",
  "find_leader",
  "hit_the_number",
  "wavelength",
  "sports_feud",
  "average_fan",
  "sports_feud",
  "who_am_i",
  "millionaire",
  "find_leader",
  "bar_trivia",
  "wavelength",
  "average_fan",
  "millionaire",
  "sports_feud",
  "who_am_i",
  "bar_trivia",
  "hit_the_number",
  "find_leader",
  "average_fan",
  "wavelength",
  "millionaire",
  "sports_feud",
  "bar_trivia",
  "average_fan",
];

export const UFC_FUTURE_WEIGHTED_CYCLE: readonly OfficialDailyGameType[] = [
  "find_leader",
  "sports_feud",
  "millionaire",
  "wavelength",
  "bar_trivia",
  "average_fan",
  "blind_resume",
  "who_am_i",
  "sports_feud",
  "find_leader",
  "millionaire",
  "average_fan",
  "wavelength",
  "hit_the_number",
  "bar_trivia",
  "sports_feud",
  "who_am_i",
  "millionaire",
  "average_fan",
  "find_leader",
  "blind_resume",
  "sports_feud",
  "wavelength",
  "millionaire",
  "bar_trivia",
  "who_am_i",
  "average_fan",
  "hit_the_number",
];

/** v22: a 56-slot Football supercycle holds two independently weighted 28-day
 * sets. This prevents inevitable NBA collisions from repeating every 56 days
 * when a single 28-slot Football cycle is used. Each 28-slot half preserves
 * Average Fan/Millionaire/Sports Feud 4x, four 3x games and two 2x games.
 * The Oct 26 Cowboys Millionaire and Nov 27/Dec 7 themed games are retained.
 * Previously published games retain their immutable v20/v21 identities. */
export const FOOTBALL_TWO_GAME_HIGHER_LOWER_CYCLE: readonly OfficialDailyGameType[] = [
  "higher_lower",
  "millionaire",
  "who_am_i",
  "average_fan",
  "wavelength",
  "sports_feud",
  "bar_trivia",
  "hit_the_number",
  "millionaire",
  "average_fan",
  "who_am_i",
  "find_leader",
  "sports_feud",
  "wavelength",
  "higher_lower",
  "bar_trivia",
  "millionaire",
  "average_fan",
  "find_leader",
  "who_am_i",
  "sports_feud",
  "hit_the_number",
  "wavelength",
  "millionaire",
  "average_fan",
  "bar_trivia",
  "find_leader",
  "sports_feud",
  "higher_lower",
  "average_fan",
  "who_am_i",
  "millionaire",
  "wavelength",
  "sports_feud",
  "bar_trivia",
  "average_fan",
  "millionaire",
  "find_leader",
  "who_am_i",
  "wavelength",
  "hit_the_number",
  "sports_feud",
  "higher_lower",
  "bar_trivia",
  "millionaire",
  "average_fan",
  "find_leader",
  "who_am_i",
  "sports_feud",
  "hit_the_number",
  "wavelength",
  "millionaire",
  "average_fan",
  "bar_trivia",
  "find_leader",
  "sports_feud",
];

/** UFC alternates with NBA, on its original Oct 25–anchored 48-hour cadence. */
export const UFC_TWO_GAME_HIGHER_LOWER_CYCLE: readonly OfficialDailyGameType[] = [
  "find_leader",
  "sports_feud",
  "bar_trivia",
  "millionaire",
  "hit_the_number",
  "average_fan",
  "who_am_i",
  "blind_resume",
  "wavelength",
  "millionaire",
  "find_leader",
  "sports_feud",
  "bar_trivia",
  "higher_lower",
  "average_fan",
  "millionaire",
  "who_am_i",
  "sports_feud",
  "wavelength",
  "hit_the_number",
  "find_leader",
  "average_fan",
  "bar_trivia",
  "millionaire",
  "blind_resume",
  "sports_feud",
  "who_am_i",
  "higher_lower",
  "average_fan",
  "wavelength",
];

export const FOOTBALL_TWO_GAME_HIGHER_LOWER_CUTOVER_DAY = "2026-10-27";
export const UFC_TWO_GAME_HIGHER_LOWER_CUTOVER_DAY = "2026-10-29";

export const THREE_SPORT_CADENCE_CUTOVER_DAY = "2026-10-25";

function dayNumber(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Daily rotation day must use YYYY-MM-DD.");
  const [year, month, date] = day.split("-").map(Number);
  const stamp = Date.UTC(year!, month! - 1, date!);
  if (new Date(stamp).toISOString().slice(0, 10) !== day) throw new Error("Daily rotation day is invalid.");
  return Math.floor(stamp / 86_400_000);
}

function isoDay(ordinal: number) {
  return new Date(ordinal * 86_400_000).toISOString().slice(0, 10);
}

/** The UFC board opens on Oct 25 and stays playable across the following day. */
export function ufcActiveDailyDay(day: string): string {
  const ordinal = dayNumber(day);
  const cutover = dayNumber(THREE_SPORT_CADENCE_CUTOVER_DAY);
  return ordinal < cutover ? day : isoDay(cutover + Math.floor((ordinal - cutover) / 2) * 2);
}

export function isUfcPublicationDay(day: string) {
  return ufcActiveDailyDay(day) === day;
}

export function lockedWeightedGameForDay(
  sport: "football" | "ufc",
  day: string,
): OfficialDailyGameType {
  const ordinal = dayNumber(day);
  const cutover = dayNumber(THREE_SPORT_CADENCE_CUTOVER_DAY);
  if (ordinal >= cutover) {
    const cycle = sport === "football" ? FOOTBALL_FUTURE_WEIGHTED_CYCLE : UFC_FUTURE_WEIGHTED_CYCLE;
    const appearance = sport === "football" ? ordinal - cutover : Math.floor((ordinal - cutover) / 2);
    // Preserve already-published October 25 Football Hit the Number under v20.
    if (sport === "football" && appearance === 0) return "hit_the_number";
    // Oct 25 UFC Millionaire was published under v20 before the cutover.
    // Its immutable board is playable Oct 25–26; v21 begins Oct 27.
    if (sport === "ufc" && appearance === 0) return "millionaire";
    if (sport === "football" && day >= FOOTBALL_TWO_GAME_HIGHER_LOWER_CUTOVER_DAY) {
      return FOOTBALL_TWO_GAME_HIGHER_LOWER_CYCLE[appearance % FOOTBALL_TWO_GAME_HIGHER_LOWER_CYCLE.length]!;
    }
    if (sport === "ufc" && day >= UFC_TWO_GAME_HIGHER_LOWER_CUTOVER_DAY) {
      return UFC_TWO_GAME_HIGHER_LOWER_CYCLE[appearance % UFC_TWO_GAME_HIGHER_LOWER_CYCLE.length]!;
    }
    return cycle[appearance % cycle.length]!;
  }
  const override = DAILY_GAME_DATE_OVERRIDES[sport][day];
  if (override) return override;
  const cycle = sport === "football" ? FOOTBALL_LOCKED_WEIGHTED_CYCLE : UFC_LOCKED_WEIGHTED_CYCLE;
  const offset = ordinal - dayNumber(DAILY_WEIGHTED_ROTATION_CUTOVER_DAY);
  return cycle[((offset % cycle.length) + cycle.length) % cycle.length]!;
}

export function footballBarTriviaAppearanceIndex(day: string) {
  if (day >= THREE_SPORT_CADENCE_CUTOVER_DAY) {
    if (lockedWeightedGameForDay("football", day) !== "bar_trivia") {
      throw new Error("Football Bar Trivia league is only defined for Bar Trivia Daily dates.");
    }
    const offset = dayNumber(day) - dayNumber(THREE_SPORT_CADENCE_CUTOVER_DAY);
    const cycle = day >= FOOTBALL_TWO_GAME_HIGHER_LOWER_CUTOVER_DAY
      ? FOOTBALL_TWO_GAME_HIGHER_LOWER_CYCLE : FOOTBALL_FUTURE_WEIGHTED_CYCLE;
    const countPerCycle = cycle.filter(game => game === "bar_trivia").length;
    const full = Math.floor(offset / cycle.length);
    const prior = cycle.slice(0, offset % cycle.length).filter(game => game === "bar_trivia").length;
    // Four published Football Bar Trivia appearances: Sep 29, Oct 1, Oct 14, Oct 22.
    // Both future cycles have no Bar Trivia on Oct 25–26, so indexing is stable.
    return 4 + full * countPerCycle + prior;
  }
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
