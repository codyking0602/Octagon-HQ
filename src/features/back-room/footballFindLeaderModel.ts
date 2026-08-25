import {
  loadLineupHistory,
  seededLineupRandom,
  selectReplayLineup,
  shuffleLineup,
  stableLineupHash,
  type PlayLineupHistory,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import {
  selectFindLeaderCompetition,
  viableCompetitiveLeaders,
} from "../play/findLeaderCompetition";
import {
  footballFactMetricDefinitions,
  formatFootballFact,
  getFootballFact,
  getFootballFactualRecord,
  type FootballFactMetricId,
  type FootballFactScope,
} from "./footballFactualStats";
import {
  footballFindLeaderLeagueForDomain,
  footballFindLeaderMetricDefinitions,
  type FootballFindLeaderDomainId,
  type FootballFindLeaderFamilyId,
  type FootballFindLeaderLeagueId,
  type FootballFindLeaderMetricDefinition,
  type FootballFindLeaderMetricId,
} from "./footballFindLeaderStats";
import { evaluateFootballFindLeaderQuality } from "./footballFindLeaderQuality";
import { footballSubjects, queryFootballSubjects, type FootballSubjectQuery } from "./footballSubjectRegistry";

export const footballFindLeaderCanonicalMetricByMetric: Readonly<Record<FootballFindLeaderMetricId, FootballFactMetricId>> = {
  "qb-games": "nfl-career-games",
  "qb-completions": "nfl-career-passing-completions",
  "qb-attempts": "nfl-career-passing-attempts",
  "qb-passing-yards": "nfl-career-passing-yards",
  "qb-passing-touchdowns": "nfl-career-passing-touchdowns",
  "qb-interceptions": "nfl-career-interceptions-thrown",
  "qb-passer-rating": "nfl-career-passer-rating",
  "qb-completion-pct": "nfl-career-completion-percentage",
  "qb-yards-per-attempt": "nfl-career-passing-yards-per-attempt",
  "qb-touchdown-pct": "nfl-career-passing-touchdown-percentage",
  "qb-passing-yards-per-game": "nfl-career-passing-yards-per-game",
  "qb-passing-touchdowns-per-game": "nfl-career-passing-touchdowns-per-game",
  "qb-completions-per-game": "nfl-career-passing-completions-per-game",
  "qb-attempts-per-game": "nfl-career-passing-attempts-per-game",
  "qb-td-int-ratio": "nfl-career-passing-touchdown-interception-ratio",
  "rb-games": "nfl-career-games",
  "rb-rushing-attempts": "nfl-career-rushing-attempts",
  "rb-rushing-yards": "nfl-career-rushing-yards",
  "rb-rushing-touchdowns": "nfl-career-rushing-touchdowns",
  "rb-receptions": "nfl-career-receptions",
  "rb-receiving-yards": "nfl-career-receiving-yards",
  "rb-receiving-touchdowns": "nfl-career-receiving-touchdowns",
  "rb-rush-yards-per-attempt": "nfl-career-rushing-yards-per-attempt",
  "rb-rushing-yards-per-game": "nfl-career-rushing-yards-per-game",
  "rb-rushing-touchdowns-per-game": "nfl-career-rushing-touchdowns-per-game",
  "rb-receptions-per-game": "nfl-career-receptions-per-game",
  "rb-receiving-yards-per-game": "nfl-career-receiving-yards-per-game",
  "rb-scrimmage-yards": "nfl-career-scrimmage-yards",
  "rb-scrimmage-yards-per-game": "nfl-career-scrimmage-yards-per-game",
  "rb-scrimmage-touchdowns": "nfl-career-scrimmage-touchdowns",
  "qb-season-passing-yards": "nfl-season-passing-yards",
  "qb-season-passing-touchdowns": "nfl-season-passing-touchdowns",
  "qb-season-interceptions": "nfl-season-interceptions",
  "qb-season-passer-rating": "nfl-season-passer-rating",
  "nfl-team-wins": "nfl-team-overall-wins",
  "nfl-team-losses": "nfl-team-overall-losses",
  "cfb-points-for": "cfb-team-points-for",
  "cfb-points-against": "cfb-team-points-against",
  "cfb-points-per-game": "cfb-team-points-per-game",
  "cfb-opponent-points-per-game": "cfb-team-opponent-points-per-game",
  "cfb-point-differential": "cfb-team-point-differential",
  "cfb-scoring-margin-per-game": "cfb-team-scoring-margin-per-game",
  "cfb-points-ratio": "cfb-team-points-for-against-ratio",
  "cfb-differential-rate-pct": "cfb-team-differential-rate-percentage",
  "cfb-total-points": "cfb-team-total-points",
  "cfb-srs": "cfb-team-srs",
  "cfb-sos": "cfb-team-sos",
  "cfb-team-season-wins": "cfb-team-wins",
  "nfl-receiving-receptions": "nfl-career-receptions",
  "nfl-receiving-yards": "nfl-career-receiving-yards",
  "nfl-receiving-touchdowns": "nfl-career-receiving-touchdowns",
  "nfl-defense-sacks": "nfl-career-sacks",
  "nfl-defense-interceptions": "nfl-career-interceptions",
  "cfb-player-rushing-yards": "cfb-best-season-rushing-yards",
  "cfb-player-rushing-touchdowns": "cfb-best-season-rushing-touchdowns",
  "cfb-team-season-losses": "cfb-team-losses",
};

export const FOOTBALL_FIND_LEADER_GAME_ID = "football-find-leader";
export const FOOTBALL_FIND_LEADER_VERSION = "football-find-leader-v2";
export const FOOTBALL_FIND_LEADER_CANDIDATE_COUNT = 10;
export const FOOTBALL_FIND_LEADER_MIN_POOL_SIZE = FOOTBALL_FIND_LEADER_CANDIDATE_COUNT + 1;
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

export interface FootballFindLeaderPoolDefinition {
  metricId: FootballFindLeaderMetricId;
  canonicalMetricId: FootballFactMetricId;
  factualScope: FootballFactScope;
  subjectQuery: FootballSubjectQuery;
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
  "nfl-qb-season": "NFL quarterback seasons",
  "nfl-team-season": "NFL team seasons",
  "nfl-receiving-career": "NFL receivers and tight ends",
  "nfl-defense-career": "NFL defenders",
  "cfb-champion-season": "national-championship team seasons",
  "cfb-team-season": "college football team seasons",
  "cfb-player-rushing": "college quarterbacks and running backs",
};

export function footballFindLeaderCategoryLabel(domainId: FootballFindLeaderDomainId) {
  if (domainId === "nfl-qb-career") return "NFL QB CAREERS";
  if (domainId === "nfl-rb-career") return "NFL RB CAREERS";
  if (domainId === "nfl-qb-season") return "NFL QB SEASONS";
  if (domainId === "nfl-team-season") return "NFL TEAM SEASONS";
  if (domainId === "nfl-receiving-career") return "NFL RECEIVING CAREERS";
  if (domainId === "nfl-defense-career") return "NFL DEFENSIVE CAREERS";
  if (domainId === "cfb-team-season") return "CFB TEAM SEASONS";
  if (domainId === "cfb-player-rushing") return "CFB RUSHING SEASONS";
  return "CFB CHAMPION SEASONS";
}

export const FOOTBALL_FIND_LEADER_FAMILY_CYCLE: readonly FootballFindLeaderFamilyId[] = [
  "qb-volume",
  "nfl-receiving",
  "cfb-offense",
  "nfl-defense",
  "rb-rushing",
  "qb-efficiency",
  "cfb-defense",
  "rb-receiving",
  "rb-scrimmage",
  "qb-season",
  "nfl-team-season",
  "cfb-strength",
  "cfb-team-season",
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

const queryByDomain: Readonly<Record<FootballFindLeaderDomainId, FootballSubjectQuery>> = {
  "nfl-qb-career": { kind: "player-career", league: "NFL", position: "QB" },
  "nfl-rb-career": { kind: "player-career", league: "NFL", position: "RB" },
  "nfl-qb-season": { kind: "player-season", league: "NFL", position: "QB" },
  "nfl-team-season": { kind: "team-season", league: "NFL" },
  "nfl-receiving-career": { kind: "player-career", league: "NFL", positions: ["WR", "TE"] },
  "nfl-defense-career": { kind: "player-career", league: "NFL", positions: ["DL", "LB", "DB"] },
  "cfb-champion-season": { kind: "team-season", league: "CFB", nationalChampion: true },
  "cfb-team-season": { kind: "team-season", league: "CFB" },
  "cfb-player-rushing": { kind: "player-career", league: "CFB", positions: ["QB", "RB"] },
};

const scopeByDomain: Readonly<Record<FootballFindLeaderDomainId, FootballFactScope>> = {
  "nfl-qb-career": "nfl-player-career",
  "nfl-rb-career": "nfl-player-career",
  "nfl-qb-season": "nfl-player-season",
  "nfl-team-season": "nfl-team-season",
  "nfl-receiving-career": "nfl-player-career",
  "nfl-defense-career": "nfl-player-career",
  "cfb-champion-season": "cfb-team-season",
  "cfb-team-season": "cfb-team-season",
  "cfb-player-rushing": "cfb-player-career",
};

/** All catalog candidates use the same canonical subject query + factual ledger path. */
const footballFindLeaderCandidatePools: readonly FootballFindLeaderPoolDefinition[] = footballFindLeaderMetricDefinitions.map((definition) => ({
  metricId: definition.id,
  canonicalMetricId: footballFindLeaderCanonicalMetricByMetric[definition.id],
  factualScope: scopeByDomain[definition.domainId],
  subjectQuery: queryByDomain[definition.domainId],
}));

function playerCareerSubtitle(subject: ReturnType<typeof queryFootballSubjects>[number]) {
  if (subject.league === "CFB") {
    return `${subject.school ?? "College football"}${subject.position ? ` · ${subject.position}` : ""}`;
  }
  if (subject.position === "QB") return "Retired NFL quarterback";
  if (subject.position === "RB") return "Retired NFL running back";
  return `NFL ${subject.position ?? "player"} career`;
}

export function footballFindLeaderMetricRows(metricId: FootballFindLeaderMetricId): ScoredRow[] {
  const definition = footballFindLeaderMetricDefinitions.find((row) => row.id === metricId);
  if (!definition) return [];
  const poolDefinition = footballFindLeaderCandidatePools.find((row) => row.metricId === metricId);
  if (!poolDefinition) return [];
  return queryFootballSubjects(poolDefinition.subjectQuery)
    .flatMap((subject) => {
      const fact = getFootballFact(subject.id, poolDefinition.canonicalMetricId);
      const record = getFootballFactualRecord(subject.id);
      if (!fact || !record || !(record.scopes ?? [record.scope]).includes(poolDefinition.factualScope)) return [];
      const subtitle = subject.kind === "player-season"
        ? `NFL quarterback season${subject.season ? ` · ${subject.season}` : ""}`
        : subject.kind === "team-season"
          ? `${subject.league} team season${subject.season ? ` · ${subject.season}` : ""}`
          : playerCareerSubtitle(subject);
      return [{ id: subject.id, name: subject.name, subtitle, value: fact.fact.value }];
    })
    .sort((left, right) => right.value - left.value || left.name.localeCompare(right.name));
}

const factMetricDefinitionById = new Map(footballFactMetricDefinitions.map((definition) => [definition.id, definition]));

export function footballFindLeaderMetricQuality(metricId: FootballFindLeaderMetricId) {
  const canonicalMetricId = footballFindLeaderCanonicalMetricByMetric[metricId];
  const factDefinition = factMetricDefinitionById.get(canonicalMetricId);
  if (!factDefinition) throw new Error(`Missing canonical Football fact definition for Find the Leader metric ${metricId}.`);
  return evaluateFootballFindLeaderQuality({
    unit: factDefinition.unit,
    values: footballFindLeaderMetricRows(metricId).map(({ value }) => value),
    minCandidates: FOOTBALL_FIND_LEADER_MIN_POOL_SIZE,
  });
}

/** The permanent PR2 quality gate is authoritative for what the game can actually surface. */
export const footballFindLeaderEnabledMetricDefinitions: readonly FootballFindLeaderMetricDefinition[] = footballFindLeaderMetricDefinitions.filter(
  (definition) => footballFindLeaderMetricQuality(definition.id).eligible,
);

export const footballFindLeaderQuestions: readonly FootballFindLeaderQuestionDefinition[] = footballFindLeaderEnabledMetricDefinitions.flatMap(questionVariants);

/** Declarative bridge from enabled game copy to the canonical registry and factual ledger. */
export const footballFindLeaderPools: readonly FootballFindLeaderPoolDefinition[] = footballFindLeaderEnabledMetricDefinitions.map((definition) => {
  const pool = footballFindLeaderCandidatePools.find((candidate) => candidate.metricId === definition.id);
  if (!pool) throw new Error(`Missing Football Find the Leader pool for ${definition.id}.`);
  return pool;
});

const footballCompetitionConfig = {
  getId: (row: ScoredRow) => row.id,
  getValue: (row: ScoredRow) => row.value,
  competitiveWindowSize: 8,
  supportEndIndex: 9,
};

export function buildFootballFindLeaderBoard(definition: FootballFindLeaderQuestionDefinition, seed: string): FootballFindLeaderBoard | null {
  const pool = footballFindLeaderMetricRows(definition.metricId);
  if (pool.length < FOOTBALL_FIND_LEADER_CANDIDATE_COUNT) return null;
  const random = seededLineupRandom(FOOTBALL_FIND_LEADER_VERSION, seed, definition.id);
  const option = selectFindLeaderCompetition(pool, random, footballCompetitionConfig);
  if (!option) return null;
  const challengers = option.challengers;
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

function lastValue(history: PlayLineupHistory, kind: "question" | "metric" | "family") {
  const prefix = `${kind}:`;
  return history.lastLineup.find((id) => id.startsWith(prefix))?.slice(prefix.length)
    ?? history.recentItemIds.find((id) => id.startsWith(prefix))?.slice(prefix.length)
    ?? null;
}

function seedOrdinal(seed: string) {
  const tail = seed.split("-").at(-1) ?? "";
  if (/^\d+$/.test(tail)) return Number.parseInt(tail.slice(-8), 10);
  if (/^[0-9a-f]+$/i.test(tail)) return Number.parseInt(tail.slice(-8), 16);
  return stableLineupHash(`${FOOTBALL_FIND_LEADER_VERSION}|ordinal|${seed}`);
}

function targetLeague(ordinal: number): FootballFindLeaderLeagueId {
  return ordinal % 2 === 0 ? "nfl" : "cfb";
}

const nflDomainCycle: readonly FootballFindLeaderDomainId[] = [
  "nfl-receiving-career",
  "nfl-qb-career",
  "nfl-defense-career",
  "nfl-rb-career",
  "nfl-qb-season",
  "nfl-receiving-career",
  "nfl-defense-career",
  "nfl-team-season",
  "nfl-qb-career",
  "nfl-rb-career",
] as const;

const cfbDomainCycle: readonly FootballFindLeaderDomainId[] = [
  "cfb-champion-season",
  "cfb-champion-season",
  "cfb-team-season",
  "cfb-champion-season",
  "cfb-champion-season",
  "cfb-champion-season",
  "cfb-champion-season",
  "cfb-team-season",
  "cfb-champion-season",
  "cfb-champion-season",
] as const;

function chooseQuestion(seed: string, history: PlayLineupHistory) {
  const ordinal = seedOrdinal(seed);
  const desiredLeague = targetLeague(ordinal);
  const leagueOrdinal = Math.floor(ordinal / 2);
  const domainCycle = desiredLeague === "nfl" ? nflDomainCycle : cfbDomainCycle;
  const targetIndex = leagueOrdinal % domainCycle.length;
  const previousQuestion = lastValue(history, "question");
  const previousMetric = lastValue(history, "metric");
  const previousFamily = lastValue(history, "family");

  for (let offset = 0; offset < domainCycle.length; offset += 1) {
    const domainId = domainCycle[(targetIndex + offset) % domainCycle.length]!;
    const domainQuestions = footballFindLeaderQuestions.filter((question) => question.domainId === domainId);
    if (domainQuestions.length === 0) continue;
    const start = stableLineupHash(`${FOOTBALL_FIND_LEADER_VERSION}|question|${seed}|${domainId}`) % domainQuestions.length;
    const rotated = domainQuestions.map((_, index) => domainQuestions[(start + index) % domainQuestions.length]!);
    const fresh = rotated.find((question) => (
      question.id !== previousQuestion
      && question.metricId !== previousMetric
      && question.family !== previousFamily
    ));
    if (fresh) return fresh;
  }

  throw new Error(`Football Find the Leader has no eligible ${desiredLeague.toUpperCase()} question after replay filtering.`);
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
  const validItemIds = new Set<string>(footballSubjects.map((subject) => subject.id));
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
  return formatFootballFact(footballFindLeaderCanonicalMetricByMetric[board.metricId], value);
}

export function footballFindLeaderCompetitionAudit() {
  return footballFindLeaderQuestions.map((definition) => {
    const pool = footballFindLeaderMetricRows(definition.metricId);
    const board = buildFootballFindLeaderBoard(definition, `audit|${definition.id}`);
    const nonRecordLeaderAvailable = viableCompetitiveLeaders(pool, footballCompetitionConfig, true).length > 0;
    const globalLeaderId = pool[0]?.id ?? null;
    if (!board) return { definitionId: definition.id, boardValid: false, nonRecordLeaderAvailable, leaderIsGlobalMax: false, nearContenderCount: 0, outsideClosestNineCount: 0 };
    const leader = pool.find((row) => row.id === board.leaderId)!;
    const lower = pool.filter((row) => row.value < leader.value);
    const closestNineCutoff = lower[8]?.value ?? Number.NEGATIVE_INFINITY;
    const closestNine = new Set(lower.filter((row) => row.value >= closestNineCutoff).map((row) => row.id));
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

export function footballFindLeaderReplayAudit(sampleSize = 1000) {
  const emptyHistory: PlayLineupHistory = { entries: [], recentItemIds: [], recentFighterIds: [], lastLineup: [] };
  const unorderedBoards = new Set<string>();
  const metrics = new Set<FootballFindLeaderMetricId>();
  const families = new Set<FootballFindLeaderFamilyId>();
  const definitions = new Set<string>();
  const subjects = new Set<string>();
  const cfbSubjects = new Set<string>();
  const domainCounts = new Map<FootballFindLeaderDomainId, number>();
  const familyCounts = new Map<FootballFindLeaderFamilyId, number>();
  let cfbBoards = 0;
  for (let index = 0; index < sampleSize; index += 1) {
    const board = createFootballFindLeaderBoard(`replay-audit-${index}`, emptyHistory);
    if (footballFindLeaderLeagueForDomain(board.domainId) === "cfb") cfbBoards += 1;
    metrics.add(board.metricId);
    families.add(board.family);
    definitions.add(board.definitionId);
    domainCounts.set(board.domainId, (domainCounts.get(board.domainId) ?? 0) + 1);
    familyCounts.set(board.family, (familyCounts.get(board.family) ?? 0) + 1);
    board.candidates.forEach((candidate) => {
      subjects.add(candidate.id);
      if (footballFindLeaderLeagueForDomain(board.domainId) === "cfb") cfbSubjects.add(candidate.id);
    });
    unorderedBoards.add(`${board.metricId}|${board.candidates.map((candidate) => candidate.id).sort().join(",")}`);
  }
  return {
    sampleSize,
    cfbShare: sampleSize ? cfbBoards / sampleSize : 0,
    uniqueUnorderedBoardShare: sampleSize ? unorderedBoards.size / sampleSize : 0,
    metricsSeen: metrics.size,
    familiesSeen: families.size,
    definitionsSeen: definitions.size,
    subjectsSeen: subjects.size,
    cfbSubjectsSeen: cfbSubjects.size,
    domainShare: Object.fromEntries([...domainCounts].map(([id, count]) => [id, count / sampleSize])),
    familyShare: Object.fromEntries([...familyCounts].map(([id, count]) => [id, count / sampleSize])),
  };
}
