import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PickEvent, PickHistory, PickSummary } from "../picks/picksModel";
import { FootballHq } from "./FootballHq";

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
      homeTeamLogoUrl: "https://example.com/stanford.png",
      awayTeamLogoUrl: "https://example.com/miami.png",
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
      homeTeamLogoUrl: "https://example.com/texas.png",
      awayTeamLogoUrl: "https://example.com/ohio-state.png",
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
      homeTeamLogoUrl: "https://example.com/giants.png",
      awayTeamLogoUrl: "https://example.com/cowboys.png",
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
  it("uses UFC-style Picks, one Daily row, Player Spotlight, and one canonical authored Game of the Week", () => {
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
          dailyChallenge={<a href="/football/today">DAILY CHALLENGE</a>}
        />
      </MemoryRouter>,
    );

    const hq = screen.getByRole("region", { name: "Football HQ" });
    expect(within(hq).getByRole("heading", { name: "This week" })).toBeInTheDocument();
    expect(hq).toHaveClass("home-sport-hq");
    expect(within(hq).getByText("FOOTBALL PICKS")).toBeInTheDocument();
    expect(within(hq).getByText("1 OF 3")).toBeInTheDocument();
    expect(within(hq).getByText("2 PICKS LEFT")).toBeInTheDocument();
    expect(within(hq).getByText("#2 OF 2")).toBeInTheDocument();
    expect(within(hq).getByText("DAILY CHALLENGE")).toBeInTheDocument();

    expect(within(hq).getByText("Kamario Taylor")).toBeInTheDocument();
    expect(within(hq).getByText("LAST WEEK · 413 TOT YDS · 5 TD")).toBeInTheDocument();
    expect(within(hq).getByText("VS ULM · W 62–13")).toBeInTheDocument();
    expect(within(hq).getByText("6'4\" · 230 LB")).toBeInTheDocument();
    expect(within(hq).getByRole("link", { name: "WATCH HIGHLIGHT ↗" })).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=QxpXjmhoaTE",
    );
    expect(within(hq).queryByRole("link", { name: /VIEW PLAYER/i })).not.toBeInTheDocument();

    expect(within(hq).getByRole("link", { name: "Open matchup breakdown for Texas vs. Ohio State" }))
      .toHaveAttribute("href", "/football/picks?matchup=2026-texas-ohio-state");
    expect(within(hq).queryByRole("link", { name: "Open matchup breakdown for Cowboys vs. Giants" }))
      .not.toBeInTheDocument();
    expect(within(hq).getByText("Sat, Sep 12, 6:30 PM CT")).toBeInTheDocument();
    expect(within(hq).queryByText("Sun, Sep 13, 7:20 PM CT")).not.toBeInTheDocument();
    expect(within(hq).queryByText(/Miami Hurricanes/)).not.toBeInTheDocument();
    expect(within(hq).queryByText(/Stanford Cardinal/)).not.toBeInTheDocument();
    expect(within(hq).getByText("GAME OF THE WEEK")).toBeInTheDocument();
    expect(within(hq).getByText("COLLEGE GAME OF THE WEEK")).toBeInTheDocument();
    expect(within(hq).queryByText("NFL GAME OF THE WEEK")).not.toBeInTheDocument();
    expect(within(hq).getByText("OPEN MATCHUP BREAKDOWN →")).toBeInTheDocument();
    expect(within(hq).getByRole("link", { name: "OPEN PICKS →" })).toHaveAttribute("href", "/football/picks");
    expect(within(hq).getByRole("link", { name: "VIEW FULL SCHEDULE →" })).toHaveAttribute("href", "/football/picks");
  });

  it("keeps the Picks and Player Spotlight structure when the weekly slate is not published", () => {
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
          dailyChallenge={<a href="/football/today">DAILY CHALLENGE</a>}
        />
      </MemoryRouter>,
    );

    const hq = screen.getByRole("region", { name: "Football HQ" });
    expect(within(hq).getByText("FOOTBALL PICKS")).toBeInTheDocument();
    expect(within(hq).getByText("WAITING")).toBeInTheDocument();
    expect(within(hq).getByText("Kamario Taylor")).toBeInTheDocument();
    expect(within(hq).queryByLabelText("Football Game of the Week")).not.toBeInTheDocument();
  });
});
