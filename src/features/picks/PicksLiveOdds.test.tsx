import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import PicksPage from "./PicksPage";
import { PicksProvider } from "./PicksProvider";
import type { PickEvent } from "./picksModel";
import type { PicksRepository } from "./picksRepository";

const profile = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const event: PickEvent = {
  eventId: "ufc-live-odds",
  name: "UFC Fight Night",
  subtitle: "Ankalaev vs. Guskov",
  venue: "Etihad Arena",
  location: "Abu Dhabi, United Arab Emirates",
  startsAt: "2099-07-25T16:00:00.000Z",
  locksAt: "2099-07-25T16:00:00.000Z",
  season: 2099,
  status: "upcoming",
  bouts: [{
    boutId: "ankalaev-guskov",
    position: 1,
    weightClass: "Light Heavyweight",
    redFighterSlug: "magomed-ankalaev",
    redFighterName: "Magomed Ankalaev",
    blueFighterSlug: "bogdan-guskov",
    blueFighterName: "Bogdan Guskov",
    redAmericanOdds: -180,
    blueAmericanOdds: 155,
    oddsSource: "DraftKings",
    oddsUpdatedAt: "2026-08-10T12:05:00.000Z",
    winnerFighterSlug: null,
  }],
};

function gateway(): IdentityGateway {
  return {
    getSession: async () => ({ userId: profile.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => profile,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function repository() {
  let selected: string | null = null;
  const setUnderdogLock = vi.fn(async (eventId: string, boutId: string, fighterSlug: string) => ({
    eventId,
    boutId,
    fighterSlug,
    selectedAt: "2026-08-10T12:10:00.000Z",
    frozenAmericanOdds: null,
  }));
  const value: PicksRepository = {
    loadCurrentEvent: async () => event,
    loadMyPicks: async () => selected ? [{
      eventId: event.eventId,
      boutId: event.bouts[0].boutId,
      fighterSlug: selected,
      pickedAt: "2026-08-10T12:10:00.000Z",
      updatedAt: "2026-08-10T12:10:00.000Z",
    }] : [],
    loadMyUnderdogLock: async () => null,
    loadMySummary: async () => ({ correct: 0, incorrect: 0, pending: 1, eventsEntered: 1, basePoints: 0, lockBonus: 0, totalPoints: 0 }),
    loadMyHistory: async () => ({
      season: 2099,
      summary: { correct: 0, incorrect: 0, missing: 0, excluded: 0, basePoints: 0, lockBonus: 0, totalPoints: 0, eventsEntered: 0 },
      events: [],
    }),
    savePick: async (eventId, boutId, fighterSlug) => {
      selected = fighterSlug;
      return {
        eventId,
        boutId,
        fighterSlug,
        pickedAt: "2026-08-10T12:10:00.000Z",
        updatedAt: "2026-08-10T12:10:00.000Z",
      };
    },
    setUnderdogLock,
    clearUnderdogLock: vi.fn(async () => undefined),
  };
  return { value, setUnderdogLock };
}

afterEach(cleanup);

describe("Picks live odds", () => {
  it("shows canonical American odds, favorite status, sportsbook freshness, and underdog eligibility", async () => {
    const repo = repository();
    render(
      <IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repo.value}><PicksPage /></PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("-180 · FAVORITE")).toBeInTheDocument();
    expect(screen.getByText("+155")).toBeInTheDocument();
    expect(screen.getByText("SPORTSBOOK ODDS")).toBeInTheDocument();
    expect(screen.getByText(/DraftKings · UPDATED/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Bogdan Guskov/i }));
    expect(await screen.findByRole("button", { name: "MAKE THIS MY UNDERDOG LOCK" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "MAKE THIS MY UNDERDOG LOCK" }));

    await waitFor(() => expect(repo.setUnderdogLock).toHaveBeenCalledWith(
      event.eventId,
      "ankalaev-guskov",
      "bogdan-guskov",
    ));
  });
});
