import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import PicksPage from "./PicksPage";
import { PicksProvider } from "./PicksProvider";
import {
  pickEventPresentation,
  type PickEvent,
  type PickHistory,
} from "./picksModel";
import type { PicksRepository } from "./picksRepository";

const cody = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const bout = {
  boutId: "red-blue",
  position: 7,
  weightClass: "Lightweight",
  redFighterSlug: "magomed-ankalaev",
  redFighterName: "Magomed Ankalaev",
  blueFighterSlug: "bogdan-guskov",
  blueFighterName: "Bogdan Guskov",
  redAmericanOdds: -180,
  blueAmericanOdds: 155,
  winnerFighterSlug: null,
  resultStatus: "pending" as const,
  resultRecordedAt: null,
};

const upcomingEvent: PickEvent = {
  eventId: "ufc-upcoming",
  name: "UFC Fight Night",
  subtitle: "Ankalaev vs. Guskov",
  venue: "Etihad Arena",
  location: "Abu Dhabi, United Arab Emirates",
  startsAt: "2099-07-25T18:00:00.000Z",
  locksAt: "2099-07-25T16:00:00.000Z",
  season: 2026,
  status: "upcoming",
  bouts: [bout],
};

const lockedEvent: PickEvent = {
  ...upcomingEvent,
  eventId: "ufc-locked",
  locksAt: "2000-07-25T16:00:00.000Z",
  status: "locked",
};

const awaitingEvent: PickEvent = {
  ...lockedEvent,
  eventId: "ufc-awaiting",
  startsAt: "2000-07-25T18:00:00.000Z",
};

const completeEvent: PickEvent = {
  ...awaitingEvent,
  eventId: "ufc-complete",
  status: "complete",
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

const recapHistory: PickHistory = {
  season: 2026,
  summary: {
    correct: 2,
    incorrect: 0,
    missing: 0,
    excluded: 0,
    basePoints: 8,
    lockBonus: 2,
    totalPoints: 10,
    eventsEntered: 1,
  },
  events: [{
    eventId: "ufc-recap",
    name: "UFC Oklahoma City",
    subtitle: "Main Card",
    venue: "Paycom Center",
    location: "Oklahoma City, Oklahoma",
    startsAt: "2026-06-20T23:00:00.000Z",
    season: 2026,
    completedAt: "2026-06-21T04:00:00.000Z",
    record: {
      correct: 2,
      incorrect: 0,
      missing: 0,
      excluded: 0,
      basePoints: 8,
      lockBonus: 2,
      totalPoints: 10,
    },
    underdogLock: null,
    bouts: [{
      boutId: "main-event",
      position: 7,
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
      boutId: "co-main",
      position: 8,
      weightClass: "Welterweight",
      redFighterSlug: "third-fighter",
      redFighterName: "Third Fighter",
      blueFighterSlug: "fourth-fighter",
      blueFighterName: "Fourth Fighter",
      resultStatus: "blue_win",
      winnerFighterSlug: "fourth-fighter",
      pickedFighterSlug: "fourth-fighter",
      verdict: "correct",
    }],
    groupResults: [{
      displayName: "CODY",
      correct: 2,
      incorrect: 0,
      missing: 0,
      excluded: 0,
      rank: 1,
      basePoints: 8,
      lockBonus: 2,
      totalPoints: 10,
      isCurrentUser: true,
    }, {
      displayName: "SHANE",
      correct: 2,
      incorrect: 0,
      missing: 0,
      excluded: 0,
      rank: 1,
      basePoints: 8,
      lockBonus: 2,
      totalPoints: 10,
      isCurrentUser: false,
    }, {
      displayName: "TONY",
      correct: 2,
      incorrect: 0,
      missing: 0,
      excluded: 0,
      rank: 3,
      basePoints: 8,
      lockBonus: 0,
      totalPoints: 8,
      isCurrentUser: false,
    }, {
      displayName: "TYLER",
      correct: 1,
      incorrect: 1,
      missing: 0,
      excluded: 0,
      rank: 4,
      basePoints: 4,
      lockBonus: 0,
      totalPoints: 4,
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

function repository({
  currentEvent = upcomingEvent,
  selections = [],
  history = emptyHistory,
  savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string) => ({
    eventId,
    boutId,
    fighterSlug,
    pickedAt: "2026-07-24T12:00:00.000Z",
    updatedAt: "2026-07-24T12:00:00.000Z",
  })),
}: {
  currentEvent?: PickEvent | null;
  selections?: Awaited<ReturnType<PicksRepository["loadMyPicks"]>>;
  history?: PickHistory;
  savePick?: PicksRepository["savePick"];
} = {}): PicksRepository {
  return {
    loadCurrentEvent: async () => currentEvent,
    loadMyPicks: async () => selections,
    loadMySummary: async () => ({
      correct: 0,
      incorrect: 0,
      pending: currentEvent?.bouts.length ?? 0,
      eventsEntered: selections.length ? 1 : 0,
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
}

function renderPage(repo: PicksRepository, signedIn = true) {
  return render(
    <IdentityProvider gateway={signedIn ? gateway() : null}>
      <PicksProvider repository={repo}><PicksPage /></PicksProvider>
    </IdentityProvider>,
  );
}

afterEach(cleanup);

describe("Picks lifecycle presentation", () => {
  it("derives upcoming, locked, awaiting-results, and complete labels from canonical event data", () => {
    expect(pickEventPresentation(upcomingEvent)).toEqual({
      state: "upcoming",
      eyebrow: "NEXT UFC EVENT",
      status: "UPCOMING",
    });
    expect(pickEventPresentation(lockedEvent)).toEqual({
      state: "locked",
      eyebrow: "PICKS LOCKED",
      status: "LOCKED",
    });
    expect(pickEventPresentation(awaitingEvent)).toEqual({
      state: "awaiting_results",
      eyebrow: "EVENT IN PROGRESS",
      status: "AWAITING RESULTS",
    });
    expect(pickEventPresentation(completeEvent).state).toBe("complete");
  });

  it.each([
    [upcomingEvent, "NEXT UFC EVENT", "UPCOMING"],
    [lockedEvent, "PICKS LOCKED", "LOCKED"],
    [awaitingEvent, "EVENT IN PROGRESS", "AWAITING RESULTS"],
  ] as const)("renders the canonical %s lifecycle labels", async (currentEvent, eyebrow, status) => {
    renderPage(repository({ currentEvent }), false);
    expect(await screen.findByText(eyebrow)).toBeInTheDocument();
    expect(screen.getByText(status)).toBeInTheDocument();
  });

  it("does not present a completed event as the active upcoming card", async () => {
    renderPage(repository({ currentEvent: completeEvent }));
    expect(await screen.findByText("NO ACTIVE CARD")).toBeInTheDocument();
    expect(screen.queryByText("NEXT UFC EVENT")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: completeEvent.name })).not.toBeInTheDocument();
  });
});

describe("locked fight cards and scoring guide", () => {
  it("shows YOUR PICK, NOT PICKED, complete progress, and retained fighter thumbnails after lock", async () => {
    const { container } = renderPage(repository({
      currentEvent: lockedEvent,
      selections: [{
        eventId: lockedEvent.eventId,
        boutId: bout.boutId,
        fighterSlug: bout.redFighterSlug,
        pickedAt: "2026-07-24T12:00:00.000Z",
        updatedAt: "2026-07-24T12:00:00.000Z",
      }],
    }));

    const selected = await screen.findByRole("button", { name: /Magomed Ankalaev/i });
    const unselected = screen.getByRole("button", { name: /Bogdan Guskov/i });
    expect(within(selected).getByText("YOUR PICK")).toBeInTheDocument();
    expect(within(unselected).getByText("NOT PICKED")).toBeInTheDocument();
    expect(selected).toBeDisabled();
    expect(unselected).toBeDisabled();
    expect(container.querySelector(".picks-progress__track")).toHaveClass("is-complete");
    expect(container.querySelectorAll(".pick-fighter-thumbnail")).toHaveLength(2);
  });

  it("keeps open cards interactive, labeled PICK FIGHTER, and on the existing save flow", async () => {
    const savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string) => ({
      eventId,
      boutId,
      fighterSlug,
      pickedAt: "2026-07-24T12:00:00.000Z",
      updatedAt: "2026-07-24T12:00:00.000Z",
    }));
    renderPage(repository({ currentEvent: upcomingEvent, savePick }));

    const blueChoice = await screen.findByRole("button", { name: /Bogdan Guskov/i });
    expect(screen.getAllByText("PICK FIGHTER")).toHaveLength(2);
    expect(blueChoice).not.toBeDisabled();
    fireEvent.click(blueChoice);
    await waitFor(() => expect(savePick).toHaveBeenCalledWith(
      upcomingEvent.eventId,
      bout.boutId,
      bout.blueFighterSlug,
    ));
  });

  it("keeps the scoring guide collapsed and includes every Underdog Lock bonus tier", async () => {
    renderPage(repository({ currentEvent: upcomingEvent }), false);
    await screen.findByText("HOW SCORING WORKS");
    const summary = screen.getByText("HOW SCORING WORKS").closest("summary");
    const details = summary?.closest("details");
    expect(details).not.toHaveAttribute("open");
    fireEvent.click(summary!);
    for (const tier of ["+100–149", "+150–199", "+200–249", "+250–299", "+300–349", "+350–399", "+400+"]) {
      expect(screen.getByText(tier)).toBeInTheDocument();
    }
  });
});

describe("completed recap polish", () => {
  it("shows authoritative tied finish labels and keeps fight details collapsed until requested", async () => {
    renderPage(repository({ currentEvent: null, history: recapHistory }));

    expect(await screen.findByText("T-1 OF 4")).toBeInTheDocument();
    expect(screen.getAllByText("T-1")).toHaveLength(2);
    expect(screen.getByText("3")).toBeInTheDocument();

    const toggleText = screen.getByText("VIEW FIGHT-BY-FIGHT RESULTS");
    const summary = toggleText.closest("summary");
    const details = summary?.closest("details");
    expect(details).not.toHaveAttribute("open");
    fireEvent.click(summary!);
    expect(details).toHaveAttribute("open");
    expect(screen.getByText("MAIN EVENT")).toBeInTheDocument();
    expect(screen.getByText("MAIN CARD · FIGHT 2")).toBeInTheDocument();
    expect(screen.queryByText("FIGHT 7")).not.toBeInTheDocument();
    expect(screen.queryByText("FIGHT 8")).not.toBeInTheDocument();
    expect(screen.getAllByText("Correct")).toHaveLength(2);
  });
});
