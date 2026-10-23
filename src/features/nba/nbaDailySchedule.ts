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

/** Twenty-eight slots: 4/4/4, 3/3/3/3, 2/2. Keep the order evenly distributed. */
export const NBA_DAILY_WEIGHTED_CYCLE: readonly NbaDailyGame[] = [
  "average_fan", "sports_feud", "millionaire", "who_am_i", "find_leader",
  "wavelength", "bar_trivia", "hit_the_number", "higher_lower",
  "average_fan", "sports_feud", "millionaire", "who_am_i", "find_leader",
  "wavelength", "bar_trivia", "average_fan", "sports_feud", "millionaire",
  "hit_the_number", "higher_lower", "who_am_i", "find_leader", "wavelength",
  "bar_trivia", "average_fan", "sports_feud", "millionaire",
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
