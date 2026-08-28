import projectionJson from "../../../data/generated/football/recognizability-projection.json";
import type { FootballCanonicalSubject, FootballCanonicalPosition } from "./footballFactualStatsCatalog";
import { footballHistoricalRecognitionRepairs } from "./footballHistoricalRecognitionRepairs";
import {
  footballRecognitionEvidenceFor,
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

type FootballProjectedNonPlayerIdentitySubject = Omit<FootballRecognitionIdentitySubject, "kind"> & {
  kind: Exclude<FootballRecognitionIdentitySubject["kind"], "era">;
};
type FootballEvidenceNewKindSubject = Omit<FootballRecognitionIdentitySubject, "kind"> & {
  kind: "franchise" | "game" | "era" | "coach";
};

export interface FootballProjectedNonPlayerRecognitionSubject {
  subject: FootballProjectedNonPlayerIdentitySubject;
  tier: FootballRecognizabilityTier;
  sourceIdentityKey?: { provider: FootballSourceProviderId; id: string };
}

const records = projectionJson.records as readonly ProjectionRecord[];
const playerRecords = records.filter((record) => record.kind === "player-career");
const promotedPlayerRecords = playerRecords.filter((record) => record.tier !== "D");
const nonPlayerRecords = records.filter((record) => record.kind !== "player-career");

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

const historicalPlayerRepairs = footballHistoricalRecognitionRepairs.filter(
  (repair) => repair.subject.kind === "player-career",
);
const historicalNonPlayerRepairs = footballHistoricalRecognitionRepairs.filter(
  (repair) => repair.subject.kind !== "player-career",
);
const historicalById = new Map(footballHistoricalRecognitionRepairs.map((repair) => [repair.subject.id, repair]));
const historicalByKindLeagueAndName = new Map<string, typeof footballHistoricalRecognitionRepairs[number][]>();
for (const repair of footballHistoricalRecognitionRepairs) {
  const key = `${repair.subject.kind}:${repair.subject.league}:${normalizedProjectionName(repair.subject.name)}`;
  const values = historicalByKindLeagueAndName.get(key) ?? [];
  values.push(repair);
  historicalByKindLeagueAndName.set(key, values);
}

function historicalRepairFor(subject: FootballCanonicalSubject) {
  const direct = historicalById.get(subject.id);
  if (direct) return direct;
  const matches = historicalByKindLeagueAndName.get(
    `${subject.kind}:${subject.league}:${normalizedProjectionName(subject.name)}`,
  ) ?? [];
  if (matches.length === 1) return matches[0]!;
  if (subject.position) {
    const samePosition = matches.filter((repair) => repair.subject.position === subject.position);
    if (samePosition.length === 1) return samePosition[0]!;
  }
  return null;
}

const generatedProjectedPlayerSubjects: readonly FootballCanonicalSubject[] = promotedPlayerRecords.map((record) => ({
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

const evidencePlayerSubjects = footballRecognitionEvidenceSubjects
  .filter((subject): subject is FootballCanonicalSubject => subject.kind === "player-career");
const repairedPlayerSubjects = historicalPlayerRepairs.map((repair) => repair.subject);
const authoritativePlayerKeys = new Set(
  [...evidencePlayerSubjects, ...repairedPlayerSubjects].map((subject) => (
    `${subject.league}:${normalizedProjectionName(subject.name)}:${subject.position ?? ""}`
  )),
);

/** One projected player universe. Reviewed recognition evidence wins source-production identity conflicts. */
export const footballProjectedPlayerSubjects: readonly FootballCanonicalSubject[] = [
  ...generatedProjectedPlayerSubjects.filter((subject) => !authoritativePlayerKeys.has(
    `${subject.league}:${normalizedProjectionName(subject.name)}:${subject.position ?? ""}`,
  )),
  ...evidencePlayerSubjects.filter((subject) => !historicalById.has(subject.id)),
  ...repairedPlayerSubjects,
];

const byId = new Map(playerRecords.map((record) => [record.id, record]));
const byLeagueAndName = new Map<string, ProjectionRecord[]>();
for (const record of playerRecords) {
  const key = `${record.league}:${record.name.toLowerCase()}`;
  const values = byLeagueAndName.get(key) ?? [];
  values.push(record);
  byLeagueAndName.set(key, values);
}
const uniqueProjectionMatch = (values: readonly ProjectionRecord[]) => values.length === 1 ? values[0]! : null;

function resolveProjectionRecordFor(subject: FootballCanonicalSubject) {
  if (subject.kind !== "player-career") return null;
  const direct = byId.get(subject.id)
    ?? (subject.aliases ?? []).map((alias) => byId.get(alias)).find((value) => value != null);
  if (direct) return direct;
  const sameName = byLeagueAndName.get(`${subject.league}:${subject.name.toLowerCase()}`) ?? [];
  if (sameName.length <= 1) return sameName[0] ?? null;
  if (subject.position) {
    const samePosition = sameName.filter((record) => record.position === subject.position);
    const unique = uniqueProjectionMatch(samePosition);
    if (unique) return unique;
  }
  if (subject.school) {
    const sameSchool = sameName.filter((record) => record.school === subject.school);
    const unique = uniqueProjectionMatch(sameSchool);
    if (unique) return unique;
  }
  if (subject.league === "NFL" && subject.draftYear != null) {
    const sameStartSeason = sameName.filter((record) => record.startSeason === subject.draftYear);
    const unique = uniqueProjectionMatch(sameStartSeason);
    if (unique) return unique;
  }
  return null;
}

export function footballRecognitionProjectionFor(subject: FootballCanonicalSubject) {
  const historical = historicalRepairFor(subject);
  if (historical) {
    const production = resolveProjectionRecordFor(subject);
    if (production) {
      const provider: FootballSourceProviderId = production.league === "NFL" ? "nflverse" : "cfbfastR";
      return { tier: historical.tier, sourceIdentityKey: { provider, id: production.sourceId } as const };
    }
    return {
      tier: historical.tier,
      sourceIdentityKey: {
        provider: subject.league === "NFL" ? "nfl-honors" : "official-cfb-awards",
        id: `stage13-5:${historical.subject.id}`,
      } as const,
    };
  }
  const evidence = footballRecognitionEvidenceFor(subject);
  if (evidence) {
    return {
      tier: evidence.tier,
      sourceIdentityKey: { provider: evidence.sourceProvider, id: evidence.sourceId } as const,
    };
  }
  const record = resolveProjectionRecordFor(subject);
  if (!record) return null;
  const provider: FootballSourceProviderId = record.league === "NFL" ? "nflverse" : "cfbfastR";
  return { tier: record.tier, sourceIdentityKey: { provider, id: record.sourceId } as const };
}

export function footballRecognitionProjectionSubjectIdFor(subject: FootballCanonicalSubject) {
  return resolveProjectionRecordFor(subject)?.id
    ?? historicalRepairFor(subject)?.subject.id
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
  (record.kind === "franchise" || record.kind === "game") && record.tier !== "D"
));
const evidenceNewKindSubjects = footballRecognitionEvidenceSubjects.filter(
  (subject): subject is FootballEvidenceNewKindSubject => (
    subject.kind === "franchise" || subject.kind === "game" || subject.kind === "era" || subject.kind === "coach"
  ),
);
const repairNonPlayerIds = new Set(historicalNonPlayerRepairs.map((repair) => repair.subject.id));
const evidenceNewKindIds = new Set(evidenceNewKindSubjects.map((subject) => subject.id));
function normalizeEvidenceNonPlayerSubject(subject: FootballEvidenceNewKindSubject): FootballProjectedNonPlayerIdentitySubject {
  if (subject.kind === "era") return { ...subject, kind: "program-era" };
  return subject as FootballProjectedNonPlayerIdentitySubject;
}

export const footballProjectedNonPlayerRecognitionSubjects: readonly FootballProjectedNonPlayerRecognitionSubject[] = [
  ...generatedNewKindRecords
    .filter((record) => !evidenceNewKindIds.has(record.id) && !repairNonPlayerIds.has(record.id))
    .map((record) => ({ record, tier: applyFootballHistoricalRecognitionPolicy(record.id, record.league, record.endSeason, record.tier) }))
    .filter(({ tier }) => tier !== "D")
    .map(({ record, tier }) => ({
      subject: {
        id: record.id,
        name: record.name,
        kind: record.kind as "franchise" | "game",
        league: record.league,
        startSeason: record.startSeason,
        endSeason: record.endSeason,
        season: record.kind === "game" && record.startSeason === record.endSeason ? record.startSeason : undefined,
        activeDecades: activeDecades(record.startSeason, record.endSeason),
      },
      tier: tier as FootballRecognizabilityTier,
      ...(supportedProjectionProvider(record) ? {
        sourceIdentityKey: { provider: supportedProjectionProvider(record)!, id: record.sourceId },
      } : {}),
    })),
  ...evidenceNewKindSubjects
    .filter((subject) => !repairNonPlayerIds.has(subject.id))
    .map((subject) => {
      const evidence = footballRecognitionEvidenceFor(subject)!;
      return {
        subject: normalizeEvidenceNonPlayerSubject(subject),
        tier: applyFootballHistoricalRecognitionPolicy(
          subject.id,
          subject.league,
          subject.endSeason ?? subject.season,
          evidence.tier,
        ) as FootballRecognizabilityTier,
        sourceIdentityKey: { provider: evidence.sourceProvider, id: evidence.sourceId },
      };
    })
    .filter((row) => row.tier !== "D"),
  ...historicalNonPlayerRepairs.map((repair) => ({
    subject: repair.subject as FootballProjectedNonPlayerIdentitySubject,
    tier: repair.tier,
    sourceIdentityKey: {
      provider: repair.subject.league === "NFL" ? "nfl-honors" as const : "official-cfb-awards" as const,
      id: `stage13-5:${repair.subject.id}`,
    },
  })),
];

export const FOOTBALL_RECOGNITION_MANUAL_APPROVAL_NAMES = projectionJson.manualApprovals as readonly string[];
export const FOOTBALL_RECOGNITION_SUMMARY = projectionJson.summary;
