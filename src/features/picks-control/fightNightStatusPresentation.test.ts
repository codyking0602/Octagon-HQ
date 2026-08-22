import { describe, expect, it } from "vitest";
import { pickControlFightNightStatus, type PickControlBout } from "./pickControlModel";

function bout(overrides: Partial<PickControlBout> = {}): PickControlBout {
  return {
    boutId: "presentation-bout",
    locksAt: "2026-08-29T22:00:00.000Z",
    isLocked: false,
    liveStatus: "scheduled",
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
    canCorrectResult: false,
    hasReplacementHistory: false,
    hasRemovalHistory: false,
    hasCorrectionHistory: false,
    ...overrides,
  };
}

describe("Fight Night bout status presentation", () => {
  it("shows trusted provider state before generic deadline state", () => {
    expect(pickControlFightNightStatus(bout({ liveStatus: "scheduled" }))).toBeNull();
    expect(pickControlFightNightStatus(bout({ liveStatus: "live", isLocked: true }))).toBe("LIVE");
    expect(pickControlFightNightStatus(bout({ liveStatus: "final", isLocked: true }))).toBe("FINAL");
  });

  it("keeps official results above provider-final evidence", () => {
    expect(pickControlFightNightStatus(bout({ liveStatus: "final", resultStatus: "red_win" }))).toBe("RED WON");
    expect(pickControlFightNightStatus(bout({ liveStatus: "final", resultStatus: "blue_win" }))).toBe("BLUE WON");
    expect(pickControlFightNightStatus(bout({ liveStatus: "final", resultStatus: "draw" }))).toBe("DRAW");
    expect(pickControlFightNightStatus(bout({ liveStatus: "final", resultStatus: "no_contest" }))).toBe("NO CONTEST");
    expect(pickControlFightNightStatus(bout({ liveStatus: "final", resultStatus: "cancelled" }))).toBe("CANCELLED");
  });
});
