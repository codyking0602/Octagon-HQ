import { averageFanQuestionBoardTopics } from "../games/averageFanContentBanks";
import { AVERAGE_FAN_PLAYABLE_GRADES, type AverageFanQuestion } from "../games/averageFanEngine";
import { nbaAverageFanQuestionBank } from "../games/nbaAverageFanBank";
import { stableLineupHash } from "./lineupModel";
import type { AverageFanCasualBoard } from "./averageFanCasualBoard";

/**
 * NBA owner-preview question rotation only. Stores question IDs, never guesses, scores,
 * a member's answers, or an official Daily attempt. Other sports are unaffected.
 * 40 eligible questions per grade (two per game) plus 20 Finals means 20 distinct
 * complete rounds can be dealt before recycling any question.
 */
export const NBA_AVERAGE_FAN_ROTATION_KEY = "octagon-hq:nba-average-fan-rotation-v1";
type Bucket = "2" | "3" | "4" | "5" | "final";
export const NBA_AVERAGE_FAN_BUCKETS: readonly Bucket[] = ["2", "3", "4", "5", "final"];
type Snapshot = { questionIds: string[]; finalId: string };
export type NbaAverageFanRotation = {
  version: 1;
  used: Record<Bucket, string[]>;
  daily: Record<string, Snapshot>;
};
export function emptyNbaAverageFanRotation(): NbaAverageFanRotation {
  return {
    version: 1,
    used: { "2": [], "3": [], "4": [], "5": [], final: [] },
    daily: {},
  };
}
function copyHistory(history: NbaAverageFanRotation): NbaAverageFanRotation {
  return {
    version: 1,
    used: Object.fromEntries(NBA_AVERAGE_FAN_BUCKETS.map((bucket) =>
      [bucket, [...(history.used?.[bucket] ?? [])]])) as Record<Bucket, string[]>,
    daily: { ...history.daily },
  };
}
function rank(questions: readonly AverageFanQuestion[], seed: string) {
  return [...questions].sort((a, b) =>
    stableLineupHash(`nba-average-fan-rotation-v1|${seed}|${a.id}`) -
      stableLineupHash(`nba-average-fan-rotation-v1|${seed}|${b.id}`)
      || a.id.localeCompare(b.id));
}
function commonTopics(a: readonly string[], b: ReadonlySet<string>): number {
  return a.filter((topic) => b.has(topic)).length;
}
function hydrate(snapshot: Snapshot, bank: readonly AverageFanQuestion[]): AverageFanCasualBoard | null {
  const map = new Map(bank.map((q) => [q.id, q]));
  const questions = snapshot.questionIds.map((id) => map.get(id));
  const finalQuestion = map.get(snapshot.finalId);
  if (questions.length !== 8 || questions.some((q) => !q) || !finalQuestion?.protectedFinal) return null;
  if (new Set(snapshot.questionIds).size !== 8) return null;
  if (AVERAGE_FAN_PLAYABLE_GRADES.some((grade) => questions.filter((q) => q?.grade === grade).length !== 2)) return null;
  return { sport: "nba", questions: questions as AverageFanQuestion[], finalQuestion };
}

export function allocateNbaAverageFanRound(
  history: NbaAverageFanRotation,
  seed: string,
  options: { day?: string; bank?: readonly AverageFanQuestion[] } = {},
): { board: AverageFanCasualBoard; history: NbaAverageFanRotation; reusedDaily: boolean } {
  const bank = options.bank ?? nbaAverageFanQuestionBank;
  const next = copyHistory(history);
  if (options.day && next.daily[options.day]) {
    const prior = hydrate(next.daily[options.day], bank);
    if (prior) return { board: prior, history: next, reusedDaily: true };
  }
  const buckets = {} as Record<Bucket, AverageFanQuestion[]>;
  for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
    const bucket = String(grade) as Bucket;
    const pool = bank.filter((q) => q.grade === grade && !q.protectedFinal && q.contentType === "evergreen");
    if (pool.length < 40) throw new Error(`NBA Average Fan requires 40 curated Grade ${grade} questions.`);
    const eligible = pool.filter((q) => !next.used[bucket].includes(q.id));
    if (eligible.length < 2) {
      next.used[bucket] = [];
      buckets[bucket] = pool;
    } else buckets[bucket] = eligible;
  }
  const finalPool = bank.filter((q) => q.protectedFinal && q.contentType === "evergreen");
  if (finalPool.length < 20) throw new Error("NBA Average Fan requires 20 curated Finals.");
  let availableFinals = finalPool.filter((q) => !next.used.final.includes(q.id));
  if (!availableFinals.length) {
    next.used.final = [];
    availableFinals = finalPool;
  }

  type Candidate = { board: AverageFanCasualBoard; penalty: number };
  let best: Candidate | null = null;
  for (const finalQuestion of rank(availableFinals, `${seed}|final`)) {
    const selected: AverageFanQuestion[] = [];
    const usedTopics = new Set(averageFanQuestionBoardTopics(finalQuestion));
    const subjectCounts = new Map<string, number>();
    let penalty = 0;
    for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
      const bucket = String(grade) as Bucket;
      for (let slot = 0; slot < 2; slot++) {
        const ordered = rank(buckets[bucket].filter((q) => !selected.includes(q)), `${seed}|grade-${grade}|slot-${slot}`);
        ordered.sort((a, b) => {
          const topicDelta = commonTopics(averageFanQuestionBoardTopics(a), usedTopics) -
            commonTopics(averageFanQuestionBoardTopics(b), usedTopics);
          if (topicDelta) return topicDelta;
          const subjectDelta = (subjectCounts.get(a.subject) ?? 0) - (subjectCounts.get(b.subject) ?? 0);
          if (subjectDelta) return subjectDelta;
          return 0;
        });
        const q = ordered[0];
        if (!q) throw new Error(`NBA Average Fan grade ${grade} is missing its curated pair.`);
        penalty += commonTopics(averageFanQuestionBoardTopics(q), usedTopics);
        selected.push(q);
        subjectCounts.set(q.subject, (subjectCounts.get(q.subject) ?? 0) + 1);
        for (const topic of averageFanQuestionBoardTopics(q)) usedTopics.add(topic);
      }
    }
    if (!best || penalty < best.penalty) best = { board: { sport: "nba", questions: selected, finalQuestion }, penalty };
    if (penalty === 0) break;
  }
  if (!best) throw new Error("NBA Average Fan has no unused protected Final.");
  for (const q of best.board.questions) next.used[String(q.grade) as Bucket].push(q.id);
  next.used.final.push(best.board.finalQuestion.id);
  if (options.day) {
    next.daily[options.day] = {
      questionIds: best.board.questions.map((q) => q.id),
      finalId: best.board.finalQuestion.id,
    };
    // Keep dates in the local rotation only; this does not store play results.
    const days = Object.keys(next.daily).sort();
    for (const old of days.slice(0, Math.max(0, days.length - 40))) delete next.daily[old];
  }
  return { board: best.board, history: next, reusedDaily: false };
}

let inMemoryFallback = emptyNbaAverageFanRotation();
function readHistory(): NbaAverageFanRotation {
  try {
    const raw = window.localStorage.getItem(NBA_AVERAGE_FAN_ROTATION_KEY);
    if (!raw) return inMemoryFallback;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null ||
        (value as NbaAverageFanRotation).version !== 1 ||
        !(value as NbaAverageFanRotation).used) return emptyNbaAverageFanRotation();
    const parsed = value as NbaAverageFanRotation;
    for (const bucket of NBA_AVERAGE_FAN_BUCKETS) {
      if (!Array.isArray(parsed.used[bucket]) ||
        parsed.used[bucket].some((id) => typeof id !== "string")) return emptyNbaAverageFanRotation();
    }
    return { ...parsed, daily: parsed.daily && typeof parsed.daily === "object" ? parsed.daily : {} };
  } catch { return inMemoryFallback; }
}
function saveHistory(value: NbaAverageFanRotation) {
  inMemoryFallback = value;
  try { window.localStorage.setItem(NBA_AVERAGE_FAN_ROTATION_KEY, JSON.stringify(value)); }
  catch { /* Private-mode storage might be unavailable. This session still rotates. */ }
}
export function nextNbaAverageFanOwnerBoard(seed: string, day?: string): AverageFanCasualBoard {
  const result = allocateNbaAverageFanRound(readHistory(), seed, { day });
  if (!result.reusedDaily) saveHistory(result.history);
  return result.board;
}
