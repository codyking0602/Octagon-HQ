import gradeProjection from "../../../data/generated/football/wheel-cfb-gm-grade-projection-2026-10-07.json";
import { wheelFootballCfbPriorityForSchoolId } from "./wheelFootballCfbPriority";
import { wheelFootballPoolTeams } from "./wheelFootballModel";
import { footballGmTeamOverall, footballGmOutcomeProbabilities } from "./footballGmStrategy";

export const CFB_GM_VERSION = "cfb-gm-owner-preview-v1";
export const CFB_GM_ROSTER_SLOTS = ["QB", "RB", "WR", "FLEX", "FRONT_7_A", "FRONT_7_B", "SECONDARY"] as const;
export type CfbGmSlot = (typeof CFB_GM_ROSTER_SLOTS)[number];
export type CfbGmBudget = "POWERHOUSE" | "BUILDER";
export const CFB_GM_BUDGETS: Readonly<Record<CfbGmBudget, number>> = {
  POWERHOUSE: 11_000_000,
  BUILDER: 7_500_000,
};
export const CFB_GM_SLOT_LABELS: Readonly<Record<CfbGmSlot, string>> = {
  QB: "QB", RB: "RB", WR: "WR", FLEX: "FLEX",
  FRONT_7_A: "F7-1", FRONT_7_B: "F7-2", SECONDARY: "SECONDARY",
};

type GradeFamily = "QB" | "RB" | "WR" | "TE" | "Front Seven" | "Secondary";
export type CfbGmPlayer = {
  id: string;
  schoolId: string;
  school: string;
  name: string;
  family: GradeFamily;
  eligibleSlots: readonly CfbGmSlot[];
  currentGrade: number;
  nilYear1: number;
  nilYear2: number;
  departureRisk: "LOW" | "MEDIUM" | "HIGH";
  outlook: "RISING" | "STABLE" | "DECLINE RISK";
};
export type CfbGmRosterEntry = { slot: CfbGmSlot; playerId: string; acquired: "draft" | "portal" };
export type CfbGmDeparture = { playerId: string; slot: CfbGmSlot; reason: "NFL declaration" | "Eligibility" | "Transfer portal" };
export type CfbGmPhase = "intro" | "draft" | "year1" | "offseason" | "year2" | "final";
export type CfbGmRun = {
  version: typeof CFB_GM_VERSION;
  seed: string;
  phase: CfbGmPhase;
  budget: CfbGmBudget;
  schoolIds: string[];
  roster: CfbGmRosterEntry[];
  finalRoster: CfbGmRosterEntry[];
  departures: CfbGmDeparture[];
  voluntaryPortalOuts: string[];
  pendingSchool: string | null;
  spinIndex: number;
  previousSchool: string | null;
  portalSpins: number;
  previousPortalSchool: string | null;
};
export type CfbGmFinish = "Missed CFP" | "First Round" | "Quarterfinal" | "Semifinal" | "National Runner-up" | "National Champion";
export type CfbGmSeason = { year: 1 | 2; teamGrade: number; overall: number; finish: CfbGmFinish; continuity: number; winOdds: number };
export type CfbGmResult = { seasons: [CfbGmSeason, CfbGmSeason]; score: number; rosterManagement: number; resumeScore: number; retained: number; forcedDepartures: number; voluntaryDepartures: number };

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
export function cfbGmHash(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function rate(seed: string) {
  return cfbGmHash(seed) / 4294967296;
}
function roundedNil(value: number) {
  return Math.round(value / 25_000) * 25_000;
}
export function cfbGmMoney(value: number) {
  return "$" + (value / 1_000_000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "") + "M";
}

// Lossless, grade-only projection of the audited Wheel authority. The source
// grading artifacts and rationale stay intact; the private comments and
// playtest QA notes never enter the public application bundle.
const gradeIndex = new Map<string, number>();
for (const row of gradeProjection.grades as {school:string;family:GradeFamily;player:string;grade:number}[]) {
  const key = [normalize(row.school), row.family, normalize(row.player)].join("|");
  if (gradeIndex.has(key)) throw new Error("Duplicate CFB GM grade: " + key);
  gradeIndex.set(key, row.grade);
}
// Fictional market estimates, not reported NIL deals. The price model deliberately
// never reads a player's HQ grade, preserving independent scouting and salary decisions.
// Stable identity prices are identical in Powerhouse and Builder, and across sessions.
const nilMarket: Readonly<Record<GradeFamily, readonly [number, number]>> = {
  QB: [500_000, 2_700_000],
  RB: [175_000, 1_250_000],
  WR: [200_000, 1_550_000],
  TE: [125_000, 850_000],
  "Front Seven": [200_000, 1_250_000],
  Secondary: [175_000, 1_150_000],
};
const playerMap = new Map<string, CfbGmPlayer>();
const schoolPlayers = new Map<string, CfbGmPlayer[]>();
const eligibleSchools = wheelFootballPoolTeams("AP_TOP_25").map((school) => school.code);

for (const schoolId of eligibleSchools) {
  const school = wheelFootballCfbPriorityForSchoolId(schoolId);
  if (!school) throw new Error("CFB GM missing priority: " + schoolId);
  const teamMap = new Map<string, CfbGmPlayer>();
  const groups: readonly [keyof typeof school, GradeFamily, readonly CfbGmSlot[]][] = [
    ["QB", "QB", ["QB"]],
    ["RB", "RB", ["RB", "FLEX"]],
    ["WR", "WR", ["WR", "FLEX"]],
    ["TE", "TE", ["FLEX"]],
    ["Front Seven", "Front Seven", ["FRONT_7_A", "FRONT_7_B"]],
    ["Secondary", "Secondary", ["SECONDARY"]],
  ];
  for (const [group, family, slots] of groups) {
    const names = school[group];
    if (!Array.isArray(names)) continue;
    for (const name of names as readonly string[]) {
      const nameKey = normalize(name);
      const id = schoolId + "|" + nameKey;
      const existing = teamMap.get(id);
      if (existing) {
        existing.eligibleSlots = [...new Set([...existing.eligibleSlots, ...slots])];
        continue;
      }
      const grade = gradeIndex.get([normalize(school.school), family, nameKey].join("|"));
      if (grade === undefined) throw new Error("CFB GM ungraded candidate: " + school.school + " " + name + " " + family);
      const [floor, ceiling] = nilMarket[family];
      const nilYear1 = roundedNil(floor + (ceiling - floor) * rate("nil:26:" + id));
      const reprice = -0.07 + rate("nil:27:" + id) * 0.53;
      const nilYear2 = roundedNil(Math.max(75_000, nilYear1 * (1 + reprice)));
      const departureRisk = grade >= 94 ? "HIGH" : grade >= 88 ? "MEDIUM" : "LOW";
      const drift = rate("player:2027:" + id);
      const player: CfbGmPlayer = {
        id, schoolId, school: school.school, name, family,
        eligibleSlots: [...slots], currentGrade: grade, nilYear1, nilYear2,
        departureRisk, outlook: drift > 0.76 ? "RISING" : drift < 0.10 ? "DECLINE RISK" : "STABLE",
      };
      teamMap.set(id, player);
      playerMap.set(id, player);
    }
  }
  // Flex shortlists occasionally include names not on the position-shortlists.
  for (const name of school.Flex) {
    const key = normalize(name);
    const id = schoolId + "|" + key;
    const existing = teamMap.get(id);
    if (existing) {
      existing.eligibleSlots = [...new Set([...existing.eligibleSlots, "FLEX" as const])];
      continue;
    }
    const family = (["RB", "WR", "TE"] as const).find((candidate) => gradeIndex.has(
      [normalize(school.school), candidate, key].join("|"),
    ));
    if (!family) throw new Error("CFB GM Flex player missing grade: " + school.school + " " + name);
    const grade = gradeIndex.get([normalize(school.school), family, key].join("|"))!;
    const [floor, ceiling] = nilMarket[family];
    const nilYear1 = roundedNil(floor + (ceiling - floor) * rate("nil:26:" + id));
    const nilYear2 = roundedNil(Math.max(75_000, nilYear1 * (0.93 + 0.53 * rate("nil:27:" + id))));
    const drift = rate("player:2027:" + id);
    const player: CfbGmPlayer = {
      id, schoolId, school: school.school, name, family, eligibleSlots: ["FLEX"],
      currentGrade: grade, nilYear1, nilYear2,
      departureRisk: grade >= 94 ? "HIGH" : grade >= 88 ? "MEDIUM" : "LOW",
      outlook: drift > 0.76 ? "RISING" : drift < 0.10 ? "DECLINE RISK" : "STABLE",
    };
    teamMap.set(id, player);
    playerMap.set(id, player);
  }
  schoolPlayers.set(schoolId, [...teamMap.values()]);
}

export const CFB_GM_AP_SCHOOLS = eligibleSchools;
export const CFB_GM_PLAYERS = [...playerMap.values()];
export function cfbGmPlayer(id: string) { return playerMap.get(id) ?? null; }
export function cfbGmPlayersAt(schoolId: string) { return schoolPlayers.get(schoolId) ?? []; }
export function cfbGmPrice(player: CfbGmPlayer, year: 1 | 2) { return year === 1 ? player.nilYear1 : player.nilYear2; }
export function cfbGmSpent(roster: readonly CfbGmRosterEntry[], year: 1 | 2) {
  return roster.reduce((sum, row) => sum + (cfbGmPlayer(row.playerId) ? cfbGmPrice(cfbGmPlayer(row.playerId)!, year) : 0), 0);
}
export function cfbGmOpenSlots(roster: readonly CfbGmRosterEntry[]) {
  const taken = new Set(roster.map((entry) => entry.slot));
  return CFB_GM_ROSTER_SLOTS.filter((slot) => !taken.has(slot));
}
export function cfbGmReflow(roster: readonly CfbGmRosterEntry[]): CfbGmRosterEntry[] | null {
  if (roster.length > 7) return null;
  const seen = new Set<string>();
  const resolved: CfbGmRosterEntry[] = [];
  const players = roster.map((r) => cfbGmPlayer(r.playerId));
  if (players.some((p) => !p)) return null;
  function place(index: number): boolean {
    if (index === roster.length) return true;
    const entry = roster[index]!, player = players[index]!;
    if (seen.has(entry.playerId)) return false;
    seen.add(entry.playerId);
    const preferred = [...player.eligibleSlots].sort((a, b) => Number(b === entry.slot) - Number(a === entry.slot));
    for (const slot of preferred) {
      if (resolved.some((r) => r.slot === slot)) continue;
      resolved.push({ ...entry, slot });
      if (place(index + 1)) return true;
      resolved.pop();
    }
    seen.delete(entry.playerId);
    return false;
  }
  return place(0) ? [...resolved].sort((a,b) => CFB_GM_ROSTER_SLOTS.indexOf(a.slot) - CFB_GM_ROSTER_SLOTS.indexOf(b.slot)) : null;
}
function affordable(roster: readonly CfbGmRosterEntry[], player: CfbGmPlayer, budget: number, year: 1 | 2, reserve: boolean, excluded: ReadonlySet<string>) {
  if (roster.some((r) => r.playerId === player.id)) return false;
  const next = cfbGmReflow([...roster, {slot: player.eligibleSlots[0]!, playerId: player.id, acquired: year === 1 ? "draft" : "portal"}]);
  if (!next) return false;
  const spent = cfbGmSpent(next, year);
  if (spent > budget) return false;
  if (!reserve) return true;
  const missing = cfbGmOpenSlots(next);
  const used = new Set(next.map((r) => r.playerId));
  const floor = missing.reduce((sum, slot) => {
    let best = Infinity;
    for (const p of CFB_GM_PLAYERS) {
      if (!used.has(p.id) && !excluded.has(p.id) && p.eligibleSlots.includes(slot)) best = Math.min(best, cfbGmPrice(p, year));
    }
    return sum + best;
  }, 0);
  return spent + floor <= budget;
}
export function cfbGmCandidates(schoolId: string, roster: readonly CfbGmRosterEntry[], budget: number, year: 1 | 2, reserve = true, excluded: ReadonlySet<string> = new Set()) {
  return cfbGmPlayersAt(schoolId).filter((p) => !excluded.has(p.id) && affordable(roster, p, budget, year, reserve, excluded));
}
export function cfbGmEligibleSchools(roster: readonly CfbGmRosterEntry[], budget: number, year: 1 | 2, previous: string | null, pool: readonly string[] = CFB_GM_AP_SCHOOLS, excluded: ReadonlySet<string> = new Set()) {
  const result = pool.filter((schoolId) => cfbGmCandidates(schoolId, roster, budget, year, true, excluded).length > 0);
  const nonRepeat = result.filter((id) => id !== previous);
  return nonRepeat.length ? nonRepeat : result;
}
export function cfbGmPick(roster: readonly CfbGmRosterEntry[], id: string, budget: number, year: 1 | 2, excluded: ReadonlySet<string> = new Set()) {
  const player = cfbGmPlayer(id);
  if (!player || !cfbGmCandidates(player.schoolId, roster, budget, year, true, excluded).some((p) => p.id === id)) return null;
  const next = cfbGmReflow([...roster, {slot: player.eligibleSlots[0]!, playerId: id, acquired: year === 1 ? "draft" : "portal"}]);
  return next;
}
export function cfbGmSpin(seed: string, index: number, schoolIds: readonly string[]) {
  if (!schoolIds.length) return null;
  return schoolIds[cfbGmHash(seed + ":" + index + ":wheel") % schoolIds.length]!;
}
export function cfbGmInitial(seed: string, budget: CfbGmBudget = "POWERHOUSE"): CfbGmRun {
  return {version: CFB_GM_VERSION, seed, phase: "intro", budget, schoolIds: [...CFB_GM_AP_SCHOOLS],
    roster: [], finalRoster: [], departures: [], voluntaryPortalOuts: [],
    pendingSchool: null, spinIndex: 0, previousSchool: null, portalSpins: 0, previousPortalSchool: null};
}
export function cfbGmForcedDepartures(run: CfbGmRun) {
  const seasonFinish = cfbGmSeason(run, 1).finish;
  // Winning Year 1 moderately improves the probability of keeping a
  // non-graduating player out of the portal. It does not stop graduation
  // or an NFL decision and never changes the player's audited HQ grade.
  const winningBoost: Record<CfbGmFinish, number> = {
    "Missed CFP": 0, "First Round": 0.025, Quarterfinal: 0.04,
    Semifinal: 0.055, "National Runner-up": 0.07, "National Champion": 0.08,
  };
  const loyaltyBoost = winningBoost[seasonFinish];
  return run.roster.flatMap<CfbGmDeparture>((row) => {
    const player = cfbGmPlayer(row.playerId)!;
    const roll = rate("departure:" + run.seed + ":" + row.playerId);
    // Stochastic projection, not a claim of known future graduation/draft decisions.
    const draftProbability = player.departureRisk === "HIGH" ? 0.23 : player.departureRisk === "MEDIUM" ? 0.11 : 0.035;
    const graduationProbability = 0.085;
    const portalProbability = Math.max(0.02, 0.15 - loyaltyBoost);
    const reason: CfbGmDeparture["reason"] | null = roll < draftProbability ? "NFL declaration"
      : roll < draftProbability + graduationProbability ? "Eligibility"
      : roll < draftProbability + graduationProbability + portalProbability ? "Transfer portal" : null;
    return reason ? [{playerId: player.id, slot: row.slot, reason}] : [];
  });
}
export function cfbGmEnterOffseason(run: CfbGmRun): CfbGmRun {
  const departures = cfbGmForcedDepartures(run);
  const leaving = new Set(departures.map((d) => d.playerId));
  return {...run, phase: "offseason", departures,
    finalRoster: run.roster.filter((r) => !leaving.has(r.playerId)),
    pendingSchool: null};
}
export function cfbGmPortalOut(run: CfbGmRun, playerId: string): CfbGmRun | null {
  if (run.phase !== "offseason" || run.voluntaryPortalOuts.length >= 2 || run.pendingSchool) return null;
  if (!run.finalRoster.some((r) => r.playerId === playerId)) return null;
  return {...run, finalRoster: run.finalRoster.filter((r) => r.playerId !== playerId),
    voluntaryPortalOuts: [...run.voluntaryPortalOuts, playerId]};
}
export function cfbGmContinuity(run: CfbGmRun) {
  const retained = new Set(run.finalRoster.map((r) => r.playerId));
  const initial = run.roster.filter((r) => retained.has(r.playerId)).length;
  // Continuity affects outcomes only; the displayed Team OVR is pure ability.
  return { retained: initial, adjustment: (initial - 5) * 0.45 };
}
const weights: Readonly<Record<CfbGmSlot, number>> = {
  QB: 0.26, RB: 0.08, WR: 0.13, FLEX: 0.08, FRONT_7_A: 0.15, FRONT_7_B: 0.15, SECONDARY: 0.15,
};
export function cfbGmTeamGrade(roster: readonly CfbGmRosterEntry[]) {
  return Math.round(roster.reduce((sum, row) => sum + (cfbGmPlayer(row.playerId)?.currentGrade ?? 0) * weights[row.slot], 0) * 10) / 10;
}
const finishes: readonly CfbGmFinish[] = ["Missed CFP", "First Round", "Quarterfinal", "Semifinal", "National Runner-up", "National Champion"];
export function cfbGmSeason(run: CfbGmRun, year: 1 | 2): CfbGmSeason {
  const roster = year === 1 ? run.roster : run.finalRoster;
  const teamGrade = cfbGmTeamGrade(roster);
  const continuity = year === 1 ? 0 : cfbGmContinuity(run).adjustment;
  const probabilities = footballGmOutcomeProbabilities(teamGrade + continuity);
  const outcomeKeys = ["Missed Playoffs", "Wild Card", "Divisional", "Conference Championship", "Super Bowl Loss", "Champion"] as const;
  const roll = rate("cfb-gm-season:" + run.seed + ":" + year);
  let outcome = 5, progress = 0;
  for (let i = 0; i < outcomeKeys.length; i += 1) {
    progress += probabilities[outcomeKeys[i]!];
    if (roll < progress) { outcome = i; break; }
  }
  return {year, teamGrade, overall: footballGmTeamOverall(teamGrade), finish: finishes[outcome]!,
    continuity, winOdds: Math.round(probabilities.Champion * 1000) / 10};
}
export function cfbGmFinalResult(run: CfbGmRun): CfbGmResult {
  const seasons: [CfbGmSeason, CfbGmSeason] = [cfbGmSeason(run, 1), cfbGmSeason(run, 2)];
  const retained = cfbGmContinuity(run).retained;
  const forced = run.departures.length;
  const voluntary = run.voluntaryPortalOuts.length;
  // Only elective departures count against roster management; forced departures
  // influence continuity/competitive outcomes, but are not player choice mistakes.
  const gradeScore = ((seasons[0].teamGrade + seasons[1].teamGrade) / 2 - 65) / 33 * 100;
  const rosterManagement = Math.min(100, Math.max(45, gradeScore + (retained + forced) * 0.35 - voluntary * 1.5));
  const resume = { "Missed CFP": 79, "First Round": 83, "Quarterfinal": 87, "Semifinal": 92, "National Runner-up": 96, "National Champion": 100 };
  const resumeScore = (resume[seasons[0].finish] + resume[seasons[1].finish]) / 2;
  return {seasons, score: Math.round((rosterManagement * 0.55 + resumeScore * 0.45) * 10) / 10,
    rosterManagement: Math.round(rosterManagement * 10) / 10, resumeScore, retained,
    forcedDepartures: forced, voluntaryDepartures: voluntary};
}
export function cfbGmValidateRun(value: unknown): CfbGmRun | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Partial<CfbGmRun>;
  if (r.version !== CFB_GM_VERSION || typeof r.seed !== "string" || !/^[a-z0-9-]{8,100}$/i.test(r.seed)
    || (r.budget !== "POWERHOUSE" && r.budget !== "BUILDER")
    || !Array.isArray(r.roster) || !Array.isArray(r.finalRoster)
    || !Array.isArray(r.schoolIds) || r.schoolIds.some((id) => !CFB_GM_AP_SCHOOLS.includes(id))
    || !["intro","draft","year1","offseason","year2","final"].includes(r.phase ?? "")) return null;
  if (!cfbGmReflow(r.roster) || !cfbGmReflow(r.finalRoster)) return null;
  return r as CfbGmRun;
}
