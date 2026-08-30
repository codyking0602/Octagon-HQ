import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import { emptyPickHistory, emptyPickSummary, type PickEvent } from "./picksModel";
import { PicksProvider, usePicks } from "./PicksProvider";
import type { PicksRepository } from "./picksRepository";

vi.mock("./picksGroupProgressRepository", () => ({ loadPickGroupProgress: vi.fn(async () => []) }));

const profile = { id: "11111111-1111-4111-8111-111111111111", displayName: "CODY", initials: "CK" };
const event: PickEvent = {
  eventId: "football-lock-test",
  sport: "football",
  league: "nfl",
  eventKind: "slate",
  name: "Football Lock Test",
  subtitle: "Week 1",
  venue: "Multiple venues",
  location: "Nationwide",
  startsAt: "2099-09-03T16:00:00.000Z",
  locksAt: "2099-09-03T16:00:00.000Z",
  season: 2099,
  status: "upcoming",
  bouts: [{
    boutId: "game-one",
    locksAt: "2099-09-03T16:00:00.000Z",
    isLocked: false,
    position: 1,
    weightClass: "NFL ATS",
    redFighterSlug: "home-one",
    redFighterName: "Home One",
    blueFighterSlug: "away-one",
    blueFighterName: "Away One",
    redAmericanOdds: null,
    blueAmericanOdds: null,
    winnerFighterSlug: null,
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

function Probe() {
  const picks = usePicks();
  return (
    <div>
      <span>{picks.selections["game-one"] ?? "NO PICK"}</span>
      <span>{picks.footballLocks["game-one"] ? "LOCK YES" : "LOCK NO"}</span>
      <button type="button" onClick={() => void picks.setFootballLock("game-one", true)}>MAKE LOCK</button>
    </div>
  );
}

describe("Football Lock persistence", () => {
  it("loads and saves Lock state through the existing Picks repository mutation", async () => {
    const savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string, isLock?: boolean) => ({
      eventId, boutId, fighterSlug, isLock,
      pickedAt: "2099-09-01T12:00:00.000Z",
      updatedAt: "2099-09-01T12:05:00.000Z",
    }));
    const repository: PicksRepository = {
      loadCurrentEvent: vi.fn(async () => event),
      loadMyPicks: vi.fn(async () => [{
        eventId: event.eventId,
        boutId: "game-one",
        fighterSlug: "home-one",
        isLock: false,
        pickedAt: "2099-09-01T12:00:00.000Z",
        updatedAt: "2099-09-01T12:00:00.000Z",
      }]),
      loadMyUnderdogLock: vi.fn(async () => null),
      loadMySummary: vi.fn(async () => emptyPickSummary),
      loadMyHistory: vi.fn(async () => emptyPickHistory),
      savePick,
      setUnderdogLock: vi.fn(),
      clearUnderdogLock: vi.fn(),
    };

    render(
      <IdentityProvider gateway={gateway()}>
        <PicksProvider sport="football" repository={repository}><Probe /></PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("home-one")).toBeInTheDocument();
    expect(screen.getByText("LOCK NO")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "MAKE LOCK" }));

    await waitFor(() => expect(savePick).toHaveBeenCalledWith(event.eventId, "game-one", "home-one", true));
    expect(await screen.findByText("LOCK YES")).toBeInTheDocument();
  });
});
