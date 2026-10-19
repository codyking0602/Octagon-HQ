import {
  dailyLineupIdentity,
  rememberLineup,
  seededLineupRandom,
  selectReplayLineup,
  shuffleLineup,
  stableLineupHash,
  type PlayLineupHistory,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import { selectFindLeaderCompetition } from "../play/findLeaderCompetition";
import {
  NBA_HIT_STAT_CATALOG,
  nbaHitHeadshot,
  nbaHitSubjectsFor,
  nbaHitValue,
  type NbaHitMetric,
  type NbaHitStat,
  type NbaHitSubject,
} from "./nbaHitTheNumberStats";

export const NBA_FIND_LEADER_GAME_ID = "nba-find-leader";
export const NBA_FIND_LEADER_VERSION = "nba-find-leader-v1" as const;
export const NBA_FIND_LEADER_CANDIDATE_COUNT = 10;
export const NBA_FIND_LEADER_MAX_RETRIES = 20;

type NbaScope = "career" | "season";
type NbaThemeId =
  | "career-all" | "career-classic" | "career-modern" | "career-guards" | "career-frontcourt"
  | "season-2025" | "season-2025-guards" | "season-2025-frontcourt"
  | "season-2026" | "season-2026-guards" | "season-2026-frontcourt";

interface NbaTheme {
  id: NbaThemeId;
  scope: NbaScope;
  label: string;
  population: (subject: NbaHitSubject) => boolean;
  season?: number;
}

const classic = new Set([
  "Bill Russell", "Wilt Chamberlain", "Oscar Robertson", "Jerry West", "Kareem Abdul-Jabbar",
  "Magic Johnson", "Larry Bird", "Isiah Thomas", "Moses Malone", "Julius Erving",
  "Michael Jordan", "Charles Barkley", "Karl Malone", "John Stockton", "Patrick Ewing",
  "Hakeem Olajuwon", "David Robinson", "Dominique Wilkins", "Clyde Drexler", "Reggie Miller",
  "Shaquille O'Neal",
]);
const modern = new Set([
  "Michael Jordan", "Shaquille O'Neal", "Kobe Bryant", "Tim Duncan", "Kevin Garnett",
  "Dirk Nowitzki", "Allen Iverson", "Dwyane Wade", "Steve Nash", "Ray Allen",
  "Reggie Miller", "Paul Pierce", "Vince Carter", "Carmelo Anthony", "Chris Bosh",
  "Dwight Howard", "Hakeem Olajuwon", "Charles Barkley", "David Robinson", "Karl Malone",
  "Patrick Ewing", "Dominique Wilkins", "Clyde Drexler",
]);
const career = (s: NbaHitSubject) => s.scope === "career";
const season = (year: number) => (s: NbaHitSubject) => s.scope === "season" && s.season === year;
const nbaThemes: readonly NbaTheme[] = [
  { id: "career-all", scope: "career", label: "NBA CAREER GREATS", population: career },
  { id: "career-classic", scope: "career", label: "CLASSIC NBA LEGENDS", population: s => career(s) && classic.has(s.name) },
  { id: "career-modern", scope: "career", label: "MODERN-ERA LEGENDS", population: s => career(s) && modern.has(s.name) },
  { id: "career-guards", scope: "career", label: "NBA GUARD CAREERS", population: s => career(s) && s.role === "G" },
  { id: "career-frontcourt", scope: "career", label: "NBA FRONTCOURT CAREERS", population: s => career(s) && s.role !== "G" },
  { id: "season-2025", scope: "season", season: 2025, label: "2024–25 NBA SEASON", population: season(2025) },
  { id: "season-2025-guards", scope: "season", season: 2025, label: "2024–25 NBA GUARDS", population: s => season(2025)(s) && s.role === "G" },
  { id: "season-2025-frontcourt", scope: "season", season: 2025, label: "2024–25 NBA FRONTCOURT", population: s => season(2025)(s) && s.role !== "G" },
  { id: "season-2026", scope: "season", season: 2026, label: "2025–26 NBA SEASON", population: season(2026) },
  { id: "season-2026-guards", scope: "season", season: 2026, label: "2025–26 NBA GUARDS", population: s => season(2026)(s) && s.role === "G" },
  { id: "season-2026-frontcourt", scope: "season", season: 2026, label: "2025–26 NBA FRONTCOURT", population: s => season(2026)(s) && s.role !== "G" },
];

const metricCopy: Readonly<Record<NbaHitMetric, { long: string; short: string }>> = {
  points: { long: "points", short: "PPG" },
  assists: { long: "assists", short: "APG" },
  rebounds: { long: "rebounds", short: "RPG" },
};

export interface NbaFindLeaderDefinition {
  id: string;
  themeId: NbaThemeId;
  metricId: NbaHitStat;
  question: string;
  categoryLabel: string;
  statLabel: string;
  shortLabel: string;
  family: NbaHitMetric;
  season?: number;
}
export interface NbaFindLeaderCandidate {
  id: string;
  name: string;
  displayName: string;
  season?: string;
  subtitle: string;
  value: number;
}
export interface NbaFindLeaderBoard {
  version: typeof NBA_FIND_LEADER_VERSION;
  definitionId: string;
  metricId: NbaHitStat;
  question: string;
  context: string;
  categoryLabel: string;
  statLabel: string;
  shortLabel: string;
  family: NbaHitMetric;
  leaderId: string;
  leaderValue: number;
  candidates: NbaFindLeaderCandidate[];
}
export interface NbaFindLeaderRun {
  board: NbaFindLeaderBoard;
  identity: PlayLineupIdentity;
}
type Row = { id: string; name: string; value: number; subject: NbaHitSubject };

function seasonLabel(year: number) {
  return String(year - 1) + "–" + String(year).slice(-2);
}
function definitionFor(theme: NbaTheme, metricId: NbaHitStat): NbaFindLeaderDefinition {
  const family = metricId.split("-")[1] as NbaHitMetric;
  const metric = metricCopy[family];
  const descriptor = theme.id.endsWith("guards") ? " among these guards"
    : theme.id.endsWith("frontcourt") ? " among these frontcourt players"
    : theme.id === "career-classic" ? " among these classic NBA legends"
    : theme.id === "career-modern" ? " among these modern-era NBA greats" : " among these players";
  const question = theme.season
    ? "Who averaged the most " + metric.long + " per game in the " + seasonLabel(theme.season) + " NBA regular season" + descriptor + "?"
    : "Who has the highest NBA regular-season career " + metric.long + "-per-game average" + descriptor + "?";
  return {
    id: theme.id + ":" + metricId,
    themeId: theme.id,
    metricId,
    question,
    categoryLabel: theme.label,
    statLabel: (theme.season ? seasonLabel(theme.season) + " regular-season " : "NBA career regular-season ") + metric.long + " per game",
    shortLabel: metric.short,
    family,
    ...(theme.season ? { season: theme.season } : {}),
  };
}
export const nbaFindLeaderDefinitions: readonly NbaFindLeaderDefinition[] = nbaThemes.flatMap(theme =>
  NBA_HIT_STAT_CATALOG.filter(metric => metric.scope === theme.scope).map(metric => definitionFor(theme, metric.id)),
);
export const nbaFindLeaderDefinitionById = new Map(nbaFindLeaderDefinitions.map(row => [row.id, row]));

export function nbaFindLeaderRows(definition: NbaFindLeaderDefinition): Row[] {
  const theme = nbaThemes.find(row => row.id === definition.themeId);
  if (!theme) return [];
  return nbaHitSubjectsFor(definition.metricId, theme.season).filter(theme.population)
    .map(subject => ({ id: subject.id, name: subject.name, value: nbaHitValue(subject, definition.metricId), subject }))
    .filter(row => Number.isFinite(row.value) && row.value > 0)
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

const nbaCompetitionConfig = {
  getId: (row: Row) => row.id,
  getValue: (row: Row) => row.value,
  competitiveWindowSize: 8,
  supportEndIndex: 9,
  scoreWindow: 0.16,
  leaderScoreAdjustment: (leader: Row, nearest: readonly Row[]) => {
    const spread = leader.value - (nearest.at(-1)?.value ?? leader.value);
    const gap = leader.value - (nearest[0]?.value ?? leader.value);
    return spread > 0 ? Math.abs(gap / spread - 0.16) * 1.6 : 1;
  },
};

export function nbaFindLeaderBoardQuality(board: NbaFindLeaderBoard) {
  const sorted = [...board.candidates].sort((a, b) => b.value - a.value);
  const values = sorted.map(row => row.value);
  const spread = values[0]! - values[9]!;
  const runnerUpGapShare = spread > 0 ? (values[0]! - values[1]!) / spread : 1;
  const closeCount = spread > 0 ? values.filter(value => value >= values[0]! - spread * 0.42).length : 0;
  const distinctValueCount = new Set(values).size;
  const uniquePlayers = new Set(board.candidates.map(candidate => candidate.displayName)).size === 10;
  return {
    eligible: uniquePlayers && distinctValueCount >= 7 && spread > 0
      && runnerUpGapShare > 0 && runnerUpGapShare <= 0.42
      && closeCount >= 3 && values[9]! >= values[0]! * 0.2
      && sorted[0]!.id === board.leaderId,
    runnerUpGapShare, closeCount, distinctValueCount, uniquePlayers, spread,
  };
}

function candidateFor(row: Row): NbaFindLeaderCandidate {
  const endYear = row.subject.season;
  const label = endYear == null ? null : seasonLabel(endYear);
  return {
    id: row.id,
    name: label == null ? row.name : row.name + " " + label,
    displayName: row.name,
    ...(label == null ? {} : { season: label }),
    subtitle: row.subject.subtitle,
    value: row.value,
  };
}
export function buildNbaFindLeaderBoard(definition: NbaFindLeaderDefinition, seed: string): NbaFindLeaderBoard | null {
  const rows = nbaFindLeaderRows(definition);
  if (rows.length < 12) return null;
  for (let attempt = 0; attempt < NBA_FIND_LEADER_MAX_RETRIES; attempt += 1) {
    const random = seededLineupRandom(NBA_FIND_LEADER_VERSION, definition.id, seed, attempt);
    const selected = selectFindLeaderCompetition(rows, random, nbaCompetitionConfig);
    if (!selected || selected.challengers.length !== 9) continue;
    const candidates = shuffleLineup([selected.leader, ...selected.challengers].map(candidateFor), random);
    const board: NbaFindLeaderBoard = {
      version: NBA_FIND_LEADER_VERSION,
      definitionId: definition.id,
      metricId: definition.metricId,
      question: definition.question,
      context: "Highest " + definition.statLabel + " among the ten players shown. NBA regular season only; the overall record holder does not have to appear.",
      categoryLabel: definition.categoryLabel,
      statLabel: definition.statLabel,
      shortLabel: definition.shortLabel,
      family: definition.family,
      leaderId: selected.leader.id,
      leaderValue: selected.leader.value,
      candidates,
    };
    if (nbaFindLeaderBoardQuality(board).eligible) return board;
  }
  return null;
}
const REPLAY_SIZE = 13;
function orderedDefinitions(seed: string, previous: PlayLineupHistory) {
  const last = previous.lastLineup;
  const family = last.find(row => row.startsWith("family:"))?.slice(7);
  const theme = last.find(row => row.startsWith("theme:"))?.slice(6);
  return [...nbaFindLeaderDefinitions].sort((a, b) => {
    const aPenalty = (a.family === family ? 2 : 0) + (a.categoryLabel === theme ? 2 : 0);
    const bPenalty = (b.family === family ? 2 : 0) + (b.categoryLabel === theme ? 2 : 0);
    return aPenalty - bPenalty || stableLineupHash(seed + "|" + a.id) - stableLineupHash(seed + "|" + b.id);
  });
}
export function createNbaFindLeaderBoard(seed: string, history: PlayLineupHistory = { entries: [], recentItemIds: [], recentFighterIds: [], lastLineup: [] }) {
  for (const definition of orderedDefinitions(seed, history)) {
    const board = buildNbaFindLeaderBoard(definition, seed);
    if (board) return board;
  }
  throw new Error("NBA Find the Leader could not build a ten-player competitive board.");
}
export function createNbaFindLeaderRun(): NbaFindLeaderRun {
  const selected = selectReplayLineup({
    gameId: NBA_FIND_LEADER_GAME_ID,
    scopeId: "casual",
    lineupSize: REPLAY_SIZE,
    attempts: 18,
    build: (seed, _attempt, history) => {
      const board = createNbaFindLeaderBoard(seed, history);
      return {
        value: board,
        itemIds: ["question:" + board.definitionId, "family:" + board.family, "theme:" + board.categoryLabel,
          ...board.candidates.map(candidate => candidate.id)],
        fighterIds: board.candidates.map(candidate => candidate.id),
      };
    },
  });
  return { board: selected.value, identity: selected.identity };
}

export function nbaFindLeaderChicagoDay(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const value = (key: string) => parts.find(part => part.type === key)?.value ?? "";
  return value("year") + "-" + value("month") + "-" + value("day");
}
export function createNbaFindLeaderDailyPreviewRun(day = nbaFindLeaderChicagoDay()): NbaFindLeaderRun {
  const seed = "nba-owner-preview-daily|" + day;
  const ordered = [...nbaFindLeaderDefinitions].sort((a, b) =>
    stableLineupHash(seed + "|" + a.id) - stableLineupHash(seed + "|" + b.id));
  for (const definition of ordered) {
    const board = buildNbaFindLeaderBoard(definition, seed);
    if (board) {
      const identity = dailyLineupIdentity(NBA_FIND_LEADER_GAME_ID, day, "owner-preview");
      rememberLineup(identity, ["question:" + board.definitionId, ...board.candidates.map(candidate => candidate.id)]);
      return { board, identity };
    }
  }
  throw new Error("NBA Find the Leader could not generate today's preview.");
}
export function nbaFindLeaderHeadshot(id: string): string | null {
  const subject = nbaHitSubjectsFor("career-points").find(row => row.id === id)
    ?? nbaHitSubjectsFor("season-points").find(row => row.id === id);
  return subject ? nbaHitHeadshot(subject) : null;
}
export function nbaFindLeaderReplayAudit(sampleSize = 1000) {
  const definitions = new Set<string>();
  const metrics = new Set<string>();
  const subjects = new Set<string>();
  const uniqueBoards = new Set<string>();
  let invalid = 0;
  for (let i = 0; i < sampleSize; i += 1) {
    const board = createNbaFindLeaderBoard("nba-find-leader-audit-" + i);
    definitions.add(board.definitionId);
    metrics.add(board.metricId);
    board.candidates.forEach(row => subjects.add(row.id));
    uniqueBoards.add(board.definitionId + "|" + board.candidates.map(row => row.id).sort().join(","));
    if (!nbaFindLeaderBoardQuality(board).eligible) invalid += 1;
  }
  return {
    sampleSize, invalid, definitions: definitions.size, metrics: metrics.size, subjects: subjects.size,
    uniqueBoardShare: uniqueBoards.size / sampleSize,
  };
}
