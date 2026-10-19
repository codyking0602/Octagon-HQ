import {
  hitTheNumberScore,
  type HitTheNumberResultStatus,
} from "../play/hitTheNumberEngine";
import {
  seededLineupRandom,
  shuffleLineup,
  createReplaySeed,
  replayLineupIdentity,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import { nbaHitNumberSubjects, type NbaHitNumberSubject } from "./nbaHitTheNumberSubjects";

export const NBA_HIT_THE_NUMBER_GAME_ID = "nba-hit-the-number";
export const NBA_HIT_THE_NUMBER_VERSION = "nba-hit-the-number-v1";
export const NBA_HIT_THE_NUMBER_MIN_PICKS = 4;
export const NBA_HIT_THE_NUMBER_MAX_PICKS = 5;
export type NbaHitNumberScope = "career" | "season";
export type NbaHitNumberStat = "ppg" | "apg" | "rpg";
export type NbaHitNumberMetricId = `${NbaHitNumberScope}-${NbaHitNumberStat}`;
export type NbaHitNumberFormatId = "classic" | "themed-lineup" | "one-from-each" | "build-the-team";
export type NbaHitNumberBoardType = "open-roster" | "random-pool";

export interface NbaHitNumberSlot {
  id: string;
  label: string;
  role: NbaHitNumberSubject["position"] | "any" | "high" | "middle" | "low";
}
export interface NbaHitNumberPlan {
  seed: string;
  version: typeof NBA_HIT_THE_NUMBER_VERSION;
  boardType: NbaHitNumberBoardType;
  metricId: NbaHitNumberMetricId;
  metricLabel: string;
  league: "NBA";
  domainId: NbaHitNumberScope;
  pickCount: 4 | 5;
  formatId: NbaHitNumberFormatId;
  configurationLabel: string | null;
  target: number;
  subjectIds: string[];
  slots: NbaHitNumberSlot[];
}
export interface NbaHitNumberRun { plan: NbaHitNumberPlan; identity: PlayLineupIdentity; }
export interface NbaHitNumberResult {
  status: HitTheNumberResultStatus;
  target: number;
  total: number;
  distance: number;
  score: number;
  selections: Array<{ subjectId: string; value: number }>;
}
export interface NbaHitNumberQuality {
  passes: boolean;
  legalCombinations: number;
  underRate: number;
  goodUnders: number;
  modestUnders: number;
  busts: number;
}
export const NBA_HIT_THE_NUMBER_FORMAT_PROFILE = [
  { value: "classic", weight: 40 },
  { value: "themed-lineup", weight: 30 },
  { value: "one-from-each", weight: 15 },
  { value: "build-the-team", weight: 15 },
] as const;
export const NBA_HIT_THE_NUMBER_PICK_PROFILE = [
  { value: 4, weight: 85 },
  { value: 5, weight: 15 },
] as const;
export const NBA_HIT_THE_NUMBER_STAT_CATALOG: readonly { id: NbaHitNumberMetricId; label: string }[] = [
  { id: "career-ppg", label: "Career Points Per Game" },
  { id: "career-apg", label: "Career Assists Per Game" },
  { id: "career-rpg", label: "Career Rebounds Per Game" },
  { id: "season-ppg", label: "2024–25 Points Per Game" },
  { id: "season-apg", label: "2024–25 Assists Per Game" },
  { id: "season-rpg", label: "2024–25 Rebounds Per Game" },
] as const;
export const NBA_HIT_THE_NUMBER_POOL_SIZE: Record<4 | 5, number> = { 4: 12, 5: 14 };

const subjectById = new Map(nbaHitNumberSubjects.map((subject) => [subject.id, subject]));
const round1 = (value: number) => Math.round(value * 10) / 10;
function weighted<T>(values: readonly { value: T; weight: number }[], random: () => number): T {
  let roll = random() * values.reduce((sum, item) => sum + item.weight, 0);
  for (const item of values) { roll -= item.weight; if (roll < 0) return item.value; }
  return values[values.length - 1]!.value;
}
function scopeFor(metricId: NbaHitNumberMetricId): NbaHitNumberScope {
  return metricId.startsWith("career") ? "career" : "season";
}
function statFor(metricId: NbaHitNumberMetricId): NbaHitNumberStat {
  return metricId.endsWith("ppg") ? "ppg" : metricId.endsWith("apg") ? "apg" : "rpg";
}
export function getNbaHitTheNumberSubject(id: string) {
  return subjectById.get(id) ?? null;
}
export function nbaHitTheNumberValue(id: string, metricId: NbaHitNumberMetricId) {
  const subject = subjectById.get(id);
  if (!subject || subject.scope !== scopeFor(metricId)) throw new Error("Unavailable NBA Hit the Number subject/stat pairing.");
  return subject[statFor(metricId)];
}
export function formatNbaHitTheNumberValue(_plan: NbaHitNumberPlan, value: number) {
  return round1(value).toFixed(1);
}
function makeSlots(format: NbaHitNumberFormatId, count: 4 | 5): NbaHitNumberSlot[] {
  if (format === "one-from-each") {
    const roles: NbaHitNumberSlot["role"][] = ["high", "middle", "low", "any", ...(count === 5 ? ["any" as const] : [])];
    return roles.map((role, i) => ({ id: `tier-${i}`, label: ["Top Tier", "Middle Tier", "Lower Tier", "Wild Card", "Wild Card"][i]!, role }));
  }
  if (format === "build-the-team") {
    const roles: NbaHitNumberSlot["role"][] = ["G", "F", "C", "any", ...(count === 5 ? ["any" as const] : [])];
    return roles.map((role, i) => ({ id: `role-${i}`, label: ["Guard", "Forward", "Center", "Flex", "Flex"][i]!, role }));
  }
  return [];
}
function tierFor(subjectId: string, plan: Pick<NbaHitNumberPlan, "subjectIds" | "metricId">) {
  const ordered = plan.subjectIds
    .map((id) => ({ id, value: nbaHitTheNumberValue(id, plan.metricId) }))
    .sort((a, b) => b.value - a.value || a.id.localeCompare(b.id));
  const rank = ordered.findIndex((subject) => subject.id === subjectId);
  if (rank < Math.floor(ordered.length / 3)) return "high";
  if (rank < Math.ceil(ordered.length * 2 / 3)) return "middle";
  return "low";
}
function accepts(plan: NbaHitNumberPlan, slotIndex: number, subjectId: string) {
  const role = plan.slots[slotIndex]?.role ?? "any";
  if (role === "any") return true;
  if (role === "high" || role === "middle" || role === "low") return tierFor(subjectId, plan) === role;
  return subjectById.get(subjectId)?.position === role;
}
export function nbaHitTheNumberAvailableProgressionSubjectIds(plan: NbaHitNumberPlan, selectedIds: readonly string[]) {
  if (!plan.slots.length || selectedIds.length >= plan.pickCount) return [];
  return plan.subjectIds.filter((id) => !selectedIds.includes(id) && accepts(plan, selectedIds.length, id));
}
export function nbaHitTheNumberSelectionSatisfies(plan: NbaHitNumberPlan, selectedIds: readonly string[]) {
  return selectedIds.length === plan.pickCount
    && new Set(selectedIds).size === selectedIds.length
    && selectedIds.every((id, i) => plan.subjectIds.includes(id) && (!plan.slots.length || accepts(plan, i, id)));
}
// In the tier/position formats players fill slots sequentially; combinations
// count as legal if they admit at least one complete assignment.
function admitsSlots(plan: NbaHitNumberPlan, ids: readonly string[]) {
  if (!plan.slots.length) return true;
  function assign(index: number, available: readonly string[]): boolean {
    if (index === plan.slots.length) return true;
    return available.some((id) => accepts(plan, index, id) && assign(index + 1, available.filter((x) => x !== id)));
  }
  return assign(0, ids);
}
function combinations<T>(pool: readonly T[], count: number, visit: (value: readonly T[]) => void) {
  const chosen: T[] = [];
  function walk(start: number) {
    if (chosen.length === count) { visit(chosen); return; }
    for (let index = start; index <= pool.length - (count - chosen.length); index += 1) {
      chosen.push(pool[index]!); walk(index + 1); chosen.pop();
    }
  }
  walk(0);
}
function legalTotals(plan: NbaHitNumberPlan) {
  const totals: number[] = [];
  combinations(plan.subjectIds, plan.pickCount, (ids) => {
    if (admitsSlots(plan, ids)) totals.push(round1(ids.reduce((sum, id) => sum + nbaHitTheNumberValue(id, plan.metricId), 0)));
  });
  return totals.sort((a, b) => a - b);
}
export function nbaHitTheNumberPlanQuality(plan: NbaHitNumberPlan): NbaHitNumberQuality {
  const totals = legalTotals(plan);
  const unders = totals.filter((total) => total <= plan.target);
  const busts = totals.length - unders.length;
  const scores = unders.map((total) => hitTheNumberScore({
    status: total === plan.target ? "perfect" : "under",
    target: plan.target,
    distance: round1(plan.target - total),
    pickCount: plan.pickCount,
  }));
  const goodUnders = scores.filter((score) => score >= 95).length;
  const modestUnders = scores.filter((score) => score <= 90).length;
  const underRate = totals.length ? unders.length / totals.length : 0;
  return {
    passes: totals.length >= 30 && underRate >= 0.3 && underRate <= 0.7
      && goodUnders >= 4 && modestUnders >= 4 && busts >= 8,
    legalCombinations: totals.length,
    underRate,
    goodUnders,
    modestUnders,
    busts,
  };
}
function candidateSubjects(metricId: NbaHitNumberMetricId, format: NbaHitNumberFormatId, random: () => number) {
  const all = nbaHitNumberSubjects.filter((subject) => subject.scope === scopeFor(metricId));
  if (format !== "themed-lineup") return { subjects: all, theme: null };
  const stat = statFor(metricId);
  const themes = scopeFor(metricId) === "career"
    ? [
        { label: "Scoring Legends", accept: (s: NbaHitNumberSubject) => s.ppg >= 19 },
        { label: "Hall of Fame Icons", accept: (s: NbaHitNumberSubject) => s.games >= 800 },
        { label: "All-Time Greats", accept: (s: NbaHitNumberSubject) => s.games >= 600 },
      ]
    : [
        { label: "2024–25 Stars", accept: (s: NbaHitNumberSubject) => s.ppg >= 17 },
        { label: "2024–25 Playmakers", accept: (s: NbaHitNumberSubject) => s.apg >= 3.5 },
        { label: "2024–25 Frontcourt", accept: (s: NbaHitNumberSubject) => s.position !== "G" },
      ];
  // Narrow specialties are used only with the matching metric so category
  // names remain meaningful and players retain a wide scoring spectrum.
  const viable = themes.filter((theme) => {
    if (theme.label === "Scoring Legends" && stat !== "ppg") return false;
    if (theme.label.includes("Playmakers") && stat !== "apg") return false;
    if (theme.label.includes("Frontcourt") && stat !== "rpg") return false;
    return all.filter(theme.accept).length >= 18;
  });
  const selected = viable[Math.floor(random() * viable.length)];
  return selected ? { subjects: all.filter(selected.accept), theme: selected.label } : { subjects: all, theme: null };
}
function candidatePool(
  subjects: readonly NbaHitNumberSubject[],
  metricId: NbaHitNumberMetricId,
  size: number,
  random: () => number,
): NbaHitNumberSubject[] {
  const byValue = [...subjects].sort((a, b) => a[statFor(metricId)] - b[statFor(metricId)]);
  // An intentionally varied mix prevents all-under boards and ensures choices
  // include affordable contributors as well as tempting high-value stars.
  const bins = Array.from({ length: 4 }, (_, index) =>
    byValue.slice(Math.floor(index * byValue.length / 4), Math.floor((index + 1) * byValue.length / 4)),
  );
  const result: NbaHitNumberSubject[] = [];
  for (let i = 0; i < size; i += 1) {
    const bin = bins[i % bins.length]!.filter((subject) => !result.includes(subject));
    const chosen = shuffleLineup(bin, random)[0];
    if (!chosen) return [];
    result.push(chosen);
  }
  return shuffleLineup(result, random);
}
export function createNbaHitTheNumberPlan(seed: string, boardType: NbaHitNumberBoardType = "random-pool"): NbaHitNumberPlan {
  const random = seededLineupRandom("nba-hit-number-plan", NBA_HIT_THE_NUMBER_VERSION, seed, boardType);
  const pickCount = weighted(NBA_HIT_THE_NUMBER_PICK_PROFILE, random);
  const formatId = weighted(NBA_HIT_THE_NUMBER_FORMAT_PROFILE, random);
  const metricId = weighted(NBA_HIT_THE_NUMBER_STAT_CATALOG.map((metric) => ({
    value: metric.id, weight: metric.id.endsWith("ppg") ? 30 : metric.id.endsWith("apg") ? 18 : 17,
  })), random);
  const poolSize = NBA_HIT_THE_NUMBER_POOL_SIZE[pickCount];
  // If a particular theme is too narrow to yield meaningful risk/reward,
  // change the theme and source pool instead of serving a bad board.
  for (let attempt = 0; attempt < 220; attempt += 1) {
    const eligible = candidateSubjects(metricId, formatId, random);
    const subjects = candidatePool(eligible.subjects, metricId, poolSize, random);
    if (subjects.length !== poolSize) continue;
    const plan: NbaHitNumberPlan = {
      seed,
      version: NBA_HIT_THE_NUMBER_VERSION,
      boardType,
      metricId,
      metricLabel: NBA_HIT_THE_NUMBER_STAT_CATALOG.find((metric) => metric.id === metricId)!.label,
      league: "NBA",
      domainId: scopeFor(metricId),
      pickCount,
      formatId,
      configurationLabel: formatId === "classic" ? null
        : formatId === "themed-lineup" ? eligible.theme
        : formatId === "one-from-each" ? "One From Each"
        : "Build the Team",
      target: 0,
      subjectIds: subjects.map((subject) => subject.id),
      slots: makeSlots(formatId, pickCount),
    };
    const totals = legalTotals(plan);
    if (totals.length < 30) continue;
    const percentile = 0.42 + random() * 0.16;
    plan.target = totals[Math.floor(percentile * (totals.length - 1))]!;
    if (nbaHitTheNumberPlanQuality(plan).passes) return plan;
  }
  throw new Error(`NBA Hit the Number could not create a balanced board for ${seed} / ${formatId} / ${metricId}.`);
}
export function createNbaHitTheNumberRun(seed = createReplaySeed(NBA_HIT_THE_NUMBER_GAME_ID)): NbaHitNumberRun {
  const plan = createNbaHitTheNumberPlan(seed);
  return { plan, identity: replayLineupIdentity(NBA_HIT_THE_NUMBER_GAME_ID, seed, plan.metricId) };
}
export function gradeNbaHitTheNumberSelection(plan: NbaHitNumberPlan, selectedIds: readonly string[]): NbaHitNumberResult {
  if (!nbaHitTheNumberSelectionSatisfies(plan, selectedIds)) throw new Error("Invalid NBA Hit the Number selection.");
  const selections = selectedIds.map((subjectId) => ({ subjectId, value: nbaHitTheNumberValue(subjectId, plan.metricId) }));
  const total = round1(selections.reduce((sum, selection) => sum + selection.value, 0));
  const distance = round1(Math.abs(plan.target - total));
  const status: HitTheNumberResultStatus = distance < 0.05 ? "perfect" : total > plan.target ? "bust" : "under";
  return {
    status, target: plan.target, total, distance, selections,
    score: hitTheNumberScore({ status, target: plan.target, distance, pickCount: plan.pickCount }),
  };
}
