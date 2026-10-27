// Canonical persisted-board-only UFC evaluators. Never import publication game banks.
import type { OfficialDailyRuntimeContext, OfficialDailyAdvanceResult } from "./todaysChallengeRuntime";
import { seededLineupRandom } from "./lineupModel";
import { WAVELENGTH_CONTRACT_VERSIONS, nextWavelengthClue, wavelengthClues, wavelengthScore, type WavelengthRecentHistory, type WavelengthRound } from "./wavelengthEngine";
import { advanceTwoGameDailyRuntime, isTwoGameDailyContext } from "./dailyTwoGameRuntime";
type JsonRecord = Record<string, unknown>;
// The production publication seed is immutable for existing UFC boards.
const OFFICIAL_DAILY_RUNTIME_VERSION = "official-daily-runtime-v1";
function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Official daily runtime evidence must be an object.");
  return value as JsonRecord;
}
function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) throw new Error(`${label} must be a string array.`);
  return value as string[];
}
function integer(value: unknown, label: string, min: number, max: number): number {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) throw new Error(`${label} must be an integer from ${min} through ${max}.`);
  return value as number;
}
function integerArray(value: unknown, label: string, min: number, max: number) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an integer array.`);
  return value.map((item) => integer(item, label, min, max));
}
function cluePresentation(clue: { id: string; category: string; text: string }) { return { id: clue.id, category: clue.category, text: clue.text }; }

export function advanceUfcFindLeader(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const evidence = context.privateSetupEvidence;
  const candidateIds = stringArray(evidence.candidate_ids, "Find the Leader candidate ids");
  const leaderId = String(evidence.leader_id ?? "");
  const prior = stringArray(context.submissionState.eliminated_ids ?? [], "Find the Leader progress");
  const eliminatedId = String(action.eliminated_id ?? "");
  if (!candidateIds.includes(eliminatedId)) throw new Error("That fighter is not on the official board.");
  if (prior.includes(eliminatedId)) throw new Error("That fighter has already been eliminated.");
  const eliminatedIds = [...prior, eliminatedId];
  const complete = eliminatedId === leaderId || eliminatedIds.length === candidateIds.length - 1;
  const finalSubmission = complete ? { eliminated_ids: eliminatedIds } : null;
  return {
    submissionState: { eliminated_ids: eliminatedIds, final_submission: finalSubmission },
    publicState: {
      complete,
      eliminated_ids: eliminatedIds,
      native_progress: complete && eliminatedId !== leaderId ? 10 : eliminatedIds.length,
    },
    complete,
    finalSubmission,
  };
}

function wavelengthClueFor(id: string) {
  const clue = wavelengthClues.find((row) => row.id === id);
  if (!clue) throw new Error(`Official Wavelength clue ${id} is unavailable.`);
  return clue;
}

function wavelengthRecentHistoryFromEvidence(evidence: JsonRecord): WavelengthRecentHistory {
  const targets = integerArray(evidence.recent_targets ?? [], "Wavelength recent targets", 1, 100);
  const clueIds = stringArray(evidence.recent_clue_ids ?? [], "Wavelength recent clue ids");
  return {
    targets,
    clueIds,
    categories: [...new Set(clueIds.map((id) => wavelengthClueFor(id).category))],
    clueSequenceKeys: stringArray(
      evidence.recent_clue_sequence_keys ?? [],
      "Wavelength recent clue sequence keys",
    ),
  };
}

export function advanceUfcWavelength(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const target = integer(context.privateSetupEvidence.target, "Wavelength target", 1, 100);
  const priorGuesses = Array.isArray(context.submissionState.guesses)
    ? context.submissionState.guesses.map((value) => integer(value, "Wavelength guess", 1, 100))
    : [];
  if (priorGuesses.length >= 4) throw new Error("The official Wavelength round is already complete.");
  const guess = integer(action.guess, "Wavelength guess", 1, 100);
  const guesses = [...priorGuesses, guess];
  const openingClueId = String(context.privateSetupEvidence.opening_clue_id ?? "");
  const priorClueIds = stringArray(context.submissionState.clue_ids ?? [openingClueId], "Wavelength clue ids");
  let clueIds = [...priorClueIds];

  if (guesses.length < 4) {
    const round: WavelengthRound = {
      target,
      clues: clueIds.map(wavelengthClueFor),
      versions: WAVELENGTH_CONTRACT_VERSIONS,
    };
    const random = seededLineupRandom(
      OFFICIAL_DAILY_RUNTIME_VERSION,
      context.setupKey,
      "clue",
      guesses.join(","),
      guesses.length,
    );
    const nextClue = nextWavelengthClue(
      round,
      guess,
      guesses.length,
      random,
      wavelengthRecentHistoryFromEvidence(context.privateSetupEvidence),
    );
    clueIds = [...clueIds, nextClue.id];
  }

  const complete = guesses.length === 4;
  const finalSubmission = complete ? { guesses } : null;
  return {
    submissionState: { guesses, clue_ids: clueIds, final_submission: finalSubmission },
    publicState: {
      complete,
      guesses,
      clues: clueIds.map((id) => cluePresentation(wavelengthClueFor(id))),
      next_guess_number: complete ? null : guesses.length + 1,
      reveal: complete
        ? {
            target,
            clues: clueIds.map((id) => {
              const clue = wavelengthClueFor(id);
              return { ...cluePresentation(clue), rating: clue.rating };
            }),
          }
        : null,
    },
    complete,
    finalSubmission,
  };
}


export function advanceUfcFindLeaderOnlyDailyRuntime(context: OfficialDailyRuntimeContext, action: unknown): OfficialDailyAdvanceResult {
  if (context.gameType !== "find_leader") throw new Error("UFC Find the Leader game identity mismatch.");
  const advance = (child: OfficialDailyRuntimeContext, next: unknown) => advanceUfcFindLeader(child, asRecord(next));
  return isTwoGameDailyContext(context)
    ? advanceTwoGameDailyRuntime(context, action, advance, (_child, result) => Number(result.publicState.native_progress ?? 0) * 10)
    : advance(context, action);
}
export function advanceUfcWavelengthOnlyDailyRuntime(context: OfficialDailyRuntimeContext, action: unknown): OfficialDailyAdvanceResult {
  if (context.gameType !== "wavelength") throw new Error("UFC Wavelength game identity mismatch.");
  const advance = (child: OfficialDailyRuntimeContext, next: unknown) => advanceUfcWavelength(child, asRecord(next));
  const score = (child: OfficialDailyRuntimeContext, result: OfficialDailyAdvanceResult) => {
    const guesses = result.submissionState.guesses;
    const last = Array.isArray(guesses) ? guesses.at(-1) : null;
    const target = Number(child.privateSetupEvidence.target);
    if (!Number.isFinite(Number(last)) || !Number.isFinite(target) || last == null) throw new Error("Two-game Wavelength score evidence is unavailable.");
    return wavelengthScore(Number(last), target);
  };
  return isTwoGameDailyContext(context)
    ? advanceTwoGameDailyRuntime(context, action, advance, score)
    : advance(context, action);
}
