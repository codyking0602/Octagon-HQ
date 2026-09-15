import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PickEvent, PickHistory, PickSummary } from "../picks/picksModel";
import { FootballHq, footballHqTeamPresentationFor, footballSpotlightKindAt } from "./FootballHq";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const event: PickEvent = {
  eventId: "football-picks-2026-09-15",
  sport: "football",
  league: "mixed",
  eventKind: "slate",
  name: "Football Picks · Week of Sep 15",
  subtitle: "College + NFL",
  venue: "Multiple venues",
  location: "Nationwide",
  startsAt: "2026-09-18T00:15:00Z",
  locksAt: "2026-09-18T00:15:00Z",
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
      boutId: "football-college-football-401856688",
      position: 9,
      weightClass: "COLLEGE-FOOTBALL ATS",
      redFighterSlug: "ole-miss-rebels",
      redFighterName: "Ole Miss Rebels",
      blueFighterSlug: "lsu-tigers",
      blueFighterName: "LSU Tigers",
      homeTeamSlug: "ole-miss-rebels",
      awayTeamSlug: "lsu-tigers",
      homeTeamLogoUrl: "https://example.com/ole-miss.png",
      awayTeamLogoUrl: "https://example.com/lsu.png",
      redAmericanOdds: null,
      blueAmericanOdds: null,
      winnerFighterSlug: null,
      includedInPicks: true,
      locksAt: "2026-09-19T23:30:00Z",
    },
    {
      boutId: "football-nfl-401872932",
      position: 23,
      weightClass: "NFL ATS",
      redFighterSlug: "buffalo-bills",
      redFighterName: "Buffalo Bills",
      blueFighterSlug: "detroit-lions",
      blueFighterName: "Detroit Lions",
      homeTeamSlug: "buffalo-bills",
      awayTeamSlug: "detroit-lions",
      homeTeamLogoUrl: "https://example.com/bills.png",
      awayTeamLogoUrl: "https://example.com/lions.png",
      redAmericanOdds: null,
      blueAmericanOdds: null,
      winnerFighterSlug: null,
      includedInPicks: true,
      locksAt: "2026-09-18T00:15:00Z",
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

describe("Football HQ team logo presentation", () => {
  it("uses the opposite meaningful team color when available and white only for explicit silhouette exceptions", () => {
    expect(footballHqTeamPresentationFor("LSU")).toEqual({ color: "#FDD023", logoTreatment: "full-color" });
    expect(footballHqTeamPresentationFor("Ole Miss")).toEqual({ color: "#14213D", logoTreatment: "full-color" });
    expect(footballHqTeamPresentationFor("Buffalo Bills")).toEqual({ color: "#C60C30", logoTreatment: "full-color" });
    expect(footballHqTeamPresentationFor("Detroit Lions")).toEqual({ color: "#0076B6", logoTreatment: "full-color" });
    expect(footballHqTeamPresentationFor("Texas")).toEqual({ color: "#BF5700", logoTreatment: "white" });
  });
});

describe("Football HQ Home summary", () => {
  it("uses UFC-style Picks, one Daily row, Player Spotlight, and canonical authored matchup rows", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-15T19:30:00Z"));

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
          weeklyGames={{ rank: 1, weeklyTitles: 2 }}
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
    expect(within(hq).getByText("2026 PICKS STANDING")).toBeInTheDocument();
    expect(within(hq).getByRole("link", { name: "Open Football Picks season standings" }))
      .toHaveAttribute("href", "/football/picks?view=standings#picks-season-standings");
    expect(within(hq).getByText("#1 overall · 2 titles")).toBeInTheDocument();
    expect(within(hq).getByRole("link", { name: "View Football Championship Standings" }))
      .toHaveAttribute("href", "/football?standings=me#championship-standings");
    expect(within(hq).getByText("DAILY CHALLENGE")).toBeInTheDocument();

    expect(within(hq).getByText("Drew Mestemaker")).toBeInTheDocument();
    expect(within(hq).getByText("317")).toBeInTheDocument();
    expect(within(hq).getByText("PYDS")).toBeInTheDocument();
    expect(within(hq).getByText("109")).toBeInTheDocument();
    expect(within(hq).getByText("RYDS")).toBeInTheDocument();
    expect(within(hq).getByText("426")).toBeInTheDocument();
    expect(within(hq).getByText("TOTAL YDS")).toBeInTheDocument();
    expect(within(hq).getByText("3")).toBeInTheDocument();
    expect(within(hq).getByText("TOTAL TDS")).toBeInTheDocument();
    expect(within(hq).queryByText(/LAST WEEK/)).not.toBeInTheDocument();
    expect(within(hq).getByText("VS #6 OREGON · W 39–31 · 6'3\" · 215 LB")).toBeInTheDocument();
    expect(within(hq).getByRole("link", { name: "WATCH HIGHLIGHT ↗" })).toHaveAttribute(
      "href",
      "https://youtu.be/Ia6UXgdSKw4?is=i2gxMRVoqonuhYtB",
    );
    expect(within(hq).queryByRole("link", { name: /VIEW PLAYER/i })).not.toBeInTheDocument();

    expect(within(hq).getByRole("link", { name: "Open matchup breakdown for LSU vs. Ole Miss" }))
      .toHaveAttribute("href", "/football/picks?matchup=2026-lsu-ole-miss");
    expect(within(hq).getByRole("link", { name: "Open matchup breakdown for Bills vs. Lions" }))
      .toHaveAttribute("href", "/football/picks?matchup=2026-bills-lions");
    expect(within(hq).getByText("Sat, Sep 19, 6:30 PM CT")).toBeInTheDocument();
    expect(within(hq).getByText("Thu, Sep 17, 7:15 PM CT")).toBeInTheDocument();
    expect(within(hq).queryByText(/Miami Hurricanes/)).not.toBeInTheDocument();
    expect(within(hq).queryByText(/Stanford Cardinal/)).not.toBeInTheDocument();
    expect(within(hq).getByText("COLLEGE GAME OF THE WEEK")).toBeInTheDocument();
    expect(within(hq).getByText("LSU Tigers")).toBeInTheDocument();
    expect(within(hq).getByText("Ole Miss Rebels")).toBeInTheDocument();
    expect(within(hq).getByText("NFL GAME OF THE WEEK")).toBeInTheDocument();
    expect(within(hq).getByText("Buffalo Bills")).toBeInTheDocument();
    expect(within(hq).getByText("Detroit Lions")).toBeInTheDocument();
    expect(within(hq).queryByText("Vaught-Hemingway Stadium · Oxford")).not.toBeInTheDocument();
    expect(within(hq).queryByText("Highmark Stadium · Orchard Park")).not.toBeInTheDocument();
    expect(within(hq).getByRole("link", { name: "OPEN PICKS →" })).toHaveAttribute("href", "/football/picks");
    expect(within(hq).getByRole("link", { name: "VIEW FULL SCHEDULE →" })).toHaveAttribute("href", "/football/picks");
  });


  it("shows tied first correctly and opens owner photo management only after a hold", () => {
    vi.useFakeTimers();
    const onManagePlayerPhoto = vi.fn();
    const tiedHistory: PickHistory = {
      ...history,
      seasonStandings: [
        { ...history.seasonStandings![0]!, rank: 1, isCurrentUser: false },
        { ...history.seasonStandings![1]!, rank: 1, totalPoints: 12, isCurrentUser: true },
      ],
    };

    render(
      <MemoryRouter>
        <FootballHq
          event={event}
          selections={{}}
          history={tiedHistory}
          summary={summary}
          loading={false}
          error=""
          signedIn
          dailyChallenge={<a href="/football/today">DAILY CHALLENGE</a>}
          playerPhotoSources={{ cfb: "https://example.com/drew.webp" }}
          canManagePlayerPhoto
          onManagePlayerPhoto={onManagePlayerPhoto}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("T-1 OF 2")).toBeInTheDocument();
    expect(screen.queryByText("#T-1 OF 2")).not.toBeInTheDocument();

    const photo = screen.getByRole("button", { name: "Manage player spotlight photo" });
    fireEvent.pointerDown(photo);
    vi.advanceTimersByTime(649);
    expect(onManagePlayerPhoto).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onManagePlayerPhoto).toHaveBeenCalledTimes(1);
  });

  it("keeps the Picks and Player Spotlight structure when the weekly slate is not published", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-15T19:30:00Z"));

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
    expect(within(hq).getByText("Drew Mestemaker")).toBeInTheDocument();
    expect(within(hq).queryByLabelText("Football Games of the Week")).not.toBeInTheDocument();
  });

  it("uses the locked Central Time spotlight schedule", () => {
    expect(footballSpotlightKindAt(new Date("2026-09-12T23:00:00Z"))).toBe("cfb");
    expect(footballSpotlightKindAt(new Date("2026-09-13T14:00:00Z"))).toBe("nfl");
    expect(footballSpotlightKindAt(new Date("2026-09-14T14:00:00Z"))).toBe("nfl");
    expect(footballSpotlightKindAt(new Date("2026-09-15T19:59:00Z"))).toBe("cfb");
    expect(footballSpotlightKindAt(new Date("2026-09-15T20:00:00Z"))).toBe("nfl");
  });

  it("switches the live card from Drew to Josh Allen after the 3 PM CT weekday handoff", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-15T19:59:45Z"));

    render(
      <MemoryRouter>
        <FootballHq
          event={event}
          selections={{}}
          history={history}
          summary={summary}
          loading={false}
          error=""
          signedIn
          dailyChallenge={<a href="/football/today">DAILY CHALLENGE</a>}
          playerPhotoSources={{
            cfb: "https://example.com/drew.webp",
            nfl: "https://example.com/josh.webp",
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Drew Mestemaker")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(screen.getByText("Josh Allen")).toBeInTheDocument();
    expect(screen.getByText("334")).toBeInTheDocument();
    expect(screen.getByText("PASS TD")).toBeInTheDocument();
    expect(screen.getByText("RUSH TD")).toBeInTheDocument();
    expect(screen.getByText("130.5")).toBeInTheDocument();
    expect(screen.getByText("AT HOUSTON · W 36–31 · 6'5\" · 237 LB")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "WATCH HIGHLIGHT ↗" })).toHaveAttribute(
      "href",
      "https://youtu.be/ZeJwLzd2I4E?is=a_f7gk7JKUEYJPZs",
    );
  });

  it("keeps the populated sport live when the scheduled sport photo has not been uploaded yet", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-15T21:00:00Z"));

    render(
      <MemoryRouter>
        <FootballHq
          event={event}
          selections={{}}
          history={history}
          summary={summary}
          loading={false}
          error=""
          signedIn
          dailyChallenge={<a href="/football/today">DAILY CHALLENGE</a>}
          playerPhotoSources={{ cfb: "https://example.com/drew.webp" }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Drew Mestemaker")).toBeInTheDocument();
    expect(screen.getByAltText("Drew Mestemaker")).toHaveAttribute("src", "https://example.com/drew.webp");
    expect(screen.queryByText("Josh Allen")).not.toBeInTheDocument();
  });
});
