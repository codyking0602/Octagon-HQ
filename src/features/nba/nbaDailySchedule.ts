/** NBA games release calendar. Dates are interpreted in America/Chicago. */
export const NBA_GAMES_LAUNCH_DAY = "2026-11-01";
export const NBA_REGULAR_SEASON_LAST_DAY = "2027-04-11";
export const NBA_OWNER_PREVIEW_FIRST_DAY = "2026-10-23";

export const NBA_DAILY_GAME_LABELS = {
  average_fan: "Average Fan",
  sports_feud: "Sports Feud",
  millionaire: "Millionaire",
  who_am_i: "Who Am I?",
  find_leader: "Find the Leader",
  wavelength: "Wavelength",
  bar_trivia: "Bar Trivia",
  hit_the_number: "Hit the Number",
  higher_lower: "Higher or Lower",
} as const;

export type NbaDailyGame = keyof typeof NBA_DAILY_GAME_LABELS;

/** Basketball-only Daily copy. Shared UFC and Football instructions remain unchanged. */
export const NBA_DAILY_GAME_INSTRUCTIONS: Record<NbaDailyGame, string> = {
  average_fan: "Choose a fan, clear 10 NBA grade-and-subject tiles, then bank your score or play the Final.",
  sports_feud: "Clear two NBA answer boards before three strikes, then finish Fast Money.",
  millionaire: "Eight NBA questions. Three lifelines. Climb to $1,000,000.",
  who_am_i: "Identify NBA players from clue pairs before the score falls, or recover on the final board.",
  find_leader: "Eliminate nine NBA players while leaving today's statistical leader standing.",
  wavelength: "Use four basketball clues to guess the hidden rating from 1 to 100.",
  bar_trivia: "Ten NBA questions, a Double Round, rising streaks, and Last Call.",
  hit_the_number: "Choose NBA players to reach today's stat target without going over.",
  higher_lower: "Compare ten NBA seasons and legends. Make every higher-or-lower call count.",
};

/** Twenty-eight NBA slots, spread across the season with approved 4/4/4, 3/3/3/3, 2/2 weights. */
export const NBA_DAILY_WEIGHTED_CYCLE: readonly NbaDailyGame[] = [
  "average_fan",
  "bar_trivia",
  "who_am_i",
  "millionaire",
  "hit_the_number",
  "sports_feud",
  "wavelength",
  "find_leader",
  "average_fan",
  "higher_lower",
  "bar_trivia",
  "millionaire",
  "who_am_i",
  "average_fan",
  "sports_feud",
  "wavelength",
  "find_leader",
  "millionaire",
  "hit_the_number",
  "bar_trivia",
  "sports_feud",
  "average_fan",
  "who_am_i",
  "higher_lower",
  "millionaire",
  "wavelength",
  "find_leader",
  "sports_feud",
];

export const NBA_DAILY_WEIGHTS: Readonly<Record<NbaDailyGame, number>> = {
  average_fan: 4,
  sports_feud: 4,
  millionaire: 4,
  who_am_i: 3,
  find_leader: 3,
  wavelength: 3,
  bar_trivia: 3,
  hit_the_number: 2,
  higher_lower: 2,
};

export const NBA_CASUAL_GAME_TYPES = [
  "who_am_i", "find_leader", "hit_the_number", "higher_lower",
] as const satisfies readonly NbaDailyGame[];

/** One different game per calendar day for owner preview, Oct 23–31. */
export const NBA_OWNER_PREVIEW_ORDER: readonly NbaDailyGame[] = [
  "average_fan", "sports_feud", "millionaire", "who_am_i", "find_leader",
  "wavelength", "bar_trivia", "hit_the_number", "higher_lower",
];

/**
 * Keep this off until ALL nine games have server-owned submissions, standings,
 * answer-safe result drilldowns and launch notification wired and verified.
 * Date alone must never make local owner previews public.
 */
export const NBA_OFFICIAL_GAMES_RELEASE_READY = false;

const DAY_MS = 86_400_000;
function ordinal(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Invalid NBA Central date.");
  const [year, month, date] = day.split("-").map(Number);
  const value = Date.UTC(year!, month! - 1, date!);
  if (new Date(value).toISOString().slice(0, 10) !== day) throw new Error("Invalid NBA Central date.");
  return Math.floor(value / DAY_MS);
}
function fromOrdinal(index: number) {
  return new Date(index * DAY_MS).toISOString().slice(0, 10);
}

export function nbaCentralDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export interface NbaDailyScheduleSlot {
  day: string;
  nextDay: string;
  gameType: NbaDailyGame;
  appearanceIndex: number;
  /** Daily challenge remains open on the intervening day. */
  isPublicationDay: boolean;
}

/** Only published on Nov 1, 3, 5, ... through the end of the regular season. */
export function nbaRegularSeasonDaily(day: string): NbaDailyScheduleSlot | null {
  const target = ordinal(day);
  const first = ordinal(NBA_GAMES_LAUNCH_DAY);
  const last = ordinal(NBA_REGULAR_SEASON_LAST_DAY);
  if (target < first || target > last) return null;
  const appearanceIndex = Math.floor((target - first) / 2);
  const scheduled = first + appearanceIndex * 2;
  return {
    day: fromOrdinal(scheduled),
    nextDay: fromOrdinal(scheduled + 2),
    gameType: NBA_DAILY_WEIGHTED_CYCLE[appearanceIndex % NBA_DAILY_WEIGHTED_CYCLE.length]!,
    appearanceIndex,
    isPublicationDay: scheduled === target,
  };
}

export function nbaOwnerPreviewDaily(day: string): NbaDailyGame | null {
  const offset = ordinal(day) - ordinal(NBA_OWNER_PREVIEW_FIRST_DAY);
  if (offset < 0 || ordinal(day) >= ordinal(NBA_GAMES_LAUNCH_DAY)) return null;
  return NBA_OWNER_PREVIEW_ORDER[offset] ?? null;
}

export function nbaCanAccessReleasedGames(day: string) {
  return NBA_OFFICIAL_GAMES_RELEASE_READY && ordinal(day) >= ordinal(NBA_GAMES_LAUNCH_DAY);
}
