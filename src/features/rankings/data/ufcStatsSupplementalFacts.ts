import { z } from "zod";
import supplementalFactsJson from "./generated/ufcstats-supplemental-facts-v1.json";
import { canonicalFightSupplementalFactsSchema } from "../engine/schemas";

const ufcStatsSupplementalFactsSnapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    provider: z.literal("ufcstats"),
    fighters: z.record(
      z.string(),
      z.record(z.string(), canonicalFightSupplementalFactsSchema),
    ),
  })
  .strict();

export const ufcStatsSupplementalFactsSnapshot =
  ufcStatsSupplementalFactsSnapshotSchema.parse(supplementalFactsJson);

type SupplementalFightOwner = {
  fighter: string;
  presentation: { slug: string };
  facts: {
    fights: readonly Array<{
      id: string;
      supplementalFacts?: unknown;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

/**
 * Applies the checked-in UFCStats supplemental snapshot to the canonical V2
 * ranking fight ledgers. Unknown fighter/fight keys fail closed so generated
 * evidence can never drift away from the canonical ranking owner silently.
 */
export function applyUfcStatsSupplementalFacts<T extends SupplementalFightOwner>(
  fighters: readonly T[],
): T[] {
  const canonicalBySlug = new Map(fighters.map((fighter) => [fighter.presentation.slug, fighter]));

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

  return fighters.map((fighter) => {
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
    } as T;
  });
}
