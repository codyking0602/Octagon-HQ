import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import PicksPage from "./PicksPage";
import { PicksProvider } from "./PicksProvider";
import type { PickEvent } from "./picksModel";
import type { PicksRepository } from "./picksRepository";

const profileId = "11111111-1111-4111-8111-111111111111";

const activeEvent: PickEvent = {
  eventId: "ufc-owner-entry-active",
  name: "UFC Owner Entry Active",
  subtitle: "Red Fighter vs. Blue Fighter",
  venue: "Test Arena",
  location: "Dallas, Texas",
  startsAt: "2099-08-01T02:00:00.000Z",
  locksAt: "2099-08-01T01:00:00.000Z",
  season: 2026,
  status: "upcoming",
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

function gateway(canManagePicks: boolean): IdentityGateway {
  return {
    getSession: async () => ({ userId: profileId }),
    subscribe: () => () => undefined,
    loadProfile: async () => ({
      id: profileId,
      displayName: "CODY",
      initials: "CK",
      canManagePicks,
    }),
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function repository(currentEvent: PickEvent | null): PicksRepository {
  return {
    loadCurrentEvent: async () => currentEvent,
    loadMyPicks: async () => [],
    loadMyUnderdogLock: async () => null,
    loadMySummary: async () => ({
      correct: 0,
      incorrect: 0,
      pending: currentEvent ? 1 : 0,
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

function renderPage(currentEvent: PickEvent | null, canManagePicks: boolean) {
  return render(
    <MemoryRouter>
      <IdentityProvider gateway={gateway(canManagePicks)}>
        <PicksProvider repository={repository(currentEvent)}>
          <PicksPage />
        </PicksProvider>
      </IdentityProvider>
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe("Picks owner entry", () => {
  it("shows the canonical staging action to the owner when no active card exists", async () => {
    renderPage(null, true);

    expect(await screen.findByRole("heading", { name: "The next Picks card is being prepared." })).toBeInTheDocument();
    expect(screen.getByText("Check back when the next UFC main card is ready.")).toBeInTheDocument();
    expect(await screen.findByText("Stage → sync → review → publish → monitor → lock/results.")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "STAGE NEXT UFC EVENT" })).toHaveAttribute(
      "href",
      "/picks/control#setup",
    );
  });

  it("keeps the ordinary member empty state unchanged and does not infer ownership from CODY", async () => {
    renderPage(null, false);

    expect(await screen.findByText("Check back when the next UFC main card is ready.")).toBeInTheDocument();
    expect(await screen.findByText("STANDINGS & EVENTS")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "STAGE NEXT UFC EVENT" })).not.toBeInTheDocument();
    expect(screen.queryByText("WEEKLY OWNER FLOW")).not.toBeInTheDocument();
  });

  it("does not add the staging action to existing active-event Picks behavior", async () => {
    renderPage(activeEvent, true);

    expect(await screen.findByRole("heading", { name: "UFC Owner Entry Active" })).toBeInTheDocument();
    expect(await screen.findByText("STANDINGS & EVENTS")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "STAGE NEXT UFC EVENT" })).not.toBeInTheDocument();
  });
});
