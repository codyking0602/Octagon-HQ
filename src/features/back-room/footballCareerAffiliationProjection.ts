import cfbPlayerSeasonsJson from "../../../data/generated/football/cfb/player-seasons-2014-2025.json";
import cfbCoachSeasonsJson from "../../../data/generated/football/relationships/cfb-coach-seasons-2002-2025.json";
import cfbTeamSeasonsJson from "../../../data/generated/football/relationships/cfb-team-season-results-2002-2025.json";
import nflPlayerSeasonsJson from "../../../data/generated/football/nfl/player-seasons-1999-2025.json";
import nflCoachSeasonsJson from "../../../data/generated/football/relationships/nfl-coach-seasons-1999-2025.json";
import type { FootballCanonicalSubject } from "./footballFactualStatsCatalog";
import type { FootballSourceIdentityKey } from "./footballSubjectEligibility";

interface ColumnarTable {
  columns: readonly string[];
  rows: readonly (readonly unknown[])[];
}

type AffiliationSubject = Pick<
  FootballCanonicalSubject,
  "id" | "kind" | "league" | "name" | "startSeason" | "endSeason"
> & {
  sourceIdentityKeys?: readonly FootballSourceIdentityKey[];
};

export interface FootballCareerAffiliationSeason {
  season: number;
  affiliation: string;
  conference?: string;
}

export interface FootballCareerAffiliationHistory {
  seasons: readonly FootballCareerAffiliationSeason[];
  affiliations: readonly string[];
  conferences: readonly string[];
  /** True only when the source owns every season in the subject's stated career window. */
  complete: boolean;
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

function finishHistory(subject: AffiliationSubject, seasons: FootballCareerAffiliationSeason[]) {
  const deduped = [...new Map(
    seasons
      .sort((a, b) => a.season - b.season || a.affiliation.localeCompare(b.affiliation))
      .map((row) => [`${row.season}:${normalized(row.affiliation)}`, row]),
  ).values()];
  return {
    seasons: deduped,
    affiliations: [...new Set(deduped.map((row) => row.affiliation))].sort(),
    conferences: [...new Set(deduped.map((row) => row.conference).filter((conference): conference is string => Boolean(conference)))].sort(),
    complete: hasCompleteWindow(subject, deduped),
  } satisfies FootballCareerAffiliationHistory;
}

function playerHistory(subject: AffiliationSubject) {
  const table = (subject.league === "NFL" ? nflPlayerSeasonsJson : cfbPlayerSeasonsJson) as ColumnarTable;
  const indexes = indexesFor(table);
  const provider = subject.league === "NFL" ? "nflverse" : "cfbfastR";
  const id = sourceIdentity(subject, provider);
  if (!id) return null;

  const seasons: FootballCareerAffiliationSeason[] = [];
  for (const values of table.rows) {
    if (String(value(values, indexes, "sourcePlayerId") ?? "") !== id) continue;
    const season = number(value(values, indexes, "season"));
    if (season == null || !withinCareerWindow(subject, season)) continue;
    const affiliation = text(
      value(values, indexes, subject.league === "NFL" ? "recentTeam" : "team")
        ?? value(values, indexes, "team"),
    );
    if (!affiliation) continue;
    const conference = subject.league === "CFB" ? text(value(values, indexes, "conference")) ?? undefined : undefined;
    seasons.push({ season, affiliation, ...(conference ? { conference } : {}) });
  }
  return seasons.length ? finishHistory(subject, seasons) : null;
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

function coachHistory(subject: AffiliationSubject) {
  const table = (subject.league === "NFL" ? nflCoachSeasonsJson : cfbCoachSeasonsJson) as ColumnarTable;
  const indexes = indexesFor(table);
  const coachKey = slug(subject.name);
  const seasons: FootballCareerAffiliationSeason[] = [];
  for (const values of table.rows) {
    if (text(value(values, indexes, "sourceCoachNameKey")) !== coachKey) continue;
    const season = number(value(values, indexes, "season"));
    if (season == null || !withinCareerWindow(subject, season)) continue;
    const affiliation = text(value(values, indexes, subject.league === "NFL" ? "franchiseId" : "programName"));
    if (!affiliation) continue;
    const conference = subject.league === "CFB"
      ? cfbConferenceBySeasonAndProgram.get(`${season}:${normalized(affiliation)}`)
      : undefined;
    seasons.push({ season, affiliation, ...(conference ? { conference } : {}) });
  }
  return seasons.length ? finishHistory(subject, seasons) : null;
}

/**
 * Canonical source-backed career affiliation owner for player/coach questions. A missing or incomplete history is
 * intentionally not a negative answer: consumers may use positive observed affiliations, but may answer "No" only
 * when `complete` is true.
 */
export function footballCareerAffiliationHistoryFor(subject: AffiliationSubject): FootballCareerAffiliationHistory | null {
  if (subject.kind === "player-career") return playerHistory(subject);
  if (subject.kind === "coach") return coachHistory(subject);
  return null;
}
