import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { TodayChallengeProjection } from "./todayChallengeRepository";
import {
  DailyTwoGamePresentationIntermission,
  dailyTwoGamePresentationHandoffWasDismissed,
  dailyTwoGamePresentationIntermissionState,
  rememberDailyTwoGamePresentationHandoff,
} from "./DailyTwoGameStatus";

function wavelengthProjection(overrides: Partial<TodayChallengeProjection> = {}): TodayChallengeProjection {
  return {
    available: true,
    sport: "football",
    id: "00000000-0000-4000-8000-000000000001",
    centralDay: "2026-09-30",
    scheduleVersion: "test-schedule",
    gameType: "wavelength",
    setupKey: "test-wavelength-game-2",
    contentVersion: "test",
    scoringVersion: "daily-two-game-average-score-v1",
    fallbackReason: null,
    publicSetup: {},
    progressRevision: 5,
    publicState: {
      guesses: [],
      daily_series: {
        format_version: "daily-two-game-average-v1",
        game_index: 1,
        game_number: 2,
        game_count: 2,
        awaiting_next: false,
        complete: false,
        round_scores: [90],
        average_score: null,
      },
    },
    revealSetup: null,
    officialAttempt: null,
    deploymentSha: "test",
    ...overrides,
  };
}

describe("Wavelength two-game presentation handoff", () => {
  it("shows an intermission even though the backend has already safely loaded Game 2", () => {
    const projection = wavelengthProjection();
    expect(dailyTwoGamePresentationIntermissionState(projection)).toEqual({
      key: "00000000-0000-4000-8000-000000000001:90",
      firstScore: 90,
    });

    const onContinue = vi.fn();
    render(
      <DailyTwoGamePresentationIntermission
        projection={projection}
        onContinue={onContinue}
      />,
    );

    expect(screen.getByText("GAME 1 OF 2 COMPLETE")).toBeTruthy();
    expect(screen.getByText("90")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "START GAME 2" }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("persists the presentation handoff dismissal across a page remount", () => {
    const key = "challenge-1:90";
    expect(dailyTwoGamePresentationHandoffWasDismissed(key, window.sessionStorage)).toBe(false);
    rememberDailyTwoGamePresentationHandoff(key, window.sessionStorage);
    expect(dailyTwoGamePresentationHandoffWasDismissed(key, window.sessionStorage)).toBe(true);
  });

  it("does not interrupt Game 2 once the player has made a new guess", () => {
    const projection = wavelengthProjection({
      publicState: {
        guesses: [50],
        daily_series: {
          format_version: "daily-two-game-average-v1",
          game_index: 1,
          game_number: 2,
          game_count: 2,
          awaiting_next: false,
          complete: false,
          round_scores: [90],
          average_score: null,
        },
      },
    });

    expect(dailyTwoGamePresentationIntermissionState(projection)).toBeNull();
  });

  it("does not change the handoff behavior for other two-game Daily formats", () => {
    expect(dailyTwoGamePresentationIntermissionState(
      wavelengthProjection({ gameType: "find_leader" }),
    )).toBeNull();
  });
});
