import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PickEvent, PickHistory, PickSummary } from "../picks/picksModel";
import { FootballHq } from "./FootballHq";

vi.mock("../picks/picksEventAssets", () => ({
  pickEventPosters: () => [
    { src: "https://example.com/cfb.webp", aspectRatio: "16 / 9" },
    { src: "https://example.com/nfl.webp", aspectRatio: "16 / 9" },
  ],
}));

afterEach(cleanup);

const event: PickEvent = {
  eventId: "football-2026-week-1",
  sport: "football",
  league: "football",
  eventKind: "slate",
  name: "Football Week 1",
  subtitle: "College + NFL",
  venue: "",
  location: "",
  startsAt: "2026-09-05T11:00:00-05:00",
  locksAt: "2026-09-05T11:00:00-05:00",
  season: 2026,
  status: "upcoming",
  headerStoragePath: "football/2026/event-header-gallery-2-1",
  headerNaturalWidth: 1600,
  headerNaturalHeight: 900,
  bouts: [
    {
      boutId: "cfb-game",
      position: 1,
      weightClass: "COLLEGE ATS",
      redFighterSlug: "lsu",
      redFighterName: "LSU",
      blueFighterSlug: "clemson",
      blueFighterName: "Clemson",
      redAmericanOdds: null,
      blueAmericanOdds: null,
      winnerFighterSlug: null,
      includedInPicks: true,
      locksAt: "2026-09-05T11:00:00-05:00",
    },
    {
      boutId: "nfl-game",
      position: 2,
      weightClass: "NFL ATS",
      redFighterSlug: "giants",
      redFighterName: "Giants",
      blueFighterSlug: "cowboys",
      blueFighterName: "Cowboys",
      redAmericanOdds: null,
      blueAmericanOdds: null,
      winnerFighterSlug: null,
      includedInPicks: true,
      locksAt: "2026-09-06T19:20:00-05:00",
    },
    {
      boutId: "nfl-game-2",
      position: 3,
      weightClass: "NFL ATS",
      redFighterSlug: "eagles",
      redFighterName: "Eagles",
      blueFighterSlug: "commanders",
      blueFighterName: "Commanders",
      redAmericanOdds: null,
      blueAmericanOdds: null,
      winnerFighterSlug: null,
      includedInPicks: true,
      locksAt: "2026-09-07T12:00:00-05:00",
    },
  ],
};

const history: PickHistory = {
  season: 2026,
  summary: {
    correct: 8,
    incorrect: 4,
    missing: 0,
    excluded: 0,
    basePoints: 8,
    lockBonus: 2,
    totalPoints: 10,
    eventsEntered: 1,
  },
  seasonStandings: [
    {
      rank: 1,
      profileId: "other",
      displayName: "OTHER",
      isCurrentUser: false,
      correct: 10,
      incorrect: 2,
      missing: 0,
      excluded: 0,
      basePoints: 10,
      lockBonus: 2,
      totalPoints: 12,
      eventsEntered: 1,
    },
    {
      rank: 2,
      profileId: "me",
      displayName: "ME",
      isCurrentUser: true,
      correct: 8,
      incorrect: 4,
      missing: 0,
      excluded: 0,
      basePoints: 8,
      lockBonus: 2,
      totalPoints: 10,
      eventsEntered: 1,
    },
  ],
  events: [],
};

const summary: PickSummary = {
  correct: 8,
  incorrect: 4,
  pending: 0,
  eventsEntered: 1,
  basePoints: 8,
  lockBonus: 2,
  totalPoints: 10,
};

describe("PR 11 Football HQ", () => {
  it("uses the canonical weekly slate for Picks status, standing, and both featured matchups", () => {
    render(
      <MemoryRouter>
        <FootballHq
          event={event}
          selections={{ "cfb-game": "clemson" }}
          history={history}
          summary={summary}
          loading={false}
          error=""
          signedIn
        />
      </MemoryRouter>,
    );

    const hq = screen.getByRole("region", { name: "Football HQ" });
    expect(within(hq).getByRole("heading", { name: "Saturday to Sunday" })).toBeInTheDocument();
    expect(within(hq).getByText("2 PICKS LEFT")).toBeInTheDocument();
    expect(within(hq).getByText("#2")).toBeInTheDocument();
    expect(within(hq).getByText(/Clemson/)).toBeInTheDocument();
    expect(within(hq).getByText(/Cowboys/)).toBeInTheDocument();
    expect(within(hq).getByText("COLLEGE GAME OF THE WEEK")).toBeInTheDocument();
    expect(within(hq).getByText("NFL GAME OF THE WEEK")).toBeInTheDocument();
    expect(within(hq).getAllByRole("link")).toHaveLength(3);
    for (const link of within(hq).getAllByRole("link")) expect(link).toHaveAttribute("href", "/football/picks");
  });

  it("shows a real unpublished state instead of inventing a weekly slate", () => {
    render(
      <MemoryRouter>
        <FootballHq
          event={null}
          selections={{}}
          history={{ ...history, seasonStandings: [], events: [] }}
          summary={{ ...summary, correct: 0, incorrect: 0, totalPoints: 0 }}
          loading={false}
          error=""
          signedIn={false}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Next slate not published" })).toBeInTheDocument();
    expect(screen.getAllByText("Weekly feature")).toHaveLength(2);
  });
});
