import type { PickSpotlight } from "./spotlightModel";

export type PickEventStatus = "upcoming" | "locked" | "complete";
export type PickBoutResultStatus = "pending" | "red_win" | "blue_win" | "draw" | "no_contest" | "cancelled";
export type PickVerdict = "correct" | "incorrect" | "missing" | "excluded" | "pending";
export type PickEventPresentationState = "upcoming" | "locked" | "awaiting_results" | "complete";
export type PickEventSpotlight = PickSpotlight;

export interface PickGroupPick {
  displayName: string;
  pickedFighterSlug: string | null;
  isCurrentUser: boolean;
}

export interface PickWatchMoment {
  title: string;
  url: string;
}

export interface PickBout {
  boutId: string;
  /** Backend-projected deadline for the later per-fight lock UI. */
  locksAt?: string;
  /** Effective server-owned state; never use browser time for authorization. */
  isLocked?: boolean;
  position: number;
  weightClass: string;
  redFighterSlug: string;
  redFighterName: string;
  blueFighterSlug: string;
  blueFighterName: string;
  redAmericanOdds: number | null;
  blueAmericanOdds: number | null;
  oddsSource?: string | null;
  oddsUpdatedAt?: string | null;
  winnerFighterSlug: string | null;
  resultStatus?: PickBoutResultStatus;
  resultRecordedAt?: string | null;
  includedInPicks?: boolean;
  groupPicks?: PickGroupPick[];
  repickRequired?: boolean;
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
  canControl?: boolean;
  headerStoragePath?: string | null;
  headerNaturalWidth?: number | null;
  headerNaturalHeight?: number | null;
  spotlights?: PickEventSpotlight[];
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
  includedInPicks?: boolean;
  groupPicks?: PickGroupPick[];
  repickRequired?: boolean;
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
  profileId?: string | null;
  displayName: string;
  isCurrentUser: boolean;
}

export interface PickSeasonStanding extends PickHistoryRecord {
  rank: number;
  profileId: string | null;
  displayName: string;
  isCurrentUser: boolean;
  eventsEntered: number;
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
  headerStoragePath?: string | null;
  headerNaturalWidth?: number | null;
  headerNaturalHeight?: number | null;
  record: PickHistoryRecord;
  underdogLock: UnderdogLock | null;
  watchMoments?: PickWatchMoment[];
  bouts: PickHistoryBout[];
  groupResults: PickGroupResult[];
}

export interface PickHistorySummary extends PickHistoryRecord {
  eventsEntered: number;
}

export interface PickHistory {
  season: number | null;
  summary: PickHistorySummary;
  seasonStandings?: PickSeasonStanding[];
  events: PickHistoryEvent[];
}

export interface PickEventPresentation {
  state: PickEventPresentationState;
  eyebrow: string;
  status: string;
}

export const underdogBonusTiers = [
  { odds: "+100–149", bonus: "+1" },
  { odds: "+150–199", bonus: "+2" },
  { odds: "+200–249", bonus: "+3" },
  { odds: "+250–299", bonus: "+4" },
  { odds: "+300–349", bonus: "+5" },
  { odds: "+350–399", bonus: "+6" },
  { odds: "+400+", bonus: "+7" },
] as const;

export function underdogBonusForOdds(odds: number | null) {
  if (odds === null || odds < 100) return 0;
  if (odds >= 400) return 7;
  return Math.floor((odds - 100) / 50) + 1;
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
  seasonStandings: [],
  events: [],
};

export function pickEventPresentation(event: PickEvent, now = Date.now()): PickEventPresentation {
  if (event.status === "complete") {
    return { state: "complete", eyebrow: "EVENT COMPLETE", status: "COMPLETE" };
  }

  const hasRecordedFightResult = event.bouts.some((bout) => {
    if (bout.includedInPicks === false) return false;
    const result = bout.resultStatus ?? "pending";
    return result !== "pending" && result !== "cancelled";
  });
  const eventStarted = Date.parse(event.startsAt) <= now;

  if (eventStarted || hasRecordedFightResult) {
    return { state: "awaiting_results", eyebrow: "EVENT IN PROGRESS", status: "AWAITING RESULTS" };
  }

  if (event.status === "locked") {
    return { state: "locked", eyebrow: "PICKS LOCKED", status: "LOCKED" };
  }

  return { state: "upcoming", eyebrow: "NEXT UFC EVENT", status: "UPCOMING" };
}

export function eventPicksLocked(event: PickEvent, now = Date.now()) {
  return pickEventPresentation(event, now).state !== "upcoming";
}

export function pickBoutLocked(event: PickEvent, bout: PickBout) {
  return event.status !== "upcoming" || bout.isLocked === true;
}

export function americanOddsLabel(odds: number | null) {
  if (odds === null) return null;
  return odds > 0 ? `+${odds}` : `${odds}`;
}

export function pickProgress(event: PickEvent | null, selections: Readonly<Record<string, string>>) {
  if (!event) return { completed: 0, total: 0 };
  const eligibleBouts = event.bouts.filter((bout) => (
    bout.includedInPicks !== false && (bout.resultStatus ?? "pending") !== "cancelled"
  ));
  return {
    completed: eligibleBouts.filter((bout) => Boolean(selections[bout.boutId])).length,
    total: eligibleBouts.length,
  };
}

export function pickRecord(summary: PickSummary) {
  return `${summary.correct}-${summary.incorrect}`;
}

export function pickWinPercentage(correct: number, incorrect: number) {
  const decided = correct + incorrect;
  return decided > 0 ? (correct / decided) * 100 : 0;
}

export function mainEvent(event: PickEvent | null) {
  if (!event?.bouts.length) return null;
  return event.bouts.slice().sort((left, right) => left.position - right.position)[0] ?? null;
}

export function groupRankLabel(rank: number, results: readonly { rank: number }[]) {
  return results.filter((result) => result.rank === rank).length > 1 ? `T-${rank}` : `${rank}`;
}

export function mainCardFightLabel(index: number) {
  return index === 0 ? "MAIN EVENT" : `MAIN CARD · FIGHT ${index + 1}`;
}
