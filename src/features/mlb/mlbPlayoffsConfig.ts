import type { IdentityProfile } from "../identity/identityModel";

export const MLB_PLAYOFFS_SEASON = 2026;
export const MLB_PLAYOFFS_PUBLIC_ENABLED = false;

export type MlbPlayoffRound = "wild_card" | "division_series" | "championship_series" | "world_series";

export const MLB_ROUND_LABELS: Record<MlbPlayoffRound, string> = {
  wild_card: "WILD CARD",
  division_series: "DIVISION SERIES",
  championship_series: "ALCS / NLCS",
  world_series: "WORLD SERIES",
};

export function canViewMlbPlayoffs(profile: Pick<IdentityProfile, "canControlPicks"> | null | undefined) {
  return MLB_PLAYOFFS_PUBLIC_ENABLED || profile?.canControlPicks === true;
}
