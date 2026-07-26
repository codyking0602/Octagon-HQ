export type PickEventStatus = "upcoming" | "locked" | "complete";
export type PickBoutResultStatus = "pending" | "red_win" | "blue_win" | "draw" | "no_contest" | "cancelled";
export type PickVerdict = "correct" | "incorrect" | "missing" | "excluded" | "pending";

export interface PickBout {
  boutId: string;
  position: number;
  weightClass: string;
  redFighterSlug: string;
  redFighterName: string;
  blueFighterSlug: string;
  blueFighterName: string;
  redAmericanOdds: number | null;
  blueAmericanOdds: number | null;
  winnerFighterSlug: string | null;
}

export interface UnderdogLock {
  eventId: string;
  boutId: string;
  fighterSlug: string;
  selectedAt: string;
  frozenAmericanOdds: number | null;
}

export interface PickEvent {
  eventId: string;
  name: string;
  subtitle: string;
  venue: string;
  location: string;
  startsAt: string;
  locksAt: string;
  season: number;
  status: PickEventStatus;
  bouts: PickBout[];
}

export interface ProfileEventPick {
  eventId: string;
  boutId: string;
  fighterSlug: string;
  pickedAt: string;
  updatedAt: string;
}

export interface PickSummary {
  correct: number;
  incorrect: number;
  pending: number;
  eventsEntered: number;
  basePoints: number;
  lockBonus: number;
  totalPoints: number;
}

export interface PickHistoryBout {
  boutId: string;
  position: number;
  weightClass: string;
  redFighterSlug: string;
  redFighterName: string;
  blueFighterSlug: string;
  blueFighterName: string;
  resultStatus: PickBoutResultStatus;
  winnerFighterSlug: string | null;
  pickedFighterSlug: string | null;
  verdict: PickVerdict;
}

export interface PickHistoryRecord {
  correct: number;
  incorrect: number;
  missing: number;
  excluded: number;
  basePoints: number;
  lockBonus: number;
  totalPoints: number;
}

export interface PickGroupResult extends PickHistoryRecord {
  rank: number;
  displayName: string;
  isCurrentUser: boolean;
}

export interface PickHistoryEvent {
  eventId: string;
  name: string;
  subtitle: string;
  venue: string;
  location: string;
  startsAt: string;
  season: number;
  completedAt: string;
  record: PickHistoryRecord;
  underdogLock: UnderdogLock | null;
  bouts: PickHistoryBout[];
  groupResults: PickGroupResult[];
}

export interface PickHistorySummary extends PickHistoryRecord {
  eventsEntered: number;
}

export interface PickHistory {
  season: number | null;
  summary: PickHistorySummary;
  events: PickHistoryEvent[];
}

export const emptyPickSummary: PickSummary = {
  correct: 0,
  incorrect: 0,
  pending: 0,
  eventsEntered: 0,
  basePoints: 0,
  lockBonus: 0,
  totalPoints: 0,
};

export const emptyPickHistory: PickHistory = {
  season: null,
  summary: {
    correct: 0,
    incorrect: 0,
    missing: 0,
    excluded: 0,
    basePoints: 0,
    lockBonus: 0,
    totalPoints: 0,
    eventsEntered: 0,
  },
  events: [],
};

export function eventPicksLocked(event: PickEvent, now = Date.now()) {
  return event.status !== "upcoming" || Date.parse(event.locksAt) <= now;
}

export function underdogBonus(americanOdds: number) {
  if (!Number.isInteger(americanOdds) || americanOdds < 100) return 0;
  return Math.min(7, Math.floor((americanOdds - 100) / 50) + 1);
}

export function americanOddsLabel(odds: number | null) {
  if (odds === null) return null;
  return odds > 0 ? `+${odds}` : `${odds}`;
}

export function pickProgress(event: PickEvent | null, selections: Readonly<Record<string, string>>) {
  if (!event) return { completed: 0, total: 0 };
  return {
    completed: event.bouts.filter((bout) => Boolean(selections[bout.boutId])).length,
    total: event.bouts.length,
  };
}

export function pickRecord(summary: PickSummary) {
  return `${summary.correct}-${summary.incorrect}`;
}

export function mainEvent(event: PickEvent | null) {
  if (!event?.bouts.length) return null;
  return event.bouts.slice().sort((left, right) => left.position - right.position)[0] ?? null;
}
