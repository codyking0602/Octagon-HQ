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

describe("generalized Today’s Challenge hub", () => {
  beforeEach(() => {
    navigate.mockReset();
    openDialog.mockReset();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
    useTodayChallengeOverview.mockReturnValue({
      configured: true,
      history: [],
      streak: { currentStreak: 3, bestStreak: 7 },
      leaderboard: { unlocked: false, playerCount: 0, entries: [] },
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
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
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(title, "i") }));
    expect(navigate).toHaveBeenCalledWith(route);
  });

  it("shows generalized streak, history, and guarded leaderboard projections", () => {
    useTodayChallengeRuntime.mockReturnValue({
      projection: projection("blind_resume"),
      loading: false,
      error: null,
      busy: false,
      configured: true,
      advance: vi.fn(),
      refresh: vi.fn(),
    });
    useTodayChallengeOverview.mockReturnValue({
      configured: true,
      history: [{
        day: "2026-08-04",
        scheduleVersion: "find-leader-v1",
        gameType: "find_leader",
        nativeScore: 9,
        normalizedScore: 90,
        completedAt: "2026-08-04T20:00:00Z",
        publicResult: {},
      }],
      streak: { currentStreak: 3, bestStreak: 7 },
      leaderboard: { unlocked: false, playerCount: 0, entries: [] },
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(<TodayChallengeHub />);
    expect(screen.getByText(/3-day current/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "LEADERBOARD" }));
    expect(screen.getByText(/finish today’s official game/i)).toBeInTheDocument();
    expect(screen.queryByText("hidden-rating-99")).not.toBeInTheDocument();
  });
});
