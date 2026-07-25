import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import { PicksProvider, usePicks } from "./PicksProvider";
import type { PickEvent } from "./picksModel";
import type { PicksRepository } from "./picksRepository";

const cody = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const event: PickEvent = {
  eventId: "ufc-test-event",
  name: "UFC Fight Night",
  subtitle: "Ankalaev vs. Guskov",
  venue: "Etihad Arena",
  location: "Abu Dhabi, United Arab Emirates",
  startsAt: "2099-07-25T16:00:00.000Z",
  locksAt: "2099-07-25T16:00:00.000Z",
  season: 2026,
  status: "upcoming",
  bouts: [{
    boutId: "ankalaev-guskov",
    position: 1,
    weightClass: "Light Heavyweight",
    redFighterSlug: "magomed-ankalaev",
    redFighterName: "Magomed Ankalaev",
    blueFighterSlug: "bogdan-guskov",
    blueFighterName: "Bogdan Guskov",
    winnerFighterSlug: null,
  }],
};

function gateway(): IdentityGateway {
  return {
    getSession: async () => ({ userId: cody.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => cody,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function Probe() {
  const picks = usePicks();
  return (
    <div>
      <span>{picks.event?.subtitle ?? "NO EVENT"}</span>
      <span>{picks.selections["ankalaev-guskov"] ?? "NO PICK"}</span>
      <span>{picks.summary.correct}-{picks.summary.incorrect}</span>
      <button type="button" onClick={() => void picks.setPick("ankalaev-guskov", "bogdan-guskov")}>PICK GUSKOV</button>
    </div>
  );
}

describe("PicksProvider", () => {
  it("loads and saves only through the profile repository for a signed-in profile", async () => {
    const loadMyPicks = vi.fn(async () => [{
      eventId: event.eventId,
      boutId: "ankalaev-guskov",
      fighterSlug: "magomed-ankalaev",
      pickedAt: "2026-07-24T12:00:00.000Z",
      updatedAt: "2026-07-24T12:00:00.000Z",
    }]);
    const loadMySummary = vi.fn()
      .mockResolvedValueOnce({ correct: 4, incorrect: 2, pending: 1, eventsEntered: 1 })
      .mockResolvedValueOnce({ correct: 4, incorrect: 2, pending: 1, eventsEntered: 1 });
    const savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string) => ({
      eventId,
      boutId,
      fighterSlug,
      pickedAt: "2026-07-24T12:00:00.000Z",
      updatedAt: "2026-07-24T12:00:00.000Z",
    }));
    const repository: PicksRepository = {
      loadCurrentEvent: async () => event,
      loadMyPicks,
      loadMySummary,
      savePick,
    };

    render(
      <IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository}><Probe /></PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("Ankalaev vs. Guskov")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("magomed-ankalaev")).toBeInTheDocument());
    expect(screen.getByText("4-2")).toBeInTheDocument();
    expect(loadMyPicks).toHaveBeenCalledWith(event.eventId);

    fireEvent.click(screen.getByRole("button", { name: "PICK GUSKOV" }));
    await waitFor(() => expect(savePick).toHaveBeenCalledWith(event.eventId, "ankalaev-guskov", "bogdan-guskov"));
    await waitFor(() => expect(screen.getByText("bogdan-guskov")).toBeInTheDocument());
  });

  it("loads the public event without requesting profile picks while signed out", async () => {
    const loadMyPicks = vi.fn(async () => []);
    const loadMySummary = vi.fn(async () => ({ correct: 0, incorrect: 0, pending: 0, eventsEntered: 0 }));
    const repository: PicksRepository = {
      loadCurrentEvent: async () => event,
      loadMyPicks,
      loadMySummary,
      savePick: vi.fn(),
    };

    render(
      <IdentityProvider gateway={null}>
        <PicksProvider repository={repository}><Probe /></PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("Ankalaev vs. Guskov")).toBeInTheDocument();
    expect(screen.getByText("NO PICK")).toBeInTheDocument();
    expect(loadMyPicks).not.toHaveBeenCalled();
    expect(loadMySummary).not.toHaveBeenCalled();
  });
});
