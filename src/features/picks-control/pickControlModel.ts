import type { PickBoutResultStatus, PickEventStatus } from "../picks/picksModel";
import type { PickSpotlight } from "../picks/spotlightModel";

export type PickControlBoutLiveStatus = "scheduled" | "live" | "final";

export interface PickControlBout {
  boutId: string;
  /** Backend-projected effective deadline for this stable bout. */
  locksAt?: string;
  /** Authoritative server lock state; browser time is presentation-only. */
  isLocked?: boolean;
  /** Trusted provider fight state from the canonical Fight Night monitor. */
  liveStatus: PickControlBoutLiveStatus;
  /** Server-owned permission to move this still-open deadline. */
  canAdjustLock?: boolean;
  position: number;
  weightClass: string;
  redFighterSlug: string;
  redFighterName: string;
  blueFighterSlug: string;
  blueFighterName: string;
  resultStatus: PickBoutResultStatus;
  winnerFighterSlug: string | null;
  resultRecordedAt: string | null;
  includedInPicks: boolean;
  canCancel: boolean;
  canRestore: boolean;
  canReplace: boolean;
  canRemoveFromPicks: boolean;
  canRestoreToPicks: boolean;
  canCorrectResult?: boolean;
  hasReplacementHistory: boolean;
  hasRemovalHistory: boolean;
  hasCorrectionHistory?: boolean;
}

export interface PickControlEventOption {
  eventId: string;
  name: string;
  startsAt: string;
  completedAt: string;
}

export interface PickControlEvent {
  eventId: string;
  name: string;
  subtitle: string;
  venue: string;
  location: string;
  startsAt: string;
  locksAt: string;
  season: number;
  status: PickEventStatus;
  canLock: boolean;
  canComplete: boolean;
  canReorder: boolean;
  hasReorderHistory: boolean;
  recentCompletedEvents?: PickControlEventOption[];
  spotlights?: PickSpotlight[];
  bouts: PickControlBout[];
}

export const pickControlResultOptions = [
  { value: "draw", label: "DRAW" },
  { value: "no_contest", label: "NO CONTEST" },
  { value: "cancelled", label: "CANCELLED" },
] as const satisfies readonly { value: PickBoutResultStatus; label: string }[];

export function resolvedBoutCount(event: PickControlEvent | null) {
  return event?.bouts.filter((bout) => !bout.includedInPicks || bout.resultStatus !== "pending").length ?? 0;
}

export function cancelledBoutCount(event: PickControlEvent | null) {
  return event?.bouts.filter((bout) => bout.resultStatus === "cancelled").length ?? 0;
}

export function removedBoutCount(event: PickControlEvent | null) {
  return event?.bouts.filter((bout) => !bout.includedInPicks).length ?? 0;
}

export function pickControlResultLabel(bout: PickControlBout) {
  if (!bout.includedInPicks) return "REMOVED FROM PICKS";
  if (bout.resultStatus === "red_win") return bout.redFighterName;
  if (bout.resultStatus === "blue_win") return bout.blueFighterName;
  if (bout.resultStatus === "draw") return "DRAW";
  if (bout.resultStatus === "no_contest") return "NO CONTEST";
  if (bout.resultStatus === "cancelled") return "CANCELLED";
  return "PENDING";
}
