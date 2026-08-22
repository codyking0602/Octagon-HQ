import { describe, expect, it } from "vitest";
import { footballRankFivePacks } from "./footballRankFiveModel";
import { footballSubjectAssets } from "./footballSubjectAssets";

describe("footballSubjectAssets", () => {
  it("has exactly one canonical asset for every current football subject", () => {
    const ids = footballRankFivePacks.flatMap((pack) => pack.items.map((item) => item.id));
    expect(ids).toHaveLength(350);
    expect(new Set(ids).size).toBe(350);
    expect(Object.keys(footballSubjectAssets).sort()).toEqual([...ids].sort());
  });
});
