import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useIdentity } from "../identity/IdentityProvider";
import { usePicks } from "./PicksProvider";
import FootballPicksPage from "./FootballPicksPage";

vi.mock("../identity/IdentityProvider", () => ({ useIdentity: vi.fn() }));
vi.mock("./PicksProvider", () => ({ usePicks: vi.fn() }));
vi.mock("./FootballFuturesCard", () => ({ FootballFuturesCard: () => null }));
vi.mock("./FootballMatchupBreakdowns", () => ({ FootballMatchupBreakdowns: () => null }));
vi.mock("./GroupPickProgress", () => ({ GroupPickProgress: () => null }));
vi.mock("./GroupPickReveal", () => ({ GroupPickReveal: () => null }));

const baseGame = {
  boutId: "football-college-football-401752700",
  locksAt: "2099-09-03T16:00:00Z",
  isLocked: true,
  position: 1,
  weightClass: "COLLEGE-FOOTBALL ATS",
  redFighterSlug: "texas",
  redFighterName: "Texas Longhorns",
  blueFighterSlug: "ohio-state",
  blueFighterName: "Ohio State Buckeyes",
  homeTeamSlug: "texas",
  awayTeamSlug: "ohio-state",
  homeTeamLogoUrl: null,
  awayTeamLogoUrl: null,
  frozenSpreadHome: -3.5,
  spreadSource: "the-odds-api",
  spreadFrozenAt: "2099-09-01T12:00:00Z",
  redAmericanOdds: null,
  blueAmericanOdds: null,
  winnerFighterSlug: "texas",
  resultStatus: "red_win" as const,
  homeFinalScore: 24,
  awayFinalScore: 20,
};

const pendingGame = {
  ...baseGame,
  boutId: "football-nfl-401772510",
  position: 2,
  weightClass: "NFL ATS",
  redFighterSlug: "dallas",
  redFighterName: "Dallas Cowboys",
  blueFighterSlug: "philadelphia",
  blueFighterName: "Philadelphia Eagles",
  homeTeamSlug: "dallas",
  awayTeamSlug: "philadelphia",
  frozenSpreadHome: 2.5,
  winnerFighterSlug: null,
  resultStatus: "pending" as const,
  homeFinalScore: null,
  awayFinalScore: null,
  isLocked: true,
};

function picksRuntime(games: typeof baseGame[]) {
  return {
    configured: true,
    loading: false,
    savingBoutId: null,
    error: "",
    event: {
      eventId: "football-week-1",
      sport: "football" as const,
      league: "mixed",
      eventKind: "slate" as const,
      name: "Football Week 1",
      subtitle: "Opening weekend",
      venue: "Multiple venues",
      location: "Nationwide",
      startsAt: "2099-09-03T16:00:00Z",
      locksAt: "2099-09-03T16:00:00Z",
      season: 2099,
      status: "locked" as const,
      bouts: games,
    },
    selections: {
      "football-college-football-401752700": "texas",
      "football-nfl-401772510": "dallas",
    },
    footballLocks: {},
    footballFutures: { locked: true },
    history: { season: null, summary: {}, seasonStandings: [], events: [] },
    setPick: vi.fn(),
    setFootballLock: vi.fn(),
  };
}

describe("Football live ATS results", () => {
  beforeEach(() => {
    vi.mocked(useIdentity).mockReturnValue({ profile: { id: "me" }, openDialog: vi.fn() } as never);
  });

  it("shows a settled pick immediately while later games remain unresolved", () => {
    vi.mocked(usePicks).mockReturnValue(picksRuntime([baseGame, pendingGame] as typeof baseGame[]) as never);
    render(<FootballPicksPage />);

    expect(screen.getByText("✓ COVERED")).toBeInTheDocument();
    expect(screen.getByText(/LIVE ATS/).parentElement).toHaveTextContent("LIVE ATS 1-0 · 1 FINAL");
    expect(screen.getByText("FINAL · Ohio State Buckeyes 20, Texas Longhorns 24")).toBeInTheDocument();
    expect(screen.getByText("LOCKED")).toBeInTheDocument();
  });

  it("shows an exact frozen-line result as a push", () => {
    const pushGame = { ...baseGame, frozenSpreadHome: -4 };
    vi.mocked(usePicks).mockReturnValue(picksRuntime([pushGame] as typeof baseGame[]) as never);
    render(<FootballPicksPage />);

    expect(screen.getByText("PUSH")).toBeInTheDocument();
    expect(screen.getByText(/LIVE ATS/).parentElement).toHaveTextContent("LIVE ATS 0-0 · 1 PUSH · 1 FINAL");
  });
});