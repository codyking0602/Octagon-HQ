import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GroupPickProgress } from "./GroupPickProgress";
import { usePicks } from "./PicksProvider";

vi.mock("./PicksProvider", () => ({ usePicks: vi.fn() }));

const event = {
  eventId: "football-week-2",
  sport: "football" as const,
  league: "mixed",
  eventKind: "slate" as const,
  name: "Football Week 2",
  subtitle: "NFL + CFB",
  venue: "Multiple venues",
  location: "Nationwide",
  startsAt: "2026-09-12T16:00:00Z",
  locksAt: "2026-09-12T16:00:00Z",
  season: 2026,
  status: "upcoming" as const,
  bouts: [{
    boutId: "texas-ohio-state",
    locksAt: "2026-09-12T16:00:00Z",
    isLocked: true,
    position: 1,
    weightClass: "COLLEGE-FOOTBALL ATS",
    redFighterSlug: "texas",
    redFighterName: "Texas Longhorns",
    blueFighterSlug: "ohio-state",
    blueFighterName: "Ohio State Buckeyes",
    frozenSpreadHome: -3.5,
    homeFinalScore: 27,
    awayFinalScore: 20,
    redAmericanOdds: null,
    blueAmericanOdds: null,
    winnerFighterSlug: "texas",
    resultStatus: "red_win" as const,
    groupPicks: [
      { displayName: "Cody", pickedFighterSlug: "texas", isCurrentUser: true, isLock: true },
      { displayName: "Shane", pickedFighterSlug: "ohio-state", isCurrentUser: false, isLock: true },
    ],
  }, {
    boutId: "denver-kansas-city",
    locksAt: "2026-09-13T20:00:00Z",
    isLocked: true,
    position: 2,
    weightClass: "NFL ATS",
    redFighterSlug: "kansas-city",
    redFighterName: "Kansas City Chiefs",
    blueFighterSlug: "denver",
    blueFighterName: "Denver Broncos",
    frozenSpreadHome: -2.5,
    homeFinalScore: 20,
    awayFinalScore: 24,
    redAmericanOdds: null,
    blueAmericanOdds: null,
    winnerFighterSlug: "denver",
    resultStatus: "blue_win" as const,
    groupPicks: [
      { displayName: "Cody", pickedFighterSlug: "kansas-city", isCurrentUser: true, isLock: false },
      { displayName: "Shane", pickedFighterSlug: "denver", isCurrentUser: false, isLock: false },
    ],
  }],
};

describe("GroupPickProgress football live standings", () => {
  beforeEach(() => {
    vi.mocked(usePicks).mockReturnValue({
      groupProgressLoading: false,
      groupProgressError: "",
      groupProgress: [
        {
          profileId: "cody",
          displayName: "Cody",
          completed: 2,
          total: 2,
          hasUnderdogLock: false,
          underdogLockBoutId: null,
          underdogLockFighterSlug: null,
          isCurrentUser: true,
        },
        {
          profileId: "shane",
          displayName: "Shane",
          completed: 2,
          total: 2,
          hasUnderdogLock: false,
          underdogLockBoutId: null,
          underdogLockFighterSlug: null,
          isCurrentUser: false,
        },
        {
          profileId: "brock",
          displayName: "Brock",
          completed: 0,
          total: 2,
          hasUnderdogLock: false,
          underdogLockBoutId: null,
          underdogLockFighterSlug: null,
          isCurrentUser: false,
        },
      ],
    } as never);
  });

  it("shows live weekly record, place, and Lock results while omitting zero-pick members", () => {
    render(
      <GroupPickProgress
        event={event as never}
        locked={false}
        mySelections={{
          "texas-ohio-state": "texas",
          "denver-kansas-city": "kansas-city",
        }}
        seasonSummary="1ST OF 5 · 11.5 PTS"
        seasonContent={<div>Season standings and weeks</div>}
      />,
    );

    expect(screen.getByText("YOUR GROUP")).toBeInTheDocument();
    expect(screen.getByText("THIS WEEK 1ST · 1-1")).toBeInTheDocument();
    expect(screen.getByText("SEASON 1ST OF 5 · 11.5 PTS")).toBeInTheDocument();
    expect(screen.getByText("Season standings and weeks")).toBeInTheDocument();

    const codyRow = screen.getByText("Cody · YOU").closest("button");
    const shaneRow = screen.getByText("Shane").closest("button");
    expect(codyRow).not.toBeNull();
    expect(shaneRow).not.toBeNull();
    expect(within(codyRow!).getByText("1-1 · 1ST")).toBeInTheDocument();
    expect(within(codyRow!).getByText("LOCKS 1-0")).toBeInTheDocument();
    expect(within(shaneRow!).getByText("1-1 · 2ND")).toBeInTheDocument();
    expect(within(shaneRow!).getByText("LOCKS 0-1")).toBeInTheDocument();
    expect(screen.queryByText("Brock")).not.toBeInTheDocument();

    fireEvent.click(codyRow!);
    expect(screen.getByText("★ LOCK")).toBeInTheDocument();
  });
});
