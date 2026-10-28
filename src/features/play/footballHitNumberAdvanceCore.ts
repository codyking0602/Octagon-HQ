// Authoritative persisted Football Hit the Number answers/grades shared by
// the normal runtime and the small per-action Supabase Edge bundle.
// This module intentionally imports no player catalogs or generators.
import type { OfficialDailyRuntimeContext, OfficialDailyAdvanceResult } from "./todaysChallengeRuntime";
type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Football daily evidence must be an object.");
  }
  return value as JsonRecord;
}

function recordArray(value: unknown, label: string) {
  if (!Array.isArray(value) || value.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new Error(`${label} must be an object array.`);
  }
  return value as JsonRecord[];
}

function stringArray(value: unknown, label: string) {
  if (!Array.isArray(value) || value.some((row) => typeof row !== "string")) {
    throw new Error(`${label} must be a string array.`);
  }
  return value as string[];
}

function integer(value: unknown, label: string, min: number, max: number) {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) {
    throw new Error(`${label} must be an integer from ${min} through ${max}.`);
  }
  return Number(value);
}


function hitTheNumberPlanEvidence(context: OfficialDailyRuntimeContext) {
  const ids = stringArray(context.privateSetupEvidence.fighter_ids, "Football Hit the Number ids");
  const pickCount = integer(context.privateSetupEvidence.pick_count, "Football Hit the Number pick count", 4, 6);
  const plan = asRecord(context.privateSetupEvidence.plan);
  const subjectIds = stringArray(plan.subjectIds, "Football Hit the Number canonical plan subjects");
  if (
    subjectIds.length !== ids.length
    || subjectIds.some((id, index) => id !== ids[index])
    || Number(plan.pickCount) !== pickCount
  ) {
    throw new Error("Football Hit the Number canonical plan is unavailable.");
  }

  const formatId = String(plan.formatId ?? "");
  const progression = formatId === "one-from-each" || formatId === "build-the-team";
  const slots = Array.isArray(plan.slots)
    ? recordArray(plan.slots, "Football Hit the Number slots")
    : [];
  let progressionSlotSubjectIds: string[][] = [];
  if (progression) {
    const raw = context.privateSetupEvidence.progression_slot_subject_ids;
    if (!Array.isArray(raw) || raw.length !== pickCount) {
      throw new Error("Football Hit the Number persisted slot eligibility is unavailable.");
    }
    progressionSlotSubjectIds = raw.map((row, index) =>
      stringArray(row, `Football Hit the Number slot ${index + 1} eligibility`));
    if (progressionSlotSubjectIds.some((row) => row.some((id) => !ids.includes(id)))) {
      throw new Error("Football Hit the Number persisted slot eligibility is invalid.");
    }
  }

  return { ids, pickCount, plan, progression, slots, progressionSlotSubjectIds };
}

function hitTheNumberSelectionSatisfiesPersisted(
  context: OfficialDailyRuntimeContext,
  selectedIds: readonly string[],
) {
  const evidence = hitTheNumberPlanEvidence(context);
  if (selectedIds.length !== evidence.pickCount) return false;
  if (new Set(selectedIds).size !== selectedIds.length) return false;
  if (selectedIds.some((id) => !evidence.ids.includes(id))) return false;
  if (!evidence.progression) return true;
  return selectedIds.every((id, index) => evidence.progressionSlotSubjectIds[index]?.includes(id));
}

function hitTheNumberPublicStatePersisted(
  context: OfficialDailyRuntimeContext,
  selectedIds: readonly string[],
  complete = false,
) {
  const evidence = hitTheNumberPlanEvidence(context);
  const activeIndex = !complete && evidence.progression && selectedIds.length < evidence.pickCount
    ? selectedIds.length
    : null;
  const activeSlot = activeIndex == null ? null : evidence.slots[activeIndex] ?? null;
  const activeSlotSubjectIds = activeIndex == null
    ? []
    : evidence.progressionSlotSubjectIds[activeIndex] ?? [];
  const availableIds = complete || activeSlot == null
    ? [...evidence.ids]
    : activeSlotSubjectIds.filter((id) => !selectedIds.includes(id));

  return {
    complete,
    selected_ids: [...selectedIds],
    available_subject_ids: availableIds,
    active_slot: activeSlot
      ? { ...activeSlot, index: activeIndex }
      : null,
  };
}

export function advanceHitTheNumber(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const evidence = hitTheNumberPlanEvidence(context);
  const eligible = new Set(evidence.ids);
  const selected = stringArray(context.submissionState.selected_ids ?? [], "Football Hit the Number selections");

  if (action.lock === true) {
    if (!hitTheNumberSelectionSatisfiesPersisted(context, selected)) {
      throw new Error("Football Hit the Number selections do not satisfy this board.");
    }
    const finalSubmission = { selected_ids: [...selected] };
    return {
      submissionState: { selected_ids: [...selected], final_submission: finalSubmission },
      publicState: hitTheNumberPublicStatePersisted(context, selected, true),
      complete: true,
      finalSubmission,
    };
  }

  if (Number.isInteger(action.rewind_to)) {
    if (!evidence.progression) throw new Error("This Football Hit the Number board does not use progression slots.");
    const index = integer(action.rewind_to, "Football Hit the Number rewind slot", 0, Math.max(0, selected.length - 1));
    const next = selected.slice(0, index);
    return {
      submissionState: { selected_ids: next, final_submission: null },
      publicState: hitTheNumberPublicStatePersisted(context, next),
      complete: false,
      finalSubmission: null,
    };
  }

  const id = String(action.fighter_id ?? "");
  if (!eligible.has(id)) throw new Error("That subject is not on the Football Hit the Number board.");

  let next: string[];
  if (selected.includes(id)) {
    if (evidence.progression && selected.at(-1) !== id) {
      throw new Error("Football Hit the Number progression can only rewind from the latest slot.");
    }
    next = evidence.progression ? selected.slice(0, -1) : selected.filter((row) => row !== id);
  } else {
    if (selected.length >= evidence.pickCount) {
      throw new Error(`Football Hit the Number allows exactly ${evidence.pickCount} selections.`);
    }
    if (
      evidence.progression
      && !evidence.progressionSlotSubjectIds[selected.length]!.includes(id)
    ) {
      throw new Error("That subject is not eligible for the active Football Hit the Number slot.");
    }
    next = [...selected, id];
  }

  return {
    submissionState: { selected_ids: next, final_submission: null },
    publicState: hitTheNumberPublicStatePersisted(context, next),
    complete: false,
    finalSubmission: null,
  };
}


export function scoreFootballHitNumberTwoGameChild(
  context: OfficialDailyRuntimeContext,
  advanced: OfficialDailyAdvanceResult,
): number {
  {
    const finalSubmission = asRecord(advanced.finalSubmission);
    const selectedIds = stringArray(finalSubmission.selected_ids, "Football two-game Hit the Number selections");
    const values = asRecord(context.privateGradingEvidence.values);
    const target = Number(context.privateGradingEvidence.target);
    const pickCount = Number(context.privateGradingEvidence.pick_count);
    if (!Number.isInteger(pickCount) || pickCount < 4 || pickCount > 6 || selectedIds.length !== pickCount) {
      throw new Error("Football two-game Hit the Number selection is invalid.");
    }
    if (!Number.isFinite(target) || target <= 0) {
      throw new Error("Football two-game Hit the Number target is invalid.");
    }
    const total = selectedIds.reduce((sum, id) => {
      const value = Number(values[id]);
      if (!Number.isFinite(value)) throw new Error("Football two-game Hit the Number value evidence is unavailable.");
      return sum + value;
    }, 0);
    const distance = Math.abs(target - total);
    if (distance < 1e-9) return 100;
    const bust = total > target;
    const raw = bust
      ? 50 - (50 * distance / target)
      : 100 - (50 * distance / target);
    const rounded = Math.round(raw);
    return bust
      ? Math.max(0, Math.min(49, rounded))
      : Math.max(50, Math.min(99, rounded));
  }

  throw new Error("Football Hit the Number two-game grading received an unsupported context.");
}
