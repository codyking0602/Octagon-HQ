import projectionJson from "../../../data/generated/football/recognizability-projection.json";
import type { FootballCanonicalSubject, FootballCanonicalPosition } from "./footballFactualStatsCatalog";
import type { FootballRecognizabilityTier, FootballSourceProviderId } from "./footballSubjectEligibility";

interface ProjectionRecord {
  id: string; name: string; league: "NFL" | "CFB"; position?: FootballCanonicalPosition;
  school?: string; startSeason?: number; endSeason?: number; tier: FootballRecognizabilityTier; sourceId: string;
}

const records = projectionJson.records as readonly ProjectionRecord[];

/** Source-player identities reconciled into the canonical subject universe. */
export const footballProjectedPlayerSubjects: readonly FootballCanonicalSubject[] = records.map((record) => ({
  id: record.id, name: record.name, kind: "player-career", league: record.league,
  position: record.position, school: record.school, startSeason: record.startSeason, endSeason: record.endSeason,
  activeDecades: record.startSeason == null || record.endSeason == null ? undefined : Array.from(
    { length: Math.floor(record.endSeason / 10) - Math.floor(record.startSeason / 10) + 1 },
    (_, index) => (Math.floor(record.startSeason! / 10) + index) * 10,
  ),
}));

const byId = new Map(records.map((record) => [record.id, record]));
const byLeagueAndName = new Map(records.map((record) => [`${record.league}:${record.name.toLowerCase()}`, record]));

export function footballRecognitionProjectionFor(subject: FootballCanonicalSubject) {
  const record = byId.get(subject.id)
    ?? (subject.aliases ?? []).map((alias) => byId.get(alias)).find((value) => value != null)
    ?? byLeagueAndName.get(`${subject.league}:${subject.name.toLowerCase()}`);
  if (!record) return null;
  const provider: FootballSourceProviderId = record.league === "NFL" ? "nflverse" : "cfbfastR";
  return { tier: record.tier, sourceIdentityKey: { provider, id: record.sourceId } as const };
}

export const FOOTBALL_RECOGNITION_MANUAL_APPROVAL_NAMES = projectionJson.manualApprovals as readonly string[];
