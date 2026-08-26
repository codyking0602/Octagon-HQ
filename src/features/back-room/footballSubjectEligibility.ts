import type { FootballCanonicalSubject } from "./footballFactualStatsCatalog";
import { footballRecognitionProjectionFor } from "./footballRecognizabilityProjection";

export type FootballRecognizabilityTier = "A" | "B" | "C" | "D";

export type FootballSourceProviderId =
  | "octagon-hq"
  | "cfbfastR"
  | "nflverse"
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
 * Existing canonical subjects stay in the curated registry, but PR6 may conservatively mark some as database-only.
 * Historical source adapters may add far deeper source rows without automatically exposing those rows to normal game queries.
 */
export function buildFootballSubjectKnowledgeMetadata(
  subject: FootballCanonicalSubject,
  override: FootballSubjectKnowledgeOverride = {},
): FootballSubjectKnowledgeMetadata {
  const projection = footballRecognitionProjectionFor(subject);
  const recognizabilityTier = override.recognizabilityTier ?? projection?.tier ?? conservativeCanonicalTier(subject);
  const casualEligible = override.casualEligible ?? recognizabilityTier !== "D";
  const sourceIdentityKeys = override.sourceIdentityKeys ?? [
    { provider: "octagon-hq", id: subject.id } as const,
    ...(projection ? [projection.sourceIdentityKey] : []),
  ];

  if (recognizabilityTier === "D" && casualEligible) {
    throw new Error(`Database-only Football subject ${subject.id} cannot be casual-eligible.`);
  }

  return { recognizabilityTier, casualEligible, sourceIdentityKeys };
}
