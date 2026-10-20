import { describe, expect, it } from "vitest";
import { buildWhoAmILeaderboardRounds } from "../play/DailyLeaderboardGameResult";
import type { MlbPlayChallengeLeaderboardEntry } from "./mlbPlayChallenge";
import {
  MLB_WHO_AM_I_PRODUCTION_ROUNDS,
  MLB_WHO_AM_I_SECOND_PRODUCTION_ROUNDS,
} from "./mlbWhoAmIProduction";
import { mlbWhoAmIResultProjection } from "./mlbWhoAmILeaderboardResult";

function completedEntry(
  rounds: Record<string, unknown>[],
  officialRounds = MLB_WHO_AM_I_PRODUCTION_ROUNDS,
): MlbPlayChallengeLeaderboardEntry {
  return {
    rank: 1,
    profileId: "profile-1",
    displayName: "Test player",
    initials: "TP",
    avatarPhotoData: null,
    isCurrentUser: true,
    rawScore: 98,
    gameType: "who_am_i",
    publicResult: {
      round_scores: [100, 95],
      rounds: rounds.map((round, index) => ({
        score: index === 0 ? 100 : 95,
        outcome: "natural",
        revealed_count: index === 0 ? 2 : 4,
        wrong_guesses: 0,
        recovery_wrong_guesses: 0,
      })),
    },
    resultDetail: {
      rounds: rounds.map((round, index) => ({
        round: index + 1,
        score: index === 0 ? 100 : 95,
        outcome: "natural",
        revealed_count: index === 0 ? 2 : 4,
        wrong_guesses: 0,
        recovery_wrong_guesses: 0,
        identity: { id: officialRounds[index]!.hiddenSubject.id, name: officialRounds[index]!.hiddenSubject.name },
        clues: officialRounds[index]!.clues.map((clue) => ({ id: clue.id, text: clue.text })),
        ...round,
      })),
    },
    completedAt: "2026-10-19T18:00:00Z",
  };
}

describe("MLB Who Am I canonical leaderboard replay", () => {
  it("renders saved identities, seen clues, and exact natural picks through the shared Football/UFC model", () => {
    const entry = completedEntry([
      { natural_guesses: [MLB_WHO_AM_I_PRODUCTION_ROUNDS[0].hiddenSubject.id], recovery_choices: [], recovery_guesses: [] },
      { natural_guesses: [MLB_WHO_AM_I_PRODUCTION_ROUNDS[1].hiddenSubject.id], recovery_choices: [], recovery_guesses: [] },
    ]);
    const view = mlbWhoAmIResultProjection(entry, "mlb-2026-play-04", "2026-10-03");
    expect(view).not.toBeNull();
    expect(view!.resultDetail.guess_history_unavailable).toBe(false);
    const rounds = buildWhoAmILeaderboardRounds(view!.projection, view!.resultDetail);
    expect(rounds).toHaveLength(2);
    expect(rounds.map((round) => round.score)).toEqual([100, 95]);
    expect(rounds[0]!.identityName).toBe("Ken Griffey Jr.");
    expect(rounds[0]!.naturalGuesses).toEqual([{
      id: MLB_WHO_AM_I_PRODUCTION_ROUNDS[0].hiddenSubject.id,
      name: "Ken Griffey Jr.",
      correct: true,
    }]);
    expect(rounds[0]!.clues.filter((clue) => clue.seen)).toHaveLength(2);
    expect(rounds[0]!.clues).toHaveLength(10);
  });

  it("shows legacy October 19 scores, identities and clues without inventing unsaved guesses", () => {
    const entry = completedEntry([{}, {}], MLB_WHO_AM_I_SECOND_PRODUCTION_ROUNDS);
    const view = mlbWhoAmIResultProjection(entry, "mlb-2026-play-14", "2026-10-19");
    expect(view).not.toBeNull();
    expect(view!.resultDetail.guess_history_unavailable).toBe(true);
    const rounds = buildWhoAmILeaderboardRounds(view!.projection, view!.resultDetail);
    expect(rounds.map((round) => round.identityName)).toEqual(["Mariano Rivera", "Ichiro Suzuki"]);
    expect(rounds[0]!.naturalGuesses).toEqual([]);
    expect(rounds[1]!.clues.filter((clue) => clue.seen)).toHaveLength(4);
    expect(view!.projection.officialAttempt?.normalizedScore).toBe(98);
  });

  it("does not build a replay for the wrong challenge date or different game type", () => {
    const entry = completedEntry([{}, {}]);
    expect(mlbWhoAmIResultProjection(entry, "mlb-2026-play-14", "2026-10-18")).toBeNull();
    expect(mlbWhoAmIResultProjection({ ...entry, gameType: "millionaire" }, "mlb-2026-play-04", "2026-10-03")).toBeNull();
  });
});
