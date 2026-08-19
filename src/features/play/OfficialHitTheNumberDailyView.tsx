import { useState } from "react";
import { HitTheNumberGameView } from "./HitTheNumberGameView";
import {
  HIT_THE_NUMBER_VERSION,
  type HitTheNumberPublicSetup,
  type HitTheNumberResult,
  type HitTheNumberResultStatus,
} from "./hitTheNumberEngine";
import {
  hitTheNumberFormatSelectionSatisfies,
  type HitTheNumberFormatSetup,
} from "./hitTheNumberFormats";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

const LEGACY_CLASSIC_FORMAT: HitTheNumberFormatSetup = {
  formatId: "classic",
  label: "Classic",
  configurationId: null,
  configurationLabel: null,
  rules: [],
  slots: [],
};

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function publicSetup(projection: TodayChallengeProjection): HitTheNumberPublicSetup {
  const setup = projection.publicSetup;
  if (
    setup.version !== HIT_THE_NUMBER_VERSION
    || typeof setup.statId !== "string"
    || (setup.boardType !== "open-roster" && setup.boardType !== "random-pool")
    || !Number.isInteger(setup.target)
    || !Number.isInteger(setup.pickCount)
    || !setup.filter
    || typeof setup.filter !== "object"
    || Array.isArray(setup.filter)
    || !Array.isArray(setup.fighterIds)
  ) {
    throw new Error("The official Hit the Number board is unavailable.");
  }
  return setup as unknown as HitTheNumberPublicSetup;
}

function publicFormat(projection: TodayChallengeProjection): HitTheNumberFormatSetup {
  const value = projection.publicSetup.format;
  if (value == null) return LEGACY_CLASSIC_FORMAT;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The official Hit the Number format is unavailable.");
  }
  const format = value as Record<string, unknown>;
  if (
    !["classic", "themed-lineup", "one-from-each", "build-the-team"].includes(String(format.formatId))
    || typeof format.label !== "string"
    || (format.configurationId !== null && typeof format.configurationId !== "string")
    || (format.configurationLabel !== null && typeof format.configurationLabel !== "string")
    || !Array.isArray(format.rules)
    || !Array.isArray(format.slots)
  ) {
    throw new Error("The official Hit the Number format is unavailable.");
  }
  return value as HitTheNumberFormatSetup;
}

function slotAssignments(projection: TodayChallengeProjection, format: HitTheNumberFormatSetup) {
  if (!format.slots.length) return [] as Array<string | null>;
  const value = projection.publicState.slot_assignments;
  if (!Array.isArray(value) || value.length !== format.slots.length) {
    return format.slots.map(() => null);
  }
  return value.map((fighterId) => typeof fighterId === "string" ? fighterId : null);
}

function officialResult(projection: TodayChallengeProjection): HitTheNumberResult | null {
  const attempt = projection.officialAttempt;
  if (!attempt) return null;
  const result = attempt.publicResult;
  const status = result.status as HitTheNumberResultStatus;
  if (status !== "perfect" && status !== "under" && status !== "bust") {
    throw new Error("The official Hit the Number result is unavailable.");
  }
  const rawSelections = Array.isArray(result.selections) ? result.selections : [];
  const selections = rawSelections.map((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("The official Hit the Number reveal is unavailable.");
    }
    const row = value as Record<string, unknown>;
    if (typeof row.fighterId !== "string" || !Number.isInteger(row.value)) {
      throw new Error("The official Hit the Number reveal is unavailable.");
    }
    return { fighterId: row.fighterId, value: Number(row.value) };
  });
  if (
    !Number.isInteger(result.target)
    || !Number.isInteger(result.total)
    || !Number.isInteger(result.distance)
  ) {
    throw new Error("The official Hit the Number result is unavailable.");
  }
  return {
    status,
    target: Number(result.target),
    total: Number(result.total),
    distance: Number(result.distance),
    score: attempt.normalizedScore,
    selections,
  };
}

export function OfficialHitTheNumberDailyView({
  projection,
  busy,
  onAdvance,
}: {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: Record<string, unknown>) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const setup = publicSetup(projection);
  const format = publicFormat(projection);
  const assignments = slotAssignments(projection, format);
  const selectedIds = format.slots.length
    ? assignments.filter((fighterId): fighterId is string => fighterId != null)
    : stringArray(projection.publicState.selected_ids);
  const selectionValid = selectedIds.length === setup.pickCount
    && hitTheNumberFormatSelectionSatisfies(format, selectedIds);
  const result = officialResult(projection);

  function toggleFighter(fighterId: string) {
    if (!format.slots.length) {
      onAdvance({ fighter_id: fighterId });
      return;
    }

    const slotIndex = Math.min(activeSlotIndex, format.slots.length - 1);
    const wasAssigned = assignments[slotIndex] === fighterId;
    onAdvance({ fighter_id: fighterId, slot_index: slotIndex });
    if (wasAssigned) return;

    for (let offset = 1; offset <= format.slots.length; offset += 1) {
      const nextIndex = (slotIndex + offset) % format.slots.length;
      if (nextIndex === slotIndex || assignments[nextIndex] != null) continue;
      setActiveSlotIndex(nextIndex);
      setSearch("");
      break;
    }
  }

  return (
    <div className="page hit-number-page" data-game="hit_the_number" data-mode="daily">
      <HitTheNumberGameView
        setup={setup}
        format={format}
        selectedIds={selectedIds}
        slotAssignments={assignments}
        activeSlotIndex={activeSlotIndex}
        selectionValid={selectionValid}
        result={result}
        search={search}
        onSearchChange={setSearch}
        onToggleFighter={toggleFighter}
        onSelectSlot={setActiveSlotIndex}
        onLock={() => onAdvance({ lock: true })}
        busy={busy}
      />
    </div>
  );
}
