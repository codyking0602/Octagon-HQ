import { describe, expect, it } from "vitest";
import { CFB_GM_NIL_MARKET_ANCHORS, cfbGmEstimateNil } from "./footballCfbGmNilMarket";

describe("CFB GM independent NIL price estimation", () => {
  const qb={schoolId:"texas",name:"Arch Manning",family:"QB" as const,positionRoleRank:0,apRank:1};
  it("prices prominently marketed players higher without reading HQ ability scores", () => {
    const arch=cfbGmEstimateNil(qb);
    const colin=cfbGmEstimateNil({schoolId:"texas",name:"Colin Simmons",family:"Front Seven",positionRoleRank:0,apRank:1});
    expect(arch.year1).toBe(4_200_000);
    expect(colin.year1).toBe(2_350_000);
    expect(arch.basis).toBe("market-prominence-anchor");
    expect(cfbGmEstimateNil({...qb,currentGrade:50} as typeof qb)).toEqual(
      cfbGmEstimateNil({...qb,currentGrade:99} as typeof qb));
  });
  it("recognizes role tiers independently of a player's rating and both NIL budgets", () => {
    const first=cfbGmEstimateNil({schoolId:"alabama",name:"Unanchored A",family:"Front Seven",positionRoleRank:0,apRank:6});
    const reserve=cfbGmEstimateNil({schoolId:"alabama",name:"Unanchored B",family:"Front Seven",positionRoleRank:5,apRank:6});
    expect(first.year1).toBeGreaterThan(reserve.year1*2);
    expect(first.year1).toBeLessThanOrEqual(1_500_000);
    expect(reserve.year1).toBeGreaterThanOrEqual(150_000);
    expect(first.estimated).toBe(true);
    expect(reserve.confidence).toBe("low");
    expect(first.year2Baseline).toBeGreaterThan(first.year1);
  });
  it("keeps unique normalized anchors and practical market boundaries", () => {
    expect(Object.keys(CFB_GM_NIL_MARKET_ANCHORS).length).toBeGreaterThanOrEqual(10);
    for(const [id,value] of Object.entries(CFB_GM_NIL_MARKET_ANCHORS)) {
      expect(id).toMatch(/^[a-z-]+\|[a-z0-9]+$/);
      expect(value).toBeGreaterThanOrEqual(1_500_000);
      expect(value).toBeLessThanOrEqual(5_000_000);
      expect(value%25_000).toBe(0);
    }
  });
});
