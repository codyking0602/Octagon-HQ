import { footballCfbPlayerSeasonRecognitionFor } from "./footballCfbPlayerSeasonRecognition";
import type { FootballCanonicalSubject } from "./footballFactualStatsCatalog";
import { footballRecognitionProjectionFor } from "./footballRecognizabilityProjection";
import { applyFootballHistoricalRecognitionPolicy } from "./footballRecognitionHistoricalPolicy";

export type FootballRecognizabilityTier = "A" | "B" | "C" | "D";

export type FootballSourceProviderId =
  | "octagon-hq"
  | "cfbfastR"
  | "nflverse"
  | "ncaafb"
  | "sports-reference"
  | "official-cfb-awards"
  | "nfl-honors"
  | "ncaa-2025";

export interface FootballSourceIdentityKey {
  provider: FootballSourceProviderId;
  id: string;
}

export interface FootballSubjectKnowledgeMetadata {
  /** Product-facing recognizability only; never changes the underlying facts. */
  recognizabilityTier: FootballRecognizabilityTier;
  /** Whether this subject may appear in normal casual Football games. */
  casualEligible: boolean;
  /** Stable reconciliation keys. Source adapters append provider ids without replacing the canonical subject id. */
  sourceIdentityKeys: readonly FootballSourceIdentityKey[];
}

export interface FootballSubjectKnowledgeOverride {
  recognizabilityTier?: FootballRecognizabilityTier;
  casualEligible?: boolean;
  sourceIdentityKeys?: readonly FootballSourceIdentityKey[];
}

const explicitlyApprovedIconicSubjects = new Set([
  "program-alabama", "program-michigan", "program-notre-dame", "program-ohio-state", "program-texas",
  "nick-saban", "bill-belichick", "andy-reid", "pete-carroll", "urban-meyer",
  "2005-texas", "2019-lsu", "2001-miami", "2007-patriots",
]);

function conservativeCanonicalTier(subject: FootballCanonicalSubject): FootballRecognizabilityTier {
  if (explicitlyApprovedIconicSubjects.has(subject.id)) return "A";
  if (subject.kind === "team-season") return subject.nationalChampion ? "C" : "D";
  // A relationship existing is not recognition evidence. Era promotion needs a future cultural marker.
  if (subject.kind === "program-era") return "D";
  return "C";
}

/**
 * Existing canonical subjects stay in the curated registry, while the generated/source projection may conservatively
 * mark deeper source rows database-only. Recognition providers are identity evidence only; they never own objective stats.
 */
export function buildFootballSubjectKnowledgeMetadata(
  subject: FootballCanonicalSubject,
  override: FootballSubjectKnowledgeOverride = {},
): FootballSubjectKnowledgeMetadata {
  if (override.recognizabilityTier === "D" && override.casualEligible === true) {
    throw new Error(`Database-only Football subject ${subject.id} cannot be casual-eligible.`);
  }

  const projection = footballRecognitionProjectionFor(subject);
  const generatedPlayerSeason = footballCfbPlayerSeasonRecognitionFor(subject);
  const proposedTier = override.recognizabilityTier
    ?? projection?.tier
    ?? generatedPlayerSeason?.tier
    ?? conservativeCanonicalTier(subject);
  const recognizabilityTier = applyFootballHistoricalRecognitionPolicy(
    subject.id,
    subject.league,
    subject.endSeason ?? subject.season,
    proposedTier,
  );
  const casualEligible = recognizabilityTier === "D" ? false : (override.casualEligible ?? true);
  const sourceIdentityKeys = override.sourceIdentityKeys ?? [
    { provider: "octagon-hq", id: subject.id } as const,
    ...(projection ? [projection.sourceIdentityKey] : generatedPlayerSeason ? [generatedPlayerSeason.sourceIdentityKey] : []),
  ];

  return { recognizabilityTier, casualEligible, sourceIdentityKeys };
}
