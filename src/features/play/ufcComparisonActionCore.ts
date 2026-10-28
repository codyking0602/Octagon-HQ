// UFC blind-rank and keep/cut actions run against the persisted fighter IDs.
// Single canonical action and presentation source; no game publication imports.
import { getPlayFighter, type PlayFighter } from "./playFighterPool";
import type { OfficialDailyRuntimeContext, OfficialDailyAdvanceResult } from "./todaysChallengeRuntime";
type JsonRecord = Record<string, unknown>;
function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) throw new Error(`${label} must be a string array.`);
  return value as string[];
}
function recordArray(value: unknown, label: string): JsonRecord[] {
  if (!Array.isArray(value) || value.some((item) => !item || typeof item !== "object" || Array.isArray(item))) throw new Error(`${label} must be an object array.`);
  return value as JsonRecord[];
}
function integer(value: unknown, label: string, min: number, max: number): number {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) throw new Error(`${label} must be an integer from ${min} through ${max}.`);
  return value as number;
}
function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Official daily runtime evidence must be an object.");
  return value as JsonRecord;
}
export function fighterPresentation(fighter: PlayFighter) {
  return {
    id: fighter.id,
    name: fighter.name,
    gender: fighter.gender,
    divisions: [...fighter.divisions],
    main_era: fighter.mainEra,
    thumb_url: fighter.thumbUrl,
    profile_url: fighter.profileUrl,
  };
}

export function fighterFor(id: string) {
  const fighter = getPlayFighter(id);
  if (!fighter) throw new Error(`Official daily fighter ${id} is unavailable.`);
  return fighter;
}

export function advanceBlindRank(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const fighterIds = stringArray(context.privateSetupEvidence.fighter_ids, "Blind Rank fighter ids");
  const assignments = recordArray(context.submissionState.assignments ?? [], "Blind Rank assignments");
  if (assignments.length >= fighterIds.length) throw new Error("The official Blind Rank card is already complete.");
  const slot = integer(action.slot, "Blind Rank slot", 1, 5);
  if (assignments.some((assignment) => assignment.slot === slot)) {
    throw new Error("That Blind Rank slot is already locked.");
  }
  const fighterId = fighterIds[assignments.length]!;
  const nextAssignments = [...assignments, { fighter_id: fighterId, slot }];
  const slots = Array.from({ length: 5 }, () => null as ReturnType<typeof fighterPresentation> | null);
  for (const assignment of nextAssignments) {
    const assignedSlot = integer(assignment.slot, "Stored Blind Rank slot", 1, 5);
    slots[assignedSlot - 1] = fighterPresentation(fighterFor(String(assignment.fighter_id ?? "")));
  }
  const complete = nextAssignments.length === fighterIds.length;
  const orderedIds = complete
    ? [...nextAssignments]
        .sort((left, right) => Number(left.slot) - Number(right.slot))
        .map((assignment) => String(assignment.fighter_id))
    : null;
  const finalSubmission = orderedIds ? { ordered_ids: orderedIds } : null;

  return {
    submissionState: { assignments: nextAssignments, final_submission: finalSubmission },
    publicState: {
      complete,
      reveal_index: nextAssignments.length,
      slots,
      current_fighter: complete ? null : fighterPresentation(fighterFor(fighterIds[nextAssignments.length]!)),
      reveal: complete ? context.revealSetup : null,
    },
    complete,
    finalSubmission,
  };
}

export function advanceKeepCut(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const fighterIds = stringArray(context.privateSetupEvidence.fighter_ids, "Keep Cut fighter ids");
  const choices = stringArray(context.submissionState.choices ?? [], "Keep Cut choices");
  if (choices.length >= fighterIds.length) throw new Error("The official Keep Cut board is already complete.");
  const choice = String(action.choice ?? "").toLowerCase();
  if (choice !== "keep" && choice !== "cut") throw new Error("Keep Cut choice must be keep or cut.");
  const keptCount = choices.filter((row) => row === "keep").length;
  const cutCount = choices.filter((row) => row === "cut").length;
  if (choice === "keep" && keptCount >= 4) throw new Error("Keep is full; this fighter must be cut.");
  if (choice === "cut" && cutCount >= 4) throw new Error("Cut is full; this fighter must be kept.");

  const nextChoices = [...choices, choice];
  const decidedIds = fighterIds.slice(0, nextChoices.length);
  const keptIds = decidedIds.filter((_id, index) => nextChoices[index] === "keep");
  const cutIds = decidedIds.filter((_id, index) => nextChoices[index] === "cut");
  const complete = nextChoices.length === fighterIds.length;
  if (complete && (keptIds.length !== 4 || cutIds.length !== 4)) {
    throw new Error("Official Keep Cut completion must contain four keeps and four cuts.");
  }
  const finalSubmission = complete ? { kept_ids: keptIds } : null;

  return {
    submissionState: { choices: nextChoices, final_submission: finalSubmission },
    publicState: {
      complete,
      reveal_index: nextChoices.length,
      kept: keptIds.map((id) => fighterPresentation(fighterFor(id))),
      cut: cutIds.map((id) => fighterPresentation(fighterFor(id))),
      current_fighter: complete ? null : fighterPresentation(fighterFor(fighterIds[nextChoices.length]!)),
      forced_choice: complete
        ? null
        : keptIds.length === 4
          ? "cut"
          : cutIds.length === 4
            ? "keep"
            : null,
      reveal: complete ? context.revealSetup : null,
    },
    complete,
    finalSubmission,
  };
}


export function advanceUfcComparisonOnlyDailyRuntime(context: OfficialDailyRuntimeContext, action: unknown): OfficialDailyAdvanceResult {
  const parsed = asRecord(action);
  switch (context.gameType) {
    case "blind_rank_5": return advanceBlindRank(context, parsed);
    case "keep_4_cut_4": return advanceKeepCut(context, parsed);
    default: throw new Error("UFC comparison game identity mismatch.");
  }
}
