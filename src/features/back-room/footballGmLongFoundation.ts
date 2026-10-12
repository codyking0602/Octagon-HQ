/**
 * NFL GM Long is an independent nine-slot economy. Do not import these settings
 * into Short/Weekly/Multiplayer, which retain their seven slots and $150M cap.
 * OL authority is deliberately fail-closed until audited, source-bound records land.
 */
export const NFL_GM_LONG_VERSION = "nfl-gm-long-phase1";
export const NFL_GM_LONG_CAP = 205_000_000;
export const NFL_GM_LONG_SLOTS = ["QB", "RB", "WR", "FLEX", "OL", "DL", "LB", "DB", "DB2"] as const;
export type NflGmLongSlot = typeof NFL_GM_LONG_SLOTS[number];

export const NFL_GM_LONG_SLOT_LABELS: Readonly<Record<NflGmLongSlot, string>> = {
  QB: "QB", RB: "RB", WR: "WR", FLEX: "FLEX", OL: "OL",
  DL: "FRONT SEVEN 1", LB: "FRONT SEVEN 2", DB: "DB 1", DB2: "DB 2",
};

/** Sum exactly 1.0. QB remains the largest individual influence. */
export const NFL_GM_LONG_POSITION_WEIGHTS: Readonly<Record<NflGmLongSlot, number>> = {
  QB: 0.25, RB: 0.07, WR: 0.10, FLEX: 0.065, OL: 0.12,
  DL: 0.115, LB: 0.115, DB: 0.08, DB2: 0.085,
};
export const NFL_GM_LONG_NEUTRAL_GRADE = 80;

export type NflGmLongOlRole = "T" | "G" | "C";
export interface NflGmLongOlRow {
  team: string;
  name: string;
  role: NflGmLongOlRole;
  /** Audited OL CSV did not record birth dates. Keep unknown, never invent ages. */
  age: number | null;
  currentGrade: number;
  salaryApy: number;
  realContractEndSeason: number;
  gameContract: "1YR" | "3YR";
  // Same probabilities/ceilings expected of Short's research-based development.
  development: {
    breakoutPct: number;
    improvePct: number;
    steadyPct: number;
    declinePct: number;
    maxAnnualGain: number;
    maxAnnualLoss: number;
  };
  sourceUrls: readonly string[];
}

export function nflGmLongOlAuditErrors(
  players: readonly NflGmLongOlRow[],
  canonicalTeams: readonly string[],
): string[] {
  const errors: string[] = [];
  const teams = new Set(canonicalTeams);
  const covered = new Set<string>();
  const unique = new Set<string>();
  if (teams.size !== 32) errors.push("Canonical NFL teams must contain all 32 unique teams.");
  if (players.length !== 179) errors.push(`OL research requires 179 reconciled players; received ${players.length}.`);
  for (const row of players) {
    const key = `${row.team}:${row.name.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    if (!teams.has(row.team)) errors.push(`Unknown NFL club: ${row.team} / ${row.name}`);
    else covered.add(row.team);
    if (unique.has(key)) errors.push(`Duplicate OL identity: ${key}`);
    unique.add(key);
    if (!["T", "G", "C"].includes(row.role)) errors.push(`Unsupported OL role: ${key}`);
    if (row.age !== null && (!Number.isInteger(row.age) || row.age < 20 || row.age > 44)) errors.push(`Invalid OL age: ${key}`);
    if (!Number.isFinite(row.currentGrade) || row.currentGrade < 70 || row.currentGrade > 99) errors.push(`Invalid grade: ${key}`);
    if (!Number.isFinite(row.salaryApy) || row.salaryApy < 500_000 || row.salaryApy > 45_000_000) errors.push(`Invalid OL APY: ${key}`);
    if (!Number.isInteger(row.realContractEndSeason) || row.realContractEndSeason < 2026) errors.push(`Invalid contract end season: ${key}`);
    const expectedContract = row.realContractEndSeason >= 2028 ? "3YR" : "1YR";
    if (row.gameContract !== expectedContract) errors.push(`Incorrect 2026–2028 contract classification: ${key}`);
    if (!row.development || [
      row.development.breakoutPct, row.development.improvePct,
      row.development.steadyPct, row.development.declinePct,
    ].some(value => !Number.isFinite(value) || value < 0)
      || Math.abs(row.development.breakoutPct + row.development.improvePct
        + row.development.steadyPct + row.development.declinePct - 100) > 0.001
      || !Number.isFinite(row.development.maxAnnualGain)
      || !Number.isFinite(row.development.maxAnnualLoss)
      || row.development.maxAnnualGain < 0 || row.development.maxAnnualLoss < 0
    ) errors.push(`Incomplete OL development research: ${key}`);
    if (!Array.isArray(row.sourceUrls) || !row.sourceUrls.length || row.sourceUrls.some(url => !/^https:\/\//.test(url))) {
      errors.push(`Missing OL evidence URL: ${key}`);
    }
  }
  for (const team of teams) if (!covered.has(team)) errors.push(`No offensive lineman for ${team}`);
  if (!players.some(row => row.role === "T") || !players.some(row => row.role === "G") || !players.some(row => row.role === "C")) {
    errors.push("OL research must cover tackles, guards, and centers.");
  }
  return errors;
}

export interface NflGmLongPlayerFit {
  id: string;
  eligibleSlots: readonly NflGmLongSlot[];
  currentGrade: number;
  salaryWindow: readonly [number, number, number];
}

export interface NflGmLongPick {
  slot: NflGmLongSlot;
  playerId: string;
}

export function nflGmLongSpend(
  picks: readonly NflGmLongPick[],
  catalog: ReadonlyMap<string, NflGmLongPlayerFit>,
  year: 1 | 2 | 3 = 1,
): number {
  return picks.reduce((total, pick) => total + (catalog.get(pick.playerId)?.salaryWindow[year - 1] ?? 0), 0);
}

/** No inferred or missing prices; fail closed on identity, duplicates, and cap. */
export function nflGmLongValidRoster(
  picks: readonly NflGmLongPick[],
  catalog: ReadonlyMap<string, NflGmLongPlayerFit>,
): boolean {
  if (picks.length > NFL_GM_LONG_SLOTS.length) return false;
  const slots = new Set<NflGmLongSlot>();
  const ids = new Set<string>();
  let spend = 0;
  for (const pick of picks) {
    const player = catalog.get(pick.playerId);
    if (!player || slots.has(pick.slot) || ids.has(pick.playerId) || !player.eligibleSlots.includes(pick.slot)) return false;
    if (!Number.isFinite(player.salaryWindow[0]) || player.salaryWindow[0] <= 0) return false;
    slots.add(pick.slot);
    ids.add(pick.playerId);
    spend += player.salaryWindow[0];
  }
  return spend <= NFL_GM_LONG_CAP;
}

export function nflGmLongOverall(
  picks: readonly NflGmLongPick[],
  catalog: ReadonlyMap<string, NflGmLongPlayerFit>,
): number | null {
  if (picks.length !== NFL_GM_LONG_SLOTS.length || !nflGmLongValidRoster(picks, catalog)) return null;
  const baseline = NFL_GM_LONG_NEUTRAL_GRADE;
  const premium = picks.reduce((sum, entry) => {
    const player = catalog.get(entry.playerId)!;
    return sum + NFL_GM_LONG_POSITION_WEIGHTS[entry.slot] * (player.currentGrade - baseline);
  }, 0);
  return Math.round((baseline + premium) * 10) / 10;
}
