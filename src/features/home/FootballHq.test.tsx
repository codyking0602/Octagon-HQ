import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PickEvent, PickHistory, PickSummary } from "../picks/picksModel";
import { FootballHq } from "./FootballHq";

vi.mock("../picks/picksEventAssets", () => ({
  pickEventPosters: () => [
    { src: "https://example.com/texas-ohio-state.webp", aspectRatio: "16 / 9" },
    { src: "https://example.com/cowboys-giants.webp", aspectRatio: "16 / 9" },
  ],
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const event: PickEvent = {
  eventId: "football-picks-2026-09-08",
  sport: "football",
  league: "mixed",
  eventKind: "slate",
  name: "Football Picks · Week of Sep 8",
  subtitle: "College + NFL",
  venue: "Multiple venues",
  location: "Nationwide",
  startsAt: "2026-09-10T00:20:00Z",
  locksAt: "2026-09-10T00:20:00Z",
  season: 2026,
  status: "upcoming",
  headerStoragePath: "football/2026/event-header-gallery-2-1",
  headerNaturalWidth: 1600,
  headerNaturalHeight: 900,
  bouts: [
    {
      boutId: "stale-first-college-game",
      position: 1,
      weightClass: "COLLEGE-FOOTBALL ATS",
      redFighterSlug: "stanford-cardinal",
      redFighterName: "Stanford Cardinal",
      blueFighterSlug: "miami-hurricanes",
      blueFighterName: "Miami Hurricanes",
      homeTeamSlug: "stanford-cardinal",
      awayTeamSlug: "miami-hurricanes",
      redAmericanOdds: null,
      blueAmericanOdds: null,
      winnerFighterSlug: null,
      includedInPicks: true,
      locksAt: "2026-09-12T16:00:00Z",
    },
    {
      boutId: "football-college-football-401856682",
      position: 9,
      weightClass: "COLLEGE-FOOTBALL ATS",
      redFighterSlug: "texas-longhorns",
      redFighterName: "Texas Longhorns",
      blueFighterSlug: "ohio-state-buckeyes",
      blueFighterName: "Ohio State Buckeyes",
      homeTeamSlug: "texas-longhorns",
      awayTeamSlug: "ohio-state-buckeyes",
      redAmericanOdds: null,
      blueAmericanOdds: null,
      winnerFighterSlug: null,
      includedInPicks: true,
      locksAt: "2026-09-12T23:30:00Z",
    },
    {
      boutId: "football-nfl-401872930",
      position: 23,
      weightClass: "NFL ATS",
      redFighterSlug: "new-york-giants",
      redFighterName: "New York Giants",
      blueFighterSlug: "dallas-cowboys",
      blueFighterName: "Dallas Cowboys",
      homeTeamSlug: "new-york-giants",
      awayTeamSlug: "dallas-cowboys",
      redAmericanOdds: null,
      blueAmericanOdds: null,
      winnerFighterSlug: null,
      includedInPicks: true,
      locksAt: "2026-09-14T00:20:00Z",
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
  it("uses this week's authored Matchup HQ games for featured card copy and deep links instead of the first league game", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-08T19:30:00Z"));

    render(
      <MemoryRouter>
        <FootballHq
          event={event}
          selections={{ "stale-first-college-game": "miami-hurricanes" }}
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

    const texasOhioState = within(hq).getByText("Texas vs. Ohio State").closest("a");
    const cowboysGiants = within(hq).getByText("Cowboys vs. Giants").closest("a");
    expect(texasOhioState).toHaveAttribute("href", "/football/picks?matchup=2026-texas-ohio-state");
    expect(cowboysGiants).toHaveAttribute("href", "/football/picks?matchup=2026-cowboys-giants");
    expect(within(hq).getByText("Sat, Sep 12, 6:30 PM CT")).toBeInTheDocument();
    expect(within(hq).getByText("Sun, Sep 13, 7:20 PM CT")).toBeInTheDocument();
    expect(within(hq).queryByText(/Miami Hurricanes/)).not.toBeInTheDocument();
    expect(within(hq).queryByText(/Stanford Cardinal/)).not.toBeInTheDocument();
    expect(within(hq).queryByText("Weekly feature")).not.toBeInTheDocument();
    expect(within(hq).getByText("COLLEGE GAME OF THE WEEK")).toBeInTheDocument();
    expect(within(hq).getByText("NFL GAME OF THE WEEK")).toBeInTheDocument();
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
