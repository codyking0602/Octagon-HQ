import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
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
  eventId: "ufc-control-entry",
  name: "UFC Control Entry",
  subtitle: "Red Fighter vs. Blue Fighter",
  venue: "Test Arena",
  location: "Dallas, Texas",
  startsAt: "2099-08-01T02:00:00.000Z",
  locksAt: "2099-08-01T01:00:00.000Z",
  season: 2026,
  status: "upcoming",
  canControl: true,
  bouts: [{
    boutId: "red-blue",
    position: 1,
    weightClass: "Lightweight",
    redFighterSlug: "red-fighter",
    redFighterName: "Red Fighter",
    blueFighterSlug: "blue-fighter",
    blueFighterName: "Blue Fighter",
    redAmericanOdds: -150,
    blueAmericanOdds: 130,
    winnerFighterSlug: null,
    resultStatus: "pending",
    resultRecordedAt: null,
    groupPicks: [],
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

function repository(currentEvent: PickEvent): PicksRepository {
  return {
    loadCurrentEvent: async () => currentEvent,
    loadMyPicks: async () => [],
    loadMyUnderdogLock: async () => null,
    loadMySummary: async () => ({
      correct: 0,
      incorrect: 0,
      pending: 1,
      eventsEntered: 0,
      basePoints: 0,
      lockBonus: 0,
      totalPoints: 0,
    }),
    loadMyHistory: async () => ({
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
    }),
    savePick: vi.fn(),
    setUnderdogLock: vi.fn(),
    clearUnderdogLock: vi.fn(),
  };
}

function renderPage(currentEvent: PickEvent) {
  return render(
    <MemoryRouter>
      <IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository(currentEvent)}>
          <PicksPage />
        </PicksProvider>
      </IdentityProvider>
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe("Fight Night control entry", () => {
  it("shows the separate control route only when the backend grants access", async () => {
    renderPage(event);

    const link = await screen.findByRole("link", { name: "OPEN FIGHT NIGHT CONTROL" });
    expect(link).toHaveAttribute("href", "/picks/control");
  });

  it("does not infer control access from the signed-in profile name", async () => {
    renderPage({ ...event, canControl: false });

    expect(await screen.findByRole("heading", { name: "UFC Control Entry" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "OPEN FIGHT NIGHT CONTROL" })).not.toBeInTheDocument();
  });
});
