import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OfficialBlindResumeV3DailyView } from "./OfficialBlindResumeV3DailyView";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

function projection(overrides: Partial<TodayChallengeProjection> = {}): TodayChallengeProjection {
  const stats = Array.from({ length: 8 }, (_, index) => ({
    label: `STAT ${index + 1}`,
    revealed: index < 2,
    value_a: index < 2 ? String(index + 1) : null,
    value_b: index < 2 ? String(index + 11) : null,
  }));
  return {
    available: true,
    id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-08-18",
    scheduleVersion: "play-rotation-v3",
    gameType: "blind_resume",
    setupKey: "blind-resume-v3:play-rotation-v3:2026-08-18",
    contentVersion: "blind-resume-v3",
    scoringVersion: "play-official-score-v3",
    fallbackReason: null,
    publicSetup: { round_count: 5 },
    progressRevision: 1,
    publicState: {
      complete: false,
      round_index: 0,
      results: [],
      current_round: {
        round_index: 0,
        round_number: 1,
        revealed_count: 2,
        correct_points: 20,
        miss_points: 2,
        stats,
      },
    },
    revealSetup: null,
    officialAttempt: null,
    deploymentSha: "test-sha",
    ...overrides,
  };
}

describe("Blind Resume V3 official Daily presentation", () => {
  it("keeps all eight categories visible on a phone while exposing only the unlocked values", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
    const onAdvance = vi.fn();
    const { container } = render(
      <OfficialBlindResumeV3DailyView
        projection={projection()}
        busy={false}
        onAdvance={onAdvance}
        onNavigate={vi.fn()}
      />,
    );

    expect(container.querySelectorAll(".blind-resume-stats > div")).toHaveLength(8);
    expect(screen.getByText("2 OF 8 STATS SHOWN · LOCK NOW: CORRECT +20 · MISS +2")).toBeInTheDocument();
    expect(screen.getAllByText("•••")).toHaveLength(12);
    expect(screen.getByText("STAT 8")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "REVEAL 2 MORE STATS" }));
    expect(onAdvance).toHaveBeenCalledWith({ reveal: true });
    fireEvent.click(screen.getByRole("button", { name: "PICK A" }));
    expect(onAdvance).toHaveBeenCalledWith({ choice: "A" });
  });

  it("shows the official 100-point result rather than treating correct picks as a raw percentage", () => {
    const value = projection({
      publicState: {
        complete: true,
        round_index: 5,
        current_round: null,
        results: [],
      },
      officialAttempt: {
        nativeScore: 2,
        normalizedScore: 46,
        completedAt: "2026-08-18T12:00:00Z",
        publicResult: { correct_picks: 2, points: 46 },
      },
    });

    render(
      <OfficialBlindResumeV3DailyView
        projection={value}
        busy={false}
        onAdvance={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText("46/100")).toBeInTheDocument();
    expect(screen.getByText(/0-5 record · 0 points earned/)).toBeInTheDocument();
    expect(screen.queryByText("2/5")).not.toBeInTheDocument();
  });
});
