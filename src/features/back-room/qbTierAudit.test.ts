import { describe, expect, it } from "vitest";
import {
  footballGreatnessTierForItem,
  footballGreatnessTierLabel,
} from "./footballGreatnessTier";
import { getFootballRankFivePack } from "./footballRankFivePlayableModel";

describe("temporary QB tier audit", () => {
  it("prints the exact runtime QB pool and tier assignments", () => {
    const pack = getFootballRankFivePack("nfl-quarterbacks");
    const rows = pack.items.map((item) => {
      const internalTier = footballGreatnessTierForItem(item);
      const runtimeItem = item as typeof item & {
        evaluationSource?: string;
        canonicalSubjectId?: string;
        recognizabilityTier?: string;
      };
      return {
        id: item.id,
        canonicalSubjectId: runtimeItem.canonicalSubjectId ?? item.id,
        name: item.name,
        subtitle: item.subtitle,
        rating: item.rating,
        internalTier,
        visibleTier: footballGreatnessTierLabel(internalTier, pack.items),
        evaluationSource: runtimeItem.evaluationSource ?? null,
        recognizabilityTier: runtimeItem.recognizabilityTier ?? null,
        ratingBasis: item.ratingBasis,
      };
    });

    console.log("QB_TIER_AUDIT_BEGIN");
    console.log(JSON.stringify(rows));
    console.log("QB_TIER_AUDIT_END");

    expect(rows).toHaveLength(122);
  });
});
