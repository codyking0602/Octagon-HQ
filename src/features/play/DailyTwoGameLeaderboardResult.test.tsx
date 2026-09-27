import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DailyTwoGameLeaderboardResult } from "./DailyTwoGameLeaderboardResult";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

function projection(overrides: Partial<TodayChallengeProjection> = {}): TodayChallengeProjection {
  return {
    available: true,
    id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-09-27",
    scheduleVersion: "test",
    gameType: "find_leader",
    setupKey: "test",
    contentVersion: "test",
    scoringVersion: "daily-two-game-average-score-v1",
    fallbackReason: null,
    publicSetup: {
      format_version: "daily-two-game-average-v1",
      rounds: [
        { question: "Who leads game one?", stat_label: "STAT ONE", candidates: [] },
        { question: "Who leads game two?", stat_label: "STAT TWO", candidates: [] },
      ],
    },
    progressRevision: 1,
    publicState: {},
    revealSetup: {
      format_version: "daily-two-game-average-v1",
      rounds: [
        {
          leader_id: "leader-one",
          candidates: Array.from({ length: 10 }, (_, index) => ({
            id: index === 0 ? "leader-one" : `one-${index}`,
            name: index === 0 ? "Leader One" : `Game One ${index}`,
            value: 10 - index,
            division: "TEST",
          })),
        },
        {
          leader_id: "leader-two",
          candidates: Array.from({ length: 10 }, (_, index) => ({
            id: index === 0 ? "leader-two" : `two-${index}`,
            name: index === 0 ? "Leader Two" : `Game Two ${index}`,
            value: 20 - index,
            division: "TEST",
          })),
        },
      ],
    },
    officialAttempt: {
      nativeScore: 9,
      normalizedScore: 95,
      completedAt: "2026-09-27T12:00:00.000Z",
      publicResult: {
        daily_series: {
          format_version: "daily-two-game-average-v1",
          round_scores: [100, 90],
          average_score: 95,
          rounds: [
            {
              perfect: true,
              native_score: 10,
              normalized_score: 100,
              eliminated_ids: Array.from({ length: 9 }, (_, index) => `one-${index + 1}`),
            },
            {
              perfect: false,
              native_score: 9,
              normalized_score: 90,
              eliminated_ids: ["two-1", "two-2", "two-3", "two-4", "two-5", "two-6", "two-7", "two-8", "leader-two"],
            },
          ],
        },
      },
    },
    deploymentSha: "test",
    ...overrides,
  };
}

describe("compact two-game leaderboard result", () => {
  it("shows the Daily average with both games collapsed by default", () => {
    const { container } = render(
      <DailyTwoGameLeaderboardResult projection={projection()} resultDetail={{}} sport="ufc" />,
    );

    expect(container.textContent).toContain("DAILY AVERAGE");
    expect(container.textContent).toContain("95");
    expect(container.textContent).toContain("GAME 1");
    expect(container.textContent).toContain("100");
    expect(container.textContent).toContain("GAME 2");
    expect(container.textContent).toContain("90");
    const games = [...container.querySelectorAll<HTMLDetailsElement>(".daily-two-game-result__game")];
    expect(games).toHaveLength(2);
    expect(games.every((game) => !game.open)).toBe(true);
  });

  it("switches an expanded Find the Leader game from the run to the compact 1-10 reveal rail", () => {
    const { container, getAllByText } = render(
      <DailyTwoGameLeaderboardResult projection={projection()} resultDetail={{}} sport="ufc" />,
    );

    const games = [...container.querySelectorAll<HTMLDetailsElement>(".daily-two-game-result__game")];
    fireEvent.click(games[1]!.querySelector("summary")!);
    const revealButton = getAllByText("FINAL REVEAL")[1]!;
    fireEvent.click(revealButton);

    const openGame = games[1]!;
    const tiles = openGame.querySelectorAll(".daily-two-game-result__tile");
    expect(tiles).toHaveLength(10);
    expect(openGame.textContent).toContain("SCROLL 1–10");
    expect(openGame.textContent).toContain("Leader Two");
    expect(openGame.textContent).toContain("#1");
  });

  it("reconstructs both Wavelength rounds from sanitized leaderboard detail", () => {
    const wavelengthProjection = projection({
      gameType: "wavelength",
      publicSetup: {
        format_version: "daily-two-game-average-v1",
        rounds: [{}, {}],
      },
      revealSetup: { format_version: "daily-two-game-average-v1", rounds: [{}, {}] },
      officialAttempt: {
        nativeScore: 82,
        normalizedScore: 89,
        completedAt: "2026-09-27T12:00:00.000Z",
        publicResult: {
          daily_series: {
            format_version: "daily-two-game-average-v1",
            round_scores: [96, 82],
            average_score: 89,
            rounds: [
              { normalized_score: 96, guesses: [95, 96, 94, 97], distance: 2 },
              { normalized_score: 82, guesses: [78, 62, 50, 55], distance: 9 },
            ],
          },
        },
      },
    });
    const { container } = render(
      <DailyTwoGameLeaderboardResult
        projection={wavelengthProjection}
        sport="football"
        resultDetail={{
          rounds: [
            { target: 99, clue_ids: ["freak-randy-moss"] },
            { target: 46, clue_ids: ["system-qb-ryan-tannehill"] },
          ],
        }}
      />,
    );

    const games = container.querySelectorAll(".daily-two-game-result__game");
    expect(games[0]!.textContent).toContain("95 → 96 → 94 → 97");
    expect(games[0]!.textContent).toContain("Randy Moss");
    expect(games[1]!.textContent).toContain("78 → 62 → 50 → 55");
    expect(games[1]!.textContent).toContain("Ryan Tannehill");
    expect(games[1]!.textContent).toContain("46");
  });
});
