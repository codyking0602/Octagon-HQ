import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import PicksPage from "./PicksPage";
import { PicksProvider } from "./PicksProvider";
import { pickEventPresentation, pickProgress, type PickEvent, type PickHistory } from "./picksModel";
import type { PicksRepository } from "./picksRepository";

const cody = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const cancelledEvent: PickEvent = {
  eventId: "ufc-cancelled-bout",
  name: "UFC Fight Night",
  subtitle: "Medic vs. Rodriguez",
  venue: "UFC Apex",
  location: "Las Vegas, Nevada",
  startsAt: "2099-08-01T23:00:00.000Z",
  locksAt: "2099-08-01T22:00:00.000Z",
  season: 2099,
  status: "upcoming",
  bouts: [{
    boutId: "cancelled-fight",
    position: 1,
    weightClass: "Welterweight",
    redFighterSlug: "cancel-red",
    redFighterName: "Cancel Red",
    blueFighterSlug: "cancel-blue",
    blueFighterName: "Cancel Blue",
    redAmericanOdds: 145,
    blueAmericanOdds: -165,
    winnerFighterSlug: null,
    resultStatus: "cancelled",
    resultRecordedAt: "2099-07-30T12:00:00.000Z",
    groupPicks: [],
  }, {
    boutId: "active-fight",
    position: 2,
    weightClass: "Lightweight",
    redFighterSlug: "active-red",
    redFighterName: "Active Red",
    blueFighterSlug: "active-blue",
    blueFighterName: "Active Blue",
    redAmericanOdds: -120,
    blueAmericanOdds: 105,
    winnerFighterSlug: null,
    resultStatus: "pending",
    resultRecordedAt: null,
    groupPicks: [],
  }],
};

const emptyHistory: PickHistory = {
  season: 2099,
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
    getSession: async () => ({ userId: cody.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => cody,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function repository(): PicksRepository {
  return {
    loadCurrentEvent: async () => cancelledEvent,
    loadMyPicks: async () => [{
      eventId: cancelledEvent.eventId,
      boutId: "cancelled-fight",
      fighterSlug: "cancel-red",
      pickedAt: "2099-07-29T12:00:00.000Z",
      updatedAt: "2099-07-29T12:00:00.000Z",
    }],
    loadMyUnderdogLock: async () => null,
    loadMySummary: async () => ({
      correct: 0,
      incorrect: 0,
      pending: 1,
      eventsEntered: 1,
      basePoints: 0,
      lockBonus: 0,
      totalPoints: 0,
    }),
    loadMyHistory: async () => emptyHistory,
    savePick: vi.fn(),
    setUnderdogLock: vi.fn(),
    clearUnderdogLock: vi.fn(),
  };
}

function renderPage(repo: PicksRepository) {
  return render(
    <MemoryRouter><IdentityProvider gateway={gateway()}>
      <PicksProvider repository={repo}><PicksPage /></PicksProvider>
    </IdentityProvider></MemoryRouter>,
  );
}

afterEach(cleanup);

describe("approved cancelled fight presentation", () => {
  it("keeps an upcoming card upcoming and removes the cancelled bout from required progress", () => {
    expect(pickEventPresentation(cancelledEvent)).toEqual({
      state: "upcoming",
      eyebrow: "NEXT UFC EVENT",
      status: "UPCOMING",
    });
    expect(pickProgress(cancelledEvent, {
      "cancelled-fight": "cancel-red",
      "active-fight": "active-blue",
    })).toEqual({ completed: 1, total: 1 });
  });


  it("requires a changed matchup repick to count toward completion", () => {
    const changed = {
      ...cancelledEvent,
      bouts: [{ ...cancelledEvent.bouts[1], repickRequired: true }],
    };
    expect(pickProgress(changed, {})).toEqual({ completed: 0, total: 1 });
    expect(pickProgress(changed, { "active-fight": "active-blue" })).toEqual({ completed: 1, total: 1 });
  });

  it("preserves the original pick while making the cancelled fight read-only and excluded", async () => {
    const repo = repository();
    renderPage(repo);

    expect(await screen.findByText("CANCELLED · EXCLUDED FROM SCORING")).toBeInTheDocument();
    expect(screen.getByText("0 OF 1")).toBeInTheDocument();

    const redChoice = screen.getByRole("button", { name: /Cancel Red/i });
    const blueChoice = screen.getByRole("button", { name: /Cancel Blue/i });
    expect(redChoice).toBeDisabled();
    expect(blueChoice).toBeDisabled();
    expect(await within(redChoice).findByText("YOUR PICK")).toBeInTheDocument();
    expect(within(blueChoice).getByText("FIGHT CANCELLED")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /MAKE THIS MY UNDERDOG LOCK/i })).not.toBeInTheDocument();

    fireEvent.click(redChoice);
    await waitFor(() => expect(repo.savePick).not.toHaveBeenCalled());
  });
});
