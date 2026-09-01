import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChallengeProfile, PlayChallenge } from "../challenges/challengeModel";
import type { PickEvent } from "../picks/picksModel";
import HomePage from "./HomePage";

const mocks = vi.hoisted(() => ({
  identity: {
    profile: null as ChallengeProfile | null,
    openDialog: vi.fn(),
  },
  preferences: {
    favoriteFighterSlug: null as string | null,
    loading: false,
    saving: false,
    configured: true,
    error: null as Error | null,
    setFavoriteFighter: vi.fn(async (_slug: string | null) => undefined),
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
    error: null as Error | null,
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

vi.mock("../profile/ProfilePreferencesProvider", () => ({
  useProfilePreferences: () => mocks.preferences,
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

describe("Your HQ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.identity.profile = null;
    mocks.preferences.favoriteFighterSlug = null;
    mocks.preferences.loading = false;
    mocks.preferences.saving = false;
    mocks.preferences.configured = true;
    mocks.preferences.error = null;
    mocks.picks.event = pickEvent;
    mocks.picks.selections = {};
    mocks.picks.loading = false;
    mocks.picks.summary = {
      correct: 0,
      incorrect: 0,
      pending: 0,
      eventsEntered: 0,
      basePoints: 0,
      lockBonus: 0,
      totalPoints: 0,
    };
    mocks.picks.error = null;
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
      history: [],
      streak: { currentStreak: 0, bestStreak: 0 },
      leaderboard: null,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
  });

  it("shows an understandable sign-in state instead of broken profile zeros", async () => {
    renderHome();

    expect(screen.getByRole("button", { name: "SIGN IN TO YOUR HQ" })).toBeInTheDocument();
    expect(screen.getByText(/carry your official game history/i)).toBeInTheDocument();
    expect(screen.queryByText("0", { exact: true })).not.toBeInTheDocument();
    expect(await screen.findByText("Ankalaev vs. Guskov")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SIGN IN TO MAKE PICKS →" })).toBeInTheDocument();
    expect(screen.getByText("RANKING SPOTLIGHT")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fighters to Watch" })).toBeInTheDocument();
  });

  it("shows generalized daily data, profile data, and the highest-priority next action", async () => {
    mocks.identity.profile = cody;
    mocks.preferences.favoriteFighterSlug = "georges-st-pierre";
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
    mocks.runtime.mockReturnValue({
      projection: {
        gameType: "blind_resume",
        officialAttempt: null,
      },
      loading: false,
      error: null,
      busy: false,
      configured: true,
      advance: vi.fn(),
      refresh: vi.fn(),
    });
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

    await waitFor(() => expect(within(screen.getByText("Daily streak").closest("article")!).getByText("2")).toBeInTheDocument());
    const picksCard = screen.getByText("Current Picks record").closest("article")!;
    expect(within(picksCard).getByText("12-8")).toBeInTheDocument();
    expect(within(picksCard).getByText(/1 PENDING/)).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Open Georges St-Pierre profile" })).toHaveAttribute("href", "/fighters/georges-st-pierre");
    expect(within(screen.getByText("Open challenges").closest("article")!).getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1 pick still open")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "FINISH UFC PICKS" })).toHaveAttribute("href", "/picks");

    fireEvent.change(screen.getByRole("combobox", { name: "Favorite fighter" }), {
      target: { value: "jon-jones" },
    });
    await waitFor(() => expect(mocks.preferences.setFavoriteFighter).toHaveBeenCalledWith("jon-jones"));

    expect(screen.getByText("Magomed Ankalaev vs. Bogdan Guskov")).toBeInTheDocument();
    expect(screen.getByText("1 OF 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "MAKE PICKS →" })).toHaveAttribute("href", "/picks");
  });
});
