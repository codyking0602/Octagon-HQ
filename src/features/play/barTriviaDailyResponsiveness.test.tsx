// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OfficialBarTriviaDailyView } from "./OfficialBarTriviaDailyView";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

function projection(): TodayChallengeProjection {
  return {
    available: true,
    sport: "football",
    id: "00000000-0000-4000-8000-000000000777",
    centralDay: "2026-09-29",
    scheduleVersion: "football-daily-v17-bar-trivia-sep29",
    gameType: "bar_trivia",
    setupKey: "bar-trivia-responsive-test",
    contentVersion: "bar-trivia-daily-v1",
    scoringVersion: "play-official-score-v1",
    fallbackReason: null,
    publicSetup: {
      league: "nfl",
      question_count: 10,
    },
    progressRevision: 1,
    publicState: {
      complete: false,
      index: 1,
      score: 0,
      raw_score: 0,
      streak: 0,
      best_streak: 0,
      correct_count: 0,
      wager: null,
      double_round: "round2",
      answers: [],
      current_question: {
        id: "nfl-test-2",
        league: "nfl",
        round: "round1",
        difficulty: "easy",
        category: "Teams",
        prompt: "Which answer did you tap?",
        choices: ["One", "Two", "Three", "Four"],
        contentType: "evergreen",
      },
      last_result: null,
      last_question: null,
    },
    revealSetup: null,
    officialAttempt: null,
    deploymentSha: "test-sha",
    actionHistory: [],
  };
}

describe("Bar Trivia Daily answer responsiveness", () => {
  it("highlights and locks the tapped answer before the server responds", () => {
    const onAdvance = vi.fn();
    render(
      <OfficialBarTriviaDailyView
        projection={projection()}
        busy={false}
        onAdvance={onAdvance}
        onExit={vi.fn()}
      />,
    );

    const selected = screen.getByText("Two").closest("button");
    const untouched = screen.getByText("Three").closest("button");
    expect(selected).not.toBeNull();
    expect(untouched).not.toBeNull();

    fireEvent.click(selected!);

    expect(onAdvance).toHaveBeenCalledWith({ choice: "Two" });
    expect(selected).toHaveClass("is-selected");
    expect(selected).toHaveAttribute("aria-pressed", "true");
    expect(selected).toBeDisabled();
    expect(untouched).toBeDisabled();
  });
});
