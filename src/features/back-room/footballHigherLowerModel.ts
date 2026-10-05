import {
  footballFactualRecords,
  formatFootballFact,
  getFootballSubject,
  queryFootballSubjects,
  type FootballFactMetricId,
  type FootballSubjectProfile,
} from "./footballFactualStats";
import { seededLineupRandom, shuffleLineup } from "../play/lineupModel";

export const FOOTBALL_HIGHER_LOWER_GAME_ID = "football-higher-lower";
export const FOOTBALL_HIGHER_LOWER_VERSION = "football-higher-lower-v1" as const;
export const FOOTBALL_HIGHER_LOWER_QUESTION_COUNT = 10;

export type FootballHigherLowerScope = "NFL" | "CFB" | "MIXED";
export type FootballHigherLowerLeague = "NFL" | "CFB";
export type FootballHigherLowerChoice = "higher" | "lower";
export type FootballHigherLowerDifficulty = "approachable" | "competitive" | "tough";
export type FootballHigherLowerCategory =
  | "single-season"
  | "career"
  | "awards"
  | "championships"
  | "team"
  | "draft";

export interface FootballHigherLowerSubject {
  subjectId: string;
  name: string;
  context: string;
  value: number;
  formattedValue: string;
}

export interface FootballHigherLowerQuestion {
  id: string;
  league: FootballHigherLowerLeague;
  category: FootballHigherLowerCategory;
  difficulty: FootballHigherLowerDifficulty;
  metricKey: string;
  metricLabel: string;
  note?: string;
  known: FootballHigherLowerSubject;
  hidden: FootballHigherLowerSubject;
  answer: FootballHigherLowerChoice;
}

export interface FootballHigherLowerBoard {
  version: typeof FOOTBALL_HIGHER_LOWER_VERSION;
  seed: string;
  scope: FootballHigherLowerScope;
  questions: FootballHigherLowerQuestion[];
}

interface MetricSpec {
  key: string;
  league: FootballHigherLowerLeague;
  category: FootballHigherLowerCategory;
  label: string;
  metricId?: FootballFactMetricId;
  kinds: readonly FootballSubjectProfile["kind"][];
  note?: string;
  valueFromSubject?: (subject: FootballSubjectProfile) => number | null;
}

interface MetricRow {
  subject: FootballSubjectProfile;
  value: number;
  formattedValue: string;
}

interface PairCandidate {
  id: string;
  league: FootballHigherLowerLeague;
  category: FootballHigherLowerCategory;
  difficulty: FootballHigherLowerDifficulty;
  metricKey: string;
  metricLabel: string;
  note?: string;
  left: MetricRow;
  right: MetricRow;
}

const metricSpecs: readonly MetricSpec[] = [
  { key: "nfl-season-pass-yards", league: "NFL", category: "single-season", label: "Season passing yards", metricId: "nfl-season-passing-yards", kinds: ["player-season"] },
  { key: "nfl-season-pass-td", league: "NFL", category: "single-season", label: "Season passing TDs", metricId: "nfl-season-passing-touchdowns", kinds: ["player-season"] },
  { key: "nfl-team-wins", league: "NFL", category: "team", label: "Team wins", metricId: "nfl-team-overall-wins", kinds: ["team-season"] },
  { key: "nfl-team-points", league: "NFL", category: "team", label: "Team points scored", metricId: "nfl-team-points-for", kinds: ["team-season"] },
  { key: "nfl-team-sacks", league: "NFL", category: "team", label: "Team defensive sacks", metricId: "nfl-team-defensive-sacks", kinds: ["team-season"] },
  { key: "nfl-mvps", league: "NFL", category: "awards", label: "AP MVP awards", metricId: "nfl-ap-mvp-awards", kinds: ["player-career"] },
  { key: "nfl-all-pros", league: "NFL", category: "awards", label: "First-team All-Pro selections", metricId: "nfl-first-team-all-pros", kinds: ["player-career"] },
  { key: "nfl-dpoys", league: "NFL", category: "awards", label: "Defensive Player of the Year awards", metricId: "nfl-defensive-player-of-year-awards", kinds: ["player-career"] },
  { key: "nfl-super-bowls", league: "NFL", category: "championships", label: "Super Bowl titles", metricId: "nfl-super-bowl-titles", kinds: ["player-career"] },
  { key: "nfl-career-pass-yards", league: "NFL", category: "career", label: "Career passing yards", metricId: "nfl-career-passing-yards", kinds: ["player-career"] },
  { key: "nfl-career-pass-td", league: "NFL", category: "career", label: "Career passing TDs", metricId: "nfl-career-passing-touchdowns", kinds: ["player-career"] },
  { key: "nfl-career-rush-yards", league: "NFL", category: "career", label: "Career rushing yards", metricId: "nfl-career-rushing-yards", kinds: ["player-career"] },
  { key: "nfl-career-rush-td", league: "NFL", category: "career", label: "Career rushing TDs", metricId: "nfl-career-rushing-touchdowns", kinds: ["player-career"] },
  { key: "nfl-career-rec-yards", league: "NFL", category: "career", label: "Career receiving yards", metricId: "nfl-career-receiving-yards", kinds: ["player-career"] },
  { key: "nfl-career-rec-td", league: "NFL", category: "career", label: "Career receiving TDs", metricId: "nfl-career-receiving-touchdowns", kinds: ["player-career"] },
  { key: "nfl-career-sacks", league: "NFL", category: "career", label: "Career sacks", metricId: "nfl-career-sacks", kinds: ["player-career"] },
  {
    key: "nfl-draft-pick",
    league: "NFL",
    category: "draft",
    label: "NFL Draft overall pick number",
    kinds: ["player-career"],
    note: "Higher number = later selection.",
    valueFromSubject: (subject) => subject.draftPick ?? null,
  },
  { key: "cfb-peak-pass-yards", league: "CFB", category: "single-season", label: "Best-season passing yards", metricId: "cfb-best-season-passing-yards", kinds: ["player-career"] },
  { key: "cfb-peak-pass-td", league: "CFB", category: "single-season", label: "Best-season passing TDs", metricId: "cfb-best-season-passing-touchdowns", kinds: ["player-career"] },
  { key: "cfb-peak-rush-yards", league: "CFB", category: "single-season", label: "Best-season rushing yards", metricId: "cfb-best-season-rushing-yards", kinds: ["player-career"] },
  { key: "cfb-peak-rush-td", league: "CFB", category: "single-season", label: "Best-season rushing TDs", metricId: "cfb-best-season-rushing-touchdowns", kinds: ["player-career"] },
  { key: "cfb-peak-rec-yards", league: "CFB", category: "single-season", label: "Best-season receiving yards", metricId: "cfb-best-season-receiving-yards", kinds: ["player-career"] },
  { key: "cfb-peak-rec-td", league: "CFB", category: "single-season", label: "Best-season receiving TDs", metricId: "cfb-best-season-receiving-touchdowns", kinds: ["player-career"] },
  { key: "cfb-peak-sacks", league: "CFB", category: "single-season", label: "Best-season sacks", metricId: "cfb-best-season-sacks", kinds: ["player-career"] },
  { key: "cfb-team-wins", league: "CFB", category: "team", label: "Team wins", metricId: "cfb-team-wins", kinds: ["team-season"] },
  { key: "cfb-team-points", league: "CFB", category: "team", label: "Team points scored", metricId: "cfb-team-points-for", kinds: ["team-season"] },
  { key: "cfb-team-ppg", league: "CFB", category: "team", label: "Team points per game", metricId: "cfb-team-points-per-game", kinds: ["team-season"] },
  { key: "cfb-all-america", league: "CFB", category: "awards", label: "All-America selections", metricId: "cfb-all-america-selections", kinds: ["player-career"] },
  { key: "cfb-all-conference", league: "CFB", category: "awards", label: "First-team all-conference selections", metricId: "cfb-first-team-all-conference-selections", kinds: ["player-career"] },
  { key: "cfb-national-titles", league: "CFB", category: "championships", label: "College national championships won", metricId: "cfb-national-championships-won", kinds: ["player-career"] },
  { key: "cfb-career-pass-yards", league: "CFB", category: "career", label: "College career passing yards", metricId: "cfb-career-passing-yards", kinds: ["player-career"] },
  { key: "cfb-career-pass-td", league: "CFB", category: "career", label: "College career passing TDs", metricId: "cfb-career-passing-touchdowns", kinds: ["player-career"] },
  { key: "cfb-career-rush-yards", league: "CFB", category: "career", label: "College career rushing yards", metricId: "cfb-career-rushing-yards", kinds: ["player-career"] },
  { key: "cfb-career-rush-td", league: "CFB", category: "career", label: "College career rushing TDs", metricId: "cfb-career-rushing-touchdowns", kinds: ["player-career"] },
  { key: "cfb-career-rec-yards", league: "CFB", category: "career", label: "College career receiving yards", metricId: "cfb-career-receiving-yards", kinds: ["player-career"] },
  { key: "cfb-career-rec-td", league: "CFB", category: "career", label: "College career receiving TDs", metricId: "cfb-career-receiving-touchdowns", kinds: ["player-career"] },
  { key: "cfb-career-sacks", league: "CFB", category: "career", label: "College career sacks", metricId: "cfb-career-sacks", kinds: ["player-career"] },
  {
    key: "cfb-draft-pick",
    league: "CFB",
    category: "draft",
    label: "NFL Draft overall pick number",
    metricId: "cfb-nfl-draft-overall-pick",
    kinds: ["player-career"],
    note: "Higher number = later selection.",
  },
] as const;

function subjectEligible(subject: FootballSubjectProfile, spec: MetricSpec) {
  return subject.league === spec.league
    && spec.kinds.includes(subject.kind)
    && subject.casualEligible !== false
    && subject.recognizabilityTier !== "D";
}

function subjectContext(subject: FootballSubjectProfile, category: FootballHigherLowerCategory) {
  if (category === "draft") {
    return `${subject.position ?? "PLAYER"} · NFL DRAFT`;
  }
  if (subject.kind === "player-season") {
    return `${subject.season ?? "SEASON"} · ${subject.position ?? "PLAYER"}`;
  }
  if (subject.kind === "team-season") {
    return `${subject.season ?? "SEASON"} · TEAM`;
  }
  if (subject.kind === "player-career") {
    return subject.league === "CFB"
      ? `${subject.position ?? "PLAYER"} · COLLEGE CAREER`
      : `${subject.position ?? "PLAYER"} · NFL CAREER`;
  }
  return subject.league;
}

function formatMetricValue(spec: MetricSpec, value: number) {
  return spec.metricId ? formatFootballFact(spec.metricId, value) : value.toLocaleString("en-US");
}

function metricRows(spec: MetricSpec): MetricRow[] {
  if (spec.valueFromSubject) {
    return queryFootballSubjects({ league: spec.league })
      .filter((subject) => subjectEligible(subject, spec))
      .flatMap((subject) => {
        const value = spec.valueFromSubject?.(subject) ?? null;
        if (value == null || !Number.isFinite(value)) return [];
        return [{ subject, value, formattedValue: formatMetricValue(spec, value) }];
      });
  }

  if (!spec.metricId) return [];
  return footballFactualRecords.flatMap((record) => {
    const subject = getFootballSubject(record.subjectId);
    if (!subject || !subjectEligible(subject, spec)) return [];
    const fact = record.facts.find((candidate) => candidate.metricId === spec.metricId);
    if (!fact || !Number.isFinite(fact.value)) return [];
    return [{
      subject,
      value: fact.value,
      formattedValue: formatMetricValue(spec, fact.value),
    }];
  });
}

function relativeGap(left: number, right: number) {
  return Math.abs(left - right) / Math.max(Math.abs(left), Math.abs(right), 1);
}

function pairDifficulty(left: number, right: number): FootballHigherLowerDifficulty {
  const gap = relativeGap(left, right);
  if (gap <= 0.08) return "tough";
  if (gap <= 0.22) return "competitive";
  return "approachable";
}

function pairCandidates(spec: MetricSpec): PairCandidate[] {
  const rows = metricRows(spec)
    .sort((left, right) => left.value - right.value);
  const offsets = [1, 2, 4, 8, 12, 16] as const;
  const pairs: PairCandidate[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    for (const offset of offsets) {
      const rightIndex = index + offset;
      if (rightIndex >= rows.length) continue;
      const left = rows[index]!;
      const right = rows[rightIndex]!;
      if (left.value === right.value) continue;
      const gap = relativeGap(left.value, right.value);
      if (gap > 0.58) continue;
      pairs.push({
        id: `${spec.key}:${left.subject.id}:${right.subject.id}`,
        league: spec.league,
        category: spec.category,
        difficulty: pairDifficulty(left.value, right.value),
        metricKey: spec.key,
        metricLabel: spec.label,
        ...(spec.note ? { note: spec.note } : {}),
        left,
        right,
      });
    }
  }
  return pairs;
}

const allPairCandidates = metricSpecs.flatMap(pairCandidates);

function entityKey(subject: FootballSubjectProfile) {
  if (subject.playerId) {
    return `player:${subject.playerId.replace(/^(?:nfl|cfb)-/, "").replace(/-\d{4}$/, "")}`;
  }
  if (subject.coachId) return `coach:${subject.coachId.replace(/^(?:nfl|cfb)-/, "")}`;
  if (subject.teamId) return `team:${subject.teamId}`;
  return `subject:${subject.id}`;
}

function leaguePattern(scope: FootballHigherLowerScope, random: () => number) {
  if (scope === "NFL" || scope === "CFB") {
    return Array.from({ length: FOOTBALL_HIGHER_LOWER_QUESTION_COUNT }, () => scope);
  }
  const base: FootballHigherLowerLeague[] = [
    "NFL", "NFL", "NFL", "NFL", "NFL",
    "CFB", "CFB", "CFB", "CFB", "CFB",
  ];
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const candidate = shuffleLineup(base, random);
    const hasThreeStraight = candidate.some((league, index) => (
      index >= 2 && candidate[index - 1] === league && candidate[index - 2] === league
    ));
    if (!hasThreeStraight) return candidate;
  }
  return ["NFL", "CFB", "NFL", "CFB", "NFL", "CFB", "NFL", "CFB", "NFL", "CFB"];
}

function difficultyPattern(random: () => number) {
  return shuffleLineup<FootballHigherLowerDifficulty>([
    "approachable", "approachable", "approachable",
    "competitive", "competitive", "competitive", "competitive", "competitive",
    "tough", "tough",
  ], random);
}

function answerPattern(random: () => number) {
  return shuffleLineup<FootballHigherLowerChoice>([
    "higher", "higher", "higher", "higher", "higher",
    "lower", "lower", "lower", "lower", "lower",
  ], random);
}

function toQuestion(pair: PairCandidate, answer: FootballHigherLowerChoice): FootballHigherLowerQuestion {
  const lower = pair.left.value < pair.right.value ? pair.left : pair.right;
  const higher = pair.left.value < pair.right.value ? pair.right : pair.left;
  const known = answer === "higher" ? lower : higher;
  const hidden = answer === "higher" ? higher : lower;
  const subject = (row: MetricRow): FootballHigherLowerSubject => ({
    subjectId: row.subject.id,
    name: row.subject.name,
    context: subjectContext(row.subject, pair.category),
    value: row.value,
    formattedValue: row.formattedValue,
  });

  return {
    id: `${pair.id}:${answer}`,
    league: pair.league,
    category: pair.category,
    difficulty: pair.difficulty,
    metricKey: pair.metricKey,
    metricLabel: pair.metricLabel,
    ...(pair.note ? { note: pair.note } : {}),
    known: subject(known),
    hidden: subject(hidden),
    answer,
  };
}

function tryBuildBoard(seed: string, scope: FootballHigherLowerScope, attempt: number) {
  const random = seededLineupRandom(FOOTBALL_HIGHER_LOWER_VERSION, seed, scope, attempt);
  const leagues = leaguePattern(scope, random);
  const difficulties = difficultyPattern(random);
  const answers = answerPattern(random);
  const usedEntities = new Set<string>();
  const metricCounts = new Map<string, number>();
  const categoryCounts = new Map<FootballHigherLowerCategory, number>();
  let careerCount = 0;
  const questions: FootballHigherLowerQuestion[] = [];

  for (let index = 0; index < FOOTBALL_HIGHER_LOWER_QUESTION_COUNT; index += 1) {
    const league = leagues[index]!;
    const difficulty = difficulties[index]!;
    const answer = answers[index]!;
    const lastCategory = questions.at(-1)?.category;
    const matching = allPairCandidates.filter((pair) => {
      if (pair.league !== league || pair.difficulty !== difficulty) return false;
      if ((metricCounts.get(pair.metricKey) ?? 0) >= 2) return false;
      if ((categoryCounts.get(pair.category) ?? 0) >= 3) return false;
      if (pair.category === "career" && careerCount >= 2) return false;
      if (lastCategory === pair.category) return false;
      const leftKey = entityKey(pair.left.subject);
      const rightKey = entityKey(pair.right.subject);
      return !usedEntities.has(leftKey) && !usedEntities.has(rightKey) && leftKey !== rightKey;
    });
    if (!matching.length) return null;

    const unseen = matching.filter((pair) => !categoryCounts.has(pair.category));
    const pool = unseen.length && categoryCounts.size < 5 ? unseen : matching;
    const pair = shuffleLineup(pool, random)[0]!;
    const question = toQuestion(pair, answer);
    questions.push(question);
    usedEntities.add(entityKey(pair.left.subject));
    usedEntities.add(entityKey(pair.right.subject));
    metricCounts.set(pair.metricKey, (metricCounts.get(pair.metricKey) ?? 0) + 1);
    categoryCounts.set(pair.category, (categoryCounts.get(pair.category) ?? 0) + 1);
    if (pair.category === "career") careerCount += 1;
  }

  if (categoryCounts.size < 5) return null;
  return questions;
}

export function createFootballHigherLowerBoard(
  seed: string,
  scope: FootballHigherLowerScope,
): FootballHigherLowerBoard {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const questions = tryBuildBoard(seed, scope, attempt);
    if (questions) {
      return {
        version: FOOTBALL_HIGHER_LOWER_VERSION,
        seed,
        scope,
        questions,
      };
    }
  }
  throw new Error(`Unable to build a valid Higher or Lower ${scope} board.`);
}

function isScope(value: unknown): value is FootballHigherLowerScope {
  return value === "NFL" || value === "CFB" || value === "MIXED";
}

function isChoice(value: unknown): value is FootballHigherLowerChoice {
  return value === "higher" || value === "lower";
}

export function parseFootballHigherLowerBoard(value: unknown): FootballHigherLowerBoard | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const board = value as Partial<FootballHigherLowerBoard>;
  if (
    board.version !== FOOTBALL_HIGHER_LOWER_VERSION
    || typeof board.seed !== "string"
    || !isScope(board.scope)
    || !Array.isArray(board.questions)
    || board.questions.length !== FOOTBALL_HIGHER_LOWER_QUESTION_COUNT
  ) return null;

  for (const question of board.questions) {
    if (!question || typeof question !== "object" || Array.isArray(question)) return null;
    const row = question as Partial<FootballHigherLowerQuestion>;
    if (
      typeof row.id !== "string"
      || (row.league !== "NFL" && row.league !== "CFB")
      || !isChoice(row.answer)
      || !row.known
      || !row.hidden
      || typeof row.known.value !== "number"
      || typeof row.hidden.value !== "number"
      || row.known.value === row.hidden.value
    ) return null;
  }
  return board as FootballHigherLowerBoard;
}

export function footballHigherLowerAnswerIsCorrect(
  question: FootballHigherLowerQuestion,
  choice: FootballHigherLowerChoice,
) {
  return choice === question.answer;
}
