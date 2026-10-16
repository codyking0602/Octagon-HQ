import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_PLAYER_POOL,
  footballGmPlayerById,
  type FootballGmRosterEntry,
} from "./footballGmEngine";

export type FootballGmSoloStartMode = "classic" | "choose-qb";

/** Keep player identity, grades, contracts, and development in the existing GM authority. */
export const FOOTBALL_GM_SOLO_QUARTERBACKS = FOOTBALL_GM_PLAYER_POOL
  .filter((player) => player.family === "QB" && player.eligibleSlots.includes("QB"))
  .sort((left, right) => left.name.localeCompare(right.name));

/** Pick one real quarterback, then let the established draft wheel fill six remaining slots. */
export function footballGmSoloOpeningQuarterback(playerId: string | null): FootballGmRosterEntry[] | null {
  if (!playerId) return null;
  const player = footballGmPlayerById(playerId);
  if (!player || player.family !== "QB" || !player.eligibleSlots.includes("QB") || player.salaryApy > FOOTBALL_GM_CAP) {
    return null;
  }
  return [{ slot: "QB", playerId: player.id, acquired: "draft" }];
}
