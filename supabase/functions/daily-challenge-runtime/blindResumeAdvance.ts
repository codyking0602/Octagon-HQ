// Lightweight, server-only Blind Resume V3 advance path.
// The official board and fighter presentations were already materialized and
// stored by the canonical Daily publisher. Never load the full UFC content
// generator to reveal stats or record a player's pick.
type JsonRecord = Record<string, unknown>;
export interface PersistedBlindResumeContext {
  setupKey: string;
  privateSetupEvidence: JsonRecord;
  revealSetup: JsonRecord;
  submissionState: JsonRecord;
  publicState: JsonRecord;
}
export interface BlindResumeAdvanceResult {
  submissionState: JsonRecord;
  publicState: JsonRecord;
  complete: boolean;
  finalSubmission: JsonRecord | null;
}

function record(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as JsonRecord;
}
function rows(value: unknown, label: string): JsonRecord[] {
  if (!Array.isArray(value) || value.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
    throw new Error(`${label} must be an object array.`);
  }
  return value as JsonRecord[];
}
const revealCounts = [2, 4, 6, 8] as const;
const correctPoints = [20, 19, 18, 17] as const;
const missPoints = [2, 4, 6, 8] as const;
function stage(revealedCount: number) {
  const index = revealCounts.indexOf(revealedCount as 2 | 4 | 6 | 8);
  if (index < 0) throw new Error("Blind Resume V3 reveal count must be 2, 4, 6, or 8.");
  return index;
}
function publicRound(round: JsonRecord, revealedCount: number) {
  const roundIndex = Number(round.round_index);
  if (!Number.isInteger(roundIndex) || roundIndex < 0 || roundIndex >= 5) {
    throw new Error("Blind Resume V3 round index must be from 0 through 4.");
  }
  const index = stage(revealedCount);
  const stats = rows(round.stats, "Blind Resume V3 stats");
  return {
    round_index: roundIndex,
    round_number: roundIndex + 1,
    fighter_a_label: "FIGHTER A",
    fighter_b_label: "FIGHTER B",
    revealed_count: revealedCount,
    correct_points: correctPoints[index],
    miss_points: missPoints[index],
    stats: stats.map((stat, statIndex) => ({
      label: String(stat.label ?? "STAT"),
      revealed: statIndex < revealedCount,
      value_a: statIndex < revealedCount ? String(stat.value_a ?? "") : null,
      value_b: statIndex < revealedCount ? String(stat.value_b ?? "") : null,
    })),
  };
}

export function advancePersistedBlindResumeV3(
  context: PersistedBlindResumeContext,
  action: unknown,
): BlindResumeAdvanceResult {
  if (!context.setupKey.startsWith("blind-resume-v3:")) {
    throw new Error("Only the published Blind Resume V3 board uses this advance path.");
  }
  const request = record(action, "Blind Resume V3 action");
  const rounds = rows(context.privateSetupEvidence.rounds, "Blind Resume V3 rounds");
  const answers = rows(context.submissionState.answers ?? [], "Blind Resume V3 answers");
  if (answers.length >= rounds.length) throw new Error("The official Blind Resume card is already complete.");
  const round = rounds[answers.length]!;
  const current = record(context.publicState.current_round, "Blind Resume V3 current round");
  const revealedCount = Number(current.revealed_count);
  const currentStage = stage(revealedCount);
  const results = rows(context.publicState.results ?? [], "Blind Resume V3 public results");

  if (request.reveal === true) {
    if (revealedCount >= 8) throw new Error("All Blind Resume stats are already revealed.");
    return {
      submissionState: { answers, final_submission: null },
      publicState: {
        complete: false,
        round_index: answers.length,
        results,
        current_round: publicRound(round, revealedCount + 2),
      },
      complete: false,
      finalSubmission: null,
    };
  }

  const side = String(request.choice ?? "").toUpperCase();
  if (side !== "A" && side !== "B") throw new Error("Blind Resume choice must be A or B.");
  const fighterAId = String(round.fighter_a_id ?? "");
  const fighterBId = String(round.fighter_b_id ?? "");
  const winnerId = String(round.winner_id ?? "");
  const pickedId = side === "A" ? fighterAId : fighterBId;
  const correct = pickedId === winnerId;
  const nextAnswers = [...answers, { choice: pickedId, revealed_count: revealedCount }];

  // The publisher persisted these exact fighter identity snapshots before play.
  // This avoids constructing/importing the full UFC fighter corpus on every tap.
  const revealRounds = rows(context.revealSetup.rounds, "Blind Resume V3 reveal rounds");
  const reveal = record(revealRounds[answers.length], "Blind Resume V3 reveal round");
  const fighterA = record(reveal.fighter_a, "Blind Resume V3 fighter A");
  const fighterB = record(reveal.fighter_b, "Blind Resume V3 fighter B");
  if (fighterA.id !== fighterAId || fighterB.id !== fighterBId || reveal.winner_id !== winnerId) {
    throw new Error("Published Blind Resume V3 reveal identities do not match official evidence.");
  }
  const nextResults = [...results, {
    round_index: answers.length,
    picked_side: side,
    picked_id: pickedId,
    winner_id: winnerId,
    correct,
    revealed_count: revealedCount,
    points_awarded: correct ? correctPoints[currentStage] : missPoints[currentStage],
    fighter_a: fighterA,
    fighter_b: fighterB,
  }];
  const complete = nextAnswers.length === rounds.length;
  const finalSubmission = complete ? { answers: nextAnswers } : null;
  return {
    submissionState: { answers: nextAnswers, final_submission: finalSubmission },
    publicState: {
      complete,
      round_index: complete ? rounds.length : nextAnswers.length,
      results: nextResults,
      current_round: complete ? null : publicRound(rounds[nextAnswers.length]!, 2),
    },
    complete,
    finalSubmission,
  };
}
