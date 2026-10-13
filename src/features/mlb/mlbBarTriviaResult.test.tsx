import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createBarTriviaState,
  setBarTriviaWager,
  submitBarTriviaAnswer,
} from "../games/barTriviaEngine";
import {
  buildBarTriviaLeaderboardQuestions,
  DailyLeaderboardGameResult,
} from "../play/DailyLeaderboardGameResult";
import type { MlbPlayChallengeLeaderboardEntry } from "./mlbPlayChallenge";
import {
  MLB_BAR_TRIVIA_PRODUCTION_RUN,
  MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN,
} from "./mlbBarTriviaProduction";
import { mlbBarTriviaResultProjection } from "./mlbBarTriviaResult";

function entry(
  resultDetail: Record<string, unknown>,
  score: number,
): MlbPlayChallengeLeaderboardEntry {
  return {
    rank: 1,
    profileId: "test-player",
    displayName: "MLB PLAYER",
    initials: "MP",
    avatarPhotoData: null,
    isCurrentUser: true,
    completedAt: "2026-10-11T22:45:00Z",
    gameType: "bar_trivia",
    rawScore: score,
    publicResult: {
      score,
      correct_count: 8,
      best_streak: 5,
      double_round: "round2",
      wager: 7,
    },
    resultDetail,
  };
}

describe("MLB Bar Trivia official leaderboard drill-down", () => {
  it("uses the canonical October 11 questions and existing Football/UFC recap with all ten saved picks", () => {
    let state = createBarTriviaState("round2");
    for (const [index, question] of MLB_BAR_TRIVIA_PRODUCTION_RUN.entries()) {
      if (index === 9) state = setBarTriviaWager(state, 7);
      const choice = index === 2 || index === 9
        ? question.choices.find((value) => value !== question.answer)!
        : question.answer;
      state = submitBarTriviaAnswer(MLB_BAR_TRIVIA_PRODUCTION_RUN, state, choice).state;
    }
    expect(state.complete).toBe(true);
    expect(state.answers).toHaveLength(10);

    const detail = {
      correct_count: state.correctCount,
      double_round: state.doubleRound,
      wager: state.wager,
      answers: state.answers.map((answer) => ({
        question_id: answer.questionId,
        choice: answer.choice,
        correct: answer.correct,
        points: answer.points,
        raw_points: answer.rawPoints,
        base_points: answer.basePoints,
        double_round_bonus: answer.doubleRoundBonus,
        streak_bonus: answer.streakBonus,
        wager_delta: answer.wagerDelta,
        round_multiplier: answer.roundMultiplier,
        streak_multiplier: answer.streakMultiplier,
      })),
    };
    const projection = mlbBarTriviaResultProjection(
      entry(detail, state.score), "mlb-2026-play-11", "2026-10-11",
    );
    expect(projection).not.toBeNull();
    expect(projection!.officialAttempt?.normalizedScore).toBe(state.score);
    const rows = buildBarTriviaLeaderboardQuestions(projection!, detail);
    expect(rows).toHaveLength(10);
    expect(rows.map((row) => row.hasRecordedAnswer)).toEqual(Array(10).fill(true));
    expect(rows[2]).toMatchObject({ correct: false, pickedChoice: state.answers[2]!.choice });
    expect(rows[9]).toMatchObject({ correct: false, wagerDelta: -7 });
    expect(rows[4]!.doubleRoundBonus).toBeGreaterThan(0);

    const { container } = render(<DailyLeaderboardGameResult projection={projection!} resultDetail={detail} />);
    expect(screen.getByText("BAR TRIVIA")).toBeInTheDocument();
    expect(container.querySelectorAll(".leaderboard-bar-trivia-questions details")).toHaveLength(10);
    expect(screen.getByText("2× DOUBLE ROUND")).toBeInTheDocument();
    expect(screen.getByText(MLB_BAR_TRIVIA_PRODUCTION_RUN[0]!.prompt)).toBeInTheDocument();
    const wrong = container.querySelectorAll(".leaderboard-bar-trivia-questions details")[2]!;
    expect(within(wrong as HTMLElement).getByText("MISS · 0 PTS")).toBeInTheDocument();
    expect(within(wrong as HTMLElement).getByText(MLB_BAR_TRIVIA_PRODUCTION_RUN[2]!.explanation)).toBeInTheDocument();
    expect(screen.queryByText(/predates answer-by-answer recording/i)).not.toBeInTheDocument();
  });

  it("provides questions and correct answers without claiming to know October 11 legacy picks", () => {
    const legacy = entry({
      correct_count: 8,
      best_streak: 5,
      double_round: "round2",
      wager: 7,
    }, 80);
    const projection = mlbBarTriviaResultProjection(legacy, "mlb-2026-play-11", "2026-10-11")!;
    const rows = buildBarTriviaLeaderboardQuestions(projection, legacy.resultDetail);
    expect(rows).toHaveLength(10);
    expect(rows.every((row) => !row.hasRecordedAnswer)).toBe(true);
    expect(rows.every((row) => !row.pickedChoice && !row.correct)).toBe(true);

    const { container } = render(<DailyLeaderboardGameResult projection={projection} resultDetail={legacy.resultDetail} />);
    expect(screen.getByText(/predates answer-by-answer recording/i)).toBeInTheDocument();
    expect(container.querySelectorAll(".leaderboard-bar-trivia-questions details")).toHaveLength(10);
    expect(screen.getAllByText("PICK NOT RECORDED")).toHaveLength(10);
    expect(screen.getByText(MLB_BAR_TRIVIA_PRODUCTION_RUN[9]!.prompt)).toBeInTheDocument();
    expect(screen.queryByText("MISS · 0 PTS")).not.toBeInTheDocument();
  });

  it("resolves the future October 27 run by its own ID and date and refuses a mismatched date", () => {
    const result = entry({}, 60);
    const second = mlbBarTriviaResultProjection(result, "mlb-2026-play-16", "2026-10-27")!;
    expect(second.revealSetup?.questions).toEqual(MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN.map((question) => ({
      id: question.id,
      round: question.round,
      category: question.category,
      prompt: question.prompt,
      choices: [...question.choices],
      answer: question.answer,
      explanation: question.explanation,
    })));
    expect(mlbBarTriviaResultProjection(result, "mlb-2026-play-16", "2026-10-11")).toBeNull();
  });

  it("keeps official answer persistence and shared recap wired to the existing runner", () => {
    const runner = readFileSync("src/features/play/BarTriviaCasualPage.tsx", "utf8");
    const recorder = readFileSync("src/features/mlb/MlbFeaturedChallengePage.tsx", "utf8");
    const leaderboard = readFileSync("src/features/mlb/MlbPlayoffsPage.tsx", "utf8");
    expect(runner).toContain("answers: state.answers,");
    expect(recorder).toContain("answers: result.answers.map((answer) => ({");
    expect(recorder).toContain("question_id: answer.questionId");
    expect(recorder).toContain("wager_delta: answer.wagerDelta");
    expect(leaderboard).toContain("mlbBarTriviaResultProjection(entry, challengeKey, challengeDate)");
    expect(leaderboard).toContain("<DailyLeaderboardGameResult");
    expect(leaderboard).toContain("projection={sharedResult.projection}");
  });
});
