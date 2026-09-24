import { act, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PropsWithChildren } from "react";
import OfficialSportsFeudDailyView from "./OfficialSportsFeudDailyView";
import {
  optimisticSportsFeudFastMoneyProjection,
} from "./sportsFeudDailyOptimistic";
import {
  todayChallengeRuntimeQueryKey,
  useTodayChallengeRuntime,
} from "./useTodayChallengeRuntime";
import type {
  TodayChallengeProjection,
  TodayChallengeRepository,
} from "./todayChallengeRepository";

function fastProjection(): TodayChallengeProjection {
  const prompts = Array.from({ length: 5 }, (_, index) => ({
    id: "fast-" + (index + 1),
    prompt: "Fast prompt " + (index + 1),
  }));
  return {
    available: true,
    sport: "football",
    id: "00000000-0000-4000-8000-000000000222",
    centralDay: "2026-09-23",
    scheduleVersion: "football-daily-responsive-test",
    gameType: "sports_feud",
    setupKey: "sports-feud-responsive-test",
    contentVersion: "family-feud-daily-v2",
    scoringVersion: "family-feud-score-v2",
    fallbackReason: null,
    publicSetup: {
      presentation_domain: "nfl",
      fast_money_prompts: prompts,
    },
    progressRevision: 1,
    publicState: {
      phase: "fast-money",
      complete: false,
      main_board_index: 1,
      main_points: 20,
      main_boards: [
        { prompt: "Round one", strikes: 3, settled: true, slots: [], answer_reveal: [] },
        { prompt: "Round two", strikes: 3, settled: true, slots: [], answer_reveal: [] },
      ],
      fast_money: {
        answered_count: 0,
        question_index: 0,
        current_question: prompts[0],
        submitted_answers: [],
        results: [],
        points: null,
        time_remaining_ms: 50_000,
      },
    },
    revealSetup: null,
    officialAttempt: null,
    deploymentSha: "test-sha",
    actionHistory: [],
  };
}

function serverProjection(
  base: TodayChallengeProjection,
  action: Record<string, unknown>,
): TodayChallengeProjection {
  const questionId = String(action.question_id ?? "");
  const questionIndex = Number(questionId.replace("fast-", "")) - 1;
  const next = optimisticSportsFeudFastMoneyProjection(base, {
    questionIndex,
    questionId,
    answer: String(action.answer ?? ""),
    timeRemainingMs: Number(action.time_remaining_ms ?? 0),
  });
  const fast = next.publicState.fast_money as Record<string, unknown>;
  const publicState = {
    ...next.publicState,
    fast_money: {
      ...fast,
      client_pending_complete: undefined,
    },
  };

  if (questionIndex < 4) {
    return {
      ...next,
      progressRevision: base.progressRevision + 1,
      publicState,
    };
  }

  const submitted = (fast.submitted_answers as Array<Record<string, unknown>> | undefined) ?? [];
  return {
    ...next,
    progressRevision: base.progressRevision + 1,
    publicState: {
      ...publicState,
      phase: "complete",
      complete: true,
      fast_money: {
        ...publicState.fast_money as Record<string, unknown>,
        question_index: null,
        current_question: null,
        points: 25,
        results: submitted.map((row, index) => ({
          question_id: "fast-" + (index + 1),
          prompt: "Fast prompt " + (index + 1),
          submitted_answer: String(row.submitted_answer ?? ""),
          counted: true,
          points: 5,
          board_rank: 1,
          accepted_answers: [],
        })),
      },
      raw_points: 45,
      hq_score: 77,
    },
    officialAttempt: {
      nativeScore: 45,
      normalizedScore: 77,
      completedAt: "2026-09-23T23:00:00Z",
      publicResult: {
        main_points: 20,
        fast_money_points: 25,
        score: 77,
      },
    },
  };
}

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function Harness({
  repository,
}: {
  repository: TodayChallengeRepository;
}) {
  const runtime = useTodayChallengeRuntime({
    profileId: "profile-fast",
    enabled: true,
    repository,
    sport: "football",
  });
  if (!runtime.projection) return null;
  return (
    <>
      <output data-testid="official-score">
        {runtime.authoritativeProjection?.officialAttempt?.normalizedScore ?? "pending"}
      </output>
      <OfficialSportsFeudDailyView
        projection={runtime.projection}
        busy={runtime.busy}
        onAdvance={(action, options) => {
          void runtime.advance(action, options);
        }}
      />
    </>
  );
}

describe("Sports Feud Daily Fast Money slow-network responsiveness", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.classList.remove("family-feud-prototype-active");
    document.body.classList.remove("family-feud-prototype-active");
  });

  it.each([1_000, 5_000, 15_000])(
    "keeps all five prompts playable before a %dms server acknowledgement",
    async (serverDelayMs) => {
      vi.useFakeTimers();
      const initial = fastProjection();
      const advance = vi.fn<TodayChallengeRepository["advance"]>(
        (base, action) => new Promise<TodayChallengeProjection>((resolve) => {
          window.setTimeout(() => resolve(serverProjection(base as TodayChallengeProjection, action)), serverDelayMs);
        }),
      );
      const repository: TodayChallengeRepository = {
        loadToday: vi.fn().mockResolvedValue(initial),
        advance,
        loadHistory: vi.fn().mockResolvedValue([]),
        loadStreak: vi.fn().mockResolvedValue({ currentStreak: 0, bestStreak: 0 }),
        loadStandings: vi.fn().mockResolvedValue({
          playerCount: 0,
          currentUserRank: null,
          currentUserWins: 0,
          currentWeekStart: "2026-09-21",
          currentWeekEnd: "2026-09-27",
          entries: [],
        }),
        loadDailyLeaderboard: vi.fn().mockResolvedValue({
          unlocked: false,
          playerCount: 0,
          entries: [],
        }),
      };
      const client = new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: Infinity },
        },
      });
      client.setQueryData(
        todayChallengeRuntimeQueryKey("profile-fast", "football"),
        initial,
      );

      render(<Harness repository={repository} />, { wrapper: wrapper(client) });
      fireEvent.click(screen.getByRole("button", { name: "GO TO FAST MONEY" }));
      fireEvent.click(screen.getByRole("button", { name: "START 50 SECONDS" }));
      await act(async () => Promise.resolve());

      for (let index = 0; index < 5; index += 1) {
        const input = screen.getByLabelText("Fast Money answer");
        fireEvent.change(input, { target: { value: "Answer " + (index + 1) } });
        fireEvent.submit(input.closest("form")!);
        if (index < 4) {
          expect(screen.getByText("Fast prompt " + (index + 2))).toBeInTheDocument();
          expect(screen.getByLabelText("Fast Money answer")).toHaveFocus();
        }
      }

      expect(screen.getByText("LOCKING OFFICIAL SCORE…")).toBeInTheDocument();
      expect(advance).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("official-score")).toHaveTextContent("pending");

      const firstAction = advance.mock.calls[0]![1];
      expect(Number(firstAction.time_remaining_ms)).toBeGreaterThanOrEqual(49_000);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(serverDelayMs * 5 + 1_000);
      });

      expect(advance).toHaveBeenCalledTimes(5);
      expect(advance.mock.calls.map((call) => call[1].question_id))
        .toEqual(["fast-1", "fast-2", "fast-3", "fast-4", "fast-5"]);
      expect(advance.mock.calls.map((call) => (call[0] as TodayChallengeProjection).progressRevision))
        .toEqual([1, 2, 3, 4, 5]);
      expect(advance.mock.calls.every((call) => Number(call[1].time_remaining_ms) >= 49_000))
        .toBe(true);
      expect(screen.getByTestId("official-score")).toHaveTextContent("77");
    },
  );
});
