import {
  FOOTBALL_RATING_BANDS,
  getFootballRatingBand,
  type FootballRatingBand,
} from "./footballContentContract";
import type { FootballRankFiveItem } from "./footballRankFiveModel";
import { OFFICIAL_COMPARISON_GRADING_RULES } from "../play/officialScoreContract";

export type FootballGreatnessTier = FootballRatingBand;

export const FOOTBALL_GREATNESS_TIER_LABELS = {
  elite: "ELITE",
  great: "GREAT",
  good: "GOOD",
  average: "AVERAGE",
  "below-average": "BELOW AVERAGE",
  bad: "BAD",
} as const satisfies Record<FootballGreatnessTier, string>;

const FOOTBALL_GREATNESS_TIER_STRENGTH = new Map(
  FOOTBALL_RATING_BANDS.map((band, index) => [band.id, FOOTBALL_RATING_BANDS.length - index]),
);

export function footballGreatnessTierForRating(rating: number): FootballGreatnessTier {
  return getFootballRatingBand(rating);
}

export function footballGreatnessTierForItem(item: Pick<FootballRankFiveItem, "rating">): FootballGreatnessTier {
  return footballGreatnessTierForRating(item.rating);
}

export function footballGreatnessTierLabel(tier: FootballGreatnessTier) {
  return FOOTBALL_GREATNESS_TIER_LABELS[tier];
}

export function compareFootballGreatnessTiers(
  left: FootballGreatnessTier,
  right: FootballGreatnessTier,
) {
  return (FOOTBALL_GREATNESS_TIER_STRENGTH.get(left) ?? 0)
    - (FOOTBALL_GREATNESS_TIER_STRENGTH.get(right) ?? 0);
}

export function compareFootballGreatnessItems(
  left: Pick<FootballRankFiveItem, "rating">,
  right: Pick<FootballRankFiveItem, "rating">,
) {
  return compareFootballGreatnessTiers(
    footballGreatnessTierForItem(left),
    footballGreatnessTierForItem(right),
  );
}

export interface FootballTierComparisonScore {
  correctComparisons: number;
  normalizedScore: number;
}

/**
 * Football Blind Rank has ten pairwise relationships. A stronger tier above a weaker
 * tier is correct, and same-tier order is intentionally neutral/full credit.
 */
export function scoreFootballBlindRankTierOrder(
  orderedItems: readonly FootballRankFiveItem[],
): FootballTierComparisonScore {
  if (orderedItems.length !== 5) {
    throw new RangeError("Football Blind Rank tier scoring requires exactly five items.");
  }

  const rules = OFFICIAL_COMPARISON_GRADING_RULES["blind-rank"];
  let correctComparisons = 0;
  for (let leftIndex = 0; leftIndex < orderedItems.length - 1; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < orderedItems.length; rightIndex += 1) {
      if (compareFootballGreatnessItems(orderedItems[leftIndex]!, orderedItems[rightIndex]!) >= 0) {
        correctComparisons += 1;
      }
    }
  }

  return {
    correctComparisons,
    normalizedScore: correctComparisons * rules.normalizedPointsPerComparison,
  };
}

/**
 * Football Keep/Cut has sixteen kept-v-cut relationships. Same-tier choices are
 * interchangeable, so only keeping a genuinely weaker tier over a stronger tier
 * costs points.
 */
export function scoreFootballKeepCutTierSelection(
  keptItems: readonly FootballRankFiveItem[],
  cutItems: readonly FootballRankFiveItem[],
): FootballTierComparisonScore {
  if (keptItems.length !== 4 || cutItems.length !== 4) {
    throw new RangeError("Football Keep/Cut tier scoring requires exactly four kept and four cut items.");
  }

  const rules = OFFICIAL_COMPARISON_GRADING_RULES["keep-cut"];
  let correctComparisons = 0;
  for (const kept of keptItems) {
    for (const cut of cutItems) {
      if (compareFootballGreatnessItems(kept, cut) >= 0) correctComparisons += 1;
    }
  }

  return {
    correctComparisons,
    normalizedScore: Math.max(
      0,
      Math.min(100, Math.round(correctComparisons * rules.normalizedPointsPerComparison)),
    ),
  };
}

/** Tier-only reveal order. Source order breaks same-tier ties without asserting a ranking. */
export function orderFootballItemsByGreatnessTier<T extends FootballRankFiveItem>(
  items: readonly T[],
): T[] {
  return items
    .map((item, sourceIndex) => ({ item, sourceIndex }))
    .sort((left, right) => (
      compareFootballGreatnessItems(right.item, left.item)
      || left.sourceIndex - right.sourceIndex
    ))
    .map(({ item }) => item);
}
