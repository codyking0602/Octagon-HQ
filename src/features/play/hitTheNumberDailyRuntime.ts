import {
  HIT_THE_NUMBER_VERSION,
  hitTheNumberStatRows,
  type HitTheNumberBoardType,
} from "./hitTheNumberEngine";
import { hitTheNumberSlotAcceptsFighter } from "./hitTheNumberFormats";
import { createQualityGatedHitTheNumberFormatPlan } from "./hitTheNumberPoolQuality";
import { seededLineupRandom } from "./lineupModel";

type JsonRecord = Record<string, unknown>;

export interface HitTheNumberDailyRuntimeContext {
  setupKey: string;
  publicSetup: JsonRecord;
  revealSetup: JsonRecord;
  privateSetupEvidence: JsonRecord;
  privateGradingEvidence: JsonRecord;
  submissionState: JsonRecord;
  publicState: JsonRecord;
}

function stringArray(value: unknown, label: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${label} must be a string array.`);
  }
  return value as string[];
}

function nullableStringArray(value: unknown, length: number, label: string) {
  if (
    !Array.isArray(value)
    || value.length !== length
    || value.some((item) => item !== null && typeof item !== "string")
  ) {
    throw new Error(`${label} must contain exactly ${length} fighter slots.`);
  }
  return value as Array<string | null>;
}

function slotEligibility(value: unknown, pickCount: number) {
  if (value == null) return [] as string[][];
  if (!Array.isArray(value)) {
    throw new Error("Hit the Number slot eligibility must be an array.");
  }
  if (value.length === 0) return [] as string[][];
  if (value.length !== pickCount) {
    throw new Error(`Hit the Number slot eligibility must contain exactly ${pickCount} slots.`);
  }
  return value.map((row, index) => stringArray(row, `Hit the Number slot ${index + 1} eligibility`));
}

function integer(value: unknown, label: string, min: number, max: number) {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) {
    throw new Error(`${label} must be an integer from ${min} through ${max}.`);
  }
  return Number(value);
}

function boardTypeForDay(
  runtimeVersion: string,
  day: string,
  scheduleVersion: string,
): HitTheNumberBoardType {
  const random = seededLineupRandom(
    runtimeVersion,
    "hit-the-number",
    scheduleVersion,
    day,
    "board-type",
  );
  return random() < 0.5 ? "open-roster" : "random-pool";
}

export function buildOfficialHitTheNumberDailySetup(
  day: string,
  scheduleVersion: string,
  runtimeVersion: string,
  scoringVersion: string,
) {
  const boardType = boardTypeForDay(runtimeVersion, day, scheduleVersion);
  const seed = `${runtimeVersion}|hit-the-number|${scheduleVersion}|${day}`;
  const plan = createQualityGatedHitTheNumberFormatPlan({ seed, boardType });
  const statRowsById = new Map(hitTheNumberStatRows.map((row) => [row.fighterId, row]));
  const values = Object.fromEntries(plan.fighterIds.map((fighterId) => {
    const value = statRowsById.get(fighterId)?.values[plan.statId];
    if (!Number.isInteger(value) || value == null || value < 0) {
      throw new Error(`Official Hit the Number value for ${fighterId} is unavailable.`);
    }
    return [fighterId, value];
  }));
  const slotEligibleIds = plan.format.slots.map((slot) => plan.fighterIds.filter(
    (fighterId) => hitTheNumberSlotAcceptsFighter(slot, fighterId),
  ));
  plan.solutionFighterIds.forEach((fighterId, index) => {
    if (slotEligibleIds.length > 0 && !slotEligibleIds[index]?.includes(fighterId)) {
      throw new Error(`Official Hit the Number solution does not satisfy slot ${index + 1}.`);
    }
  });
  const slotAssignments = slotEligibleIds.length > 0
    ? Array.from({ length: plan.pickCount }, () => null)
    : undefined;
  const publicSetup = {
    version: HIT_THE_NUMBER_VERSION,
    statId: plan.statId,
    boardType: plan.boardType,
    target: plan.target,
    pickCount: plan.pickCount,
    filter: {},
    fighterIds: [...plan.fighterIds],
    format: plan.format,
    runtime_version: runtimeVersion,
    initial_state: {
      complete: false,
      selected_ids: [],
      ...(slotAssignments ? { slot_assignments: slotAssignments } : {}),
    },
  };

  return {
    setupKey: [
      HIT_THE_NUMBER_VERSION,
      scheduleVersion,
      day,
      boardType,
      plan.format.formatId,
      plan.format.configurationId ?? "default",
    ].join(":"),
    contentVersion: HIT_THE_NUMBER_VERSION,
    scoringVersion,
    publicSetup,
    revealSetup: {},
    privateSetupEvidence: {
      fighter_ids: [...plan.fighterIds],
      pick_count: plan.pickCount,
      format_id: plan.format.formatId,
      slot_eligible_ids: slotEligibleIds,
    },
    privateGradingEvidence: {
      fighter_ids: [...plan.fighterIds],
      stat_id: plan.statId,
      target: plan.target,
      pick_count: plan.pickCount,
      format_id: plan.format.formatId,
      slot_eligible_ids: slotEligibleIds,
      values,
    },
  };
}

export function advanceOfficialHitTheNumberDailyRuntime(
  context: HitTheNumberDailyRuntimeContext,
  action: JsonRecord,
) {
  const fighterIds = stringArray(
    context.privateSetupEvidence.fighter_ids,
    "Hit the Number fighter ids",
  );
  const eligible = new Set(fighterIds);
  const pickCount = integer(
    context.privateSetupEvidence.pick_count,
    "Hit the Number pick count",
    4,
    7,
  );
  const slotEligibleIds = slotEligibility(
    context.privateSetupEvidence.slot_eligible_ids,
    pickCount,
  );

  if (slotEligibleIds.length > 0) {
    const slotAssignments = nullableStringArray(
      context.submissionState.slot_assignments
        ?? context.publicState.slot_assignments
        ?? Array.from({ length: pickCount }, () => null),
      pickCount,
      "Hit the Number slot assignments",
    );
    const assignedIds = slotAssignments.filter((fighterId): fighterId is string => fighterId != null);
    if (new Set(assignedIds).size !== assignedIds.length) {
      throw new Error("Hit the Number assigned fighters must be unique.");
    }
    slotAssignments.forEach((fighterId, index) => {
      if (fighterId == null) return;
      if (!eligible.has(fighterId) || !slotEligibleIds[index]?.includes(fighterId)) {
        throw new Error(`Hit the Number progress contains an invalid fighter for slot ${index + 1}.`);
      }
    });

    if (action.lock === true) {
      if (assignedIds.length !== pickCount || slotAssignments.some((fighterId) => fighterId == null)) {
        throw new Error(`Hit the Number requires every one of the ${pickCount} slots before lock.`);
      }
      const selectedIds = slotAssignments as string[];
      const finalSubmission = { selected_ids: [...selectedIds] };
      return {
        submissionState: {
          selected_ids: [...selectedIds],
          slot_assignments: [...slotAssignments],
          final_submission: finalSubmission,
        },
        publicState: {
          complete: true,
          selected_ids: [...selectedIds],
          slot_assignments: [...slotAssignments],
        },
        complete: true,
        finalSubmission,
      };
    }

    const slotIndex = integer(action.slot_index, "Hit the Number slot index", 0, pickCount - 1);
    const fighterId = typeof action.fighter_id === "string" ? action.fighter_id : "";
    if (!eligible.has(fighterId)) {
      throw new Error("That fighter is not on the official Hit the Number board.");
    }
    if (!slotEligibleIds[slotIndex]?.includes(fighterId)) {
      throw new Error(`That fighter is not eligible for Hit the Number slot ${slotIndex + 1}.`);
    }

    const nextAssignments = [...slotAssignments];
    if (nextAssignments[slotIndex] === fighterId) {
      nextAssignments[slotIndex] = null;
    } else {
      if (nextAssignments.some((assignedId, index) => index !== slotIndex && assignedId === fighterId)) {
        throw new Error("That fighter is already assigned to another Hit the Number slot.");
      }
      nextAssignments[slotIndex] = fighterId;
    }
    const nextSelectedIds = nextAssignments.filter(
      (assignedId): assignedId is string => assignedId != null,
    );

    return {
      submissionState: {
        selected_ids: nextSelectedIds,
        slot_assignments: nextAssignments,
        final_submission: null,
      },
      publicState: {
        complete: false,
        selected_ids: nextSelectedIds,
        slot_assignments: nextAssignments,
      },
      complete: false,
      finalSubmission: null,
    };
  }

  const selectedIds = stringArray(
    context.submissionState.selected_ids ?? [],
    "Hit the Number selected ids",
  );
  if (new Set(selectedIds).size !== selectedIds.length) {
    throw new Error("Hit the Number selected fighters must be unique.");
  }
  if (selectedIds.some((fighterId) => !eligible.has(fighterId))) {
    throw new Error("Hit the Number progress contains an ineligible fighter.");
  }

  if (action.lock === true) {
    if (selectedIds.length !== pickCount) {
      throw new Error(`Hit the Number requires exactly ${pickCount} fighters before lock.`);
    }
    const finalSubmission = { selected_ids: [...selectedIds] };
    return {
      submissionState: {
        selected_ids: [...selectedIds],
        final_submission: finalSubmission,
      },
      publicState: {
        complete: true,
        selected_ids: [...selectedIds],
      },
      complete: true,
      finalSubmission,
    };
  }

  const fighterId = typeof action.fighter_id === "string" ? action.fighter_id : "";
  if (!eligible.has(fighterId)) {
    throw new Error("That fighter is not on the official Hit the Number board.");
  }
  const alreadySelected = selectedIds.includes(fighterId);
  if (!alreadySelected && selectedIds.length >= pickCount) {
    throw new Error(`Hit the Number allows exactly ${pickCount} selected fighters.`);
  }
  const nextSelectedIds = alreadySelected
    ? selectedIds.filter((selectedId) => selectedId !== fighterId)
    : [...selectedIds, fighterId];

  return {
    submissionState: {
      selected_ids: nextSelectedIds,
      final_submission: null,
    },
    publicState: {
      complete: false,
      selected_ids: nextSelectedIds,
    },
    complete: false,
    finalSubmission: null,
  };
}
