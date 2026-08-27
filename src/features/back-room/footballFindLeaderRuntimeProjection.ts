import projectionJson from "../../../data/generated/football/find-leader-runtime-projection.json";
import type { FootballCanonicalSubject, FootballCanonicalPosition } from "./footballFactualStatsCatalog";
import type {
  FootballFactMetricId,
  FootballFactScope,
  FootballFactSourceId,
  FootballFactualRecord,
} from "./footballFactualStatsCore";
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

interface RuntimeProjectionRecord {
  subjectId: string;
  scope: FootballFactScope;
  facts: readonly [FootballFactMetricId, number][];
}

const rawSubjects = projectionJson.subjects as readonly RuntimeProjectionSubject[];
// JSON imports widen tuple arrays to `(string | number)[][]`; the generator is the schema owner and its checked-in
// artifact is covered by `--check`, so narrow through unknown at this single adapter boundary rather than weakening
// the canonical fact types downstream.
const rawRecords = projectionJson.records as unknown as readonly RuntimeProjectionRecord[];
const rawSubjectById = new Map(rawSubjects.map((subject) => [subject.id, subject]));

function activeDecades(startSeason?: number, endSeason?: number) {
  if (startSeason == null || endSeason == null) return undefined;
  const first = Math.floor(startSeason / 10) * 10;
  const last = Math.floor(endSeason / 10) * 10;
  return Array.from({ length: (last - first) / 10 + 1 }, (_, index) => first + index * 10);
}

/**
 * Compact source-backed subjects needed by Find the Leader beyond PR6 player-career identities.
 * Player careers continue to enter through footballProjectedPlayerSubjects so the registry keeps one reconciliation path.
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

const sourceIdByLeague: Readonly<Record<"NFL" | "CFB", FootballFactSourceId>> = {
  NFL: projectionJson.sourceIds.NFL as FootballFactSourceId,
  CFB: projectionJson.sourceIds.CFB as FootballFactSourceId,
};

/** Facts remain canonical: footballFactualStatsCore merges these rows behind getFootballFact/getFootballFactualRecord. */
export const footballFindLeaderProjectedFactualRecords: readonly FootballFactualRecord[] = rawRecords.map((record) => {
  const subject = rawSubjectById.get(record.subjectId);
  if (!subject) throw new Error(`Find the Leader projected fact is missing subject ${record.subjectId}.`);
  return {
    subjectId: record.subjectId,
    scope: record.scope,
    facts: record.facts.map(([metricId, value]) => ({
      metricId,
      value,
      evidence: { sourceIds: [sourceIdByLeague[subject.league]], kind: "derived" as const, formula: "deterministic projection from pinned normalized source corpus" },
    })),
  };
});

export const FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_SUMMARY = projectionJson.summary;
export const FOOTBALL_FIND_LEADER_RUNTIME_PROJECTION_ELIGIBILITY = projectionJson.eligibility;