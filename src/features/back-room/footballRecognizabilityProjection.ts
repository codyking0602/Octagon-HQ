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
const promotedPlayerRecords = playerRecords.filter((record) => record.tier !== "D");

/** Promoted source-player identities only. Non-player PR6 records remain build-time/audit projections until their consumer migrations. */
export const footballProjectedPlayerSubjects: readonly FootballCanonicalSubject[] = promotedPlayerRecords.map((record) => ({
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

function uniqueProjectionMatch(records: readonly ProjectionRecord[]) {
  return records.length === 1 ? records[0]! : null;
}

function resolveProjectionRecordFor(subject: FootballCanonicalSubject) {
  // This projection is explicitly player-career-only. A same-name coach (for example Mike Vrabel)
  // must never inherit or reconcile to that person's historical player source identity.
  if (subject.kind !== "player-career") return null;

  const direct = byId.get(subject.id)
    ?? (subject.aliases ?? []).map((alias) => byId.get(alias)).find((value) => value != null);
  if (direct) return direct;

  const sameName = byLeagueAndName.get(`${subject.league}:${subject.name.toLowerCase()}`) ?? [];
  if (sameName.length <= 1) return sameName[0] ?? null;

  // Duplicate-name source rows must remain unresolved unless canonical metadata narrows them to one exact identity.
  // This is intentionally conservative: no fuzzy matching and no positional fallback after an ambiguous result.
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
  const record = resolveProjectionRecordFor(subject);
  if (!record) return null;
  const provider: FootballSourceProviderId = record.league === "NFL" ? "nflverse" : "cfbfastR";
  return { tier: record.tier, sourceIdentityKey: { provider, id: record.sourceId } as const };
}

/**
 * The source-projection subject id is also a stable reconciliation key when PR6 uniquely matched that row to a
 * curated canonical player. Consumers can therefore collapse source-backed facts onto the canonical person instead
 * of retaining an orphan source-only record.
 */
export function footballRecognitionProjectionSubjectIdFor(subject: FootballCanonicalSubject) {
  return resolveProjectionRecordFor(subject)?.id ?? null;
}

export const FOOTBALL_RECOGNITION_MANUAL_APPROVAL_NAMES = projectionJson.manualApprovals as readonly string[];
export const FOOTBALL_RECOGNITION_SUMMARY = projectionJson.summary;