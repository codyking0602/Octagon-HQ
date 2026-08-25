import {
  footballCanonicalSubjects,
  type FootballCanonicalSubject,
  type FootballCanonicalSubjectKind,
} from "./footballFactualStatsCatalog";

export type FootballSubjectKind = FootballCanonicalSubjectKind;
export type FootballSubjectLeague = FootballCanonicalSubject["league"];
export type FootballSubjectPosition = NonNullable<FootballCanonicalSubject["position"]>;
export type FootballSubjectProfile = FootballCanonicalSubject;

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

/** Public identity/query view of the one canonical Football subject universe. */
export const footballSubjects: readonly FootballSubjectProfile[] = footballCanonicalSubjects;

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
