import {
  footballCanonicalSubjects,
  type FootballCanonicalSubject,
} from "./footballFactualStatsCatalog";
import {
  footballComparisonCanonicalSubjects,
  type FootballExpandedSubjectKind,
} from "./footballCanonicalSubjectExpansion";

export type FootballSubjectKind = FootballExpandedSubjectKind;
export type FootballSubjectLeague = FootballCanonicalSubject["league"];
export type FootballSubjectPosition = NonNullable<FootballCanonicalSubject["position"]>;
export type FootballSubjectProfile = Omit<FootballCanonicalSubject, "kind"> & {
  kind: FootballSubjectKind;
  aliases?: readonly string[];
  startSeason?: number;
  endSeason?: number;
};

export interface FootballSubjectQuery {
  kind?: FootballSubjectKind;
  league?: FootballSubjectLeague;
  position?: FootballSubjectPosition;
  season?: number;
  decade?: number;
  school?: string;
  conference?: string;
  franchise?: string;
  draftYear?: number;
  draftRound?: number;
  firstRoundPick?: boolean;
  firstOverallPick?: boolean;
  undrafted?: boolean;
  heismanWinner?: boolean;
  nationalChampion?: boolean;
  startSeason?: number;
  endSeason?: number;
}

function normalizedPlayerName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mergeFootballSubjects(subjects: readonly FootballSubjectProfile[]) {
  const byKey = new Map<string, FootballSubjectProfile>();
  for (const subject of subjects) {
    const key = subject.kind === "player-career"
      ? `player:${normalizedPlayerName(subject.name)}`
      : `id:${subject.id}`;
    const current = byKey.get(key);
    if (!current) {
      byKey.set(key, { ...subject, leagues: subject.leagues ?? [subject.league] });
      continue;
    }

    const aliases = new Set([...(current.aliases ?? []), ...(subject.aliases ?? [])]);
    if (subject.id !== current.id) aliases.add(subject.id);
    const activeDecades = [...new Set([...(current.activeDecades ?? []), ...(subject.activeDecades ?? [])])];
    const leagues = [...new Set([...(current.leagues ?? [current.league]), ...(subject.leagues ?? [subject.league])])];

    byKey.set(key, {
      ...current,
      ...subject,
      id: current.id,
      name: current.name,
      league: current.league,
      leagues,
      ...(aliases.size === 0 ? {} : { aliases: [...aliases] }),
      ...(activeDecades.length === 0 ? {} : { activeDecades }),
    });
  }
  return [...byKey.values()];
}

/** Public identity/query view of the one canonical Football subject universe. */
export const footballSubjects: readonly FootballSubjectProfile[] = mergeFootballSubjects([
  ...footballCanonicalSubjects,
  ...footballComparisonCanonicalSubjects,
]);

const footballSubjectById = new Map<string, FootballSubjectProfile>();
for (const subject of footballSubjects) {
  footballSubjectById.set(subject.id, subject);
  for (const alias of subject.aliases ?? []) {
    if (!footballSubjectById.has(alias)) footballSubjectById.set(alias, subject);
  }
}

export function getFootballSubject(subjectId: string) {
  return footballSubjectById.get(subjectId) ?? null;
}

export function queryFootballSubjects(query: FootballSubjectQuery = {}) {
  return footballSubjects.filter((subject) => {
    if (query.kind && subject.kind !== query.kind) return false;
    if (query.league && !(subject.leagues ?? [subject.league]).includes(query.league)) return false;
    if (query.position && subject.position !== query.position) return false;
    if (query.season != null && subject.season !== query.season) return false;
    if (query.decade != null && !subject.activeDecades?.includes(query.decade)) return false;
    if (query.school && subject.school !== query.school) return false;
    if (query.conference && subject.conference !== query.conference) return false;
    if (query.franchise && !subject.franchises?.includes(query.franchise)) return false;
    if (query.draftYear != null && subject.draftYear !== query.draftYear) return false;
    if (query.draftRound != null && subject.draftRound !== query.draftRound) return false;
    if (query.firstRoundPick != null && subject.firstRoundPick !== query.firstRoundPick) return false;
    if (query.firstOverallPick != null && subject.firstOverallPick !== query.firstOverallPick) return false;
    if (query.undrafted != null && subject.undrafted !== query.undrafted) return false;
    if (query.heismanWinner != null && subject.heismanWinner !== query.heismanWinner) return false;
    if (query.nationalChampion != null && subject.nationalChampion !== query.nationalChampion) return false;
    if (query.startSeason != null && subject.startSeason !== query.startSeason) return false;
    if (query.endSeason != null && subject.endSeason !== query.endSeason) return false;
    return true;
  });
}
