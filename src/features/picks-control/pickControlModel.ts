import type { PickBoutResultStatus, PickEventStatus } from "../picks/picksModel";

export interface PickControlBout {
  boutId: string;
  position: number;
  weightClass: string;
  redFighterSlug: string;
  redFighterName: string;
  blueFighterSlug: string;
  blueFighterName: string;
  resultStatus: PickBoutResultStatus;
  winnerFighterSlug: string | null;
  resultRecordedAt: string | null;
  canCancel: boolean;
  canRestore: boolean;
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
  bouts: PickControlBout[];
}

export const pickControlResultOptions = [
  { value: "draw", label: "DRAW" },
  { value: "no_contest", label: "NO CONTEST" },
  { value: "cancelled", label: "CANCELLED" },
] as const satisfies readonly { value: PickBoutResultStatus; label: string }[];

export function resolvedBoutCount(event: PickControlEvent | null) {
  return event?.bouts.filter((bout) => bout.resultStatus !== "pending").length ?? 0;
}

export function cancelledBoutCount(event: PickControlEvent | null) {
  return event?.bouts.filter((bout) => bout.resultStatus === "cancelled").length ?? 0;
}

export function pickControlResultLabel(bout: PickControlBout) {
  if (bout.resultStatus === "red_win") return bout.redFighterName;
  if (bout.resultStatus === "blue_win") return bout.blueFighterName;
  if (bout.resultStatus === "draw") return "DRAW";
  if (bout.resultStatus === "no_contest") return "NO CONTEST";
  if (bout.resultStatus === "cancelled") return "CANCELLED";
  return "PENDING";
}
