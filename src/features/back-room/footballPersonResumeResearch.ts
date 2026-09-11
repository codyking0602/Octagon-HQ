export interface FootballPersonResumeResearchRecord {
  subjectId: string;
  source: { publisher: string; title: string; url: string };
  facts: readonly { conceptId: string; value: string; tags: readonly string[] }[];
}

const f = (conceptId: string, value: string, tags: readonly string[]) => ({ conceptId, value, tags });
const r = (
  subjectId: string,
  publisher: string,
  url: string,
  facts: FootballPersonResumeResearchRecord["facts"],
): FootballPersonResumeResearchRecord => ({
  subjectId,
  source: { publisher, title: `Source-backed football résumé for ${subjectId}`, url },
  facts,
});

/**
 * Source-backed football résumé depth for canonical football identities.
 * These are reusable stage-scoped football facts, not Who Am I clue copy or roster ownership.
 */
export const footballPersonResumeResearch: readonly FootballPersonResumeResearchRecord[] = [
] as const;
