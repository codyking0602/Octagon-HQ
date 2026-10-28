import { describe, expect, it } from "vitest";
import type { FootballRankFiveItem } from "./footballRankFiveModel";
import {
  footballGreatnessTierForItem,
  footballGreatnessTierForRating,
  footballGreatnessTierLabel,
  footballGreatnessTiersForCategory,
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

  it("numbers visible tiers relative to the greatness groups present in the category", () => {
    const category = [item("top", 92), item("middle", 70), item("bottom", 0)];

    expect(footballGreatnessTiersForCategory(category)).toEqual(["elite", "good", "bad"]);
    expect(footballGreatnessTierLabel(footballGreatnessTierForItem(category[0]!), category)).toBe("TIER 1");
    expect(footballGreatnessTierLabel(footballGreatnessTierForItem(category[1]!), category)).toBe("TIER 2");
    expect(footballGreatnessTierLabel(footballGreatnessTierForItem(category[2]!), category)).toBe("TIER 3");
  });

  it("allows a category to expose more than five distinct ordinal tiers", () => {
    const category = [
      item("elite", 92),
      item("great", 82),
      item("good", 70),
      item("average", 55),
      item("below-average", 35),
      item("bad", 0),
    ];

    expect(footballGreatnessTiersForCategory(category)).toHaveLength(6);
    expect(footballGreatnessTierLabel("elite", category)).toBe("TIER 1");
    expect(footballGreatnessTierLabel("bad", category)).toBe("TIER 6");
  });

  it("lets the same internal greatness group receive a different ordinal across categories", () => {
    const categoryWithElite = [item("elite", 92), item("great-a", 82), item("average-a", 55)];
    const categoryLedByGreat = [item("great-b", 82), item("average-b", 55)];

    expect(footballGreatnessTierLabel("great", categoryWithElite)).toBe("TIER 2");
    expect(footballGreatnessTierLabel("great", categoryLedByGreat)).toBe("TIER 1");
  });

  it("starts approved top coach subjects in category Tier 1", () => {
    const category = [
      item("bill-belichick", 100),
      item("vince-lombardi", 99),
      item("mike-tomlin", 88),
      item("kliff-kingsbury", 40),
    ];

    expect(footballGreatnessTierLabel(footballGreatnessTierForItem(category[0]!), category)).toBe("TIER 1");
    expect(footballGreatnessTierLabel(footballGreatnessTierForItem(category[1]!), category)).toBe("TIER 1");
  });

  it("rejects a visible tier label for a greatness group absent from the category", () => {
    const category = [item("great", 82), item("average", 55)];
    expect(() => footballGreatnessTierLabel("elite", category)).toThrow(RangeError);
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
