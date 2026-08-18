import { useState } from "react";
import { HitTheNumberGameView } from "./HitTheNumberGameView";
import {
  HIT_THE_NUMBER_VERSION,
  type HitTheNumberPublicSetup,
  type HitTheNumberResult,
  type HitTheNumberResultStatus,
} from "./hitTheNumberEngine";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

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
  const setup = publicSetup(projection);
  const selectedIds = stringArray(projection.publicState.selected_ids);
  const result = officialResult(projection);

  return (
    <div className="page hit-number-page" data-game="hit_the_number" data-mode="daily">
      <HitTheNumberGameView
        setup={setup}
        selectedIds={selectedIds}
        result={result}
        search={search}
        onSearchChange={setSearch}
        onToggleFighter={(fighterId) => onAdvance({ fighter_id: fighterId })}
        onLock={() => onAdvance({ lock: true })}
        busy={busy}
      />
    </div>
  );
}
