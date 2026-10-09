import {
  contractsArtifact,
  frontSevenGradesArtifact,
  qbGradesArtifact,
  rbGradesArtifact,
  secondaryGradesArtifact,
  teGradesArtifact,
  wrGradesArtifact,
} from "./wheelFootballNflCurrentAuthority";
import {
  WHEEL_FOOTBALL_GM_CAP,
  WHEEL_FOOTBALL_GM_ROSTER_SLOTS,
  projectWheelFootballGmExtensionApy,
  projectWheelFootballGmGrade,
  wheelFootballGmMarketPositionForContract,
  wheelFootballGmOutlook,
  wheelFootballGmSalaryWindow,
  type WheelFootballGmContractRow,
  type WheelFootballGmRosterSlot,
  type WheelFootballGmMarketPosition,
} from "./wheelFootballGmEconomy";

import { footballGmActualRole, footballGmWeightedContribution, FOOTBALL_GM_NEUTRAL_GRADE } from "./footballGmPositionalValue";

export const FOOTBALL_GM_VERSION = "football-gm-v1-playtest";
export const FOOTBALL_GM_CAP = WHEEL_FOOTBALL_GM_CAP;
export const FOOTBALL_GM_ROSTER_SLOTS = WHEEL_FOOTBALL_GM_ROSTER_SLOTS;

// Persist the original DL/LB keys to keep existing solo and shared match saves valid.
// Both are now player-agnostic Front Seven positions.
export function footballGmSlotLabel(slot: FootballGmRosterSlot): string {
  return slot === "DL" ? "F7-1" : slot === "LB" ? "F7-2" : slot;
}

export type FootballGmRosterSlot = WheelFootballGmRosterSlot;
export type FootballGmPhase = "draft" | "year1" | "offseason" | "year2" | "final";
export type FootballGmPlayoffFinish =
  | "Missed Playoffs"
  | "Wild Card"
  | "Divisional"
  | "Conference Championship"
  | "Super Bowl Loss"
  | "Champion";

/**
 * The stored playoff finish remains a stable internal key for simulation,
 * scoring, and historical runs. Public-facing labels must describe whether
 * the team WON or LOST, not merely name the round it reached.
 */
export function footballGmPlayoffFinishLabel(finish: FootballGmPlayoffFinish): string {
  const labels: Record<FootballGmPlayoffFinish, string> = {
    "Missed Playoffs": "Missed Playoffs",
    "Wild Card": "Lost Wild Card Round",
    Divisional: "Lost Divisional Round",
    "Conference Championship": "Lost Conference Championship",
    "Super Bowl Loss": "Lost Super Bowl",
    Champion: "Super Bowl Champion",
  };
  return labels[finish];
}

export type FootballGmExtensionRisk = "LOCKED" | "LOW" | "MEDIUM" | "HIGH";

export interface FootballGmPlayer {
  id: string;
  team: string;
  family: WheelFootballGmContractRow["family"];
  name: string;
  position: string;
  eligibleSlots: readonly FootballGmRosterSlot[];
  marketPosition: WheelFootballGmMarketPosition;
  age: number;
  salaryApy: number;
  gameContract: "1YR" | "3YR";
  draftYear: number | null;
  draftOverall: number | null;
  projectionAdjustment: number;
  currentGrade: number;
  projectedExtensionApy: number;
  salaryWindow: readonly [number, number, number];
  outlook: "ELITE UPSIDE" | "RISING" | "DECLINE RISK" | "STABLE";
  extensionRisk: FootballGmExtensionRisk;
}

export interface FootballGmRosterEntry {
  slot: FootballGmRosterSlot;
  playerId: string;
  acquired: "draft" | "trade" | "replacement";
}

export interface FootballGmSeasonResult {
  year: 1 | 2 | 3;
  teamGrade: number;
  finish: FootballGmPlayoffFinish;
  postseasonBonus: number;
}

export interface FootballGmTradeOffer {
  id: string;
  outgoingPlayerId: string;
  incomingPlayerId: string;
  slot: FootballGmRosterSlot;
  yearTwoSavings: number;
}

export interface FootballGmFinalResult {
  score: number;
  coreScore: number;
  postseasonBonus: number;
  seasons: readonly FootballGmSeasonResult[];
  roster: readonly {
    slot: FootballGmRosterSlot;
    playerId: string;
    name: string;
    team: string;
  }[];
}

type GradeArtifact = {
  grades: Array<{ team: string; player: string; grade: number }>;
};

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/(?:iii|ii|iv|jr|sr|v)$/, "");
}

function gradeKey(team: string, family: string, player: string) {
  return `${team}|${family}|${normalizeName(player)}`;
}

const gradeArtifacts: ReadonlyArray<readonly [WheelFootballGmContractRow["family"], GradeArtifact]> = [
  ["QB", qbGradesArtifact as GradeArtifact],
  ["RB", rbGradesArtifact as GradeArtifact],
  ["WR", wrGradesArtifact as GradeArtifact],
  ["TE", teGradesArtifact as GradeArtifact],
  ["Front Seven", frontSevenGradesArtifact as GradeArtifact],
  ["Secondary", secondaryGradesArtifact as GradeArtifact],
];

const gradeByKey = new Map<string, number>();
for (const [family, artifact] of gradeArtifacts) {
  for (const row of artifact.grades) {
    gradeByKey.set(gradeKey(row.team, family, row.player), row.grade);
  }
}

function playerId(contract: WheelFootballGmContractRow) {
  return gradeKey(contract.team, contract.family, contract.player);
}

function extensionRisk(contract: WheelFootballGmContractRow, extensionApy: number): FootballGmExtensionRisk {
  if (contract.gameContract === "3YR") return "LOCKED";
  const increase = extensionApy - contract.salaryApy;
  const multiple = extensionApy / Math.max(1, contract.salaryApy);
  if (increase >= 20_000_000 || multiple >= 4) return "HIGH";
  if (increase >= 8_000_000 || multiple >= 2) return "MEDIUM";
  return "LOW";
}

const contracts = (contractsArtifact as { players: WheelFootballGmContractRow[] }).players;

export const FOOTBALL_GM_PLAYER_POOL: readonly FootballGmPlayer[] = contracts.map((contract) => {
  const currentGrade = gradeByKey.get(gradeKey(contract.team, contract.family, contract.player));
  if (currentGrade == null) {
    throw new Error(`Missing GM grade for ${contract.team} ${contract.player}`);
  }
  const marketPosition = wheelFootballGmMarketPositionForContract(contract);
  const projectionAdjustment = contract.projectionAdjustment ?? 0;
  const projectedExtensionApy = projectWheelFootballGmExtensionApy({
    currentGrade,
    age: contract.age,
    position: marketPosition,
    marketRole: footballGmActualRole(contract),
    draftYear: contract.draftYear,
    draftOverall: contract.draftOverall,
    projectionAdjustment,
  });
  return {
    id: playerId(contract),
    team: contract.team,
    family: contract.family,
    name: contract.player,
    position: contract.position,
    // Both defensive roster spots accept any Front Seven player; contract
    // markets remain based on each player's original distinct DL/LB family.
    eligibleSlots: contract.family === "Front Seven" ? ["DL", "LB"] : [...contract.gmEligibleSlots],
    marketPosition,
    age: contract.age,
    salaryApy: contract.salaryApy,
    gameContract: contract.gameContract,
    draftYear: contract.draftYear,
    draftOverall: contract.draftOverall,
    projectionAdjustment,
    currentGrade,
    projectedExtensionApy,
    salaryWindow: wheelFootballGmSalaryWindow({
      gameContract: contract.gameContract,
      salaryApy: contract.salaryApy,
      projectedExtensionApy,
    }),
    outlook: wheelFootballGmOutlook({
      currentGrade,
      age: contract.age,
      position: marketPosition,
      draftYear: contract.draftYear,
      draftOverall: contract.draftOverall,
      projectionAdjustment,
    }),
    extensionRisk: extensionRisk(contract, projectedExtensionApy),
  };
});

const playerById = new Map(FOOTBALL_GM_PLAYER_POOL.map((player) => [player.id, player]));
const playersByTeam = new Map<string, FootballGmPlayer[]>();
for (const player of FOOTBALL_GM_PLAYER_POOL) {
  const list = playersByTeam.get(player.team) ?? [];
  list.push(player);
  playersByTeam.set(player.team, list);
}

export const FOOTBALL_GM_TEAMS = [...playersByTeam.keys()].sort();

export function footballGmPlayerById(id: string) {
  return playerById.get(id) ?? null;
}

export function footballGmRosterPlayers(roster: readonly FootballGmRosterEntry[]) {
  return roster.flatMap((entry) => {
    const player = footballGmPlayerById(entry.playerId);
    return player ? [{ entry, player }] : [];
  });
}

export function footballGmReflowRoster(
  roster: readonly FootballGmRosterEntry[],
): FootballGmRosterEntry[] | null {
  if (roster.length > FOOTBALL_GM_ROSTER_SLOTS.length) return null;
  const seen = new Set<string>();
  const rows = roster.flatMap((entry, index) => {
    if (seen.has(entry.playerId)) return [];
    const player = footballGmPlayerById(entry.playerId);
    if (!player) return [];
    seen.add(entry.playerId);
    return [{ entry, player, index }];
  });
  if (rows.length !== roster.length) return null;

  const ordered = [...rows].sort((left, right) => (
    left.player.eligibleSlots.length - right.player.eligibleSlots.length
    || left.index - right.index
  ));
  const used = new Set<FootballGmRosterSlot>();
  const current: FootballGmRosterEntry[] = [];
  let resolved: FootballGmRosterEntry[] | null = null;

  function place(index: number): boolean {
    if (index >= ordered.length) {
      resolved = current
        .map((entry) => ({ ...entry }))
        .sort((left, right) => (
          FOOTBALL_GM_ROSTER_SLOTS.indexOf(left.slot) - FOOTBALL_GM_ROSTER_SLOTS.indexOf(right.slot)
        ));
      return true;
    }

    const row = ordered[index]!;
    const slots = [...row.player.eligibleSlots].sort((left, right) => {
      const rank = (slot: FootballGmRosterSlot) => {
        if (slot !== "FLEX" && slot === row.entry.slot) return 0;
        if (slot !== "FLEX") return 1;
        if (slot === row.entry.slot) return 2;
        return 3;
      };
      return rank(left) - rank(right)
        || FOOTBALL_GM_ROSTER_SLOTS.indexOf(left) - FOOTBALL_GM_ROSTER_SLOTS.indexOf(right);
    });

    for (const slot of slots) {
      if (used.has(slot)) continue;
      used.add(slot);
      current.push({ slot, playerId: row.player.id, acquired: row.entry.acquired });
      if (place(index + 1)) return true;
      current.pop();
      used.delete(slot);
    }
    return false;
  }

  return place(0) ? resolved : null;
}

export function footballGmOpenSlots(roster: readonly FootballGmRosterEntry[]) {
  const normalized = footballGmReflowRoster(roster) ?? roster;
  const filled = new Set(normalized.map((entry) => entry.slot));
  return FOOTBALL_GM_ROSTER_SLOTS.filter((slot) => !filled.has(slot));
}

export function footballGmSalaryForYear(player: FootballGmPlayer, year: 1 | 2 | 3) {
  return player.salaryWindow[year - 1];
}

export function footballGmRosterCap(roster: readonly FootballGmRosterEntry[], year: 1 | 2 | 3) {
  return footballGmRosterPlayers(roster).reduce(
    (total, row) => total + footballGmSalaryForYear(row.player, year),
    0,
  );
}

function minSalaryForSlot(slot: FootballGmRosterSlot, year: 1 | 2 | 3, excludedIds: ReadonlySet<string>) {
  let minimum = Number.POSITIVE_INFINITY;
  for (const player of FOOTBALL_GM_PLAYER_POOL) {
    if (excludedIds.has(player.id) || !player.eligibleSlots.includes(slot)) continue;
    minimum = Math.min(minimum, footballGmSalaryForYear(player, year));
  }
  return Number.isFinite(minimum) ? minimum : FOOTBALL_GM_CAP;
}

function reserveForRemainingSlots(
  slots: readonly FootballGmRosterSlot[],
  year: 1 | 2 | 3,
  excludedIds: ReadonlySet<string>,
) {
  return slots.reduce((sum, slot) => sum + minSalaryForSlot(slot, year, excludedIds), 0);
}

function rosterUsedIds(roster: readonly FootballGmRosterEntry[]) {
  return new Set(roster.map((entry) => entry.playerId));
}

function distinctPlayerNameUsed(roster: readonly FootballGmRosterEntry[], candidate: FootballGmPlayer) {
  const normalized = normalizeName(candidate.name);
  return footballGmRosterPlayers(roster).some(({ player }) => normalizeName(player.name) === normalized);
}

function canAddPlayerToSlot(input: {
  roster: readonly FootballGmRosterEntry[];
  player: FootballGmPlayer;
  slot: FootballGmRosterSlot;
  year: 1 | 2;
  excludedPlayerIds?: readonly string[];
}) {
  const { player, slot, year } = input;
  const roster = footballGmReflowRoster(input.roster);
  if (!roster) return false;
  const globallyExcluded = new Set(input.excludedPlayerIds ?? []);
  if (globallyExcluded.has(player.id)) return false;
  if (!player.eligibleSlots.includes(slot)) return false;
  if (roster.some((entry) => entry.slot === slot)) return false;
  if (roster.some((entry) => entry.playerId === player.id) || distinctPlayerNameUsed(roster, player)) return false;

  const currentSpend = footballGmRosterCap(roster, year);
  const playerSalary = footballGmSalaryForYear(player, year);
  const used = rosterUsedIds(roster);
  for (const playerId of globallyExcluded) used.add(playerId);
  used.add(player.id);
  const remainingSlots = footballGmOpenSlots([...roster, { slot, playerId: player.id, acquired: "draft" }]);
  const reserve = reserveForRemainingSlots(remainingSlots, year, used);
  return currentSpend + playerSalary + reserve <= FOOTBALL_GM_CAP;
}

export interface FootballGmTeamCandidate {
  player: FootballGmPlayer;
  legalSlots: readonly FootballGmRosterSlot[];
  salary: number;
}

export function footballGmCandidatesForTeam(input: {
  team: string;
  roster: readonly FootballGmRosterEntry[];
  year?: 1 | 2;
  excludedPlayerIds?: readonly string[];
}) {
  const year = input.year ?? 1;
  const players = playersByTeam.get(input.team) ?? [];
  const roster = footballGmReflowRoster(input.roster) ?? input.roster;
  const open = footballGmOpenSlots(roster);
  return players.flatMap<FootballGmTeamCandidate>((player) => {
    const legalSlots = open.filter((slot) => canAddPlayerToSlot({
      roster,
      player,
      slot,
      year,
      excludedPlayerIds: input.excludedPlayerIds,
    }));
    return legalSlots.length
      ? [{ player, legalSlots, salary: footballGmSalaryForYear(player, year) }]
      : [];
  }).sort((left, right) => (
    left.salary - right.salary
    || left.player.name.localeCompare(right.player.name)
  ));
}

export function footballGmEligibleTeams(input: {
  roster: readonly FootballGmRosterEntry[];
  previousTeam?: string | null;
  year?: 1 | 2;
  excludedPlayerIds?: readonly string[];
}) {
  const teams = FOOTBALL_GM_TEAMS.filter((team) => footballGmCandidatesForTeam({
    team,
    roster: input.roster,
    year: input.year ?? 1,
    excludedPlayerIds: input.excludedPlayerIds,
  }).length > 0);
  if (input.previousTeam && teams.length > 1) {
    const withoutRepeat = teams.filter((team) => team !== input.previousTeam);
    if (withoutRepeat.length) return withoutRepeat;
  }
  return teams;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function footballGmSpinTeam(seed: string, spinIndex: number, eligibleTeams: readonly string[]) {
  if (!eligibleTeams.length) return null;
  const hash = hashString(`${seed}:${spinIndex}:${eligibleTeams.join(",")}`);
  return eligibleTeams[hash % eligibleTeams.length] ?? null;
}

export function footballGmAddPick(
  roster: readonly FootballGmRosterEntry[],
  playerIdValue: string,
  slot: FootballGmRosterSlot,
  acquired: FootballGmRosterEntry["acquired"] = "draft",
) {
  const player = footballGmPlayerById(playerIdValue);
  if (!player) throw new Error("That GM player is unavailable.");
  const normalized = footballGmReflowRoster(roster);
  if (!normalized || !canAddPlayerToSlot({ roster: normalized, player, slot, year: acquired === "draft" ? 1 : 2 })) {
    throw new Error("That player no longer fits this roster and cap.");
  }
  const next = footballGmReflowRoster([
    ...normalized,
    { slot, playerId: player.id, acquired },
  ]);
  if (!next) throw new Error("That player no longer fits this roster and cap.");
  return next;
}

export function footballGmAutoAddPick(
  roster: readonly FootballGmRosterEntry[],
  playerIdValue: string,
  acquired: FootballGmRosterEntry["acquired"] = "draft",
) {
  const player = footballGmPlayerById(playerIdValue);
  if (!player) throw new Error("That GM player is unavailable.");
  const slots = [...player.eligibleSlots].sort((left, right) => (
    Number(left === "FLEX") - Number(right === "FLEX")
    || FOOTBALL_GM_ROSTER_SLOTS.indexOf(left) - FOOTBALL_GM_ROSTER_SLOTS.indexOf(right)
  ));
  for (const slot of slots) {
    try {
      return footballGmAddPick(roster, player.id, slot, acquired);
    } catch {
      // Try the next legal assignment. FLEX is a fallback, not a user trap.
    }
  }
  throw new Error("That player no longer fits this roster and cap.");
}

export function footballGmReplacePlayer(
  roster: readonly FootballGmRosterEntry[],
  slot: FootballGmRosterSlot,
  incomingPlayerId: string,
  acquired: "trade" | "replacement",
) {
  const outgoing = roster.find((entry) => entry.slot === slot);
  const incoming = footballGmPlayerById(incomingPlayerId);
  if (!outgoing || !incoming || !incoming.eligibleSlots.includes(slot)) {
    throw new Error("That replacement is unavailable.");
  }
  const stripped = roster.filter((entry) => entry.slot !== slot);
  if (stripped.some((entry) => entry.playerId === incoming.id) || distinctPlayerNameUsed(stripped, incoming)) {
    throw new Error("That player is already on this roster.");
  }
  const next = [...stripped, { slot, playerId: incoming.id, acquired }];
  const currentYearTwo = footballGmRosterCap(roster, 2);
  const nextYearTwo = footballGmRosterCap(next, 2);
  const currentYearThree = footballGmRosterCap(roster, 3);
  const nextYearThree = footballGmRosterCap(next, 3);
  const improvesCrisis = (
    nextYearTwo < currentYearTwo
    && nextYearThree < currentYearThree
  );
  const remainsCompliant = (
    currentYearTwo <= FOOTBALL_GM_CAP
    && currentYearThree <= FOOTBALL_GM_CAP
    && nextYearTwo <= FOOTBALL_GM_CAP
    && nextYearThree <= FOOTBALL_GM_CAP
  );
  if (!improvesCrisis && !remainsCompliant) {
    throw new Error("That move does not improve the cap situation.");
  }
  return next;
}

export function footballGmReplacementCandidatesForTeam(input: {
  team: string;
  roster: readonly FootballGmRosterEntry[];
  slot: FootballGmRosterSlot;
}) {
  const players = playersByTeam.get(input.team) ?? [];
  return players.flatMap<FootballGmTeamCandidate>((player) => {
    try {
      footballGmReplacePlayer(input.roster, input.slot, player.id, "replacement");
      return [{
        player,
        legalSlots: [input.slot],
        salary: footballGmSalaryForYear(player, 2),
      }];
    } catch {
      return [];
    }
  }).sort((left, right) => left.salary - right.salary || left.player.name.localeCompare(right.player.name));
}

export function footballGmEligibleReplacementTeams(input: {
  roster: readonly FootballGmRosterEntry[];
  slot: FootballGmRosterSlot;
  previousTeam?: string | null;
}) {
  const teams = FOOTBALL_GM_TEAMS.filter((team) => footballGmReplacementCandidatesForTeam({
    team,
    roster: input.roster,
    slot: input.slot,
  }).length > 0);
  if (input.previousTeam && teams.length > 1) {
    const withoutRepeat = teams.filter((team) => team !== input.previousTeam);
    if (withoutRepeat.length) return withoutRepeat;
  }
  return teams;
}

export function footballGmProjectedGradeForPlayer(
  player: FootballGmPlayer,
  year: 1 | 2 | 3,
  seed?: string,
) {
  const marketPosition = player.marketPosition;
  return projectWheelFootballGmGrade({
    currentGrade: player.currentGrade,
    age: player.age,
    position: marketPosition,
    yearsAhead: (year - 1) as 0 | 1 | 2,
    draftYear: player.draftYear,
    draftOverall: player.draftOverall,
    projectionAdjustment: player.projectionAdjustment,
    seed,
    playerId: player.id,
  });
}

/** A single seed-owned Year 2 offer, also locked for Year 3. */
export function footballGmProjectedExtensionForPlayer(player: FootballGmPlayer, seed: string) {
  if (player.gameContract === "3YR") return player.salaryApy;
  const marketPosition = player.marketPosition;
  return projectWheelFootballGmExtensionApy({
    currentGrade: player.currentGrade,
    age: player.age,
    position: marketPosition,
    marketRole: footballGmActualRole(player),
    draftYear: player.draftYear,
    draftOverall: player.draftOverall,
    projectionAdjustment: player.projectionAdjustment,
    seed,
    playerId: player.id,
  });
}

export function footballGmTeamGrade(roster: readonly FootballGmRosterEntry[], year: 1 | 2 | 3) {
  if (roster.length !== FOOTBALL_GM_ROSTER_SLOTS.length) return 0;
  const score = roster.reduce((sum, entry) => {
    const player = footballGmPlayerById(entry.playerId);
    if (!player) return sum;
    return sum + footballGmWeightedContribution(player, entry.slot, footballGmProjectedGradeForPlayer(player, year));
  }, FOOTBALL_GM_NEUTRAL_GRADE);
  return Math.round(score * 10) / 10;
}

export function footballGmPlayoffFinish(teamGrade: number): FootballGmPlayoffFinish {
  if (teamGrade >= 95) return "Champion";
  if (teamGrade >= 92) return "Super Bowl Loss";
  if (teamGrade >= 89) return "Conference Championship";
  if (teamGrade >= 86) return "Divisional";
  if (teamGrade >= 83) return "Wild Card";
  return "Missed Playoffs";
}

export function footballGmPostseasonBonus(finish: FootballGmPlayoffFinish) {
  if (finish === "Champion") return 7;
  if (finish === "Super Bowl Loss") return 5;
  if (finish === "Conference Championship") return 3.5;
  if (finish === "Divisional") return 2;
  if (finish === "Wild Card") return 1;
  return 0;
}

export function footballGmSeasonResult(
  roster: readonly FootballGmRosterEntry[],
  year: 1 | 2 | 3,
): FootballGmSeasonResult {
  const teamGrade = footballGmTeamGrade(roster, year);
  const finish = footballGmPlayoffFinish(teamGrade);
  return {
    year,
    teamGrade,
    finish,
    postseasonBonus: footballGmPostseasonBonus(finish),
  };
}

export function footballGmIsOffseasonCompliant(roster: readonly FootballGmRosterEntry[]) {
  return roster.length === FOOTBALL_GM_ROSTER_SLOTS.length
    && footballGmRosterCap(roster, 2) <= FOOTBALL_GM_CAP
    && footballGmRosterCap(roster, 3) <= FOOTBALL_GM_CAP;
}

export function footballGmTradeOffers(
  seed: string,
  roster: readonly FootballGmRosterEntry[],
): readonly FootballGmTradeOffer[] {
  const offers: FootballGmTradeOffer[] = [];
  const usedIncoming = new Set<string>();
  const rows = footballGmRosterPlayers(roster)
    .filter(({ player }) => player.gameContract === "1YR")
    .sort((left, right) => {
      const leftIncrease = left.player.salaryWindow[1] - left.player.salaryWindow[0];
      const rightIncrease = right.player.salaryWindow[1] - right.player.salaryWindow[0];
      return rightIncrease - leftIncrease;
    });

  for (const { entry, player: outgoing } of rows) {
    const stripped = roster.filter((row) => row.slot !== entry.slot);
    const alternatives = FOOTBALL_GM_PLAYER_POOL
      .filter((incoming) => incoming.team !== outgoing.team)
      .filter((incoming) => !usedIncoming.has(incoming.id))
      .filter((incoming) => incoming.eligibleSlots.includes(entry.slot))
      .filter((incoming) => footballGmSalaryForYear(incoming, 2) < footballGmSalaryForYear(outgoing, 2))
      .filter((incoming) => footballGmProjectedGradeForPlayer(incoming, 2) >= footballGmProjectedGradeForPlayer(outgoing, 2) - 7)
      .filter((incoming) => !distinctPlayerNameUsed(stripped, incoming))
      .filter((incoming) => {
        try {
          footballGmReplacePlayer(roster, entry.slot, incoming.id, "trade");
          return true;
        } catch {
          return false;
        }
      })
      .sort((left, right) => {
        const leftScore = footballGmProjectedGradeForPlayer(left, 2) * 2
          - (footballGmSalaryForYear(left, 2) / 1_000_000);
        const rightScore = footballGmProjectedGradeForPlayer(right, 2) * 2
          - (footballGmSalaryForYear(right, 2) / 1_000_000);
        return rightScore - leftScore;
      });
    if (!alternatives.length) continue;
    const top = alternatives.slice(0, Math.min(8, alternatives.length));
    const incoming = top[hashString(`${seed}:trade:${entry.slot}:${outgoing.id}`) % top.length]!;
    const candidateRoster = footballGmReplacePlayer(roster, entry.slot, incoming.id, "trade");
    if (footballGmRosterCap(candidateRoster, 2) > FOOTBALL_GM_CAP + 20_000_000) continue;
    usedIncoming.add(incoming.id);
    offers.push({
      id: `${entry.slot}:${outgoing.id}:${incoming.id}`,
      outgoingPlayerId: outgoing.id,
      incomingPlayerId: incoming.id,
      slot: entry.slot,
      yearTwoSavings: footballGmSalaryForYear(outgoing, 2) - footballGmSalaryForYear(incoming, 2),
    });
    if (offers.length >= 2) break;
  }

  return offers;
}

export function footballGmFinalResult(
  yearOneRoster: readonly FootballGmRosterEntry[],
  finalRoster: readonly FootballGmRosterEntry[],
): FootballGmFinalResult {
  const seasons = [
    footballGmSeasonResult(yearOneRoster, 1),
    footballGmSeasonResult(finalRoster, 2),
    footballGmSeasonResult(finalRoster, 3),
  ] as const;
  const coreScore = seasons.reduce((sum, season) => sum + season.teamGrade, 0) / seasons.length;
  const postseasonBonus = seasons.reduce((sum, season) => sum + season.postseasonBonus, 0) / seasons.length;
  const score = Math.round((coreScore + postseasonBonus) * 10) / 10;
  return {
    score,
    coreScore: Math.round(coreScore * 10) / 10,
    postseasonBonus: Math.round(postseasonBonus * 10) / 10,
    seasons,
    roster: finalRoster.map((entry) => {
      const player = footballGmPlayerById(entry.playerId);
      return {
        slot: entry.slot,
        playerId: entry.playerId,
        name: player?.name ?? entry.playerId,
        team: player?.team ?? "",
      };
    }),
  };
}

export function footballGmMoney(value: number) {
  const millions = value / 1_000_000;
  if (millions >= 10 || Number.isInteger(millions)) return `$${millions.toFixed(millions >= 10 ? 1 : 2).replace(/\.0$/, "")}M`;
  return `$${millions.toFixed(2).replace(/0$/, "")}M`;
}
