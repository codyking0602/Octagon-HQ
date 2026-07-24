import {
  getPlayFighter,
  playFighters,
  type PlayFighter,
} from "./playFighterPool";

export type KeepCutPackId =
  | "ufc-careers"
  | "all-careers"
  | "never-undisputed"
  | "former-champions"
  | "lightweight"
  | "welterweight"
  | "heavyweight"
  | "hardest-at-peak"
  | "most-complete"
  | "best-finisher"
  | "biggest-what-if"
  | "action-fighters"
  | "ufc-stars"
  | "cult-chaos";

export type KeepCutTierId = "elite" | "great" | "good" | "average" | "below-average" | "bad";

export interface KeepCutPack {
  id: KeepCutPackId;
  group: "Serious" | "Debate" | "Entertainment" | "Chaos";
  name: string;
  prompt: string;
  description: string;
}

export interface KeepCutRole {
  id: string;
  label: string;
  weights: Partial<Record<KeepCutTierId, number>>;
  allowBad: boolean;
}

export interface KeepCutAssignment {
  roleId: string;
  targetTier: KeepCutTierId;
  actualTier: KeepCutTierId;
  fighterId: string;
}

export interface KeepCutLineup {
  packId: KeepCutPackId;
  seed: string;
  fighters: PlayFighter[];
  assignments: KeepCutAssignment[];
  shape: string;
  recentOverlap: number;
  repeatedShape: boolean;
}

export interface KeepCutHistory {
  lineups: string[][];
  shapes: string[];
}

export const KEEP_CUT_PACKS: readonly KeepCutPack[] = [
  { id: "ufc-careers", group: "Serious", name: "UFC Careers", prompt: "Keep four UFC careers. Cut four.", description: "Men's UFC-only career value." },
  { id: "all-careers", group: "Serious", name: "All UFC Careers", prompt: "Keep four UFC careers. Cut four.", description: "Men and women together on one UFC-only career scale." },
  { id: "never-undisputed", group: "Serious", name: "Never Won Undisputed Gold", prompt: "Keep four. Cut four.", description: "The best UFC careers without undisputed UFC gold." },
  { id: "former-champions", group: "Serious", name: "Former Champions", prompt: "Keep four champions. Cut four.", description: "Recognized UFC champions from the Play roster." },
  { id: "lightweight", group: "Serious", name: "Lightweight", prompt: "Keep four lightweights. Cut four.", description: "UFC careers rated specifically at lightweight." },
  { id: "welterweight", group: "Serious", name: "Welterweight", prompt: "Keep four welterweights. Cut four.", description: "UFC careers rated specifically at welterweight." },
  { id: "heavyweight", group: "Serious", name: "Heavyweight", prompt: "Keep four heavyweights. Cut four.", description: "UFC careers rated specifically at heavyweight." },
  { id: "hardest-at-peak", group: "Debate", name: "Hardest to Beat at Their Peak", prompt: "Keep four fighters at their hardest-to-beat UFC peak. Cut four.", description: "Peak control, durability, rounds won, and elite-opponent proof." },
  { id: "most-complete", group: "Debate", name: "Most Complete Fighter", prompt: "Keep four complete fighters. Cut four.", description: "Striking, wrestling, grappling, defense, cardio, and adaptability." },
  { id: "best-finisher", group: "Debate", name: "Best Finisher", prompt: "Keep four UFC finishers. Cut four.", description: "Finishing threat adjusted for UFC volume and stakes." },
  { id: "biggest-what-if", group: "Debate", name: "Biggest UFC What-If", prompt: "Keep four UFC what-ifs. Cut four.", description: "Unrealized upside, injuries, timing, choices, and short runs." },
  { id: "action-fighters", group: "Entertainment", name: "Action Fighters", prompt: "Keep four action fighters. Cut four.", description: "Violence, pace, drama, and entertainment reliability." },
  { id: "ufc-stars", group: "Entertainment", name: "UFC Star Power", prompt: "Keep four UFC stars. Cut four.", description: "UFC fame, drawing power, cultural reach, and lasting recognition." },
  { id: "cult-chaos", group: "Chaos", name: "Cult & Chaos", prompt: "Keep four agents of chaos. Cut four.", description: "Personality, novelty, unpredictability, and cult appeal." },
] as const;

export const KEEP_CUT_ROLES: readonly KeepCutRole[] = [
  { id: "anchor", label: "Top anchor", weights: { elite: 0.6, great: 0.4 }, allowBad: false },
  { id: "strong-one", label: "Strong option", weights: { great: 0.45, good: 0.55 }, allowBad: false },
  { id: "strong-two", label: "Strong option", weights: { great: 0.45, good: 0.55 }, allowBad: false },
  { id: "middle-one", label: "Middle option", weights: { good: 0.5, average: 0.5 }, allowBad: false },
  { id: "middle-two", label: "Middle option", weights: { good: 0.5, average: 0.5 }, allowBad: false },
  { id: "trap-one", label: "Potential trap", weights: { average: 0.55, "below-average": 0.45 }, allowBad: false },
  { id: "trap-two", label: "Potential trap", weights: { average: 0.55, "below-average": 0.45 }, allowBad: false },
  { id: "wildcard", label: "Wildcard", weights: { elite: 0.08, great: 0.12, good: 0.2, average: 0.25, "below-average": 0.25, bad: 0.1 }, allowBad: true },
] as const;

const TIER_ORDER: readonly KeepCutTierId[] = ["elite", "great", "good", "average", "below-average", "bad"];
const HISTORY_KEY = "octagon-hq:keep-cut-history:v2";
const HISTORY_LIMIT = 4;
const GENERATION_ATTEMPTS = 14;

const undisputedChampions = new Set([
  "Jon Jones", "Georges St-Pierre", "Demetrious Johnson", "Anderson Silva", "Khabib Nurmagomedov",
  "Alexander Volkanovski", "Jose Aldo", "Dominick Cruz", "Kamaru Usman", "Max Holloway", "Daniel Cormier",
  "Stipe Miocic", "Islam Makhachev", "Charles Oliveira", "Israel Adesanya", "Alex Pereira", "Conor McGregor",
  "Henry Cejudo", "Amanda Nunes", "Valentina Shevchenko", "Ronda Rousey", "Joanna Jedrzejczyk", "Matt Hughes",
  "Randy Couture", "B.J. Penn", "Chuck Liddell", "Tito Ortiz", "Cain Velasquez", "Francis Ngannou",
  "Junior dos Santos", "Robbie Lawler", "Michael Bisping", "Brock Lesnar", "Frankie Edgar", "T.J. Dillashaw",
  "Aljamain Sterling", "Petr Yan", "Deiveson Figueiredo", "Dricus du Plessis", "Tyron Woodley", "Ilia Topuria",
  "Sean Strickland", "Robert Whittaker", "Sean O'Malley", "Zhang Weili", "Rose Namajunas", "Miesha Tate",
  "Alexa Grasso", "Julianna Pena", "Carla Esparza", "Holly Holm", "Alexandre Pantoja", "Royce Gracie",
  "Frank Shamrock", "Leon Edwards", "Belal Muhammad", "Merab Dvalishvili", "Tom Aspinall", "Brandon Moreno",
  "Cody Garbrandt", "Benson Henderson", "Eddie Alvarez", "Fabricio Werdum", "Andrei Arlovski", "Frank Mir",
  "Jiri Prochazka", "Glover Teixeira", "Jamahal Hill", "Rashad Evans", "Forrest Griffin", "Jessica Andrade",
  "Anthony Pettis",
]);

const subjectiveOverrides: Record<string, Partial<Record<KeepCutPackId, number>>> = {
  "CM Punk": { "ufc-careers": 5, "all-careers": 5, "hardest-at-peak": 5, "most-complete": 8, "best-finisher": 5, "biggest-what-if": 35, "action-fighters": 15, "ufc-stars": 60, "cult-chaos": 95 },
  "Kimbo Slice": { "ufc-careers": 25, "all-careers": 25, "hardest-at-peak": 42, "most-complete": 25, "best-finisher": 62, "biggest-what-if": 70, "action-fighters": 82, "ufc-stars": 88, "cult-chaos": 96 },
  "Conor McGregor": { "ufc-stars": 100, "cult-chaos": 90 },
  "Ronda Rousey": { "ufc-stars": 96 },
  "Nate Diaz": { "action-fighters": 94, "ufc-stars": 94, "cult-chaos": 95 },
  "Donald Cerrone": { "action-fighters": 96, "cult-chaos": 88 },
  "Michael Chandler": { "action-fighters": 96 },
  "Derrick Lewis": { "best-finisher": 95, "cult-chaos": 90 },
  "Yoel Romero": { "biggest-what-if": 92 },
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(rows: readonly T[], random: () => number) {
  const copy = [...rows];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function packFor(packId: KeepCutPackId) {
  return KEEP_CUT_PACKS.find((pack) => pack.id === packId) ?? KEEP_CUT_PACKS[0];
}

function hasDivision(fighter: PlayFighter, division: string) {
  return fighter.divisions.includes(division);
}

function isFormerChampion(fighter: PlayFighter) {
  return undisputedChampions.has(fighter.name) || Boolean(fighter.model && fighter.model.visibleStats.titleFightWins > 0);
}

function baseCareer(fighter: PlayFighter) {
  return fighter.ratings.career;
}

function peakRating(fighter: PlayFighter) {
  const model = fighter.model;
  if (!model) return fighter.ratings.career;
  const stats = model.visibleStats;
  return clamp(42 + (model.primeDominance * 1.35) + (model.apexPeak * 1.2) + (stats.roundsWonPct * 0.12) + (stats.finishRatePct * 0.025) - (stats.timesFinishedPrime * 3));
}

function completeRating(fighter: PlayFighter) {
  return clamp((fighter.ratings.career * 0.3) + (fighter.ratings.striking * 0.35) + (fighter.ratings.grappling * 0.35));
}

function finisherRating(fighter: PlayFighter) {
  const model = fighter.model;
  if (!model) return clamp((fighter.ratings.striking * 0.75) + 10);
  const stats = model.visibleStats;
  return clamp(20 + (stats.finishRatePct * 0.58) + Math.min(12, stats.topFiveWins * 1.4) + Math.min(10, stats.titleFightWins * 1.2) + (model.apexPeak * 0.35));
}

function actionRating(fighter: PlayFighter) {
  const model = fighter.model;
  if (!model) return clamp((fighter.ratings.striking * 0.6) + 25);
  const stats = model.visibleStats;
  return clamp(30 + (stats.finishRatePct * 0.38) + Math.min(18, model.longestUfcWinStreak * 1.2) + Math.max(0, 82 - fighter.ratings.career) * 0.08);
}

function starRating(fighter: PlayFighter) {
  const model = fighter.model;
  const titleWins = model?.visibleStats.titleFightWins ?? 0;
  return clamp(25 + (fighter.ratings.career * 0.55) + Math.min(18, titleWins * 2.5));
}

function whatIfRating(fighter: PlayFighter) {
  const peak = peakRating(fighter);
  return clamp(32 + Math.max(0, peak - fighter.ratings.career) * 1.25 + (fighter.model?.visibleStats.timesFinishedPrime ?? 0) * 2);
}

function cultRating(fighter: PlayFighter) {
  const derived = 18 + Math.max(0, 88 - fighter.ratings.career) * 0.35 + Math.max(0, actionRating(fighter) - 70) * 0.65;
  return clamp(fighter.model ? Math.max(35, derived) : derived);
}

export function keepCutRating(packId: KeepCutPackId, fighter: PlayFighter) {
  const override = subjectiveOverrides[fighter.name]?.[packId];
  if (typeof override === "number") return override;
  if (packId === "hardest-at-peak") return peakRating(fighter);
  if (packId === "most-complete") return completeRating(fighter);
  if (packId === "best-finisher") return finisherRating(fighter);
  if (packId === "biggest-what-if") return whatIfRating(fighter);
  if (packId === "action-fighters") return actionRating(fighter);
  if (packId === "ufc-stars") return starRating(fighter);
  if (packId === "cult-chaos") return cultRating(fighter);
  if (packId === "lightweight") return clamp(baseCareer(fighter) - (fighter.divisions[0] === "Lightweight" ? 0 : 6));
  if (packId === "welterweight") return clamp(baseCareer(fighter) - (fighter.divisions[0] === "Welterweight" ? 0 : 6));
  if (packId === "heavyweight") return clamp(baseCareer(fighter) - (fighter.divisions[0] === "Heavyweight" ? 0 : 6));
  return baseCareer(fighter);
}

export function keepCutPool(packId: KeepCutPackId) {
  const rows = playFighters.filter((fighter) => {
    if (packId === "ufc-careers") return fighter.gender === "men";
    if (packId === "never-undisputed") return !undisputedChampions.has(fighter.name);
    if (packId === "former-champions") return isFormerChampion(fighter);
    if (packId === "lightweight") return fighter.gender === "men" && hasDivision(fighter, "Lightweight");
    if (packId === "welterweight") return fighter.gender === "men" && hasDivision(fighter, "Welterweight");
    if (packId === "heavyweight") return fighter.gender === "men" && hasDivision(fighter, "Heavyweight");
    return true;
  });
  return rows.filter((fighter) => Number.isFinite(keepCutRating(packId, fighter)));
}

export function keepCutTier(score: number): KeepCutTierId {
  if (score >= 92) return "elite";
  if (score >= 82) return "great";
  if (score >= 70) return "good";
  if (score >= 55) return "average";
  if (score >= 35) return "below-average";
  return "bad";
}

function weightedTier(role: KeepCutRole, random: () => number) {
  const entries = TIER_ORDER.map((tier) => [tier, role.weights[tier] ?? 0] as const).filter(([, weight]) => weight > 0);
  let cursor = random() * entries.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [tier, weight] of entries) {
    cursor -= weight;
    if (cursor <= 0) return tier;
  }
  return entries[entries.length - 1]?.[0] ?? "average";
}

function pickCandidate(
  rows: readonly { fighter: PlayFighter; tier: KeepCutTierId }[],
  target: KeepCutTierId,
  role: KeepCutRole,
  used: Set<string>,
  badUsed: boolean,
  recentPressure: Map<string, number>,
  random: () => number,
) {
  const eligible = rows.filter((row) => !used.has(row.fighter.id) && (!badUsed || row.tier !== "bad") && (role.allowBad || row.tier !== "bad"));
  const targetIndex = TIER_ORDER.indexOf(target);
  const ordered = [...eligible].sort((left, right) => {
    const leftDistance = Math.abs(TIER_ORDER.indexOf(left.tier) - targetIndex);
    const rightDistance = Math.abs(TIER_ORDER.indexOf(right.tier) - targetIndex);
    if (leftDistance !== rightDistance) return leftDistance - rightDistance;
    const leftPressure = recentPressure.get(left.fighter.id) ?? 0;
    const rightPressure = recentPressure.get(right.fighter.id) ?? 0;
    if (leftPressure !== rightPressure) return leftPressure - rightPressure;
    return random() - 0.5;
  });
  return ordered[0] ?? null;
}

function shapeFor(tiers: readonly KeepCutTierId[]) {
  return TIER_ORDER.map((tier) => `${tier}:${tiers.filter((value) => value === tier).length}`).join("|");
}

function historyPressure(history: KeepCutHistory) {
  const pressure = new Map<string, number>();
  history.lineups.forEach((lineup, index) => {
    const weight = Math.max(1, HISTORY_LIMIT - index);
    lineup.forEach((id) => pressure.set(id, (pressure.get(id) ?? 0) + weight));
  });
  return pressure;
}

function attemptLineup(packId: KeepCutPackId, seed: string, history: KeepCutHistory, attempt: number) {
  const random = mulberry32(hashSeed(`keep-cut|${packId}|${seed}|${attempt}`));
  const rows = keepCutPool(packId).map((fighter) => ({ fighter, tier: keepCutTier(keepCutRating(packId, fighter)) }));
  const pressure = historyPressure(history);
  const used = new Set<string>();
  const assignments: KeepCutAssignment[] = [];
  const fighters: PlayFighter[] = [];
  let badUsed = false;

  for (const role of KEEP_CUT_ROLES) {
    const targetTier = weightedTier(role, random);
    const picked = pickCandidate(rows, targetTier, role, used, badUsed, pressure, random);
    if (!picked) return null;
    fighters.push(picked.fighter);
    used.add(picked.fighter.id);
    badUsed = badUsed || picked.tier === "bad";
    assignments.push({ roleId: role.id, targetTier, actualTier: picked.tier, fighterId: picked.fighter.id });
  }

  const shuffled = shuffle(fighters, random);
  const ids = shuffled.map((fighter) => fighter.id);
  const recentSet = new Set(history.lineups.flat());
  const recentOverlap = ids.filter((id) => recentSet.has(id)).length;
  const shape = shapeFor(assignments.map((assignment) => assignment.actualTier));
  return { fighters: shuffled, assignments, shape, recentOverlap, repeatedShape: history.shapes.includes(shape) };
}

export function createKeepCutSeed() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 0xffffffff).toString(36)}`;
}

export function createKeepCutLineup(
  packId: KeepCutPackId,
  seed: string,
  history: KeepCutHistory = { lineups: [], shapes: [] },
): KeepCutLineup {
  let best: ReturnType<typeof attemptLineup> = null;
  let bestPenalty = Number.POSITIVE_INFINITY;
  for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt += 1) {
    const candidate = attemptLineup(packId, seed, history, attempt);
    if (!candidate) continue;
    const penalty = candidate.recentOverlap * 10 + (candidate.repeatedShape ? 5 : 0);
    if (penalty < bestPenalty) {
      best = candidate;
      bestPenalty = penalty;
    }
    if (candidate.recentOverlap <= 1 && !candidate.repeatedShape) break;
  }
  if (!best) throw new Error(`Keep 4, Cut 4 could not build a lineup for ${packFor(packId).name}.`);
  return { packId, seed, ...best };
}

export function resolveKeepCutChallenge(packId: KeepCutPackId, lineupIds: readonly string[]) {
  if (lineupIds.length !== 8 || new Set(lineupIds).size !== 8) return null;
  const allowed = new Set(keepCutPool(packId).map((fighter) => fighter.id));
  const fighters = lineupIds.map((id) => getPlayFighter(id));
  return fighters.every((fighter) => fighter && allowed.has(fighter.id)) ? fighters as PlayFighter[] : null;
}

export function keepCutChallengeUrl(packId: KeepCutPackId, lineup: readonly PlayFighter[]) {
  const url = new URL("/play/keep-cut", window.location.origin);
  url.searchParams.set("pack", packId);
  url.searchParams.set("lineup", lineup.map((fighter) => fighter.id).join(","));
  return url.toString();
}

export function loadKeepCutHistory(packId: KeepCutPackId): KeepCutHistory {
  if (typeof window === "undefined") return { lineups: [], shapes: [] };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "{}") as Record<string, KeepCutHistory>;
    return {
      lineups: Array.isArray(parsed[packId]?.lineups) ? parsed[packId].lineups.slice(0, HISTORY_LIMIT) : [],
      shapes: Array.isArray(parsed[packId]?.shapes) ? parsed[packId].shapes.slice(0, HISTORY_LIMIT) : [],
    };
  } catch {
    return { lineups: [], shapes: [] };
  }
}

export function saveKeepCutLineup(lineup: KeepCutLineup) {
  if (typeof window === "undefined") return;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "{}") as Record<string, KeepCutHistory>;
    const current = loadKeepCutHistory(lineup.packId);
    parsed[lineup.packId] = {
      lineups: [lineup.fighters.map((fighter) => fighter.id), ...current.lineups].slice(0, HISTORY_LIMIT),
      shapes: [lineup.shape, ...current.shapes].slice(0, HISTORY_LIMIT),
    };
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(parsed));
  } catch {
    // Repeat protection is progressive enhancement.
  }
}
