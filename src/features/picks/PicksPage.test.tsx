import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import PicksPage from "./PicksPage";
import { PicksProvider } from "./PicksProvider";
import type { PickEvent, PickHistory, ProfileEventPick, UnderdogLock } from "./picksModel";
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

const cody = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

afterEach(cleanup);

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
    redAmericanOdds: -180,
    blueAmericanOdds: 155,
    oddsSource: "DraftKings",
    oddsUpdatedAt: "2026-07-28T17:10:00.000Z",
    winnerFighterSlug: null,
  }],
};

const history: PickHistory = {
  season: 2026,
  summary: { correct: 4, incorrect: 1, missing: 0, excluded: 1, basePoints: 16, lockBonus: 2, totalPoints: 18, eventsEntered: 1 },
  events: [{
    eventId: "ufc-oklahoma-city",
    name: "UFC Oklahoma City",
    subtitle: "Main Card",
    venue: "Paycom Center",
    location: "Oklahoma City, Oklahoma",
    startsAt: "2026-06-20T23:00:00.000Z",
    season: 2026,
    completedAt: "2026-06-21T04:00:00.000Z",
    record: { correct: 4, incorrect: 1, missing: 0, excluded: 1, basePoints: 16, lockBonus: 2, totalPoints: 18 },
    underdogLock: null,
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
      groupPicks: [{ displayName: "CODY", pickedFighterSlug: "red-fighter", isCurrentUser: true }, { displayName: "SHANE", pickedFighterSlug: "blue-fighter", isCurrentUser: false }],
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
      rank: 1,
      basePoints: 16,
      lockBonus: 2,
      totalPoints: 18,
      isCurrentUser: true,
    }, {
      displayName: "SHANE",
      correct: 3,
      incorrect: 2,
      missing: 0,
      excluded: 1,
      rank: 1,
      basePoints: 16,
      lockBonus: 2,
      totalPoints: 18,
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
  initialPicks: ProfileEventPick[] = [],
  initialLock: UnderdogLock | null = null,
): PicksRepository {
  return {
    loadCurrentEvent: async () => currentEvent,
    loadMyPicks: async () => initialPicks,
    loadMySummary: async () => ({ correct: 0, incorrect: 0, pending: 1, eventsEntered: 1, basePoints: 0, lockBonus: 0, totalPoints: 0 }),
    loadMyHistory: async () => history,
    loadMyUnderdogLock: async () => initialLock,
    setUnderdogLock: vi.fn(async (eventId, boutId, fighterSlug) => ({
      eventId,
      boutId,
      fighterSlug,
      selectedAt: "2026-07-24T12:00:00.000Z",
      frozenAmericanOdds: 155,
    })),
    clearUnderdogLock: vi.fn(),
    savePick,
  };
}

describe("PicksPage", () => {
  it("shows one card-level odds source and saves a selected fighter to the profile", async () => {
    const savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string) => ({
      eventId,
      boutId,
      fighterSlug,
      pickedAt: "2026-07-24T12:00:00.000Z",
      updatedAt: "2026-07-24T12:00:00.000Z",
    }));

    render(
      <MemoryRouter><IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository(savePick)}><PicksPage /></PicksProvider>
      </IdentityProvider></MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "UFC Fight Night" })).toBeInTheDocument();
    expect(screen.getByText("Ankalaev vs. Guskov")).toBeInTheDocument();
    expect(screen.getAllByText("MAIN EVENT").length).toBeGreaterThan(0);
    expect(screen.getByText("SCORING & UNDERDOG LOCK RULES")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Sportsbook odds source")).toHaveLength(1);
    expect(screen.queryByLabelText("Current Picks progress")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Bogdan Guskov/i }));
    await waitFor(() => expect(savePick).toHaveBeenCalledWith(event.eventId, "ankalaev-guskov", "bogdan-guskov"));
    await waitFor(() => expect(screen.getByRole("button", { name: /Bogdan Guskov/i })).toHaveAttribute("aria-pressed", "true"));
    expect(screen.getByText("1 PICK SAVED")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "☆ LOCK FOR +2" })).toBeInTheDocument();
  });

  it("shows the frozen bonus in the event summary and selected lock action", async () => {
    const selectedPick: ProfileEventPick = {
      eventId: event.eventId,
      boutId: "ankalaev-guskov",
      fighterSlug: "bogdan-guskov",
      pickedAt: "2026-07-24T12:00:00.000Z",
      updatedAt: "2026-07-24T12:00:00.000Z",
    };
    const selectedLock: UnderdogLock = {
      eventId: event.eventId,
      boutId: "ankalaev-guskov",
      fighterSlug: "bogdan-guskov",
      selectedAt: "2026-07-24T12:00:00.000Z",
      frozenAmericanOdds: 250,
    };

    render(
      <MemoryRouter><IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository(undefined, event, [selectedPick], selectedLock)}><PicksPage /></PicksProvider>
      </IdentityProvider></MemoryRouter>,
    );

    expect(await screen.findByText("UNDERDOG LOCK · Bogdan Guskov · +4 IF CORRECT")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "★ UNDERDOG LOCK · +4 · REMOVE" })).toBeInTheDocument();
  });

  it("shows the event publicly but requires sign-in before making picks", async () => {
    render(
      <MemoryRouter><IdentityProvider gateway={null}>
        <PicksProvider repository={repository()}><PicksPage /></PicksProvider>
      </IdentityProvider></MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "UFC Fight Night" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SIGN IN TO MAKE PICKS" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Magomed Ankalaev/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Your event archive" })).not.toBeInTheDocument();
  });

  it("opens the latest completed event as a generated full-screen recap", async () => {
    render(
      <MemoryRouter><IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository(undefined, null)}><PicksPage /></PicksProvider>
      </IdentityProvider></MemoryRouter>,
    );

    expect(await screen.findByText("STANDINGS & EVENTS")).toBeInTheDocument();
    fireEvent.click(screen.getByText("STANDINGS & EVENTS"));
    fireEvent.click(screen.getByRole("tab", { name: "EVENTS" }));
    expect(await screen.findByText("UFC Oklahoma City Recap")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /OPEN FULL RECAP/i }));

    expect(await screen.findByRole("dialog", { name: "UFC Oklahoma City Recap" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Event Standings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fight by Fight" })).toBeInTheDocument();
    expect(screen.getAllByText("SHANE").length).toBeGreaterThan(0);
    expect(screen.getByText("ROOM TRAP")).toBeInTheDocument();
    expect(screen.queryByText("ROOM NAILED IT")).not.toBeInTheDocument();
    expect(screen.getByText("No contest")).toBeInTheDocument();
    expect(screen.getByText("Excluded")).toBeInTheDocument();
  });

  it("uses the persisted event header without covering the fighters with upcoming labels", async () => {
    const belgradeEvent: PickEvent = {
      ...event,
      subtitle: "Uroš Medić vs. Daniel Rodriguez",
      venue: "Belgrade Arena",
      location: "Belgrade, Serbia",
      headerStoragePath: "ufc-test-event/event-header",
      headerNaturalWidth: 2400,
      headerNaturalHeight: 1200,
      bouts: [{
        ...event.bouts[0],
        boutId: "medic-rodriguez",
        redFighterSlug: "uros-medic",
        redFighterName: "Uroš Medić",
        blueFighterSlug: "daniel-rodriguez",
        blueFighterName: "Daniel Rodriguez",
      }],
    };

    const { container } = render(
      <MemoryRouter><IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository(undefined, belgradeEvent)}><PicksPage /></PicksProvider>
      </IdentityProvider></MemoryRouter>,
    );

    await screen.findByText("Uroš Medić vs. Daniel Rodriguez");
    const hero = container.querySelector(".picks-event-hero");
    expect(hero).toHaveClass("has-poster");
    expect(hero).toHaveStyle('--picks-event-poster: url("https://storage.test/pick-event-headers/ufc-test-event/event-header")');
    expect(hero).toHaveStyle("--picks-event-poster-aspect: 2400 / 1200");
    expect(screen.queryByText("NEXT UFC EVENT")).not.toBeInTheDocument();
    expect(screen.queryByText("UPCOMING")).not.toBeInTheDocument();
  });

  it("uses the standard no-poster hero when no persisted event header exists", async () => {
    const { container } = render(
      <MemoryRouter><IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository()}><PicksPage /></PicksProvider>
      </IdentityProvider></MemoryRouter>,
    );

    await screen.findByText("Ankalaev vs. Guskov");
    expect(container.querySelector(".picks-event-hero")).not.toHaveClass("has-poster");
  });

  it("opens the V1-style main event spotlight only for Medic versus Rodriguez", async () => {
    const belgradeEvent: PickEvent = {
      ...event,
      subtitle: "Uroš Medić vs. Daniel Rodriguez",
      venue: "Belgrade Arena",
      location: "Belgrade, Serbia",
      bouts: [{
        ...event.bouts[0],
        boutId: "medic-rodriguez",
        position: 1,
        weightClass: "Welterweight",
        redFighterSlug: "uros-medic",
        redFighterName: "Uroš Medić",
        blueFighterSlug: "daniel-rodriguez",
        blueFighterName: "Daniel Rodriguez",
        redAmericanOdds: -150,
        blueAmericanOdds: 130,
      }],
    };

    render(
      <MemoryRouter><IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository(undefined, belgradeEvent)}><PicksPage /></PicksProvider>
      </IdentityProvider></MemoryRouter>,
    );

    const trigger = await screen.findByRole("button", { name: /View matchup breakdown/i });
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog", { name: "Uroš Medić vs. Daniel Rodriguez" })).toBeInTheDocument();
    expect(screen.getByText("TALE OF THE TAPE")).toBeInTheDocument();
    expect(screen.getByText("MATCHUP EDGES")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "WATCH SPOTLIGHT ↗" })).toHaveAttribute(
      "href",
      "https://youtu.be/IBzzsI7TrDc?is=q7Q8ZfSD8TobYbjl",
    );
  });
});
