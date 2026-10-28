import type { TodayChallengeProjection } from "../play/todayChallengeRepository";
import type { MlbPlayChallengeLeaderboardEntry } from "./mlbPlayChallenge";
import { mlbBarTriviaProductionConfig } from "./mlbBarTriviaProduction";

/**
 * Reuse the same question-by-question Bar Trivia result screen as Football/UFC.
 * The authored run is fixed to the challenge ID and Central day, not the next
 * scheduled challenge. Only completed leaderboard entries use this projection.
 */
export function mlbBarTriviaResultProjection(
  entry: MlbPlayChallengeLeaderboardEntry,
  challengeKey: string,
  challengeDate: string,
): TodayChallengeProjection | null {
  const config = mlbBarTriviaProductionConfig(challengeKey, challengeDate);
  if (!config || entry.gameType !== "bar_trivia") return null;

  return {
    available: true,
    id: "00000000-0000-4000-8000-000000000000",
    centralDay: challengeDate,
    scheduleVersion: challengeKey,
    gameType: "bar_trivia",
    setupKey: challengeKey,
    contentVersion: challengeKey,
    scoringVersion: "bar-trivia-v1",
    fallbackReason: null,
    publicSetup: { league: "mlb", question_count: config.run.length },
    progressRevision: 0,
    publicState: { complete: true },
    revealSetup: {
      league: "mlb",
      questions: config.run.map((question) => ({
        id: question.id,
        round: question.round,
        category: question.category,
        prompt: question.prompt,
        choices: [...question.choices],
        answer: question.answer,
        explanation: question.explanation,
      })),
    },
    officialAttempt: {
      nativeScore: entry.rawScore,
      normalizedScore: entry.rawScore,
      completedAt: entry.completedAt,
      publicResult: entry.publicResult,
    },
    deploymentSha: "mlb-postseason",
  };
}
