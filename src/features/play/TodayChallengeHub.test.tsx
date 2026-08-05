import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TodayChallengeHub from "./TodayChallengeHub";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

const navigate = vi.fn();
const openDialog = vi.fn();
const useTodayChallengeRuntime = vi.fn();
const useTodayChallengeOverview = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigate };
});

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({
    status: "ready",
    profile: { id: "profile-one" },
    openDialog,
  }),
}));

vi.mock("./useTodayChallengeRuntime", () => ({
  useTodayChallengeRuntime: (...args: unknown[]) => useTodayChallengeRuntime(...args),
}));

vi.mock("./useTodayChallengeOverview", () => ({
  useTodayChallengeOverview: (...args: unknown[]) => useTodayChallengeOverview(...args),
}));

function projection(gameType: TodayChallengeProjection["gameType"]): TodayChallengeProjection {
  return {
    available: true,
    id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-08-05",
    scheduleVersion: "find-leader-v1",
    gameType,
    setupKey: `${gameType}:test`,
    contentVersion: `${gameType}-v1`,
    scoringVersion: "play-official-score-v1",
    fallbackReason: null,
    publicSetup: {},
    progressRevision: 2,
    publicState: gameType === "keep_4_cut_4"
      ? { kept: [{ id: "one" }], cut: [{ id: "two" }] }
      : gameType === "blind_rank_5"
        ? { slots: [{ id: "one" }, null, null, null, null] }
        : gameType === "blind_resume"
          ? { results: [{ correct: true }] }
          : gameType === "wavelength"
            ? { guesses: [50, 60] }
            : { eliminated_ids: ["one", "two"] },
    revealSetup: null,
    officialAttempt: null,
    deploymentSha: "test-sha",
  };
}

const standings = {
  playerCount: 2,
  currentUserRank: 1,
  currentUserWins: 8,
  entries: [
    {
      rank: 1,
      profileId: "11111111-1111-4111-8111-111111111111",
      displayName: "Cody",
      initials: "CK",
      avatarPhotoData: "data:image/webp;base64,cody",
      wins: 8,
      played: 13,
      averageScore: 84.6,
      currentStreak: 6,
      bestStreak: 13,
      gameAverages: {
        findLeader: 84.1,
        wavelength: 78.4,
        blindResume: 90.6,
        blindRank5: 82,
        keep4Cut4: 87.5,
      },
      isCurrentUser: true,
    },
    {
      rank: 2,
      profileId: "22222222-2222-4222-8222-222222222222",
      displayName: "Shane",
      initials: "SH",
      avatarPhotoData: null,
      wins: 6,
      played: 12,
      averageScore: 82.3,
      currentStreak: 4,
      bestStreak: 9,
      gameAverages: {
        findLeader: 80,
        wavelength: 76,
        blindResume: 88,
        blindRank5: 81,
        keep4Cut4: null,
      },
      isCurrentUser: false,
    },
  ],
};

const overviewDefaults = {
  configured: true,
  standings,
  streak: { currentStreak: 6, bestStreak: 13 },
  leaderboard: { unlocked: false, playerCount: 0, entries: [] },
  standingsLoading: false,
  leaderboardLoading: false,
  loading: false,
  error: null,
  refresh: vi.fn(),
};

describe("generalized Today’s Challenge hub", () => {
  beforeEach(() => {
    navigate.mockReset();
    openDialog.mockReset();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
    useTodayChallengeOverview.mockReturnValue(overviewDefaults);
  });

  it.each([
    ["find_leader", "Find the Leader", "/play/find-leader"],
    ["blind_resume", "Blind Resume", "/play/blind-resume?mode=daily"],
    ["wavelength", "Wavelength", "/play/wavelength?mode=daily"],
    ["blind_rank_5", "Blind Rank 5", "/play/blind-rank?mode=daily"],
    ["keep_4_cut_4", "Keep 4, Cut 4", "/play/keep-cut?mode=daily"],
  ] as const)("renders and opens the canonical %s official route", (gameType, title, route) => {
    useTodayChallengeRuntime.mockReturnValue({
      projection: projection(gameType),
      loading: false,
      error: null,
      busy: false,
      configured: true,
      advance: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TodayChallengeHub />);
    expect(screen.getAllByRole("heading", { name: title })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(title, "i") }));
    expect(navigate).toHaveBeenCalledWith(route);
  });

  it("keeps cumulative standings collapsed, then reveals one-row member stats and game averages", () => {
    useTodayChallengeRuntime.mockReturnValue({
      projection: projection("blind_resume"),
      loading: false,
      error: null,
      busy: false,
      configured: true,
      advance: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TodayChallengeHub />);

    const summary = screen.getByText("Daily Challenge Standings").closest("summary");
    expect(summary).toHaveTextContent("YOUR RANK #1 · 8 WINS");
    expect(summary?.parentElement).not.toHaveAttribute("open");

    fireEvent.click(summary!);
    const header = document.querySelector(".daily-standings__header");
    expect(header).toHaveTextContent("CurrentStreak");
    expect(header).toHaveTextContent("LongestStreak");
    expect(screen.getByText("Cody").parentElement?.querySelector("img")).toHaveAttribute(
      "src",
      "data:image/webp;base64,cody",
    );

    const codyRow = screen.getByText("Cody").closest("button");
    expect(codyRow).not.toBeNull();
    expect(codyRow).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(codyRow!);
    expect(codyRow).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Average Score by Game")).toBeInTheDocument();
    const findLeaderAverage = screen
      .getAllByText("Find the Leader")
      .find((element) => element.tagName === "SMALL");
    expect(findLeaderAverage?.parentElement).toHaveTextContent("84.1");
    const blindResumeAverage = screen
      .getAllByText("Blind Resume")
      .find((element) => element.tagName === "SMALL");
    expect(blindResumeAverage?.parentElement).toHaveTextContent("90.6");
  });

  it("keeps today’s leaderboard inside the swipeable challenge card and guarded until completion", () => {
    useTodayChallengeRuntime.mockReturnValue({
      projection: projection("blind_resume"),
      loading: false,
      error: null,
      busy: false,
      configured: true,
      advance: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TodayChallengeHub />);

    const carousel = document.querySelector(".today-hub__carousel");
    expect(carousel?.children).toHaveLength(2);
    expect(carousel?.children[0]).toHaveTextContent("Blind Resume");
    expect(carousel?.children[1]).toHaveTextContent("TODAY’S LEADERBOARD");
    expect(screen.queryByText("Across devices")).not.toBeInTheDocument();
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show today’s leaderboard" }));
    expect(screen.getByText(/finish today’s official game/i)).toBeInTheDocument();
    expect(screen.queryByText("hidden-rating-99")).not.toBeInTheDocument();
  });

  it("shows every official finisher and normalized score on today’s leaderboard", () => {
    useTodayChallengeRuntime.mockReturnValue({
      projection: projection("find_leader"),
      loading: false,
      error: null,
      busy: false,
      configured: true,
      advance: vi.fn(),
      refresh: vi.fn(),
    });
    const entries = Array.from({ length: 10 }, (_, index) => ({
      rank: index + 1,
      profileId: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      displayName: `Player ${index + 1}`,
      initials: `P${index + 1}`,
      avatarPhotoData: null,
      nativeScore: 10 - index,
      normalizedScore: 100 - index,
      isCurrentUser: index === 0,
    }));
    useTodayChallengeOverview.mockReturnValue({
      ...overviewDefaults,
      leaderboard: { unlocked: true, playerCount: entries.length, entries },
    });

    render(<TodayChallengeHub />);

    expect(document.querySelectorAll(".today-hub-leaderboard__rows article")).toHaveLength(entries.length);
    expect(screen.getByText("Player 10").closest("article")).toHaveTextContent("91");
  });
});
