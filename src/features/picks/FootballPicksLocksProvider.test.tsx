import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import { emptyPickHistory, emptyPickSummary, type PickEvent } from "./picksModel";
import { PicksProvider, usePicks } from "./PicksProvider";
import type { PicksRepository } from "./picksRepository";

const profile = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const event: PickEvent = {
  eventId: "football-week-1",
  sport: "football",
  league: "mixed",
  eventKind: "slate",
  name: "Football Week 1",
  subtitle: "Opening weekend",
  venue: "Multiple venues",
  location: "Nationwide",
  startsAt: "2099-09-03T16:00:00.000Z",
  locksAt: "2099-09-03T16:00:00.000Z",
  season: 2099,
  status: "upcoming",
  bouts: [{
    boutId: "texas-ohio-state",
    position: 1,
    weightClass: "CFB ATS",
    redFighterSlug: "texas",
    redFighterName: "Texas Longhorns",
    blueFighterSlug: "ohio-state",
    blueFighterName: "Ohio State Buckeyes",
    homeTeamSlug: "texas",
    awayTeamSlug: "ohio-state",
    frozenSpreadHome: -3.5,
    redAmericanOdds: null,
    blueAmericanOdds: null,
    winnerFighterSlug: null,
    resultStatus: "pending",
    isLocked: false,
  }, {
    boutId: "dallas-philadelphia",
    position: 2,
    weightClass: "NFL ATS",
    redFighterSlug: "dallas",
    redFighterName: "Dallas Cowboys",
    blueFighterSlug: "philadelphia",
    blueFighterName: "Philadelphia Eagles",
    homeTeamSlug: "dallas",
    awayTeamSlug: "philadelphia",
    frozenSpreadHome: -2.5,
    redAmericanOdds: null,
    blueAmericanOdds: null,
    winnerFighterSlug: null,
    resultStatus: "pending",
    isLocked: false,
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

function LockProbe() {
  const picks = usePicks();
  return (
    <div>
      <span>TEAM {picks.selections["texas-ohio-state"] ?? "NONE"}</span>
      <span>FOOTBALL LOCK {picks.footballLocks["texas-ohio-state"] ? "YES" : "NO"}</span>
      <button type="button" onClick={() => void picks.setFootballLock("texas-ohio-state", true)}>MAKE LOCK</button>
      <button type="button" onClick={() => void picks.setPick("texas-ohio-state", "ohio-state")}>CHANGE TEAM</button>
    </div>
  );
}

function repositoryWithPick(isLock: boolean, savePick = vi.fn()): PicksRepository {
  return {
    loadCurrentEvent: vi.fn(async () => event),
    loadMyPicks: vi.fn(async () => [{
      eventId: event.eventId,
      boutId: "texas-ohio-state",
      fighterSlug: "texas",
      isLock,
      pickedAt: "2099-09-01T12:00:00.000Z",
      updatedAt: "2099-09-01T12:00:00.000Z",
    }]),
    loadMyUnderdogLock: vi.fn(async () => null),
    loadMySummary: vi.fn(async () => emptyPickSummary),
    loadMyHistory: vi.fn(async () => ({ ...emptyPickHistory, season: 2099 })),
    savePick,
    setUnderdogLock: vi.fn(),
    clearUnderdogLock: vi.fn(),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Football Picks Lock persistence", () => {
  it("toggles a Football Lock through the existing canonical savePick mutation", async () => {
    const savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string, isLock?: boolean) => ({
      eventId, boutId, fighterSlug, isLock,
      pickedAt: "2099-09-01T12:00:00.000Z",
      updatedAt: "2099-09-01T12:05:00.000Z",
    }));
    const repository = repositoryWithPick(false, savePick);

    render(
      <IdentityProvider gateway={gateway()}>
        <PicksProvider sport="football" repository={repository}><LockProbe /></PicksProvider>
      </IdentityProvider>,
    );

    await screen.findByText("TEAM texas");
    expect(screen.getByText("FOOTBALL LOCK NO")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "MAKE LOCK" }));

    await waitFor(() => expect(savePick).toHaveBeenCalledWith(event.eventId, "texas-ohio-state", "texas", true));
    await waitFor(() => expect(screen.getByText("FOOTBALL LOCK YES")).toBeInTheDocument());
  });

  it("preserves an existing Lock when the selected team changes before kickoff", async () => {
    const savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string, isLock?: boolean) => ({
      eventId, boutId, fighterSlug, isLock,
      pickedAt: "2099-09-01T12:00:00.000Z",
      updatedAt: "2099-09-01T12:05:00.000Z",
    }));
    const repository = repositoryWithPick(true, savePick);

    render(
      <IdentityProvider gateway={gateway()}>
        <PicksProvider sport="football" repository={repository}><LockProbe /></PicksProvider>
      </IdentityProvider>,
    );

    await screen.findByText("FOOTBALL LOCK YES");
    fireEvent.click(screen.getByRole("button", { name: "CHANGE TEAM" }));

    await waitFor(() => expect(savePick).toHaveBeenCalledWith(event.eventId, "texas-ohio-state", "ohio-state", true));
    await waitFor(() => expect(screen.getByText("TEAM ohio-state")).toBeInTheDocument());
    expect(screen.getByText("FOOTBALL LOCK YES")).toBeInTheDocument();
  });
});
