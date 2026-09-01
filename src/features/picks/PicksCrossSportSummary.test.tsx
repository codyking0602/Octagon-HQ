import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import { emptyPickHistory, type PickEvent, type PickHistory } from "./picksModel";
import { PicksProvider, usePicks } from "./PicksProvider";
import type { PicksRepository } from "./picksRepository";

const cody = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
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

const footballEvent: PickEvent = {
  eventId: "football-2026-week-1",
  sport: "football",
  league: "football",
  eventKind: "slate",
  name: "Football Week 1",
  subtitle: "College + NFL",
  venue: "",
  location: "",
  startsAt: "2026-09-05T11:00:00-05:00",
  locksAt: "2026-09-05T11:00:00-05:00",
  season: 2026,
  status: "upcoming",
  bouts: [
    {
      boutId: "cfb-game",
      position: 1,
      weightClass: "COLLEGE ATS",
      redFighterSlug: "lsu",
      redFighterName: "LSU",
      blueFighterSlug: "clemson",
      blueFighterName: "Clemson",
      redAmericanOdds: null,
      blueAmericanOdds: null,
      winnerFighterSlug: null,
      includedInPicks: true,
    },
  ],
};

const footballHistory: PickHistory = {
  ...emptyPickHistory,
  season: 2026,
  seasonStandings: [
    {
      rank: 2,
      profileId: cody.id,
      displayName: "CODY",
      isCurrentUser: true,
      correct: 9,
      incorrect: 3,
      missing: 0,
      excluded: 0,
      basePoints: 9,
      lockBonus: 2,
      totalPoints: 11,
      eventsEntered: 1,
    },
  ],
};

function Probe() {
  const picks = usePicks();
  return (
    <div>
      <span>UFC {picks.summary.correct}-{picks.summary.incorrect}</span>
      <span>FOOTBALL {picks.footballSummary.correct}-{picks.footballSummary.incorrect}</span>
      <span>FOOTBALL ERROR {picks.footballSummaryError || "NONE"}</span>
      <span>FOOTBALL EVENT {picks.footballEvent?.name ?? "NONE"}</span>
      <span>FOOTBALL PICK {picks.footballSelections["cfb-game"] ?? "NONE"}</span>
      <span>FOOTBALL RANK {picks.footballHistory.seasonStandings?.find((standing) => standing.isCurrentUser)?.rank ?? "NONE"}</span>
      <span>FOOTBALL HOME ERROR {picks.footballHomeError || "NONE"}</span>
    </div>
  );
}

describe("PicksProvider cross-sport summary", () => {
  it("loads the Football Home snapshot through the existing app-level Picks repository owner", async () => {
    const loadCurrentEvent = vi.fn(async (sport = "mma") => sport === "football" ? footballEvent : null);
    const loadMyPicks = vi.fn(async (eventId: string) => eventId === footballEvent.eventId
      ? [{
          eventId,
          boutId: "cfb-game",
          fighterSlug: "clemson",
          pickedAt: "2026-09-01T12:00:00Z",
          updatedAt: "2026-09-01T12:00:00Z",
        }]
      : []);
    const loadMySummary = vi.fn(async (_season: number, sport = "mma") => sport === "football"
      ? { correct: 9, incorrect: 3, pending: 2, eventsEntered: 3, basePoints: 36, lockBonus: 4, totalPoints: 40 }
      : { correct: 12, incorrect: 8, pending: 1, eventsEntered: 4, basePoints: 48, lockBonus: 0, totalPoints: 48 });
    const loadMyHistory = vi.fn(async (_season: number, sport = "mma") => sport === "football"
      ? footballHistory
      : emptyPickHistory);
    const repository: PicksRepository = {
      loadCurrentEvent,
      loadMyPicks,
      loadMyUnderdogLock: vi.fn(async () => null),
      loadMySummary,
      loadMyHistory,
      savePick: vi.fn(),
      setUnderdogLock: vi.fn(),
      clearUnderdogLock: vi.fn(),
    };

    render(
      <IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository} includeFootballSummary>
          <Probe />
        </PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("UFC 12-8")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL 9-3")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL ERROR NONE")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL EVENT Football Week 1")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL PICK clemson")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL RANK 2")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL HOME ERROR NONE")).toBeInTheDocument();
    await waitFor(() => {
      expect(loadCurrentEvent).toHaveBeenCalledWith("mma");
      expect(loadCurrentEvent).toHaveBeenCalledWith("football");
      expect(loadMyPicks).toHaveBeenCalledWith(footballEvent.eventId);
      expect(loadMySummary).toHaveBeenCalledWith(2026, "football");
      expect(loadMyHistory).toHaveBeenCalledWith(2026, "football");
    });
  });
});
