import { z } from "zod";
import supplementalFactsJson from "./generated/ufcstats-supplemental-facts-v1.json";
import { canonicalFightSupplementalFactsSchema } from "../engine/schemas";

const snapshotSourceSchema = z
  .object({
    repository: z.string().min(1),
    commit: z.string().regex(/^[a-f0-9]{40}$/),
    refreshedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    files: z.array(z.string().min(1)).min(1),
  })
  .strict();

const ufcStatsSupplementalFactsSnapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    provider: z.literal("ufcstats"),
    provenance: z
      .object({
        core: snapshotSourceSchema,
        bonuses: snapshotSourceSchema,
      })
      .strict(),
    fighters: z.record(
      z.string(),
      z.record(z.string(), canonicalFightSupplementalFactsSchema),
    ),
  })
  .strict();

export const ufcStatsSupplementalFactsSnapshot =
  ufcStatsSupplementalFactsSnapshotSchema.parse(supplementalFactsJson);

type SupplementalFight = {
  id: string;
  supplementalFacts?: unknown;
  [key: string]: unknown;
};

type SupplementalFightOwner = {
  fighter: string;
  presentation: { slug: string };
  facts: {
    fights: ReadonlyArray<SupplementalFight>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

function supplementalFightOwner(value: unknown): SupplementalFightOwner {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Canonical ranking fighter must be an object before UFCStats enrichment.");
  }
  const fighter = value as Record<string, unknown>;
  const presentation = fighter.presentation as Record<string, unknown> | undefined;
  const facts = fighter.facts as Record<string, unknown> | undefined;
  if (
    typeof fighter.fighter !== "string"
    || typeof presentation?.slug !== "string"
    || !Array.isArray(facts?.fights)
    || facts.fights.some((fight) => !fight || typeof fight !== "object" || typeof (fight as { id?: unknown }).id !== "string")
  ) {
    throw new Error("Canonical ranking fighter is missing the shape required for UFCStats enrichment.");
  }
  return value as SupplementalFightOwner;
}

/**
 * Applies the checked-in UFCStats supplemental snapshot to the canonical V2
 * ranking fight ledgers. Unknown fighter/fight keys fail closed so generated
 * evidence can never drift away from the canonical ranking owner silently.
 */
export function applyUfcStatsSupplementalFacts(fighters: readonly unknown[]): unknown[] {
  const owners = fighters.map(supplementalFightOwner);
  const canonicalBySlug = new Map(owners.map((fighter) => [fighter.presentation.slug, fighter]));

  for (const [fighterSlug, fights] of Object.entries(ufcStatsSupplementalFactsSnapshot.fighters)) {
    const fighter = canonicalBySlug.get(fighterSlug);
    if (!fighter) {
      throw new Error(`UFCStats supplemental snapshot contains unknown fighter ${fighterSlug}.`);
    }
    const canonicalFightIds = new Set(fighter.facts.fights.map((fight) => fight.id));
    for (const fightId of Object.keys(fights)) {
      if (!canonicalFightIds.has(fightId)) {
        throw new Error(`UFCStats supplemental snapshot contains unknown fight ${fighterSlug}:${fightId}.`);
      }
    }
  }

  return owners.map((fighter) => {
    const supplementalByFight = ufcStatsSupplementalFactsSnapshot.fighters[fighter.presentation.slug];
    if (!supplementalByFight) return fighter;

    return {
      ...fighter,
      facts: {
        ...fighter.facts,
        fights: fighter.facts.fights.map((fight) => {
          const supplementalFacts = supplementalByFight[fight.id];
          return supplementalFacts ? { ...fight, supplementalFacts } : fight;
        }),
      },
    };
  });
}
