import { describe, expect, it } from "vitest";
import { ufcFactualLedgerSubjects, type UfcFactualSubject } from "../back-room/ufcFactualLedger";

type Predicate = { id: string; answer: (subject: UfcFactualSubject) => boolean };
type LiveRow = { id: string; values: readonly boolean[] };
type Strategy = "best" | "good" | "messy";
const CHECKPOINTS = [8, 10, 11, 12] as const;

const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
const stableHash = (value: string) => {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
function rng(seed: number) {
  let state = seed >>> 0 || 0x9e3779b9;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
function percentile(values: readonly number[], p: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1))]!;
}
function canonicalPartition(values: readonly boolean[]) {
  const direct = values.map((value) => value ? "1" : "0").join("");
  const inverse = values.map((value) => value ? "0" : "1").join("");
  return direct < inverse ? direct : inverse;
}

function buildPredicates(pool: readonly UfcFactualSubject[]): Predicate[] {
  const rows: Predicate[] = [];
  const add = (id: string, answer: Predicate["answer"]) => rows.push({ id, answer });
  const divisions = new Set(pool.flatMap((subject) => [subject.primaryDivision, ...subject.secondaryDivisions]));
  for (const division of divisions) {
    add(`division:${normalize(division)}`, (subject) =>
      subject.primaryDivision === division || subject.secondaryDivisions.includes(division));
  }
  for (const cutoff of [2000, 2005, 2010, 2015, 2020]) {
    add(`debut-before:${cutoff}`, (subject) => Number(subject.activeFrom.slice(0, 4)) < cutoff);
    add(`last-fight-before:${cutoff}`, (subject) => Number(subject.activeTo.slice(0, 4)) < cutoff);
  }
  for (const cutoff of [2016, 2020, 2022, 2024]) {
    add(`fought-since:${cutoff}`, (subject) => Number(subject.activeTo.slice(0, 4)) >= cutoff);
  }
  for (const decade of [1990, 2000, 2010, 2020]) {
    add(`active:${decade}s`, (subject) => subject.fights.some((fight) => {
      const year = Number(fight.date.slice(0, 4));
      return year >= decade && year < decade + 10;
    }));
  }
  const wins = (subject: UfcFactualSubject) => subject.fights.filter((fight) => fight.result === "win");
  const losses = (subject: UfcFactualSubject) => subject.fights.filter((fight) => fight.result === "loss");
  const winsBy = (subject: UfcFactualSubject, method: string) => wins(subject).filter((fight) => fight.methodCategory === method).length;
  for (const threshold of [5, 10, 15, 20, 25, 30]) add(`fights:${threshold}`, (subject) => subject.fights.length >= threshold);
  for (const threshold of [5, 10, 15, 20, 25]) add(`wins:${threshold}`, (subject) => wins(subject).length >= threshold);
  for (const threshold of [1, 3, 5, 8, 10]) add(`losses:${threshold}`, (subject) => losses(subject).length >= threshold);
  for (const threshold of [1, 3, 5, 8, 10]) add(`ko-wins:${threshold}`, (subject) => winsBy(subject, "ko-tko") >= threshold);
  for (const threshold of [1, 3, 5, 8]) add(`sub-wins:${threshold}`, (subject) => winsBy(subject, "submission") >= threshold);
  for (const threshold of [1, 3, 5, 8, 10]) add(`decision-wins:${threshold}`, (subject) => winsBy(subject, "decision") >= threshold);
  add("lost-by-ko", (subject) => losses(subject).some((fight) => fight.methodCategory === "ko-tko"));
  add("lost-by-sub", (subject) => losses(subject).some((fight) => fight.methodCategory === "submission"));
  add("more-ko-than-sub-wins", (subject) => winsBy(subject, "ko-tko") > winsBy(subject, "submission"));
  add("more-sub-than-ko-wins", (subject) => winsBy(subject, "submission") > winsBy(subject, "ko-tko"));
  const titleFights = (subject: UfcFactualSubject) => subject.fights.filter((fight) => fight.titleFight);
  const titleWins = (subject: UfcFactualSubject) => titleFights(subject).filter((fight) => fight.result === "win");
  for (const threshold of [1, 2, 3, 5, 8, 10]) add(`title-fights:${threshold}`, (subject) => titleFights(subject).length >= threshold);
  for (const threshold of [1, 2, 3, 5, 8, 10]) add(`title-wins:${threshold}`, (subject) => titleWins(subject).length >= threshold);
  add("interim-title-fight", (subject) => subject.fights.some((fight) => fight.interimTitleFight));
  add("multi-division-career", (subject) => subject.secondaryDivisions.length > 0);

  const names = new Set(pool.map((subject) => normalize(subject.name)));
  for (const opponent of names) {
    const faced = pool.filter((subject) => subject.fights.some((fight) => normalize(fight.opponent) === opponent)).length;
    if (faced < 2 || faced > Math.floor(pool.length * 0.45)) continue;
    add(`faced:${opponent}`, (subject) => subject.fights.some((fight) => normalize(fight.opponent) === opponent));
  }
  return rows;
}

function liveRows(pool: readonly UfcFactualSubject[], predicates: readonly Predicate[]) {
  const byPartition = new Map<string, LiveRow>();
  for (const predicate of predicates) {
    const values = pool.map(predicate.answer);
    const yes = values.filter(Boolean).length;
    if (!yes || yes === pool.length) continue;
    const signature = canonicalPartition(values);
    if (!byPartition.has(signature)) byPartition.set(signature, { id: predicate.id, values });
  }
  return [...byPartition.values()];
}

function rankQuestions(rows: readonly LiveRow[], unused: ReadonlySet<number>, candidates: readonly number[]) {
  return [...unused].flatMap((index) => {
    const row = rows[index]!;
    const yes = candidates.filter((candidate) => row.values[candidate]).length;
    const no = candidates.length - yes;
    if (!yes || !no) return [];
    return [{ index, worst: Math.max(yes, no), imbalance: Math.abs(yes - no), hash: stableHash(row.id) }];
  }).sort((a, b) => a.worst - b.worst || a.imbalance - b.imbalance || a.hash - b.hash);
}

function runTarget(target: number, rows: readonly LiveRow[], size: number, strategy: Strategy, seed: number) {
  let candidates = Array.from({ length: size }, (_value, index) => index);
  const unused = new Set(rows.map((_row, index) => index));
  const random = rng(seed);
  const checkpoints = new Map<number, number>();
  let depth = 0;
  while (candidates.length > 1 && depth < 20) {
    const ranked = rankQuestions(rows, unused, candidates);
    if (!ranked.length) break;
    const width = strategy === "best" ? 1 : strategy === "good" ? 4 : 12;
    const choice = ranked[Math.floor(random() * Math.min(width, ranked.length))]!;
    const answer = rows[choice.index]!.values[target]!;
    candidates = candidates.filter((candidate) => rows[choice.index]!.values[candidate] === answer);
    unused.delete(choice.index);
    depth += 1;
    if (CHECKPOINTS.includes(depth as (typeof CHECKPOINTS)[number])) checkpoints.set(depth, candidates.length);
  }
  for (const checkpoint of CHECKPOINTS) if (!checkpoints.has(checkpoint)) checkpoints.set(checkpoint, candidates.length);
  return { depth: candidates.length === 1 ? depth : null, checkpoints };
}

function simulate(pool: readonly UfcFactualSubject[], strategy: Strategy) {
  const rows = liveRows(pool, buildPredicates(pool));
  const repeats = strategy === "best" ? 1 : 3;
  const runs = pool.flatMap((_subject, target) => Array.from({ length: repeats }, (_value, repeat) =>
    runTarget(target, rows, pool.length, strategy, stableHash(`${strategy}:${target}:${repeat}`))));
  const depths = runs.map((run) => run.depth ?? 21);
  return {
    runs: runs.length,
    livePredicateCount: rows.length,
    solvedBy20Pct: Number((runs.filter((run) => run.depth != null).length / runs.length * 100).toFixed(1)),
    solveDepth: { median: percentile(depths, 0.5), p90: percentile(depths, 0.9), p95: percentile(depths, 0.95) },
    checkpoints: Object.fromEntries(CHECKPOINTS.map((checkpoint) => {
      const counts = runs.map((run) => run.checkpoints.get(checkpoint)!);
      const pct = (limit: number) => Number((counts.filter((count) => count <= limit).length / counts.length * 100).toFixed(1));
      return [checkpoint, {
        uniquePct: pct(1),
        within2Pct: pct(2),
        within3Pct: pct(3),
        averageCandidates: Number((counts.reduce((sum, count) => sum + count, 0) / counts.length).toFixed(2)),
      }];
    })),
  };
}

describe("UFC 20 Questions 100-subject cap calibration", () => {
  it("prints aggregate-only cap calibration", () => {
    const report = {
      subjectCount: ufcFactualLedgerSubjects.length,
      best: simulate(ufcFactualLedgerSubjects, "best"),
      good: simulate(ufcFactualLedgerSubjects, "good"),
      messy: simulate(ufcFactualLedgerSubjects, "messy"),
    };
    console.log(`UFC_100_CAP_CALIBRATION=${JSON.stringify(report)}`);
    expect(report.subjectCount).toBe(100);
  });
});
