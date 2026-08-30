import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useIdentity } from "../identity/IdentityProvider";
import { usePicks } from "./PicksProvider";
import FootballPicksPage from "./FootballPicksPage";

vi.mock("../identity/IdentityProvider", () => ({ useIdentity: vi.fn() }));
vi.mock("./PicksProvider", () => ({ usePicks: vi.fn() }));
vi.mock("./GroupPickProgress", () => ({ GroupPickProgress: () => <div>Who has picked</div> }));
vi.mock("./GroupPickReveal", () => ({ GroupPickReveal: () => null }));

const setPick = vi.fn(async () => undefined);
const event = {
  eventId: "football-week-1", sport: "football" as const, league: "mixed", eventKind: "slate" as const,
  name: "Football Week 1", subtitle: "Opening weekend", venue: "Multiple venues", location: "Nationwide",
  startsAt: "2099-09-03T16:00:00Z", locksAt: "2099-09-03T16:00:00Z", season: 2099, status: "upcoming" as const,
  bouts: [{
    boutId: "texas-ohio-state", locksAt: "2099-09-03T16:00:00Z", isLocked: false, position: 1,
    weightClass: "CFB ATS", redFighterSlug: "texas", redFighterName: "Texas Longhorns",
    blueFighterSlug: "ohio-state", blueFighterName: "Ohio State Buckeyes", homeTeamSlug: "texas",
    awayTeamSlug: "ohio-state", frozenSpreadHome: -3.5, spreadSource: "the-odds-api", spreadFrozenAt: "2099-09-01T12:00:00Z",
    redAmericanOdds: null, blueAmericanOdds: null, winnerFighterSlug: null, resultStatus: "pending" as const,
  }],
};

function runtime(overrides: Record<string, unknown> = {}) {
  return {
    configured: true, loading: false, groupProgressLoading: false, savingBoutId: null, savingLock: false,
    error: "", groupProgressError: "", event, selections: {}, groupProgress: [], underdogLock: null,
    summary: {}, history: { season: null, summary: {}, events: [] }, refresh: vi.fn(), setPick,
    setUnderdogLock: vi.fn(), clearUnderdogLock: vi.fn(), ...overrides,
  };
}

describe("FootballPicksPage", () => {
  beforeEach(() => {
    setPick.mockClear();
    vi.mocked(useIdentity).mockReturnValue({ profile: { id: "me" }, openDialog: vi.fn() } as never);
    vi.mocked(usePicks).mockReturnValue(runtime() as never);
  });

  it("renders canonical shared Pick bouts as chronological ATS game choices", () => {
    render(<FootballPicksPage />);
    expect(screen.getByRole("heading", { name: "Football Week 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ohio State Buckeyes/ })).toHaveTextContent("+3.5");
    expect(screen.getByRole("button", { name: /Texas Longhorns/ })).toHaveTextContent("-3.5");
    expect(screen.getByText("Who has picked")).toBeInTheDocument();
  });

  it("saves team selections through the shared Picks setPick path", () => {
    render(<FootballPicksPage />);
    fireEvent.click(screen.getByRole("button", { name: /Texas Longhorns/ }));
    expect(setPick).toHaveBeenCalledWith("texas-ohio-state", "texas");
  });

  it("shows the selected ATS team and prevents changes after kickoff lock", () => {
    const lockedEvent = { ...event, bouts: [{ ...event.bouts[0], isLocked: true }] };
    vi.mocked(usePicks).mockReturnValue(runtime({ event: lockedEvent, selections: { "texas-ohio-state": "texas" } }) as never);
    render(<FootballPicksPage />);
    const selected = screen.getByRole("button", { name: /Texas Longhorns/ });
    expect(selected).toHaveAttribute("aria-pressed", "true");
    expect(selected).toBeDisabled();
    fireEvent.click(selected);
    expect(setPick).not.toHaveBeenCalled();
  });
});
