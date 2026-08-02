import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import type { PickControlEvent } from "./pickControlModel";
import PicksControlPage from "./PicksControlPage";
import type { PickControlRepository } from "./pickControlRepository";

const cody = { id: "11111111-1111-4111-8111-111111111111", displayName: "CODY", initials: "CK" };

function gateway(): IdentityGateway {
  return {
    getSession: async () => ({ userId: cody.id }), subscribe: () => () => undefined,
    loadProfile: async () => cody, signIn: async () => undefined,
    createProfile: async () => undefined, signOut: async () => undefined,
  };
}

function controlEvent(): PickControlEvent {
  return {
    eventId: "ufc-control-locks", name: "UFC Control Locks", subtitle: "Locked Red vs. Locked Blue",
    venue: "Test Arena", location: "Dallas, Texas", startsAt: "2099-08-09T04:00:00.000Z",
    locksAt: "2099-08-09T03:30:00.000Z", season: 2026, status: "upcoming",
    canLock: true, canComplete: false, canReorder: false, hasReorderHistory: false,
    bouts: [{
      boutId: "resulted-fight", locksAt: "2099-08-09T01:00:00.000Z", isLocked: true, canAdjustLock: false,
      position: 1, weightClass: "Lightweight", redFighterSlug: "locked-red", redFighterName: "Locked Red",
      blueFighterSlug: "locked-blue", blueFighterName: "Locked Blue", resultStatus: "red_win",
      winnerFighterSlug: "locked-red", resultRecordedAt: "2099-08-09T01:30:00.000Z", includedInPicks: true,
      canCancel: false, canRestore: false, canReplace: false, canRemoveFromPicks: false, canRestoreToPicks: false,
      canCorrectResult: false, hasReplacementHistory: false, hasRemovalHistory: false, hasCorrectionHistory: false,
    }, {
      boutId: "open-fight", locksAt: "2099-08-09T03:00:00.000Z", isLocked: false, canAdjustLock: true,
      position: 2, weightClass: "Welterweight", redFighterSlug: "open-red", redFighterName: "Open Red",
      blueFighterSlug: "open-blue", blueFighterName: "Open Blue", resultStatus: "pending",
      winnerFighterSlug: null, resultRecordedAt: null, includedInPicks: true,
      canCancel: true, canRestore: false, canReplace: true, canRemoveFromPicks: true, canRestoreToPicks: false,
      canCorrectResult: false, hasReplacementHistory: false, hasRemovalHistory: false, hasCorrectionHistory: false,
    }],
  };
}

function repository(event = controlEvent()): PickControlRepository {
  return {
    loadControlEvent: vi.fn().mockResolvedValue(event), lockEvent: vi.fn().mockResolvedValue(undefined),
    adjustLockTime: vi.fn().mockResolvedValue(undefined), adjustBoutLockTime: vi.fn().mockResolvedValue(undefined),
    setCancellation: vi.fn().mockResolvedValue(undefined), setBoutInclusion: vi.fn().mockResolvedValue(undefined),
    replaceFighter: vi.fn().mockResolvedValue(undefined), reorderCard: vi.fn().mockResolvedValue(undefined),
    recordResult: vi.fn().mockResolvedValue(undefined), correctResult: vi.fn().mockResolvedValue(undefined),
    completeEvent: vi.fn().mockResolvedValue(undefined),
  };
}

function renderPage(repo: PickControlRepository) {
  return render(<MemoryRouter><IdentityProvider gateway={gateway()}>
    <PicksControlPage repository={repo} />
  </IdentityProvider></MemoryRouter>);
}

function controlCardByLockState(state: string) {
  const card = screen.getAllByText(state)
    .map((node) => node.closest("article"))
    .find((node): node is HTMLElement => Boolean(node));
  if (!card) throw new Error(`Control card not found: ${state}`);
  return within(card);
}

beforeEach(() => {
  vi.spyOn(window, "prompt").mockReturnValue("2099-08-09T02:30");
  vi.spyOn(window, "confirm").mockReturnValue(true);
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("per-fight Fight Night Control", () => {
  it("shows each server lock state and changes an open fight through the canonical mutation", async () => {
    const repo = repository();
    renderPage(repo);
    expect(await screen.findByRole("heading", { name: "UFC Control Locks" })).toBeInTheDocument();
    expect(screen.getByText("EVENT-WIDE MASTER LOCK")).toBeInTheDocument();
    const lockedFight = controlCardByLockState("FIGHT LOCK · LOCKED");
    const openFight = controlCardByLockState("FIGHT LOCK · OPEN");
    expect(lockedFight.getByText("Completed, resulted, or cancelled fights cannot be reopened.")).toBeInTheDocument();
    expect(lockedFight.getByRole("button", { name: "LOCK CLOSED" })).toBeDisabled();
    fireEvent.click(openFight.getByRole("button", { name: "CHANGE FIGHT LOCK" }));
    await waitFor(() => expect(repo.adjustBoutLockTime).toHaveBeenCalledWith(
      "ufc-control-locks", "open-fight", new Date("2099-08-09T02:30").toISOString(),
    ));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("Change only Open Red vs. Open Blue"));
  });

  it("keeps the event-wide state as the master override", async () => {
    const event = { ...controlEvent(), status: "locked" as const, canLock: false };
    const repo = repository(event);
    renderPage(repo);
    expect(await screen.findByRole("heading", { name: "UFC Control Locks" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "CHANGE FIGHT LOCK" })).not.toBeInTheDocument();
    expect(screen.queryByText("EVENT-WIDE MASTER LOCK")).not.toBeInTheDocument();
    expect(repo.adjustBoutLockTime).not.toHaveBeenCalled();
  });
});
