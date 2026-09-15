import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChallengeProfile } from "../challenges/challengeModel";
import type { PickEvent } from "../picks/picksModel";
import { TodayChallengeRepositoryError } from "../play/todayChallengeRepository";
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
  const emptyHistory = {
    season: 2026,
    summary: {
      correct: 0,
      incorrect: 0,
      missing: 0,
      excluded: 0,
      basePoints: 0,
      lockBonus: 0,
      totalPoints: 0,
      eventsEntered: 0,
    },
    seasonStandings: [],
    events: [],
  };

  return {
    emptySummary,
    emptyHistory,
    identity: {
      profile: null as ChallengeProfile | null,
      openDialog: vi.fn(),
    },
    picks: {
      event: null as PickEvent | null,
      selections: {} as Record<string, string>,
      loading: false,
      summary: { ...emptySummary },
      history: { ...emptyHistory },
      error: "",
      footballEvent: null as PickEvent | null,
      footballSelections: {} as Record<string, string>,
      footballSummary: { ...emptySummary },
      footballHistory: { ...emptyHistory },
      footballSummaryError: "",
      footballHomeError: "",
    },
    runtime: vi.fn(),
    overview: vi.fn(),
    hqStreak: vi.fn(),
  };
});

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => mocks.identity,
}));

vi.mock("../picks/PicksProvider", () => ({
  usePicks: () => mocks.picks,
}));

vi.mock("../play/useTodayChallengeRuntime", () => ({
  useTodayChallengeRuntime: (...args: unknown[]) => mocks.runtime(...args),
}));

vi.mock("../play/useTodayChallengeOverview", () => ({
  useTodayChallengeOverview: (...args: unknown[]) => mocks.overview(...args),
  useHqDailyChallengeStreak: (...args: unknown[]) => mocks.hqStreak(...args),
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

function yourHqSection() {
  const section = document.querySelector<HTMLElement>('[data-home-section="your-hq"]');
  if (!section) throw new Error("Your HQ Home section was not rendered.");
  return section;
}

describe("Home Your HQ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.identity.profile = null;
    mocks.picks.event = pickEvent;
    mocks.picks.selections = {};
    mocks.picks.loading = false;
    mocks.picks.summary = { ...mocks.emptySummary };
    mocks.picks.history = { ...mocks.emptyHistory };
    mocks.picks.error = "";
    mocks.picks.footballEvent = null;
    mocks.picks.footballSelections = {};
    mocks.picks.footballSummary = { ...mocks.emptySummary };
    mocks.picks.footballHistory = { ...mocks.emptyHistory };
    mocks.picks.footballSummaryError = "";
    mocks.picks.footballHomeError = "";
    mocks.runtime.mockReturnValue({
      projection: null,
      loading: false,
      error: null,
      busy: false,
      configured: false,
      advance: vi.fn(),
      refresh: vi.fn(),
    });
    mocks.overview.mockReturnValue({
      configured: false,
      standings: null,
      streak: { currentStreak: 0, bestStreak: 0 },
      leaderboard: null,
      standingsLoading: false,
      leaderboardLoading: false,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    mocks.hqStreak.mockReturnValue({
      streak: { currentStreak: 0, bestStreak: 0 },
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
  });

  it("keeps Your HQ to the three approved stats with no CTA", () => {
    renderHome();

    const hq = yourHqSection();
    expect(within(hq).getAllByRole("article")).toHaveLength(3);
    expect(within(hq).getByText("HQ Daily streak")).toBeInTheDocument();
    expect(within(hq).getByText("UFC Picks")).toBeInTheDocument();
    expect(within(hq).getByText("Football Picks")).toBeInTheDocument();
    expect(within(hq).queryByRole("button")).not.toBeInTheDocument();
    expect(within(hq).queryByRole("link")).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Open UFC Today’s Challenge/i })).toHaveAttribute("href", "/play");
    expect(screen.getByRole("link", { name: /Open Football Today’s Challenge/i })).toHaveAttribute("href", "/football/today");
    expect(screen.queryByRole("region", { name: "What’s New" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Today’s Challenges" })).not.toBeInTheDocument();
  });

  it("keeps UFC and Football Daily Challenge status independent inside each sport HQ", () => {
    mocks.identity.profile = cody;
    mocks.runtime.mockImplementation((options: { sport?: string }) => options.sport === "football"
      ? {
          projection: {
            gameType: "wavelength",
            progressRevision: 4,
            officialAttempt: {
              nativeScore: 91,
              normalizedScore: 91,
              completedAt: "2026-09-01T12:00:00.000Z",
              publicResult: {},
            },
          },
          loading: false,
          error: null,
          busy: false,
          configured: true,
          advance: vi.fn(),
          refresh: vi.fn(),
        }
      : {
          projection: {
            gameType: "blind_resume",
            progressRevision: 2,
            officialAttempt: null,
          },
          loading: false,
          error: null,
          busy: false,
          configured: true,
          advance: vi.fn(),
          refresh: vi.fn(),
        });
    mocks.overview.mockImplementation((options: { sport?: string }) => options.sport === "football"
      ? {
          configured: true,
          standings: null,
          streak: { currentStreak: 5, bestStreak: 7 },
          leaderboard: {
            unlocked: true,
            playerCount: 6,
            entries: [{ rank: 2, isCurrentUser: true }],
          },
          loading: false,
          error: null,
          refresh: vi.fn(),
        }
      : {
          configured: true,
          standings: null,
          streak: { currentStreak: 2, bestStreak: 4 },
          leaderboard: null,
          loading: false,
          error: null,
          refresh: vi.fn(),
        });

    renderHome();

    const ufcCard = screen.getByRole("link", { name: /Open UFC Today’s Challenge/i });
    const footballCard = screen.getByRole("link", { name: /Open Football Today’s Challenge/i });
    expect(ufcCard).toHaveAttribute("href", "/play/blind-resume?mode=daily");
    expect(within(ufcCard).getByRole("heading", { name: "Blind Resume" })).toBeInTheDocument();
    expect(within(ufcCard).getAllByText("IN PROGRESS").length).toBeGreaterThan(0);
    expect(footballCard).toHaveAttribute("href", "/football/today");
    expect(within(footballCard).getByRole("heading", { name: "Wavelength" })).toBeInTheDocument();
    expect(within(footballCard).getByText("COMPLETED")).toBeInTheDocument();
    expect(within(footballCard).getByText((_, element) => element?.tagName === "STRONG" && element.textContent === "91/100")).toBeInTheDocument();
    expect(within(footballCard).getByText("#2 today")).toBeInTheDocument();
  });

  it("keeps the canonical Football Daily game active on Home while Weekly Auction bids are required", () => {
    mocks.identity.profile = cody;
    mocks.runtime.mockImplementation((options: { sport?: string }) => options.sport === "football"
      ? {
          projection: null,
          loading: false,
          error: new TodayChallengeRepositoryError(
            "WEEKLY_AUCTION_REQUIRED",
            "Submit today’s Weekly Auction bids before starting Football Daily.",
            {
              central_day: "2026-09-15",
              schedule_version: "football-daily-v1",
              game_type: "find_leader",
            },
          ),
          busy: false,
          configured: true,
          advance: vi.fn(),
          refresh: vi.fn(),
        }
      : {
          projection: null,
          loading: false,
          error: null,
          busy: false,
          configured: true,
          advance: vi.fn(),
          refresh: vi.fn(),
        });

    renderHome();

    const footballCard = screen.getByRole("link", { name: /Open Football Today’s Challenge/i });
    expect(footballCard).toHaveAttribute("href", "/football/today");
    expect(within(footballCard).getByRole("heading", { name: "Find the Leader" })).toBeInTheDocument();
    expect(within(footballCard).getByText("READY")).toBeInTheDocument();
    expect(within(footballCard).getByText("PLAY NOW")).toBeInTheDocument();
    expect(within(footballCard).getByText("Ready when you are.")).toBeInTheDocument();
    expect(within(footballCard).queryByText(/UNAVAILABLE/i)).not.toBeInTheDocument();
    expect(within(footballCard).queryByText(/Weekly Auction/i)).not.toBeInTheDocument();
  });

  it("uses the cross-sport HQ streak while preserving independent Picks records", () => {
    mocks.identity.profile = cody;
    mocks.picks.selections = { "ankalaev-guskov": "magomed-ankalaev" };
    mocks.picks.summary = {
      correct: 12,
      incorrect: 8,
      pending: 1,
      eventsEntered: 4,
      basePoints: 48,
      lockBonus: 0,
      totalPoints: 48,
    };
    mocks.picks.footballSummary = {
      correct: 9,
      incorrect: 3,
      pending: 2,
      eventsEntered: 3,
      basePoints: 36,
      lockBonus: 4,
      totalPoints: 40,
    };
    mocks.picks.history = {
      ...mocks.emptyHistory,
      seasonStandings: [
        {
          rank: 1,
          profileId: cody.id,
          displayName: cody.displayName,
          isCurrentUser: true,
          correct: 12,
          incorrect: 8,
          missing: 0,
          excluded: 0,
          basePoints: 48,
          lockBonus: 0,
          totalPoints: 48,
          eventsEntered: 4,
        },
        {
          rank: 2,
          profileId: "22222222-2222-4222-8222-222222222222",
          displayName: "SHANE",
          isCurrentUser: false,
          correct: 10,
          incorrect: 10,
          missing: 0,
          excluded: 0,
          basePoints: 40,
          lockBonus: 0,
          totalPoints: 40,
          eventsEntered: 4,
        },
      ],
    };
    mocks.picks.footballHistory = {
      ...mocks.emptyHistory,
      seasonStandings: [
        {
          rank: 1,
          profileId: "22222222-2222-4222-8222-222222222222",
          displayName: "SHANE",
          isCurrentUser: false,
          correct: 10,
          incorrect: 2,
          missing: 0,
          excluded: 0,
          basePoints: 42,
          lockBonus: 2,
          totalPoints: 44,
          eventsEntered: 3,
        },
        {
          rank: 2,
          profileId: cody.id,
          displayName: cody.displayName,
          isCurrentUser: true,
          correct: 9,
          incorrect: 3,
          missing: 0,
          excluded: 0,
          basePoints: 36,
          lockBonus: 4,
          totalPoints: 40,
          eventsEntered: 3,
        },
      ],
    };
    mocks.overview.mockImplementation((options: { sport?: string }) => {
      const football = options.sport === "football";
      return {
        configured: true,
        standings: {
          playerCount: 2,
          currentUserRank: football ? 2 : 1,
          currentUserWins: football ? 9 : 12,
          currentWeekStart: "2026-09-15",
          currentWeekEnd: "2026-09-21",
          entries: [
            {
              rank: 1,
              profileId: cody.id,
              displayName: cody.displayName,
              initials: "CK",
              avatarPhotoData: null,
              wins: football ? 9 : 12,
              played: 12,
              averageScore: football ? 82 : 86,
              currentStreak: football ? 5 : 2,
              bestStreak: football ? 7 : 4,
              gameAverages: {
                findLeader: 84,
                wavelength: 82,
                blindResume: 86,
                blindRank5: null,
                keep4Cut4: null,
                hitTheNumber: 80,
                whoAmI: 88,
              },
              isCurrentUser: true,
              weeklyRank: 1,
              weeklyWins: 2,
              weeklyPlayed: 3,
              weeklyAverageScore: 88,
              weeklyTitles: football ? 2 : 1,
            },
            {
              rank: 2,
              profileId: "22222222-2222-4222-8222-222222222222",
              displayName: "SHANE",
              initials: "SH",
              avatarPhotoData: null,
              wins: 8,
              played: 12,
              averageScore: 80,
              currentStreak: 1,
              bestStreak: 3,
              gameAverages: {
                findLeader: 78,
                wavelength: 80,
                blindResume: 82,
                blindRank5: null,
                keep4Cut4: null,
                hitTheNumber: 77,
                whoAmI: 84,
              },
              isCurrentUser: false,
              weeklyRank: 2,
              weeklyWins: 1,
              weeklyPlayed: 3,
              weeklyAverageScore: 80,
              weeklyTitles: football ? 1 : 3,
            },
          ],
        },
        streak: football
          ? { currentStreak: 5, bestStreak: 7 }
          : { currentStreak: 2, bestStreak: 4 },
        leaderboard: null,
        standingsLoading: false,
        leaderboardLoading: false,
        loading: false,
        error: null,
        refresh: vi.fn(),
      };
    });
    mocks.hqStreak.mockReturnValue({
      streak: { currentStreak: 7, bestStreak: 11 },
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    renderHome();

    expect(within(screen.getByText("HQ Daily streak").closest("article")!).getByText("7")).toBeInTheDocument();

    const football = screen.getByText("Football Picks").closest("article")!;
    expect(within(football).getByText("9-3")).toBeInTheDocument();
    expect(within(football).getByText("#2 OF 2 · PICKS STANDING")).toBeInTheDocument();
    expect(within(football).getByText("#1 · WEEKLY GAMES")).toBeInTheDocument();

    const ufc = screen.getByText("UFC Picks").closest("article")!;
    expect(within(ufc).getByText("12-8")).toBeInTheDocument();
    expect(within(ufc).getByText("#1 OF 2 · PICKS STANDING")).toBeInTheDocument();
    expect(within(ufc).getByText("#2 · WEEKLY GAMES")).toBeInTheDocument();

    expect(within(yourHqSection()).queryByRole("link")).not.toBeInTheDocument();
  });
});
