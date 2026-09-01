import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChallengeProfile, PlayChallenge } from "../challenges/challengeModel";
import type { PickEvent } from "../picks/picksModel";
import HomePage from "./HomePage";

const emptySummary = {
  correct: 0,
  incorrect: 0,
  pending: 0,
  eventsEntered: 0,
  basePoints: 0,
  lockBonus: 0,
  totalPoints: 0,
};

const mocks = vi.hoisted(() => ({
  identity: {
    profile: null as ChallengeProfile | null,
    openDialog: vi.fn(),
  },
  picks: {
    configured: true,
    event: null as PickEvent | null,
    selections: {} as Record<string, string>,
    loading: false,
    summary: {
      correct: 0,
      incorrect: 0,
      pending: 0,
      eventsEntered: 0,
      basePoints: 0,
      lockBonus: 0,
      totalPoints: 0,
    },
    footballSummary: null as typeof emptySummary | null,
    footballSummaryLoading: false,
    footballSummaryError: "",
    loadFootballSummary: vi.fn(async () => undefined),
    error: "",
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
}));

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
    expiresAt: "2099-08-23T12:00:00.000Z",
    hiddenFor: [],
    ...overrides,
  };
}

function projection({
  gameType,
  progressRevision = 0,
  score,
  sport,
}: {
  gameType: "blind_resume" | "wavelength";
  progressRevision?: number;
  score?: number;
  sport?: "football";
}) {
  return {
    available: true as const,
    sport,
    id: "33333333-3333-4333-8333-333333333333",
    centralDay: "2026-09-01",
    scheduleVersion: "v1",
    gameType,
    setupKey: "setup",
    contentVersion: "content",
    scoringVersion: "score",
    fallbackReason: null,
    publicSetup: {},
    progressRevision,
    publicState: {},
    revealSetup: null,
    officialAttempt: typeof score === "number"
      ? {
          nativeScore: score,
          normalizedScore: score,
          completedAt: "2026-09-01T12:00:00.000Z",
          publicResult: {},
        }
      : null,
    deploymentSha: "test-sha",
    ...(sport === "football" ? { actionHistory: [] } : {}),
  };
}

function runtimeState(value: ReturnType<typeof projection> | null, overrides: Record<string, unknown> = {}) {
  return {
    projection: value,
    loading: false,
    error: null,
    busy: false,
    configured: true,
    advance: vi.fn(),
    refresh: vi.fn(),
    ...overrides,
  };
}

function renderHome() {
  return render(<MemoryRouter><HomePage /></MemoryRouter>);
}

describe("The HQ PR 9 Home composition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.identity.profile = null;
    mocks.picks.configured = true;
    mocks.picks.event = pickEvent;
    mocks.picks.selections = {};
    mocks.picks.loading = false;
    mocks.picks.summary = { ...emptySummary };
    mocks.picks.footballSummary = null;
    mocks.picks.footballSummaryLoading = false;
    mocks.picks.footballSummaryError = "";
    mocks.picks.error = "";
    mocks.challenges.challenges = [];
    mocks.challenges.profiles = [];
    mocks.challenges.loading = false;
    mocks.challenges.error = null;
    mocks.whatsNew.activeItems = [];
    mocks.runtime.mockImplementation(() => runtimeState(null, { configured: false }));
    mocks.overview.mockReturnValue({
      configured: false,
      history: [],
      streak: { currentStreak: 0, bestStreak: 0 },
      leaderboard: null,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
  });

  it("keeps signed-out Today’s Challenges and Your HQ understandable without fake zero records", () => {
    renderHome();

    expect(screen.getByRole("button", { name: "SIGN IN TO YOUR HQ" })).toBeInTheDocument();
    expect(screen.getByText(/sync your daily streak and both Picks records across devices/i)).toBeInTheDocument();

    const yourHq = screen.getByRole("region", { name: "Your HQ" });
    expect(within(yourHq).getByText("Daily streak")).toBeInTheDocument();
    expect(within(yourHq).getByText("UFC Picks record")).toBeInTheDocument();
    expect(within(yourHq).getByText("Football Picks record")).toBeInTheDocument();
    expect(within(yourHq).queryByText("0-0")).not.toBeInTheDocument();
    expect(within(yourHq).queryByText("Favorite fighter")).not.toBeInTheDocument();
    expect(within(yourHq).queryByText("Open challenges")).not.toBeInTheDocument();

    expect(screen.getByTestId("today-challenge-ufc")).toHaveTextContent("UFC");
    expect(screen.getByTestId("today-challenge-football")).toHaveTextContent("FOOTBALL");
    expect(mocks.picks.loadFootballSummary).not.toHaveBeenCalled();
  });

  it("renders independent canonical UFC and Football daily state/routes plus the three canonical Your HQ values", async () => {
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
      correct: 7,
      incorrect: 3,
      pending: 0,
      eventsEntered: 2,
      basePoints: 22,
      lockBonus: 2,
      totalPoints: 24,
    };
    mocks.challenges.challenges = [challenge()];
    mocks.challenges.profiles = [cody, shane];
    mocks.runtime.mockImplementation((options: { sport?: string }) => (
      options.sport === "football"
        ? runtimeState(projection({ gameType: "wavelength", score: 82, sport: "football" }))
        : runtimeState(projection({ gameType: "blind_resume", progressRevision: 2 }))
    ));
    mocks.overview.mockReturnValue({
      configured: true,
      history: [],
      streak: { currentStreak: 2, bestStreak: 4 },
      leaderboard: null,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    renderHome();

    const ufcCard = screen.getByTestId("today-challenge-ufc");
    expect(within(ufcCard).getByRole("heading", { name: "Blind Resume" })).toBeInTheDocument();
    expect(ufcCard).toHaveTextContent("IN PROGRESS");
    expect(within(ufcCard).getByRole("link", { name: "CONTINUE →" })).toHaveAttribute(
      "href",
      "/play/blind-resume?mode=daily",
    );

    const footballCard = screen.getByTestId("today-challenge-football");
    expect(within(footballCard).getByRole("heading", { name: "Wavelength" })).toBeInTheDocument();
    expect(footballCard).toHaveTextContent("COMPLETED");
    expect(footballCard).toHaveTextContent("82/100");
    expect(within(footballCard).getByRole("link", { name: "VIEW RESULT →" })).toHaveAttribute(
      "href",
      "/football/today",
    );

    expect(mocks.runtime).toHaveBeenCalledWith(expect.objectContaining({
      profileId: cody.id,
      enabled: true,
    }));
    expect(mocks.runtime).toHaveBeenCalledWith(expect.objectContaining({
      profileId: cody.id,
      enabled: true,
      sport: "football",
    }));

    await waitFor(() => {
      expect(mocks.picks.loadFootballSummary).toHaveBeenCalledTimes(1);
      expect(within(screen.getByText("Daily streak").closest("article")!).getByText("2")).toBeInTheDocument();
    });
    expect(within(screen.getByText("UFC Picks record").closest("article")!).getByText("12-8")).toBeInTheDocument();
    expect(within(screen.getByText("Football Picks record").closest("article")!).getByText("7-3")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "FINISH UFC PICKS" })).toHaveAttribute("href", "/picks");
  });

  it("uses unavailable presentation instead of placeholder zeroes when canonical Your HQ data is not ready", () => {
    mocks.identity.profile = cody;
    mocks.picks.configured = false;
    mocks.picks.error = "UFC summary unavailable";
    mocks.picks.footballSummary = null;
    mocks.picks.footballSummaryError = "Football summary unavailable";
    mocks.runtime.mockImplementation((options: { sport?: string }) => (
      options.sport === "football"
        ? runtimeState(null, { error: new Error("Football daily unavailable") })
        : runtimeState(null, { error: new Error("UFC daily unavailable") })
    ));
    mocks.overview.mockReturnValue({
      configured: false,
      history: [],
      streak: { currentStreak: 0, bestStreak: 0 },
      leaderboard: null,
      loading: false,
      error: new Error("Streak unavailable"),
      refresh: vi.fn(),
    });

    renderHome();

    for (const label of ["Daily streak", "UFC Picks record", "Football Picks record"]) {
      const card = screen.getByText(label).closest("article")!;
      expect(within(card).getByText("—")).toBeInTheDocument();
      expect(card).not.toHaveTextContent("0-0");
    }
  });
});
