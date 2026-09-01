import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChallengeProfile, PlayChallenge } from "../challenges/challengeModel";
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
      error: "",
      footballSummaryError: "",
    },
    challenges: {
      challenges: [] as PlayChallenge[],
      profiles: [] as ChallengeProfile[],
      loading: false,
      error: null as Error | null,
    },
    whatsNew: {
      activeItems: [],
      status: "ready" as const,
    },
    runtime: vi.fn(),
    overview: vi.fn(),
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
  useTodayChallengeRuntime: (...args: unknown[]) => mocks.runtime(...args),
}));

vi.mock("../play/useTodayChallengeOverview", () => ({
  useTodayChallengeOverview: (...args: unknown[]) => mocks.overview(...args),
}));

vi.mock("../whats-new/WhatsNewProvider", () => ({
  useWhatsNew: () => mocks.whatsNew,
}));

vi.mock("../whats-new/WhatsNewPreview", () => ({
  WhatsNewPreview: () => <section>WHAT’S NEW</section>,
}));

const cody: ChallengeProfile = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const shane: ChallengeProfile = {
  id: "22222222-2222-4222-8222-222222222222",
  displayName: "SHANE",
  initials: "SH",
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

function challenge(overrides: Partial<PlayChallenge> = {}): PlayChallenge {
  return {
    code: "RECEIVED1",
    gameId: "find-leader",
    gameVersion: "find-leader-v2",
    gameTitle: "Find the Leader",
    summary: "Who has the most UFC wins?",
    creatorId: shane.id,
    recipientId: cody.id,
    playUrl: "https://example.test/play/find-leader?day=2026-07-24",
    setup: { day: "2026-07-24" },
    creatorResult: { score: 8 },
    responderResult: null,
    createdAt: "2026-07-24T12:00:00.000Z",
    openedAt: null,
    completedAt: null,
    declinedAt: null,
    expiresAt: "2026-08-23T12:00:00.000Z",
    hiddenFor: [],
    ...overrides,
  };
}

function renderHome() {
  return render(<MemoryRouter><HomePage /></MemoryRouter>);
}

function yourHqSection() {
  const section = document.querySelector<HTMLElement>('[data-home-section="your-hq"]');
  if (!section) throw new Error("Your HQ Home section was not rendered.");
  return section;
}

describe("Home PR 9 — Today’s Challenges + Your HQ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.identity.profile = null;
    mocks.picks.event = pickEvent;
    mocks.picks.selections = {};
    mocks.picks.loading = false;
    mocks.picks.summary = { ...mocks.emptySummary };
    mocks.picks.footballSummary = { ...mocks.emptySummary };
    mocks.picks.error = "";
    mocks.picks.footballSummaryError = "";
    mocks.challenges.challenges = [];
    mocks.challenges.profiles = [];
    mocks.challenges.loading = false;
    mocks.challenges.error = null;
    mocks.whatsNew.activeItems = [];
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
  });

  it("shows the locked three-stat sign-in snapshot and both permanent daily challenge entry points", () => {
    renderHome();

    const hq = yourHqSection();
    expect(within(hq).getAllByRole("article")).toHaveLength(3);
    expect(within(hq).getByText("Daily streak")).toBeInTheDocument();
    expect(within(hq).getByText("UFC Picks record")).toBeInTheDocument();
    expect(within(hq).getByText("Football Picks record")).toBeInTheDocument();
    expect(within(hq).queryByText("Favorite fighter")).not.toBeInTheDocument();
    expect(within(hq).queryByText("Open challenges")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SIGN IN TO YOUR HQ" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Open UFC Today’s Challenge/i })).toHaveAttribute("href", "/play");
    expect(screen.getByRole("link", { name: /Open Football Today’s Challenge/i })).toHaveAttribute("href", "/football/today");
  });

  it("keeps UFC and Football daily status independent on universal Home", () => {
    mocks.identity.profile = cody;
    mocks.picks.event = null;
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

  it("shows independent UFC and Football Picks records from the app-level Picks owner", async () => {
    mocks.identity.profile = cody;
    mocks.picks.selections = {
      "ankalaev-guskov": "magomed-ankalaev",
    };
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
    mocks.challenges.challenges = [
      challenge(),
      challenge({
        code: "WAITING1",
        creatorId: cody.id,
        recipientId: shane.id,
        createdAt: "2026-07-24T10:00:00.000Z",
      }),
    ];
    mocks.challenges.profiles = [cody, shane];
    mocks.runtime.mockImplementation((options: { sport?: string }) => ({
      projection: options.sport === "football"
        ? { gameType: "wavelength", progressRevision: 0, officialAttempt: null }
        : { gameType: "blind_resume", progressRevision: 0, officialAttempt: null },
      loading: false,
      error: null,
      busy: false,
      configured: true,
      advance: vi.fn(),
      refresh: vi.fn(),
    }));
    mocks.overview.mockImplementation((options: { sport?: string }) => ({
      configured: true,
      standings: null,
      streak: options.sport === "football"
        ? { currentStreak: 5, bestStreak: 7 }
        : { currentStreak: 2, bestStreak: 4 },
      leaderboard: null,
      loading: false,
      error: null,
      refresh: vi.fn(),
    }));

    renderHome();

    const hq = yourHqSection();
    await waitFor(() => expect(within(screen.getByText("Daily streak").closest("article")!).getByText("2")).toBeInTheDocument());
    expect(within(hq).getAllByRole("article")).toHaveLength(3);
    expect(within(screen.getByText("UFC Picks record").closest("article")!).getByText("12-8")).toBeInTheDocument();
    expect(within(screen.getByText("Football Picks record").closest("article")!).getByText("9-3")).toBeInTheDocument();
    expect(within(screen.getByText("Football Picks record").closest("article")!).getByText(/2 PENDING/)).toBeInTheDocument();

    expect(screen.queryByRole("region", { name: "Up Next" })).not.toBeInTheDocument();
    expect(screen.queryByText("Magomed Ankalaev vs. Bogdan Guskov")).not.toBeInTheDocument();
    expect(screen.getByText("1 OF 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "MAKE PICKS →" })).toHaveAttribute("href", "/picks");
  });
});
