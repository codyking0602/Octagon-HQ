import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChallengeProfile } from "../challenges/challengeModel";
import type { PickEvent } from "../picks/picksModel";
import HomePage from "./HomePage";

const mocks = vi.hoisted(() => {
  const emptySummary = {
    correct: 0,
    incorrect: 0,
    pending: 0,
    eventsEntered: 0,
    basePoints: 0,
    lockBonus: 0,
    totalPoints: 0,
  };

  return {
    emptySummary,
    identity: {
      profile: null as ChallengeProfile | null,
      openDialog: vi.fn(),
    },
    picks: {
      event: null as PickEvent | null,
      selections: {} as Record<string, string>,
      loading: false,
      summary: { ...emptySummary },
      footballSummary: { ...emptySummary },
      history: {
        season: 2026,
        summary: { ...emptySummary },
        seasonStandings: [] as Array<{
          rank: number;
          profileId: string;
          displayName: string;
          isCurrentUser: boolean;
          eventsEntered: number;
          correct: number;
          incorrect: number;
          pending: number;
          basePoints: number;
          lockBonus: number;
          totalPoints: number;
        }>,
        events: [],
      },
      error: "",
      footballSummaryError: "",
    },
    challenges: {
      challenges: [],
      profiles: [],
      loading: false,
      error: null,
    },
    whatsNew: {
      activeItems: [],
      status: "ready" as const,
    },
  };
});

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => mocks.identity,
}));

vi.mock("../picks/PicksProvider", () => ({
  usePicks: () => mocks.picks,
}));

vi.mock("../challenges/ChallengeProvider", () => ({
  usePlayChallenges: () => mocks.challenges,
}));

vi.mock("../play/useTodayChallengeRuntime", () => ({
  useTodayChallengeRuntime: () => ({
    projection: null,
    loading: false,
    error: null,
    busy: false,
    configured: false,
    advance: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("../play/useTodayChallengeOverview", () => ({
  useTodayChallengeOverview: () => ({
    configured: false,
    standings: null,
    streak: { currentStreak: 0, bestStreak: 0 },
    leaderboard: null,
    standingsLoading: false,
    leaderboardLoading: false,
    loading: false,
    error: null,
    refresh: vi.fn(),
  }),
}));

vi.mock("../whats-new/WhatsNewProvider", () => ({
  useWhatsNew: () => mocks.whatsNew,
}));

vi.mock("../whats-new/WhatsNewPreview", () => ({
  WhatsNewPreview: () => <section>WHAT’S NEW</section>,
}));

vi.mock("./RankingSpotlightCard", () => ({
  RankingSpotlightCard: () => <article>RANKING SPOTLIGHT</article>,
}));

vi.mock("./ShanesWatchlistCard", () => ({
  ShanesWatchlistCard: () => <a href="/fighters-to-watch">SHANE’S CONTENDER SERIES</a>,
}));

const cody: ChallengeProfile = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const pickEvent: PickEvent = {
  eventId: "ufc-test-event",
  name: "UFC Fight Night",
  subtitle: "Ankalaev vs. Guskov",
  venue: "Etihad Arena",
  location: "Abu Dhabi, United Arab Emirates",
  startsAt: "2099-07-25T16:00:00.000Z",
  locksAt: "2099-07-25T16:00:00.000Z",
  season: 2026,
  status: "upcoming",
  bouts: [
    {
      boutId: "ankalaev-guskov",
      position: 1,
      weightClass: "Light Heavyweight",
      redFighterSlug: "magomed-ankalaev",
      redFighterName: "Magomed Ankalaev",
      blueFighterSlug: "bogdan-guskov",
      blueFighterName: "Bogdan Guskov",
      redAmericanOdds: -180,
      blueAmericanOdds: 155,
      winnerFighterSlug: null,
    },
    {
      boutId: "erceg-temirov",
      position: 2,
      weightClass: "Flyweight",
      redFighterSlug: "steve-erceg",
      redFighterName: "Steve Erceg",
      blueFighterSlug: "ramazan-temirov",
      blueFighterName: "Ramazan Temirov",
      redAmericanOdds: -120,
      blueAmericanOdds: 100,
      winnerFighterSlug: null,
    },
  ],
};

function renderHome() {
  return render(<MemoryRouter><HomePage /></MemoryRouter>);
}

function ufcHq() {
  return screen.getByRole("region", { name: "UFC HQ" });
}

describe("Home PR 10 — UFC HQ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.identity.profile = cody;
    mocks.picks.event = pickEvent;
    mocks.picks.selections = {};
    mocks.picks.loading = false;
    mocks.picks.summary = { ...mocks.emptySummary };
    mocks.picks.footballSummary = { ...mocks.emptySummary };
    mocks.picks.history = {
      season: 2026,
      summary: { ...mocks.emptySummary },
      seasonStandings: [],
      events: [],
    };
    mocks.picks.error = "";
    mocks.picks.footballSummaryError = "";
  });

  it("uses the canonical UFC event and Picks history for fight-week status and inline season standing", () => {
    mocks.picks.selections = { "ankalaev-guskov": "magomed-ankalaev" };
    mocks.picks.history.seasonStandings = [
      {
        rank: 1,
        profileId: "22222222-2222-4222-8222-222222222222",
        displayName: "SHANE",
        isCurrentUser: false,
        eventsEntered: 5,
        correct: 18,
        incorrect: 6,
        pending: 0,
        basePoints: 70,
        lockBonus: 4,
        totalPoints: 74,
      },
      {
        rank: 2,
        profileId: cody.id,
        displayName: cody.displayName,
        isCurrentUser: true,
        eventsEntered: 5,
        correct: 17,
        incorrect: 7,
        pending: 1,
        basePoints: 66,
        lockBonus: 3,
        totalPoints: 69,
      },
      {
        rank: 3,
        profileId: "33333333-3333-4333-8333-333333333333",
        displayName: "JACK",
        isCurrentUser: false,
        eventsEntered: 5,
        correct: 15,
        incorrect: 9,
        pending: 0,
        basePoints: 60,
        lockBonus: 2,
        totalPoints: 62,
      },
    ];

    renderHome();

    const section = ufcHq();
    expect(within(section).getByRole("heading", { name: "Fight week command center" })).toBeInTheDocument();
    expect(within(section).getByRole("heading", { name: "UFC Fight Night" })).toBeInTheDocument();
    expect(within(section).getByText("Ankalaev vs. Guskov")).toBeInTheDocument();
    expect(within(section).getByText("Etihad Arena · Abu Dhabi, United Arab Emirates")).toBeInTheDocument();
    expect(within(section).getByText("Magomed Ankalaev vs. Bogdan Guskov")).toBeInTheDocument();
    expect(within(section).getByText("1 OF 2")).toBeInTheDocument();
    expect(within(section).getByText("1 PICK LEFT")).toBeInTheDocument();
    expect(within(section).getByText("#2 OF 3")).toBeInTheDocument();
    expect(within(section).getByText("69 PTS")).toBeInTheDocument();
    expect(within(section).getByRole("link", { name: "MAKE PICKS →" })).toHaveAttribute("href", "/picks");
    expect(within(section).getByText("RANKING SPOTLIGHT")).toBeInTheDocument();
    expect(within(section).getByRole("link", { name: "SHANE’S CONTENDER SERIES" })).toHaveAttribute("href", "/fighters-to-watch");
  });

  it("keeps persistent UFC features and a real empty/error event state without inventing a replacement card", () => {
    mocks.picks.event = null;
    mocks.picks.error = "event service unavailable";

    renderHome();

    const section = ufcHq();
    expect(within(section).getByRole("heading", { name: "Next card unavailable" })).toBeInTheDocument();
    expect(within(section).getByText("UFC event data is unavailable right now.")).toBeInTheDocument();
    expect(within(section).getByRole("link", { name: "OPEN UFC PICKS →" })).toHaveAttribute("href", "/picks");
    expect(within(section).getByText("RANKING SPOTLIGHT")).toBeInTheDocument();
    expect(within(section).getByRole("link", { name: "SHANE’S CONTENDER SERIES" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Football HQ" })).toBeEmptyDOMElement();
  });
});
