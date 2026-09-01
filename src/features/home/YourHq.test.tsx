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
    footballSummaryError: "",
    error: "",
  },
  challenges: {
    challenges: [] as PlayChallenge[],
    profiles: [] as ChallengeProfile[],
    loading: false,
    error: "",
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

function runtimeState(overrides: Record<string, unknown> = {}) {
  return {
    projection: null,
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

describe("PR 9 Today’s Challenges + Your HQ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.identity.profile = null;
    mocks.picks.event = pickEvent;
    mocks.picks.selections = {};
    mocks.picks.loading = false;
    mocks.picks.summary = { ...emptySummary };
    mocks.picks.footballSummary = null;
    mocks.picks.footballSummaryError = "";
    mocks.picks.error = "";
    mocks.challenges.challenges = [];
    mocks.challenges.profiles = [];
    mocks.challenges.loading = false;
    mocks.challenges.error = "";
    mocks.whatsNew.activeItems = [];
    mocks.whatsNew.status = "ready";
    mocks.runtime.mockImplementation(() => runtimeState());
    mocks.overview.mockReturnValue({
      configured: true,
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

  it("keeps signed-out Home clean while representing both independent daily products", () => {
    renderHome();

    expect(screen.getByRole("button", { name: "SIGN IN TO YOUR HQ" })).toBeInTheDocument();
    expect(screen.getByText(/sync your daily streak and UFC \+ Football Picks records/i)).toBeInTheDocument();
    expect(screen.queryByText("0", { exact: true })).not.toBeInTheDocument();
    expect(screen.queryByText("0-0")).not.toBeInTheDocument();

    const ufcCard = screen.getByRole("heading", { name: "UFC Today’s Challenge" }).closest("article")!;
    const footballCard = screen.getByRole("heading", { name: "Football Today’s Challenge" }).closest("article")!;
    expect(ufcCard).toHaveAttribute("data-challenge-sport", "ufc");
    expect(footballCard).toHaveAttribute("data-challenge-sport", "football");
    expect(within(ufcCard).getByRole("link", { name: /OPEN UFC PLAY/ })).toHaveAttribute("href", "/play");
    expect(within(footballCard).getByRole("link", { name: /OPEN FOOTBALL PLAY/ })).toHaveAttribute("href", "/football/today");

    expect(screen.getByText("Daily streak")).toBeInTheDocument();
    expect(screen.getByText("UFC Picks record")).toBeInTheDocument();
    expect(screen.getByText("Football Picks record")).toBeInTheDocument();
    expect(screen.queryByText("Favorite fighter")).not.toBeInTheDocument();
    expect(screen.queryByText("Open challenges")).not.toBeInTheDocument();
  });

  it("renders canonical signed-in values and independent completed/incomplete challenge state without changing Up Next", async () => {
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
      incorrect: 4,
      pending: 2,
      eventsEntered: 3,
      basePoints: 33,
      lockBonus: 2,
      totalPoints: 35,
    };
    mocks.runtime.mockImplementation((options: { sport?: string }) => (
      options.sport === "football"
        ? runtimeState({
            projection: {
              gameType: "wavelength",
              progressRevision: 4,
              officialAttempt: {
                nativeScore: 84,
                normalizedScore: 84,
                completedAt: "2026-09-01T15:00:00.000Z",
                publicResult: {},
              },
            },
          })
        : runtimeState({
            projection: {
              gameType: "blind_resume",
              progressRevision: 0,
              officialAttempt: null,
            },
          })
    ));
    mocks.overview.mockReturnValue({
      configured: true,
      standings: null,
      streak: { currentStreak: 2, bestStreak: 4 },
      leaderboard: null,
      standingsLoading: false,
      leaderboardLoading: false,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    renderHome();

    await waitFor(() => expect(within(screen.getByText("Daily streak").closest("article")!).getByText("2")).toBeInTheDocument());
    expect(within(screen.getByText("UFC Picks record").closest("article")!).getByText("12-8")).toBeInTheDocument();
    expect(within(screen.getByText("Football Picks record").closest("article")!).getByText("9-4")).toBeInTheDocument();

    const ufcCard = screen.getByRole("heading", { name: "UFC Today’s Challenge" }).closest("article")!;
    expect(within(ufcCard).getByText("Blind Resume")).toBeInTheDocument();
    expect(within(ufcCard).getByText("NOT PLAYED")).toBeInTheDocument();
    expect(within(ufcCard).getByRole("link", { name: /PLAY NOW/ })).toHaveAttribute("href", "/play/blind-resume?mode=daily");

    const footballCard = screen.getByRole("heading", { name: "Football Today’s Challenge" }).closest("article")!;
    expect(within(footballCard).getByText("Wavelength")).toBeInTheDocument();
    expect(within(footballCard).getByText("COMPLETED")).toBeInTheDocument();
    expect(within(footballCard).getByText("Score 84/100")).toBeInTheDocument();
    expect(within(footballCard).getByRole("link", { name: /VIEW RESULT/ })).toHaveAttribute("href", "/football/today");

    expect(mocks.runtime).toHaveBeenCalledWith({ profileId: cody.id, enabled: true });
    expect(mocks.runtime).toHaveBeenCalledWith({ profileId: cody.id, enabled: true, sport: "football" });
    expect(screen.getByRole("link", { name: "FINISH UFC PICKS" })).toHaveAttribute("href", "/picks");
  });

  it("renders saved in-progress state and never substitutes zero records while canonical data is loading", () => {
    mocks.identity.profile = cody;
    mocks.picks.loading = true;
    mocks.picks.footballSummary = null;
    mocks.runtime.mockImplementation((options: { sport?: string }) => (
      options.sport === "football"
        ? runtimeState({ projection: { gameType: "hit_the_number", progressRevision: 2, officialAttempt: null } })
        : runtimeState({ loading: true })
    ));
    mocks.overview.mockReturnValue({
      configured: true,
      standings: null,
      streak: { currentStreak: 7, bestStreak: 9 },
      leaderboard: null,
      standingsLoading: true,
      leaderboardLoading: false,
      loading: true,
      error: null,
      refresh: vi.fn(),
    });

    renderHome();

    const footballCard = screen.getByRole("heading", { name: "Football Today’s Challenge" }).closest("article")!;
    expect(within(footballCard).getByText("Hit the Number")).toBeInTheDocument();
    expect(within(footballCard).getByText("IN PROGRESS")).toBeInTheDocument();
    expect(within(footballCard).getByRole("link", { name: /CONTINUE/ })).toHaveAttribute("href", "/football/today");
    expect(screen.queryByText("0-0")).not.toBeInTheDocument();
    expect(screen.getAllByText("…").length).toBeGreaterThanOrEqual(3);
  });
});
