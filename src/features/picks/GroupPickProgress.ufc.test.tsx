import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GroupPickProgress } from "./GroupPickProgress";
import { usePicks } from "./PicksProvider";
import type { PickEvent } from "./picksModel";

vi.mock("./PicksProvider", () => ({ usePicks: vi.fn() }));

const event: PickEvent = {
  eventId: "ufc-live", sport: "mma", name: "UFC Live", subtitle: "Main Card",
  venue: "Test", location: "Dallas", season: 2026,
  status: "locked", startsAt: "2026-11-14T18:00:00Z", locksAt: "2026-11-14T18:00:00Z",
  bouts: [
    {
      boutId: "a", position: 1, weightClass: "Lightweight", isLocked: true,
      redFighterSlug: "red-a", redFighterName: "Red A",
      blueFighterSlug: "blue-a", blueFighterName: "Blue A",
      redAmericanOdds: 100, blueAmericanOdds: -120,
      winnerFighterSlug: "red-a", resultStatus: "red_win",
      groupPicks: [
        { displayName: "CODY", pickedFighterSlug: "red-a", isCurrentUser: true },
        { displayName: "SHANE", pickedFighterSlug: "blue-a", isCurrentUser: false },
      ],
    },
    {
      boutId: "b", position: 2, weightClass: "Welterweight", isLocked: true,
      redFighterSlug: "red-b", redFighterName: "Red B",
      blueFighterSlug: "blue-b", blueFighterName: "Blue B",
      redAmericanOdds: -130, blueAmericanOdds: 110,
      winnerFighterSlug: "blue-b", resultStatus: "blue_win",
      groupPicks: [
        { displayName: "CODY", pickedFighterSlug: "red-b", isCurrentUser: true },
        { displayName: "SHANE", pickedFighterSlug: "blue-b", isCurrentUser: false },
      ],
    },
  ],
};

function mockProgress() {
  vi.mocked(usePicks).mockReturnValue({
    groupProgressLoading: false, groupProgressError: "",
    groupProgress: [
      {
        profileId: "cody", displayName: "CODY", completed: 2, total: 2,
        hasUnderdogLock: true, underdogLockBoutId: "a",
        underdogLockFighterSlug: "red-a", isCurrentUser: true,
      },
      {
        profileId: "shane", displayName: "SHANE", completed: 2, total: 2,
        hasUnderdogLock: false, underdogLockBoutId: null,
        underdogLockFighterSlug: null, isCurrentUser: false,
      },
    ],
    underdogLock: { eventId: "ufc-live", boutId: "a", fighterSlug: "red-a", frozenAmericanOdds: 150 },
  } as never);
}

describe("UFC group rows mirror Football live standings", () => {
  it("shows rank, record and estimated points rather than only completed counts", () => {
    mockProgress();
    render(<GroupPickProgress event={event} locked mySelections={{ a: "red-a", b: "red-b" }} embedded />);

    const cody = screen.getByText("CODY · YOU").closest("button");
    const shane = screen.getByText("SHANE").closest("button");
    expect(cody).not.toBeNull();
    expect(shane).not.toBeNull();
    expect(within(cody!).getByText("1-1 · 1ST")).toBeInTheDocument();
    expect(within(cody!).getByText("6 EST. PTS · LOCK 1-0")).toBeInTheDocument();
    expect(within(shane!).getByText("1-1 · 2ND")).toBeInTheDocument();
    expect(within(shane!).getByText("4 EST. PTS · LOCK —")).toBeInTheDocument();

    fireEvent.click(shane!);
    expect(screen.getByText("SHANE'S PICKS")).toBeInTheDocument();
  });

  it("hides live results and individual picks while owner manual-open is active", () => {
    mockProgress();
    const manualOpen: PickEvent = {
      ...event,
      status: "upcoming",
      bouts: event.bouts.map((bout) => ({ ...bout, isLocked: false })),
    };
    render(<GroupPickProgress event={manualOpen} locked={false} mySelections={{ a: "red-a", b: "red-b" }} />);

    expect(screen.queryByText("1-1 · 1ST")).not.toBeInTheDocument();
    expect(screen.queryByText("6 EST. PTS · LOCK 1-0")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("SHANE").closest("button")!);
    expect(screen.getByText("PICKS HIDDEN")).toBeInTheDocument();
  });
});
