import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import PicksControlCenterPage from "./PicksControlCenterPage";
import type { PickControlEvent } from "./pickControlModel";
import type { PickControlRepository } from "./pickControlRepository";

const owner = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const identityGateway: IdentityGateway = {
  getSession: async () => ({ userId: owner.id }),
  subscribe: () => () => undefined,
  loadProfile: async () => owner,
  signIn: async () => undefined,
  createProfile: async () => undefined,
  signOut: async () => undefined,
};

function completedEvent(
  eventId: string,
  subtitle: string,
  startsAt: string,
  recentCompletedEvents: PickControlEvent["recentCompletedEvents"],
): PickControlEvent {
  return {
    eventId,
    name: "UFC Fight Night",
    subtitle,
    venue: "Test Arena",
    location: "Dallas, Texas",
    startsAt,
    locksAt: startsAt,
    season: 2099,
    status: "complete",
    canLock: false,
    canComplete: false,
    canReorder: false,
    hasReorderHistory: false,
    recentCompletedEvents,
    bouts: [{
      boutId: `${eventId}-main`,
      locksAt: startsAt,
      isLocked: true,
      liveStatus: "scheduled",
      canAdjustLock: false,
      position: 1,
      weightClass: "Lightweight",
      redFighterSlug: "red-fighter",
      redFighterName: "Red Fighter",
      blueFighterSlug: "blue-fighter",
      blueFighterName: "Blue Fighter",
      resultStatus: "red_win",
      winnerFighterSlug: "red-fighter",
      resultRecordedAt: startsAt,
      includedInPicks: true,
      canCancel: false,
      canRestore: false,
      canReplace: false,
      canRemoveFromPicks: false,
      canRestoreToPicks: false,
      canCorrectResult: true,
      hasReplacementHistory: false,
      hasRemovalHistory: false,
      hasCorrectionHistory: false,
    }],
  };
}

function repository(loadControlEvent: PickControlRepository["loadControlEvent"]): PickControlRepository {
  return {
    loadControlEvent,
    lockEvent: vi.fn().mockResolvedValue(undefined),
    adjustLockTime: vi.fn().mockResolvedValue(undefined),
    adjustBoutLockTime: vi.fn().mockResolvedValue(undefined),
    setCancellation: vi.fn().mockResolvedValue(undefined),
    setBoutInclusion: vi.fn().mockResolvedValue(undefined),
    replaceFighter: vi.fn().mockResolvedValue(undefined),
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

describe("completed Picks event switching", () => {
  it("keeps the archive mounted while a selected historical event loads", async () => {
    const history = [{
      eventId: "older-event",
      name: "UFC Fight Night",
      startsAt: "2099-08-02T04:00:00.000Z",
      completedAt: "2099-08-02T06:00:00.000Z",
    }];
    const current = completedEvent(
      "current-event",
      "Current Headliner vs. Current Opponent",
      "2099-08-09T04:00:00.000Z",
      history,
    );
    const older = completedEvent(
      "older-event",
      "Older Headliner vs. Older Opponent",
      "2099-08-02T04:00:00.000Z",
      history,
    );

    let resolveOlder: ((value: PickControlEvent) => void) | undefined;
    const olderRequest = new Promise<PickControlEvent>((resolve) => {
      resolveOlder = resolve;
    });
    const loadControlEvent = vi.fn((eventId?: string) => (
      eventId === "older-event" ? olderRequest : Promise.resolve(current)
    ));

    render(
      <MemoryRouter initialEntries={["/picks/control"]}>
        <IdentityProvider gateway={identityGateway}>
          <PicksControlCenterPage
            controlRepository={repository(loadControlEvent)}
            setupRepository={null}
            monitoringRepository={null}
          />
        </IdentityProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Result corrections")).toBeInTheDocument();
    await waitFor(() => expect(loadControlEvent).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "OPEN PAST EVENT CORRECTIONS" }));
    fireEvent.click(screen.getByRole("button", { name: "OPEN AUG 2 COMPLETED EVENT" }));

    await waitFor(() => expect(loadControlEvent).toHaveBeenCalledWith("older-event"));
    expect(loadControlEvent).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveOlder?.(older);
      await olderRequest;
    });

    expect(await screen.findByText("EVENT · Older Headliner vs. Older Opponent")).toBeInTheDocument();
    expect(loadControlEvent).toHaveBeenCalledTimes(2);
  });
});