import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useIdentity } from "../identity/IdentityProvider";
import { usePicks } from "./PicksProvider";
import FootballPicksPage from "./FootballPicksPage";

vi.mock("../identity/IdentityProvider", () => ({ useIdentity: vi.fn() }));
vi.mock("./PicksProvider", () => ({ usePicks: vi.fn() }));
vi.mock("./GroupPickProgress", () => ({ GroupPickProgress: () => <div>Who has picked</div> }));
vi.mock("./GroupPickReveal", () => ({ GroupPickReveal: () => null }));

const setPick = vi.fn(async () => undefined);
const setFootballLock = vi.fn(async () => undefined);
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
    error: "", groupProgressError: "", event, selections: {}, footballLocks: {}, groupProgress: [], underdogLock: null,
    summary: {}, history: { season: null, summary: {}, events: [] }, refresh: vi.fn(), setPick, setFootballLock,
    setUnderdogLock: vi.fn(), clearUnderdogLock: vi.fn(), ...overrides,
  };
}

describe("FootballPicksPage", () => {
  beforeEach(() => {
    setPick.mockClear();
    setFootballLock.mockClear();
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

  it("gives the Picks owner a direct manage-event path for this published Football slate", () => {
    vi.mocked(usePicks).mockReturnValue(runtime({ event: { ...event, canControl: true } }) as never);
    render(<MemoryRouter><FootballPicksPage /></MemoryRouter>);

    expect(screen.getByRole("link", { name: /MANAGE EVENT/ })).toHaveAttribute(
      "href",
      "/picks/control?sport=football&event=football-week-1#header",
    );
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

  it("lets a selected team use the canonical slate Lock allowance", () => {
    const twoGameEvent = {
      ...event,
      bouts: [
        event.bouts[0],
        { ...event.bouts[0], boutId: "dallas-philadelphia", position: 2, redFighterSlug: "dallas", redFighterName: "Dallas Cowboys", blueFighterSlug: "philadelphia", blueFighterName: "Philadelphia Eagles", homeTeamSlug: "dallas", awayTeamSlug: "philadelphia" },
      ],
    };
    vi.mocked(usePicks).mockReturnValue(runtime({ event: twoGameEvent, selections: { "texas-ohio-state": "texas" } }) as never);
    render(<FootballPicksPage />);
    expect(screen.getByText(/LOCKS 0 \/ 1/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Make Lock Texas Longhorns" }));
    expect(setFootballLock).toHaveBeenCalledWith("texas-ohio-state", true);
  });

  it("excludes cancelled games from the same Lock allowance used by the backend", () => {
    const oneEligibleGameEvent = {
      ...event,
      bouts: [
        event.bouts[0],
        { ...event.bouts[0], boutId: "cancelled-game", position: 2, resultStatus: "cancelled" as const },
      ],
    };
    vi.mocked(usePicks).mockReturnValue(runtime({ event: oneEligibleGameEvent, selections: { "texas-ohio-state": "texas" } }) as never);
    render(<FootballPicksPage />);
    expect(screen.queryByText(/LOCKS 0 \/ 1/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Make Lock Texas Longhorns" })).not.toBeInTheDocument();
  });
});
