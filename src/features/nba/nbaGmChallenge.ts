import type { ChallengeJson, PlayChallenge } from "../challenges/challengeModel";
import type { NbaGmDevRun } from "./nbaGmDevModel";

/** A compact, immutable snapshot of the server-scored franchise. */
export function nbaGmChallengeResult(run: NbaGmDevRun): ChallengeJson | null {
  // Current NBA GM scoring is V13. Do not invite a new V13 opponent to beat a legacy score.
  if (run.simulationModelVersion !== 13) return null;
  if (run.phase !== "final" || !run.scoreBreakdown || run.results.length !== 3) return null;
  return {
    score: run.scoreBreakdown.score,
    modelVersion: run.simulationModelVersion ?? null,
    seed: run.seed,
    roster: run.scoreBreakdown.roster,
    record: run.scoreBreakdown.regularSeason,
    playoffs: run.scoreBreakdown.playoffs,
    seasons: run.results.map((season) => ({
      year: season.season,
      overall: season.teamOverall ?? Math.round((season.offense + season.defense) / 2),
      wins: season.wins,
      losses: season.losses,
      finish: season.finish,
    })),
  };
}

export function nbaGmChallengeStorageKey(profileId: string, challengeCode: string) {
  return `nba-gm-match:${profileId}:${challengeCode}`;
}

/** A previously completed or unrelated solo run must never fulfill an invitation. */
export function nbaGmCanSubmitChallenge(
  challenge: PlayChallenge | null,
  run: NbaGmDevRun | null,
  acceptedSeed: string,
) {
  if (!challenge || challenge.gameId !== "gm-nba" || challenge.responderResult !== null
    || challenge.completedAt || challenge.declinedAt || !run || !acceptedSeed || run.seed !== acceptedSeed) return false;
  if (!nbaGmChallengeResult(run)) return false;
  const setup = challenge.setup;
  if (!setup || typeof setup !== "object" || Array.isArray(setup)) return false;
  return typeof setup.modelVersion === "number"
    && run.simulationModelVersion === setup.modelVersion;
}
