import projectionJson from "../../../data/generated/football/recognizability-projection.json";
import type { FootballCanonicalSubject, FootballCanonicalPosition } from "./footballFactualStatsCatalog";
import {
  footballRecognitionEvidenceFor,
  footballRecognitionEvidenceSubjects,
  type FootballRecognitionIdentitySubject,
} from "./footballRecognitionEvidence";
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

function normalizedProjectionName(name: string) {
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

const evidencePlayerSubjects = footballRecognitionEvidenceSubjects
  .filter((subject): subject is FootballCanonicalSubject => subject.kind === "player-career");
const evidencePlayerKeys = new Set(evidencePlayerSubjects.map((subject) => (
  `${subject.league}:${normalizedProjectionName(subject.name)}:${subject.position ?? ""}`
)));

/**
 * One projected player universe. Recognition evidence wins identity/pool conflicts, while the large production
 * projection remains intact for everyone it already promotes. This is an input to the canonical registry, not a game roster.
 */
export const footballProjectedPlayerSubjects: readonly FootballCanonicalSubject[] = [
  ...generatedProjectedPlayerSubjects.filter((subject) => !evidencePlayerKeys.has(
    `${subject.league}:${normalizedProjectionName(subject.name)}:${subject.position ?? ""}`,
  )),
  ...evidencePlayerSubjects,
];

const byId = new Map(playerRecords.map((record) => [record.id, record]));
const byLeagueAndName = new Map<string, ProjectionRecord[]>();
for (const record of playerRecords) {
  const key = `${record.league}:${record.name.toLowerCase()}`;
  const values = byLeagueAndName.get(key) ?? [];
  values.push(record);
  byLeagueAndName.set(key, values);
}

function uniqueProjectionMatch(records: readonly ProjectionRecord[]) {
  return records.length === 1 ? records[0]! : null;
}

function resolveProjectionRecordFor(subject: FootballCanonicalSubject) {
  // This production projection is explicitly player-career-only. A same-name coach must never inherit a player row.
  if (subject.kind !== "player-career") return null;

  const direct = byId.get(subject.id)
    ?? (subject.aliases ?? []).map((alias) => byId.get(alias)).find((value) => value != null);
  if (direct) return direct;

  const sameName = byLeagueAndName.get(`${subject.league}:${subject.name.toLowerCase()}`) ?? [];
  if (sameName.length <= 1) return sameName[0] ?? null;

  if (subject.position) {
    const samePosition = sameName.filter((record) => record.position === subject.position);
    const uniquePosition = uniqueProjectionMatch(samePosition);
    if (uniquePosition) return uniquePosition;
  }
  if (subject.school) {
    const sameSchool = sameName.filter((record) => record.school === subject.school);
    const uniqueSchool = uniqueProjectionMatch(sameSchool);
    if (uniqueSchool) return uniqueSchool;
  }
  if (subject.league === "NFL" && subject.draftYear != null) {
    const sameStartSeason = sameName.filter((record) => record.startSeason === subject.draftYear);
    const uniqueStartSeason = uniqueProjectionMatch(sameStartSeason);
    if (uniqueStartSeason) return uniqueStartSeason;
  }
  return null;
}

export function footballRecognitionProjectionFor(subject: FootballCanonicalSubject) {
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

/**
 * Keep production-source reconciliation stable even when stronger recognition evidence determines tier. That preserves
 * the source-backed factual bridge while letting recognition evidence answer only who belongs in A-C.
 */
export function footballRecognitionProjectionSubjectIdFor(subject: FootballCanonicalSubject) {
  return resolveProjectionRecordFor(subject)?.id ?? footballRecognitionEvidenceFor(subject)?.id ?? null;
}

function nonPlayerProjectionKind(subject: FootballCanonicalSubject) {
  if (subject.kind === "team-season") return "team-season";
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
  ["1972-miami-dolphins", "C"],
  ["1985-chicago-bears", "C"],
  ["1989-san-francisco-49ers", "C"],
  ["1991-washington", "C"],
  ["1996-green-bay-packers", "C"],
  ["1998-denver-broncos", "C"],
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

  if (!record) {
    const canonicalTier = canonicalNonPlayerRecognitionTiers.get(subject.id);
    if (canonicalTier) return { tier: canonicalTier };
    const derivedTier = derivedProgramEraTier(subject);
    return derivedTier ? { tier: derivedTier } : null;
  }
  const provider = supportedProjectionProvider(record);
  return {
    tier: record.tier,
    ...(provider ? { sourceIdentityKey: { provider, id: record.sourceId } as const } : {}),
  };
}

// Generated relationship sources can safely expose league/franchise and Super Bowl-game identities. Coaching eras and
// additional coaches use explicit Stage 12 evidence instead of blindly promoting every source coaching stint.
const generatedNewKindRecords = nonPlayerRecords.filter((record) => (
  (record.kind === "franchise" || record.kind === "game") && record.tier !== "D"
));
const evidenceNewKindSubjects = footballRecognitionEvidenceSubjects.filter(
  (subject): subject is FootballEvidenceNewKindSubject => (
    subject.kind === "franchise" || subject.kind === "game" || subject.kind === "era" || subject.kind === "coach"
  ),
);
const evidenceNewKindIds = new Set(evidenceNewKindSubjects.map((subject) => subject.id));

export const footballProjectedNonPlayerRecognitionSubjects: readonly FootballProjectedNonPlayerRecognitionSubject[] = [
  ...generatedNewKindRecords
    .filter((record) => !evidenceNewKindIds.has(record.id))
    .map((record) => ({
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
      tier: record.tier,
      ...(supportedProjectionProvider(record) ? {
        sourceIdentityKey: { provider: supportedProjectionProvider(record)!, id: record.sourceId },
      } : {}),
    })),
  ...evidenceNewKindSubjects.map((subject) => {
    const evidence = footballRecognitionEvidenceFor(subject)!;
    const normalizedSubject: FootballProjectedNonPlayerIdentitySubject = subject.kind === "era"
      ? { ...subject, kind: "program-era" }
      : subject;
    return {
      subject: normalizedSubject,
      tier: evidence.tier,
      sourceIdentityKey: { provider: evidence.sourceProvider, id: evidence.sourceId },
    };
  }),
];

export const FOOTBALL_RECOGNITION_MANUAL_APPROVAL_NAMES = projectionJson.manualApprovals as readonly string[];
export const FOOTBALL_RECOGNITION_SUMMARY = projectionJson.summary;