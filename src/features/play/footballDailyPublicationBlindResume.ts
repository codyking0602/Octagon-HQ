import {
  buildFootballBlindResumeRounds,
  footballBlindResumeRevealStage,
  FOOTBALL_BLIND_RESUME_CORRECT_POINTS,
  FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES,
  FOOTBALL_BLIND_RESUME_MISS_POINTS,
} from "../back-room/footballBlindResumeModel";
import type {
  OfficialDailyGameType,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";
import {
  FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION,
  FOOTBALL_BLIND_RESUME_DAILY_SCORING_VERSION,
  FOOTBALL_DAILY_RUNTIME_VERSION,
  persistenceSetup,
} from "./footballDailyPublicationShared";

type JsonRecord = Record<string, unknown>;

function recordArray(value: unknown, label: string) {
  if (!Array.isArray(value) || value.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new Error(`${label} must be an object array.`);
  }
  return value as JsonRecord[];
}

function blindResumeRevealCounts(round: JsonRecord): readonly [number, number, number] {
  const raw = round.reveal_counts;
  if (!Array.isArray(raw) || raw.length !== 3 || raw.some((value) => !Number.isInteger(value))) {
    throw new Error("Football Blind Resume reveal stages are invalid.");
  }
  const counts = raw.map(Number) as [number, number, number];
  if (!(counts[0] > 0 && counts[0] < counts[1] && counts[1] < counts[2])) {
    throw new Error("Football Blind Resume reveal stages must increase.");
  }
  return counts;
}

function visibleBlindResumeRound(round: JsonRecord, revealedCount: number) {
  const allStats = recordArray(round.stats, "Football Blind Resume stats");
  const revealCounts = blindResumeRevealCounts(round);
  const stage = footballBlindResumeRevealStage({ revealCounts }, revealedCount);
  return {
    prompt: round.prompt,
    league: round.league,
    context_label: round.context_label,
    revealed_count: revealedCount,
    reveal_stage: stage + 1,
    reveal_counts: [...revealCounts],
    max_revealed_count: allStats.length,
    stats: allStats.slice(0, revealedCount),
  };
}

function buildBlindResumeSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const rounds = buildFootballBlindResumeRounds(
    `${FOOTBALL_DAILY_RUNTIME_VERSION}|blind-resume|${scheduleVersion}|${day}`,
    FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES,
  );
  const privateRounds = rounds.map((round) => ({
    id: round.id,
    prompt: round.prompt,
    league: round.league,
    context_label: round.contextLabel,
    left_id: round.leftId,
    right_id: round.rightId,
    left_name: round.leftName,
    right_name: round.rightName,
    left_subtitle: round.leftSubtitle,
    right_subtitle: round.rightSubtitle,
    winner_id: round.winnerId,
    reveal_counts: [...round.revealCounts],
    stats: round.stats.map((stat) => ({
      label: stat.label,
      value_a: stat.valueA,
      value_b: stat.valueB,
    })),
  }));
  const scoringLadder = FOOTBALL_BLIND_RESUME_CORRECT_POINTS.map((correct, index) => ({
    stage: index + 1,
    correct,
    wrong: FOOTBALL_BLIND_RESUME_MISS_POINTS[index],
  }));
  const openingCount = blindResumeRevealCounts(privateRounds[0]!)[0];
  return {
    setupKey: `${FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION}:${scheduleVersion}:${day}`,
    contentVersion: FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION,
    scoringVersion: FOOTBALL_BLIND_RESUME_DAILY_SCORING_VERSION as OfficialDailySetupPublication["scoringVersion"],
    publicSetup: {
      runtime_version: FOOTBALL_DAILY_RUNTIME_VERSION,
      round_count: privateRounds.length,
      scoring_ladder: scoringLadder,
      league_mix: rounds.reduce<Record<string, number>>(
        (acc, round) => ({ ...acc, [round.league]: (acc[round.league] ?? 0) + 1 }),
        {},
      ),
      initial_state: {
        complete: false,
        round_index: 0,
        results: [],
        raw_points: 0,
        current_round: visibleBlindResumeRound(privateRounds[0]!, openingCount),
      },
    },
    revealSetup: {},
    privateSetupEvidence: { rounds: privateRounds },
    privateGradingEvidence: { correct_choices: rounds.map((round) => round.winnerId) },
  };
}

export function buildFootballDailyPersistenceSetup(
  day: string,
  scheduleVersion: string,
  gameType: OfficialDailyGameType,
) {
  if (gameType !== "blind_resume") throw new Error("Football Blind Resume publication runtime received the wrong game type.");
  return persistenceSetup(gameType, day, scheduleVersion, buildBlindResumeSetup(day, scheduleVersion));
}
