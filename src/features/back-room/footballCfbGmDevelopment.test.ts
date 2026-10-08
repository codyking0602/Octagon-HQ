import { describe, expect, it } from "vitest";
import { cfbGmDevelop, cfbGmDevProfile, cfbGmNextClass } from "./footballCfbGmDevelopment";

describe("CFB GM college-stage development", () => {
  it("samples deterministic, player-specific bounded grade change without editing canonical HQ", () => {
    const grade=87, ids=["texas|colinsimmons","texas|ryanwingo","lsu|samleavitt","different|nonstar"];
    for(const id of ids)for(let i=0;i<60;i++){
      const seed="cfb-dev-"+i;
      const a=cfbGmDevelop(id,grade,"JR",seed);
      expect(a).toEqual(cfbGmDevelop(id,grade,"JR",seed));
      expect(a.before).toBe(grade);
      expect(a.after).toBe(grade+a.delta);
      expect(a.after).toBeGreaterThanOrEqual(50);
      expect(a.after).toBeLessThanOrEqual(99);
      const p=a.profile;
      expect(p.breakout+p.improve+p.steady+p.decline).toBe(100);
      expect(a.delta).toBeLessThanOrEqual(p.maxGain);
      expect(a.delta).toBeGreaterThanOrEqual(-p.maxLoss);
    }
  });
  it("does not automatically increase a 99-rated elite prospect", () => {
    for(let i=0;i<40;i++){
      const result=cfbGmDevelop("texas|colinsimmons",99,"JR","elite-dev-"+i);
      expect(result.after).toBeLessThanOrEqual(99);
      expect(result.delta).toBeLessThanOrEqual(0);
    }
    expect(cfbGmDevProfile("texas|colinsimmons",99,"JR").confidence).toBe("reviewed-anchor");
    expect(cfbGmDevProfile("alabama|keelonrussell",93,"SO").confidence).toBe("reviewed-anchor");
    expect(cfbGmDevProfile("oregon|dakorienmoore",80,"SO").volatility).toBe("HIGH");
  });
  it("gives younger development trajectories a different shape from senior veterans", () => {
    let freshmanDelta=0,seniorDelta=0;
    for(let i=0;i<240;i++){
      freshmanDelta+=cfbGmDevelop("demo|young",77,"FR","phase-"+i).delta;
      seniorDelta+=cfbGmDevelop("demo|older",77,"SR","phase-"+i).delta;
    }
    expect(freshmanDelta).toBeGreaterThan(seniorDelta+130);
    expect(cfbGmDevProfile("demo|young",77,"FR").volatility).toBe("HIGH");
    expect(cfbGmDevProfile("demo|older",77,"SR").volatility).toBe("LOW");
  });
  it("progresses known class labels without inventing an additional year for seventh-year exceptions", () => {
    expect(cfbGmNextClass("FR")).toBe("SO");
    expect(cfbGmNextClass("SO")).toBe("JR");
    expect(cfbGmNextClass("JR")).toBe("SR");
    expect(cfbGmNextClass("6TH")).toBe("7TH");
    expect(cfbGmNextClass("7TH")).toBeNull();
    expect(cfbGmNextClass("8TH")).toBeNull();
    const veteran=cfbGmDevProfile("miami|mohamedtoure",82,"8TH");
    expect(veteran.breakout+veteran.improve+veteran.steady+veteran.decline).toBe(100);
    expect(cfbGmNextClass(null)).toBeNull();
  });
});
