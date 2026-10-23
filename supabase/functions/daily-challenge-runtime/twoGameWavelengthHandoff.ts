/**
 * A Wavelength Daily has already persisted Game 2 when handoff_pending is set.
 * Acknowledge START GAME 2 without importing the full UFC/Football rules bundle.
 * This must mirror dailyTwoGameRuntime's handoff branch exactly.
 */
type JsonRecord = Record<string, unknown>;

export interface WavelengthHandoffContext {
  gameType: string;
  privateSetupEvidence: JsonRecord;
  submissionState: JsonRecord;
  publicState: JsonRecord;
}

function record(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

export function advanceWavelengthHandoff(context: WavelengthHandoffContext, action: unknown) {
  if (
    context.gameType !== "wavelength"
    || context.privateSetupEvidence.format_version !== "daily-two-game-average-v1"
    || context.publicState.handoff_pending !== true
  ) return null;

  const children = context.privateSetupEvidence.rounds;
  const savedRounds = context.submissionState.rounds ?? [];
  const completed = context.publicState.completed_rounds ?? [];
  const scores = context.publicState.round_scores ?? [];
  const index = context.publicState.round_index;
  if (
    record(action)?.type !== "next_game"
    || context.publicState.complete === true
    || index !== 1
    || !Array.isArray(children) || children.length !== 2 || children.some((child) => !record(child))
    || !Array.isArray(savedRounds) || savedRounds.some((round) => !record(round))
    || !Array.isArray(completed) || completed.length !== 1 || completed.some((round) => !record(round))
    || !Array.isArray(scores) || scores.length !== 1 || !Number.isFinite(Number(scores[0]))
  ) {
    throw new Error("Finish the Wavelength Game 1 handoff before continuing.");
  }

  return {
    submissionState: { rounds: savedRounds, final_submission: null },
    publicState: { ...context.publicState, handoff_pending: false },
    complete: false as const,
    finalSubmission: null,
  };
}
