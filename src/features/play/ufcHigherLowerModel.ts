import { ufcFactualLedgerSubjects, ufcFactualExpansion, type UfcFactualSubject } from "../back-room/ufcFactualLedger";
import { seededLineupRandom, shuffleLineup } from "./lineupModel";

export const UFC_HIGHER_LOWER_VERSION = "ufc-higher-lower-v1" as const;
export const UFC_HIGHER_LOWER_GAME_ID = "ufc-higher-lower";
export const UFC_HIGHER_LOWER_COUNT = 10;
export const UFC_HIGHER_LOWER_DAILY_EPOCH = "2026-11-02";
export const UFC_HIGHER_LOWER_DAILY_APPEARANCES = 92; // Every other day for 184 days.
export const UFC_HIGHER_LOWER_SNAPSHOT = ufcFactualExpansion.provenance.core.refreshedAt;
export type UfcHigherLowerChoice = "higher" | "lower";
export type UfcHigherLowerDifficulty = "approachable" | "competitive" | "tough";
export type UfcHigherLowerMetric = "wins" | "finishes" | "knockouts" | "submissions"
  | "decisions" | "title-wins" | "title-bouts" | "bouts";

export interface UfcHigherLowerSubject {
  subjectId: string;
  name: string;
  slug: string;
  context: string;
  photoUrl: string;
  value: number;
  formattedValue: string;
}
export interface UfcHigherLowerQuestion {
  id: string;
  metricKey: UfcHigherLowerMetric;
  metricLabel: string;
  scopeLabel: string;
  difficulty: UfcHigherLowerDifficulty;
  known: UfcHigherLowerSubject;
  hidden: UfcHigherLowerSubject;
  answer: UfcHigherLowerChoice;
}
export interface UfcHigherLowerBoard {
  version: typeof UFC_HIGHER_LOWER_VERSION;
  seed: string;
  questions: UfcHigherLowerQuestion[];
}
type MetricCount = Record<UfcHigherLowerMetric, number>;
interface FighterRow {
  subject: UfcFactualSubject;
  counts: MetricCount;
  midyear: number;
  modern: boolean;
  historic: boolean;
}
interface Pair {
  key: string;
  metricKey: UfcHigherLowerMetric;
  difficulty: UfcHigherLowerDifficulty;
  a: FighterRow;
  b: FighterRow;
}

export const UFC_HIGHER_LOWER_METRICS: Readonly<Record<UfcHigherLowerMetric, {
  label: string; minimum: number; category: string;
}>> = {
  wins: { label: "UFC wins", minimum: 5, category: "Career" },
  finishes: { label: "UFC finish victories", minimum: 3, category: "Finishing" },
  knockouts: { label: "UFC KO/TKO victories", minimum: 2, category: "Striking" },
  submissions: { label: "UFC submission victories", minimum: 2, category: "Grappling" },
  decisions: { label: "UFC decision victories", minimum: 3, category: "Career" },
  "title-wins": { label: "UFC title-fight victories", minimum: 1, category: "Championships" },
  "title-bouts": { label: "UFC title-fight appearances", minimum: 2, category: "Championships" },
  bouts: { label: "UFC bouts contested", minimum: 8, category: "Career" },
};
export const UFC_HIGHER_LOWER_METRIC_KEYS = Object.keys(UFC_HIGHER_LOWER_METRICS) as UfcHigherLowerMetric[];
const metricRows = ((): FighterRow[] => ufcFactualLedgerSubjects.map(subject => {
  // This is the pinned UFCStats fight-level source, NOT total MMA career statistics.
  // Do not extrapolate fights after the source snapshot or mix in non-UFC records.
  const fights = subject.fights.filter(fight => fight.date <= UFC_HIGHER_LOWER_SNAPSHOT);
  const wins = fights.filter(fight => fight.result === "win");
  const isUfcTitleFight = (fight: (typeof fights)[number]) =>
    fight.titleFight && fight.championshipEligible !== false
    && !/ultimate fighter|tournament/i.test(fight.division);
  const counts: MetricCount = {
    wins: wins.length,
    finishes: wins.filter(fight => fight.methodCategory === "ko-tko" || fight.methodCategory === "submission").length,
    knockouts: wins.filter(fight => fight.methodCategory === "ko-tko").length,
    submissions: wins.filter(fight => fight.methodCategory === "submission").length,
    decisions: wins.filter(fight => fight.methodCategory === "decision").length,
    "title-wins": wins.filter(isUfcTitleFight).length,
    "title-bouts": fights.filter(isUfcTitleFight).length,
    bouts: fights.length,
  };
  const earliest = fights[0]?.date ?? subject.activeFrom;
  const latest = fights.at(-1)?.date ?? subject.activeTo;
  const midyear = (Number(earliest.slice(0, 4)) + Number(latest.slice(0, 4))) / 2;
  return { subject, counts, midyear, modern: Number(latest.slice(0, 4)) >= 2018,
    historic: Number(earliest.slice(0, 4)) <= 2008 && Number(latest.slice(0, 4)) <= 2017 };
}))();

const pairPools: Record<UfcHigherLowerDifficulty, Pair[]> = {
  approachable: [], competitive: [], tough: [],
};
function difficultyFor(a: number, b: number): UfcHigherLowerDifficulty | null {
  if (a === b) return null;
  const gap = Math.abs(a - b) / Math.max(a, b, 1);
  if (gap < 0.08 || gap > 0.78) return null;
  return gap <= 0.19 ? "tough" : gap <= 0.43 ? "competitive" : "approachable";
}
for (const metricKey of UFC_HIGHER_LOWER_METRIC_KEYS) {
  const minimum = UFC_HIGHER_LOWER_METRICS[metricKey].minimum;
  for (let i = 0; i < metricRows.length; i++) {
    const a = metricRows[i]!;
    if (a.counts[metricKey] < minimum) continue;
    for (let j = i + 1; j < metricRows.length; j++) {
      const b = metricRows[j]!;
      if (b.counts[metricKey] < minimum || a.subject.gender !== b.subject.gender) continue;
      // Prevent generationally unfair opportunity comparisons without excluding legends.
      if (Math.abs(a.midyear - b.midyear) > 12) continue;
      const difficulty = difficultyFor(a.counts[metricKey], b.counts[metricKey]);
      if (!difficulty) continue;
      pairPools[difficulty].push({
        key: [a.subject.id, b.subject.id].sort().join("|"),
        metricKey, difficulty, a, b,
      });
    }
  }
}

function subject(row: FighterRow, metricKey: UfcHigherLowerMetric): UfcHigherLowerSubject {
  const value = row.counts[metricKey];
  return {
    subjectId: row.subject.id, name: row.subject.name, slug: row.subject.slug,
    context: row.subject.primaryDivision, photoUrl: "/assets/fighters/" + row.subject.slug + "-thumb.webp",
    value, formattedValue: value.toLocaleString("en-US"),
  };
}
function questionFor(pair: Pair, choice: UfcHigherLowerChoice): UfcHigherLowerQuestion {
  const low = pair.a.counts[pair.metricKey] < pair.b.counts[pair.metricKey] ? pair.a : pair.b;
  const high = low === pair.a ? pair.b : pair.a;
  const known = choice === "higher" ? low : high;
  const hidden = choice === "higher" ? high : low;
  return {
    id: pair.metricKey + ":" + known.subject.id + ":" + hidden.subject.id + ":" + choice,
    metricKey: pair.metricKey,
    metricLabel: UFC_HIGHER_LOWER_METRICS[pair.metricKey].label,
    scopeLabel: "UFC ONLY · through " + UFC_HIGHER_LOWER_SNAPSHOT,
    difficulty: pair.difficulty, known: subject(known, pair.metricKey),
    hidden: subject(hidden, pair.metricKey), answer: choice,
  };
}
const difficultySlots: readonly UfcHigherLowerDifficulty[] = [
  "approachable", "approachable", "approachable",
  "competitive", "competitive", "competitive", "competitive", "competitive",
  "tough", "tough",
];
interface SelectionHistory {
  pairs: Set<string>;
  subjects: Map<string, number>;
  metrics: Map<UfcHigherLowerMetric, number>;
}
function makeBoard(seed: string, history: SelectionHistory): UfcHigherLowerBoard {
  const rand = seededLineupRandom(UFC_HIGHER_LOWER_VERSION, seed);
  const usedSubjects = new Set<string>();
  const metricsHere = new Map<UfcHigherLowerMetric, number>();
  const chosen: Pair[] = [];
  // A fixed five/five answer mix prevents streaks of one button being correct.
  const choices = shuffleLineup<UfcHigherLowerChoice>(
    ["higher", "higher", "higher", "higher", "higher", "lower", "lower", "lower", "lower", "lower"], rand,
  );
  const bias = Math.floor(rand() * 1_000_000);
  for (const [index, difficulty] of difficultySlots.entries()) {
    const pool = pairPools[difficulty];
    const start = (bias + index * 479) % pool.length;
    let best: Pair | null = null;
    let bestScore = Infinity;
    for (let k = 0; k < pool.length; k++) {
      const pair = pool[(start + k) % pool.length]!;
      if (history.pairs.has(pair.key)
        || usedSubjects.has(pair.a.subject.id) || usedSubjects.has(pair.b.subject.id)
        || (metricsHere.get(pair.metricKey) ?? 0) >= 2) continue;
      const novel = metricsHere.has(pair.metricKey) ? 1 : 0;
      // Equal representation of sourced fighters and metric concepts matters more
      // than simply sampling the largest career-wins bucket.
      const score = 4 * ((history.subjects.get(pair.a.subject.id) ?? 0)
        + (history.subjects.get(pair.b.subject.id) ?? 0))
        + 2 * (history.metrics.get(pair.metricKey) ?? 0)
        + 8 * (metricsHere.get(pair.metricKey) ?? 0)
        + 4 * novel
        - ((index === 0 && chosen.length === 0 && pair.a.historic && pair.b.historic) ? 1 : 0);
      if (score < bestScore || (score === bestScore && rand() < 0.5)) {
        bestScore = score;
        best = pair;
      }
    }
    if (!best) throw new Error("UFC Higher or Lower could not build a credible " + difficulty + " comparison at slot " + (index + 1) + ".");
    chosen.push(best);
    usedSubjects.add(best.a.subject.id);
    usedSubjects.add(best.b.subject.id);
    metricsHere.set(best.metricKey, (metricsHere.get(best.metricKey) ?? 0) + 1);
  }
  for (const pair of chosen) {
    history.pairs.add(pair.key);
    for (const row of [pair.a, pair.b]) {
      history.subjects.set(row.subject.id, (history.subjects.get(row.subject.id) ?? 0) + 1);
    }
    history.metrics.set(pair.metricKey, (history.metrics.get(pair.metricKey) ?? 0) + 1);
  }
  return {
    version: UFC_HIGHER_LOWER_VERSION, seed,
    questions: chosen.map((pair, index) => questionFor(pair, choices[index]!)),
  };
}
function freshHistory(): SelectionHistory {
  return { pairs: new Set(), subjects: new Map(), metrics: new Map() };
}
/** Casual is replayable, with one consistent factual source but independent boards. */
export function createUfcHigherLowerBoard(seed: string): UfcHigherLowerBoard {
  return makeBoard(seed, freshHistory());
}

let officialScheduleCache: readonly UfcHigherLowerBoard[] | null = null;
/** Fixed, source-frozen future library. Never mutates published calendar entries. */
export function ufcHigherLowerSixMonthBoards(): readonly UfcHigherLowerBoard[] {
  if (!officialScheduleCache) {
    const history = freshHistory();
    officialScheduleCache = Array.from({ length: UFC_HIGHER_LOWER_DAILY_APPEARANCES },
      (_, index) => makeBoard("official:" + index, history));
  }
  return officialScheduleCache;
}
export function ufcHigherLowerDailyBoard(day: string): UfcHigherLowerBoard {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("UFC Higher or Lower requires a Daily date.");
  const date = Date.parse(day + "T00:00:00Z");
  const start = Date.parse(UFC_HIGHER_LOWER_DAILY_EPOCH + "T00:00:00Z");
  const offset = (date - start) / 86_400_000;
  if (!Number.isInteger(offset) || offset < 0 || offset % 2 !== 0 || offset / 2 >= UFC_HIGHER_LOWER_DAILY_APPEARANCES) {
    throw new Error("UFC Higher or Lower date is outside the reviewed every-other-day six-month window.");
  }
  return ufcHigherLowerSixMonthBoards()[offset / 2]!;
}
export function parseUfcHigherLowerBoard(value: unknown): UfcHigherLowerBoard | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const board = value as Partial<UfcHigherLowerBoard>;
  if (board.version !== UFC_HIGHER_LOWER_VERSION || typeof board.seed !== "string"
    || !Array.isArray(board.questions) || board.questions.length !== UFC_HIGHER_LOWER_COUNT) return null;
  for (const question of board.questions) {
    if (!question || typeof question.id !== "string" || !UFC_HIGHER_LOWER_METRIC_KEYS.includes(question.metricKey)
      || (question.answer !== "higher" && question.answer !== "lower")
      || typeof question.known?.value !== "number" || typeof question.hidden?.value !== "number"
      || question.known.value === question.hidden.value
      || question.answer !== (question.hidden.value > question.known.value ? "higher" : "lower")) return null;
  }
  return board as UfcHigherLowerBoard;
}
export function ufcHigherLowerAuditedInventory() {
  const pairs = new Set<string>();
  const subjects = new Set<string>();
  const metrics = new Map<string, number>();
  const difficulty = new Map<string, number>();
  const appearances = new Map<string, number>();
  let repeatedPairs = 0;
  for (const board of ufcHigherLowerSixMonthBoards()) {
    for (const question of board.questions) {
      const pairKey = [question.known.subjectId, question.hidden.subjectId].sort().join("|");
      if (pairs.has(pairKey)) repeatedPairs++;
      pairs.add(pairKey);
      subjects.add(question.known.subjectId);
      subjects.add(question.hidden.subjectId);
      metrics.set(question.metricKey, (metrics.get(question.metricKey) ?? 0) + 1);
      difficulty.set(question.difficulty, (difficulty.get(question.difficulty) ?? 0) + 1);
      for (const subjectId of [question.known.subjectId, question.hidden.subjectId]) {
        appearances.set(subjectId, (appearances.get(subjectId) ?? 0) + 1);
      }
    }
  }
  return {
    fighterPool: metricRows.length,
    candidateComparisons: Object.values(pairPools).reduce((sum, pool) => sum + pool.length, 0),
    boards: UFC_HIGHER_LOWER_DAILY_APPEARANCES, questions: UFC_HIGHER_LOWER_DAILY_APPEARANCES * UFC_HIGHER_LOWER_COUNT,
    distinctMatchups: pairs.size, distinctFighters: subjects.size, repeatedMatchups: repeatedPairs,
    metricDistribution: Object.fromEntries(metrics),
    difficultyDistribution: Object.fromEntries(difficulty),
    minFighterAppearances: Math.min(...appearances.values()),
    maxFighterAppearances: Math.max(...appearances.values()),
  };
}
