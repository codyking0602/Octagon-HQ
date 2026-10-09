import gradeProjection from "../../../data/generated/football/wheel-cfb-gm-grade-projection-2026-10-07.json";
import { wheelFootballCfbPriorityForSchoolId } from "./wheelFootballCfbPriority";
import { wheelFootballPoolTeams } from "./wheelFootballModel";
import { footballGmTeamOverall } from "./footballGmStrategy";
import { cfbGmSimulateCollegeSeason, type CfbGmCollegeFinish } from "./footballCfbGmSimulation";
import classEvidence from "../../../data/generated/football/cfb-gm-classification-runtime-2026.json";
import { cfbGmEstimateNil } from "./footballCfbGmNilMarket";
import { cfbGmDevProfile, cfbGmDevelop, type CfbGmClass } from "./footballCfbGmDevelopment";
import { footballGmOutlookFromOdds } from "./footballGmScouting";

export const CFB_GM_VERSION = "cfb-gm-owner-preview-v8-nfl-parity";
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
  classification: CfbGmClass;
  classVerified: boolean;
  nilYear1: number;
  nilYear2: number;
  departureRisk: "LOW" | "MEDIUM" | "HIGH";
  outlook: "HIGH UPSIDE" | "RISING" | "STEADY" | "BOOM/BUST" | "DECLINE RISK";
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
export type CfbGmFinish = CfbGmCollegeFinish;
export type CfbGmSeason = { year: 1 | 2; teamGrade: number; overall: number; finish: CfbGmFinish; continuity: number; winOdds: number;
  wins:number; losses:number; cfpSeed:number|null; nationalChampion:string; };
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
// Class labels are a 2026 roster snapshot, NOT verification of a
// prospect's graduation, remaining eligibility or NFL Draft decision.
type ClassRow = {id: string; classification: string | null; remainingEligibility: number | null;
  earliestDraftYear: number | null; draftEligible2027: boolean | null;
  calibration?: {draftDeclarationProbability:number|null;portalExitProbability:number|null};};
const classIndex = new Map<string, ClassRow>(
  (classEvidence.players as ClassRow[]).map((row) => [row.id, row]),
);
const knownClasses = new Set(["FR", "SO", "JR", "SR", "3RD", "5TH", "6TH", "7TH", "8TH"]);
function playerClass(id: string): CfbGmClass {
  const value = classIndex.get(id)?.classification;
  return value && knownClasses.has(value) ? value as CfbGmClass : null;
}
// NFL rule: three years removed from high school. FR/SO cannot be modeled
// as draft-eligible from class alone. Explicit audited evidence takes priority.
export function isModelDraftEligible(id: string, classification: CfbGmClass): boolean {
  const evidence = classIndex.get(id);
  if (evidence?.draftEligible2027 !== null && evidence?.draftEligible2027 !== undefined)
    return evidence.draftEligible2027;
  if (evidence?.earliestDraftYear !== null && evidence?.earliestDraftYear !== undefined)
    return evidence.earliestDraftYear <= 2027;
  return classification === "JR" || classification === "SR" || classification === "3RD"
    || classification === "5TH" || classification === "6TH" || classification === "7TH" || classification === "8TH";
}
/** Draft-pick signal covers modeled NFL, eligibility and portal exits, not just NFL declarations.
 * Probabilities remain game estimates; never reveal a particular run's seeded result.
 */
export function cfbGmDepartureRisk(id: string, grade: number, classification: CfbGmClass): CfbGmPlayer["departureRisk"] {
  const evidence = classIndex.get(id);
  const drafted = isModelDraftEligible(id, classification);
  const researched = evidence?.calibration;
  const draftChance = drafted
    ? (researched?.draftDeclarationProbability ?? (grade >= 96 ? .72 : grade >= 92 ? .54 : grade >= 87 ? .26 : .07))
    : 0;
  const remaining = evidence?.remainingEligibility;
  const terminal = remaining === 0 ? 1
    : remaining !== null && remaining !== undefined && remaining > 0 ? 0
    : classification === "8TH" ? 1 : classification === "7TH" ? .93
    : classification === "6TH" ? .83 : classification === "5TH" ? .70
    : classification === "SR" ? .57 : 0;
  const portal = researched?.portalExitProbability ?? .15;
  const estimated = draftChance + (1 - draftChance) * terminal
    + (1 - draftChance) * (1 - terminal) * portal;
  return estimated >= .6 ? "HIGH" : estimated >= .25 ? "MEDIUM" : "LOW";
}
function collegeOutlook(id: string, grade: number, classification: CfbGmClass): CfbGmPlayer["outlook"] {
  const p = cfbGmDevProfile(id, grade, classification);
  return footballGmOutlookFromOdds({
    breakoutPct: p.breakout, improvePct: p.improve,
    steadyPct: p.steady, declinePct: p.decline,
  });
}
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
    for (const [positionRoleRank, name] of (names as readonly string[]).entries()) {
      const nameKey = normalize(name);
      const id = schoolId + "|" + nameKey;
      const existing = teamMap.get(id);
      if (existing) {
        existing.eligibleSlots = [...new Set([...existing.eligibleSlots, ...slots])];
        continue;
      }
      const grade = gradeIndex.get([normalize(school.school), family, nameKey].join("|"));
      if (grade === undefined) throw new Error("CFB GM ungraded candidate: " + school.school + " " + name + " " + family);
      const classification = playerClass(id);
      const market = cfbGmEstimateNil({schoolId, name, family,
        positionRoleRank, apRank: eligibleSchools.indexOf(schoolId) + 1});
      const player: CfbGmPlayer = {
        id, schoolId, school: school.school, name, family,
        eligibleSlots: [...slots], currentGrade: grade, classification,
        classVerified: classification !== null,
        nilYear1: market.year1, nilYear2: market.year2Baseline,
        departureRisk: cfbGmDepartureRisk(id, grade, classification),
        outlook: collegeOutlook(id, grade, classification),
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
    const classification = playerClass(id);
    const market = cfbGmEstimateNil({schoolId, name, family,
      positionRoleRank: 4, apRank: eligibleSchools.indexOf(schoolId) + 1});
    const player: CfbGmPlayer = {
      id, schoolId, school: school.school, name, family, eligibleSlots: ["FLEX"],
      currentGrade: grade, classification, classVerified: classification !== null,
      nilYear1: market.year1, nilYear2: market.year2Baseline,
      departureRisk: cfbGmDepartureRisk(id, grade, classification),
      outlook: collegeOutlook(id, grade, classification),
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
export function cfbGmEffectiveGrade(player: CfbGmPlayer, year: 1 | 2, seed: string) {
  return year === 1 ? player.currentGrade
    : cfbGmDevelop(player.id, player.currentGrade, player.classification, seed).after;
}
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
    "Missed CFP": 0, "Lost First Round": 0.025, "Lost Quarterfinal": 0.04,
    "Lost Semifinal": 0.055, "National Runner-up": 0.07, "National Champion": 0.08,
  };
  const loyaltyBoost = winningBoost[seasonFinish];
  return run.roster.flatMap<CfbGmDeparture>((row) => {
    const player = cfbGmPlayer(row.playerId)!;
    const roll = rate("departure:" + run.seed + ":" + row.playerId);
    // NFL declarations are possible only for modeled draft-eligible cohorts.
    // A "senior" label is not proof that a redshirt year is exhausted.
    const grade = player.currentGrade;
    const researched = classIndex.get(player.id)?.calibration;
    const draftProbability = !isModelDraftEligible(player.id, player.classification) ? 0
      : researched?.draftDeclarationProbability ?? (grade >= 96 ? .72 : grade >= 92 ? .54 : grade >= 87 ? .26 : .07);
    const remaining = classIndex.get(player.id)?.remainingEligibility;
    const exhaustedProbability = remaining === 0 ? 1
      : remaining !== null && remaining !== undefined && remaining > 0 ? 0
      : player.classification === "8TH" ? 1
      : player.classification === "7TH" ? .93
      : player.classification === "6TH" ? .83
      : player.classification === "5TH" ? .70
      : player.classification === "SR" ? .57 : 0;
    const eligibleRoll = draftProbability + (1 - draftProbability) * exhaustedProbability;
    const portalProbability = Math.max(0.02, (researched?.portalExitProbability ?? 0.15) - loyaltyBoost);
    const reason: CfbGmDeparture["reason"] | null = roll < draftProbability ? "NFL declaration"
      : roll < eligibleRoll ? "Eligibility"
      : roll < eligibleRoll + (1 - eligibleRoll) * portalProbability ? "Transfer portal" : null;
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
/** Match NFL's seven-slot baseline. Flex uses the known player family; defensive
 * sub-position multipliers intentionally wait for audited EDGE/IDL/LB and CB/S identities.
 * Never guess an exact defensive role from the school-level Front Seven/Secondary pool.
 */
export const CFB_GM_POSITION_WEIGHTS: Readonly<Record<CfbGmSlot, number>> = {
  QB: 0.28, RB: 0.08, WR: 0.14, FLEX: 0.08, FRONT_7_A: 0.14, FRONT_7_B: 0.14, SECONDARY: 0.14,
};
export function cfbGmTeamGrade(roster: readonly CfbGmRosterEntry[], year: 1 | 2 = 1, seed = "") {
  const neutral = 80;
  const contribution = roster.reduce((sum, row) => {
    const player = cfbGmPlayer(row.playerId);
    if (!player) return sum;
    const flexRole = row.slot === "FLEX"
      ? player.family === "WR" ? 1.05 : player.family === "TE" ? 1.03 : .96
      : 1;
    return sum + (cfbGmEffectiveGrade(player, year, seed) - neutral)
      * CFB_GM_POSITION_WEIGHTS[row.slot] * flexRole;
  }, 0);
  return Math.round((neutral + contribution) * 10) / 10;
}
export function cfbGmSeason(run: CfbGmRun, year: 1 | 2): CfbGmSeason {
  const roster = year === 1 ? run.roster : run.finalRoster;
  const teamGrade = cfbGmTeamGrade(roster, year, run.seed);
  const continuity = year === 1 ? 0 : cfbGmContinuity(run).adjustment;
  const season = cfbGmSimulateCollegeSeason(run.seed, year, teamGrade + continuity);
  return {year, teamGrade, overall: footballGmTeamOverall(teamGrade), finish: season.finish,
    continuity, winOdds: season.winOdds, wins:season.wins, losses:season.losses,
    cfpSeed:season.cfpSeed, nationalChampion:season.champion};
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
  const resume: Record<CfbGmFinish, number> = {
    "Missed CFP": 79, "Lost First Round": 83, "Lost Quarterfinal": 87,
    "Lost Semifinal": 92, "National Runner-up": 96, "National Champion": 100,
  };
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
