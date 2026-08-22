import {
  loadLineupHistory,
  seededLineupRandom,
  selectReplayLineup,
  shuffleLineup,
  stableLineupHash,
  type PlayLineupHistory,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import { footballHitTheNumberSubjects } from "./footballHitTheNumberModel";
import {
  footballFindLeaderMetricDefinitions,
  formatFootballFindLeaderFact,
  getFootballFindLeaderFact,
  type FootballFindLeaderDomainId,
  type FootballFindLeaderFamilyId,
  type FootballFindLeaderMetricDefinition,
  type FootballFindLeaderMetricId,
} from "./footballFactualStats";

export const FOOTBALL_FIND_LEADER_GAME_ID = "football-find-leader";
export const FOOTBALL_FIND_LEADER_VERSION = "football-find-leader-v1";
export const FOOTBALL_FIND_LEADER_CANDIDATE_COUNT = 10;
const REPLAY_IDENTITY_SIZE = FOOTBALL_FIND_LEADER_CANDIDATE_COUNT + 3;

export interface FootballFindLeaderQuestionDefinition {
  id: string;
  metricId: FootballFindLeaderMetricId;
  domainId: FootballFindLeaderDomainId;
  family: FootballFindLeaderFamilyId;
  question: string;
  statLabel: string;
  shortLabel: string;
}

export interface FootballFindLeaderCandidate {
  id: string;
  name: string;
  subtitle: string;
  value: number;
}

export interface FootballFindLeaderBoard {
  version: typeof FOOTBALL_FIND_LEADER_VERSION;
  definitionId: string;
  metricId: FootballFindLeaderMetricId;
  domainId: FootballFindLeaderDomainId;
  family: FootballFindLeaderFamilyId;
  question: string;
  context: string;
  statLabel: string;
  shortLabel: string;
  leaderId: string;
  leaderValue: number;
  candidates: FootballFindLeaderCandidate[];
}

export interface FootballFindLeaderRun {
  board: FootballFindLeaderBoard;
  identity: PlayLineupIdentity;
}

type ScoredRow = { id: string; name: string; subtitle: string; value: number };

const domainCopy: Readonly<Record<FootballFindLeaderDomainId, string>> = {
  "nfl-qb-career": "retired NFL quarterbacks",
  "nfl-rb-career": "retired NFL running backs",
  "cfb-champion-season": "national-championship team seasons",
};

export const FOOTBALL_FIND_LEADER_FAMILY_CYCLE: readonly FootballFindLeaderFamilyId[] = [
  "qb-volume",
  "cfb-offense",
  "rb-rushing",
  "qb-efficiency",
  "cfb-defense",
  "rb-receiving",
  "rb-scrimmage",
  "cfb-strength",
] as const;

function questionVariants(definition: FootballFindLeaderMetricDefinition): FootballFindLeaderQuestionDefinition[] {
  return [
    {
      id: `${definition.id}:standard`,
      metricId: definition.id,
      domainId: definition.domainId,
      family: definition.family,
      question: `Who has ${definition.questionLead}?`,
      statLabel: definition.label,
      shortLabel: definition.shortLabel,
    },
    {
      id: `${definition.id}:group`,
      metricId: definition.id,
      domainId: definition.domainId,
      family: definition.family,
      question: `Which of these ${domainCopy[definition.domainId]} has ${definition.questionLead}?`,
      statLabel: definition.label,
      shortLabel: definition.shortLabel,
    },
  ];
}

export const footballFindLeaderQuestions: readonly FootballFindLeaderQuestionDefinition[] = footballFindLeaderMetricDefinitions.flatMap(questionVariants);

function subjectMatchesDomain(subject: (typeof footballHitTheNumberSubjects)[number], domainId: FootballFindLeaderDomainId) {
  if (domainId === "nfl-qb-career") return subject.domainId === "nfl-qb-passing";
  if (domainId === "nfl-rb-career") return subject.domainId === "nfl-rb-rushing";
  return subject.domainId === "cfb-champion-scoring";
}

export function footballFindLeaderMetricRows(metricId: FootballFindLeaderMetricId): ScoredRow[] {
  const definition = footballFindLeaderMetricDefinitions.find((row) => row.id === metricId);
  if (!definition) return [];
  return footballHitTheNumberSubjects
    .filter((subject) => subjectMatchesDomain(subject, definition.domainId))
    .flatMap((subject) => {
      const fact = getFootballFindLeaderFact(subject.id, metricId);
      return fact ? [{ id: subject.id, name: subject.name, subtitle: subject.subtitle, value: fact.value }] : [];
    })
    .sort((left, right) => right.value - left.value || left.name.localeCompare(right.name));
}

function viableLeaders(pool: readonly ScoredRow[], excludeGlobalMax: boolean) {
  const globalMax = pool[0]?.value ?? 0;
  return pool.filter((row) => (
    (!excludeGlobalMax || row.value < globalMax)
    && pool.filter((other) => other.value < row.value).length >= FOOTBALL_FIND_LEADER_CANDIDATE_COUNT - 1
  ));
}

function competitiveLeader(pool: readonly ScoredRow[], random: () => number) {
  const nonRecord = viableLeaders(pool, true);
  const options = nonRecord.length ? nonRecord : viableLeaders(pool, false);
  if (!options.length) return null;
  const ranked = options.map((leader) => {
    const lower = pool.filter((row) => row.value < leader.value);
    const nearest = lower.slice(0, FOOTBALL_FIND_LEADER_CANDIDATE_COUNT - 1);
    const scale = Math.max(Math.abs(leader.value), 1);
    const spread = leader.value - nearest.at(-1)!.value;
    const runnerUpGap = leader.value - nearest[0]!.value;
    return { leader, lower, competitionScore: (spread / scale) + (runnerUpGap / scale * 0.35) };
  }).sort((left, right) => left.competitionScore - right.competitionScore || right.leader.value - left.leader.value);
  const best = ranked[0]!.competitionScore;
  const window = ranked.filter((row) => row.competitionScore <= best + 0.12).slice(0, 6);
  return window[Math.floor(random() * window.length)] ?? ranked[0]!;
}

function closestRows(rows: readonly ScoredRow[], count: number, random: () => number) {
  if (rows.length < count) return [];
  const cutoff = rows[count - 1]!.value;
  const closer = rows.filter((row) => row.value > cutoff);
  const tied = shuffleLineup(rows.filter((row) => row.value === cutoff), random);
  return [...closer, ...tied.slice(0, count - closer.length)];
}

function plausibleChallengers(lower: readonly ScoredRow[], random: () => number) {
  const count = FOOTBALL_FIND_LEADER_CANDIDATE_COUNT - 1;
  if (lower.length < count) return [];
  const core = closestRows(lower, 4, random);
  const used = new Set(core.map((row) => row.id));
  const support = shuffleLineup(lower.slice(4, Math.min(12, lower.length)).filter((row) => !used.has(row.id)), random).slice(0, 3);
  support.forEach((row) => used.add(row.id));
  const wildcards = shuffleLineup(lower.slice(9, Math.min(20, lower.length)).filter((row) => !used.has(row.id)), random).slice(0, 2);
  wildcards.forEach((row) => used.add(row.id));
  const selected = [...core, ...support, ...wildcards];
  if (selected.length < count) {
    selected.push(...shuffleLineup(lower.filter((row) => !used.has(row.id)), random).slice(0, count - selected.length));
  }
  return selected.slice(0, count);
}

export function buildFootballFindLeaderBoard(definition: FootballFindLeaderQuestionDefinition, seed: string): FootballFindLeaderBoard | null {
  const pool = footballFindLeaderMetricRows(definition.metricId);
  if (pool.length < FOOTBALL_FIND_LEADER_CANDIDATE_COUNT) return null;
  const random = seededLineupRandom(FOOTBALL_FIND_LEADER_VERSION, seed, definition.id);
  const option = competitiveLeader(pool, random);
  if (!option) return null;
  const challengers = plausibleChallengers(option.lower, random);
  if (challengers.length !== FOOTBALL_FIND_LEADER_CANDIDATE_COUNT - 1) return null;
  const candidates = shuffleLineup([option.leader, ...challengers], random);
  return {
    version: FOOTBALL_FIND_LEADER_VERSION,
    definitionId: definition.id,
    metricId: definition.metricId,
    domainId: definition.domainId,
    family: definition.family,
    question: definition.question,
    context: `Highest ${definition.statLabel} among the ten shown. The overall record holder does not have to appear.`,
    statLabel: definition.statLabel,
    shortLabel: definition.shortLabel,
    leaderId: option.leader.id,
    leaderValue: option.leader.value,
    candidates,
  };
}

function token(kind: "question" | "metric" | "family", value: string) {
  return `${kind}:${value}`;
}

function recentValues(history: PlayLineupHistory, kind: "question" | "metric" | "family") {
  const prefix = `${kind}:`;
  return new Set(history.recentItemIds.filter((id) => id.startsWith(prefix)).map((id) => id.slice(prefix.length)));
}

function chooseQuestion(seed: string, history: PlayLineupHistory) {
  const recentQuestions = recentValues(history, "question");
  const recentMetrics = recentValues(history, "metric");
  const recentFamilies = recentValues(history, "family");
  const start = stableLineupHash(`${FOOTBALL_FIND_LEADER_VERSION}|family|${seed}`) % FOOTBALL_FIND_LEADER_FAMILY_CYCLE.length;
  const rotated = FOOTBALL_FIND_LEADER_FAMILY_CYCLE.map((_, index) => FOOTBALL_FIND_LEADER_FAMILY_CYCLE[(start + index) % FOOTBALL_FIND_LEADER_FAMILY_CYCLE.length]!);
  const family = rotated.find((value) => !recentFamilies.has(value)) ?? rotated[0]!;
  const familyQuestions = footballFindLeaderQuestions.filter((question) => question.family === family);
  const freshMetric = familyQuestions.filter((question) => !recentMetrics.has(question.metricId) && !recentQuestions.has(question.id));
  const freshQuestion = familyQuestions.filter((question) => !recentQuestions.has(question.id));
  const candidates = freshMetric.length ? freshMetric : freshQuestion.length ? freshQuestion : familyQuestions;
  const random = seededLineupRandom(FOOTBALL_FIND_LEADER_VERSION, "question", seed);
  return candidates[Math.floor(random() * candidates.length)] ?? footballFindLeaderQuestions[0]!;
}

export function createFootballFindLeaderBoard(seed: string, history: PlayLineupHistory = loadLineupHistory(FOOTBALL_FIND_LEADER_GAME_ID)) {
  const first = chooseQuestion(seed, history);
  const ordered = [first, ...footballFindLeaderQuestions.filter((question) => question.id !== first.id)
    .sort((left, right) => stableLineupHash(`${seed}|${left.id}`) - stableLineupHash(`${seed}|${right.id}`))];
  for (const definition of ordered) {
    const board = buildFootballFindLeaderBoard(definition, seed);
    if (board) return board;
  }
  throw new Error("Football Find the Leader could not build a competitive ten-item board.");
}

export function createFootballFindLeaderRun(): FootballFindLeaderRun {
  const validItemIds = new Set<string>(footballHitTheNumberSubjects.map((subject) => subject.id));
  footballFindLeaderQuestions.forEach((question) => {
    validItemIds.add(token("question", question.id));
    validItemIds.add(token("metric", question.metricId));
    validItemIds.add(token("family", question.family));
  });
  const selected = selectReplayLineup({
    gameId: FOOTBALL_FIND_LEADER_GAME_ID,
    lineupSize: REPLAY_IDENTITY_SIZE,
    attempts: 18,
    validItemIds,
    build: (seed, _attempt, history) => {
      const board = createFootballFindLeaderBoard(seed, history);
      return {
        value: board,
        itemIds: [
          token("question", board.definitionId),
          token("metric", board.metricId),
          token("family", board.family),
          ...board.candidates.map((candidate) => candidate.id),
        ],
      };
    },
  });
  return { board: selected.value, identity: selected.identity };
}

export function formatFootballFindLeaderValue(board: Pick<FootballFindLeaderBoard, "metricId">, value: number) {
  return formatFootballFindLeaderFact(board.metricId, value);
}

export function footballFindLeaderCompetitionAudit() {
  return footballFindLeaderQuestions.map((definition) => {
    const pool = footballFindLeaderMetricRows(definition.metricId);
    const board = buildFootballFindLeaderBoard(definition, `audit|${definition.id}`);
    const nonRecordLeaderAvailable = viableLeaders(pool, true).length > 0;
    const globalLeaderId = pool[0]?.id ?? null;
    if (!board) return { definitionId: definition.id, boardValid: false, nonRecordLeaderAvailable, leaderIsGlobalMax: false, nearContenderCount: 0, outsideClosestNineCount: 0 };
    const leader = pool.find((row) => row.id === board.leaderId)!;
    const lower = pool.filter((row) => row.value < leader.value);
    const closestNine = new Set(lower.slice(0, 9).map((row) => row.id));
    const nearCutoff = lower[3]?.value ?? Number.NEGATIVE_INFINITY;
    const challengers = board.candidates.filter((candidate) => candidate.id !== board.leaderId);
    return {
      definitionId: definition.id,
      boardValid: true,
      nonRecordLeaderAvailable,
      leaderIsGlobalMax: board.leaderId === globalLeaderId,
      nearContenderCount: challengers.filter((candidate) => candidate.value >= nearCutoff).length,
      outsideClosestNineCount: challengers.filter((candidate) => !closestNine.has(candidate.id)).length,
    };
  });
}
