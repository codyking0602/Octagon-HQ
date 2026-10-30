import {
  NBA_GM_ROSTER_SLOTS,
  NBA_GM_SKILL_KEYS,
  type NbaGmPick,
  type NbaGmPlayer,
  type NbaGmSalaryWindow,
  type NbaGmSlot,
} from "./nbaGmFoundation";

/** Owner-only prototype: attributes are provisional, prices are FICTIONAL game fixtures. */
export type NbaGmDevPlayer = Omit<NbaGmPlayer, "sources"> & {
  pricingKind: "GAME_FIXTURE_NOT_REAL_CONTRACT";
  eligibilityKind: "PROVISIONAL_EDITORIAL";
};
export type NbaGmDevPhase = "draft" | "review" | "final";
export interface NbaGmDevSeason {
  season: number;
  wins: number;
  losses: number;
  offense: number;
  defense: number;
  positionalFit: number;
  finish: string;
}
export interface NbaGmDevRun {
  version: "nba-gm-dev-v1";
  seed: string;
  phase: NbaGmDevPhase;
  picks: NbaGmPick[];
  pendingTeam: string | null;
  pendingSlot: NbaGmSlot | null;
  spinIndex: number;
  caps: NbaGmSalaryWindow;
  results: NbaGmDevSeason[];
}
export const NBA_GM_DEV_CAPS: NbaGmSalaryWindow = [192_500_000, 192_500_000, 192_500_000];
export const NBA_GM_DEV_SKILL_LABELS = {
  scoring: "Scoring",
  shooting: "Shooting",
  playmaking: "Playmaking",
  perimeterDefense: "Perimeter D",
  interiorDefense: "Interior D",
  rebounding: "Rebounding",
} as const;

export function nbaGmDevSpend(
  picks: readonly NbaGmPick[],
  catalog: readonly NbaGmDevPlayer[],
): NbaGmSalaryWindow {
  const byId = new Map(catalog.map(player => [player.id, player]));
  return [0, 1, 2].map(year => picks.reduce(
    (sum, entry) => sum + (byId.get(entry.playerId)?.salaries[year] ?? 0), 0,
  )) as unknown as NbaGmSalaryWindow;
}

export function nbaGmDevEligible(player: NbaGmDevPlayer, slot: NbaGmSlot) {
  return slot === "SIXTH" || slot === "FLEX" || player.positions.includes(slot);
}

/**
 * Same cheapest-unused-player lower bound as the server (not a guarantee of a
 * future completed roster). The database repeats all checks authoritatively.
 */
export function nbaGmDevCanPick(
  picks: readonly NbaGmPick[],
  slot: NbaGmSlot,
  player: NbaGmDevPlayer,
  catalog: readonly NbaGmDevPlayer[],
  caps: NbaGmSalaryWindow = NBA_GM_DEV_CAPS,
) {
  if (!NBA_GM_ROSTER_SLOTS.includes(slot)
      || picks.length >= 7
      || !nbaGmDevEligible(player, slot)
      || picks.some(pick => pick.slot === slot || pick.playerId === player.id)
      || player.pricingKind !== "GAME_FIXTURE_NOT_REAL_CONTRACT") return false;

  const owned = new Set([...picks.map(pick => pick.playerId), player.id]);
  const open = NBA_GM_ROSTER_SLOTS.filter(
    next => next !== slot && !picks.some(pick => pick.slot === next),
  );
  const spend = nbaGmDevSpend([...picks, { slot, playerId: player.id }], catalog);
  return [0, 1, 2].every(year => {
    const reserve = open.reduce((sum, next) => {
      const prices = catalog.filter(p => !owned.has(p.id) && nbaGmDevEligible(p, next))
        .map(p => p.salaries[year]!);
      return sum + (prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY);
    }, 0);
    return spend[year]! + reserve <= caps[year]!;
  });
}

export function nbaGmDevCandidates(
  run: NbaGmDevRun, catalog: readonly NbaGmDevPlayer[],
): NbaGmDevPlayer[] {
  if (!run.pendingTeam || !run.pendingSlot) return [];
  return catalog.filter(player => player.teamCode === run.pendingTeam
      && nbaGmDevCanPick(run.picks, run.pendingSlot!, player, catalog, run.caps))
    .sort((a, b) => b.currentGrade - a.currentGrade || a.name.localeCompare(b.name));
}

export function nbaGmDevCatalogErrors(catalog: readonly NbaGmDevPlayer[]): string[] {
  const errors: string[] = [];
  if (catalog.length !== 330) errors.push("Expected 330 privately held NBA GM candidates.");
  const ids = new Set<string>();
  for (const p of catalog) {
    if (ids.has(p.id) || !p.id) errors.push("Duplicate/missing identity " + p.id);
    ids.add(p.id);
    if (!p.positions.length || p.currentGrade < 0 || p.currentGrade > 99 ||
      p.salaries.length !== 3 || p.salaries.some(s => !Number.isSafeInteger(s) || s <= 0) ||
      NBA_GM_SKILL_KEYS.some(key => !Number.isInteger(p.skills[key]) || p.skills[key] < 0 || p.skills[key] > 99) ||
      p.eligibilityKind !== "PROVISIONAL_EDITORIAL" ||
      p.pricingKind !== "GAME_FIXTURE_NOT_REAL_CONTRACT") {
      errors.push("Invalid provisional NBA fixture " + p.id);
    }
  }
  return errors;
}
