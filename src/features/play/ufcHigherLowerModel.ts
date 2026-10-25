import { ufcFactualLedgerSubjects } from "../back-room/ufcFactualLedger";
import { seededLineupRandom, shuffleLineup } from "./lineupModel";

/**
 * Every comparison is derived solely from official UFC bouts in the pinned factual
 * ledger. NEVER substitute total professional MMA records for UFC-only records.
 * The 2026-08-18 cutoff matches the expansion's pinned UFCStats snapshot.
 */
export const UFC_HIGHER_LOWER_VERSION = "ufc-higher-lower-v1" as const;
export const UFC_HIGHER_LOWER_QUESTION_COUNT = 10;
export const UFC_HIGHER_LOWER_SNAPSHOT = "2026-08-18";
export const UFC_HIGHER_LOWER_FIRST_SLOT = "2026-11-02";
export const UFC_HIGHER_LOWER_RESERVED_SLOTS = 200; // 100 opposite-NBA dates, two boards each

export type UfcHigherLowerChoice = "higher" | "lower";
export type UfcHigherLowerDifficulty = "approachable" | "competitive" | "tough";
export type UfcHigherLowerMetric = "bouts" | "wins" | "finishes" | "ko" | "submissions" | "title_wins";
export type UfcHigherLowerCategory = "career" | "finishes" | "championship";
export interface UfcHigherLowerSubject {
  subjectId: string;
  name: string;
  context: string;
  photoSrc: string;
  value: number;
  formattedValue: string;
}
export interface UfcHigherLowerQuestion {
  id: string;
  category: UfcHigherLowerCategory;
  difficulty: UfcHigherLowerDifficulty;
  metricKey: UfcHigherLowerMetric;
  metricLabel: string;
  note: string;
  known: UfcHigherLowerSubject;
  hidden: UfcHigherLowerSubject;
  answer: UfcHigherLowerChoice;
}
export interface UfcHigherLowerBoard {
  version: typeof UFC_HIGHER_LOWER_VERSION;
  seed: string;
  questions: UfcHigherLowerQuestion[];
}

type Totals = Record<UfcHigherLowerMetric, number>;
interface Fighter {
  id: string;
  name: string;
  slug: string;
  gender: string;
  context: string;
  lastYear: number;
  totals: Totals;
}
interface Candidate {
  first: Fighter;
  second: Fighter;
  key: string;
}
type Slot = Readonly<{ metric: UfcHigherLowerMetric; difficulty: UfcHigherLowerDifficulty; minGap: number; maxGap: number }>;

const METRICS: Record<UfcHigherLowerMetric, { label: string; category: UfcHigherLowerCategory; minimum: number }> = {
  bouts: { label: "UFC bouts", category: "career", minimum: 8 },
  wins: { label: "UFC victories", category: "career", minimum: 4 },
  finishes: { label: "UFC finish victories", category: "finishes", minimum: 3 },
  ko: { label: "UFC KO/TKO victories", category: "finishes", minimum: 2 },
  submissions: { label: "UFC submission victories", category: "finishes", minimum: 1 },
  title_wins: { label: "UFC title-fight victories", category: "championship", minimum: 1 },
};
/** Fixed per-board mix: 3 approachable, 5 competitive, 2 tough; six real metrics. */
const SLOTS: readonly Slot[] = [
  { metric: "bouts", difficulty: "approachable", minGap: 7, maxGap: 12 },
  { metric: "wins", difficulty: "approachable", minGap: 6, maxGap: 11 },
  { metric: "ko", difficulty: "approachable", minGap: 4, maxGap: 6 },
  { metric: "title_wins", difficulty: "competitive", minGap: 1, maxGap: 3 },
  { metric: "submissions", difficulty: "competitive", minGap: 1, maxGap: 3 },
  { metric: "wins", difficulty: "competitive", minGap: 3, maxGap: 5 },
  { metric: "finishes", difficulty: "competitive", minGap: 3, maxGap: 4 },
  { metric: "bouts", difficulty: "competitive", minGap: 3, maxGap: 6 },
  { metric: "ko", difficulty: "tough", minGap: 1, maxGap: 1 },
  { metric: "finishes", difficulty: "tough", minGap: 1, maxGap: 2 },
];

export const UFC_HIGHER_LOWER_METRIC_LABELS = Object.fromEntries(
  Object.entries(METRICS).map(([key, spec]) => [key, spec.label]),
) as Record<UfcHigherLowerMetric, string>;

// The pinned UFC fighter portrait manifest does not yet include these expansion
// subjects. Exclude them from this photo-first game rather than showing repeated
// fallback initials on official boards; the factual ledger remains untouched.
const MISSING_PORTRAIT_EXPANSION = new Set([
  "Diego Lopes", "Jiří Procházka", "Jamahal Hill", "Carlos Ulberg",
  "Arman Tsarukyan", "Jack Della Maddalena", "Shavkat Rakhmonov",
  "Rich Franklin", "Luke Rockhold", "Michael Morales",
  "Carlos Prates", "Tim Kennedy",
]);
function fighterFacts(): Fighter[] {
  return ufcFactualLedgerSubjects.filter(subject => !MISSING_PORTRAIT_EXPANSION.has(subject.name)).map(subject => {
    const fights = subject.fights.filter(fight => fight.date <= UFC_HIGHER_LOWER_SNAPSHOT);
    const wins = fights.filter(fight => fight.result === "win");
    const lastYear = Number((fights.at(-1)?.date ?? subject.activeFrom).slice(0, 4));
    return {
      id: subject.id, name: subject.name, slug: subject.slug,
      gender: subject.gender, lastYear,
      context: subject.primaryDivision,
      totals: {
        bouts: fights.length,
        wins: wins.length,
        finishes: wins.filter(fight => fight.methodCategory === "ko-tko" || fight.methodCategory === "submission").length,
        ko: wins.filter(fight => fight.methodCategory === "ko-tko").length,
        submissions: wins.filter(fight => fight.methodCategory === "submission").length,
        title_wins: wins.filter(fight => fight.titleFight && fight.championshipEligible !== false
          && !/ultimate fighter|tournament/i.test(fight.division)).length,
      },
    };
  }).filter(fighter => fighter.totals.bouts >= 8 && fighter.totals.wins >= 4)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Frozen candidate pool: same sex, comparable UFC careers, no 14-year era leaps. */
export const UFC_HIGHER_LOWER_FIGHTERS = fighterFacts();
const pool = new Map<string, Candidate[]>();
function slotId(slot: Slot) {
  return [slot.metric, slot.difficulty, slot.minGap, slot.maxGap].join(":");
}
for (const slot of SLOTS) {
  const candidates: Candidate[] = [];
  for (let a = 0; a < UFC_HIGHER_LOWER_FIGHTERS.length; a++) {
    const first = UFC_HIGHER_LOWER_FIGHTERS[a]!;
    if (first.totals[slot.metric] < METRICS[slot.metric].minimum) continue;
    for (let b = a + 1; b < UFC_HIGHER_LOWER_FIGHTERS.length; b++) {
      const second = UFC_HIGHER_LOWER_FIGHTERS[b]!;
      if (first.gender !== second.gender || Math.abs(first.lastYear - second.lastYear) > 13) continue;
      if (second.totals[slot.metric] < METRICS[slot.metric].minimum) continue;
      const gap = Math.abs(first.totals[slot.metric] - second.totals[slot.metric]);
      if (gap < slot.minGap || gap > slot.maxGap) continue;
      candidates.push({ first, second, key: [first.id, second.id].join("|") });
    }
  }
  pool.set(slotId(slot), candidates);
}

export function ufcHigherLowerCandidateCounts() {
  return SLOTS.map(slot => ({
    metric: slot.metric, difficulty: slot.difficulty,
    count: (pool.get(slotId(slot)) ?? []).length,
  }));
}

function question(pair: Candidate, slot: Slot, choice: UfcHigherLowerChoice): UfcHigherLowerQuestion {
  const higher = pair.first.totals[slot.metric] > pair.second.totals[slot.metric] ? pair.first : pair.second;
  const lower = higher === pair.first ? pair.second : pair.first;
  const known = choice === "higher" ? lower : higher;
  const hidden = choice === "higher" ? higher : lower;
  const subject = (fighter: Fighter): UfcHigherLowerSubject => ({
    subjectId: fighter.id, name: fighter.name, context: fighter.context,
    photoSrc: "/assets/fighters/" + fighter.slug + "-thumb.webp",
    value: fighter.totals[slot.metric],
    formattedValue: fighter.totals[slot.metric].toLocaleString("en-US"),
  });
  return {
    // Private ID is deliberately NOT public: answer direction is in the ID.
    id: [UFC_HIGHER_LOWER_VERSION, slot.metric, known.id, hidden.id, choice].join(":"),
    metricKey: slot.metric, category: METRICS[slot.metric].category,
    metricLabel: METRICS[slot.metric].label,
    difficulty: slot.difficulty,
    note: "UFC bouts only · official results through Aug 18, 2026",
    known: subject(known), hidden: subject(hidden), answer: choice,
  };
}

function makeBoard(
  seed: string,
  usedPairs: Set<string>,
  appearanceCount: Map<string, number>,
  metricCount: Map<string, number>,
): UfcHigherLowerBoard {
  const random = seededLineupRandom(UFC_HIGHER_LOWER_VERSION, seed);
  const usedToday = new Set<string>();
  const questions: UfcHigherLowerQuestion[] = [];
  for (const slot of SLOTS) {
    const candidates = pool.get(slotId(slot)) ?? [];
    const available = candidates.filter(pair => !usedPairs.has(pair.key)
      && !usedToday.has(pair.first.id) && !usedToday.has(pair.second.id));
    if (!available.length) {
      throw new Error("UFC Higher or Lower content exhausted at " + seed + " · " + slotId(slot));
    }
    // Prefer underused fighters and metric diversity rather than sampling the
    // huge pool uniformly (which would repeatedly surface a few prolific stars).
    let best = Number.POSITIVE_INFINITY;
    const finalists: Candidate[] = [];
    for (const candidate of available) {
      const score = (appearanceCount.get(candidate.first.id) ?? 0)
        + (appearanceCount.get(candidate.second.id) ?? 0)
        + 1.4 * (metricCount.get(slot.metric + ":" + candidate.first.id) ?? 0)
        + 1.4 * (metricCount.get(slot.metric + ":" + candidate.second.id) ?? 0);
      if (score < best) { best = score; finalists.length = 0; finalists.push(candidate); }
      else if (score === best) finalists.push(candidate);
    }
    const pair = finalists[Math.floor(random() * finalists.length)]!;
    usedPairs.add(pair.key);
    usedToday.add(pair.first.id);
    usedToday.add(pair.second.id);
    for (const fighter of [pair.first, pair.second]) {
      appearanceCount.set(fighter.id, (appearanceCount.get(fighter.id) ?? 0) + 1);
      const key = slot.metric + ":" + fighter.id;
      metricCount.set(key, (metricCount.get(key) ?? 0) + 1);
    }
    questions.push(question(pair, slot, random() < 0.5 ? "higher" : "lower"));
  }
  // Start approachable and build to two properly tight calls; shuffle only
  // inside each difficulty band to avoid a repeating metric sequence.
  const ordered = [
    ...shuffleLineup(questions.slice(0, 3), random),
    ...shuffleLineup(questions.slice(3, 8), random),
    ...shuffleLineup(questions.slice(8), random),
  ];
  return { version: UFC_HIGHER_LOWER_VERSION, seed, questions: ordered };
}

let reserved: readonly UfcHigherLowerBoard[] | null = null;
function reservedBoards(): readonly UfcHigherLowerBoard[] {
  if (reserved) return reserved;
  const used = new Set<string>();
  const appearances = new Map<string, number>();
  const metricCounts = new Map<string, number>();
  const boards: UfcHigherLowerBoard[] = [];
  for (let index = 0; index < UFC_HIGHER_LOWER_RESERVED_SLOTS; index++) {
    boards.push(makeBoard("official-slot-" + index, used, appearances, metricCounts));
  }
  reserved = boards;
  return reserved;
}

function utcDay(day: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Use a canonical ISO Daily date.");
  const stamp = Date.parse(day + "T00:00:00Z");
  if (!Number.isFinite(stamp) || new Date(stamp).toISOString().slice(0, 10) !== day) {
    throw new Error("Invalid UFC Higher or Lower Daily date.");
  }
  return Math.round(stamp / 86_400_000);
}
/**
 * Date-addressed slots remain stable when future weighted rotation changes.
 * Do NOT activate/modify the calendar here. These boards can be sampled by
 * any subset of UFC's opposite-NBA 48-hour dates with zero pair collisions.
 */
export function createUfcHigherLowerOfficialBoard(day: string, gameIndex = 0): UfcHigherLowerBoard {
  const offset = utcDay(day) - utcDay(UFC_HIGHER_LOWER_FIRST_SLOT);
  if (!Number.isInteger(gameIndex) || gameIndex < 0 || gameIndex > 1
    || offset < 0 || offset % 2 !== 0 || (offset / 2) * 2 + gameIndex >= UFC_HIGHER_LOWER_RESERVED_SLOTS) {
    throw new Error("UFC Higher or Lower Daily is outside the reserved two-game content horizon.");
  }
  return reservedBoards()[(offset / 2) * 2 + gameIndex]!;
}

/** Casual is fully replayable, separately seeded, and never consumes official content. */
export function createUfcHigherLowerBoard(seed: string): UfcHigherLowerBoard {
  return makeBoard(seed, new Set(), new Map(), new Map());
}
export function parseUfcHigherLowerBoard(raw: unknown): UfcHigherLowerBoard | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const board = raw as Partial<UfcHigherLowerBoard>;
  if (board.version !== UFC_HIGHER_LOWER_VERSION || typeof board.seed !== "string"
    || !Array.isArray(board.questions) || board.questions.length !== UFC_HIGHER_LOWER_QUESTION_COUNT) return null;
  if (!board.questions.every(q => q && typeof q.id === "string"
    && (q.answer === "higher" || q.answer === "lower")
    && typeof q.known?.value === "number" && typeof q.hidden?.value === "number"
    && q.known.value !== q.hidden.value)) return null;
  return board as UfcHigherLowerBoard;
}
