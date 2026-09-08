import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useIdentity } from "../identity/IdentityProvider";
import { usePicks } from "./PicksProvider";
import FootballPicksPage from "./FootballPicksPage";

vi.mock("../identity/IdentityProvider", () => ({ useIdentity: vi.fn() }));
vi.mock("./PicksProvider", () => ({ usePicks: vi.fn() }));
vi.mock("./FootballFuturesCard", () => ({ FootballFuturesCard: () => null }));
vi.mock("./FootballMatchupBreakdowns", () => ({ FootballMatchupBreakdowns: () => null }));
vi.mock("./GroupPickProgress", () => ({ GroupPickProgress: () => null }));
vi.mock("./GroupPickReveal", () => ({ GroupPickReveal: () => null }));

function game(boutId: string, homeScore: number | null, awayScore: number | null, spread: number, resultStatus = "red_win") {
  return {
    boutId,
    locksAt: "2026-09-06T17:00:00Z",
    isLocked: true,
    position: Number(boutId.slice(-1)),
    weightClass: "NFL ATS",
    redFighterSlug: `home-${boutId}`,
    redFighterName: `Home ${boutId}`,
    blueFighterSlug: `away-${boutId}`,
    blueFighterName: `Away ${boutId}`,
    homeTeamSlug: `home-${boutId}`,
    awayTeamSlug: `away-${boutId}`,
    frozenSpreadHome: spread,
    homeFinalScore: homeScore,
    awayFinalScore: awayScore,
    redAmericanOdds: null,
    blueAmericanOdds: null,
    winnerFighterSlug: resultStatus === "pending" ? null : `home-${boutId}`,
    resultStatus,
    includedInPicks: true,
  };
}

describe("Football per-game ATS settlement presentation", () => {
  it("shows covered, missed, and push results while the rest of the week is still pending", () => {
    vi.mocked(useIdentity).mockReturnValue({ profile: { id: "me" }, openDialog: vi.fn() } as never);
    vi.mocked(usePicks).mockReturnValue({
      configured: true,
      loading: false,
      savingBoutId: null,
      error: "",
      event: {
        eventId: "football-week-1",
        sport: "football",
        league: "mixed",
        eventKind: "slate",
        name: "Football Week 1",
        subtitle: "",
        venue: "Multiple venues",
        location: "Nationwide",
        startsAt: "2026-09-05T16:00:00Z",
        locksAt: "2026-09-05T16:00:00Z",
        season: 2026,
        status: "upcoming",
        bouts: [
          game("game-1", 27, 20, -3.5),
          game("game-2", 20, 21, -3.5, "blue_win"),
          game("game-3", 24, 21, -3),
          game("game-4", null, null, -2.5, "pending"),
        ],
      },
      selections: {
        "game-1": "home-game-1",
        "game-2": "home-game-2",
        "game-3": "home-game-3",
        "game-4": "home-game-4",
      },
      footballLocks: {},
      footballFutures: { locked: true },
      history: { season: 2026, summary: {}, seasonStandings: [], events: [] },
      setPick: vi.fn(),
      setFootballLock: vi.fn(),
    } as never);

    render(<FootballPicksPage />);

    expect(screen.getByText("✓ COVERED")).toBeInTheDocument();
    expect(screen.getByText("✕ MISSED")).toBeInTheDocument();
    expect(screen.getByText("PUSH")).toBeInTheDocument();
    expect(screen.getByText("LOCKED")).toBeInTheDocument();
  });
});
