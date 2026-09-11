import cfbCoachSeasonsJson from "../../../data/generated/football/relationships/cfb-coach-seasons-2002-2025.json";
import nflCoachSeasonsJson from "../../../data/generated/football/relationships/nfl-coach-seasons-1999-2025.json";
import { footballHistoricalConferenceForProgram } from "./footballTeamSchoolMetadata";

interface ColumnarTable {
  columns: readonly string[];
  rows: readonly (readonly unknown[])[];
}

export interface FootballCoachAffiliationSubject {
  name: string;
  league: "NFL" | "CFB";
  startSeason?: number;
  endSeason?: number;
}

export interface FootballCoachCareerAffiliationSeason {
  season: number;
  affiliation: string;
  conference?: string;
}

export interface FootballCoachCareerAffiliationHistory {
  seasons: readonly FootballCoachCareerAffiliationSeason[];
  affiliations: readonly string[];
  conferences: readonly string[];
  complete: boolean;
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

function withinCareerWindow(subject: FootballCoachAffiliationSubject, season: number) {
  return (subject.startSeason == null || season >= subject.startSeason)
    && (subject.endSeason == null || season <= subject.endSeason);
}

function hasCompleteWindow(
  subject: FootballCoachAffiliationSubject,
  seasons: readonly FootballCoachCareerAffiliationSeason[],
) {
  if (subject.startSeason == null || subject.endSeason == null || subject.endSeason < subject.startSeason) return false;
  const observed = new Set(seasons.map((row) => row.season));
  for (let season = subject.startSeason; season <= subject.endSeason; season += 1) {
    if (!observed.has(season)) return false;
  }
  return true;
}

function hasCompleteConferenceWindow(
  subject: FootballCoachAffiliationSubject,
  seasons: readonly FootballCoachCareerAffiliationSeason[],
) {
  if (subject.league !== "CFB" || subject.startSeason == null || subject.endSeason == null || subject.endSeason < subject.startSeason) return false;
  const bySeason = new Map<number, FootballCoachCareerAffiliationSeason[]>();
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

function buildCoachIndex(table: ColumnarTable, league: "NFL" | "CFB") {
  const indexes = indexesFor(table);
  const result = new Map<string, FootballCoachCareerAffiliationSeason[]>();
  for (const values of table.rows) {
    const coachKey = text(value(values, indexes, "sourceCoachNameKey"));
    const season = number(value(values, indexes, "season"));
    const affiliation = text(value(values, indexes, league === "NFL" ? "franchiseId" : "programName"));
    if (!coachKey || season == null || !affiliation) continue;
    const conference = league === "CFB"
      ? footballHistoricalConferenceForProgram(affiliation, season) ?? undefined
      : undefined;
    const rows = result.get(coachKey) ?? [];
    rows.push({ season, affiliation, ...(conference ? { conference } : {}) });
    result.set(coachKey, rows);
  }
  return result;
}

const nflCoachSeasonsByKey = buildCoachIndex(nflCoachSeasonsJson as ColumnarTable, "NFL");
const cfbCoachSeasonsByKey = buildCoachIndex(cfbCoachSeasonsJson as ColumnarTable, "CFB");

export function footballCoachCareerAffiliationHistoryFor(
  subject: FootballCoachAffiliationSubject,
): FootballCoachCareerAffiliationHistory | null {
  const sourceRows = (subject.league === "NFL" ? nflCoachSeasonsByKey : cfbCoachSeasonsByKey).get(slug(subject.name)) ?? [];
  const seasons = sourceRows.filter((row) => withinCareerWindow(subject, row.season));
  if (!seasons.length) return null;

  const deduped = [...new Map(
    [...seasons]
      .sort((a, b) => a.season - b.season || a.affiliation.localeCompare(b.affiliation))
      .map((row) => [`${row.season}:${normalized(row.affiliation)}`, row]),
  ).values()];

  return {
    seasons: deduped,
    affiliations: [...new Set(deduped.map((row) => row.affiliation))].sort(),
    conferences: [...new Set(deduped.map((row) => row.conference).filter((conference): conference is string => Boolean(conference)))].sort(),
    complete: hasCompleteWindow(subject, deduped),
    conferenceComplete: hasCompleteConferenceWindow(subject, deduped),
  };
}
