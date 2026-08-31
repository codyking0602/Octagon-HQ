import { fireEvent, render, screen, within } from "@testing-library/react";
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
    weightClass: "COLLEGE-FOOTBALL ATS", redFighterSlug: "texas", redFighterName: "Texas Longhorns",
    blueFighterSlug: "ohio-state", blueFighterName: "Ohio State Buckeyes", homeTeamSlug: "texas",
    awayTeamSlug: "ohio-state",
    homeTeamLogoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/251.png",
    awayTeamLogoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/194.png",
    frozenSpreadHome: -3.5, spreadSource: "the-odds-api", spreadFrozenAt: "2099-09-01T12:00:00Z",
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

  it("keeps event artwork free of overlay copy and shows the ATS source outside the header", () => {
    const { container } = render(<FootballPicksPage />);
    const hero = screen.getByLabelText("Football Week 1 event artwork");
    const slate = screen.getByLabelText("Football Week 1 football games");

    expect(hero).toHaveTextContent("");
    expect(screen.queryByText("FOOTBALL PICKS · WEEKLY ATS")).not.toBeInTheDocument();
    expect(screen.queryByText("Opening weekend")).not.toBeInTheDocument();
    expect(screen.getByText(/ATS ODDS · THE ODDS API · FROZEN/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pick every game against the spread (ATS)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ohio State Buckeyes AWAY" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Texas Longhorns HOME" })).toBeInTheDocument();
    expect(within(slate).getByText("CFB")).toBeInTheDocument();
    expect(screen.getByText("Texas Longhorns -3.5")).toBeInTheDocument();
    expect(screen.queryByText("HOME -3.5")).not.toBeInTheDocument();
    expect(Array.from(container.querySelectorAll<HTMLImageElement>(".football-pick-team-mark img")).map((image) => image.src)).toEqual([
      "https://a.espncdn.com/i/teamlogos/ncaa/500/194.png",
      "https://a.espncdn.com/i/teamlogos/ncaa/500/251.png",
    ]);
    expect(screen.getByText("Who has picked")).toBeInTheDocument();
  });

  it("names the away team when the stored home spread makes the visitor the favorite", () => {
    const awayFavoriteEvent = { ...event, bouts: [{ ...event.bouts[0], frozenSpreadHome: 2.5 }] };
    vi.mocked(usePicks).mockReturnValue(runtime({ event: awayFavoriteEvent }) as never);
    render(<FootballPicksPage />);

    expect(screen.getByText("Ohio State Buckeyes -2.5")).toBeInTheDocument();
  });

  it("never falls back to team initials when a logo is unavailable", () => {
    const missingLogoEvent = { ...event, bouts: [{ ...event.bouts[0], awayTeamLogoUrl: null }] };
    vi.mocked(usePicks).mockReturnValue(runtime({ event: missingLogoEvent }) as never);
    const { container } = render(<FootballPicksPage />);

    const awayMark = container.querySelector(".football-pick-team-mark");
    expect(awayMark).toHaveClass("is-empty");
    expect(awayMark).toHaveTextContent("");
  });

  it("keeps the scoring rubric collapsed with the canonical Football grading rules", () => {
    render(<FootballPicksPage />);
    const details = screen.getByText("SCORING & GRADING").closest("details");

    expect(details).not.toHaveAttribute("open");
    expect(details).toHaveTextContent("ATS win 1 point");
    expect(details).toHaveTextContent("Lock win 3 points total");
    expect(details).toHaveTextContent("Push 0.5");
    expect(details).toHaveTextContent("lowest-scoring week is dropped");
  });

  it("gives the Picks owner a direct manage-event path below the clean Football header", () => {
    vi.mocked(usePicks).mockReturnValue(runtime({ event: { ...event, canControl: true } }) as never);
    const { container } = render(<MemoryRouter><FootballPicksPage /></MemoryRouter>);
    const hero = container.querySelector(".football-picks-hero");
    const manageLink = screen.getByRole("link", { name: /MANAGE EVENT \/ HEADERS/ });

    expect(hero).not.toContainElement(manageLink);
    expect(manageLink).toHaveAttribute(
      "href",
      "/picks/control?sport=football&event=football-week-1#header",
    );
  });

  it("saves team selections through the shared Picks setPick path", () => {
    render(<FootballPicksPage />);
    fireEvent.click(screen.getByRole("button", { name: "Texas Longhorns HOME" }));
    expect(setPick).toHaveBeenCalledWith("texas-ohio-state", "texas");
  });

  it("shows the selected ATS team and prevents changes after kickoff lock", () => {
    const lockedEvent = { ...event, bouts: [{ ...event.bouts[0], isLocked: true }] };
    vi.mocked(usePicks).mockReturnValue(runtime({ event: lockedEvent, selections: { "texas-ohio-state": "texas" } }) as never);
    render(<FootballPicksPage />);
    const selected = screen.getByRole("button", { name: "Texas Longhorns HOME" });
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