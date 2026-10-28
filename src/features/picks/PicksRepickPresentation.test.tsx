import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import PicksPage from "./PicksPage";
import { PicksProvider } from "./PicksProvider";
import type { PickEvent, PickHistory } from "./picksModel";
import type { PicksRepository } from "./picksRepository";

vi.mock("../../lib/supabase", () => ({
  getSupabaseClient: () => ({
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://storage.test/${bucket}/${path}` },
        }),
      }),
    },
  }),
}));

const profile = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const event: PickEvent = {
  eventId: "ufc-repick-test",
  name: "UFC Fight Night",
  subtitle: "Campbell vs. Peek",
  venue: "Accor Arena",
  location: "Paris, France",
  startsAt: "2099-09-05T19:00:00.000Z",
  locksAt: "2099-09-05T19:00:00.000Z",
  season: 2026,
  status: "upcoming",
  bouts: [{
    boutId: "main-morgan-charriere-felipe-lima",
    position: 5,
    weightClass: "Featherweight",
    redFighterSlug: "kurtis-campbell",
    redFighterName: "Kurtis Campbell",
    blueFighterSlug: "trevor-peek",
    blueFighterName: "Trevor Peek",
    redAmericanOdds: -410,
    blueAmericanOdds: 320,
    oddsSource: "DraftKings",
    oddsUpdatedAt: "2026-09-02T20:00:00.000Z",
    winnerFighterSlug: null,
    repickRequired: true,
  }],
};

const history: PickHistory = {
  season: 2026,
  summary: {
    correct: 0,
    incorrect: 0,
    missing: 0,
    excluded: 0,
    basePoints: 0,
    lockBonus: 0,
    totalPoints: 0,
    eventsEntered: 0,
  },
  events: [],
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

describe("Picks repick presentation", () => {
  afterEach(cleanup);

  it("keeps the changed matchup selectable without showing a repick warning", async () => {
    const savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string) => ({
      eventId,
      boutId,
      fighterSlug,
      pickedAt: "2026-09-02T20:00:00.000Z",
      updatedAt: "2026-09-02T20:00:00.000Z",
    }));

    const repository: PicksRepository = {
      loadCurrentEvent: async () => event,
      loadMyPicks: async () => [],
      loadMySummary: async () => ({
        correct: 0,
        incorrect: 0,
        pending: 0,
        eventsEntered: 0,
        basePoints: 0,
        lockBonus: 0,
        totalPoints: 0,
      }),
      loadMyHistory: async () => history,
      loadMyUnderdogLock: async () => null,
      setUnderdogLock: vi.fn(),
      clearUnderdogLock: vi.fn(),
      savePick,
    };

    const { container } = render(
      <MemoryRouter>
        <IdentityProvider gateway={gateway()}>
          <PicksProvider repository={repository}>
            <PicksPage />
          </PicksProvider>
        </IdentityProvider>
      </MemoryRouter>,
    );

    const campbell = await screen.findByRole("button", { name: /Kurtis Campbell/i });
    const peek = screen.getByRole("button", { name: /Trevor Peek/i });

    expect(screen.queryByText("REPICK REQUIRED")).not.toBeInTheDocument();
    expect(container.querySelector(".is-repick-required")).not.toBeInTheDocument();
    expect(campbell).toBeEnabled();
    expect(peek).toBeEnabled();

    fireEvent.click(peek);
    await waitFor(() => expect(savePick).toHaveBeenCalledWith(
      event.eventId,
      "main-morgan-charriere-felipe-lima",
      "trevor-peek",
    ));
  });
});
