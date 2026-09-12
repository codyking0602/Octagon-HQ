import projectionJson from "../../../data/generated/football/recognizability-projection.json";
import {
  footballCanonicalSubjects,
  type FootballCanonicalSubject,
  type FootballCanonicalPosition,
} from "./footballFactualStatsCatalog";
import { footballHistoricalPoolRecognitionRecords } from "./footballHistoricalPoolRecognitionEvidence";
import { footballNflCoachRecognitionProjectionSubjects } from "./footballNflCoachRecognitionProjection";
import { footballHistoricalRecognitionRepairs } from "./footballHistoricalRecognitionRepairs";
import { footballProHallRecognitionCandidates } from "./footballProHallRecognitionCompletenessEvidence";
import {
  footballRecognitionEvidenceFor,
  footballRecognitionEvidenceRecords,
  footballRecognitionEvidenceSubjects,
  type FootballRecognitionIdentitySubject,
} from "./footballRecognitionEvidence";
import { applyFootballHistoricalRecognitionPolicy } from "./footballRecognitionHistoricalPolicy";
import type { FootballRecognizabilityTier, FootballSourceProviderId } from "./footballSubjectEligibility";

interface ProjectionRecord {
  id: string;
  kind: string;
  name: string;
  league: "NFL" | "CFB";
  position?: FootballCanonicalPosition;
  school?: string;
  startSeason?: number;
  endSeason?: number;
  tier: FootballRecognizabilityTier;
  sourceProvider: string;
  sourceId: string;
}

interface CanonicalPlayerSourceBinding {
  canonicalId: string;
  league: "NFL" | "CFB";
  sourceProvider: "nflverse" | "cfbfastR";
  sourceId: string;
  sourceSubjectId: string;
}

type FootballProjectedNonPlayerIdentitySubject = Omit<FootballRecognitionIdentitySubject, "kind"> & {
  kind: Exclude<FootballRecognitionIdentitySubject["kind"], "era">;
};
type FootballEvidenceNewKindSubject = Omit<FootballRecognitionIdentitySubject, "kind"> & {
  kind: "franchise" | "game" | "era" | "coach";
};

type FootballRecognitionFloorIdentity = {
  kind: string;
  league: "NFL" | "CFB";
  name: string;
  aliases?: readonly string[];
};

export interface FootballProjectedNonPlayerRecognitionSubject {
  subject: FootballProjectedNonPlayerIdentitySubject;
  tier: FootballRecognizabilityTier;
  sourceIdentityKey?: { provider: FootballSourceProviderId; id: string };
}

type NflPlayerSourceTuple = readonly [
  sourceId: string,
  name: string,
  position: string,
  startSeason: number,
  endSeason: number,
];
type CfbPlayerSourceTuple = readonly [
  sourceId: string,
  name: string,
  position: string,
  school: string,
  startSeason: number,
  endSeason: number,
];
function parseNflPlayerSourceTuples(
  rows: readonly (readonly (string | number)[])[],
): readonly NflPlayerSourceTuple[] {
  return rows.map((row, index) => {
    if (
      row.length !== 5
      || typeof row[0] !== "string"
      || typeof row[1] !== "string"
      || typeof row[2] !== "string"
      || typeof row[3] !== "number"
      || typeof row[4] !== "number"
    ) {
      throw new Error(`Invalid NFL player source tuple at index ${index}.`);
    }
    return [row[0], row[1], row[2], row[3], row[4]];
  });
}

function parseCfbPlayerSourceTuples(
  rows: readonly (readonly (string | number)[])[],
): readonly CfbPlayerSourceTuple[] {
  return rows.map((row, index) => {
    if (
      row.length !== 6
      || typeof row[0] !== "string"
      || typeof row[1] !== "string"
      || typeof row[2] !== "string"
      || typeof row[3] !== "string"
      || typeof row[4] !== "number"
      || typeof row[5] !== "number"
    ) {
      throw new Error(`Invalid CFB player source tuple at index ${index}.`);
    }
    return [row[0], row[1], row[2], row[3], row[4], row[5]];
  });
}

function projectionSourceSlug(name: string) {
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function optionalSeason(value: number) {
  return value > 0 ? value : undefined;
}

function optionalPosition(value: string) {
  return value ? value as FootballCanonicalPosition : undefined;
}

const promotedRecords = projectionJson.records as readonly ProjectionRecord[];
const canonicalPlayerSourceBindings = (
  projectionJson as typeof projectionJson & {
    canonicalPlayerSourceBindings?: readonly CanonicalPlayerSourceBinding[];
  }
).canonicalPlayerSourceBindings ?? [];
const canonicalPlayerSourceBindingByCanonicalId = new Map(
  canonicalPlayerSourceBindings.map((binding) => [binding.canonicalId, binding]),
);
const canonicalPlayerSourceBindingBySourceSubjectId = new Map(
  canonicalPlayerSourceBindings.map((binding) => [binding.sourceSubjectId, binding]),
);

const canonicalCatalogPlayerIdByIdentityId = new Map<string, string>();
for (const subject of footballCanonicalSubjects) {
  if (subject.kind !== "player-career") continue;
  const ids = [subject.id, ...(subject.aliases ?? [])];
  for (const id of ids) canonicalCatalogPlayerIdByIdentityId.set(id, subject.id);
  const bareId = subject.id.replace(/^(?:nfl|cfb)-/, "");
  canonicalCatalogPlayerIdByIdentityId.set(
    `${subject.league === "NFL" ? "nfl" : "cfb"}-${bareId}`,
    subject.id,
  );
}

function canonicalCatalogPlayerId(subjectId: string) {
  return canonicalCatalogPlayerIdByIdentityId.get(subjectId) ?? subjectId;
}
const nflPlayerSourceRegistry = parseNflPlayerSourceTuples(projectionJson.playerSourceRegistry?.nfl ?? []);
const cfbPlayerSourceRegistry = parseCfbPlayerSourceTuples(projectionJson.playerSourceRegistry?.cfb ?? []);
const registryPlayerRecords: ProjectionRecord[] = [
  ...nflPlayerSourceRegistry.map(([sourceId, name, position, startSeason, endSeason]) => ({
    id: `nflverse-player-${sourceId}`,
    kind: "player-career",
    name,
    league: "NFL" as const,
    position: optionalPosition(position),
    startSeason: optionalSeason(startSeason),
    endSeason: optionalSeason(endSeason),
    tier: "D" as const,
    sourceProvider: "nflverse",
    sourceId,
  })),
  ...cfbPlayerSourceRegistry.map(([sourceId, name, position, school, startSeason, endSeason]) => ({
    id: `cfbfast-r-player-${sourceId}-${projectionSourceSlug(name)}`,
    kind: "player-career",
    name,
    league: "CFB" as const,
    position: optionalPosition(position),
    school: school || undefined,
    startSeason: optionalSeason(startSeason),
    endSeason: optionalSeason(endSeason),
    tier: "D" as const,
    sourceProvider: "cfbfastR",
    sourceId,
  })),
];
const playerRecordById = new Map(registryPlayerRecords.map((record) => [record.id, record]));
for (const record of promotedRecords) {
  if (record.kind === "player-career") playerRecordById.set(record.id, record);
}
const playerRecords = [...playerRecordById.values()];
const nonPlayerRecords = promotedRecords.filter((record) => record.kind !== "player-career");

function activeDecades(startSeason?: number, endSeason?: number) {
  if (startSeason == null || endSeason == null) return undefined;
  return Array.from(
    { length: Math.floor(endSeason / 10) - Math.floor(startSeason / 10) + 1 },
    (_, index) => (Math.floor(startSeason / 10) + index) * 10,
  );
}

function normalizedProjectionName(name: string) {
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

const TIER_RANK: Readonly<Record<FootballRecognizabilityTier, number>> = { D: 0, C: 1, B: 2, A: 3 };
function recognitionTierAtLeast(
  currentTier: FootballRecognizabilityTier,
  minimumTier?: "A" | "B" | null,
): FootballRecognizabilityTier {
  if (!minimumTier || TIER_RANK[currentTier] >= TIER_RANK[minimumTier]) return currentTier;
  return minimumTier;
}

const proHallMinimumTierByKindLeagueAndName = new Map<string, "A" | "B">();
for (const candidate of footballProHallRecognitionCandidates) {
  for (const identityName of [candidate.name, ...(candidate.identityAliases ?? [])]) {
    const key = `${candidate.kind}:${candidate.league}:${normalizedProjectionName(identityName)}`;
    const current = proHallMinimumTierByKindLeagueAndName.get(key);
    proHallMinimumTierByKindLeagueAndName.set(
      key,
      current ? recognitionTierAtLeast(current, candidate.minimumTier) as "A" | "B" : candidate.minimumTier,
    );
  }
}

function proHallMinimumTierFor(subject: FootballRecognitionFloorIdentity) {
  if (subject.league !== "NFL" || (subject.kind !== "player-career" && subject.kind !== "coach")) return null;
  const minimums = [subject.name, ...(subject.aliases ?? [])]
    .map((identityName) => proHallMinimumTierByKindLeagueAndName.get(
      `${subject.kind}:${subject.league}:${normalizedProjectionName(identityName)}`,
    ))
    .filter((tier): tier is "A" | "B" => tier != null);
  return minimums.reduce<"A" | "B" | null>((strongest, tier) => {
    if (!strongest) return tier;
    return recognitionTierAtLeast(strongest, tier) as "A" | "B";
  }, null);
}

// Registration, canonical ownership, and eligibility are separate concerns.
// Every exact source row is registered independently; only generated explicit
// canonical bindings can turn source recognition/facts into product identity.
const promotedPlayerRecords = promotedRecords.filter((record) => record.kind === "player-career");

function canonicalReviewedPlayerId(subjectId: string) {
  const boundCanonicalId = canonicalPlayerSourceBindingBySourceSubjectId.get(subjectId)?.canonicalId;
  return canonicalCatalogPlayerId(boundCanonicalId ?? subjectId);
}

function canonicalizeReviewedPlayerSubject(subject: FootballCanonicalSubject): FootballCanonicalSubject {
  if (subject.kind !== "player-career") return subject;
  const canonicalId = canonicalReviewedPlayerId(subject.id);
  if (canonicalId === subject.id) return subject;
  return {
    ...subject,
    id: canonicalId,
    aliases: [...new Set([...(subject.aliases ?? []), subject.id])],
  };
}

const historicalPlayerRepairs = footballHistoricalRecognitionRepairs
  .filter((repair) => repair.subject.kind === "player-career")
  .map((repair) => ({ ...repair, subject: canonicalizeReviewedPlayerSubject(repair.subject) }));
const historicalNonPlayerRepairs = footballHistoricalRecognitionRepairs.filter(
  (repair) => repair.subject.kind !== "player-career",
);
const historicalById = new Map([
  ...historicalNonPlayerRepairs.map((repair) => [repair.subject.id, repair] as const),
  ...historicalPlayerRepairs.map((repair) => [repair.subject.id, repair] as const),
]);
const recognitionEvidenceById = new Map(
  footballRecognitionEvidenceRecords.map((record) => [canonicalReviewedPlayerId(record.id), record] as const),
);
const historicalByKindLeagueAndName = new Map<string, typeof footballHistoricalRecognitionRepairs[number][]>();
for (const repair of footballHistoricalRecognitionRepairs) {
  const key = `${repair.subject.kind}:${repair.subject.league}:${normalizedProjectionName(repair.subject.name)}`;
  const values = historicalByKindLeagueAndName.get(key) ?? [];
  values.push(repair);
  historicalByKindLeagueAndName.set(key, values);
}

function historicalRepairFor(subject: FootballCanonicalSubject) {
  const canonicalSubjectId = subject.kind === "player-career"
    ? canonicalCatalogPlayerId(subject.id)
    : subject.id;
  const direct = historicalById.get(canonicalSubjectId);
  if (direct) return direct;

  // Player ownership never falls back to display-name reconciliation at runtime.
  // Exact source rows remain source-only, and canonical player repairs were
  // canonicalized above through explicit source binding or stage-scoped IDs.
  if (subject.kind === "player-career") return null;

  const matches = historicalByKindLeagueAndName.get(
    `${subject.kind}:${subject.league}:${normalizedProjectionName(subject.name)}`,
  ) ?? [];
  if (matches.length === 1) return matches[0]!;
  return null;
}

export const footballProjectedPlayerSourceSubjects: readonly FootballCanonicalSubject[] = registryPlayerRecords.map((record) => ({
  id: record.id,
  name: record.name,
  kind: "player-career",
  league: record.league,
  position: record.position,
  school: record.school,
  startSeason: record.startSeason,
  endSeason: record.endSeason,
  activeDecades: activeDecades(record.startSeason, record.endSeason),
}));

const generatedProjectedPlayerSubjects: readonly FootballCanonicalSubject[] = promotedPlayerRecords.flatMap((record) => {
  const binding = canonicalPlayerSourceBindingBySourceSubjectId.get(record.id);
  if (!binding) return [];
  return [{
    id: binding.canonicalId,
    name: record.name,
    kind: "player-career" as const,
    league: record.league,
    position: record.position,
    school: record.school,
    startSeason: record.startSeason,
    endSeason: record.endSeason,
    activeDecades: activeDecades(record.startSeason, record.endSeason),
  }];
});

const evidencePlayerSubjects = footballRecognitionEvidenceSubjects
  .filter((subject): subject is FootballCanonicalSubject => subject.kind === "player-career")
  .map(canonicalizeReviewedPlayerSubject);
const repairedPlayerSubjects = historicalPlayerRepairs.map((repair) => repair.subject);
const reviewedPlayerIds = new Set(
  [...evidencePlayerSubjects, ...repairedPlayerSubjects].map((subject) => subject.id),
);

/**
 * One projected player universe. Exact reviewed ids replace exact generated ids;
 * display-name/position equality never suppresses another source identity.
 */
export const footballProjectedPlayerSubjects: readonly FootballCanonicalSubject[] = [
  ...generatedProjectedPlayerSubjects.filter((subject) => !reviewedPlayerIds.has(subject.id)),
  ...evidencePlayerSubjects.filter((subject) => !historicalById.has(subject.id)),
  ...repairedPlayerSubjects,
];

const byId = new Map(playerRecords.map((record) => [record.id, record]));
const uniqueProjectionMatch = (values: readonly ProjectionRecord[]) => values.length === 1 ? values[0]! : null;

function projectionRecordForCanonicalId(canonicalId: string) {
  const resolvedCanonicalId = canonicalCatalogPlayerId(canonicalId);
  const binding = canonicalPlayerSourceBindingByCanonicalId.get(resolvedCanonicalId);
  return binding ? byId.get(binding.sourceSubjectId) ?? null : null;
}

export function footballCanonicalPlayerSourceBindingFor(canonicalId: string) {
  return canonicalPlayerSourceBindingByCanonicalId.get(canonicalCatalogPlayerId(canonicalId)) ?? null;
}

export function footballCanonicalPlayerSubjectIdForSourceSubjectId(sourceSubjectId: string) {
  return canonicalPlayerSourceBindingBySourceSubjectId.get(sourceSubjectId)?.canonicalId ?? null;
}

export function footballRecognitionProjectionFor(subject: FootballCanonicalSubject) {
  const exactPlayerRecord = subject.kind === "player-career" ? byId.get(subject.id) : undefined;
  if (exactPlayerRecord) {
    const provider: FootballSourceProviderId = exactPlayerRecord.league === "NFL" ? "nflverse" : "cfbfastR";
    return {
      tier: "D" as const,
      sourceIdentityKey: { provider, id: exactPlayerRecord.sourceId } as const,
    };
  }

  const proHallMinimumTier = proHallMinimumTierFor(subject);
  const directHistorical = historicalById.get(subject.id);
  const historical = directHistorical ?? historicalRepairFor(subject);
  const production = subject.kind === "player-career"
    ? projectionRecordForCanonicalId(subject.id)
    : null;

  if (historical) {
    const tier = recognitionTierAtLeast(historical.tier, proHallMinimumTier);
    if (production) {
      const provider: FootballSourceProviderId = production.league === "NFL" ? "nflverse" : "cfbfastR";
      return { tier, sourceIdentityKey: { provider, id: production.sourceId } as const };
    }
    return {
      tier,
      sourceIdentityKey: {
        provider: subject.league === "NFL" ? "nfl-honors" : "official-cfb-awards",
        id: `stage13-5:${historical.subject.id}`,
      } as const,
    };
  }

  const directEvidence = recognitionEvidenceById.get(canonicalCatalogPlayerId(subject.id));
  const evidence = directEvidence
    ?? (subject.kind === "player-career" ? null : footballRecognitionEvidenceFor(subject));
  if (evidence) {
    const sourceIdentityKey = production
      ? {
          provider: (production.league === "NFL" ? "nflverse" : "cfbfastR") as FootballSourceProviderId,
          id: production.sourceId,
        }
      : { provider: evidence.sourceProvider, id: evidence.sourceId };
    return {
      tier: recognitionTierAtLeast(evidence.tier, proHallMinimumTier),
      sourceIdentityKey,
    };
  }

  if (production) {
    const provider: FootballSourceProviderId = production.league === "NFL" ? "nflverse" : "cfbfastR";
    return {
      tier: recognitionTierAtLeast(production.tier, proHallMinimumTier),
      sourceIdentityKey: { provider, id: production.sourceId } as const,
    };
  }

  if (!proHallMinimumTier) return null;
  return {
    tier: proHallMinimumTier,
    sourceIdentityKey: {
      provider: "nfl-honors" as const,
      id: `pro-football-hall:${normalizedProjectionName(subject.name)}`,
    },
  };
}

export function footballProjectedPlayerRegistrationTier(subjectId: string): FootballRecognizabilityTier {
  if (byId.has(subjectId)) return "D";
  const directHistorical = historicalById.get(subjectId)?.tier;
  if (directHistorical) return directHistorical;
  const directEvidence = recognitionEvidenceById.get(subjectId)?.tier;
  return directEvidence ?? "D";
}

export function footballRecognitionProjectionSubjectIdFor(subject: FootballCanonicalSubject) {
  if (subject.kind === "player-career") {
    return footballCanonicalPlayerSourceBindingFor(subject.id)?.sourceSubjectId ?? null;
  }
  return historicalRepairFor(subject)?.subject.id
    ?? footballRecognitionEvidenceFor(subject)?.id
    ?? null;
}

function nonPlayerProjectionKind(subject: FootballCanonicalSubject) {
  if (subject.kind === "team-season") return "team-season";
  if (subject.kind === "program") return "program";
  if (subject.kind === "program-era") return "era";
  return null;
}

const nonPlayerBySourceIdentity = new Map(
  nonPlayerRecords.map((record) => [`${record.sourceProvider}:${record.sourceId}`, record]),
);
const nonPlayerByKindLeagueAndName = new Map<string, ProjectionRecord[]>();
for (const record of nonPlayerRecords) {
  const key = `${record.kind}:${record.league}:${normalizedProjectionName(record.name)}`;
  const values = nonPlayerByKindLeagueAndName.get(key) ?? [];
  values.push(record);
  nonPlayerByKindLeagueAndName.set(key, values);
}

const cfbProgramByName = new Map<string, ProjectionRecord[]>();
for (const record of nonPlayerRecords.filter((candidate) => candidate.kind === "program" && candidate.league === "CFB")) {
  const key = normalizedProjectionName(record.name);
  const values = cfbProgramByName.get(key) ?? [];
  values.push(record);
  cfbProgramByName.set(key, values);
}
const cfbProminentTeamSeasonsByProgram = new Map<string, ProjectionRecord[]>();
for (const record of nonPlayerRecords.filter((candidate) => candidate.kind === "team-season" && candidate.league === "CFB")) {
  if (record.startSeason == null) continue;
  const prefix = `${record.startSeason} `;
  if (!record.name.startsWith(prefix)) continue;
  const key = normalizedProjectionName(record.name.slice(prefix.length));
  const values = cfbProminentTeamSeasonsByProgram.get(key) ?? [];
  values.push(record);
  cfbProminentTeamSeasonsByProgram.set(key, values);
}

const canonicalNonPlayerRecognitionTiers = new Map<string, FootballRecognizabilityTier>([
  ["1972-miami-dolphins", "A"],
  ["1985-chicago-bears", "A"],
  ["1989-san-francisco-49ers", "B"],
  ["1991-washington", "B"],
  ["1996-green-bay-packers", "B"],
  ["1998-denver-broncos", "B"],
  ["1995-nebraska", "A"],
  ["2011-philadelphia-eagles", "C"],
  ["2022-denver-broncos", "C"],
  ["2020-jacksonville-jaguars", "C"],
  ["2017-cleveland-browns", "C"],
]);

function supportedProjectionProvider(record: ProjectionRecord): FootballSourceProviderId | null {
  if (record.sourceProvider === "nflverse" || record.sourceProvider === "cfbfastR") return record.sourceProvider;
  return null;
}
function derivedProgramEraTier(subject: FootballCanonicalSubject): FootballRecognizabilityTier | null {
  if (subject.kind !== "program-era" || subject.league !== "CFB" || !subject.school) return null;
  if (subject.startSeason == null || subject.endSeason == null) return null;
  const schoolKey = normalizedProjectionName(subject.school);
  if (!uniqueProjectionMatch(cfbProgramByName.get(schoolKey) ?? [])) return null;
  const prominentSeasons = (cfbProminentTeamSeasonsByProgram.get(schoolKey) ?? [])
    .filter((record) => record.startSeason! >= subject.startSeason! && record.startSeason! <= subject.endSeason!);
  return prominentSeasons.length >= 2 ? "C" : null;
}

export function footballNonPlayerRecognitionProjectionFor(
  subject: FootballCanonicalSubject,
  sourceIdentityKey?: { provider: FootballSourceProviderId; id: string },
) {
  const historical = historicalRepairFor(subject);
  if (historical) {
    return { tier: historical.tier };
  }
  const projectionKind = nonPlayerProjectionKind(subject);
  if (!projectionKind) return null;
  let record: ProjectionRecord | null = null;
  if (sourceIdentityKey) {
    const direct = nonPlayerBySourceIdentity.get(`${sourceIdentityKey.provider}:${sourceIdentityKey.id}`);
    if (direct?.kind === projectionKind && direct.league === subject.league) record = direct;
  }
  if (!record) {
    const sameName = nonPlayerByKindLeagueAndName.get(
      `${projectionKind}:${subject.league}:${normalizedProjectionName(subject.name)}`,
    ) ?? [];
    const sameWindow = sameName.filter((candidate) => (
      (subject.startSeason == null || candidate.startSeason === subject.startSeason)
      && (subject.endSeason == null || candidate.endSeason === subject.endSeason)
      && (subject.season == null || (candidate.startSeason === subject.season && candidate.endSeason === subject.season))
    ));
    record = uniqueProjectionMatch(sameWindow);
  }
  const proposedTier = record?.tier
    ?? canonicalNonPlayerRecognitionTiers.get(subject.id)
    ?? derivedProgramEraTier(subject);
  if (!proposedTier) return null;
  const tier = applyFootballHistoricalRecognitionPolicy(
    subject.id,
    subject.league,
    subject.endSeason ?? subject.season,
    proposedTier,
  ) as FootballRecognizabilityTier;
  const provider = record ? supportedProjectionProvider(record) : null;
  return {
    tier,
    ...(provider ? { sourceIdentityKey: { provider, id: record!.sourceId } as const } : {}),
  };
}

const generatedNewKindRecords = nonPlayerRecords.filter((record) => (
  record.kind === "franchise" && record.tier !== "D"
));
const evidenceNewKindSubjects = footballRecognitionEvidenceSubjects.filter(
  (subject): subject is FootballEvidenceNewKindSubject => (
    subject.kind === "franchise" || subject.kind === "game" || subject.kind === "era" || subject.kind === "coach"
  ),
);
const repairNonPlayerIds = new Set(historicalNonPlayerRepairs.map((repair) => repair.subject.id));
const evidenceNewKindIds = new Set(evidenceNewKindSubjects.map((subject) => subject.id));
const historicalPoolRecognitionIds = new Set(
  footballHistoricalPoolRecognitionRecords.map((record) => record.subject.id),
);
function normalizeEvidenceNonPlayerSubject(subject: FootballEvidenceNewKindSubject): FootballProjectedNonPlayerIdentitySubject {
  if (subject.kind === "era") return { ...subject, kind: "program-era" };
  return subject as FootballProjectedNonPlayerIdentitySubject;
}

const reviewedHistoricalPoolSubjects: readonly FootballProjectedNonPlayerRecognitionSubject[] =
  footballHistoricalPoolRecognitionRecords
    .map((record) => ({
      subject: normalizeEvidenceNonPlayerSubject(record.subject as FootballEvidenceNewKindSubject),
      tier: applyFootballHistoricalRecognitionPolicy(
        record.subject.id,
        record.subject.league,
        record.subject.endSeason ?? record.subject.season,
        record.tier,
      ) as FootballRecognizabilityTier,
      sourceIdentityKey: record.sourceIdentityKey,
    }))
    .filter((row) => row.tier !== "D");

export const footballProjectedNonPlayerRecognitionSubjects: readonly FootballProjectedNonPlayerRecognitionSubject[] = [
  ...generatedNewKindRecords
    .filter((record) => !evidenceNewKindIds.has(record.id) && !repairNonPlayerIds.has(record.id))
    .map((record) => ({ record, tier: applyFootballHistoricalRecognitionPolicy(record.id, record.league, record.endSeason, record.tier) }))
    .filter(({ tier }) => tier !== "D")
    .map(({ record, tier }) => ({
      subject: {
        id: record.id,
        name: record.name,
        kind: "franchise" as const,
        league: record.league,
        startSeason: record.startSeason,
        endSeason: record.endSeason,
        activeDecades: activeDecades(record.startSeason, record.endSeason),
      },
      tier: tier as FootballRecognizabilityTier,
      ...(supportedProjectionProvider(record) ? {
        sourceIdentityKey: { provider: supportedProjectionProvider(record)!, id: record.sourceId },
      } : {}),
    })),
  ...footballNflCoachRecognitionProjectionSubjects,
  ...evidenceNewKindSubjects
    .filter((subject) => !repairNonPlayerIds.has(subject.id) && !historicalPoolRecognitionIds.has(subject.id))
    .map((subject) => {
      const evidence = footballRecognitionEvidenceFor(subject)!;
      const hallFloor = proHallMinimumTierFor({
        kind: subject.kind === "era" ? "program-era" : subject.kind,
        league: subject.league,
        name: subject.name,
        aliases: subject.aliases,
      });
      return {
        subject: normalizeEvidenceNonPlayerSubject(subject),
        tier: applyFootballHistoricalRecognitionPolicy(
          subject.id,
          subject.league,
          subject.endSeason ?? subject.season,
          recognitionTierAtLeast(evidence.tier, hallFloor),
        ) as FootballRecognizabilityTier,
        sourceIdentityKey: { provider: evidence.sourceProvider, id: evidence.sourceId },
      };
    })
    .filter((row) => row.tier !== "D"),
  ...reviewedHistoricalPoolSubjects,
  ...historicalNonPlayerRepairs
    .filter((repair) => !historicalPoolRecognitionIds.has(repair.subject.id))
    .map((repair) => ({
      subject: repair.subject as FootballProjectedNonPlayerIdentitySubject,
      tier: recognitionTierAtLeast(repair.tier, proHallMinimumTierFor(repair.subject)),
      sourceIdentityKey: {
        provider: repair.subject.league === "NFL" ? "nfl-honors" as const : "official-cfb-awards" as const,
        id: `stage13-5:${repair.subject.id}`,
      },
    })),
];

export const FOOTBALL_RECOGNITION_MANUAL_APPROVAL_NAMES = projectionJson.manualApprovals as readonly string[];
export const FOOTBALL_RECOGNITION_SUMMARY = projectionJson.summary;
