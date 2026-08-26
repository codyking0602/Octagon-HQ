import type { FootballCanonicalSubject } from "./footballFactualStatsCatalog";

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

/**
 * Existing canonical subjects are already a curated Football game universe, so they remain casual-eligible.
 * Historical source adapters may add far deeper source rows later without automatically promoting those rows here.
 */
export function buildFootballSubjectKnowledgeMetadata(
  subject: FootballCanonicalSubject,
  override: FootballSubjectKnowledgeOverride = {},
): FootballSubjectKnowledgeMetadata {
  const recognizabilityTier = override.recognizabilityTier ?? "C";
  const casualEligible = override.casualEligible ?? recognizabilityTier !== "D";
  const sourceIdentityKeys = override.sourceIdentityKeys ?? [
    { provider: "octagon-hq", id: subject.id } as const,
  ];

  if (recognizabilityTier === "D" && casualEligible) {
    throw new Error(`Database-only Football subject ${subject.id} cannot be casual-eligible.`);
  }

  return { recognizabilityTier, casualEligible, sourceIdentityKeys };
}
