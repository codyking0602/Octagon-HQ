import { advanceTwoGameDailyRuntime, isTwoGameDailyContext } from "./dailyTwoGameRuntime";
import type { OfficialDailyAdvanceResult, OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";
type JsonRecord = Record<string, unknown>;
function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Football daily evidence must be an object.");
  return value as JsonRecord;
}
function recordArray(value: unknown, label: string): JsonRecord[] {
  if (!Array.isArray(value) || value.some(row => !row || typeof row !== "object" || Array.isArray(row))) throw new Error(`${label} must be an object array.`);
  return value as JsonRecord[];
}
function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some(row => typeof row !== "string")) throw new Error(`${label} must be a string array.`);
  return value as string[];
}

export function advanceFindLeader(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const candidateIds = stringArray(context.privateSetupEvidence.candidate_ids, "Football Find the Leader candidates");
  const leaderId = String(context.privateSetupEvidence.leader_id ?? "");
  const prior = stringArray(context.submissionState.eliminated_ids ?? [], "Football Find the Leader progress");
  const eliminatedId = String(action.eliminated_id ?? "");
  if (!candidateIds.includes(eliminatedId) || prior.includes(eliminatedId)) throw new Error("That subject cannot be eliminated.");
  const eliminated = [...prior, eliminatedId];
  const complete = eliminatedId === leaderId || eliminated.length === candidateIds.length - 1;
  const finalSubmission = complete ? { eliminated_ids: eliminated } : null;
  const revealedCandidates = recordArray(context.revealSetup.candidates, "Football Find the Leader reveal candidates")
    .filter((candidate) => eliminated.includes(String(candidate.id ?? "")) && String(candidate.id ?? "") !== leaderId)
    .map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      subtitle: candidate.subtitle,
      value: candidate.value,
    }));
  return {
    submissionState: { eliminated_ids: eliminated, final_submission: finalSubmission },
    publicState: {
      complete,
      eliminated_ids: eliminated,
      native_progress: complete && eliminatedId !== leaderId ? 10 : eliminated.length,
      revealed_candidates: revealedCandidates,
    },
    complete,
    finalSubmission,
  };
}


export function scoreFindLeader(_context: OfficialDailyRuntimeContext, advanced: OfficialDailyAdvanceResult) {
  return Number(advanced.publicState.native_progress ?? 0) * 10;
}

// The NBA Find the Leader board uses the canonical Football elimination grader.
export function advanceFindLeaderOnlyDailyRuntime(context: OfficialDailyRuntimeContext, action: unknown) {
  if (context.gameType !== "find_leader") throw new Error("Daily Find the Leader game identity mismatch.");
  // NBA has two Find-the-Leader boards. Preserve the canonical two-game
  // transition, per-child scoring, and final average instead of short-circuiting.
  const single = (child: OfficialDailyRuntimeContext, nextAction: unknown) => advanceFindLeader(child, asRecord(nextAction));
  return isTwoGameDailyContext(context)
    ? advanceTwoGameDailyRuntime(context, action, single, scoreFindLeader)
    : single(context, action);
}

