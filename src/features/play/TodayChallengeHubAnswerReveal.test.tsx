import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TodayChallengeHub from "./TodayChallengeHub";
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

function fighter(id: string, name: string) {
  return { id, name };
}

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
  publicSetup: {},
  progressRevision: 13,
  publicState: {
    kept: [
      fighter("kc1", "Keep One"), fighter("kc2", "Keep Two"),
      fighter("kc3", "Keep Three"), fighter("kc4", "Keep Four"),
    ],
    cut: [
      fighter("kc5", "Cut Five"), fighter("kc6", "Cut Six"),
      fighter("kc7", "Cut Seven"), fighter("kc8", "Cut Eight"),
    ],
    combo_blind_rank_result: {
      slots: [
        fighter("br1", "Rank One"), fighter("br2", "Rank Two"), fighter("br3", "Rank Three"),
        fighter("br4", "Rank Four"), fighter("br5", "Rank Five"),
      ],
    },
  },
  revealSetup: null,
  officialAttempt: {
    nativeScore: 87,
    normalizedScore: 87,
    completedAt: "2026-08-20T15:00:00.000Z",
    publicResult: {},
  },
  deploymentSha: "test-sha",
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
            publicResult: {},
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
            publicResult: {
              combo_version: "daily-rank-keep-combo-v1",
              blind_rank: {
                ordered_ids: ["br2", "br1", "br5", "br3", "br4"],
                normalized_score: 80,
              },
              keep_cut: {
                kept_ids: ["kc1", "kc3", "kc5", "kc7"],
                normalized_score: 81,
              },
            },
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

  it("opens another finisher’s actual Daily Double answers and derives the matching cuts", () => {
    render(<TodayChallengeHub />);

    fireEvent.click(screen.getByRole("button", { name: "View Shane's answers" }));

    const dialog = screen.getByRole("dialog", { name: "Shane daily answers" });
    expect(within(dialog).getByText("Rank Two")).toBeInTheDocument();
    expect(within(dialog).getByText("Keep One")).toBeInTheDocument();
    expect(within(dialog).getByText("Cut Eight")).toBeInTheDocument();
    expect(within(dialog).getByText("BLIND RANK 5")).toBeInTheDocument();
    expect(within(dialog).getByText("KEEP 4")).toBeInTheDocument();
    expect(within(dialog).getByText("CUT 4")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /back/i }));
    expect(screen.queryByRole("dialog", { name: "Shane daily answers" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Shane's answers" })).toBeInTheDocument();
  });
});
