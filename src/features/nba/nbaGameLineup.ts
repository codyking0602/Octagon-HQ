/** Owner-only NBA launch rehearsal. No official Daily publication or leaderboard writes. */
export const NBA_DAILY_PREVIEW_ANCHOR = "2026-10-23";

export const NBA_GAME_LINEUP = [
  { id: "who-am-i", title: "Who Am I?", description: "Identify the NBA player from progressively stronger clues.", casualRoute: "/nba/who-am-i", dailyPreviewReady: false },
  { id: "hit-the-number", title: "Hit the Number", description: "Build a stat total without going over the target.", casualRoute: "/nba/hit-the-number", dailyPreviewReady: false },
  { id: "find-the-leader", title: "Find the Leader", description: "Eliminate nine players and protect the hidden stat leader.", casualRoute: "/nba/find-the-leader", dailyPreviewReady: true },
  { id: "higher-lower", title: "Higher or Lower", description: "Ten head-to-head comparisons against the clock.", casualRoute: "/nba/higher-lower", dailyPreviewReady: true },
  { id: "millionaire", title: "Millionaire", description: "Eight questions, three lifelines, one million-dollar ladder.", casualRoute: "/nba/millionaire", dailyPreviewReady: true },
  { id: "average-fan", title: "Average Fan", description: "Take on eight grade-level questions and a protected Final.", casualRoute: "/nba/average-fan", dailyPreviewReady: true },
  { id: "wavelength", title: "Wavelength", description: "Find two hidden numbers from adaptive basketball clues.", casualRoute: "/nba/wavelength", dailyPreviewReady: true },
  { id: "sports-feud", title: "Sports Feud", description: "Two answer boards followed by Fast Money.", casualRoute: null, dailyPreviewReady: true },
  { id: "bar-trivia", title: "Bar Trivia", description: "Three rounds, rising difficulty and Last Call.", casualRoute: null, dailyPreviewReady: true },
] as const;

export type NbaGameId = (typeof NBA_GAME_LINEUP)[number]["id"];
export type NbaGame = (typeof NBA_GAME_LINEUP)[number];

export const NBA_CASUAL_GAME_IDS: readonly NbaGameId[] =
  NBA_GAME_LINEUP.filter((game) => game.casualRoute !== null).map((game) => game.id);

export const NBA_DAILY_ONLY_GAME_IDS: readonly NbaGameId[] = ["sports-feud", "bar-trivia"];

/** One game a day. A 30-day pattern, NOT a promise of exact calendar-month totals.
 * Evenly spaced slots, no adjacent duplicates, including at cycle boundaries.
 * Four appearances each for the flagship formats; NBA Higher/Lower gets two.
 * Average Fan, Feud, and Trivia can last at least four full cycles without
 * repeating authored prompts at their current inventory levels.
 */
export const NBA_DAILY_30_DAY_CYCLE: readonly NbaGameId[] = [
  "sports-feud", "average-fan", "who-am-i", "wavelength", "find-the-leader",
  "millionaire", "higher-lower", "bar-trivia", "sports-feud", "who-am-i",
  "hit-the-number", "average-fan", "wavelength", "find-the-leader", "millionaire",
  "sports-feud", "bar-trivia", "who-am-i", "average-fan", "millionaire",
  "hit-the-number", "higher-lower", "wavelength", "sports-feud", "find-the-leader",
  "who-am-i", "average-fan", "bar-trivia", "millionaire", "hit-the-number",
];

export const NBA_DAILY_FREQUENCIES: Readonly<Record<NbaGameId, number>> = {
  "who-am-i": 4, "hit-the-number": 3, "find-the-leader": 3,
  "higher-lower": 2, millionaire: 4, "average-fan": 4,
  wavelength: 3, "sports-feud": 4, "bar-trivia": 3,
};

export function nbaGameById(id: NbaGameId): NbaGame {
  const game = NBA_GAME_LINEUP.find((item) => item.id === id);
  if (!game) throw new Error("Unknown NBA game: " + id);
  return game;
}

function dayNumber(day: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("NBA day must be YYYY-MM-DD.");
  const [year, month, date] = day.split("-").map(Number);
  const stamp = Date.UTC(year!, month! - 1, date!);
  if (new Date(stamp).toISOString().slice(0, 10) !== day) {
    throw new Error("Invalid NBA calendar day.");
  }
  return Math.floor(stamp / 86_400_000);
}

export function nbaChicagoDay(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return part("year") + "-" + part("month") + "-" + part("day");
}

export function nbaOffsetDay(day: string, offset: number): string {
  if (!Number.isSafeInteger(offset)) throw new Error("NBA day offset must be an integer.");
  return new Date((dayNumber(day) + offset) * 86_400_000).toISOString().slice(0, 10);
}

export function nbaDailyGameForDay(day: string): NbaGameId {
  const offset = dayNumber(day) - dayNumber(NBA_DAILY_PREVIEW_ANCHOR);
  const slot = ((offset % NBA_DAILY_30_DAY_CYCLE.length) + NBA_DAILY_30_DAY_CYCLE.length)
    % NBA_DAILY_30_DAY_CYCLE.length;
  return NBA_DAILY_30_DAY_CYCLE[slot]!;
}

/** Appearance ordinal, not calendar day. Never use game day as Feud/Trivia slot. */
export function nbaDailyAppearanceIndex(day: string, id: NbaGameId): number {
  if (nbaDailyGameForDay(day) !== id) throw new Error(id + " is not scheduled on " + day);
  const offset = dayNumber(day) - dayNumber(NBA_DAILY_PREVIEW_ANCHOR);
  if (offset < 0) return 0; // before preview anchor: never generate a negative bank slot
  const cycles = Math.floor(offset / NBA_DAILY_30_DAY_CYCLE.length);
  const partial = NBA_DAILY_30_DAY_CYCLE
    .slice(0, offset % NBA_DAILY_30_DAY_CYCLE.length).filter((game) => game === id).length;
  return cycles * NBA_DAILY_FREQUENCIES[id] + partial;
}

export function nbaDailyOwnerPreviewRoute(day: string): { route: string; deterministic: boolean } {
  const game = nbaGameById(nbaDailyGameForDay(day));
  if (!game.dailyPreviewReady) {
    // These two currently have Casual gameplay, not date-locked Daily boards.
    return { route: game.casualRoute!, deterministic: false };
  }
  const base = "/nba/" + game.id + "?mode=daily";
  if (game.id === "sports-feud") {
    return { route: base + "&appearance=" + nbaDailyAppearanceIndex(day, game.id), deterministic: true };
  }
  if (game.id === "bar-trivia") {
    return { route: base + "&slot=" + nbaDailyAppearanceIndex(day, game.id), deterministic: true };
  }
  if (game.id === "average-fan") {
    return { route: base + "&day=" + day, deterministic: true };
  }
  return { route: base, deterministic: true };
}
