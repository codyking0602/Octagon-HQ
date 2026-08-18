import { describe, it } from "vitest";
import {
  KEEP_CUT_PACKS,
  keepCutPool,
  keepCutRating,
  keepCutTier,
  type KeepCutTierId,
} from "./keepCutEngine";

const TIERS: readonly KeepCutTierId[] = ["elite", "great", "good", "average", "below-average", "bad"];

describe("Keep/Cut canonical pool depth diagnostic", () => {
  it("reports tier depth by pack", () => {
    const depth = Object.fromEntries(KEEP_CUT_PACKS.map((pack) => [
      pack.id,
      Object.fromEntries(TIERS.map((tier) => [
        tier,
        keepCutPool(pack.id).filter((fighter) => keepCutTier(keepCutRating(pack.id, fighter)) === tier).length,
      ])),
    ]));
    console.info("KEEP_CUT_TIER_DEPTH", JSON.stringify(depth));
  });
});
