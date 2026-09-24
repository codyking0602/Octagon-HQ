import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import OfficialSportsFeudDailyView from "./OfficialSportsFeudDailyView";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

function mainState() {
  return {
    phase: "main",
    complete: false,
    main_board_index: 0,
    main_points: 0,
    main_boards: [
      {
        prompt: "Name a conference brand college football fans instantly recognize.",
        strikes: 0,
        settled: false,
        slots: Array.from({ length: 4 }, (_, slot_index) => ({
          slot_index,
          entity: null,
          points: null,
          revealed: false,
          found: false,
        })),
        answer_reveal: [],
      },
      {
        prompt: "Round two",
        strikes: 0,
        settled: false,
        slots: [],
        answer_reveal: [],
      },
    ],
    fast_money: {
      answered_count: 0,
      question_index: 0,
      submitted_answers: [],
      results: [],
      points: null,
      time_remaining_ms: 50_000,
    },
  };
}

function fastState(answeredCount = 1) {
  return {
    phase: "fast-money",
    complete: false,
    main_board_index: 1,
    main_points: 0,
    main_boards: [
      { prompt: "Round one", strikes: 3, settled: true, slots: [], answer_reveal: [] },
      { prompt: "Round two", strikes: 3, settled: true, slots: [], answer_reveal: [] },
    ],
    fast_money: {
      answered_count: answeredCount,
      question_index: answeredCount,
      current_question: {
        id: "fast-" + (answeredCount + 1),
        prompt: "Fast prompt " + (answeredCount + 1),
      },
      submitted_answers: Array.from({ length: answeredCount }, (_, index) => ({
        submitted_answer: "Answer " + (index + 1),
      })),
      results: [],
      points: null,
      time_remaining_ms: 40_000,
    },
  };
}

function projection(
  publicState: Record<string, unknown>,
  progressRevision = 1,
): TodayChallengeProjection {
  return {
    available: true,
    sport: "football",
    id: "00000000-0000-4000-8000-000000000111",
    centralDay: "2026-09-23",
    scheduleVersion: "football-daily-v12-sports-feud",
    gameType: "sports_feud",
    setupKey: "sports-feud-test",
    contentVersion: "family-feud-daily-v2",
    scoringVersion: "family-feud-score-v2",
    fallbackReason: null,
    publicSetup: {
      presentation_domain: "cfb",
      fast_money_prompts: Array.from({ length: 5 }, (_, index) => ({
        id: "fast-" + (index + 1),
        prompt: "Fast prompt " + (index + 1),
      })),
    },
    progressRevision,
    publicState,
    revealSetup: null,
    officialAttempt: null,
    deploymentSha: "test-sha",
    actionHistory: [],
  };
}

describe("Official Sports Feud Daily mobile locks", () => {
  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove("family-feud-prototype-active");
    document.body.classList.remove("family-feud-prototype-active");
  });

  it("targets only the launch-day CFB Deion cutout for the extra left nudge", () => {
    render(
      <OfficialSportsFeudDailyView
        projection={projection(mainState())}
        busy={false}
        onAdvance={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));
    const host = document.querySelector('img[src="/assets/3cfb.png"]');
    expect(host).toBeInTheDocument();
    expect(host).toHaveClass("feud-fast-host-asset", "is-cfb-deion");
  });

  it("never disables the focused Fast Money input during the server round-trip and restores focus for the next prompt", () => {
    const onAdvance = vi.fn();
    const first = projection(fastState(1), 1);
    const { rerender } = render(
      <OfficialSportsFeudDailyView
        projection={first}
        busy={false}
        onAdvance={onAdvance}
      />,
    );

    const input = screen.getByLabelText("Fast Money answer");
    input.focus();
    fireEvent.change(input, { target: { value: "Myles Garrett" } });
    fireEvent.submit(input.closest("form")!);

    expect(onAdvance).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "answer",
        answer: "Myles Garrett",
        question_id: "fast-2",
      }),
      expect.objectContaining({
        dedupeKey: expect.stringContaining("fast-2"),
        optimisticUpdate: expect.any(Function),
      }),
    );
    expect(screen.getByText("Fast prompt 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Fast Money answer")).toHaveValue("");
    expect(screen.getByLabelText("Fast Money answer")).toHaveFocus();

    rerender(
      <OfficialSportsFeudDailyView
        projection={{
          ...first,
          publicState: {
            ...first.publicState,
            fast_money: {
              ...(first.publicState.fast_money as Record<string, unknown>),
              answered_count: 2,
              question_index: 2,
              current_question: { id: "fast-3", prompt: "Fast prompt 3" },
              submitted_answers: [
                { submitted_answer: "Answer 1" },
                { submitted_answer: "Myles Garrett" },
              ],
            },
          },
        }}
        busy={true}
        onAdvance={onAdvance}
      />,
    );

    expect(screen.getByLabelText("Fast Money answer")).not.toBeDisabled();
    expect(screen.getByLabelText("Fast Money answer")).toHaveFocus();
  });
  it("queues all five Fast Money answers locally before any server acknowledgement", () => {
    const onAdvance = vi.fn();
    render(
      <OfficialSportsFeudDailyView
        projection={projection({
          ...fastState(0),
          main_boards: [
            { prompt: "Round one", strikes: 3, settled: true, slots: [], answer_reveal: [] },
            { prompt: "Round two", strikes: 3, settled: true, slots: [], answer_reveal: [] },
          ],
        }, 1)}
        busy={false}
        onAdvance={onAdvance}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "GO TO FAST MONEY" }));
    fireEvent.click(screen.getByRole("button", { name: "START 50 SECONDS" }));

    screen.getByLabelText("Fast Money answer").focus();
    for (let index = 0; index < 5; index += 1) {
      const input = screen.getByLabelText("Fast Money answer");
      fireEvent.change(input, { target: { value: "Answer " + (index + 1) } });
      fireEvent.submit(input.closest("form")!);
      if (index < 4) {
        expect(screen.getByText("Fast prompt " + (index + 2))).toBeInTheDocument();
        expect(screen.getByLabelText("Fast Money answer")).toHaveFocus();
      }
    }

    expect(onAdvance).toHaveBeenCalledTimes(5);
    expect(onAdvance.mock.calls.map(([action]) => (action as Record<string, unknown>).question_id))
      .toEqual(["fast-1", "fast-2", "fast-3", "fast-4", "fast-5"]);
    expect(screen.getByText("LOCKING OFFICIAL SCORE…")).toBeInTheDocument();
    expect(screen.getByLabelText("Fast Money answer")).toBeDisabled();
  });

});
