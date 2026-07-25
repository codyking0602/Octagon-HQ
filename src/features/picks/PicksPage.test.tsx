import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import PicksPage from "./PicksPage";
import { PicksProvider } from "./PicksProvider";
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

function repository(savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string) => ({
  eventId,
  boutId,
  fighterSlug,
  pickedAt: "2026-07-24T12:00:00.000Z",
  updatedAt: "2026-07-24T12:00:00.000Z",
}))) : PicksRepository {
  return {
    loadCurrentEvent: async () => event,
    loadMyPicks: async () => [],
    loadMySummary: async () => ({ correct: 0, incorrect: 0, pending: 1, eventsEntered: 1 }),
    savePick,
  };
}

describe("PicksPage", () => {
  it("shows the current main card and saves a selected fighter to the profile", async () => {
    const savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string) => ({
      eventId,
      boutId,
      fighterSlug,
      pickedAt: "2026-07-24T12:00:00.000Z",
      updatedAt: "2026-07-24T12:00:00.000Z",
    }));

    render(
      <IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository(savePick)}><PicksPage /></PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByRole("heading", { name: "UFC Fight Night" })).toBeInTheDocument();
    expect(screen.getByText("Ankalaev vs. Guskov")).toBeInTheDocument();
    expect(screen.getByText("MAIN EVENT")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Bogdan Guskov/i }));
    await waitFor(() => expect(savePick).toHaveBeenCalledWith(event.eventId, "ankalaev-guskov", "bogdan-guskov"));
    await waitFor(() => expect(screen.getByRole("button", { name: /Bogdan Guskov/i })).toHaveAttribute("aria-pressed", "true"));
    expect(screen.getByText("ALL 1 PICKS SAVED TO CODY")).toBeInTheDocument();
  });

  it("shows the event publicly but requires sign-in before making picks", async () => {
    render(
      <IdentityProvider gateway={null}>
        <PicksProvider repository={repository()}><PicksPage /></PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByRole("heading", { name: "UFC Fight Night" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SIGN IN TO MAKE PICKS" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Magomed Ankalaev/i })).not.toBeInTheDocument();
  });
});
