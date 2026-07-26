import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

const history: PickHistory = {
  season: 2026,
  summary: { correct: 4, incorrect: 1, missing: 0, excluded: 1, eventsEntered: 1 },
  events: [{
    eventId: "ufc-oklahoma-city",
    name: "UFC Oklahoma City",
    subtitle: "Main Card",
    venue: "Paycom Center",
    location: "Oklahoma City, Oklahoma",
    startsAt: "2026-06-20T23:00:00.000Z",
    season: 2026,
    completedAt: "2026-06-21T04:00:00.000Z",
    record: { correct: 4, incorrect: 1, missing: 0, excluded: 1 },
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
    }, {
      boutId: "excluded-bout",
      position: 2,
      weightClass: "Welterweight",
      redFighterSlug: "third-fighter",
      redFighterName: "Third Fighter",
      blueFighterSlug: "fourth-fighter",
      blueFighterName: "Fourth Fighter",
      resultStatus: "no_contest",
      winnerFighterSlug: null,
      pickedFighterSlug: "third-fighter",
      verdict: "excluded",
    }],
    groupResults: [{
      displayName: "CODY",
      correct: 4,
      incorrect: 1,
      missing: 0,
      excluded: 1,
      isCurrentUser: true,
    }, {
      displayName: "SHANE",
      correct: 3,
      incorrect: 2,
      missing: 0,
      excluded: 1,
      isCurrentUser: false,
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

function repository(
  savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string) => ({
    eventId,
    boutId,
    fighterSlug,
    pickedAt: "2026-07-24T12:00:00.000Z",
    updatedAt: "2026-07-24T12:00:00.000Z",
  })),
  currentEvent: PickEvent | null = event,
): PicksRepository {
  return {
    loadCurrentEvent: async () => currentEvent,
    loadMyPicks: async () => [],
    loadMySummary: async () => ({ correct: 0, incorrect: 0, pending: 1, eventsEntered: 1 }),
    loadMyHistory: async () => history,
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
    expect(screen.getAllByText("MAIN EVENT").length).toBeGreaterThan(0);

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
    expect(screen.queryByRole("heading", { name: "Your event recaps" })).not.toBeInTheDocument();
  });

  it("shows personal results and compact group standings when no active card exists", async () => {
    render(
      <IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository(undefined, null)}><PicksPage /></PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByRole("heading", { name: "Your event recaps" })).toBeInTheDocument();
    expect(screen.getByText("UFC Oklahoma City")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How everyone did" })).toBeInTheDocument();
    expect(screen.getByText("SHANE")).toBeInTheDocument();
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("No contest")).toBeInTheDocument();
    expect(screen.getByText("Excluded")).toBeInTheDocument();
  });
});
