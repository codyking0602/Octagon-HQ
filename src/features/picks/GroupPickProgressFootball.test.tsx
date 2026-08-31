import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GroupPickProgress } from "./GroupPickProgress";
import { usePicks } from "./PicksProvider";

vi.mock("./PicksProvider", () => ({ usePicks: vi.fn() }));

const bout = {
  boutId: "football-nfl-1", position: 1, weightClass: "NFL ATS",
  redFighterSlug: "dallas-cowboys", redFighterName: "Dallas Cowboys",
  blueFighterSlug: "new-york-giants", blueFighterName: "New York Giants",
  redAmericanOdds: null, blueAmericanOdds: null, winnerFighterSlug: null,
  resultStatus: "pending" as const, includedInPicks: true, isLocked: false,
  groupPicks: [],
};

const member = {
  profileId: "member-1", displayName: "MEMBER", completed: 1, total: 1,
  hasUnderdogLock: false, underdogLockBoutId: null,
  underdogLockFighterSlug: null, isCurrentUser: false,
};

function runtime() {
  return { groupProgress: [member], groupProgressLoading: false, groupProgressError: "" };
}

describe("GroupPickProgress Football copy", () => {
  it("uses game language for an open Football slate", () => {
    vi.mocked(usePicks).mockReturnValue(runtime() as never);
    const event = { eventId: "football-week-1", sport: "football" as const, status: "upcoming" as const, bouts: [bout] };

    render(<GroupPickProgress event={event as never} locked={false} mySelections={{}} />);
    fireEvent.click(screen.getByRole("button", { name: /MEMBER/ }));

    expect(screen.getByText("Individual picks reveal as each game locks.")).toBeInTheDocument();
  });

  it("preserves fight language for UFC", () => {
    vi.mocked(usePicks).mockReturnValue(runtime() as never);
    const event = { eventId: "ufc-test", sport: "mma" as const, status: "upcoming" as const, bouts: [bout] };

    render(<GroupPickProgress event={event as never} locked={false} mySelections={{}} />);
    fireEvent.click(screen.getByRole("button", { name: /MEMBER/ }));

    expect(screen.getByText("Individual picks reveal as each fight locks.")).toBeInTheDocument();
  });
});
