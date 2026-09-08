import cfbPlayerSeasonsJson from "../../../data/generated/football/cfb/player-seasons-2014-2025.json";
import cfbCoachSeasonsJson from "../../../data/generated/football/relationships/cfb-coach-seasons-2002-2025.json";
import cfbTeamSeasonsJson from "../../../data/generated/football/relationships/cfb-team-season-results-2002-2025.json";
import nflPlayerSeasonsJson from "../../../data/generated/football/nfl/player-seasons-1999-2025.json";
import nflCoachSeasonsJson from "../../../data/generated/football/relationships/nfl-coach-seasons-1999-2025.json";
import type { FootballSourceIdentityKey } from "./footballSubjectEligibility";
import { footballHistoricalConferenceForProgram } from "./footballTeamSchoolMetadata";

interface ColumnarTable {
  columns: readonly string[];
  rows: readonly (readonly unknown[])[];
}

interface AffiliationSubject {
  id: string;
  kind: string;
  league: "NFL" | "CFB";
  name: string;
  school?: string;
  startSeason?: number;
  endSeason?: number;
  sourceIdentityKeys?: readonly FootballSourceIdentityKey[];
}

export interface FootballCareerAffiliationSeason {
  season: number;
  affiliation: string;
  conference?: string;
}

export interface FootballCareerAffiliationHistory {
  seasons: readonly FootballCareerAffiliationSeason[];
  affiliations: readonly string[];
  conferences: readonly string[];
  /** True only when the source owns every team/program season in the subject's stated career window. */
  complete: boolean;
  /** True only when every season in the stated CFB career window has an era-correct conference owner. */
  conferenceComplete: boolean;
}

function indexesFor(table: ColumnarTable) {
  return Object.fromEntries(table.columns.map((column, index) => [column, index])) as Record<string, number>;
}

function value(values: readonly unknown[], indexes: Record<string, number>, column: string) {
  const index = indexes[column];
  return index == null ? undefined : values[index];
}

function text(raw: unknown) {
  const result = String(raw ?? "").trim();
  return result || null;
}

function number(raw: unknown) {
  const result = Number(raw);
  return Number.isFinite(result) ? result : null;
}

function normalized(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sourceIdentity(subject: AffiliationSubject, provider: "nflverse" | "cfbfastR") {
  return subject.sourceIdentityKeys?.find((identity) => identity.provider === provider)?.id ?? null;
}

function withinCareerWindow(subject: AffiliationSubject, season: number) {
  return (subject.startSeason == null || season >= subject.startSeason)
    && (subject.endSeason == null || season <= subject.endSeason);
}

function hasCompleteWindow(subject: AffiliationSubject, seasons: readonly FootballCareerAffiliationSeason[]) {
  if (subject.startSeason == null || subject.endSeason == null || subject.endSeason < subject.startSeason) return false;
  const observed = new Set(seasons.map((row) => row.season));
  for (let season = subject.startSeason; season <= subject.endSeason; season += 1) {
    if (!observed.has(season)) return false;
  }
  return true;
}

function hasCompleteConferenceWindow(subject: AffiliationSubject, seasons: readonly FootballCareerAffiliationSeason[]) {
  if (subject.league !== "CFB" || subject.startSeason == null || subject.endSeason == null || subject.endSeason < subject.startSeason) return false;
  const bySeason = new Map<number, FootballCareerAffiliationSeason[]>();
  for (const row of seasons) {
    const rows = bySeason.get(row.season) ?? [];
    rows.push(row);
    bySeason.set(row.season, rows);
  }
  for (let season = subject.startSeason; season <= subject.endSeason; season += 1) {
    const rows = bySeason.get(season);
    if (!rows?.length || rows.some((row) => !row.conference)) return false;
  }
  return true;
}

function withHistoricalConference(row: FootballCareerAffiliationSeason) {
  if (row.conference) return row;
  const conference = footballHistoricalConferenceForProgram(row.affiliation, row.season);
  return conference ? { ...row, conference } : row;
}

function finishHistory(
  subject: AffiliationSubject,
  seasons: readonly FootballCareerAffiliationSeason[],
  sourceComplete = hasCompleteWindow(subject, seasons),
) {
  const deduped = [...new Map(
    [...seasons]
      .map(withHistoricalConference)
      .sort((a, b) => a.season - b.season || a.affiliation.localeCompare(b.affiliation))
      .map((row) => [`${row.season}:${normalized(row.affiliation)}`, row]),
  ).values()];
  return {
    seasons: deduped,
    affiliations: [...new Set(deduped.map((row) => row.affiliation))].sort(),
    conferences: [...new Set(deduped.map((row) => row.conference).filter((conference): conference is string => Boolean(conference)))].sort(),
    complete: sourceComplete,
    conferenceComplete: hasCompleteConferenceWindow(subject, deduped),
  } satisfies FootballCareerAffiliationHistory;
}

function pushIndex(
  index: Map<string, FootballCareerAffiliationSeason[]>,
  key: string,
  row: FootballCareerAffiliationSeason,
) {
  const rows = index.get(key) ?? [];
  rows.push(row);
  index.set(key, rows);
}

function buildPlayerIndex(table: ColumnarTable, league: "NFL" | "CFB") {
  const indexes = indexesFor(table);
  const result = new Map<string, FootballCareerAffiliationSeason[]>();
  for (const values of table.rows) {
    const id = text(value(values, indexes, "sourcePlayerId"));
    const season = number(value(values, indexes, "season"));
    const affiliation = text(
      value(values, indexes, league === "NFL" ? "recentTeam" : "team")
        ?? value(values, indexes, "team"),
    );
    if (!id || season == null || !affiliation) continue;
    const conference = league === "CFB" ? text(value(values, indexes, "conference")) ?? undefined : undefined;
    pushIndex(result, id, { season, affiliation, ...(conference ? { conference } : {}) });
  }
  return result;
}

const cfbTeamSeasonTable = cfbTeamSeasonsJson as ColumnarTable;
const cfbTeamSeasonIndexes = indexesFor(cfbTeamSeasonTable);
const cfbConferenceBySeasonAndProgram = new Map<string, string>();
for (const values of cfbTeamSeasonTable.rows) {
  const season = number(value(values, cfbTeamSeasonIndexes, "season"));
  const program = text(value(values, cfbTeamSeasonIndexes, "programName"));
  const conference = text(value(values, cfbTeamSeasonIndexes, "conference"));
  if (season != null && program && conference) {
    cfbConferenceBySeasonAndProgram.set(`${season}:${normalized(program)}`, conference);
  }
}

function buildCoachIndex(table: ColumnarTable, league: "NFL" | "CFB") {
  const indexes = indexesFor(table);
  const result = new Map<string, FootballCareerAffiliationSeason[]>();
  for (const values of table.rows) {
    const coachKey = text(value(values, indexes, "sourceCoachNameKey"));
    const season = number(value(values, indexes, "season"));
    const affiliation = text(value(values, indexes, league === "NFL" ? "franchiseId" : "programName"));
    if (!coachKey || season == null || !affiliation) continue;
    const conference = league === "CFB"
      ? cfbConferenceBySeasonAndProgram.get(`${season}:${normalized(affiliation)}`)
        ?? footballHistoricalConferenceForProgram(affiliation, season)
        ?? undefined
      : undefined;
    pushIndex(result, coachKey, { season, affiliation, ...(conference ? { conference } : {}) });
  }
  return result;
}

const nflPlayerSeasonsById = buildPlayerIndex(nflPlayerSeasonsJson as ColumnarTable, "NFL");
const cfbPlayerSeasonsById = buildPlayerIndex(cfbPlayerSeasonsJson as ColumnarTable, "CFB");
const nflCoachSeasonsByKey = buildCoachIndex(nflCoachSeasonsJson as ColumnarTable, "NFL");
const cfbCoachSeasonsByKey = buildCoachIndex(cfbCoachSeasonsJson as ColumnarTable, "CFB");

function historicalSchoolFallback(subject: AffiliationSubject) {
  if (subject.league !== "CFB" || !subject.school || subject.startSeason == null || subject.endSeason == null) return [];
  const rows: FootballCareerAffiliationSeason[] = [];
  for (let season = subject.startSeason; season <= subject.endSeason; season += 1) {
    const conference = footballHistoricalConferenceForProgram(subject.school, season);
    if (!conference) return [];
    rows.push({ season, affiliation: subject.school, conference });
  }
  return rows;
}

function playerHistory(subject: AffiliationSubject) {
  const provider = subject.league === "NFL" ? "nflverse" : "cfbfastR";
  const id = sourceIdentity(subject, provider);
  const sourceRows = id ? (subject.league === "NFL" ? nflPlayerSeasonsById : cfbPlayerSeasonsById).get(id) ?? [] : [];
  const seasons = sourceRows.filter((row) => withinCareerWindow(subject, row.season));
  if (seasons.length) return finishHistory(subject, seasons);

  // Older CFB player-season feeds do not reach the historical stars in the eligible universe. Use only the canonical
  // single-school identity to own era-correct conference membership. Keep team/program completeness false so this
  // fallback can never turn an unknown transfer/affiliation into a negative answer.
  const historical = historicalSchoolFallback(subject);
  return historical.length ? finishHistory(subject, historical, false) : null;
}

function coachHistory(subject: AffiliationSubject) {
  const sourceRows = (subject.league === "NFL" ? nflCoachSeasonsByKey : cfbCoachSeasonsByKey).get(slug(subject.name)) ?? [];
  const seasons = sourceRows.filter((row) => withinCareerWindow(subject, row.season));
  return seasons.length ? finishHistory(subject, seasons) : null;
}

/**
 * Canonical source-backed career affiliation owner for player/coach questions. Missing/incomplete histories are not
 * negative answers. `complete` owns team/program negatives; `conferenceComplete` separately owns historical CFB
 * conference negatives so an era-correct conference projection never pretends to know an unobserved transfer.
 */
export function footballCareerAffiliationHistoryFor(subject: AffiliationSubject): FootballCareerAffiliationHistory | null {
  if (subject.kind === "player-career") return playerHistory(subject);
  if (subject.kind === "coach") return coachHistory(subject);
  return null;
}
