import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import OpenPicksDashboard from "./OpenPicksDashboard";
import type { PickControlBout, PickControlEvent } from "./pickControlModel";
import type { PickControlRepository } from "./pickControlRepository";
import {
  nextProgressiveLockClockAt,
  pickControlBoutCanRecordResult,
  pickControlBoutIsFinal,
  pickControlLockWarning,
} from "./progressiveLockTiming";

const now = Date.parse("2026-08-22T23:30:00.000Z");

const identityGateway: IdentityGateway = {
  getSession: async () => ({ userId: "11111111-1111-4111-8111-111111111111" }),
  subscribe: () => () => undefined,
  loadProfile: async () => ({
    id: "11111111-1111-4111-8111-111111111111",
    displayName: "CODY",
    initials: "CK",
  }),
  signIn: async () => undefined,
  createProfile: async () => undefined,
  signOut: async () => undefined,
};

function bout(overrides: Partial<PickControlBout> = {}): PickControlBout {
  return {
    boutId: "red-blue",
    locksAt: "2026-08-22T23:00:00.000Z",
    isLocked: false,
    liveStatus: "scheduled",
    liveStatusProvider: "espn",
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
    ...overrides,
  };
}

function event(nextBout = bout()): PickControlEvent {
  return {
    eventId: "ufc-espn-lock-test",
    name: "UFC Fight Night",
    subtitle: "Red Fighter vs. Blue Fighter",
    venue: "Test Arena",
    location: "Dallas, Texas",
    startsAt: "2026-08-23T00:00:00.000Z",
    locksAt: "2026-08-22T23:00:00.000Z",
    season: 2026,
    status: "upcoming",
    canLock: true,
    canComplete: false,
    canReorder: true,
    hasReorderHistory: false,
    recentCompletedEvents: [],
    bouts: [nextBout],
  };
}

function repository(controlEvent: PickControlEvent): PickControlRepository {
  return {
    loadControlEvent: vi.fn().mockResolvedValue(controlEvent),
    lockEvent: vi.fn().mockResolvedValue(undefined),
    adjustLockTime: vi.fn().mockResolvedValue(undefined),
    adjustBoutLockTime: vi.fn().mockResolvedValue(undefined),
    setCancellation: vi.fn().mockResolvedValue(undefined),
    setBoutInclusion: vi.fn().mockResolvedValue(undefined),
    replaceFighter: vi.fn().mockResolvedValue(undefined),
    addBout: vi.fn().mockResolvedValue(undefined),
    reorderCard: vi.fn().mockResolvedValue(undefined),
    recordResult: vi.fn().mockResolvedValue(undefined),
    correctResult: vi.fn().mockResolvedValue(undefined),
    completeEvent: vi.fn().mockResolvedValue(undefined),
  };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ESPN Fight Night lock authority", () => {
  it("keeps an ESPN-scheduled bout open after its listed UFC estimate passes", () => {
    const controlEvent = event();
    const controlBout = controlEvent.bouts[0];

    expect(pickControlBoutIsFinal(controlEvent, controlBout, now)).toBe(false);
    expect(pickControlBoutCanRecordResult(controlEvent, controlBout, now)).toBe(false);
    expect(pickControlLockWarning(controlEvent, controlBout, now)).toBeNull();
    expect(nextProgressiveLockClockAt(controlEvent, now)).toBeNull();
  });

  it("preserves the deadline fallback for a bout that is not attached to ESPN", () => {
    const legacyBout = bout({ liveStatusProvider: null });
    const controlEvent = event(legacyBout);

    expect(pickControlBoutIsFinal(controlEvent, legacyBout, now)).toBe(true);
    expect(pickControlBoutCanRecordResult(controlEvent, legacyBout, now)).toBe(true);
  });

  it("replaces the timed master-lock presentation once ESPN is attached", async () => {
    render(
      <IdentityProvider gateway={identityGateway}>
        <OpenPicksDashboard repository={repository(event())} now={now} />
      </IdentityProvider>,
    );

    expect(await screen.findByText("LIVE LOCKING")).toBeInTheDocument();
    expect(screen.getByText("ESPN")).toBeInTheDocument();
    expect(screen.getByText("AUTO LOCK ACTIVE")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "CHANGE MASTER LOCK" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "LOCK ALL PICKS" })).toBeInTheDocument();
    expect(screen.getByText(/EST\./)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /EXPAND Red Fighter vs\. Blue Fighter/i }));
    expect(screen.getByText("UFC ESTIMATE · ESPN LOCKS LIVE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EDIT ESTIMATE" })).toBeInTheDocument();
  });
});
