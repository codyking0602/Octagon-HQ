import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import { PicksProvider, usePicks } from "./PicksProvider";
import type { PickEvent, PickHistory } from "./picksModel";
import type { PicksRepository } from "./picksRepository";

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
    winnerFighterSlug: null,
  }],
};

const history: PickHistory = {
  season: 2026,
  summary: {
    correct: 4,
    incorrect: 1,
    missing: 0,
    excluded: 1,
    basePoints: 16,
    lockBonus: 2,
    totalPoints: 18,
    eventsEntered: 1,
  },
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
      boutId: "sample-bout",
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

function Probe() {
  const picks = usePicks();
  return (
    <div>
      <span>{picks.event?.subtitle ?? "NO EVENT"}</span>
      <span>SELECTION {picks.selections["ankalaev-guskov"] ?? "NONE"}</span>
      <span>LOCK {picks.underdogLock?.fighterSlug ?? "NONE"}</span>
      <span>SCORE {picks.summary.totalPoints}</span>
      <span>{picks.summary.correct}-{picks.summary.incorrect}</span>
      <span>FOOTBALL {picks.footballSummary ? `${picks.footballSummary.correct}-${picks.footballSummary.incorrect}` : "NONE"}</span>
      <span>{picks.history.events.length} RECAP</span>
      <span>{picks.history.events[0]?.name ?? "NO RECAP"}</span>
      <button type="button" onClick={() => void picks.setPick("ankalaev-guskov", "magomed-ankalaev")}>PICK ANKALAEV</button>
    </div>
  );
}

describe("PicksProvider", () => {
  it("selects Football through the same provider and shared profile paths", async () => {
    const footballEvent: PickEvent = {
      ...event,
      eventId: "nfl-week-1",
      sport: "football",
      league: "nfl",
      eventKind: "slate",
      subtitle: "NFL Week 1",
    };
    const loadCurrentEvent = vi.fn(async () => footballEvent);
    const loadMyPicks = vi.fn(async () => []);
    const loadMySummary = vi.fn(async () => ({ correct: 0, incorrect: 0, pending: 0, eventsEntered: 0, basePoints: 0, lockBonus: 0, totalPoints: 0 }));
    const loadMyHistory = vi.fn(async () => ({ ...history, events: [] }));
    const repository: PicksRepository = {
      loadCurrentEvent,
      loadMyPicks,
      loadMySummary,
      loadMyHistory,
      loadMyUnderdogLock: vi.fn(async () => null),
      setUnderdogLock: vi.fn(),
      clearUnderdogLock: vi.fn(),
      savePick: vi.fn(),
    };

    render(
      <IdentityProvider gateway={gateway()}>
        <PicksProvider sport="football" repository={repository}><Probe /></PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("NFL Week 1")).toBeInTheDocument();
    expect(await screen.findByText("FOOTBALL 0-0")).toBeInTheDocument();
    expect(loadCurrentEvent).toHaveBeenCalledWith("football");
    await waitFor(() => expect(loadMyPicks).toHaveBeenCalledWith("nfl-week-1"));
    expect(loadMySummary).toHaveBeenCalledWith(2026, "football");
    expect(loadMyHistory).toHaveBeenCalledWith(2026, "football");
  });

  it("exposes the canonical Football summary from the existing app-level repository while preserving UFC refresh behavior", async () => {
    const loadMyPicks = vi.fn(async () => [{
      eventId: event.eventId,
      boutId: "ankalaev-guskov",
      fighterSlug: "bogdan-guskov",
      pickedAt: "2026-07-24T12:00:00.000Z",
      updatedAt: "2026-07-24T12:00:00.000Z",
    }]);
    let mmaSummaryLoads = 0;
    const loadMySummary = vi.fn(async (_season: number, sport?: "mma" | "football") => {
      if (sport === "football") {
        return { correct: 7, incorrect: 3, pending: 2, eventsEntered: 3, basePoints: 28, lockBonus: 1, totalPoints: 29 };
      }
      mmaSummaryLoads += 1;
      return mmaSummaryLoads === 1
        ? { correct: 4, incorrect: 2, pending: 1, eventsEntered: 1, basePoints: 16, lockBonus: 0, totalPoints: 16 }
        : { correct: 5, incorrect: 2, pending: 1, eventsEntered: 1, basePoints: 20, lockBonus: 0, totalPoints: 20 };
    });
    const loadMyHistory = vi.fn(async () => history);
    const loadMyUnderdogLock = vi.fn()
      .mockResolvedValueOnce({
        eventId: event.eventId,
        boutId: "ankalaev-guskov",
        fighterSlug: "bogdan-guskov",
        selectedAt: "2026-07-24T12:00:00.000Z",
        frozenAmericanOdds: null,
      })
      .mockResolvedValueOnce(null);
    const savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string) => ({
      eventId,
      boutId,
      fighterSlug,
      pickedAt: "2026-07-24T12:00:00.000Z",
      updatedAt: "2026-07-24T12:05:00.000Z",
    }));
    const repository: PicksRepository = {
      loadCurrentEvent: async () => event,
      loadMyPicks,
      loadMySummary,
      loadMyHistory,
      loadMyUnderdogLock,
      setUnderdogLock: vi.fn(),
      clearUnderdogLock: vi.fn(),
      savePick,
    };

    render(
      <IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository}><Probe /></PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("Ankalaev vs. Guskov")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("SELECTION bogdan-guskov")).toBeInTheDocument());
    expect(screen.getByText("LOCK bogdan-guskov")).toBeInTheDocument();
    expect(screen.getByText("SCORE 16")).toBeInTheDocument();
    expect(screen.getByText("4-2")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL 7-3")).toBeInTheDocument();
    expect(screen.getByText("1 RECAP")).toBeInTheDocument();
    expect(screen.getByText("UFC Oklahoma City")).toBeInTheDocument();
    expect(loadMyPicks).toHaveBeenCalledWith(event.eventId);
    expect(loadMyHistory).toHaveBeenCalledWith(2026, "mma");
    expect(loadMySummary).toHaveBeenCalledWith(2026, "football");

    fireEvent.click(screen.getByRole("button", { name: "PICK ANKALAEV" }));
    await waitFor(() => expect(savePick).toHaveBeenCalledWith(event.eventId, "ankalaev-guskov", "magomed-ankalaev"));
    await waitFor(() => expect(screen.getByText("SELECTION magomed-ankalaev")).toBeInTheDocument());
    expect(screen.getByText("LOCK NONE")).toBeInTheDocument();
    expect(screen.getByText("SCORE 20")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL 7-3")).toBeInTheDocument();
    expect(loadMyUnderdogLock).toHaveBeenCalledTimes(2);
    expect(loadMySummary.mock.calls.filter(([, requestedSport]) => requestedSport === "mma")).toHaveLength(2);
    expect(loadMySummary.mock.calls.filter(([, requestedSport]) => requestedSport === "football")).toHaveLength(1);
  });

  it("loads completed history even while the next event is not available", async () => {
    const loadMyPicks = vi.fn(async () => []);
    const loadMyHistory = vi.fn(async () => history);
    const loadMySummary = vi.fn(async (_season: number, sport?: "mma" | "football") => (
      sport === "football"
        ? { correct: 2, incorrect: 1, pending: 0, eventsEntered: 1, basePoints: 8, lockBonus: 0, totalPoints: 8 }
        : { correct: 4, incorrect: 1, pending: 0, eventsEntered: 1, basePoints: 16, lockBonus: 0, totalPoints: 16 }
    ));
    const repository: PicksRepository = {
      loadCurrentEvent: async () => null,
      loadMyPicks,
      loadMySummary,
      loadMyHistory,
      loadMyUnderdogLock: async () => null,
      setUnderdogLock: vi.fn(),
      clearUnderdogLock: vi.fn(),
      savePick: vi.fn(),
    };

    render(
      <IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository}><Probe /></PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("UFC Oklahoma City")).toBeInTheDocument();
    expect(screen.getByText("NO EVENT")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL 2-1")).toBeInTheDocument();
    expect(loadMyPicks).not.toHaveBeenCalled();
    expect(loadMyHistory).toHaveBeenCalledWith(new Date().getFullYear(), "mma");
    expect(loadMySummary).toHaveBeenCalledWith(new Date().getFullYear(), "football");
  });

  it("loads the public event without requesting profile data while signed out", async () => {
    const loadMyPicks = vi.fn(async () => []);
    const loadMySummary = vi.fn(async () => ({ correct: 0, incorrect: 0, pending: 0, eventsEntered: 0, basePoints: 0, lockBonus: 0, totalPoints: 0 }));
    const loadMyHistory = vi.fn(async () => history);
    const repository: PicksRepository = {
      loadCurrentEvent: async () => event,
      loadMyPicks,
      loadMySummary,
      loadMyHistory,
      loadMyUnderdogLock: async () => null,
      setUnderdogLock: vi.fn(),
      clearUnderdogLock: vi.fn(),
      savePick: vi.fn(),
    };

    render(
      <IdentityProvider gateway={null}>
        <PicksProvider repository={repository}><Probe /></PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("Ankalaev vs. Guskov")).toBeInTheDocument();
    expect(screen.getByText("SELECTION NONE")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL NONE")).toBeInTheDocument();
    expect(screen.getByText("0 RECAP")).toBeInTheDocument();
    expect(loadMyPicks).not.toHaveBeenCalled();
    expect(loadMySummary).not.toHaveBeenCalled();
    expect(loadMyHistory).not.toHaveBeenCalled();
  });
});
