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

function gateway(canControlPicks = false, displayName = profile.displayName): IdentityGateway {
  return {
    getSession: async () => ({ userId: profile.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => ({ ...profile, displayName, canControlPicks }),
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

function renderPage(currentEvent: PickEvent | null, identityGateway = gateway()) {
  return render(
    <MemoryRouter>
      <IdentityProvider gateway={identityGateway}>
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

    const link = await screen.findByRole("link", { name: "MANAGE EVENT ›" });
    expect(link).toHaveAttribute("href", "/picks/control");
  });

  it("does not infer control access from the signed-in profile name", async () => {
    renderPage({ ...event, canControl: false });

    expect(await screen.findByRole("heading", { name: "UFC Control Entry" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "MANAGE EVENT ›" })).not.toBeInTheDocument();
  });

  it("gives only the projected owner the no-card setup entry and workflow guidance", async () => {
    const { unmount } = renderPage(null, gateway(true));

    const link = await screen.findByRole("link", { name: "STAGE NEXT UFC EVENT" });
    expect(link).toHaveAttribute("href", "/picks/control#setup");
    expect(screen.getByText("Stage → sync → review → publish → monitor → lock/results.")).toBeInTheDocument();
    expect(screen.getByText("Check back when the next UFC main card is ready.")).toBeInTheDocument();
    unmount();

    renderPage(null, gateway(false, "CODY"));
    expect(await screen.findByText("NO ACTIVE CARD")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "STAGE NEXT UFC EVENT" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Stage → sync/)).not.toBeInTheDocument();
  });

  it("does not add the staging action when an event is active", async () => {
    renderPage(event, gateway(true));
    expect(await screen.findByRole("heading", { name: "UFC Control Entry" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "STAGE NEXT UFC EVENT" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "MANAGE EVENT ›" })).toBeInTheDocument();
  });
});
