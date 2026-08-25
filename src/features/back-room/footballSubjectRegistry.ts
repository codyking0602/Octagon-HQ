import {
  footballFindLeaderSubjects,
  type FootballFindLeaderDomainId,
} from "./footballFindLeaderStats";

export type FootballSubjectKind = "player-career" | "team-season";
export type FootballSubjectLeague = "NFL" | "CFB";
export type FootballSubjectPosition = "QB" | "RB";

export interface FootballSubjectProfile {
  id: string;
  name: string;
  kind: FootballSubjectKind;
  league: FootballSubjectLeague;
  position?: FootballSubjectPosition;
  season?: number;
}

export interface FootballSubjectQuery {
  kind?: FootballSubjectKind;
  league?: FootballSubjectLeague;
  position?: FootballSubjectPosition;
  season?: number;
}

const domainProfile = {
  "nfl-qb-career": {
    kind: "player-career",
    league: "NFL",
    position: "QB",
  },
  "nfl-rb-career": {
    kind: "player-career",
    league: "NFL",
    position: "RB",
  },
  "cfb-champion-season": {
    kind: "team-season",
    league: "CFB",
  },
} as const satisfies Record<
  FootballFindLeaderDomainId,
  Pick<FootballSubjectProfile, "kind" | "league"> & { position?: FootballSubjectPosition }
>;

function seasonFromSubjectId(subjectId: string) {
  const match = /^(\d{4})-/.exec(subjectId);
  if (!match) return undefined;
  const season = Number(match[1]);
  return Number.isInteger(season) ? season : undefined;
}

export const footballSubjects: readonly FootballSubjectProfile[] = footballFindLeaderSubjects.map((subject) => {
  const profile = domainProfile[subject.domainId];
  const season = profile.kind === "team-season" ? seasonFromSubjectId(subject.id) : undefined;

  return {
    id: subject.id,
    name: subject.name,
    ...profile,
    ...(season == null ? {} : { season }),
  };
});

const footballSubjectById = new Map(footballSubjects.map((subject) => [subject.id, subject]));

export function getFootballSubject(subjectId: string) {
  return footballSubjectById.get(subjectId) ?? null;
}

export function queryFootballSubjects(query: FootballSubjectQuery = {}) {
  return footballSubjects.filter((subject) => {
    if (query.kind && subject.kind !== query.kind) return false;
    if (query.league && subject.league !== query.league) return false;
    if (query.position && subject.position !== query.position) return false;
    if (query.season != null && subject.season !== query.season) return false;
    return true;
  });
}
