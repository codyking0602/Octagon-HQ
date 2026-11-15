import { describe, expect, it } from "vitest";
import { ufcLiveStandingsForMembers } from "./ufcGroupLiveStandings";
import type { PickEvent, UnderdogLock } from "./picksModel";
import type { PickEventMemberProgress } from "./groupProgressModel";

const members: PickEventMemberProgress[] = [
  {
    profileId: "cody", displayName: "CODY", completed: 3, total: 3,
    hasUnderdogLock: true, underdogLockBoutId: "b1",
    underdogLockFighterSlug: "red-1", isCurrentUser: true,
  },
  {
    profileId: "shane", displayName: "SHANE", completed: 3, total: 3,
    hasUnderdogLock: false, underdogLockBoutId: null,
    underdogLockFighterSlug: null, isCurrentUser: false,
  },
  {
    profileId: "inactive", displayName: "INACTIVE", completed: 0, total: 3,
    hasUnderdogLock: false, underdogLockBoutId: null,
    underdogLockFighterSlug: null, isCurrentUser: false,
  },
];
const myLock: UnderdogLock = {
  eventId: "ufc-test", boutId: "b1", fighterSlug: "red-1",
  selectedAt: "2026-11-14T01:00:00Z", frozenAmericanOdds: 150,
};
const event: PickEvent = {
  eventId: "ufc-test", sport: "mma", name: "UFC Test",
  subtitle: "Main Card", venue: "Test Arena", location: "Dallas",
  startsAt: "2026-11-14T18:00:00Z", locksAt: "2026-11-14T18:00:00Z",
  season: 2026, status: "locked",
  bouts: [
    {
      boutId: "b1", position: 1, weightClass: "Lightweight", isLocked: true,
      redFighterSlug: "red-1", redFighterName: "Red One",
      blueFighterSlug: "blue-1", blueFighterName: "Blue One",
      redAmericanOdds: 120, blueAmericanOdds: -145,
      winnerFighterSlug: "red-1", resultStatus: "red_win",
      groupPicks: [
        { displayName: "CODY", pickedFighterSlug: "red-1", isCurrentUser: true },
        { displayName: "SHANE", pickedFighterSlug: "blue-1", isCurrentUser: false },
      ],
    },
    {
      boutId: "b2", position: 2, weightClass: "Welterweight", isLocked: true,
      redFighterSlug: "red-2", redFighterName: "Red Two",
      blueFighterSlug: "blue-2", blueFighterName: "Blue Two",
      redAmericanOdds: -110, blueAmericanOdds: -110,
      winnerFighterSlug: "blue-2", resultStatus: "blue_win",
      groupPicks: [
        { displayName: "CODY", pickedFighterSlug: "red-2", isCurrentUser: true },
        { displayName: "SHANE", pickedFighterSlug: "blue-2", isCurrentUser: false },
      ],
    },
    {
      boutId: "b3", position: 3, weightClass: "Middleweight", isLocked: false,
      redFighterSlug: "red-3", redFighterName: "Red Three",
      blueFighterSlug: "blue-3", blueFighterName: "Blue Three",
      redAmericanOdds: -110, blueAmericanOdds: -110,
      winnerFighterSlug: null, resultStatus: "pending",
    },
  ],
};

describe("UFC live group standings", () => {
  it("matches the Football-style record/rank rows while labeling lock points as estimates", () => {
    const live = ufcLiveStandingsForMembers(event, members, { b1: "red-1", b2: "red-2" }, myLock);
    expect(live.active).toBe(2);
    expect(live.finalCount).toBe(2);
    expect(live.remainingCount).toBe(1);
    expect(live.resolved).toBe(2);
    expect(live.current).toMatchObject({
      correct: 1, incorrect: 1, settled: 2, estimatedPoints: 6,
      lockWins: 1, lockLosses: 0, rank: 1, tied: false,
    });
    expect(live.standings.get("shane")).toMatchObject({
      correct: 1, incorrect: 1, estimatedPoints: 4, rank: 2,
    });
    expect(live.standings.has("inactive")).toBe(false);
  });

  it("never exposes a completed fight while manual-open leaves its picks unlocked", () => {
    const stillOpen: PickEvent = {
      ...event,
      status: "upcoming",
      bouts: event.bouts.map((bout) => ({ ...bout, isLocked: false })),
    };
    const live = ufcLiveStandingsForMembers(stillOpen, members, { b1: "red-1", b2: "red-2" }, myLock);
    expect(live.resolved).toBe(0);
    expect(live.finalCount).toBe(0);
    expect(live.remainingCount).toBe(3);
    expect(live.current?.estimatedPoints).toBe(0);
  });

  it("preserves ties instead of inventing different ranks for equal scores", () => {
    const tied = ufcLiveStandingsForMembers({
      ...event,
      bouts: [event.bouts[1]],
    }, members, { b2: "blue-2" }, myLock);
    expect(tied.current?.rank).toBe(1);
    expect(tied.current?.tied).toBe(true);
    expect(tied.standings.get("shane")?.rank).toBe(1);
  });
});
