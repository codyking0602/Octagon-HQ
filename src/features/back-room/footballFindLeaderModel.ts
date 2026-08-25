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
  footballFindLeaderLeagueForDomain,
  footballFindLeaderMetricDefinitions,
  footballFindLeaderSubjects,
  formatFootballFact,
  getFootballFact,
  type FootballFactMetricId,
  type FootballFindLeaderDomainId,
  type FootballFindLeaderFamilyId,
  type FootballFindLeaderLeagueId,
  type FootballFindLeaderMetricDefinition,
  type FootballFindLeaderMetricId,
} from "./footballFactualStats";

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
};

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

export function footballFindLeaderMetricRows(metricId: FootballFindLeaderMetricId): ScoredRow[] {
  const definition = footballFindLeaderMetricDefinitions.find((row) => row.id === metricId);
  if (!definition) return [];
  return footballFindLeaderSubjects
    .filter((subject) => subject.domainId === definition.domainId)
    .flatMap((subject) => {
      const fact = getFootballFact(subject.id, footballFindLeaderCanonicalMetricByMetric[metricId]);
      return fact ? [{ id: subject.id, name: subject.name, subtitle: subject.subtitle, value: fact.fact.value }] : [];
    })
    .sort((left, right) => right.value - left.value || left.name.localeCompare(right.name));
}

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

function chooseQuestion(seed: string, history: PlayLineupHistory) {
  const ordinal = seedOrdinal(seed);
  const desiredLeague = targetLeague(ordinal);
  const leagueQuestions = footballFindLeaderQuestions.filter(
    (question) => footballFindLeaderLeagueForDomain(question.domainId) === desiredLeague,
  );
  const start = Math.floor(ordinal / 2) % leagueQuestions.length;
  const rotated = leagueQuestions.map((_, index) => leagueQuestions[(start + index) % leagueQuestions.length]!);
  const previousQuestion = lastValue(history, "question");
  const previousMetric = lastValue(history, "metric");
  const previousFamily = lastValue(history, "family");
  return rotated.find((question) => (
    question.id !== previousQuestion
    && question.metricId !== previousMetric
    && question.family !== previousFamily
  )) ?? rotated[0]!;
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
  const validItemIds = new Set<string>(footballFindLeaderSubjects.map((subject) => subject.id));
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

export function footballFindLeaderReplayAudit(sampleSize = 1000) {
  const emptyHistory: PlayLineupHistory = { entries: [], recentItemIds: [], recentFighterIds: [], lastLineup: [] };
  const unorderedBoards = new Set<string>();
  const metrics = new Set<FootballFindLeaderMetricId>();
  const families = new Set<FootballFindLeaderFamilyId>();
  let cfbBoards = 0;
  for (let index = 0; index < sampleSize; index += 1) {
    const board = createFootballFindLeaderBoard(`replay-audit-${index}`, emptyHistory);
    if (footballFindLeaderLeagueForDomain(board.domainId) === "cfb") cfbBoards += 1;
    metrics.add(board.metricId);
    families.add(board.family);
    unorderedBoards.add(`${board.metricId}|${board.candidates.map((candidate) => candidate.id).sort().join(",")}`);
  }
  return {
    sampleSize,
    cfbShare: sampleSize ? cfbBoards / sampleSize : 0,
    uniqueUnorderedBoardShare: sampleSize ? unorderedBoards.size / sampleSize : 0,
    metricsSeen: metrics.size,
    familiesSeen: families.size,
  };
}
