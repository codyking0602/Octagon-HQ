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
  if (subject.kind === "program-era") return "D";
  return "C";
}

/**
 * Existing canonical subjects stay in the curated registry, while generated/source recognition evidence may
 * conservatively mark deeper source rows database-only. Historical policy is applied here so every canonical query
 * gets the same age/significance gate; factual coverage never changes recognition.
 */
export function buildFootballSubjectKnowledgeMetadata(
  subject: FootballCanonicalSubject,
  override: FootballSubjectKnowledgeOverride = {},
): FootballSubjectKnowledgeMetadata {
  const projection = footballRecognitionProjectionFor(subject);
  const proposedTier = override.recognizabilityTier ?? projection?.tier ?? conservativeCanonicalTier(subject);
  const recognizabilityTier = applyFootballHistoricalRecognitionPolicy(
    subject.id,
    subject.league,
    subject.endSeason ?? subject.season,
    proposedTier,
  ) as FootballRecognizabilityTier;
  // The final canonical tier owns casual eligibility. A stale source override must never keep a newly archived D row live.
  const casualEligible = recognizabilityTier === "D" ? false : (override.casualEligible ?? true);
  const sourceIdentityKeys = override.sourceIdentityKeys ?? [
    { provider: "octagon-hq", id: subject.id } as const,
    ...(projection?.sourceIdentityKey ? [projection.sourceIdentityKey] : []),
  ];

  return { recognizabilityTier, casualEligible, sourceIdentityKeys };
}
