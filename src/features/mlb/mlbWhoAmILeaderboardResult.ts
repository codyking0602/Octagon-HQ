import type { TodayChallengeProjection } from "../play/todayChallengeRepository";
import {
  OFFICIAL_DAILY_RUNTIME_VERSION,
  OFFICIAL_DAILY_SCORING_VERSION,
} from "../play/todaysChallengeRuntime";
import { buildTwoRoundWhoAmIDailyPublication } from "../play/whoAmITwoRoundDailyRuntime";
import type { MlbPlayChallengeLeaderboardEntry } from "./mlbPlayChallenge";
import { mlbWhoAmIProductionConfig } from "./mlbWhoAmIProduction";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

/**
 * Baseball postseason games use a separate standings RPC, but should open
 * through exactly the same completed Who Am I viewer as Football and UFC.
 * Use the immutable challenge configuration for the original candidate names
 * and saved completed-game evidence for identities/clues/guesses.
 */
export function mlbWhoAmIResultProjection(
  entry: MlbPlayChallengeLeaderboardEntry,
  challengeKey: string,
  challengeDate: string,
): { projection: TodayChallengeProjection; resultDetail: JsonRecord } | null {
  if (entry.gameType !== "who_am_i") return null;
  const config = mlbWhoAmIProductionConfig(challengeKey, challengeDate);
  if (!config) return null;

  const publication = buildTwoRoundWhoAmIDailyPublication(
    [
      { round: config.rounds[0], scriptId: config.scriptIds[0] },
      { round: config.rounds[1], scriptId: config.scriptIds[1] },
    ],
    config.challengeDate,
    config.scheduleVersion,
    OFFICIAL_DAILY_RUNTIME_VERSION,
    OFFICIAL_DAILY_SCORING_VERSION,
  );
  const savedRounds = records(entry.resultDetail.rounds);
  const publishedRevealRounds = records(publication.revealSetup.rounds);
  const revealRounds = publishedRevealRounds.map((authored, index) => {
    const saved = savedRounds[index] ?? {};
    const savedIdentity = record(saved.identity);
    // Honor the actual completed result, not a future editorial refresh.
    return {
      ...authored,
      identity: typeof savedIdentity.name === "string" && savedIdentity.name
        ? savedIdentity
        : authored.identity,
      clues: Array.isArray(saved.clues) ? saved.clues : authored.clues,
    };
  });
  const resultRounds = records(entry.publicResult.rounds);
  const resultDetail = {
    ...entry.resultDetail,
    // Legacy MLB result rows predate guess-path retention. Never invent picks.
    guess_history_unavailable: savedRounds.some((round) => !Array.isArray(round.natural_guesses)),
  };

  return {
    projection: {
      available: true,
      id: challengeKey,
      centralDay: challengeDate,
      scheduleVersion: config.scheduleVersion,
      gameType: "who_am_i",
      setupKey: publication.setupKey,
      contentVersion: publication.contentVersion,
      scoringVersion: publication.scoringVersion,
      fallbackReason: null,
      publicSetup: publication.publicSetup,
      progressRevision: 0,
      publicState: { complete: true, phase: "result" },
      revealSetup: { ...publication.revealSetup, rounds: revealRounds },
      officialAttempt: {
        nativeScore: entry.rawScore,
        normalizedScore: entry.rawScore,
        completedAt: entry.completedAt,
        publicResult: {
          ...entry.publicResult,
          rounds: resultRounds.length ? resultRounds : savedRounds,
        },
      },
      deploymentSha: "mlb-who-am-i-production",
    },
    resultDetail,
  };
}
