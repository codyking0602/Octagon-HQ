import { footballComparisonDepthItems } from "./footballComparisonDepthCatalog";
import {
  footballCfbTeamMediaId,
  footballCfbTeamMediaIdFromSeasonSubjectId,
  footballNflTeamMediaId,
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
  footballProjectedNonPlayerRecognitionSubjects,
  footballProjectedPlayerRegistrationTier,
  footballProjectedPlayerSourceSubjects,
  footballProjectedPlayerSubjects,
  footballRecognitionProjectionSubjectIdFor,
} from "./footballRecognizabilityProjection";
import {
  footballFindLeaderProjectedAdditionalSubjects,
  footballFindLeaderProjectedCfbTeamMedia,
  footballFindLeaderProjectedKnowledgeOverride,
  footballFindLeaderProjectedNflTeamCode,
} from "./footballFindLeaderRuntimeProjection";

export type FootballSubjectKind = FootballCanonicalSubjectKind | "franchise" | "game";
export type FootballSubjectLeague = FootballCanonicalSubject["league"];
export type FootballSubjectPosition = NonNullable<FootballCanonicalSubject["position"]>;
export interface FootballSubjectIdentity extends Omit<FootballCanonicalSubject, "kind"> {
  kind: FootballSubjectKind;
}
export type FootballSubjectProfile = FootballSubjectIdentity & FootballSubjectKnowledgeMetadata & {
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
  /** Source-depth opt-in. Raw/projected identities never appear merely because a provider is named. */
  includeProjectedSourceSubjects?: boolean;
  /** Consumer-migration opt-in for non-player recognition on existing canonical identities. */
  includeProjectedCanonicalRecognition?: boolean;
}

const comparisonItemById = new Map(footballComparisonDepthItems.map((item) => [item.id, item]));
const projectedPlayerSourceSubjectById = new Map(footballProjectedPlayerSourceSubjects.map((subject) => [subject.id, subject]));
const projectedPlayerSourceCoverageEndSeasonByLeague = new Map(
  (["NFL", "CFB"] as const).map((league) => [
    league,
    Math.max(
      0,
      ...footballProjectedPlayerSourceSubjects
        .filter((subject) => subject.league === league)
        .map((subject) => subject.endSeason ?? 0),
    ),
  ]),
);

function normalizedFootballSubjectName(name: string) {
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function playerStageIdentityKey(subject: Pick<FootballCanonicalSubject, "id" | "kind" | "league">) {
  if (subject.kind !== "player-career") return null;
  const bareId = subject.id.replace(/^(?:nfl|cfb)-/, "");
  return `${subject.league}:${bareId}`;
}

const canonicalPlayerCatalogSubjectByStageKey = new Map(
  footballCanonicalSubjects.flatMap((subject) => {
    const key = playerStageIdentityKey(subject);
    return key ? [[key, subject] as const] : [];
  }),
);

const projectedPlayerCanonicalSubjectByStageKey = new Map(
  footballProjectedPlayerSubjects.flatMap((subject) => {
    const key = playerStageIdentityKey(subject);
    return key ? [[key, subject] as const] : [];
  }),
);

function programAlias(subject: FootballSubjectIdentity) {
  if (subject.kind !== "program" || !subject.id.startsWith("program-")) return null;
  return `${subject.id.slice("program-".length)}-program`;
}

function teamIdForSubject(subject: FootballSubjectIdentity): FootballTeamMediaId | undefined {
  const comparisonItem = comparisonItemById.get(subject.id);
  if (comparisonItem) return footballTeamMediaIdFromComparisonAsset(comparisonItem.asset);
  const projectedNflTeamCode = footballFindLeaderProjectedNflTeamCode(subject.id);
  if (projectedNflTeamCode) return footballNflTeamMediaId(projectedNflTeamCode);
  const projectedCfbTeam = footballFindLeaderProjectedCfbTeamMedia(subject.id);
  if (projectedCfbTeam) return footballCfbTeamMediaId(projectedCfbTeam.programName);
  if (subject.kind === "team-season" && subject.league === "CFB") return footballCfbTeamMediaIdFromSeasonSubjectId(subject.id) ?? undefined;
  if (subject.kind === "program" && subject.id.startsWith("program-")) return footballCfbTeamMediaId(subject.id.slice("program-".length));
  if (subject.kind === "program-era") {
    const match = /^(.+)-\d{4}-\d{4}$/.exec(subject.id);
    if (match) return footballCfbTeamMediaId(match[1]);
  }
  return undefined;
}

function playerIdForSubject(subject: FootballSubjectIdentity) {
  if (subject.kind === "player-career") return subject.id;
  if (subject.kind !== "player-season") return undefined;
  return subject.id.replace(/-\d{4}$/, "");
}

/**
 * Canonical product identity stays authoritative. Missing career metadata may be
 * filled only from its generated exact-source binding; runtime name discovery is never used.
 */
function reconcileProjectedPlayerIdentity(subject: FootballCanonicalSubject): FootballCanonicalSubject {
  if (subject.kind !== "player-career") return subject;

  const stageProjection = projectedPlayerCanonicalSubjectByStageKey.get(playerStageIdentityKey(subject)!);
  const stageAliases = stageProjection
    ? [...new Set([
        ...(subject.aliases ?? []),
        ...(stageProjection.id !== subject.id ? [stageProjection.id] : []),
        ...(stageProjection.aliases ?? []),
      ])]
    : subject.aliases;
  const withReviewedMetadata = stageProjection ? {
    ...subject,
    ...(stageAliases?.length ? { aliases: stageAliases } : {}),
    position: subject.position ?? stageProjection.position,
    school: subject.school ?? stageProjection.school,
    franchises: subject.franchises ?? stageProjection.franchises,
    startSeason: subject.startSeason ?? stageProjection.startSeason,
    endSeason: subject.endSeason ?? stageProjection.endSeason,
    activeDecades: subject.activeDecades ?? stageProjection.activeDecades,
    draftYear: subject.draftYear ?? stageProjection.draftYear,
    draftRound: subject.draftRound ?? stageProjection.draftRound,
    draftPick: subject.draftPick ?? stageProjection.draftPick,
    firstRoundPick: subject.firstRoundPick ?? stageProjection.firstRoundPick,
    firstOverallPick: subject.firstOverallPick ?? stageProjection.firstOverallPick,
    undrafted: subject.undrafted ?? stageProjection.undrafted,
  } : subject;

  const sourceSubjectId = footballRecognitionProjectionSubjectIdFor(withReviewedMetadata);
  const sourceProjection = sourceSubjectId ? projectedPlayerSourceSubjectById.get(sourceSubjectId) : undefined;
  if (!sourceProjection) return withReviewedMetadata;

  return {
    ...withReviewedMetadata,
    position: withReviewedMetadata.position ?? sourceProjection.position,
    school: withReviewedMetadata.school ?? sourceProjection.school,
    franchises: withReviewedMetadata.franchises ?? sourceProjection.franchises,
    startSeason: withReviewedMetadata.startSeason ?? sourceProjection.startSeason,
    // A source row ending at the current NFL coverage ceiling proves only the
    // last observed source season, not that an active player's career ended there.
    endSeason: withReviewedMetadata.endSeason ?? (
      sourceProjection.league === "NFL"
      && sourceProjection.endSeason === projectedPlayerSourceCoverageEndSeasonByLeague.get("NFL")
        ? undefined
        : sourceProjection.endSeason
    ),
    activeDecades: withReviewedMetadata.activeDecades ?? sourceProjection.activeDecades,
    draftYear: withReviewedMetadata.draftYear ?? sourceProjection.draftYear,
    draftRound: withReviewedMetadata.draftRound ?? sourceProjection.draftRound,
    draftPick: withReviewedMetadata.draftPick ?? sourceProjection.draftPick,
    firstRoundPick: withReviewedMetadata.firstRoundPick ?? sourceProjection.firstRoundPick,
    firstOverallPick: withReviewedMetadata.firstOverallPick ?? sourceProjection.firstOverallPick,
    undrafted: withReviewedMetadata.undrafted ?? sourceProjection.undrafted,
  };
}

function enrichFootballSubject(
  subject: FootballCanonicalSubject,
  knowledgeOverride?: FootballSubjectKnowledgeOverride,
): FootballSubjectProfile {
  const reconciledSubject = reconcileProjectedPlayerIdentity(subject);
  const teamId = teamIdForSubject(reconciledSubject);
  const playerId = playerIdForSubject(reconciledSubject);
  const coachId = reconciledSubject.kind === "coach" ? reconciledSubject.id : undefined;
  const generatedAliases = [programAlias(reconciledSubject)]
    .filter((alias): alias is string => Boolean(alias && alias !== reconciledSubject.id));
  const aliases = [...new Set([...(reconciledSubject.aliases ?? []), ...generatedAliases])];
  const knowledgeMetadata = buildFootballSubjectKnowledgeMetadata(reconciledSubject, knowledgeOverride);
  return {
    ...reconciledSubject,
    ...knowledgeMetadata,
    ...(aliases.length ? { aliases } : {}),
    ...(teamId ? { teamId } : {}),
    ...(playerId ? { playerId } : {}),
    ...(coachId ? { coachId } : {}),
  };
}

function enrichProjectedNonPlayerSubject(
  subject: FootballSubjectIdentity,
  tier: FootballRecognizabilityTier,
  sourceIdentityKey?: { provider: FootballSourceProviderId; id: string },
): FootballSubjectProfile {
  const canonicalKey = { provider: "octagon-hq", id: subject.id } as const;
  const sourceIdentityKeys = sourceIdentityKey
    && !(sourceIdentityKey.provider === canonicalKey.provider && sourceIdentityKey.id === canonicalKey.id)
    ? [canonicalKey, sourceIdentityKey]
    : [canonicalKey];
  const teamId = teamIdForSubject(subject);
  return {
    ...subject,
    recognizabilityTier: tier,
    casualEligible: tier !== "D",
    sourceIdentityKeys,
    ...(teamId ? { teamId } : {}),
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

/** Same canonical identities with non-player recognition applied only for explicitly migrated consumers. */
const projectedCanonicalSubjects: readonly FootballSubjectProfile[] = footballCanonicalSubjects
  .map((subject) => enrichFootballSubject(subject, projectedCanonicalKnowledgeOverride(subject)));

const canonicalSubjectIds = new Set(footballSubjects.map((subject) => subject.id));
const canonicalCoachIdentityKeys = new Set(
  footballSubjects
    .filter((subject) => subject.kind === "coach")
    .map((subject) => `${subject.league}:${normalizedFootballSubjectName(subject.name)}`),
);
/** Generated recognition identities are product-owned canonical subjects, never raw source rows. */
const projectedPlayerCanonicalSubjects: readonly FootballSubjectProfile[] = footballProjectedPlayerSubjects
  .filter((subject) => {
    if (canonicalSubjectIds.has(subject.id)) return false;
    const key = playerStageIdentityKey(subject);
    return !key || !canonicalPlayerCatalogSubjectByStageKey.has(key);
  })
  .map((subject) => enrichFootballSubject(subject));

/** Exact source identities stay independently queryable and database-only. */
const projectedPlayerSourceSubjects: readonly FootballSubjectProfile[] = footballProjectedPlayerSourceSubjects
  .filter((subject) => !canonicalSubjectIds.has(subject.id))
  .map((subject) => {
    const exactTier = footballProjectedPlayerRegistrationTier(subject.id);
    return enrichFootballSubject(subject, {
      recognizabilityTier: exactTier,
      casualEligible: false,
    });
  });

/** Stage 12 adds identity-only franchise/game/coach/era families through the same query owner. */
const projectedNonPlayerSourceSubjects: readonly FootballSubjectProfile[] = footballProjectedNonPlayerRecognitionSubjects
  .filter(({ subject }) => {
    if (canonicalSubjectIds.has(subject.id)) return false;
    if (subject.kind !== "coach") return true;
    return !canonicalCoachIdentityKeys.has(`${subject.league}:${normalizedFootballSubjectName(subject.name)}`);
  })
  .map(({ subject, tier, sourceIdentityKey }) => enrichProjectedNonPlayerSubject(subject, tier, sourceIdentityKey));

const projectedProductSourceSubjects: readonly FootballSubjectProfile[] = [
  ...projectedPlayerCanonicalSubjects,
  ...projectedNonPlayerSourceSubjects,
];

const projectedSourceSubjects: readonly FootballSubjectProfile[] = [
  ...projectedProductSourceSubjects,
  ...projectedPlayerSourceSubjects,
];

const projectedAdditionalSubjects: readonly FootballSubjectProfile[] = footballFindLeaderProjectedAdditionalSubjects
  .filter((subject) => !canonicalSubjectIds.has(subject.id))
  .map((subject) => enrichFootballSubject(subject, footballFindLeaderProjectedKnowledgeOverride(subject.id) ?? undefined));

const allRegisteredSubjects = [...footballSubjects, ...projectedSourceSubjects, ...projectedAdditionalSubjects];

const footballPlayerCareerSubjectsByPerson = new Map<string, FootballSubjectProfile[]>();
const personRelationshipSubjects = [
  ...footballSubjects,
  ...projectedPlayerCanonicalSubjects,
  ...projectedAdditionalSubjects,
];
for (const subject of personRelationshipSubjects) {
  if (subject.kind !== "player-career") continue;
  const key = normalizedFootballSubjectName(subject.name);
  const subjects = footballPlayerCareerSubjectsByPerson.get(key) ?? [];
  if (!subjects.some((candidate) => candidate.id === subject.id)) subjects.push(subject);
  footballPlayerCareerSubjectsByPerson.set(key, subjects);
}

const footballSubjectById = new Map<string, FootballSubjectProfile>();
// Exact public/source subject IDs own themselves. Legacy aliases fill only unclaimed keys afterwards, so an older
// cross-level alias can never overwrite a real Stage 12 CFB/NFL career identity with the same id.
for (const subject of allRegisteredSubjects) {
  if (!footballSubjectById.has(subject.id)) footballSubjectById.set(subject.id, subject);
}
for (const subject of allRegisteredSubjects) {
  for (const alias of subject.aliases ?? []) if (!footballSubjectById.has(alias)) footballSubjectById.set(alias, subject);
}
// Reviewed stage-scoped player IDs are explicit aliases of an existing canonical
// product identity when their normalized stage ID is the same. This never applies
// to exact external source IDs, which own their own source-only registry rows.
for (const projected of footballProjectedPlayerSubjects) {
  const key = playerStageIdentityKey(projected);
  const catalogSubject = key ? canonicalPlayerCatalogSubjectByStageKey.get(key) : undefined;
  if (!catalogSubject || projected.id === catalogSubject.id || footballSubjectById.has(projected.id)) continue;
  const canonical = footballSubjectById.get(catalogSubject.id);
  if (canonical) footballSubjectById.set(projected.id, canonical);
}

// Exact source IDs own their source-only registry rows. Canonical/source ownership is
// resolved only through the generated explicit binding consumed by factual/recognition owners.

export function getFootballSubject(subjectId: string) {
  return footballSubjectById.get(subjectId) ?? null;
}

function footballPlayerCareerCrossStageCandidates(
  subject: FootballSubjectProfile,
  sameName: readonly FootballSubjectProfile[],
) {
  const candidates = sameName.filter((candidate) => (
    candidate.id !== subject.id
    && candidate.kind === "player-career"
    && candidate.league !== subject.league
    && (!subject.position || !candidate.position || subject.position === candidate.position)
  ));
  if (!candidates.length) return [];

  const scored = candidates.map((candidate) => {
    const cfb = subject.league === "CFB" ? subject : candidate;
    const nfl = subject.league === "NFL" ? subject : candidate;
    const cfbEnd = cfb.endSeason;
    const nflStart = nfl.draftYear ?? nfl.startSeason;
    const chronology = cfbEnd != null && nflStart != null
      ? (nflStart >= cfbEnd && nflStart <= cfbEnd + 2)
      : null;
    const schoolMatch = Boolean(
      cfb.school
      && nfl.school
      && normalizedFootballSubjectName(cfb.school) === normalizedFootballSubjectName(nfl.school)
    );
    const canonicalStageIdentityMatch = (
      cfb.id.startsWith("cfb-")
      && nfl.id.startsWith("nfl-")
      && cfb.id.slice("cfb-".length) === nfl.id.slice("nfl-".length)
    );
    return { candidate, chronology, schoolMatch, canonicalStageIdentityMatch };
  });

  const supported = scored.filter(({ candidate, chronology, schoolMatch, canonicalStageIdentityMatch }) => {
    const cfb = subject.league === "CFB" ? subject : candidate;
    const nfl = subject.league === "NFL" ? subject : candidate;
    const bothOwnSchool = Boolean(cfb.school && nfl.school);

    if (chronology === false) return false;
    if (bothOwnSchool && !schoolMatch) return false;

    // Display name plus role only discovers candidates. The relationship itself
    // requires chronology, school, or matching canonical stage IDs. The latter is
    // product-owned identity evidence, not a runtime display-name fallback.
    return chronology === true || schoolMatch || canonicalStageIdentityMatch;
  });
  return supported.length === 1 ? [supported[0]!.candidate] : [];
}

/**
 * Canonical real-person relationship resolver for player-career subjects.
 * NFL and CFB career subjects remain distinct stage identities. Same-stage same-name
 * careers never merge, and ambiguous cross-stage names require position plus source
 * chronology/school support instead of normalized-name recovery.
 */
export function footballPlayerCareerSubjectsForPerson(subject: FootballSubjectProfile) {
  if (subject.kind !== "player-career") return [subject] as const;
  const sameName = footballPlayerCareerSubjectsByPerson.get(normalizedFootballSubjectName(subject.name)) ?? [subject];
  return [
    subject,
    ...footballPlayerCareerCrossStageCandidates(subject, sameName),
  ];
}

function matchesFootballSubject(subject: FootballSubjectProfile, query: FootballSubjectQuery) {
  // NFL and CFB careers are separate query identities. `leagues` remains compatibility metadata on older factual rows,
  // but it must not make an NFL career answer a CFB query (or vice versa).
  if (query.kind && subject.kind !== query.kind) return false;
  if (query.league && subject.league !== query.league) return false;
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
  // Source-depth does not appear in normal queries merely because a provider is named.
  if (query.sourceProvider && query.sourceProvider !== "octagon-hq" && !query.includeProjectedSourceSubjects) return [];
  const canonicalUniverse = query.includeProjectedCanonicalRecognition
    ? projectedCanonicalSubjects
    : footballSubjects;
  const rawPlayerSourceRowsCanMatch = (
    query.casualEligible !== true
    && (!query.recognizabilityTiers || query.recognizabilityTiers.includes("D"))
  );
  const sourceSubjects = rawPlayerSourceRowsCanMatch
    ? projectedSourceSubjects
    : projectedProductSourceSubjects;
  const universe = query.includeProjectedSourceSubjects
    ? [...canonicalUniverse, ...sourceSubjects, ...projectedAdditionalSubjects]
    : canonicalUniverse;
  return universe.filter((subject) => matchesFootballSubject(subject, query));
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
