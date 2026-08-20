import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TodayChallengeHub from "./TodayChallengeHub";
import { playFighters, type PlayFighter } from "./playFighterPool";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

const navigate = vi.fn();
const useTodayChallengeRuntime = vi.fn();
const useTodayChallengeOverview = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigate };
});

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({
    status: "ready",
    profile: { id: "11111111-1111-4111-8111-111111111111" },
    openDialog: vi.fn(),
  }),
}));

vi.mock("./useTodayChallengeRuntime", () => ({
  useTodayChallengeRuntime: (...args: unknown[]) => useTodayChallengeRuntime(...args),
}));

vi.mock("./useTodayChallengeOverview", () => ({
  useTodayChallengeOverview: (...args: unknown[]) => useTodayChallengeOverview(...args),
}));

function presentation(fighter: PlayFighter) {
  return {
    id: fighter.id,
    name: fighter.name,
    gender: fighter.gender,
    divisions: fighter.divisions,
    main_era: fighter.mainEra,
    thumb_url: fighter.thumbUrl,
    profile_url: fighter.profileUrl,
    tier: "great",
  };
}

const board = playFighters.slice(0, 8);
const rankFive = playFighters.slice(8, 13);
const shaneKept = board.slice(4).map(presentation);
const shaneCut = board.slice(0, 4).map(presentation);
const shaneRank = [...rankFive].reverse().map(presentation);
const canonicalRank = rankFive.map(presentation);

const projection: TodayChallengeProjection = {
  available: true,
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  centralDay: "2026-08-20",
  scheduleVersion: "play-rotation-v4",
  gameType: "keep_4_cut_4",
  setupKey: "daily-rank-keep-combo:test",
  contentVersion: "daily-rank-keep-combo-v1",
  scoringVersion: "play-official-score-v4",
  fallbackReason: null,
  publicSetup: {
    pack: {
      id: "all-careers",
      group: "Careers",
      name: "All UFC Careers",
      prompt: "Keep four UFC careers. Cut four.",
      description: "Men and women together on one UFC-only career scale.",
    },
  },
  progressRevision: 13,
  publicState: {},
  revealSetup: {},
  officialAttempt: {
    nativeScore: 87,
    normalizedScore: 87,
    completedAt: "2026-08-20T15:00:00.000Z",
    publicResult: {},
  },
  deploymentSha: "test-sha",
};

const shaneState = {
  kept: shaneKept,
  cut: shaneCut,
  reveal: {
    model_top_four_ids: board.slice(0, 4).map((fighter) => fighter.id),
  },
  combo_blind_rank_result: {
    slots: shaneRank,
    reveal: {
      canonical_order: canonicalRank,
    },
  },
};

describe("Today’s Challenge leaderboard answer reveal", () => {
  beforeEach(() => {
    navigate.mockReset();
    useTodayChallengeRuntime.mockReturnValue({
      projection,
      loading: false,
      error: null,
      busy: false,
      configured: true,
      advance: vi.fn(),
      refresh: vi.fn(),
    });
    useTodayChallengeOverview.mockReturnValue({
      configured: true,
      standings: null,
      streak: { currentStreak: 1, bestStreak: 1 },
      leaderboard: {
        unlocked: true,
        playerCount: 2,
        entries: [
          {
            rank: 1,
            profileId: "11111111-1111-4111-8111-111111111111",
            displayName: "Cody",
            initials: "CK",
            avatarPhotoData: null,
            gameType: "keep_4_cut_4",
            nativeScore: 87,
            normalizedScore: 87,
            completedAt: "2026-08-20T15:00:00.000Z",
            publicResult: {},
            progressRevision: 13,
            publicState: {},
            isCurrentUser: true,
          },
          {
            rank: 2,
            profileId: "22222222-2222-4222-8222-222222222222",
            displayName: "Shane",
            initials: "SH",
            avatarPhotoData: null,
            gameType: "keep_4_cut_4",
            nativeScore: 80,
            normalizedScore: 80,
            completedAt: "2026-08-20T15:03:00.000Z",
            publicResult: {
              combo_version: "daily-rank-keep-combo-v1",
              blind_rank: {
                ordered_ids: shaneRank.map((fighter) => fighter.id),
                normalized_score: 79,
              },
              keep_cut: {
                kept_ids: shaneKept.map((fighter) => fighter.id),
                normalized_score: 81,
              },
            },
            progressRevision: 13,
            publicState: shaneState,
            isCurrentUser: false,
          },
        ],
      },
      standingsLoading: false,
      leaderboardLoading: false,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
  });

  it("opens another finisher in the same graded Daily Double result presentation used for your own result", () => {
    render(<TodayChallengeHub />);

    fireEvent.click(screen.getByRole("button", { name: "View Shane's answers" }));

    const dialog = screen.getByRole("dialog", { name: "Shane official Daily result" });
    expect(within(dialog).getByText("DAILY DOUBLE · FINAL RESULT")).toBeInTheDocument();
    expect(within(dialog).getByText("BLIND RANK 5 · PART 1 RESULT")).toBeInTheDocument();
    expect(within(dialog).getByText("OCTAGON HQ ORDER")).toBeInTheDocument();
    expect(within(dialog).getByText("OCTAGON HQ TOP 4")).toBeInTheDocument();
    expect(within(dialog).getAllByText("MISSED").length).toBeGreaterThan(0);
    expect(within(dialog).queryByText("OFFICIAL DAILY ANSWERS")).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /leaderboard/i }));
    expect(screen.queryByRole("dialog", { name: "Shane official Daily result" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Shane's answers" })).toBeInTheDocument();
  });
});
