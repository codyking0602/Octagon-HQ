import {
  NBA_GM_ROSTER_SLOTS, NBA_GM_SKILL_KEYS, NBA_GM_TEAM_CODES,
  type NbaGmPick, type NbaGmPosition, type NbaGmSalaryWindow, type NbaGmSlot, type NbaGmSkill, type NbaGmTeamCode,
} from "./nbaGmFoundation";

/** Private server-served fixtures, NOT an official contract feed or certified public roster. */
export interface NbaGmDevPlayer {
  id: string;
  name: string;
  teamCode: NbaGmTeamCode;
  positions: NbaGmPosition[];
  positionReview: string;
  overall: number; // independently authored; never mean of the six ratings
  skills: Record<NbaGmSkill, number>;
  salaries: NbaGmSalaryWindow; // explicitly fictional game numbers
}
export interface NbaGmDevSeason {
  season: number;
  wins: number;
  losses: number;
  finish: string;
  offense: number;
  defense: number;
  rosterBalance: number;
  teamStrength: number;
}
export interface NbaGmDevRun {
  version: "nba-gm-dev-v1";
  seed: string;
  phase: "draft" | "final";
  revision: number;
  picks: NbaGmPick[];
  spinIndex: number;
  pendingTeam: NbaGmTeamCode | null;
  previousTeam: NbaGmTeamCode | null;
  devSalaryCap: number;
  salaryType: string;
  positionType: string;
  results: NbaGmDevSeason[] | null;
}
export interface NbaGmDevSnapshot {
  run: NbaGmDevRun | null;
  catalog: NbaGmDevPlayer[];
}
export const NBA_GM_DEV_VERSION = "nba-gm-dev-v1";
export const NBA_GM_DEV_CAP = 185_000_000; // unapproved development scenario, not a locked rule

const slots = new Set<string>(NBA_GM_ROSTER_SLOTS);
const teams = new Set<string>(NBA_GM_TEAM_CODES);

export function nbaGmDevOpenSlots(picks: readonly NbaGmPick[]): NbaGmSlot[] {
  const taken = new Set(picks.map(p => p.slot));
  return NBA_GM_ROSTER_SLOTS.filter(slot => !taken.has(slot));
}
export function nbaGmDevSpend(picks: readonly NbaGmPick[], catalog: readonly NbaGmDevPlayer[]): NbaGmSalaryWindow {
  const byId = new Map(catalog.map(p => [p.id, p]));
  const total = [0, 0, 0];
  for (const pick of picks) {
    const player = byId.get(pick.playerId);
    if (player) for (let year = 0; year < 3; year++) total[year] += player.salaries[year];
  }
  return total as unknown as NbaGmSalaryWindow;
}
export function nbaGmDevIssues(picks: readonly NbaGmPick[], catalog: readonly NbaGmDevPlayer[],
  cap = NBA_GM_DEV_CAP, requireComplete = false): string[] {
  const issues: string[] = [];
  const byId = new Map(catalog.map(p => [p.id, p]));
  const taken = new Set<string>(), used = new Set<string>();
  if (picks.length > 7) issues.push("Too many roster selections");
  for (const pick of picks) {
    if (!slots.has(pick.slot) || taken.has(pick.slot)) issues.push("Duplicate or invalid slot");
    if (used.has(pick.playerId)) issues.push("Duplicate player");
    const player = byId.get(pick.playerId);
    if (!player) issues.push("Unknown player");
    else if (pick.slot !== "SIXTH" && pick.slot !== "FLEX" && !player.positions.includes(pick.slot)) {
      issues.push("Player is ineligible for " + pick.slot);
    }
    taken.add(pick.slot); used.add(pick.playerId);
  }
  if (requireComplete && (picks.length !== 7 || nbaGmDevOpenSlots(picks).length)) issues.push("Roster incomplete");
  if (nbaGmDevSpend(picks, catalog).some(amount => amount > cap)) issues.push("Salary cap exceeded");
  return issues;
}

/** UI preview mirrors the Football GM cheap-slot reserve; RPC repeats every check under row lock. */
export function nbaGmDevLegalSlots(player: NbaGmDevPlayer, picks: readonly NbaGmPick[],
  catalog: readonly NbaGmDevPlayer[], cap = NBA_GM_DEV_CAP): NbaGmSlot[] {
  if (picks.some(p => p.playerId === player.id)) return [];
  const used = new Set(picks.map(p => p.playerId));
  const spends = nbaGmDevSpend(picks, catalog);
  return nbaGmDevOpenSlots(picks).filter(slot => {
    if (slot !== "SIXTH" && slot !== "FLEX" && !player.positions.includes(slot)) return false;
    const remaining = nbaGmDevOpenSlots([...picks, { slot, playerId: player.id }]);
    return [0,1,2].every(year => {
      const reserve = remaining.reduce((sum, target) => {
        const eligible = catalog.filter(p => p.id !== player.id && !used.has(p.id)
          && (target === "SIXTH" || target === "FLEX" || p.positions.includes(target)));
        if (!eligible.length) return Infinity;
        return sum + Math.min(...eligible.map(p => p.salaries[year]));
      }, 0);
      return spends[year] + player.salaries[year] + reserve <= cap;
    });
  });
}
export function nbaGmDevTeamCandidates(team: string, run: NbaGmDevRun,
  catalog: readonly NbaGmDevPlayer[]): { player: NbaGmDevPlayer; legalSlots: NbaGmSlot[] }[] {
  if (!teams.has(team)) return [];
  return catalog.filter(p => p.teamCode === team).map(player => ({
    player, legalSlots: nbaGmDevLegalSlots(player, run.picks, catalog, run.devSalaryCap),
  })).filter(row => row.legalSlots.length).sort((a,b) => b.player.overall-a.player.overall || a.player.name.localeCompare(b.player.name));
}
export function nbaGmDevCatalogIssues(catalog: readonly NbaGmDevPlayer[]): string[] {
  const issues: string[] = [], seen = new Set<string>();
  if (catalog.length !== 330) issues.push("Expected 330 unique editorial players");
  for (const p of catalog) {
    if (!p.id || seen.has(p.id)) issues.push("Invalid player identity");
    seen.add(p.id);
    if (!teams.has(p.teamCode) || p.positions.length === 0
      || p.positions.some(pos => !["PG","SG","SF","PF","C"].includes(pos))) issues.push("Invalid player team or position");
    if (!Number.isInteger(p.overall) || p.overall < 0 || p.overall > 99
      || NBA_GM_SKILL_KEYS.some(skill => !Number.isInteger(p.skills[skill]) || p.skills[skill] < 0 || p.skills[skill] > 99)) {
      issues.push("Invalid overall or six skills");
    }
    if (p.salaries.length !== 3 || p.salaries.some(s => !Number.isSafeInteger(s) || s <= 0)) issues.push("Invalid fixture salary");
  }
  return issues;
}
