import { readFileSync } from "node:fs";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OfficialTodayChallengeContent } from "../play/OfficialTodayChallengePage";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";

function question(index: number) {
  return {
    id: `football-daily-comparison-${index}`,
    league: "CFB", category: "single-season", metricLabel: "Best-season rushing TDs",
    known: { subjectId: "cfb-kyler-murray", name: "Kyler Murray", context: "2018 PEAK · QB", formattedValue: "11", value: 11 },
    hidden: { subjectId: "cfb-cam-newton", name: "Cam Newton", context: "2010 PEAK · QB" },
  };
}

function round(index: number) {
  return {
    index: 0, correct_count: 0, answers: [], complete: false,
    current_question: question(index), last_result: null,
  };
}

function projection(roundIndex = 0): TodayChallengeProjection {
  return {
    available: true, sport: "football",
    id: "e6d30727-22b6-4e6f-b2a6-994bf5f7e979",
    centralDay: "2026-11-05",
    scheduleVersion: "football-daily-v22-higher-lower-oct27",
    gameType: "higher_lower",
    setupKey: "daily-two-game-average-v1:football:higher_lower",
    contentVersion: "daily-two-game-average-v1:football-higher-lower-official-v1",
    scoringVersion: "daily-two-game-average-score-v1",
    fallbackReason: null, progressRevision: 0, deploymentSha: "test",
    publicSetup: { format_version: "daily-two-game-average-v1", rounds: [
      { initial_state: round(1) }, { initial_state: round(2) },
    ] },
    publicState: {
      format_version: "daily-two-game-average-v1",
      round_index: roundIndex, round_count: 2,
      active_round: round(roundIndex + 1),
      round_scores: roundIndex === 0 ? [] : [80],
      completed_rounds: roundIndex === 0 ? [] : [{ normalized_score: 80 }],
      awaiting_next: false, handoff_pending: false, complete: false, score: null,
    },
    revealSetup: null,
    officialAttempt: null,
  };
}

function view(value: TodayChallengeProjection) {
  const advance = vi.fn();
  const navigate = vi.fn();
  const rendered = render(
    <OfficialTodayChallengeContent
      projection={value} busy={false} onAdvance={advance} onNavigate={navigate}
    />,
  );
  return { ...rendered, advance, navigate };
}

describe("Football HQ Higher or Lower primary Daily route", () => {
  it("routes the main Football Today page into the existing complete two-game presenter", () => {
    const source = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");
    const branch = source.indexOf('if (projection.gameType === "higher_lower") {');
    const legacyFallback = source.lastIndexOf('  return (\n    <div className="page football-today-page">');
    expect(branch).toBeGreaterThan(0);
    expect(branch).toBeLessThan(legacyFallback);
    expect(source.slice(branch, legacyFallback)).toContain("<OfficialTodayChallengeContent");
    expect(source).toContain('import { OfficialTodayChallengeContent }');
  });

  it("renders the first stored question and submits through the canonical server action", () => {
    const { container, advance } = view(projection());
    expect(screen.getByText("GAME 1 OF 2")).toBeInTheDocument();
    expect(container.querySelector(".football-higher-lower")).not.toBeNull();
    expect(screen.getByText("Kyler Murray")).toBeInTheDocument();
    expect(screen.getByText("Cam Newton")).toBeInTheDocument();
    expect(screen.getByText("Best-season rushing TDs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "HIGHER" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "LOWER" })).toBeEnabled();
    expect(screen.queryByText("20")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "HIGHER" }));
    expect(advance).toHaveBeenCalledWith({ choice: "higher" });
  });

  it("restores game two from the active round instead of looking for a top-level question", () => {
    const { container, advance } = view(projection(1));
    expect(screen.getByText("GAME 2 OF 2")).toBeInTheDocument();
    expect(screen.getByText("GAME 1 · 80/100")).toBeInTheDocument();
    expect(container.querySelector(".football-higher-lower")).not.toBeNull();
    expect(screen.getByRole("button", { name: "LOWER" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "LOWER" }));
    expect(advance).toHaveBeenCalledWith({ choice: "lower" });
  });

  it("shows the combined result with both saved round scores after completion", () => {
    const completed: TodayChallengeProjection = {
      ...projection(1),
      publicState: {
        ...projection(1).publicState,
        complete: true, round_scores: [80, 90], score: 85,
      },
      officialAttempt: {
        nativeScore: 9, normalizedScore: 85,
        completedAt: "2026-11-05T12:00:00Z",
        publicResult: { daily_series: {
          format_version: "daily-two-game-average-v1",
          round_scores: [80, 90], average_score: 85,
          rounds: [{ normalized_score: 80 }, { normalized_score: 90 }],
        } },
      },
    };
    const { container } = view(completed);
    expect(container.querySelector(".daily-two-game-result")).not.toBeNull();
    expect(screen.getByText("DAILY AVERAGE")).toBeInTheDocument();
    expect(container.querySelector(".daily-two-game-result__summary")?.textContent)
      .toMatch(/85\/100.*GAME 1 80.*GAME 2 90/);
    expect(screen.queryByRole("button", { name: "HIGHER" })).not.toBeInTheDocument();
  });
});
