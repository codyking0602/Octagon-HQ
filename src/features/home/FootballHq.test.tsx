import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PickEvent, PickHistory, PickSummary } from "../picks/picksModel";
import { FootballHq } from "./FootballHq";

vi.mock("../picks/picksEventAssets", () => ({
  pickEventPosters: () => [
    { src: "https://example.com/lsu-clemson.webp", aspectRatio: "16 / 9" },
    { src: "https://example.com/louisville-ole-miss.webp", aspectRatio: "16 / 9" },
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
      boutId: "stale-first-college-game",
      position: 1,
      weightClass: "COLLEGE ATS",
      redFighterSlug: "stanford",
      redFighterName: "Stanford Cardinal",
      blueFighterSlug: "miami",
      blueFighterName: "Miami Hurricanes",
      redAmericanOdds: null,
      blueAmericanOdds: null,
      winnerFighterSlug: null,
      includedInPicks: true,
      locksAt: "2026-09-04T20:00:00-05:00",
    },
    {
      boutId: "lsu-clemson",
      position: 2,
      weightClass: "COLLEGE ATS",
      redFighterSlug: "lsu",
      redFighterName: "LSU Tigers",
      blueFighterSlug: "clemson",
      blueFighterName: "Clemson Tigers",
      redAmericanOdds: null,
      blueAmericanOdds: null,
      winnerFighterSlug: null,
      includedInPicks: true,
      locksAt: "2026-09-05T19:30:00-05:00",
    },
    {
      boutId: "louisville-ole-miss",
      position: 3,
      weightClass: "COLLEGE ATS",
      redFighterSlug: "ole-miss",
      redFighterName: "Ole Miss Rebels",
      blueFighterSlug: "louisville",
      blueFighterName: "Louisville Cardinals",
      redAmericanOdds: null,
      blueAmericanOdds: null,
      winnerFighterSlug: null,
      includedInPicks: true,
      locksAt: "2026-09-05T14:30:00-05:00",
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

describe("Football HQ Home summary", () => {
  it("uses authored Matchup HQ games for featured card copy and deep links instead of the first league game", () => {
    render(
      <MemoryRouter>
        <FootballHq
          event={event}
          selections={{ "stale-first-college-game": "miami" }}
          history={history}
          summary={summary}
          loading={false}
          error=""
          signedIn
        />
      </MemoryRouter>,
    );

    const hq = screen.getByRole("region", { name: "Football HQ" });
    expect(within(hq).getByRole("heading", { name: "This week" })).toBeInTheDocument();
    expect(hq).toHaveClass("home-sport-hq");
    expect(within(hq).getByText("2 PICKS LEFT")).toBeInTheDocument();
    expect(within(hq).getByText("#2")).toBeInTheDocument();

    const lsuClemson = within(hq).getByText("LSU vs. Clemson").closest("a");
    const louisvilleOleMiss = within(hq).getByText("Louisville vs. Ole Miss").closest("a");
    expect(lsuClemson).toHaveAttribute("href", "/football/picks?matchup=2026-lsu-clemson");
    expect(louisvilleOleMiss).toHaveAttribute("href", "/football/picks?matchup=2026-louisville-ole-miss");
    expect(within(hq).getByText("Sat, Sep 5, 7:30 PM CT")).toBeInTheDocument();
    expect(within(hq).getByText("Sat, Sep 5, 2:30 PM CT")).toBeInTheDocument();
    expect(within(hq).queryByText(/Miami Hurricanes/)).not.toBeInTheDocument();
    expect(within(hq).queryByText(/Stanford Cardinal/)).not.toBeInTheDocument();
    expect(within(hq).queryByText("Weekly feature")).not.toBeInTheDocument();
    expect(within(hq).getAllByText("COLLEGE GAME OF THE WEEK")).toHaveLength(2);
    expect(within(hq).queryByText("NFL GAME OF THE WEEK")).not.toBeInTheDocument();
    expect(within(hq).getByRole("link", { name: "OPEN PICKS →" })).toHaveAttribute("href", "/football/picks");
    expect(within(hq).getAllByRole("link")).toHaveLength(3);
  });

  it("shows a real unpublished state without inventing featured matchup cards", () => {
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
    expect(screen.queryByLabelText("Football Games of the Week")).not.toBeInTheDocument();
    expect(screen.queryByText("Weekly feature")).not.toBeInTheDocument();
  });
});
