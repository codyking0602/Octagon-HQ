import {
  createGeneratedHitTheNumberBoard,
  hitTheNumberStatRows,
  type HitTheNumberBoardType,
} from "./hitTheNumberEngine";
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
  const board = createGeneratedHitTheNumberBoard({ seed, boardType });
  const statRowsById = new Map(hitTheNumberStatRows.map((row) => [row.fighterId, row]));
  const values = Object.fromEntries(board.publicSetup.fighterIds.map((fighterId) => {
    const value = statRowsById.get(fighterId)?.values[board.publicSetup.statId];
    if (!Number.isInteger(value) || value == null || value < 0) {
      throw new Error(`Official Hit the Number value for ${fighterId} is unavailable.`);
    }
    return [fighterId, value];
  }));

  return {
    setupKey: `${board.publicSetup.version}:${scheduleVersion}:${day}:${boardType}`,
    contentVersion: board.publicSetup.version,
    scoringVersion,
    publicSetup: {
      ...board.publicSetup,
      runtime_version: runtimeVersion,
      initial_state: {
        complete: false,
        selected_ids: [],
      },
    },
    revealSetup: {},
    privateSetupEvidence: {
      fighter_ids: [...board.publicSetup.fighterIds],
      pick_count: board.publicSetup.pickCount,
    },
    privateGradingEvidence: {
      fighter_ids: [...board.publicSetup.fighterIds],
      stat_id: board.publicSetup.statId,
      target: board.publicSetup.target,
      pick_count: board.publicSetup.pickCount,
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
