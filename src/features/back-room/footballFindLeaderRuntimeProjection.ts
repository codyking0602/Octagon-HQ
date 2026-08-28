import projectionJson from "../../../data/generated/football/find-leader-runtime-projection.json";
import type { FootballCanonicalSubject, FootballCanonicalPosition } from "./footballFactualStatsCatalog";
import type {
  FootballRecognizabilityTier,
  FootballSubjectKnowledgeOverride,
  FootballSourceProviderId,
} from "./footballSubjectEligibility";

interface RuntimeProjectionSubject {
  id: string;
  name: string;
  kind: "player-career" | "player-season" | "team-season";
  league: "NFL" | "CFB";
  position?: FootballCanonicalPosition;
  season?: number;
  school?: string;
  startSeason?: number;
  endSeason?: number;
  tier: FootballRecognizabilityTier;
  sourceProvider: FootballSourceProviderId;
  sourceId: string;
}

const rawSubjects = projectionJson.subjects as readonly RuntimeProjectionSubject[];
const rawSubjectById = new Map(rawSubjects.map((subject) => [subject.id, subject]));

function activeDecades(startSeason?: number, endSeason?: number) {
  if (startSeason == null || endSeason == null) return undefined;
  const first = Math.floor(startSeason / 10) * 10;
  const last = Math.floor(endSeason / 10) * 10;
  return Array.from({ length: (last - first) / 10 + 1 }, (_, index) => first + index * 10);
}

/**
 * Compact source-backed season identities still needed by Find the Leader. Player careers continue to enter through
 * footballProjectedPlayerSubjects so the registry keeps one reconciliation path. Stage 13 moved all factual rows to
 * footballFactualUniverseProjection -> footballFactualStatsCore; this module no longer owns or exposes game facts.
 */
export const footballFindLeaderProjectedAdditionalSubjects: readonly FootballCanonicalSubject[] = rawSubjects
  .filter((subject) => subject.kind !== "player-career")
  .map((subject) => ({
    id: subject.id,
    name: subject.name,
    kind: subject.kind,
    league: subject.league,
    position: subject.position,
    season: subject.season,
    school: subject.school,
    startSeason: subject.startSeason,
    endSeason: subject.endSeason,
    activeDecades: subject.season != null
      ? [Math.floor(subject.season / 10) * 10]
      : activeDecades(subject.startSeason, subject.endSeason),
  }));

export function footballFindLeaderProjectedKnowledgeOverride(subjectId: string): FootballSubjectKnowledgeOverride | null {
  const subject = rawSubjectById.get(subjectId);
  if (!subject) return null;
  return {
    recognizabilityTier: subject.tier,
    casualEligible: subject.tier !== "D",
    sourceIdentityKeys: [{ provider: subject.sourceProvider, id: subject.sourceId }],
  };
}

export const FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_SUMMARY = projectionJson.summary;
export const FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_ELIGIBILITY = projectionJson.eligibility;
