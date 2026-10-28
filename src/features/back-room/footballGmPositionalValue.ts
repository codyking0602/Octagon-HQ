import type { WheelFootballGmContractRow, WheelFootballGmRosterSlot } from "./wheelFootballGmEconomy";

/**
 * Stable three-season NFL GM roster value, separate from the manually authored
 * HQ/Wheel current-ability grades. Only the premium ABOVE the neutral 80 grade
 * is role-adjusted; base slot allocations always sum to one.
 */
export const FOOTBALL_GM_NEUTRAL_GRADE = 80;

export const FOOTBALL_GM_POSITION_WEIGHTS: Readonly<Record<WheelFootballGmRosterSlot, number>> = {
  QB: 0.28,
  RB: 0.08,
  WR: 0.14,
  FLEX: 0.08,
  DL: 0.14,
  LB: 0.14,
  DB: 0.14,
};

export type FootballGmActualRole =
  | "QB" | "RB" | "WR" | "TE" | "EDGE" | "IDL" | "LB" | "CB" | "S";

type RoleIdentity = Pick<WheelFootballGmContractRow, "family" | "position"> & {
  player?: string;
  name?: string;
};

/** Resolve by source family first: 2-way Hunter has separate WR and DB identities. */
export function footballGmActualRole(player: RoleIdentity): FootballGmActualRole {
  switch (player.family) {
    case "QB": return "QB";
    case "RB": return "RB";
    case "WR": return "WR";
    case "TE": return "TE";
    case "Front Seven":
      if (["ED", "EDGE", "DE"].includes(player.position)) return "EDGE";
      if (["IDL", "DT", "NT"].includes(player.position)) return "IDL";
      return "LB"; // includes Jaylon Carlies, a safety-source LB identity
    case "Secondary":
      if (["S", "FS", "SS"].includes(player.position)) return "S";
      return "CB"; // includes Travis Hunter's separate defensive identity
  }
}

export const FOOTBALL_GM_ROLE_MODIFIERS: Readonly<Record<FootballGmActualRole, number>> = {
  QB: 1,
  RB: 0.96, // FLEX only; mandatory RB slot stays at its base weight
  WR: 1.05, // FLEX only; mandatory WR slot stays at its base weight
  TE: 1.03,
  EDGE: 1.13,
  IDL: 1.04,
  LB: 0.93,
  CB: 1.06,
  S: 1.01,
};

export function footballGmRoleMultiplier(player: RoleIdentity, slot: WheelFootballGmRosterSlot) {
  if (slot !== "FLEX" && slot !== "DL" && slot !== "LB" && slot !== "DB") return 1;
  return FOOTBALL_GM_ROLE_MODIFIERS[footballGmActualRole(player)];
}

export function footballGmWeightedContribution(
  player: RoleIdentity,
  slot: WheelFootballGmRosterSlot,
  grade: number,
) {
  return FOOTBALL_GM_POSITION_WEIGHTS[slot]
    * footballGmRoleMultiplier(player, slot)
    * (grade - FOOTBALL_GM_NEUTRAL_GRADE);
}
