import { describe, expect, it } from "vitest";
import type { PickControlEvent } from "./pickControlModel";
import { nextProgressiveLockClockAt } from "./progressiveLockTiming";

const now = Date.parse("2026-08-05T12:00:00.000Z");

function event(locksAt: string): PickControlEvent {
  return {
    eventId: "timer-proof",
    name: "UFC Timer Proof",
    subtitle: "Red Fighter vs. Blue Fighter",
    venue: "Test Arena",
    location: "Dallas, Texas",
    startsAt: locksAt,
    locksAt,
    season: 2026,
    status: "upcoming",
    canLock: true,
    canComplete: false,
    canReorder: true,
    hasReorderHistory: false,
    bouts: [{
      boutId: "red-blue",
      locksAt,
      isLocked: false,
      canAdjustLock: true,
      position: 1,
      weightClass: "Lightweight",
      redFighterSlug: "red-fighter",
      redFighterName: "Red Fighter",
      blueFighterSlug: "blue-fighter",
      blueFighterName: "Blue Fighter",
      resultStatus: "pending",
      winnerFighterSlug: null,
      resultRecordedAt: null,
      includedInPicks: true,
      canCancel: true,
      canRestore: false,
      canReplace: true,
      canRemoveFromPicks: true,
      canRestoreToPicks: false,
      hasReplacementHistory: false,
      hasRemovalHistory: false,
    }],
  };
}

describe("progressive lock browser clock", () => {
  it("keeps a distant lock wake inside the browser timeout limit", () => {
    const next = nextProgressiveLockClockAt(event("2099-08-09T03:00:00.000Z"), now);

    expect(next).not.toBeNull();
    expect(next! - now).toBeLessThan(2_147_483_647);
  });

  it("preserves the exact next warning boundary when it is already within range", () => {
    const lock = Date.parse("2026-08-05T13:00:00.000Z");

    expect(nextProgressiveLockClockAt(event(new Date(lock).toISOString()), now)).toBe(
      lock - 10 * 60_000,
    );
  });
});
