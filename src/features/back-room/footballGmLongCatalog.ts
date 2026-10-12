import { FOOTBALL_GM_PLAYER_POOL, FOOTBALL_GM_TEAMS, type FootballGmPlayer } from "./footballGmEngine";
import { NFL_GM_LONG_CAP, NFL_GM_LONG_SLOTS, NFL_GM_LONG_POSITION_WEIGHTS, nflGmLongValidRoster, nflGmLongOlAuditErrors,
  type NflGmLongOlRow, type NflGmLongPlayerFit, type NflGmLongPick, type NflGmLongSlot } from "./footballGmLongFoundation";
import { NFL_GM_LONG_OL_DATA_A } from "./footballGmLongOlDataA";
import { NFL_GM_LONG_OL_DATA_B } from "./footballGmLongOlDataB";

export interface NflGmLongPlayer extends NflGmLongPlayerFit {
  name: string;
  team: string;
  position: string;
  family: string;
  age: number | null;
  gameContract: "1YR" | "3YR";
  role: "T" | "G" | "C" | "QB" | "RB" | "WR" | "TE" | "EDGE" | "IDL" | "LB" | "CB" | "S";
  development: NflGmLongOlRow["development"] | null;
  sourceUrls: readonly string[];
}

const otcSource = "https://server.overthecap.com/position/offensive-line";
const gradingSource = "https://www.pff.com/news/nfl-offensive-line-rankings-2026";
const marketCurve = [[75, 2], [80, 5], [84, 11], [88, 17], [92, 24], [96, 29], [99, 32]] as const;

function olMarket(grade: number) {
  for (let i = 1; i < marketCurve.length; i++) {
    const a = marketCurve[i - 1]!, b = marketCurve[i]!;
    if (grade <= b[0]) return (a[1] + (b[1] - a[1]) * (Math.max(75, grade) - a[0]) / (b[0] - a[0])) * 1_000_000;
  }
  return 32_000_000;
}
function num(value: string) { return Number(value); }
function parseOl(): NflGmLongOlRow[] {
  return [NFL_GM_LONG_OL_DATA_A, NFL_GM_LONG_OL_DATA_B].join("\n").trim().split("\n").map(line => {
    const [team, name, position, grade, apy, term, end, chances] = line.split("|");
    const [breakoutPct, improvePct, declinePct, maxAnnualGain, maxAnnualLoss] = chances!.split(",").map(num);
    const role = position === "C" ? "C" : position!.includes("G") || position === "G" ? "G" : "T";
    return {
      team: team!, name: name!, role, age: null,
      currentGrade: num(grade!), salaryApy: Math.round(num(apy!) * 1_000_000),
      gameContract: term as "1YR" | "3YR", realContractEndSeason: num(end!),
      development: { breakoutPct, improvePct,
        steadyPct: 100 - breakoutPct - improvePct - declinePct, declinePct,
        maxAnnualGain, maxAnnualLoss },
      sourceUrls: [gradingSource, otcSource],
    };
  });
}
export const NFL_GM_LONG_OL_PLAYERS: readonly NflGmLongOlRow[] = parseOl();
const auditErrors = nflGmLongOlAuditErrors(NFL_GM_LONG_OL_PLAYERS, FOOTBALL_GM_TEAMS);
if (auditErrors.length) throw new Error("NFL GM Long OL authority failed validation: " + auditErrors.slice(0, 4).join("; "));

function existingRole(player: FootballGmPlayer): NflGmLongPlayer["role"] {
  if (player.family === "QB") return "QB";
  if (player.family === "RB") return "RB";
  if (player.family === "WR") return "WR";
  if (player.family === "TE") return "TE";
  if (player.family === "Secondary") return ["S", "SS", "FS"].includes(player.position) ? "S" : "CB";
  return ["ED", "EDGE", "DE"].includes(player.position) ? "EDGE"
    : ["DT", "IDL", "NT"].includes(player.position) ? "IDL" : "LB";
}
function existingSlots(player: FootballGmPlayer): NflGmLongSlot[] {
  if (player.family === "Front Seven") return ["DL", "LB"];
  if (player.family === "Secondary") return ["DB", "DB2"];
  return player.eligibleSlots as NflGmLongSlot[];
}
const normal: NflGmLongPlayer[] = FOOTBALL_GM_PLAYER_POOL.map(player => ({
  id: player.id, name: player.name, team: player.team, position: player.position,
  family: player.family, age: player.age, gameContract: player.gameContract,
  role: existingRole(player), eligibleSlots: existingSlots(player),
  currentGrade: player.currentGrade, salaryWindow: player.salaryWindow,
  development: null, sourceUrls: [],
}));
const linePlayers: NflGmLongPlayer[] = NFL_GM_LONG_OL_PLAYERS.map(row => {
  const projected = Math.max(1_000_000, Math.round(olMarket(row.currentGrade + 0.35) / 500_000) * 500_000);
  return {
    id: row.team + "|OL|" + row.name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""),
    name: row.name, team: row.team, position: row.role, family: "OL", age: row.age,
    gameContract: row.gameContract, role: row.role,
    eligibleSlots: ["OL"], currentGrade: row.currentGrade,
    salaryWindow: [row.salaryApy, row.gameContract === "3YR" ? row.salaryApy : projected,
      row.gameContract === "3YR" ? row.salaryApy : projected],
    development: row.development, sourceUrls: row.sourceUrls,
  };
});
export const NFL_GM_LONG_PLAYER_POOL: readonly NflGmLongPlayer[] = [...normal, ...linePlayers];
export const NFL_GM_LONG_BY_ID: ReadonlyMap<string, NflGmLongPlayer> = new Map(NFL_GM_LONG_PLAYER_POOL.map(player => [player.id, player]));
const teamsMap = new Map<string, NflGmLongPlayer[]>();
for (const player of NFL_GM_LONG_PLAYER_POOL) {
  const arr = teamsMap.get(player.team) ?? [];
  arr.push(player); teamsMap.set(player.team, arr);
}
const cheapestBySlot = new Map(NFL_GM_LONG_SLOTS.map(slot => [slot,
  Math.min(...NFL_GM_LONG_PLAYER_POOL.filter(p => p.eligibleSlots.includes(slot)).map(p => p.salaryWindow[0]))]));

export function nflGmLongOpenSlots(picks: readonly NflGmLongPick[]) {
  const occupied = new Set(picks.map(p => p.slot));
  return NFL_GM_LONG_SLOTS.filter(slot => !occupied.has(slot));
}
export function nflGmLongTeamCandidates(team: string, picks: readonly NflGmLongPick[]) {
  const taken = new Set(picks.map(p => p.playerId));
  const identities = new Set(picks.map(p => NFL_GM_LONG_BY_ID.get(p.playerId)?.name.toLowerCase()));
  const filled = new Set(picks.map(p => p.slot));
  const spent = picks.reduce((sum, p) => sum + (NFL_GM_LONG_BY_ID.get(p.playerId)?.salaryWindow[0] ?? 0), 0);
  return (teamsMap.get(team) ?? []).flatMap(player => {
    if (taken.has(player.id) || identities.has(player.name.toLowerCase())) return [] as { player: NflGmLongPlayer; slots: NflGmLongSlot[] }[];
    const slots = player.eligibleSlots.filter(slot => {
      if (filled.has(slot)) return false;
      const reserve = NFL_GM_LONG_SLOTS.filter(s => s !== slot && !filled.has(s))
        .reduce((total, remaining) => total + (cheapestBySlot.get(remaining) ?? 0), 0);
      return spent + player.salaryWindow[0] + reserve <= NFL_GM_LONG_CAP;
    });
    return slots.length ? [{ player, slots }] : [];
  }).sort((a, b) => b.player.currentGrade - a.player.currentGrade || a.player.name.localeCompare(b.player.name));
}
export function nflGmLongEligibleTeams(picks: readonly NflGmLongPick[], previousTeam: string | null) {
  return FOOTBALL_GM_TEAMS.filter(team => team !== previousTeam && nflGmLongTeamCandidates(team, picks).length > 0);
}


/**
 * The same one-tap automatic roster fitting as Short GM.
 * FLEX, the two Front Seven spots and two DB spots are interchangeable;
 * new high-value players can displace weaker players to the lower-weight slot.
 * Candidates are still checked against the $205M reserve before entry.
 */
export function nflGmLongAutoAddPick(picks: readonly NflGmLongPick[], playerId: string): NflGmLongPick[] {
  const incoming = NFL_GM_LONG_BY_ID.get(playerId);
  if (!incoming || !nflGmLongTeamCandidates(incoming.team, picks).some(item => item.player.id === playerId)) {
    throw new Error("That Long GM player cannot be drafted under the remaining cap or slots.");
  }
  const rows = [...picks.map(pick => ({
    player: NFL_GM_LONG_BY_ID.get(pick.playerId)!,
    previousSlot: pick.slot,
  })), { player: incoming, previousSlot: null }]
    .sort((a, b) => a.player.eligibleSlots.length - b.player.eligibleSlots.length);
  let best: NflGmLongPick[] | null = null;
  let bestCoreSlots = -1;
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestStability = -1;
  const assigned: NflGmLongPick[] = [];
  const occupied = new Set<NflGmLongSlot>();

  function visit(index: number, value: number, stability: number) {
    if (index >= rows.length) {
      const core = assigned.filter(entry => entry.slot !== "FLEX").length;
      if (core > bestCoreSlots ||
        (core === bestCoreSlots && (value > bestScore + 1e-9 ||
          (Math.abs(value - bestScore) < 1e-9 && stability > bestStability)))) {
        best = assigned.map(entry => ({ ...entry }));
        bestCoreSlots = core;
        bestScore = value;
        bestStability = stability;
      }
      return;
    }
    const row = rows[index]!;
    for (const slot of row.player.eligibleSlots) {
      if (occupied.has(slot)) continue;
      assigned.push({ slot, playerId: row.player.id });
      occupied.add(slot);
      const premium = NFL_GM_LONG_POSITION_WEIGHTS[slot] * (row.player.currentGrade - 80);
      visit(index + 1, value + premium, stability + Number(row.previousSlot === slot));
      occupied.delete(slot);
      assigned.pop();
    }
  }
  visit(0, 0, 0);
  if (!best || !nflGmLongValidRoster(best, NFL_GM_LONG_BY_ID)) {
    throw new Error("Long GM could not find an affordable roster arrangement.");
  }
  return (best as NflGmLongPick[]).sort((a, b) =>
    NFL_GM_LONG_SLOTS.indexOf(a.slot) - NFL_GM_LONG_SLOTS.indexOf(b.slot));
}
