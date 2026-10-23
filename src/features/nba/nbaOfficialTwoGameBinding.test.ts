import { describe, expect, it } from "vitest";
import { nbaOfficialActiveRound } from "./NbaOfficialDailyPage";
import { dailyTwoGameSeriesState } from "../play/DailyTwoGameStatus";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";
import pageSource from "./NbaOfficialDailyPage.tsx?raw";

function projection(completed: boolean): TodayChallengeProjection {
  return {
    available: true,
    sport: "nba",
    id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-11-11",
    scheduleVersion: "nba-daily-regular-v1",
    gameType: "find_leader",
    setupKey: "nba-two-rounds",
    contentVersion: "nba-daily",
    scoringVersion: "official-score-v1",
    fallbackReason: null,
    progressRevision: 12,
    publicSetup: {
      format_version: "daily-two-game-average-v1",
      rounds: [
        { question: "First stat", candidates: [{ id: "first" }] },
        { question: "Second stat", candidates: [{ id: "second" }] },
      ],
    },
    publicState: {
      format_version: "daily-two-game-average-v1",
      round_index: 1,
      active_round: { eliminated_ids: ["second"], guesses: [49] },
      round_scores: [90, 80],
    },
    revealSetup: {
      rounds: [
        { leader_id: "first", candidates: [{ id: "first", value: 23 }] },
        { leader_id: "second", candidates: [{ id: "second", value: 45 }] },
      ],
    },
    officialAttempt: completed ? {
      nativeScore: 85,
      normalizedScore: 85,
      completedAt: "2026-11-11T18:00:00Z",
      publicResult: {},
    } : null,
    deploymentSha: "test",
  };
}

describe("NBA official two-game active-round binding", () => {
  it("uses the second game's setup and saved state, not the empty two-game wrapper", () => {
    const next = nbaOfficialActiveRound(projection(false));
    expect(next.index).toBe(1);
    expect(next.setup).toEqual({ question: "Second stat", candidates: [{ id: "second" }] });
    expect(next.state).toEqual({ eliminated_ids: ["second"], guesses: [49] });
    expect(next.reveal).toEqual({});
    expect(next.score).toBeNull();
    expect(dailyTwoGameSeriesState(projection(false))?.gameIndex).toBe(1);
    expect(dailyTwoGameSeriesState(projection(false))?.gameNumber).toBe(2);
  });

  it("unlocks only completed authoritative Game 2 reveal and per-game score", () => {
    const end = nbaOfficialActiveRound(projection(true));
    expect(end.reveal).toEqual({
      leader_id: "second",
      candidates: [{ id: "second", value: 45 }],
    });
    expect(end.score).toBe(80);
    expect(projection(true).officialAttempt?.normalizedScore).toBe(85);
  });

  it("binds all three two-game NBA components to the active child and preserves official total", () => {
    expect(pageSource).toContain("const { setup, state, reveal, score } = nbaOfficialActiveRound(projection)");
    expect(pageSource).toContain("const { state, score } = nbaOfficialActiveRound(projection)");
    expect(pageSource).toContain("key={projection.setupKey + \":\" + String(projection.publicState.round_index ?? 0)}");
    expect(pageSource).toContain("completeReveal");
    expect(pageSource).toContain("projection.officialAttempt.normalizedScore}/100");
    expect(pageSource).toContain("NBA_OFFICIAL_GAMES_RELEASE_READY");
  });
});
