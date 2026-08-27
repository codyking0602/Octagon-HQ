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
  type FootballSubjectKnowledgeOverride,
} from "./footballSubjectEligibility";
import {
  footballNonPlayerRecognitionProjectionFor,
  footballProjectedPlayerSubjects,
  footballRecognitionProjectionSubjectIdFor,
} from "./footballRecognizabilityProjection";
import {
  footballFindLeaderProjectedAdditionalSubjects,
  footballFindLeaderProjectedKnowledgeOverride,
} from "./footballFindLeaderRuntimeProjection";

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
  /** PR6 review/depth opt-in. Normal game queries intentionally remain on the curated canonical projection. */
  includeProjectedSourceSubjects?: boolean;
}

const comparisonItemById = new Map(footballComparisonDepthItems.map((item) => [item.id, item]));

function programAlias(subject: FootballCanonicalSubject) {
  if (subject.kind !== "program" || !subject.id.startsWith("program-")) return null;
  return `${subject.id.slice("program-".length)}-program`;
}

function teamIdForSubject(subject: FootballCanonicalSubject): FootballTeamMediaId | undefined {
  const comparisonItem = comparisonItemById.get(subject.id);
  if (comparisonItem) return footballTeamMediaIdFromComparisonAsset(comparisonItem.asset);
  if (subject.kind === "team-season" && subject.league === "CFB") return footballCfbTeamMediaIdFromSeasonSubjectId(subject.id) ?? undefined;
  if (subject.kind === "program" && subject.id.startsWith("program-")) return footballCfbTeamMediaId(subject.id.slice("program-".length));
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

function enrichFootballSubject(
  subject: FootballCanonicalSubject,
  knowledgeOverride?: FootballSubjectKnowledgeOverride,
): FootballSubjectProfile {
  const teamId = teamIdForSubject(subject);
  const playerId = playerIdForSubject(subject);
  const coachId = subject.kind === "coach" ? subject.id : undefined;
  const generatedAliases = [programAlias(subject)]
    .filter((alias): alias is string => Boolean(alias && alias !== subject.id));
  const aliases = [...new Set([...(subject.aliases ?? []), ...generatedAliases])];
  const knowledgeMetadata = buildFootballSubjectKnowledgeMetadata(subject, knowledgeOverride);
  return {
    ...subject,
    ...knowledgeMetadata,
    ...(aliases.length ? { aliases } : {}),
    ...(teamId ? { teamId } : {}),
    ...(playerId ? { playerId } : {}),
    ...(coachId ? { coachId } : {}),
  };
}

function comparisonProjectionSourceIdentity(subject: FootballCanonicalSubject) {
  if (subject.kind !== "team-season" || subject.season == null) return undefined;
  const comparisonItem = comparisonItemById.get(subject.id);
  if (!comparisonItem) return undefined;
  if (comparisonItem.asset.kind === "nfl") {
    return { provider: "nflverse", id: `${subject.season}:${comparisonItem.asset.team.toUpperCase()}` } as const;
  }
  return { provider: "cfbfastR", id: `${subject.season}:${comparisonItem.asset.teamId}` } as const;
}

function projectedCanonicalKnowledgeOverride(subject: FootballCanonicalSubject): FootballSubjectKnowledgeOverride | undefined {
  const projection = footballNonPlayerRecognitionProjectionFor(subject, comparisonProjectionSourceIdentity(subject));
  if (!projection) return undefined;
  return {
    recognizabilityTier: projection.tier,
    ...(projection.sourceIdentityKey ? {
      sourceIdentityKeys: [
        { provider: "octagon-hq", id: subject.id },
        projection.sourceIdentityKey,
      ],
    } : {}),
  };
}

/** Public curated identity/query view used by existing games. */
export const footballSubjects: readonly FootballSubjectProfile[] = footballCanonicalSubjects
  .map((subject) => enrichFootballSubject(subject));

/** Same canonical identities with PR6 non-player recognition applied only for opted-in source-depth consumers. */
const projectedCanonicalSubjects: readonly FootballSubjectProfile[] = footballCanonicalSubjects
  .map((subject) => enrichFootballSubject(subject, projectedCanonicalKnowledgeOverride(subject)));

const reconciledProjectedPlayerIds = new Set(
  footballCanonicalSubjects
    .filter((subject) => subject.kind === "player-career")
    .map((subject) => footballRecognitionProjectionSubjectIdFor(subject))
    .filter((id): id is string => Boolean(id)),
);

/** Source-projected players that do not already reconcile to a curated canonical player. Opt-in only. */
const projectedSourceSubjects: readonly FootballSubjectProfile[] = footballProjectedPlayerSubjects
  .filter((subject) => !reconciledProjectedPlayerIds.has(subject.id))
  .map((subject) => enrichFootballSubject(subject));

const canonicalSubjectIds = new Set(footballSubjects.map((subject) => subject.id));
const projectedAdditionalSubjects: readonly FootballSubjectProfile[] = footballFindLeaderProjectedAdditionalSubjects
  .filter((subject) => !canonicalSubjectIds.has(subject.id))
  .map((subject) => enrichFootballSubject(subject, footballFindLeaderProjectedKnowledgeOverride(subject.id) ?? undefined));

const footballSubjectById = new Map<string, FootballSubjectProfile>();
for (const subject of [...footballSubjects, ...projectedSourceSubjects, ...projectedAdditionalSubjects]) {
  if (!footballSubjectById.has(subject.id)) footballSubjectById.set(subject.id, subject);
  for (const alias of subject.aliases ?? []) if (!footballSubjectById.has(alias)) footballSubjectById.set(alias, subject);
}

// PR6 source ids are reconciliation keys, not public canonical aliases. Keep the public subject shape unchanged while
// allowing source-backed facts to collapse onto the already-reviewed canonical player identity.
for (const subject of footballSubjects) {
  const projectionId = footballRecognitionProjectionSubjectIdFor(subject);
  if (!projectionId || projectionId === subject.id) continue;
  const existing = footballSubjectById.get(projectionId);
  if (existing && existing.id !== subject.id) {
    throw new Error(`Conflicting Football source identity: ${projectionId} -> ${existing.id}/${subject.id}`);
  }
  footballSubjectById.set(projectionId, subject);
}

export function getFootballSubject(subjectId: string) {
  return footballSubjectById.get(subjectId) ?? null;
}

function matchesFootballSubject(subject: FootballSubjectProfile, query: FootballSubjectQuery) {
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
}

export function queryFootballSubjects(query: FootballSubjectQuery = {}) {
  // Preserve the pre-PR6 contract: source-stage depth does not appear in normal queries merely because a provider is named.
  if (query.sourceProvider && query.sourceProvider !== "octagon-hq" && !query.includeProjectedSourceSubjects) return [];
  const universe = query.includeProjectedSourceSubjects
    ? [...projectedCanonicalSubjects, ...projectedSourceSubjects, ...projectedAdditionalSubjects]
    : footballSubjects;
  return universe.filter((subject) => matchesFootballSubject(subject, query));
}

function normalizedFootballSubjectName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Resolve a legacy game reference through the canonical registry. Exact ids/aliases win; otherwise a unique
 * name match inside the caller's canonical query scope may reconcile older public lineup ids to source-backed identities.
 */
export function resolveFootballSubjectReference(
  subjectId: string,
  name: string,
  query: FootballSubjectQuery = {},
) {
  const scopedSubjects = queryFootballSubjects(query);
  const direct = getFootballSubject(subjectId);
  if (direct) {
    const scopedDirect = scopedSubjects.find((subject) => subject.id === direct.id);
    if (scopedDirect) return scopedDirect;
  }

  const normalizedName = normalizedFootballSubjectName(name);
  const matches = scopedSubjects
    .filter((subject) => normalizedFootballSubjectName(subject.name) === normalizedName);
  const uniqueByCanonicalId = new Map(matches.map((subject) => [subject.id, subject]));
  return uniqueByCanonicalId.size === 1 ? [...uniqueByCanonicalId.values()][0]! : null;
}
