import {
  resolveFootballSubjectReference,
  type FootballSubjectQuery,
} from "./footballSubjectRegistry";

export const FOOTBALL_COMPARISON_PACK_IDS = [
  "nfl-quarterbacks",
  "nfl-running-backs",
  "nfl-wide-receivers",
  "nfl-tight-ends",
  "nfl-defensive-players",
  "nfl-head-coaches",
  "nfl-qb-seasons",
  "nfl-team-seasons",
  "college-quarterbacks",
  "college-head-coaches",
  "college-programs",
  "college-program-eras",
  "college-team-seasons",
] as const;

export type FootballComparisonPackId = typeof FOOTBALL_COMPARISON_PACK_IDS[number];

export interface FootballComparisonItemReference {
  id: string;
  name: string;
}

const CASUAL_RECOGNIZABILITY_TIERS = ["A", "B", "C"] as const;

const FOOTBALL_COMPARISON_CATEGORY_QUERIES = {
  "nfl-quarterbacks": { kind: "player-career", league: "NFL", position: "QB" },
  "nfl-running-backs": { kind: "player-career", league: "NFL", position: "RB" },
  "nfl-wide-receivers": { kind: "player-career", league: "NFL", position: "WR" },
  "nfl-tight-ends": { kind: "player-career", league: "NFL", position: "TE" },
  "nfl-defensive-players": { kind: "player-career", league: "NFL", positions: ["DL", "LB", "DB"] },
  "nfl-head-coaches": { kind: "coach", league: "NFL" },
  "nfl-qb-seasons": { kind: "player-season", league: "NFL", position: "QB" },
  "nfl-team-seasons": { kind: "team-season", league: "NFL" },
  "college-quarterbacks": { kind: "player-career", league: "CFB", position: "QB" },
  "college-head-coaches": { kind: "coach", league: "CFB" },
  "college-programs": { kind: "program", league: "CFB" },
  "college-program-eras": { kind: "program-era", league: "CFB" },
  "college-team-seasons": { kind: "team-season", league: "CFB" },
} as const satisfies Record<FootballComparisonPackId, FootballSubjectQuery>;

const FOOTBALL_BLIND_RESUME_QUERY_OVERRIDES = {
  "college-quarterbacks": { kind: "player-season", league: "CFB", position: "QB" },
} as const satisfies Partial<Record<FootballComparisonPackId, FootballSubjectQuery>>;

export function isFootballComparisonPackId(value: string): value is FootballComparisonPackId {
  return (FOOTBALL_COMPARISON_PACK_IDS as readonly string[]).includes(value);
}

/**
 * Comparison games own their category intent; the canonical subject registry owns which identities satisfy it.
 * Ratings remain owned by the existing comparison catalog and are never promoted into the factual ledger.
 */
export function footballComparisonCategoryQuery(packId: FootballComparisonPackId): FootballSubjectQuery {
  return FOOTBALL_COMPARISON_CATEGORY_QUERIES[packId];
}

export function footballComparisonEligibilityQuery(packId: FootballComparisonPackId): FootballSubjectQuery {
  return {
    ...footballComparisonCategoryQuery(packId),
    recognizabilityTiers: CASUAL_RECOGNIZABILITY_TIERS,
    casualEligible: true,
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  };
}

/** Blind Resume uses season identities for its CFB quarterback evidence while Rank 5/Keep-Cut judge careers. */
export function footballBlindResumeEligibilityQuery(packId: FootballComparisonPackId): FootballSubjectQuery {
  return {
    ...footballComparisonCategoryQuery(packId),
    ...(FOOTBALL_BLIND_RESUME_QUERY_OVERRIDES[packId] ?? {}),
    recognizabilityTiers: CASUAL_RECOGNIZABILITY_TIERS,
    casualEligible: true,
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  };
}

export function resolveFootballComparisonSubject(
  packId: FootballComparisonPackId,
  item: FootballComparisonItemReference,
  query: FootballSubjectQuery = footballComparisonEligibilityQuery(packId),
) {
  return resolveFootballSubjectReference(item.id, item.name, query);
}

export function footballComparisonItemsFromCanonicalLedger<T extends FootballComparisonItemReference>(
  scopeId: string,
  items: readonly T[],
  minimumDepth: number,
) {
  // The shared generator is also exercised with non-product fixture scopes. Canonical enforcement is mandatory
  // for every real Football comparison pack and intentionally does not claim ownership of unrelated fixture scopes.
  if (!isFootballComparisonPackId(scopeId)) return [...items];

  const query = footballComparisonEligibilityQuery(scopeId);
  const seenCanonicalIds = new Set<string>();
  const eligible = items.filter((item) => {
    const subject = resolveFootballSubjectReference(item.id, item.name, query);
    if (!subject || seenCanonicalIds.has(subject.id)) return false;
    seenCanonicalIds.add(subject.id);
    return true;
  });

  if (eligible.length < minimumDepth) {
    throw new Error(
      `Football comparison pack ${scopeId} has only ${eligible.length} canonical casual-eligible rated subjects.`,
    );
  }
  return eligible;
}
