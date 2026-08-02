import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import type { PickControlEvent } from "./pickControlModel";
import PicksControlCenterPage from "./PicksControlCenterPage";

const owner = { id: "11111111-1111-4111-8111-111111111111", displayName: "CODY", initials: "CK" };
const gateway: IdentityGateway = {
  getSession: async () => ({ userId: owner.id }), subscribe: () => () => undefined,
  loadProfile: async () => owner, signIn: async () => undefined,
  createProfile: async () => undefined, signOut: async () => undefined,
};

function controlEvent(status: PickControlEvent["status"]): PickControlEvent {
  return {
    eventId: "event", name: "UFC Control", subtitle: "Red vs. Blue", venue: "Arena",
    location: "Dallas", startsAt: "2026-08-09T02:00:00Z", locksAt: "2026-08-09T01:00:00Z",
    season: 2026, status, canLock: status === "upcoming", canComplete: false,
    canReorder: false, hasReorderHistory: false,
    bouts: [{
      boutId: "bout", position: 1, weightClass: "Lightweight", redFighterSlug: "red",
      redFighterName: "Red", blueFighterSlug: "blue", blueFighterName: "Blue",
      resultStatus: "pending", winnerFighterSlug: null, resultRecordedAt: null,
      includedInPicks: true, canCancel: false, canRestore: false, canReplace: false,
      canRemoveFromPicks: false, canRestoreToPicks: false, hasReplacementHistory: false,
      hasRemovalHistory: false,
    }],
  };
}

function renderCenter(event: PickControlEvent | null, profile = owner) {
  const loadControlEvent = vi.fn().mockResolvedValue(event);
  render(
    <MemoryRouter>
      <IdentityProvider gateway={{ ...gateway, loadProfile: async () => profile }}>
        <PicksControlCenterPage
          controlRepository={{
            loadControlEvent, lockEvent: vi.fn(), setCancellation: vi.fn(), setBoutInclusion: vi.fn(),
            replaceFighter: vi.fn(), reorderCard: vi.fn(), recordResult: vi.fn(), correctResult: vi.fn(),
            completeEvent: vi.fn(), adjustLockTime: vi.fn(),
          }}
          setupRepository={null}
          monitoringRepository={null}
        />
      </IdentityProvider>
    </MemoryRouter>,
  );
  return loadControlEvent;
}

describe("unified Picks Control Center", () => {
  it("loads the canonical event exactly once and makes setup the no-event task", async () => {
    const load = renderCenter(null);
    expect(await screen.findByText("SET UP NEXT EVENT")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Event setup" })).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("keeps the locked lifecycle focused on canonical result entry", async () => {
    renderCenter(controlEvent("locked"));
    expect(await screen.findByText("1 FIGHT NEED RESULTS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "RED WINNER Red" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Automatic monitoring and card review" })).not.toBeInTheDocument();
  });

  it("does not initialize owner repositories before authorization", async () => {
    const load = renderCenter(controlEvent("upcoming"), null as never);
    await screen.findByText("Sign in to open Fight Night Control.");
    await waitFor(() => expect(load).not.toHaveBeenCalled());
  });
});
