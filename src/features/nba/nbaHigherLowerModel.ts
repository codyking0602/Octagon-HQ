import {
  dailyLineupIdentity, dailyLineupSeed, recordLineupCompletion,
  seededLineupRandom, selectReplayLineup, shuffleLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import { nbaFindLeaderSubjects, type NbaLeaderSubject } from "./nbaFindTheLeaderModel";
import { NBA_HIGHER_LOWER_UNVERIFIED_PHOTO_KEYS } from "./nbaHigherLowerPortraits";
import {
  NBA_HIGHER_LOWER_2025_THREES, NBA_HIGHER_LOWER_ALL_NBA,
  NBA_HIGHER_LOWER_ALL_STAR_SELECTIONS, NBA_HIGHER_LOWER_DRAFT,
} from "./nbaHigherLowerSupplement";

export const NBA_HIGHER_LOWER_GAME_ID = "nba-higher-lower";
export const NBA_HIGHER_LOWER_VERSION = "nba-higher-lower-v1" as const;
export const NBA_HIGHER_LOWER_QUESTION_COUNT = 10;
export type NbaHigherLowerChoice = "higher" | "lower";
export type NbaHigherLowerDifficulty = "approachable" | "competitive" | "tough";
export type NbaHigherLowerCategory = "career" | "season" | "awards" | "draft";

export interface NbaHigherLowerSubject {
  subjectId: string;
  name: string;
  nbaId: number | null;
  context: string;
  value: number;
  formattedValue: string;
  season?: number;
}
export interface NbaHigherLowerQuestion {
  id: string;
  category: NbaHigherLowerCategory;
  difficulty: NbaHigherLowerDifficulty;
  metricKey: string;
  metricLabel: string;
  note?: string;
  known: NbaHigherLowerSubject;
  hidden: NbaHigherLowerSubject;
  answer: NbaHigherLowerChoice;
}
export interface NbaHigherLowerBoard {
  version: typeof NBA_HIGHER_LOWER_VERSION;
  seed: string;
  questions: NbaHigherLowerQuestion[];
}
export interface NbaHigherLowerRun {
  board: NbaHigherLowerBoard;
  identity: PlayLineupIdentity;
}
interface Row {
  id: string;
  name: string;
  key: string;
  nbaId: number | null;
  value: number;
  context: string;
  season?: number;
  modern: boolean;
}
interface Spec {
  key: string;
  label: string;
  category: NbaHigherLowerCategory;
  minGap: number;
  maxGap: number;
  rows: readonly Row[];
  note?: string;
}
interface Pair {
  key: string;
  category: NbaHigherLowerCategory;
  label: string;
  difficulty: NbaHigherLowerDifficulty;
  modern: boolean;
  note?: string;
  left: Row;
  right: Row;
}
function normalizedName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function seasonLabel(endYear: number) {
  return String(endYear - 1) + "–" + String(endYear).slice(-2);
}
const namedSubjects = new Map<string, NbaLeaderSubject[]>();
for (const subject of nbaFindLeaderSubjects) {
  const key = normalizedName(subject.name);
  namedSubjects.set(key, [...(namedSubjects.get(key) ?? []), subject]);
}
const modernNames = new Set(
  nbaFindLeaderSubjects.filter(subject => (subject.season ?? 0) >= 1993).map(subject => normalizedName(subject.name)),
);
function identity(name: string) {
  const subjects = namedSubjects.get(normalizedName(name)) ?? [];
  // Prefer a current NBA person identifier, while preserving historical identities.
  return subjects.find(subject => subject.nbaId != null)?.nbaId ?? null;
}
function supplementRows(
  metric: string,
  values: readonly (readonly [string, number])[],
  label: string,
): Row[] {
  return values.flatMap(([name, value]) => {
    const key = normalizedName(name);
    if (!namedSubjects.has(key) || !Number.isFinite(value)) return [];
    return [{
      id: metric + ":" + key, name, key, nbaId: identity(name), value,
      context: label, modern: modernNames.has(key),
    }];
  });
}
function seasonRows(stat: "points" | "assists" | "rebounds", minimum: number): Row[] {
  const grouped = new Map<string, NbaLeaderSubject[]>();
  for (const subject of nbaFindLeaderSubjects) {
    if (subject.season == null || (subject.games ?? 0) < 45 || subject.values[stat] < minimum) continue;
    const key = normalizedName(subject.name);
    grouped.set(key, [...(grouped.get(key) ?? []), subject]);
  }
  const rows: Row[] = [];
  for (const [key, options] of grouped) {
    const byPeak = [...options].sort((a, b) => b.values[stat] - a.values[stat] || (b.season ?? 0) - (a.season ?? 0));
    const byRecent = [...options].sort((a, b) => (b.season ?? 0) - (a.season ?? 0));
    const featured = [byPeak[0]!, byRecent[0]!].filter((row, index, array) =>
      array.findIndex(other => other.id === row.id) === index
    );
    for (const row of featured) {
      const year = row.season!;
      rows.push({
        id: row.id + ":" + stat, name: row.name, key,
        nbaId: row.nbaId ?? identity(row.name), value: row.values[stat],
        context: seasonLabel(year) + " NBA SEASON", season: year,
        modern: year >= 1993,
      });
    }
  }
  return rows;
}
function careerRows(stat: "points" | "assists" | "rebounds", minimum: number): Row[] {
  return nbaFindLeaderSubjects.filter(subject => subject.season == null && subject.values[stat] >= minimum)
    .map(subject => ({
      id: subject.id + ":" + stat, name: subject.name, key: normalizedName(subject.name),
      nbaId: subject.nbaId ?? identity(subject.name), value: subject.values[stat],
      context: "NBA REGULAR-SEASON CAREER", modern: modernNames.has(normalizedName(subject.name)),
    }));
}
const draftRows: Row[] = NBA_HIGHER_LOWER_DRAFT.flatMap(([name, year, pick]) => {
  const key = normalizedName(name);
  return !namedSubjects.has(key) ? [] : [{
    id: "draft:" + key, name, key, nbaId: identity(name), value: pick,
    context: year + " NBA DRAFT", modern: year >= 1990,
  }];
});
const threeRows: Row[] = NBA_HIGHER_LOWER_2025_THREES.flatMap(([name, value]) => {
  const key = normalizedName(name);
  const subject = namedSubjects.get(key)?.find(row => row.season === 2025);
  return !subject ? [] : [{
    id: "season-2025-three:" + key, name, key, nbaId: subject.nbaId ?? identity(name),
    value, season: 2025, context: "2024–25 NBA SEASON", modern: true,
  }];
});
const specs: readonly Spec[] = [
  // A fan should have a meaningful basketball comparison, not a trivial statistical gulf
  // or an unresolvable tenth-of-a-point coin flip. Bounds are metric-specific.
  { key: "career-points", category: "career", label: "Career Points Per Game", rows: careerRows("points", 14), minGap: 1.7, maxGap: 5.0 },
  { key: "career-assists", category: "career", label: "Career Assists Per Game", rows: careerRows("assists", 3.0), minGap: 0.7, maxGap: 2.4 },
  { key: "career-rebounds", category: "career", label: "Career Rebounds Per Game", rows: careerRows("rebounds", 4.5), minGap: 0.8, maxGap: 3.3 },
  { key: "season-points", category: "season", label: "Season Points Per Game", rows: seasonRows("points", 17), minGap: 1.8, maxGap: 6.0 },
  { key: "season-assists", category: "season", label: "Season Assists Per Game", rows: seasonRows("assists", 4.3), minGap: 0.7, maxGap: 2.7 },
  { key: "season-rebounds", category: "season", label: "Season Rebounds Per Game", rows: seasonRows("rebounds", 6.0), minGap: 0.8, maxGap: 2.6 },
  { key: "season-threes", category: "season", label: "Season 3-Pointers Made Per Game", rows: threeRows, minGap: 0.4, maxGap: 1.3 },
  { key: "all-star", category: "awards", label: "NBA All-Star Selections", rows: supplementRows("all-star", NBA_HIGHER_LOWER_ALL_STAR_SELECTIONS, "THROUGH 2025–26"), minGap: 2, maxGap: 5 },
  { key: "all-nba", category: "awards", label: "All-NBA Team Selections", rows: supplementRows("all-nba", NBA_HIGHER_LOWER_ALL_NBA, "THROUGH 2025–26"), minGap: 2, maxGap: 5 },
  { key: "draft", category: "draft", label: "NBA Draft Overall Pick Number", rows: draftRows, minGap: 3, maxGap: 13, note: "Higher number means a later draft selection." },
];
export const NBA_HIGHER_LOWER_METRIC_KEYS = specs.map(spec => spec.key);
export const NBA_HIGHER_LOWER_GAP_BOUNDS: Readonly<Record<string, Readonly<{ min: number; max: number }>>> =
  Object.fromEntries(specs.map(({ key, minGap, maxGap }) => [key, { min: minGap, max: maxGap }]));

function pairDifficulty(spec: Spec, left: number, right: number): NbaHigherLowerDifficulty {
  const difference = Math.abs(left - right);
  // Draft position and honors are knowledge questions, not naturally easy just
  // because their counts or pick numbers differ by a few units.
  if (spec.category === "draft") return difference <= 6 ? "tough" : "competitive";
  if (spec.category === "awards") return difference <= 2 ? "tough" : "competitive";
  const relativeGap = difference / Math.max(Math.abs(left), Math.abs(right), 1);
  return relativeGap <= 0.14 ? "tough" : relativeGap <= 0.25 ? "competitive" : "approachable";
}
function candidatePairs(spec: Spec): Pair[] {
  const sorted = [...spec.rows].sort((a, b) => a.value - b.value);
  const result: Pair[] = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const left = sorted[i]!, right = sorted[j]!;
      const gap = right.value - left.value;
      if (left.key === right.key || gap < spec.minGap - 1e-8 || gap > spec.maxGap + 1e-8) continue;
      // Never render an NBA-CDN HTTP-200 stock silhouette as a player photo.
      // The full remote photo audit found these names share an identical image.
      if (NBA_HIGHER_LOWER_UNVERIFIED_PHOTO_KEYS.has(left.key)
        || NBA_HIGHER_LOWER_UNVERIFIED_PHOTO_KEYS.has(right.key)) continue;
      // Comparing a player's career peak to someone else's decline is rarely
      // a useful basketball question. Within-season eras stay reasonably near.
      if (spec.category === "season" && left.season != null && right.season != null
        && Math.abs(left.season - right.season) > 7) continue;
      result.push({
        key: spec.key, category: spec.category, label: spec.label,
        difficulty: pairDifficulty(spec, left.value, right.value), modern: left.modern && right.modern,
        ...(spec.note ? { note: spec.note } : {}),
        left, right,
      });
    }
  }
  return result;
}
const pairsByCategoryAndDifficulty = new Map<string, Pair[]>();
for (const spec of specs) {
  for (const pair of candidatePairs(spec)) {
    const group = pair.category + ":" + pair.difficulty;
    const groupRows = pairsByCategoryAndDifficulty.get(group);
    if (groupRows) groupRows.push(pair);
    else pairsByCategoryAndDifficulty.set(group, [pair]);
  }
}
/** All unique player identities that can appear in any eligible NBA board
 * (not only the 100 sample boards used by prior tests).
 * Used for exhaustive remote photo verification, not gameplay selection.
 */
export const NBA_HIGHER_LOWER_ELIGIBLE_PHOTO_SUBJECTS: readonly Readonly<{ name: string; nbaId: number | null }>[] = (() => {
  const people = new Map<string, { name: string; nbaId: number | null }>();
  for (const pairs of pairsByCategoryAndDifficulty.values()) {
    for (const pair of pairs) {
      for (const row of [pair.left, pair.right]) {
        if (!people.has(row.key)) people.set(row.key, { name: row.name, nbaId: row.nbaId });
      }
    }
  }
  return [...people.values()].sort((a, b) => a.name.localeCompare(b.name));
})();

function formatValue(value: number, category: NbaHigherLowerCategory) {
  return category === "career" || category === "season" ? value.toFixed(1) : String(value);
}
function toQuestion(pair: Pair, direction: NbaHigherLowerChoice): NbaHigherLowerQuestion {
  const a = pair.left.value < pair.right.value ? pair.left : pair.right;
  const b = a === pair.left ? pair.right : pair.left;
  const known = direction === "higher" ? a : b;
  const hidden = direction === "higher" ? b : a;
  const subject = (row: Row): NbaHigherLowerSubject => ({
    subjectId: row.id, name: row.name, nbaId: row.nbaId, context: row.context,
    value: row.value, formattedValue: formatValue(row.value, pair.category),
    ...(row.season != null ? { season: row.season } : {}),
  });
  return {
    id: pair.key + ":" + known.id + ":" + hidden.id,
    category: pair.category, difficulty: pair.difficulty,
    metricKey: pair.key, metricLabel: pair.label, ...(pair.note ? { note: pair.note } : {}),
    known: subject(known), hidden: subject(hidden), answer: direction,
  };
}
function categoryPattern(random: () => number): NbaHigherLowerCategory[] {
  const seasonCount = random() < 0.25 ? 4 : 5;
  const awardsCount = seasonCount === 4 ? 2 : 1;
  const draftCount = random() < 0.8 ? 1 : 0;
  const careerCount = 10 - seasonCount - awardsCount - draftCount;
  return shuffleLineup<NbaHigherLowerCategory>([
    ...Array.from({ length: seasonCount }, () => "season" as const),
    ...Array.from({ length: careerCount }, () => "career" as const),
    ...Array.from({ length: awardsCount }, () => "awards" as const),
    ...Array.from({ length: draftCount }, () => "draft" as const),
  ], random);
}
// Keep occasional lesser-known early-era subjects without letting them dominate
// historical comparisons. Iconic pre-1985 anchors remain normally eligible.
const earlyEraIcons = new Set([
  "jerrywest", "kareemabduljabbar", "wiltchamberlain", "oscarrobertson",
  "magicjohnson", "larrybird", "petemaravich", "waltfrazier",
  "johnhavlicek", "billwalton", "juliuserving", "mosesmalone",
  "georgegervin", "rickbarry", "elvinhayes", "billrussell",
]);
function deepEarlyEra(row: Row) {
  return row.season != null && row.season < 1985 && !earlyEraIcons.has(row.key);
}
function buildAttempt(seed: string, attempt: number) {
  const random = seededLineupRandom(NBA_HIGHER_LOWER_VERSION, seed, attempt);
  const categories = categoryPattern(random);
  const difficulty = shuffleLineup<NbaHigherLowerDifficulty>([
    "approachable", "approachable", "approachable",
    "competitive", "competitive", "competitive", "competitive", "competitive",
    "tough", "tough",
  ], random);
  const modernSlots = shuffleLineup([true, true, true, true, true, true, true, false, false, false], random);
  const usedPeople = new Set<string>();
  const counts = new Map<string, number>();
  const questions: NbaHigherLowerQuestion[] = [];
  for (let i = 0; i < NBA_HIGHER_LOWER_QUESTION_COUNT; i++) {
    const category = categories[i]!;
    if (i > 0 && category === categories[i - 1]) return null;
    const eligible = (pairsByCategoryAndDifficulty.get(category + ":" + difficulty[i]!) ?? []).filter(pair =>
      (!modernSlots[i] || pair.modern)
      && !usedPeople.has(pair.left.key) && !usedPeople.has(pair.right.key)
      && (counts.get(pair.key) ?? 0) < 2
    );
    if (!eligible.length) return null;
    // Draw a metric before a matchup. Points/assists/rebounds have hundreds of
    // historical combinations; sampling all pairs together would almost never
    // surface threes, All-NBA, or the draft. Favor metrics not used on this board.
    const keys = [...new Set(eligible.map(pair => pair.key))];
    const fewest = Math.min(...keys.map(key => counts.get(key) ?? 0));
    const rotated = keys.filter(key => (counts.get(key) ?? 0) === fewest);
    const metricKey = rotated[Math.floor(random() * rotated.length)]!;
    const metricPairs = eligible.filter(pair => pair.key === metricKey);
    const iconicPairs = metricPairs.filter(pair => !deepEarlyEra(pair.left) && !deepEarlyEra(pair.right));
    const candidates = iconicPairs.length && random() < 0.9 ? iconicPairs : metricPairs;
    const pair = candidates[Math.floor(random() * candidates.length)]!;
    const direction: NbaHigherLowerChoice = random() < 0.5 ? "higher" : "lower";
    questions.push(toQuestion(pair, direction));
    usedPeople.add(pair.left.key);
    usedPeople.add(pair.right.key);
    counts.set(pair.key, (counts.get(pair.key) ?? 0) + 1);
  }
  if (counts.size < 6) return null;
  return questions;
}
export function createNbaHigherLowerBoard(seed: string): NbaHigherLowerBoard {
  for (let attempt = 0; attempt < 2_000; attempt++) {
    const questions = buildAttempt(seed, attempt);
    if (questions) return { version: NBA_HIGHER_LOWER_VERSION, seed, questions };
  }
  throw new Error("NBA Higher or Lower could not build a qualified board.");
}
export function parseNbaHigherLowerBoard(value: unknown): NbaHigherLowerBoard | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const board = value as Partial<NbaHigherLowerBoard>;
  if (board.version !== NBA_HIGHER_LOWER_VERSION || typeof board.seed !== "string"
    || !Array.isArray(board.questions) || board.questions.length !== 10) return null;
  const people = new Set<string>();
  for (const row of board.questions) {
    if (!row || !row.known || !row.hidden || !row.metricKey || !row.id
      || !Number.isFinite(row.known.value) || !Number.isFinite(row.hidden.value)
      || row.known.value === row.hidden.value
      || row.answer !== (row.hidden.value > row.known.value ? "higher" : "lower")) return null;
    for (const subject of [row.known, row.hidden]) {
      if (typeof subject.name !== "string" || !subject.name.trim()
        || typeof subject.context !== "string") return null;
      const key = normalizedName(subject.name);
      if (people.has(key)) return null;
      people.add(key);
    }
  }
  return board as NbaHigherLowerBoard;
}
export function nbaHigherLowerAnswerIsCorrect(question: NbaHigherLowerQuestion, answer: NbaHigherLowerChoice) {
  return question.answer === answer;
}
export function createNbaHigherLowerRun(): NbaHigherLowerRun {
  const chosen = selectReplayLineup({
    gameId: NBA_HIGHER_LOWER_GAME_ID, scopeId: "casual", lineupSize: 20, attempts: 8,
    build: (seed) => {
      const board = createNbaHigherLowerBoard(seed);
      return { value: board, itemIds: board.questions.flatMap(question => [
        "player:" + normalizedName(question.known.name), "player:" + normalizedName(question.hidden.name),
      ]) };
    },
  });
  return { board: chosen.value, identity: chosen.identity };
}
export function createNbaHigherLowerDailyPreview(day: string): NbaHigherLowerRun {
  const identity = dailyLineupIdentity(NBA_HIGHER_LOWER_GAME_ID, day, "owner-preview");
  return { identity, board: createNbaHigherLowerBoard(dailyLineupSeed(day)) };
}
export { recordLineupCompletion };
