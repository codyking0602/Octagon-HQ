import type { PickControlBout, PickControlEvent } from "./pickControlModel";

export const PICK_LOCK_MINUTE_MS = 60_000;
const MAX_BROWSER_TIMEOUT_MS = 2_147_000_000;

export function effectivePickControlBoutLock(
  event: PickControlEvent,
  bout: PickControlBout,
) {
  return bout.locksAt ?? event.locksAt;
}

export function pickControlBoutIsFinal(
  event: PickControlEvent,
  bout: PickControlBout,
  now: number,
) {
  const deadline = Date.parse(effectivePickControlBoutLock(event, bout));
  return event.status !== "upcoming"
    || bout.resultStatus !== "pending"
    || bout.includedInPicks === false
    || bout.isLocked === true
    || !Number.isFinite(deadline)
    || now >= deadline;
}

export function pickControlBoutCanSetDeadline(
  event: PickControlEvent,
  bout: PickControlBout,
) {
  return event.status === "upcoming"
    && bout.resultStatus === "pending"
    && bout.includedInPicks !== false;
}

export function pickControlBoutCanRecordResult(
  event: PickControlEvent,
  bout: PickControlBout,
  now: number,
) {
  if (!pickControlBoutCanSetDeadline(event, bout)) return false;
  const deadline = Date.parse(effectivePickControlBoutLock(event, bout));
  return bout.isLocked === true
    || (Number.isFinite(deadline) && now >= deadline);
}

export function pickControlBoutCanExtend(
  event: PickControlEvent,
  bout: PickControlBout,
  now: number,
) {
  return pickControlBoutCanSetDeadline(event, bout)
    && bout.canAdjustLock === true
    && !pickControlBoutIsFinal(event, bout, now);
}

export function pickControlLockWarning(
  event: PickControlEvent,
  bout: PickControlBout,
  now: number,
) {
  if (pickControlBoutIsFinal(event, bout, now)) return null;
  const remaining = Date.parse(effectivePickControlBoutLock(event, bout)) - now;
  if (remaining <= PICK_LOCK_MINUTE_MS) return "LOCKS IN 1 MINUTE";
  if (remaining <= 5 * PICK_LOCK_MINUTE_MS) return "LOCKS IN 5 MINUTES";
  if (remaining <= 10 * PICK_LOCK_MINUTE_MS) return "LOCKS IN 10 MINUTES";
  return null;
}

export function nextProgressiveLockClockAt(
  event: PickControlEvent | null | undefined,
  now: number,
) {
  if (!event || event.status !== "upcoming") return null;

  let next: number | null = null;
  for (const bout of event.bouts) {
    if (bout.resultStatus !== "pending"
      || bout.includedInPicks === false
      || bout.isLocked === true
      || bout.canAdjustLock !== true) continue;

    const deadline = Date.parse(effectivePickControlBoutLock(event, bout));
    if (!Number.isFinite(deadline)) continue;
    for (const boundary of [
      deadline - 10 * PICK_LOCK_MINUTE_MS,
      deadline - 5 * PICK_LOCK_MINUTE_MS,
      deadline - PICK_LOCK_MINUTE_MS,
      deadline,
    ]) {
      if (boundary <= now) continue;
      if (next === null || boundary < next) next = boundary;
    }
  }

  if (next === null) return null;
  return Math.min(next, now + MAX_BROWSER_TIMEOUT_MS);
}
