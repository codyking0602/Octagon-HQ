import gradeProjection from "../../../data/generated/football/wheel-cfb-gm-grade-projection-2026-10-07.json";
import { wheelFootballCfbPriorityForSchoolId } from "./wheelFootballCfbPriority";
import { wheelFootballPoolTeams } from "./wheelFootballModel";
import { cfbGmSimulateCollegeSeason, type CfbGmCollegeFinish } from "./footballCfbGmSimulation";
import classEvidence from "../../../data/generated/football/cfb-gm-classification-runtime-2026.json";
import firstPartyNil from "../../../data/generated/football/cfb-gm-first-party-nil-runtime-2026.json";
import { cfbGmDevProfile, cfbGmDevelop, cfbGmDevelopmentLabel, type CfbGmClass } from "./footballCfbGmDevelopment";

export const CFB_GM_VERSION = "cfb-gm-owner-preview-v12-independent-nil-weighted-flex";
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
export type CfbGmDeparture = { playerId: string; slot: CfbGmSlot; reason: "NFL declaration" | "Eligibility" | "Transfer portal" | "NIL negotiation" };
export type CfbGmRetentionTier = "VALUE" | "MARKET" | "PRIORITY";
export type CfbGmRetentionAgreement = { tier: CfbGmRetentionTier; amount: number; accepted: boolean };
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
  retentionOffers: Record<string, CfbGmRetentionAgreement>;
  pendingSchool: string | null;
  spinIndex: number;
  previousSchool: string | null;
  portalSpins: number;
  previousPortalSchool: string | null;
};
export type CfbGmFinish = CfbGmCollegeFinish;
export type CfbGmSeason = { year: 1 | 2; teamGrade: number; overall: number; finish: CfbGmFinish; continuity: number; chemistry: number; winOdds: number;
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
/** Player research stays immutable; these game-phase factors model how NIL-era
 * retention and opt-in choices differ from raw prospect departure priors.
 * Verified zero remaining eligibility is NEVER softened.
 */
const NIL_ERA_NFL_STAY_FACTOR = .82;
function departureOdds(id: string, grade: number, classification: CfbGmClass, loyalty = 0) {
  const evidence = classIndex.get(id);
  const researched = evidence?.calibration;
  const draftProbability = isModelDraftEligible(id, classification)
    ? Math.min(.99, (researched?.draftDeclarationProbability ?? (grade >= 96 ? .72 : grade >= 92 ? .54 : grade >= 87 ? .26 : .07)) * NIL_ERA_NFL_STAY_FACTOR)
    : 0;
  const remaining = evidence?.remainingEligibility;
  // Unknown senior eligibility is a risk, never a documented automatic exit.
  const exhaustedProbability = remaining === 0 ? 1 : remaining != null && remaining > 0 ? 0
    : classification === "8TH" ? 1 : classification === "7TH" ? .93
    : classification === "6TH" ? .83 : classification === "5TH" ? .70
    : classification === "SR" ? .27 : 0;
  const portalProbability = Math.max(.02, (researched?.portalExitProbability ?? .15) - loyalty);
  const eligibilityThreshold = draftProbability + (1 - draftProbability) * exhaustedProbability;
  return {draftProbability, exhaustedProbability, portalProbability, eligibilityThreshold,
    exitProbability: eligibilityThreshold + (1 - eligibilityThreshold) * portalProbability};
}
export function cfbGmDepartureRisk(id: string, grade: number, classification: CfbGmClass): CfbGmPlayer["departureRisk"] {
  const chance = departureOdds(id, grade, classification).exitProbability;
  return chance >= .6 ? "HIGH" : chance >= .25 ? "MEDIUM" : "LOW";
}
/** Short, actionable scouting distinction instead of seven identical warning pills. */
export function cfbGmExitSignal(player: Pick<CfbGmPlayer,"id"|"classification"|"currentGrade">) {
  const remaining = classIndex.get(player.id)?.remainingEligibility;
  const odds = departureOdds(player.id, player.currentGrade, player.classification);
  if (remaining === 0) return {label:"FINAL YEAR",tone:"high" as const,
    detail:"No 2027 eligibility remains. Draft for a one-season peak."};
  if (odds.draftProbability >= .48) return {label:"NFL LEAP",tone:"high" as const,
    detail:"Meaningful modeled NFL decision risk; returning is still possible."};
  if (odds.exhaustedProbability >= .25) return {label:"RETURN UNCERTAIN",tone:"medium" as const,
    detail:"Remaining 2027 eligibility is not verified. Departure is uncertain."};
  if (odds.draftProbability >= .23) return {label:"NFL CHANCE",tone:"medium" as const,
    detail:"Moderate modeled chance of an NFL declaration."};
  if (odds.portalProbability >= .18) return {label:"PORTAL RISK",tone:"medium" as const,
    detail:"Player may transfer after 2026."};
  return {label:"RETURN LIKELY",tone:"low" as const,
    detail:"Returning is favored, but no 2027 outcome is guaranteed."};
}
/** Don't make a player who is definitively out of college in 2027 a transfer.
 * For unresolved 2026 senior/extended-year cases, a speculative extra year
 * is NOT sufficient evidence to add that player to the 2027 marketplace.
 */
export function cfbGmEligibleIn2027(id: string, classification: CfbGmClass) {
  const remaining = classIndex.get(id)?.remainingEligibility;
  if (remaining === 0) return false;
  if (remaining != null && remaining > 0) return true;
  return classification === "FR" || classification === "SO" || classification === "JR" || classification === "3RD";
}
function collegeOutlook(id: string, grade: number, classification: CfbGmClass): CfbGmPlayer["outlook"] {
  const p = cfbGmDevProfile(id, grade, classification);
  return cfbGmDevelopmentLabel(p, grade);
}
/** Single first-party, individual-year-one market authority; no HQ-derived or
 * school-rank/role-rank pricing fallback is permitted for a missing player.
 * The separate full research ledger is not shipped to the browser.
 */
const nilRows = (firstPartyNil.players as {id:string;year1USD:number}[]);
if (firstPartyNil.population !== 468 || nilRows.length !== 468) throw new Error("College GM NIL population incomplete");
const nilMarketById = new Map(nilRows.map(row => [row.id, row.year1USD]));
if (nilMarketById.size !== nilRows.length) throw new Error("Duplicate CFB GM NIL source identity");
function researchedNilMarket(id:string) {
  const year1 = nilMarketById.get(id);
  if (!Number.isFinite(year1) || !year1 || year1 <= 0 || year1 % 25_000 !== 0)
    throw new Error("CFB GM missing individually researched Year 1 NIL estimate: "+id);
  return {year1,year2Baseline:Math.round(year1*1.1/25_000)*25_000};
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
    for (const name of (names as readonly string[])) {
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
      const market = researchedNilMarket(id);
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
    const market = researchedNilMarket(id);
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
if (CFB_GM_PLAYERS.length !== nilMarketById.size || CFB_GM_PLAYERS.some(player => !nilMarketById.has(player.id)))
  throw new Error("CFB GM individual NIL market identity mismatch");
/** A seeded, fictional 2027 transfer market; NOT a claim that any real player
 * entered the portal. Guaranteed affordable depth avoids unwinnable cap states.
 */
const affordablePortalDepth = new Set<string>();
for (const slot of CFB_GM_ROSTER_SLOTS) {
  CFB_GM_PLAYERS.filter((p) => p.eligibleSlots.includes(slot) && cfbGmEligibleIn2027(p.id,p.classification))
    .sort((a,b) => a.nilYear2 - b.nilYear2 || a.id.localeCompare(b.id))
    .slice(0, 12).forEach(p => affordablePortalDepth.add(p.id));
}
export function cfbGmPortalAvailable(player: CfbGmPlayer, seed: string) {
  if (!cfbGmEligibleIn2027(player.id, player.classification)) return false;
  if (affordablePortalDepth.has(player.id)) return true;
  const odds = departureOdds(player.id, player.currentGrade, player.classification);
  // Draft-bound players rarely enter the modeled market. The remainder can
  // opt in to this particular seeded window, independent of the user's team.
  return rate("portal:2027:nfl:" + seed + ":" + player.id) >= odds.draftProbability
    && rate("portal:2027:interest:" + seed + ":" + player.id) < .66;
}

export function cfbGmPlayer(id: string) { return playerMap.get(id) ?? null; }
export function cfbGmPlayersAt(schoolId: string) { return schoolPlayers.get(schoolId) ?? []; }
/** Year 2 is negotiated against a player-specific simulated demand curve.
 * The input baseline is the independently researched Year 1 market value;
 * HQ grades NEVER set 2026 NIL values. Development affects 2027 only.
 */
export function cfbGmYear2Ask(player: CfbGmPlayer, seed: string) {
  if (!seed) return player.nilYear2;
  const delta = cfbGmDevelop(player.id, player.currentGrade, player.classification, seed).delta;
  const playerMarket = (rate("nil:2027:demand:" + seed + ":" + player.id) - .5) * .16;
  const developmentMarket = Math.max(-.12, Math.min(.22, delta * .038));
  const multiplier = Math.max(.78, Math.min(1.52, 1.10 + playerMarket + developmentMarket));
  return Math.max(125_000, Math.round(player.nilYear1 * multiplier / 25_000) * 25_000);
}
export function cfbGmPrice(player: CfbGmPlayer, year: 1 | 2, seed = "",
  offers: Readonly<Record<string, CfbGmRetentionAgreement>> = {}) {
  if (year === 1) return player.nilYear1;
  const agreement = offers[player.id];
  return agreement?.accepted ? agreement.amount : cfbGmYear2Ask(player, seed);
}
export function cfbGmEffectiveGrade(player: CfbGmPlayer, year: 1 | 2, seed: string) {
  return year === 1 ? player.currentGrade
    : cfbGmDevelop(player.id, player.currentGrade, player.classification, seed).after;
}
export function cfbGmSpent(roster: readonly CfbGmRosterEntry[], year: 1 | 2, seed = "",
  offers: Readonly<Record<string, CfbGmRetentionAgreement>> = {}) {
  return roster.reduce((sum, row) => sum + (cfbGmPlayer(row.playerId) ?
    cfbGmPrice(cfbGmPlayer(row.playerId)!, year, seed, offers) : 0), 0);
}
export function cfbGmOpenSlots(roster: readonly CfbGmRosterEntry[]) {
  const taken = new Set(roster.map((entry) => entry.slot));
  return CFB_GM_ROSTER_SLOTS.filter((slot) => !taken.has(slot));
}
/** Choose the strongest weighted legal assignment, independent of draft order.
 * Year 2 uses seeded developed ability. Preserve verified eligibility and
 * locked Wheel ratings without exposing hidden grades in the UI.
 */
export function cfbGmReflow(roster: readonly CfbGmRosterEntry[], year: 1 | 2 = 1, seed = ""): CfbGmRosterEntry[] | null {
  if (roster.length > CFB_GM_ROSTER_SLOTS.length) return null;
  const players = roster.map((entry) => cfbGmPlayer(entry.playerId));
  if (players.some((player) => !player)
    || new Set(roster.map((entry) => entry.playerId)).size !== roster.length) return null;
  const assigned: CfbGmRosterEntry[] = [];
  let best: CfbGmRosterEntry[] | null = null;
  let bestValue = -Infinity;
  let bestStability = -Infinity;
  const place = (index: number): void => {
    if (index === roster.length) {
      // The neutral 80-point baseline and certified FLEX family multipliers
      // match the displayed College GM team-grade calculation exactly.
      const value = assigned.reduce((sum, row) => {
        const player = cfbGmPlayer(row.playerId)!;
        return sum + (cfbGmEffectiveGrade(player, year, seed) - 80)
          * CFB_GM_POSITION_WEIGHTS[row.slot]
          * cfbGmRoleFit(player, row.slot).multiplier;
      }, 0);
      const stable = assigned.filter((row, i) => row.slot === roster[i]!.slot).length;
      if (value > bestValue + 1e-9 || (Math.abs(value - bestValue) <= 1e-9 && stable > bestStability)) {
        bestValue = value;
        bestStability = stable;
        best = [...assigned];
      }
      return;
    }
    const entry = roster[index]!, player = players[index]!;
    const preferred = [...player.eligibleSlots].sort((a,b) => Number(b === entry.slot) - Number(a === entry.slot));
    for (const slot of preferred) {
      if (assigned.some((other) => other.slot === slot)) continue;
      assigned.push({...entry,slot});
      place(index + 1);
      assigned.pop();
    }
  };
  place(0);
  const optimal = best as CfbGmRosterEntry[] | null;
  return optimal ? [...optimal].sort((a,b) => CFB_GM_ROSTER_SLOTS.indexOf(a.slot) - CFB_GM_ROSTER_SLOTS.indexOf(b.slot)) : null;
}
function affordable(roster: readonly CfbGmRosterEntry[], player: CfbGmPlayer, budget: number, year: 1 | 2, reserve: boolean, excluded: ReadonlySet<string>, portalSeed: string, offers: Readonly<Record<string, CfbGmRetentionAgreement>>) {
  if (roster.some((r) => r.playerId === player.id)) return false;
  if (year === 2 && !cfbGmPortalAvailable(player,portalSeed)) return false;
  const next = cfbGmReflow([...roster, {slot: player.eligibleSlots[0]!, playerId: player.id, acquired: year === 1 ? "draft" : "portal"}], year, portalSeed);
  if (!next) return false;
  const spent = cfbGmSpent(next, year, portalSeed, offers);
  if (spent > budget) return false;
  if (!reserve) return true;
  const missing = cfbGmOpenSlots(next);
  const used = new Set(next.map((r) => r.playerId));
  // The final three vacancies must be reserved against DISTINCT players.
  // Summing one cheap dual-eligible RB/WR or the same Front Seven player twice
  // can falsely allow a pick that leaves the GM with an unfillable cap.
  // There are at most three simultaneous future assignments here; retaining
  // the three cheapest choices per slot is exact for a minimum-cost matching.
  if (missing.length <= 3) {
    // Keep only the cheapest N distinct candidates in one pass instead of
    // sorting the entire pool for every phone-side wheel option.
    const choices = missing.map(slot => {
      const cheapest: Array<{player:CfbGmPlayer;cost:number}> = [];
      for (const player of CFB_GM_PLAYERS) {
        if (used.has(player.id) || excluded.has(player.id) || !player.eligibleSlots.includes(slot)
          || (year === 2 && !cfbGmPortalAvailable(player,portalSeed))) continue;
        const cost = cfbGmPrice(player,year,portalSeed,offers);
        const at = cheapest.findIndex(other => cost < other.cost
          || (cost === other.cost && player.id < other.player.id));
        if (at < 0) {
          if (cheapest.length < missing.length) cheapest.push({player,cost});
        } else cheapest.splice(at,0,{player,cost});
        if (cheapest.length > missing.length) cheapest.pop();
      }
      return cheapest.map(item => item.player);
    });
    if (choices.some(group => !group.length)) return false;
    let lowest = Infinity;
    const taken = new Set<string>();
    const search = (index: number, cost: number) => {
      if (cost >= lowest) return;
      if (index === choices.length) { lowest = Math.min(lowest, cost); return; }
      for (const option of choices[index]!) {
        if (taken.has(option.id)) continue;
        taken.add(option.id);
        search(index+1, cost+cfbGmPrice(option,year,portalSeed,offers));
        taken.delete(option.id);
      }
    };
    search(0,0);
    return spent + lowest <= budget;
  }
  // Fast optimistic floor while many positions remain. The exact distinct
  // matching is enforced as soon as three or fewer positions are empty.
  const floor = missing.reduce((sum, slot) => {
    let best = Infinity;
    for (const p of CFB_GM_PLAYERS) {
      if (!used.has(p.id) && !excluded.has(p.id) && p.eligibleSlots.includes(slot)
        && (year === 1 || cfbGmPortalAvailable(p,portalSeed))) best = Math.min(best, cfbGmPrice(p, year, portalSeed, offers));
    }
    return sum + best;
  }, 0);
  return spent + floor <= budget;
}
export function cfbGmCandidates(schoolId: string, roster: readonly CfbGmRosterEntry[], budget: number, year: 1 | 2, reserve = true, excluded: ReadonlySet<string> = new Set(), portalSeed = "", offers: Readonly<Record<string, CfbGmRetentionAgreement>> = {}) {
  return cfbGmPlayersAt(schoolId).filter((p) => !excluded.has(p.id) && affordable(roster, p, budget, year, reserve, excluded, portalSeed, offers));
}
export function cfbGmEligibleSchools(roster: readonly CfbGmRosterEntry[], budget: number, year: 1 | 2, previous: string | null, pool: readonly string[] = CFB_GM_AP_SCHOOLS, excluded: ReadonlySet<string> = new Set(), portalSeed = "", offers: Readonly<Record<string, CfbGmRetentionAgreement>> = {}) {
  const result = pool.filter((schoolId) => cfbGmCandidates(schoolId, roster, budget, year, true, excluded, portalSeed, offers).length > 0);
  const nonRepeat = result.filter((id) => id !== previous);
  return nonRepeat.length ? nonRepeat : result;
}
export function cfbGmPick(roster: readonly CfbGmRosterEntry[], id: string, budget: number, year: 1 | 2, excluded: ReadonlySet<string> = new Set(), portalSeed = "", offers: Readonly<Record<string, CfbGmRetentionAgreement>> = {}) {
  const player = cfbGmPlayer(id);
  if (!player || !cfbGmCandidates(player.schoolId, roster, budget, year, true, excluded, portalSeed, offers).some((p) => p.id === id)) return null;
  const next = cfbGmReflow([...roster, {slot: player.eligibleSlots[0]!, playerId: id, acquired: year === 1 ? "draft" : "portal"}], year, portalSeed);
  return next;
}
export function cfbGmSpin(seed: string, index: number, schoolIds: readonly string[]) {
  if (!schoolIds.length) return null;
  return schoolIds[cfbGmHash(seed + ":" + index + ":wheel") % schoolIds.length]!;
}
export function cfbGmInitial(seed: string, budget: CfbGmBudget = "POWERHOUSE"): CfbGmRun {
  return {version: CFB_GM_VERSION, seed, phase: "intro", budget, schoolIds: [...CFB_GM_AP_SCHOOLS],
    roster: [], finalRoster: [], departures: [], voluntaryPortalOuts: [], retentionOffers: {},
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
    const odds = departureOdds(player.id, player.currentGrade, player.classification, loyaltyBoost);
    const reason: CfbGmDeparture["reason"] | null = roll < odds.draftProbability ? "NFL declaration"
      : roll < odds.eligibilityThreshold ? "Eligibility"
      : roll < odds.exitProbability ? "Transfer portal" : null;
    return reason ? [{playerId: player.id, slot: row.slot, reason}] : [];
  });
}
export function cfbGmEnterOffseason(run: CfbGmRun): CfbGmRun {
  const departures = cfbGmForcedDepartures(run);
  const leaving = new Set(departures.map((d) => d.playerId));
  return {...run, phase: "offseason", departures, retentionOffers: {},
    finalRoster: cfbGmReflow(run.roster.filter((r) => !leaving.has(r.playerId)), 2, run.seed)!,
    pendingSchool: null};
}
/** Familiar teammates and stable returning starters create modest win-probability
 * chemistry, never displayed ability or hidden underlying HQ grades.
 */
export function cfbGmChemistry(roster: readonly CfbGmRosterEntry[], year: 1 | 2 = 1,
  original: readonly CfbGmRosterEntry[] = roster) {
  const players = roster.map(r => ({slot:r.slot, player:cfbGmPlayer(r.playerId)}))
    .filter((r):r is {slot:CfbGmSlot;player:CfbGmPlayer} => Boolean(r.player));
  let score = 43;
  for (let a = 0; a < players.length; a++) for (let b = a + 1; b < players.length; b++) {
    const x = players[a]!, y = players[b]!;
    if (x.player.schoolId !== y.player.schoolId) continue;
    score += 5;
    if ((x.slot === "QB" && ["WR","FLEX"].includes(y.slot)) ||
      (y.slot === "QB" && ["WR","FLEX"].includes(x.slot))) score += 3;
    if (x.slot.startsWith("FRONT_7") && y.slot.startsWith("FRONT_7")) score += 2;
  }
  if (year === 2) {
    const returning = new Set(original.map(r => r.playerId));
    score += players.filter(p=>returning.has(p.player.id)).length * 2 - 6;
  }
  const meter = Math.max(15, Math.min(92, score));
  return {meter, label: meter >= 76 ? "ELITE" : meter >= 63 ? "STRONG" : meter >= 46 ? "CONNECTED" : "BUILDING",
    adjustment: Math.max(-.8, Math.min(1.1, (meter - 48) * .025))};
}
/** Each returner gets one binding 2027 offer. Undershooting can cost a player;
 * a Priority offer buys certainty at a premium. No reroll or retry loop.
 */
export function cfbGmPendingRetentions(run: CfbGmRun) {
  const forced = new Set(run.departures.map(d => d.playerId));
  const released = new Set(run.voluntaryPortalOuts);
  return run.roster.filter(r => !forced.has(r.playerId) && !released.has(r.playerId)
    && !run.retentionOffers[r.playerId]).map(r => cfbGmPlayer(r.playerId)!).filter(Boolean);
}
export function cfbGmRetentionQuote(run: CfbGmRun, player: CfbGmPlayer) {
  const ask = cfbGmYear2Ask(player, run.seed);
  const chemistry = cfbGmChemistry(run.roster).meter;
  const price = (factor:number) => Math.max(125_000, Math.round(ask * factor / 25_000) * 25_000);
  // A fixed private minimum prevents unlimited retries and makes discounts real risks.
  const threshold = ask * (.855 + rate("nil:2027:reservation:" + run.seed + ":" + player.id) * .195
    - Math.max(0, chemistry - 55) * .0007);
  return {ask, VALUE:price(.86), MARKET:price(1), PRIORITY:price(1.12), threshold};
}
export function cfbGmNegotiateRetention(run: CfbGmRun, playerId: string, tier: CfbGmRetentionTier): CfbGmRun | null {
  if (run.phase !== "offseason" || run.pendingSchool || !["VALUE","MARKET","PRIORITY"].includes(tier)
    || !cfbGmPendingRetentions(run).some(p => p.id === playerId)) return null;
  const player = cfbGmPlayer(playerId)!;
  const quote = cfbGmRetentionQuote(run, player);
  const amount = quote[tier];
  const accepted = tier === "PRIORITY" || amount >= quote.threshold;
  const retentionOffers = {...run.retentionOffers, [playerId]:{tier,amount,accepted}};
  if (accepted) return {...run, retentionOffers};
  const row = run.finalRoster.find(r => r.playerId === playerId)!;
  return {...run, retentionOffers, finalRoster:run.finalRoster.filter(r => r.playerId !== playerId),
    departures:[...run.departures,{playerId,slot:row.slot,reason:"NIL negotiation"}]};
}
export function cfbGmOffseasonReady(run: CfbGmRun) {
  return run.phase === "offseason" && cfbGmPendingRetentions(run).length === 0 &&
    run.finalRoster.length === CFB_GM_ROSTER_SLOTS.length &&
    cfbGmSpent(run.finalRoster, 2, run.seed, run.retentionOffers) <= CFB_GM_BUDGETS[run.budget];
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
/** College's own seven-core overall scale. Independent from the NFL GM
 * rating-to-OVR transfer function and from any individual Wheel rating.
 * A core of 88 is competitive, not automatically an NFL-style 92 OVR.
 */
const CFB_GM_OVR_ANCHORS = [[72,60],[76,66],[80,74],[82,78],[84,82],[86,86],
  [88,90],[90,94],[92,97],[94,98],[96,99]] as const;
export function cfbGmTeamOverall(grade: number) {
  if (!Number.isFinite(grade)) throw new Error("Invalid College GM team grade");
  if (grade <= CFB_GM_OVR_ANCHORS[0]![0]) return CFB_GM_OVR_ANCHORS[0]![1];
  for (let i=1;i<CFB_GM_OVR_ANCHORS.length;i++) {
    const [highX,highY]=CFB_GM_OVR_ANCHORS[i]!;
    if (grade > highX) continue;
    const [lowX,lowY]=CFB_GM_OVR_ANCHORS[i-1]!;
    return Math.round(lowY+(grade-lowX)/(highX-lowX)*(highY-lowY));
  }
  return 99;
}
/** Explicit roster family, not an inferred EDGE/LB/CB/S specialty. The 468
 * CFB source records do not verify every player's defensive subposition.
 */
export function cfbGmRoleFit(player: Pick<CfbGmPlayer,"family"|"eligibleSlots">, slot: CfbGmSlot) {
  const eligible = player.eligibleSlots.includes(slot);
  const natural = (slot === "QB" && player.family === "QB")
    || (slot === "RB" && player.family === "RB")
    || (slot === "WR" && player.family === "WR")
    || (slot.startsWith("FRONT_7") && player.family === "Front Seven")
    || (slot === "SECONDARY" && player.family === "Secondary");
  const multiplier = slot !== "FLEX" ? 1
    : player.family === "WR" ? 1.05 : player.family === "TE" ? 1.03
    : player.family === "RB" ? .96 : 1;
  return {eligible, label: !eligible ? "INVALID ROLE" : natural ? "PRIMARY FIT" :
    slot === "FLEX" ? "FLEX FIT" : "UTILITY FIT", multiplier};
}
export function cfbGmTeamGrade(roster: readonly CfbGmRosterEntry[], year: 1 | 2 = 1, seed = "") {
  const neutral = 80;
  const contribution = roster.reduce((sum, row) => {
    const player = cfbGmPlayer(row.playerId);
    if (!player) return sum;
    const role = cfbGmRoleFit(player, row.slot);
    if (!role.eligible) throw new Error("College GM illegal role: "+player.id+" / "+row.slot);
    const flexRole = role.multiplier;
    return sum + (cfbGmEffectiveGrade(player, year, seed) - neutral)
      * CFB_GM_POSITION_WEIGHTS[row.slot] * flexRole;
  }, 0);
  return Math.round((neutral + contribution) * 10) / 10;
}
export function cfbGmSeason(run: CfbGmRun, year: 1 | 2): CfbGmSeason {
  const roster = year === 1 ? run.roster : run.finalRoster;
  const teamGrade = cfbGmTeamGrade(roster, year, run.seed);
  const chemistry = cfbGmChemistry(roster, year, run.roster);
  const continuity = (year === 1 ? 0 : cfbGmContinuity(run).adjustment) + chemistry.adjustment;
  const season = cfbGmSimulateCollegeSeason(run.seed, year, teamGrade + continuity);
  return {year, teamGrade, overall: cfbGmTeamOverall(teamGrade), finish: season.finish,
    chemistry: chemistry.meter, continuity, winOdds: season.winOdds, wins:season.wins, losses:season.losses,
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
  if (!cfbGmReflow(r.roster) || !cfbGmReflow(r.finalRoster)
    || !r.retentionOffers || typeof r.retentionOffers !== "object") return null;
  return r as CfbGmRun;
}
