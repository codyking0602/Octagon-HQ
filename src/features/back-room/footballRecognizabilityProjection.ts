import projectionJson from "../../../data/generated/football/recognizability-projection.json";
import type { FootballCanonicalSubject, FootballCanonicalPosition } from "./footballFactualStatsCatalog";
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

const records = projectionJson.records as readonly ProjectionRecord[];
const playerRecords = records.filter((record) => record.kind === "player-career");

/** Promoted source-player identities only. Non-player PR6 records remain build-time/audit projections until their consumer migrations. */
export const footballProjectedPlayerSubjects: readonly FootballCanonicalSubject[] = playerRecords.map((record) => ({
  id: record.id,
  name: record.name,
  kind: "player-career",
  league: record.league,
  position: record.position,
  school: record.school,
  startSeason: record.startSeason,
  endSeason: record.endSeason,
  activeDecades: record.startSeason == null || record.endSeason == null ? undefined : Array.from(
    { length: Math.floor(record.endSeason / 10) - Math.floor(record.startSeason / 10) + 1 },
    (_, index) => (Math.floor(record.startSeason! / 10) + index) * 10,
  ),
}));

const byId = new Map(playerRecords.map((record) => [record.id, record]));
const byLeagueAndName = new Map<string, ProjectionRecord[]>();
for (const record of playerRecords) {
  const key = `${record.league}:${record.name.toLowerCase()}`;
  const values = byLeagueAndName.get(key) ?? [];
  values.push(record);
  byLeagueAndName.set(key, values);
}

function resolveProjectionRecordFor(subject: FootballCanonicalSubject) {
  const direct = byId.get(subject.id)
    ?? (subject.aliases ?? []).map((alias) => byId.get(alias)).find((value) => value != null);
  const sameName = byLeagueAndName.get(`${subject.league}:${subject.name.toLowerCase()}`) ?? [];
  return direct ?? (sameName.length === 1 ? sameName[0] : null);
}

export function footballRecognitionProjectionFor(subject: FootballCanonicalSubject) {
  const record = resolveProjectionRecordFor(subject);
  if (!record) return null;
  const provider: FootballSourceProviderId = record.league === "NFL" ? "nflverse" : "cfbfastR";
  return { tier: record.tier, sourceIdentityKey: { provider, id: record.sourceId } as const };
}

/**
 * The source-projection subject id is also a stable reconciliation alias when PR6 uniquely matched that row to a
 * curated canonical player. Consumers can therefore collapse source-backed facts onto the canonical person instead
 * of retaining an orphan source-only record.
 */
export function footballRecognitionProjectionSubjectIdFor(subject: FootballCanonicalSubject) {
  return resolveProjectionRecordFor(subject)?.id ?? null;
}

export const FOOTBALL_RECOGNITION_MANUAL_APPROVAL_NAMES = projectionJson.manualApprovals as readonly string[];
export const FOOTBALL_RECOGNITION_SUMMARY = projectionJson.summary;