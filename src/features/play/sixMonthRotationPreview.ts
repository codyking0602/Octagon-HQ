/**
 * FUTURE-ONLY six-month rotation rehearsal. This module does not publish or
 * register schedule versions. Part 1 owns the authoritative cadence cutover.
 * Run content certification before transplanting a versioned plan to the backend.
 */
import { APPROVED_DAILY_ROTATION_WEIGHTS } from "./dailyContentQualityPolicy";
import { lockedWeightedGameForDay } from "./dailyChallengeRotation";
import {
  NBA_DAILY_WEIGHTS,
  NBA_DAILY_WEIGHTED_CYCLE,
  NBA_GAMES_LAUNCH_DAY,
} from "../nba/nbaDailySchedule";

export const SIX_MONTH_AUDIT_START = "2026-10-25";
export const SIX_MONTH_AUDIT_END = "2027-04-25";
export const NBA_OPPOSITE_CADENCE_ANCHOR = "2026-11-01";
export const SIX_MONTH_PREVIEW_VERSION = "six-month-balanced-preview-v1";

export type PreviewSport = "football" | "ufc" | "nba";
export type PreviewSlot = { day: string; sport: PreviewSport; game: string };
export type PreviewGap = {
  appearances: number;
  averageDays: number | null;
  minDays: number | null;
  maxDays: number | null;
};

export const PREVIEW_WEIGHTS: Readonly<Record<PreviewSport, Readonly<Record<string, number>>>> = {
  football: Object.fromEntries(Object.entries(APPROVED_DAILY_ROTATION_WEIGHTS.football)
    .filter(([, weight]) => weight > 0)
    .map(([game, weight]) => [game === "higher_or_lower" ? "higher_lower" : game, weight])),
  ufc: Object.fromEntries(Object.entries(APPROVED_DAILY_ROTATION_WEIGHTS.ufc)
    .filter(([, weight]) => weight > 0)
    .map(([game, weight]) => [game === "higher_or_lower" ? "higher_lower" : game, weight])),
  nba: NBA_DAILY_WEIGHTS,
};

function ordinal(day: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Invalid Central day: " + day);
  const [year, month, date] = day.split("-").map(Number);
  const value = Date.UTC(year!, month! - 1, date!);
  if (new Date(value).toISOString().slice(0, 10) !== day) throw new Error("Invalid Central day: " + day);
  return value / 86_400_000;
}

function fromOrdinal(index: number) {
  return new Date(index * 86_400_000).toISOString().slice(0, 10);
}

export function previewDays(first = SIX_MONTH_AUDIT_START, last = SIX_MONTH_AUDIT_END): string[] {
  const a = ordinal(first), b = ordinal(last);
  if (a > b || b - a > 366) throw new Error("Invalid six-month audit range.");
  return Array.from({ length: b - a + 1 }, (_, index) => fromOrdinal(a + index));
}

export function previewPublicationDates(
  sport: PreviewSport,
  days: readonly string[] = previewDays(),
): string[] {
  if (sport === "football") return [...days];
  if (sport === "nba") return days.filter((day) =>
    day >= NBA_GAMES_LAUNCH_DAY && (ordinal(day) - ordinal(NBA_OPPOSITE_CADENCE_ANCHOR)) % 2 === 0);
  return days.filter((day) =>
    (ordinal(day) - ordinal(NBA_OPPOSITE_CADENCE_ANCHOR)) % 2 !== 0);
}

/**
 * Balanced quota/urgency rotation. Every completed weight cycle has exactly
 * the approved quotas; urgency spreads occurrences through each cycle.
 * A small collision penalty is applied only after weights and spacing.
 * Dates are computed from a fixed anchor, never from job invocation order.
 */
function distribute(
  sport: PreviewSport,
  dates: readonly string[],
  occupied: Readonly<Record<string, string>>,
): PreviewSlot[] {
  const weights = PREVIEW_WEIGHTS[sport];
  const entries = Object.entries(weights).sort(([a], [b]) => a.localeCompare(b));
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  const counts = Object.fromEntries(entries.map(([game]) => [game, 0])) as Record<string, number>;
  const last = new Map<string, number>();
  const result: PreviewSlot[] = [];

  for (const [index, day] of dates.entries()) {
    const block = Math.floor(index / total);
    const candidates = entries
      .filter(([game, weight]) => counts[game]! - block * weight < weight)
      .map(([game, weight]) => {
        const interval = total / weight;
        const gap = last.has(game) ? index - last.get(game)! : Infinity;
        const urgency = (index - (counts[game]! + 0.5) * interval) / interval;
        const spacingPenalty = gap < Math.max(2, interval * 0.48) ? 0.45 : 0;
        const collisionPenalty = occupied[day] === game ? 0.12 : 0;
        return { game, score: urgency - spacingPenalty - collisionPenalty };
      })
      .sort((a, b) => b.score - a.score || a.game.localeCompare(b.game));
    const game = candidates[0]?.game;
    if (!game) throw new Error("No quota-feasible " + sport + " game for " + day);
    counts[game]!++;
    last.set(game, index);
    result.push({ sport, day, game });
  }
  return result;
}

export function buildSixMonthRotationPreview() {
  const days = previewDays();
  const nbaDates = previewPublicationDates("nba", days);
  const ufcDates = previewPublicationDates("ufc", days);
  // Basketball is planned first; Football then avoids Basketball where feasible;
  // UFC then avoids Football. Other constraints win before collision minimization.
  // NBA already has an approved, well-spaced 28-slot order. Preserve it
  // exactly so the first 81 dates remain compatible with its date/ordinal
  // publication logic; the seven additional April dates require Part 1 support.
  const nba: PreviewSlot[] = nbaDates.map((day, index) => ({
    day, sport: "nba",
    game: NBA_DAILY_WEIGHTED_CYCLE[index % NBA_DAILY_WEIGHTED_CYCLE.length]!,
  }));
  const occupied = Object.fromEntries(nba.map((slot) => [slot.day, slot.game]));
  const football = distribute("football", days, occupied);
  football.forEach((slot) => { occupied[slot.day] = slot.game; });
  const ufc = distribute("ufc", ufcDates, occupied);
  return { football, ufc, nba } as const;
}

/** Before values use current main's legacy weighted cycles on Part 1 date masks. */
export function buildMaskedLegacyComparison() {
  const days = previewDays();
  const football = days.map((day) =>
    ({ day, sport: "football" as const, game: lockedWeightedGameForDay("football", day) }));
  const ufc = previewPublicationDates("ufc", days).map((day) =>
    ({ day, sport: "ufc" as const, game: lockedWeightedGameForDay("ufc", day) }));
  const nba = previewPublicationDates("nba", days).map((day, index) => ({
    day, sport: "nba" as const,
    // Projections after the existing Apr 11 NBA season are hypothetical until
    // Part 1 extends the official publication window (7 missing NBA dates).
    game: NBA_DAILY_WEIGHTED_CYCLE[index % NBA_DAILY_WEIGHTED_CYCLE.length]!,
  }));
  return { football, ufc, nba };
}

export function previewCounts(slots: readonly PreviewSlot[]) {
  const counts: Record<string, number> = {};
  slots.forEach(({ game }) => { counts[game] = (counts[game] ?? 0) + 1; });
  return counts;
}

export function previewGaps(slots: readonly PreviewSlot[]): Record<string, PreviewGap> {
  const datesByGame: Record<string, number[]> = {};
  slots.forEach(({ day, game }) => { (datesByGame[game] ??= []).push(ordinal(day)); });
  return Object.fromEntries(Object.entries(datesByGame).map(([game, ordinals]) => {
    const gaps = ordinals.slice(1).map((value, i) => value - ordinals[i]!);
    return [game, {
      appearances: ordinals.length,
      averageDays: gaps.length ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length : null,
      minDays: gaps.length ? Math.min(...gaps) : null,
      maxDays: gaps.length ? Math.max(...gaps) : null,
    }];
  }));
}

export function previewCollisions(plan: ReturnType<typeof buildSixMonthRotationPreview>) {
  const football = Object.fromEntries(plan.football.map((slot) => [slot.day, slot.game]));
  const basketball = Object.fromEntries(plan.nba.map((slot) => [slot.day, slot.game]));
  const ufcFootball = plan.ufc.filter((slot) => football[slot.day] === slot.game)
    .map((slot) => slot.day);
  const nbaFootball = plan.nba.filter((slot) => football[slot.day] === slot.game)
    .map((slot) => slot.day);
  const ufcNba = plan.ufc.filter((slot) => basketball[slot.day] === slot.game)
    .map((slot) => slot.day);
  return { ufcFootball, nbaFootball, ufcNba, total: ufcFootball.length + nbaFootball.length + ufcNba.length };
}
