import recognizabilityProjectionJson from "../../../data/generated/football/recognizability-projection.json";
import type { FootballCanonicalSubject } from "./footballFactualStatsCatalog";
import { footballProHallRecognitionCandidates } from "./footballProHallRecognitionCompletenessEvidence";
import { applyFootballHistoricalRecognitionPolicy } from "./footballRecognitionHistoricalPolicy";
import type { FootballRecognizabilityTier } from "./footballSubjectEligibility";

interface ProjectionRecord {
  kind: string;
  name: string;
  league: "NFL" | "CFB";
  startSeason?: number;
  endSeason?: number;
  tier: FootballRecognizabilityTier;
  sourceProvider: string;
  sourceId: string;
}

export interface FootballNflCoachRecognitionProjectionRow {
  subject: FootballCanonicalSubject;
  tier: FootballRecognizabilityTier;
  sourceIdentityKey: { provider: "nflverse"; id: string };
}

const TIER_RANK: Readonly<Record<FootballRecognizabilityTier, number>> = { D: 0, C: 1, B: 2, A: 3 };

function strongestTier(a: FootballRecognizabilityTier, b: FootballRecognizabilityTier) {
  return TIER_RANK[a] >= TIER_RANK[b] ? a : b;
}

function subjectId(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function activeDecades(startSeason?: number, endSeason?: number) {
  if (startSeason == null || endSeason == null) return undefined;
  return Array.from(
    { length: Math.floor(endSeason / 10) - Math.floor(startSeason / 10) + 1 },
    (_, index) => (Math.floor(startSeason / 10) + index) * 10,
  );
}

const hallCoachById = new Map(
  footballProHallRecognitionCandidates
    .filter((candidate) => candidate.kind === "coach" && candidate.league === "NFL")
    .map((candidate) => [subjectId(candidate.name), candidate] as const),
);

const coachStops = (recognizabilityProjectionJson.records as readonly ProjectionRecord[])
  .filter((record) => (
    record.kind === "coach-stop"
    && record.league === "NFL"
    && record.sourceProvider === "nflverse"
    && record.tier !== "D"
  ));

const sourceCoachById = new Map<string, {
  name: string;
  tier: FootballRecognizabilityTier;
  startSeason?: number;
  endSeason?: number;
}>();

for (const record of coachStops) {
  const id = subjectId(record.name);
  const current = sourceCoachById.get(id);
  const hallFloor = hallCoachById.get(id)?.minimumTier;
  const tier = hallFloor ? strongestTier(record.tier, hallFloor) : record.tier;
  sourceCoachById.set(id, {
    name: record.name,
    tier: current ? strongestTier(current.tier, tier) : tier,
    startSeason: current?.startSeason == null
      ? record.startSeason
      : record.startSeason == null
        ? current.startSeason
        : Math.min(current.startSeason, record.startSeason),
    endSeason: current?.endSeason == null
      ? record.endSeason
      : record.endSeason == null
        ? current.endSeason
        : Math.max(current.endSeason, record.endSeason),
  });
}

/**
 * Source-owned modern NFL head-coach projection. Historical identities remain owned by the existing Stage 13.5
 * historical recognition-repair path; reviewed Rank Five rows are deliberately absent from membership.
 */
export const footballNflCoachRecognitionProjectionSubjects: readonly FootballNflCoachRecognitionProjectionRow[] = [...sourceCoachById.entries()]
  .map(([id, row]) => ({
    subject: {
      id,
      name: row.name,
      kind: "coach" as const,
      league: "NFL" as const,
      ...(hallCoachById.get(id)?.identityAliases ? { aliases: hallCoachById.get(id)!.identityAliases } : {}),
      startSeason: row.startSeason,
      endSeason: row.endSeason,
      activeDecades: activeDecades(row.startSeason, row.endSeason),
    },
    tier: applyFootballHistoricalRecognitionPolicy(id, "NFL", row.endSeason, row.tier) as FootballRecognizabilityTier,
    sourceIdentityKey: {
      provider: "nflverse" as const,
      id: `coach-career:${id}`,
    },
  }))
  .filter((row) => row.tier !== "D");
