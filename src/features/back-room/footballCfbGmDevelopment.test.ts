import { readFileSync } from "node:fs";
import { CFB_GM_PLAYERS } from "./footballCfbGmEngine";
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


describe("owner-approved 468-player development labels", () => {
  it("matches every locked per-player label without changing original development probabilities", () => {
    const csv = readFileSync("docs/audits/cfb-gm-468-development-labels-approved-2026-10-09.csv","utf8");
    const rows = csv.trim().split(/\r?\n/).slice(1).map(row => row.split(","));
    expect(rows).toHaveLength(468);
    const seen = new Set<string>();
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const id = row[0]!, approved = row[7]!;
      expect(seen.has(id), id).toBe(false);
      seen.add(id);
      const player = CFB_GM_PLAYERS.find(p => p.id === id);
      expect(player, id).toBeDefined();
      expect(player!.outlook, id).toBe(approved);
      counts[player!.outlook] = (counts[player!.outlook] ?? 0) + 1;
    }
    expect(counts).toEqual({STEADY:298, "HIGH UPSIDE":44, RISING:86, "BOOM/BUST":28, "DECLINE RISK":12});
  });
});
