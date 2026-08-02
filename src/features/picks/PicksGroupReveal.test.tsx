import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import PicksPage from "./PicksPage";
import { PicksProvider } from "./PicksProvider";
import type { PickEvent, PickHistory } from "./picksModel";
import type { PicksRepository } from "./picksRepository";

const cody = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const revealedPicks = [
  { displayName: "CODY", pickedFighterSlug: "red-fighter", isCurrentUser: true },
  { displayName: "SHANE", pickedFighterSlug: "blue-fighter", isCurrentUser: false },
  { displayName: "TONY", pickedFighterSlug: null, isCurrentUser: false },
];

const resolvedEvent: PickEvent = {
  eventId: "ufc-live-reveal",
  name: "UFC Live Reveal",
  subtitle: "Red Fighter vs. Blue Fighter",
  venue: "Test Arena",
  location: "Dallas, Texas",
  startsAt: "2000-07-25T18:00:00.000Z",
  locksAt: "2000-07-25T16:00:00.000Z",
  season: 2026,
  status: "locked",
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
    winnerFighterSlug: "red-fighter",
    resultStatus: "red_win",
    resultRecordedAt: "2026-07-26T18:00:00.000Z",
    groupPicks: revealedPicks,
  }],
};

const pendingEvent: PickEvent = {
  ...resolvedEvent,
  eventId: "ufc-pending-reveal",
  startsAt: "2099-07-25T18:00:00.000Z",
  bouts: [{
    ...resolvedEvent.bouts[0],
    winnerFighterSlug: null,
    resultStatus: "pending",
    resultRecordedAt: null,
    groupPicks: [],
  }],
};

const emptyHistory: PickHistory = {
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

const completedHistory: PickHistory = {
  season: 2026,
  summary: {
    correct: 1,
    incorrect: 0,
    missing: 0,
    excluded: 0,
    basePoints: 4,
    lockBonus: 0,
    totalPoints: 4,
    eventsEntered: 1,
  },
  events: [{
    eventId: "ufc-completed-reveal",
    name: "UFC Completed Reveal",
    subtitle: "Main Card",
    venue: "Test Arena",
    location: "Dallas, Texas",
    startsAt: "2026-07-25T18:00:00.000Z",
    season: 2026,
    completedAt: "2026-07-26T01:00:00.000Z",
    record: {
      correct: 1,
      incorrect: 0,
      missing: 0,
      excluded: 0,
      basePoints: 4,
      lockBonus: 0,
      totalPoints: 4,
    },
    underdogLock: null,
    watchMoments: [],
    bouts: [{
      boutId: "red-blue",
      position: 1,
      weightClass: "Lightweight",
      redFighterSlug: "red-fighter",
      redFighterName: "Red Fighter",
      blueFighterSlug: "blue-fighter",
      blueFighterName: "Blue Fighter",
      resultStatus: "red_win",
      winnerFighterSlug: "red-fighter",
      pickedFighterSlug: "red-fighter",
      verdict: "correct",
      groupPicks: revealedPicks,
    }],
    groupResults: [{
      rank: 1,
      displayName: "CODY",
      correct: 1,
      incorrect: 0,
      missing: 0,
      excluded: 0,
      basePoints: 4,
      lockBonus: 0,
      totalPoints: 4,
      isCurrentUser: true,
    }],
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

function repository(currentEvent: PickEvent | null, history: PickHistory = emptyHistory): PicksRepository {
  return {
    loadCurrentEvent: async () => currentEvent,
    loadMyPicks: async () => currentEvent ? [{
      eventId: currentEvent.eventId,
      boutId: "red-blue",
      fighterSlug: "red-fighter",
      pickedAt: "2026-07-25T12:00:00.000Z",
      updatedAt: "2026-07-25T12:00:00.000Z",
    }] : [],
    loadMyUnderdogLock: async () => null,
    loadMySummary: async () => ({
      correct: 0,
      incorrect: 0,
      pending: currentEvent?.bouts.length ?? 0,
      eventsEntered: currentEvent ? 1 : 0,
      basePoints: 0,
      lockBonus: 0,
      totalPoints: 0,
    }),
    loadMyHistory: async () => history,
    savePick: vi.fn(),
    setUnderdogLock: vi.fn(),
    clearUnderdogLock: vi.fn(),
  };
}

function renderPage(currentEvent: PickEvent | null, history: PickHistory = emptyHistory) {
  return render(
    <MemoryRouter><IdentityProvider gateway={gateway()}>
      <PicksProvider repository={repository(currentEvent, history)}>
        <PicksPage />
      </PicksProvider>
    </IdentityProvider></MemoryRouter>,
  );
}

afterEach(cleanup);

describe("Picks group reveals", () => {
  it("shows the official result and reveals entrants from the selected total", async () => {
    renderPage(resolvedEvent);

    expect(await screen.findByText("HOW EVERYONE PICKED")).toBeInTheDocument();
    expect(screen.getByText("OFFICIAL RESULT")).toBeInTheDocument();
    expect(screen.getByText("3 ENTERED")).toBeInTheDocument();
    expect(screen.queryByText("CODY · YOU")).not.toBeInTheDocument();
    expect(screen.queryByText("SHANE")).not.toBeInTheDocument();
    expect(screen.queryByText("TONY")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Red Fighter: 1 pick" }));
    expect(screen.getByText("CODY · YOU")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Blue Fighter: 1 pick" }));
    expect(screen.queryByText("CODY · YOU")).not.toBeInTheDocument();
    expect(screen.getByText("SHANE")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "NO PICK: 1 pick" }));
    expect(screen.queryByText("SHANE")).not.toBeInTheDocument();
    expect(screen.getByText("TONY")).toBeInTheDocument();
  });

  it("does not render another member reveal for a pending bout", async () => {
    renderPage(pendingEvent);

    expect(await screen.findByRole("heading", { name: "UFC Live Reveal" })).toBeInTheDocument();
    expect(screen.queryByText("HOW EVERYONE PICKED")).not.toBeInTheDocument();
    expect(screen.queryByText("OFFICIAL RESULT")).not.toBeInTheDocument();
  });

  it("keeps the tappable group reveal in the completed fight-by-fight recap", async () => {
    renderPage(null, completedHistory);

    fireEvent.click(await screen.findByText("STANDINGS & EVENTS"));
    fireEvent.click(screen.getByRole("tab", { name: "EVENTS" }));
    fireEvent.click(screen.getByRole("button", { name: /OPEN FULL RECAP/i }));

    expect(screen.getByText("HOW EVERYONE PICKED")).toBeInTheDocument();
    expect(screen.getByText("3 ENTERED")).toBeInTheDocument();
    expect(screen.queryByText("SHANE")).not.toBeInTheDocument();
    expect(screen.queryByText("TONY")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Blue Fighter: 1 pick" }));
    expect(screen.getByText("SHANE")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "NO PICK: 1 pick" }));
    expect(screen.queryByText("SHANE")).not.toBeInTheDocument();
    expect(screen.getByText("TONY")).toBeInTheDocument();
  });
});
