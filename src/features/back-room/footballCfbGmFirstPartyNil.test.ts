import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CFB_GM_BUDGETS, CFB_GM_PLAYERS, cfbGmEffectiveGrade,
  cfbGmInitial, cfbGmPrice, cfbGmYear2Ask,
} from "./footballCfbGmEngine";
import { cfbGmEstimateNil } from "./footballCfbGmNilMarket";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));

describe("468 independent individual Year 1 NIL estimates", () => {
  const ledger = read("data/curated/football/cfb/gm-2026-first-party-nil-market.json") as {
    population:number; players:Array<{id:string;schoolId:string;name:string;family:string;year1USD:number;
      estimated:boolean;asOf:string;confidence:string;basis:string;rationale:string;footballSources:string[];}>;
  };
  const runtime = read("data/generated/football/cfb-gm-first-party-nil-runtime-2026.json") as {
    population:number;players:Array<{id:string;year1USD:number}>;
  };

  it("ties all 468 identities across research, compact runtime and live game with no generic fallback", () => {
    expect(ledger.population).toBe(468);
    expect(runtime.population).toBe(468);
    expect(ledger.players).toHaveLength(468);
    expect(runtime.players).toHaveLength(468);
    expect(CFB_GM_PLAYERS).toHaveLength(468);
    expect(new Set(ledger.players.map(p => p.id)).size).toBe(468);
    expect(runtime.players).toEqual(ledger.players.map(p => ({id:p.id,year1USD:p.year1USD})));
    const index = new Map(CFB_GM_PLAYERS.map(player => [player.id, player]));
    expect(index.size).toBe(468);
    for (const row of ledger.players) {
      const live = index.get(row.id);
      expect(live, row.id).toBeDefined();
      expect(live!.schoolId, row.id).toBe(row.schoolId);
      expect(live!.name, row.id).toBe(row.name);
      expect(live!.family, row.id).toBe(row.family);
      expect(live!.nilYear1, row.id).toBe(row.year1USD);
      expect(row.year1USD, row.id).toBeGreaterThanOrEqual(200_000);
      expect(row.year1USD % 25_000, row.id).toBe(0);
      expect(row.estimated).toBe(true);
      expect(row.asOf).toBe("2026-10-09");
      expect(row.confidence).toBe("low");
      expect(row.rationale.length, row.id).toBeGreaterThan(55);
      expect(row.footballSources.length, row.id).toBeGreaterThan(0);
    }
  });

  it("does not embed or republish third-party provider values or links into app authority", () => {
    const bytes = readFileSync("data/curated/football/cfb/gm-2026-first-party-nil-market.json", "utf8");
    const runtimeBytes = readFileSync("data/generated/football/cfb-gm-first-party-nil-runtime-2026.json", "utf8");
    for (const forbidden of ["www.on3.com", "thenilstandard.com", "valuationEstimateUsd", "publishedNilReference", "on3-ranked"]) {
      expect(bytes.toLowerCase()).not.toContain(forbidden.toLowerCase());
      expect(runtimeBytes.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it("preserves individual bargains and varied market values independently of grade, cap and season outcome", () => {
    const school = ledger.players.filter(row => row.schoolId === "texas");
    expect(new Set(school.map(row => row.year1USD)).size).toBeGreaterThan(7);
    expect(ledger.players.some(row => row.year1USD >= 4_000_000)).toBe(true);
    expect(ledger.players.some(row => row.year1USD <= 300_000)).toBe(true);
    const independent = CFB_GM_PLAYERS.filter(player => {
      const old = cfbGmEstimateNil({schoolId:player.schoolId,name:player.name,
        family:player.family,positionRoleRank:0,apRank:1}).year1;
      return player.nilYear1 !== old;
    });
    expect(independent.length).toBeGreaterThan(200);
    const example = CFB_GM_PLAYERS.find(p => p.id === "texas|archmanning")!;
    expect(cfbGmPrice(example,1,"seed-a")).toBe(example.nilYear1);
    expect(cfbGmPrice(example,1,"seed-b")).toBe(example.nilYear1);
    expect(cfbGmPrice(example,2,"seed-a")).toBe(cfbGmYear2Ask(example,"seed-a"));
    expect(cfbGmPrice(example,2,"seed-b")).toBe(cfbGmYear2Ask(example,"seed-b"));
    expect(cfbGmInitial("test-first-party-1","POWERHOUSE").budget).not.toBe(
      cfbGmInitial("test-first-party-1","BUILDER").budget);
    expect(CFB_GM_BUDGETS.POWERHOUSE).toBeGreaterThan(CFB_GM_BUDGETS.BUILDER);
    expect(cfbGmEffectiveGrade(example,1,"seed-a")).toBe(example.currentGrade);
  });
});
