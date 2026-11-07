import { describe, expect, it } from "vitest";
import { nbaGmCanSubmitChallenge, nbaGmChallengeResult, nbaGmChallengeStorageKey } from "./nbaGmChallenge";
import type { NbaGmDevRun } from "./nbaGmDevModel";
import type { PlayChallenge } from "../challenges/challengeModel";

const run = {
  version: "nba-gm-dev-v2", phase: "final", seed: "nba-gm-test-123",
  simulationModelVersion: 13, results: [
    { season: 1, wins: 58, losses: 24, offense: 90, defense: 88, positionalFit: 86, finish: "Champion", teamOverall: 92 },
    { season: 2, wins: 57, losses: 25, offense: 89, defense: 88, positionalFit: 85, finish: "Champion", teamOverall: 91 },
    { season: 3, wins: 59, losses: 23, offense: 91, defense: 88, positionalFit: 85, finish: "Champion", teamOverall: 93 },
  ],
  scoreBreakdown: { score: 92.4, roster: 92, regularSeason: 88.3, playoffs: 100, weights: [0.9, 0.03, 0.07] },
} as NbaGmDevRun;

const challenge = {
  code: "ABCD1234", gameId: "gm-nba", gameVersion: "nba-gm-v13",
  gameTitle: "NBA GM", summary: "NBA franchise",
  setup: { modelVersion: 13 }, creatorResult: { score: 92.4 }, responderResult: null,
  createdAt: "2026-11-06", expiresAt: "2026-11-13", completedAt: null, declinedAt: null,
} as PlayChallenge;

describe("NBA GM profile challenges", () => {
  it("snapshots the final server score and three seasons", () => {
    expect(nbaGmChallengeResult(run)).toMatchObject({
      score: 92.4, modelVersion: 13, seasons: [
        { year: 1, overall: 92, wins: 58, finish: "Champion" },
        { year: 2, overall: 91, wins: 57, finish: "Champion" },
        { year: 3, overall: 93, wins: 59, finish: "Champion" },
      ],
    });
  });

  it("never submits a prior solo run or a score from another scoring version", () => {
    expect(nbaGmCanSubmitChallenge(challenge, run, "")).toBe(false);
    expect(nbaGmCanSubmitChallenge(challenge, run, "nba-gm-old-run")).toBe(false);
    expect(nbaGmCanSubmitChallenge(challenge, run, run.seed)).toBe(true);
    expect(nbaGmCanSubmitChallenge({ ...challenge, setup: { modelVersion: 12 } }, run, run.seed)).toBe(false);
    expect(nbaGmCanSubmitChallenge({ ...challenge, responderResult: { score: 50 } }, run, run.seed)).toBe(false);
    expect(nbaGmCanSubmitChallenge(challenge, { ...run, phase: "offseason" }, run.seed)).toBe(false);
  });

  it("isolates accepted franchise seeds for each profile and challenge", () => {
    expect(nbaGmChallengeStorageKey("one", "CODE")).not.toBe(nbaGmChallengeStorageKey("two", "CODE"));
    expect(nbaGmChallengeStorageKey("one", "CODE")).not.toBe(nbaGmChallengeStorageKey("one", "OTHER"));
  });
});
