import { describe, expect, it } from "vitest";
import type { FootballRankFiveItem } from "./footballRankFiveModel";
import {
  footballGreatnessTierForItem,
  footballGreatnessTierForRating,
  footballGreatnessTierLabel,
  orderFootballItemsByGreatnessTier,
  scoreFootballBlindRankTierOrder,
  scoreFootballKeepCutTierSelection,
} from "./footballGreatnessTier";

function item(id: string, rating: number): FootballRankFiveItem {
  return {
    id,
    name: id,
    subtitle: id,
    league: "NFL",
    rating,
  };
}

describe("Football greatness tier truth", () => {
  it("derives tiers from the existing canonical rating bands", () => {
    expect(footballGreatnessTierForRating(92)).toBe("elite");
    expect(footballGreatnessTierForRating(91)).toBe("great");
    expect(footballGreatnessTierForRating(82)).toBe("great");
    expect(footballGreatnessTierForRating(81)).toBe("good");
    expect(footballGreatnessTierForRating(55)).toBe("average");
    expect(footballGreatnessTierForRating(35)).toBe("below-average");
    expect(footballGreatnessTierForRating(0)).toBe("bad");
  });

  it("presents the internal greatness bands as neutral Tier 1-5 labels", () => {
    expect([
      footballGreatnessTierLabel("goat"),
      footballGreatnessTierLabel("legendary"),
      footballGreatnessTierLabel("elite"),
      footballGreatnessTierLabel("near-elite"),
      footballGreatnessTierLabel("great"),
      footballGreatnessTierLabel("good"),
      footballGreatnessTierLabel("average"),
      footballGreatnessTierLabel("below-average"),
      footballGreatnessTierLabel("bad"),
    ]).toEqual([
      "TIER 1",
      "TIER 1",
      "TIER 1",
      "TIER 2",
      "TIER 2",
      "TIER 3",
      "TIER 4",
      "TIER 5",
      "TIER 5",
    ]);
  });

  it("starts approved top subjects in Tier 1", () => {
    expect(footballGreatnessTierLabel(footballGreatnessTierForItem(item("bill-belichick", 100)))).toBe("TIER 1");
    expect(footballGreatnessTierLabel(footballGreatnessTierForItem(item("vince-lombardi", 99)))).toBe("TIER 1");
    expect(footballGreatnessTierLabel(footballGreatnessTierForItem(item("jim-brown", 100)))).toBe("TIER 1");
    expect(footballGreatnessTierLabel(footballGreatnessTierForItem(item("jerry-rice", 100)))).toBe("TIER 1");
  });

  it("does not penalize Blind Rank swaps inside the same greatness tier", () => {
    const canonicalTierOrder = [item("elite", 92), item("great-a", 91), item("great-b", 88), item("great-c", 82), item("good", 81)];
    const sameTierSwap = [canonicalTierOrder[0]!, canonicalTierOrder[3]!, canonicalTierOrder[1]!, canonicalTierOrder[2]!, canonicalTierOrder[4]!];

    expect(scoreFootballBlindRankTierOrder(canonicalTierOrder).normalizedScore).toBe(100);
    expect(scoreFootballBlindRankTierOrder(sameTierSwap).normalizedScore).toBe(100);

    const crossTierInversion = [canonicalTierOrder[4]!, ...canonicalTierOrder.slice(0, 4)];
    expect(scoreFootballBlindRankTierOrder(crossTierInversion).normalizedScore).toBeLessThan(100);
  });

  it("treats same-tier Keep/Cut boundary choices as interchangeable", () => {
    const kept = [item("elite", 92), item("great-a", 90), item("great-b", 84), item("great-c", 82)];
    const cut = [item("great-d", 91), item("great-e", 88), item("good-a", 80), item("good-b", 70)];
    const baseline = scoreFootballKeepCutTierSelection(kept, cut);
    expect(baseline.normalizedScore).toBe(100);

    const sameTierSwap = scoreFootballKeepCutTierSelection(
      [kept[0]!, kept[1]!, kept[2]!, cut[0]!],
      [kept[3]!, cut[1]!, cut[2]!, cut[3]!],
    );
    expect(sameTierSwap.normalizedScore).toBe(100);

    const weakerOverStronger = scoreFootballKeepCutTierSelection(
      [kept[0]!, kept[1]!, kept[2]!, cut[2]!],
      [cut[0]!, cut[1]!, kept[3]!, cut[3]!],
    );
    expect(weakerOverStronger.normalizedScore).toBeLessThan(100);
  });

  it("orders reveals by tier while preserving source order inside a tier", () => {
    const source = [item("great-b", 84), item("elite", 92), item("great-a", 90), item("good", 80)];
    expect(orderFootballItemsByGreatnessTier(source).map((row) => row.id)).toEqual([
      "elite",
      "great-b",
      "great-a",
      "good",
    ]);
  });
});
