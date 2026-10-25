/**
 * NON-PUBLISHING planning/audit utility for Parts 2 & 3.
 *
 * Deliberately does not modify canonical DB schedule versions or select a live
 * challenge. Part 1 owns cadence and the eventual immutable schedule cutover.
 * Every candidate game (notably UFC Higher/Lower) still needs content signoff.
 */
import { APPROVED_DAILY_ROTATION_WEIGHTS } from "./dailyContentQualityPolicy";
import { FOOTBALL_LOCKED_WEIGHTED_CYCLE, UFC_LOCKED_WEIGHTED_CYCLE } from "./dailyChallengeRotation";
import { NBA_DAILY_WEIGHTED_CYCLE, NBA_DAILY_WEIGHTS, NBA_REGULAR_SEASON_LAST_DAY } from "../nba/nbaDailySchedule";

export type AuditSport = "football" | "ufc" | "nba";
export interface RotationAuditSlot {
  day: string;
  sport: AuditSport;
  game: string;
}
export interface RotationAuditGame {
  count: number;
  expected: number;
  averageGapDays: number | null;
  maximumGapDays: number | null;
  minimumGapDays: number | null;
  consecutiveAppearances: number;
}
export interface RotationAuditSummary {
  totals: Record<AuditSport, number>;
  games: Record<AuditSport, Record<string, RotationAuditGame>>;
  collisions: { total: number; byPair: Record<string, number>; dates: string[] };
}
export const SIX_MONTH_AUDIT_START = "2026-11-01";
export const SIX_MONTH_AUDIT_DAYS = 181; // through 2027-04-30 inclusive
const MS = 86_400_000;
function ordinal(day: string) {
  const t = Date.parse(day + "T00:00:00Z");
  if (!Number.isFinite(t) || new Date(t).toISOString().slice(0, 10) !== day) {
    throw new Error("Invalid rotation audit day: " + day);
  }
  return t / MS;
}
function dayAt(start: string, offset: number) {
  return new Date((ordinal(start) + offset) * MS).toISOString().slice(0, 10);
}
export const PROPOSED_WEIGHTS: Readonly<Record<AuditSport, Readonly<Record<string, number>>>> = {
  football: { ...APPROVED_DAILY_ROTATION_WEIGHTS.football, higher_lower: 2 },
  ufc: { ...APPROVED_DAILY_ROTATION_WEIGHTS.ufc, higher_lower: 2 },
  nba: NBA_DAILY_WEIGHTS,
};
// The approval policy spells this editorial label differently from its runtime identifier.
delete (PROPOSED_WEIGHTS.football as Record<string, number>).higher_or_lower;
delete (PROPOSED_WEIGHTS.ufc as Record<string, number>).higher_or_lower;

function positiveWeights(sport: AuditSport) {
  return Object.entries(PROPOSED_WEIGHTS[sport])
    .filter(([, value]) => value > 0)
    .sort(([a], [b]) => a.localeCompare(b));
}
function spreadCost(cycle: readonly string[], weights: readonly [string, number][]) {
  let cost = 0;
  for (const [game, count] of weights) {
    const positions = cycle.flatMap((entry, index) => entry === game ? [index] : []);
    if (positions.length !== count) return Infinity;
    const ideal = cycle.length / count;
    for (let j = 0; j < positions.length; j++) {
      const next = positions[(j + 1) % positions.length]!;
      const gap = (next - positions[j]! + cycle.length) % cycle.length || cycle.length;
      cost += (gap - ideal) ** 2;
      if (gap === 1) cost += 100;
    }
  }
  return cost;
}
function initialCycle(weights: readonly [string, number][]) {
  const length = weights.reduce((total, [, count]) => total + count, 0);
  const counts = new Map(weights.map(([game]) => [game, 0]));
  const cycle: string[] = [];
  for (let index = 0; index < length; index++) {
    const candidates = weights.filter(([game, count]) => counts.get(game)! < count)
      .map(([game, count]) => {
        const previous = cycle.lastIndexOf(game);
        const target = (index + 1) * count / length;
        const lag = target - counts.get(game)!;
        const shortGap = previous < 0 ? 0 : Math.max(0, length / count - (index - previous));
        return { game, lag, shortGap };
      })
      .sort((a, b) => (b.lag - b.shortGap * 0.13) - (a.lag - a.shortGap * 0.13)
        || a.game.localeCompare(b.game));
    const next = candidates[0];
    if (!next) throw new Error("Weighted preview exhausted its choices.");
    cycle.push(next.game);
    counts.set(next.game, counts.get(next.game)! + 1);
  }
  return cycle;
}
function optimizeCycle(
  cycle: string[],
  weights: readonly [string, number][],
  extra: (candidate: readonly string[]) => number,
) {
  const result = [...cycle];
  let score = () => spreadCost(result, weights) + extra(result);
  for (let pass = 0; pass < 12; pass++) {
    let improved = false;
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        if (result[i] === result[j]) continue;
        const current = score();
        [result[i], result[j]] = [result[j]!, result[i]!];
        if (score() + 1e-8 < current) improved = true;
        else [result[i], result[j]] = [result[j]!, result[i]!];
      }
    }
    if (!improved) break;
  }
  return result;
}
function scheduleFromCycles(start: string, days: number, cycles: { football: string[]; ufc: string[]; nba: readonly string[] }) {
  const slots: RotationAuditSlot[] = [];
  for (let index = 0; index < days; index++) {
    const day = dayAt(start, index);
    slots.push({ day, sport: "football", game: cycles.football[index % cycles.football.length]! });
    if (index % 2 === 0) slots.push({ day, sport: "nba", game: cycles.nba[(index / 2) % cycles.nba.length]! });
    else slots.push({ day, sport: "ufc", game: cycles.ufc[((index - 1) / 2) % cycles.ufc.length]! });
  }
  return slots;
}
/**
 * Unreleased ideal preview ONLY, with NBA extended past Apr 11 to demonstrate
 * the full six-month demand. Part 1 must decide its season-end release scope.
 */
export function previewApprovedDailyRotation(start = SIX_MONTH_AUDIT_START, days = SIX_MONTH_AUDIT_DAYS) {
  const footballWeights = positiveWeights("football");
  const ufcWeights = positiveWeights("ufc");
  const nbaCycle = [...NBA_DAILY_WEIGHTED_CYCLE];
  const ufcCycle = optimizeCycle(initialCycle(ufcWeights), ufcWeights, () => 0);
  const initialFootball = initialCycle(footballWeights);
  const extra = (footballCycle: readonly string[]) => {
    let collisions = 0;
    for (let d = 0; d < days; d++) {
      const other = d % 2 === 0
        ? nbaCycle[(d / 2) % nbaCycle.length]
        : ufcCycle[((d - 1) / 2) % ufcCycle.length];
      if (footballCycle[d % footballCycle.length] === other) collisions++;
    }
    return collisions * 5;
  };
  const footballCycle = optimizeCycle(initialFootball, footballWeights, extra);
  return {
    cycles: { football: footballCycle, ufc: ufcCycle, nba: nbaCycle },
    slots: scheduleFromCycles(start, days, { football: footballCycle, ufc: ufcCycle, nba: nbaCycle }),
    live: false as const,
    requiresGameCertification: ["football:higher_lower", "ufc:higher_lower"] as const,
  };
}
/** Actual client-side pre-Part-1 cycles, for apples-to-apples gap comparisons. */
export function auditCurrentMainBaseline(start = SIX_MONTH_AUDIT_START, days = SIX_MONTH_AUDIT_DAYS) {
  const slots: RotationAuditSlot[] = [];
  const anchor = ordinal("2026-10-01");
  for (let d = 0; d < days; d++) {
    const day = dayAt(start, d);
    const offset = ordinal(day) - anchor;
    slots.push({
      day, sport: "football",
      game: FOOTBALL_LOCKED_WEIGHTED_CYCLE[offset % FOOTBALL_LOCKED_WEIGHTED_CYCLE.length]!,
    });
    slots.push({
      day, sport: "ufc",
      game: UFC_LOCKED_WEIGHTED_CYCLE[offset % UFC_LOCKED_WEIGHTED_CYCLE.length]!,
    });
    if (d % 2 === 0 && day <= NBA_REGULAR_SEASON_LAST_DAY) {
      slots.push({ day, sport: "nba", game: NBA_DAILY_WEIGHTED_CYCLE[(d / 2) % NBA_DAILY_WEIGHTED_CYCLE.length]! });
    }
  }
  return slots;
}
export function summarizeRotation(slots: readonly RotationAuditSlot[]): RotationAuditSummary {
  const totals: Record<AuditSport, number> = { football: 0, ufc: 0, nba: 0 };
  const games: RotationAuditSummary["games"] = { football: {}, ufc: {}, nba: {} };
  const collisions: RotationAuditSummary["collisions"] = { total: 0, byPair: {}, dates: [] };
  const byDay = new Map<string, RotationAuditSlot[]>();
  for (const slot of slots) {
    totals[slot.sport]++;
    (byDay.get(slot.day) ?? (byDay.set(slot.day, []), byDay.get(slot.day)!)).push(slot);
  }
  for (const sport of ["football", "ufc", "nba"] as const) {
    const sportSlots = slots.filter(slot => slot.sport === sport);
    const quotas = positiveWeights(sport);
    const weightTotal = quotas.reduce((sum, [, weight]) => sum + weight, 0);
    const uniqueGames = new Set(sportSlots.map(slot => slot.game));
    for (const name of uniqueGames) {
      const dates = sportSlots.filter(slot => slot.game === name).map(slot => ordinal(slot.day));
      const gaps = dates.slice(1).map((value, index) => value - dates[index]!);
      const weight = quotas.find(([game]) => game === name)?.[1] ?? 0;
      games[sport][name] = {
        count: dates.length,
        expected: weightTotal ? sportSlots.length * weight / weightTotal : 0,
        averageGapDays: gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null,
        maximumGapDays: gaps.length ? Math.max(...gaps) : null,
        minimumGapDays: gaps.length ? Math.min(...gaps) : null,
        consecutiveAppearances: gaps.filter(gap => gap === (sport === "football" ? 1 : 2)).length,
      };
    }
  }
  for (const [day, items] of byDay) {
    for (let a = 0; a < items.length; a++) {
      for (let b = a + 1; b < items.length; b++) {
        if (items[a]!.game !== items[b]!.game) continue;
        const pair = [items[a]!.sport, items[b]!.sport].sort().join("+");
        collisions.byPair[pair] = (collisions.byPair[pair] ?? 0) + 1;
        collisions.total++;
        collisions.dates.push(day);
      }
    }
  }
  return { totals, games, collisions };
}
