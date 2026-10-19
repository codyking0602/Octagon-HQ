import {
  createReplaySeed, dailyLineupIdentity, dailyLineupSeed, loadLineupHistory,
  rememberLineup, replayLineupIdentity, seededLineupRandom, selectReplayLineup,
  shuffleLineup, stableLineupHash, type PlayLineupHistory, type PlayLineupIdentity,
} from "../play/lineupModel";
import { selectFindLeaderCompetition } from "../play/findLeaderCompetition";
import { nbaHitHeadshot, nbaHitSubjects, type NbaHitSubject } from "./nbaHitTheNumberStats";
import { NBA_FIND_HISTORICAL_SEASONS } from "./nbaFindTheLeaderHistoricalSeasons";

export const NBA_FIND_LEADER_GAME_ID = "nba-find-leader";
export const NBA_FIND_LEADER_VERSION = "nba-find-leader-v1";
export type NbaLeaderMetric = "points" | "assists" | "rebounds";
export type NbaLeaderScope = "career" | "season";
export interface NbaLeaderSubject {
  id: string;
  name: string;
  season: number | null;
  seasonLabel?: string;
  subtitle: string;
  games: number | null;
  role: "G" | "F" | "C" | null;
  nbaId: number | null;
  values: Readonly<Record<NbaLeaderMetric, number>>;
}
export interface NbaLeaderDefinition {
  id: string;
  metric: NbaLeaderMetric;
  scope: NbaLeaderScope;
  group: string;
  category: string;
  question: string;
  context: string;
  shortLabel: string;
}
export interface NbaLeaderCandidate {
  id: string;
  name: string;
  displayName: string;
  season?: number;
  seasonLabel?: string;
  subtitle: string;
  value: number;
  nbaId: number | null;
}
export interface NbaLeaderBoard {
  version: typeof NBA_FIND_LEADER_VERSION;
  definitionId: string;
  question: string;
  context: string;
  categoryLabel: string;
  statLabel: string;
  shortLabel: string;
  leaderId: string;
  leaderValue: number;
  candidates: NbaLeaderCandidate[];
}
export interface NbaLeaderRun { board: NbaLeaderBoard; identity: PlayLineupIdentity; }

function seasonLabel(endYear: number) {
  return String(endYear - 1) + "–" + String(endYear).slice(-2);
}
function normalizedName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
const currentByName = new Map<string, NbaHitSubject>();
for (const subject of nbaHitSubjects) {
  if (!currentByName.has(normalizedName(subject.name)) || subject.nbaId != null) currentByName.set(normalizedName(subject.name), subject);
}
const historical: NbaLeaderSubject[] = NBA_FIND_HISTORICAL_SEASONS.map(([year, name, games, points, rebounds, assists, id]) => ({
  id: "season:" + year + ":" + normalizedName(name), name, season: year, seasonLabel: seasonLabel(year),
  subtitle: seasonLabel(year) + " regular season · " + games + " GP",
  games, role: currentByName.get(normalizedName(name))?.role ?? null,
  nbaId: id ?? currentByName.get(normalizedName(name))?.nbaId ?? null,
  values: { points, rebounds, assists },
}));
const recent: NbaLeaderSubject[] = nbaHitSubjects.filter(s => s.scope === "season").flatMap(s => {
  const games = Number(s.subtitle.match(/(\d+) GP/)?.[1] ?? 0);
  if (games < 45 || s.season == null) return [];
  return [{
    id: "season:" + s.season + ":" + normalizedName(s.name), name: s.name, season: s.season,
    seasonLabel: seasonLabel(s.season), subtitle: seasonLabel(s.season) + " regular season · " + games + " GP",
    games, role: s.role, nbaId: s.nbaId, values: s.values,
  }];
});
const careers: NbaLeaderSubject[] = nbaHitSubjects.filter(s => s.scope === "career").map(s => ({
  id: "career:" + normalizedName(s.name), name: s.name, season: null,
  subtitle: "NBA regular-season career", games: null,
  role: s.role, nbaId: s.nbaId, values: s.values,
}));
export const nbaFindLeaderSubjects: readonly NbaLeaderSubject[] = [...historical, ...recent, ...careers];
export const nbaFindLeaderById = new Map(nbaFindLeaderSubjects.map(s => [s.id, s]));
const metricLabels: Record<NbaLeaderMetric, string> = { points: "points", rebounds: "rebounds", assists: "assists" };
const metricShort: Record<NbaLeaderMetric, string> = { points: "PPG", rebounds: "RPG", assists: "APG" };
const years = [...new Set([...historical, ...recent].map(s => s.season!).sort((a,b) => a-b))];
const eraGroups: readonly { id: string; label: string; years: readonly number[] }[] = [
  { id: "classic", label: "1970s & 1980s", years: [1972, 1977, 1982, 1988] },
  { id: "nineties", label: "1990s", years: [1993, 1996] },
  { id: "millennium", label: "2000s", years: [2001, 2006] },
  { id: "twenty-tens", label: "2010s", years: [2011, 2014, 2017] },
  { id: "recent", label: "Recent seasons", years: [2025, 2026] },
];
function definition(metric: NbaLeaderMetric, scope: NbaLeaderScope, group: string, category: string): NbaLeaderDefinition {
  const stat = metricLabels[metric], shortLabel = metricShort[metric];
  const context = scope === "career"
    ? "Highest NBA regular-season career " + shortLabel + " among the ten shown. The all-time record holder does not have to appear."
    : "Highest single-season NBA regular-season " + shortLabel + " among these ten player-seasons. Each year is shown on its card.";
  return {
    id: scope + ":" + group + ":" + metric, metric, scope, group, category,
    question: scope === "career" ? "Who averaged the most " + stat + " per game in their NBA career?"
      : "Which player-season averaged the most " + stat + " per game?",
    context, shortLabel,
  };
}
const metrics: readonly NbaLeaderMetric[] = ["points", "assists", "rebounds"];
export const NBA_FIND_LEADER_DEFINITIONS: readonly NbaLeaderDefinition[] = [
  ...metrics.flatMap(m => [
    definition(m, "career", "all", "NBA CAREER AVERAGES"),
    definition(m, "career", "guards", "GUARD CAREERS"),
    definition(m, "career", "frontcourt", "FRONTCOURT CAREERS"),
  ]),
  ...years.flatMap(year => metrics.map(m => definition(m, "season", String(year), seasonLabel(year).toUpperCase() + " NBA SEASON"))),
  ...eraGroups.flatMap(era => metrics.map(m => definition(m, "season", era.id, era.label.toUpperCase()))),
];
function subjectsFor(def: NbaLeaderDefinition, seed: string): NbaLeaderSubject[] {
  if (def.scope === "career") return careers.filter(s => def.group === "all" || (def.group === "guards" ? s.role === "G" : s.role !== "G"));
  const era = eraGroups.find(g => g.id === def.group);
  const included = era ? era.years : [Number(def.group)];
  const source = [...historical, ...recent].filter(s => s.season != null && included.includes(s.season));
  if (!era) return source;
  // One historically real season per person, even in cross-era boards.
  const grouped = new Map<string, NbaLeaderSubject[]>();
  for (const subject of source) {
    const key = normalizedName(subject.name);
    grouped.set(key, [...(grouped.get(key) ?? []), subject]);
  }
  return [...grouped.values()].map(options => options[stableLineupHash(seed + "|" + def.id + "|" + options[0]!.name) % options.length]!);
}
function validBoard(leader: NbaLeaderCandidate, candidates: readonly NbaLeaderCandidate[]): boolean {
  if (candidates.length !== 10 || new Set(candidates.map(c => c.id)).size !== 10 ||
      new Set(candidates.map(c => normalizedName(c.name))).size !== 10) return false;
  const values = candidates.map(c => c.value);
  if (values.some(v => !Number.isFinite(v)) || new Set(values).size < 6) return false;
  if (values.filter(v => v === leader.value).length !== 1 || values.some(v => v > leader.value)) return false;
  const runnerUp = Math.max(...values.filter(v => v < leader.value));
  const spread = leader.value - Math.min(...values);
  if (!(spread > 0) || (leader.value - runnerUp) / spread > 0.42) return false;
  // If the top candidates are not realistically competing, the board is guessing, not basketball knowledge.
  return values.filter(v => v >= leader.value - spread * 0.55).length >= 4;
}
export function buildNbaFindLeaderBoard(def: NbaLeaderDefinition, seed: string): NbaLeaderBoard | null {
  const candidates = subjectsFor(def, seed);
  if (candidates.length < 11) return null;
  const sorted = [...candidates].sort((a,b) => b.values[def.metric] - a.values[def.metric] || a.id.localeCompare(b.id));
  const getValue = (s: NbaLeaderSubject) => s.values[def.metric];
  for (let attempt = 0; attempt < 24; attempt++) {
    const random = seededLineupRandom(NBA_FIND_LEADER_VERSION, seed, def.id, attempt);
    const option = selectFindLeaderCompetition(sorted, random, {
      getId: s => s.id, getValue, competitiveWindowSize: 8, supportEndIndex: 9,
      leaderScoreAdjustment: (leader, nearest) => {
        const spread = getValue(leader) - getValue(nearest[nearest.length-1]!);
        return spread <= 0 ? 1 : Math.abs((getValue(leader)-getValue(nearest[0]!))/spread-0.15)*1.5;
      },
    });
    if (!option || option.challengers.length !== 9) return null;
    const selected = shuffleLineup([option.leader, ...option.challengers], random);
    const rows: NbaLeaderCandidate[] = selected.map(s => ({
      id: s.id, name: s.name, displayName: s.name,
      ...(s.season != null ? { season: s.season, seasonLabel: s.seasonLabel } : {}),
      subtitle: s.subtitle, value: getValue(s), nbaId: s.nbaId,
    }));
    const leader = rows.find(r => r.id === option.leader.id)!;
    if (!validBoard(leader, rows)) continue;
    return {
      version: NBA_FIND_LEADER_VERSION, definitionId: def.id, question: def.question,
      context: def.context, categoryLabel: def.category, statLabel: metricLabels[def.metric] + " per game",
      shortLabel: def.shortLabel, leaderId: leader.id, leaderValue: leader.value, candidates: rows,
    };
  }
  return null;
}
export function createNbaFindLeaderBoard(seed: string, history?: PlayLineupHistory): NbaLeaderBoard {
  const previous = history?.lastLineup?.find(id => id.startsWith("question:"))?.slice(9) ?? "";
  const random = seededLineupRandom(NBA_FIND_LEADER_VERSION, seed, "definitions");
  const candidates = shuffleLineup(NBA_FIND_LEADER_DEFINITIONS, random);
  const eligible = candidates.filter(def => def.id !== previous);
  for (const def of [...eligible, ...candidates.filter(d => d.id === previous)]) {
    const board = buildNbaFindLeaderBoard(def, seed);
    if (board) return board;
  }
  throw new Error("NBA Find the Leader could not build a qualified board.");
}
export function createNbaFindLeaderRun(): NbaLeaderRun {
  const selected = selectReplayLineup({
    gameId: NBA_FIND_LEADER_GAME_ID, scopeId: "casual", lineupSize: 13, attempts: 18,
    build: (seed, _attempt, history) => {
      const board = createNbaFindLeaderBoard(seed, history);
      return { value: board, itemIds: [
        "question:" + board.definitionId, "metric:" + board.shortLabel,
        "family:" + board.categoryLabel, ...board.candidates.map(c => c.id),
      ] };
    },
  });
  return { board: selected.value, identity: selected.identity };
}
export function createNbaFindLeaderDailyPreview(day: string): NbaLeaderRun {
  const identity = dailyLineupIdentity(NBA_FIND_LEADER_GAME_ID, day, "owner-preview");
  const board = createNbaFindLeaderBoard(dailyLineupSeed(day));
  rememberLineup(identity, ["question:" + board.definitionId, "metric:" + board.shortLabel,
    "family:" + board.categoryLabel, ...board.candidates.map(c => c.id)]);
  return { board, identity };
}
export function createNbaFindLeaderChallenge(seed: string, definitionId: string, challengeId: string): NbaLeaderRun | null {
  const def = NBA_FIND_LEADER_DEFINITIONS.find(d => d.id === definitionId);
  const board = def && buildNbaFindLeaderBoard(def, seed);
  if (!board) return null;
  return { board, identity: { ...replayLineupIdentity(NBA_FIND_LEADER_GAME_ID, seed, "challenge"),
    type: "curated", challengeId: NBA_FIND_LEADER_GAME_ID + ":challenge:" + challengeId,
    replayBehavior: "same-curated-challenge" } };
}
export function nbaFindLeaderHeadshot(candidate: Pick<NbaLeaderCandidate,"name"|"nbaId">) {
  const id = candidate.nbaId ?? currentByName.get(normalizedName(candidate.name))?.nbaId ?? null;
  return id == null ? null : "https://cdn.nba.com/headshots/nba/latest/1040x760/" + id + ".png";
}
export function formatNbaFindLeaderValue(value: number) { return value.toFixed(1); }
export function nbaFindLeaderAudit(sampleSize = 300) {
  const definitionCounts = new Map<string,number>(), seen = new Set<string>();
  let invalid = 0;
  for (let i=0; i<sampleSize; i++) {
    const board = createNbaFindLeaderBoard("nba-audit-" + i);
    definitionCounts.set(board.definitionId, (definitionCounts.get(board.definitionId)??0)+1);
    if (!validBoard(board.candidates.find(c=>c.id===board.leaderId)!,board.candidates)) invalid++;
    seen.add(board.definitionId + "|" + board.candidates.map(c=>c.id).sort().join(","));
  }
  return { invalid, uniqueBoards: seen.size, definitions: definitionCounts.size };
}
