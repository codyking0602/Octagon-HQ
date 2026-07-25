export type PickEventStatus = "upcoming" | "locked" | "complete";

export interface PickBout {
  boutId: string;
  position: number;
  weightClass: string;
  redFighterSlug: string;
  redFighterName: string;
  blueFighterSlug: string;
  blueFighterName: string;
  winnerFighterSlug: string | null;
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
}

export const emptyPickSummary: PickSummary = {
  correct: 0,
  incorrect: 0,
  pending: 0,
  eventsEntered: 0,
};

export function eventPicksLocked(event: PickEvent, now = Date.now()) {
  return event.status !== "upcoming" || Date.parse(event.locksAt) <= now;
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
