import {
  WHEEL_UFC_CATEGORY_KEYS,
  WHEEL_UFC_WEIGHT_CLASSES,
  type WheelUfcCandidate,
  type WheelUfcCategoryKey,
  type WheelUfcPick,
  type WheelUfcState,
  type WheelUfcWeightClass,
} from "../play/wheelUfcRepository";

export { WHEEL_UFC_CATEGORY_KEYS, WHEEL_UFC_WEIGHT_CLASSES };
export type { WheelUfcCategoryKey, WheelUfcWeightClass };

export const WHEEL_UFC_CATEGORY_META: Record<WheelUfcCategoryKey, {
  label: string;
  detail: string;
  weight: number;
  center: number;
}> = {
  champion: { label: "CHAMPION", detail: "Current undisputed champions", weight: 5, center: 9 },
  "top-5": { label: "TOP 5", detail: "Current #1–5 contenders", weight: 10, center: 36 },
  "rank-6-15": { label: "6–15", detail: "Current #6–15 contenders", weight: 15, center: 81 },
  unranked: { label: "UNRANKED", detail: "Current fighters outside the Top 15", weight: 20, center: 144 },
  country: { label: "COUNTRY", detail: "A country is drawn after the spin", weight: 20, center: 216 },
  "young-gun": { label: "YOUNG GUN", detail: "Current fighters under 25", weight: 15, center: 279 },
  veteran: { label: "VETERAN", detail: "10+ UFC fights", weight: 15, center: 333 },
};

export function normalizeWheelUfcCode(value: string | null) {
  const code = value?.trim().toUpperCase() ?? "";
  return /^[A-Z0-9]{4,12}$/.test(code) ? code : "";
}

export function wheelUfcRosterForProfile(
  state: WheelUfcState,
  profileId: string | null | undefined,
) {
  if (!profileId) return [] as WheelUfcPick[];
  return state.creator.id === profileId ? state.creator_roster : state.recipient_roster;
}

export function wheelUfcOtherParticipant(
  state: WheelUfcState,
  profileId: string | null | undefined,
) {
  return state.creator.id === profileId ? state.recipient : state.creator;
}

export function wheelUfcPickForWeight(
  roster: readonly WheelUfcPick[],
  weightClass: WheelUfcWeightClass,
) {
  return roster.find((pick) => pick.weight_class === weightClass) ?? null;
}

export function wheelUfcRankLabel(
  input:
    | Pick<WheelUfcCandidate, "is_champion" | "ranking_position">
    | Pick<WheelUfcPick, "was_champion" | "ranking_position">,
) {
  if ("is_champion" in input && input.is_champion) return "CHAMPION";
  if ("was_champion" in input && input.was_champion) return "CHAMPION";
  return input.ranking_position ? `#${input.ranking_position}` : "UNRANKED";
}

export function wheelUfcSpinLabel(state: WheelUfcState) {
  if (!state.pending_category_key) return "";
  const label = WHEEL_UFC_CATEGORY_META[state.pending_category_key].label;
  return state.pending_category_key === "country" && state.pending_country
    ? `${label} · ${state.pending_country.toUpperCase()}`
    : label;
}
