import { footballComparisonDepthItems } from "./footballComparisonDepthCatalog";
import {
  footballCfbTeamMediaId,
  footballCfbTeamMediaIdFromSeasonSubjectId,
  footballTeamMediaIdFromComparisonAsset,
  type FootballTeamMediaId,
} from "./footballMediaIdentity";
import {
  footballCanonicalSubjects,
  type FootballCanonicalSubject,
  type FootballCanonicalSubjectKind,
} from "./footballFactualStatsCatalog";
import {
  buildFootballSubjectKnowledgeMetadata,
  type FootballRecognizabilityTier,
  type FootballSourceProviderId,
  type FootballSubjectKnowledgeMetadata,
} from "./footballSubjectEligibility";
import { footballProjectedPlayerSubjects } from "./footballRecognizabilityProjection";

export type FootballSubjectKind = FootballCanonicalSubjectKind;
export type FootballSubjectLeague = FootballCanonicalSubject["league"];
export type FootballSubjectPosition = NonNullable<FootballCanonicalSubject["position"]>;
export type FootballSubjectProfile = FootballCanonicalSubject & FootballSubjectKnowledgeMetadata & {
  /** Canonical underlying team/program identity for historical team-scoped records. */
  teamId?: FootballTeamMediaId;
  /** Canonical person identity for player records, independent of season/team-at-the-time. */
  playerId?: string;
  /** Canonical person identity for coach records. */
  coachId?: string;
};

export interface FootballSubjectQuery {
  kind?: FootballSubjectKind;
  league?: FootballSubjectLeague;
  position?: FootballSubjectPosition;
  positions?: readonly FootballSubjectPosition[];
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
  recognizabilityTiers?: readonly FootballRecognizabilityTier[];
  casualEligible?: boolean;
  sourceProvider?: FootballSourceProviderId;
}

const comparisonItemById = new Map(footballComparisonDepthItems.map((item) => [item.id, item]));

function programAlias(subject: FootballCanonicalSubject) {
  if (subject.kind !== "program" || !subject.id.startsWith("program-")) return null;
  return `${subject.id.slice("program-".length)}-program`;
}

function teamIdForSubject(subject: FootballCanonicalSubject): FootballTeamMediaId | undefined {
  const comparisonItem = comparisonItemById.get(subject.id);
  if (comparisonItem) return footballTeamMediaIdFromComparisonAsset(comparisonItem.asset);

  if (subject.kind === "team-season" && subject.league === "CFB") {
    return footballCfbTeamMediaIdFromSeasonSubjectId(subject.id) ?? undefined;
  }

  if (subject.kind === "program" && subject.id.startsWith("program-")) {
    return footballCfbTeamMediaId(subject.id.slice("program-".length));
  }

  if (subject.kind === "program-era") {
    const match = /^(.+)-\d{4}-\d{4}$/.exec(subject.id);
    if (match) return footballCfbTeamMediaId(match[1]);
  }

  return undefined;
}

function playerIdForSubject(subject: FootballCanonicalSubject) {
  if (subject.kind === "player-career") return subject.id;
  if (subject.kind !== "player-season") return undefined;
  return subject.id.replace(/-\d{4}$/, "");
}

function enrichFootballSubject(subject: FootballCanonicalSubject): FootballSubjectProfile {
  const teamId = teamIdForSubject(subject);
  const playerId = playerIdForSubject(subject);
  const coachId = subject.kind === "coach" ? subject.id : undefined;
  const alias = programAlias(subject);
  const aliases = alias && !(subject.aliases ?? []).includes(alias)
    ? [...(subject.aliases ?? []), alias]
    : subject.aliases;
  const knowledgeMetadata = buildFootballSubjectKnowledgeMetadata(subject);

  return {
    ...subject,
    ...knowledgeMetadata,
    ...(aliases ? { aliases } : {}),
    ...(teamId ? { teamId } : {}),
    ...(playerId ? { playerId } : {}),
    ...(coachId ? { coachId } : {}),
  };
}

/** Public identity/query view of the one canonical Football subject universe. */
export const footballSubjects: readonly FootballSubjectProfile[] = footballCanonicalSubjects.map(enrichFootballSubject);

/** Review/query surface for promoted source identities; intentionally excluded from legacy game pools. */
export const footballRecognizabilitySubjects: readonly FootballSubjectProfile[] = footballProjectedPlayerSubjects.map(enrichFootballSubject);

export function queryFootballRecognizabilitySubjects(query: FootballSubjectQuery = {}) {
  return footballRecognizabilitySubjects.filter((subject) => {
    if (query.kind && subject.kind !== query.kind) return false;
    if (query.league && subject.league !== query.league) return false;
    if (query.position && subject.position !== query.position) return false;
    if (query.recognizabilityTiers && !query.recognizabilityTiers.includes(subject.recognizabilityTier)) return false;
    if (query.casualEligible != null && subject.casualEligible !== query.casualEligible) return false;
    return true;
  });
}

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
    if (query.positions && (!subject.position || !query.positions.includes(subject.position))) return false;
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
    if (query.recognizabilityTiers && !query.recognizabilityTiers.includes(subject.recognizabilityTier)) return false;
    if (query.casualEligible != null && subject.casualEligible !== query.casualEligible) return false;
    if (query.sourceProvider && !subject.sourceIdentityKeys.some((key) => key.provider === query.sourceProvider)) return false;
    return true;
  });
}
