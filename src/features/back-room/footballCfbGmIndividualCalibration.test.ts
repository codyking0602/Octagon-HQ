import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cfbGmDevProfile, cfbGmDevelop } from "./footballCfbGmDevelopment";
import {
  CFB_GM_PLAYERS, CFB_GM_AP_SCHOOLS, CFB_GM_BUDGETS, cfbGmInitial,
  cfbGmForcedDepartures, cfbGmPlayer, isModelDraftEligible,
} from "./footballCfbGmEngine";

const researched = JSON.parse(readFileSync(
  "data/curated/football/cfb/gm-2026-classification-evidence.json", "utf8",
)).players as Array<{id:string;remainingEligibility:number|null;nilMarketEvidence?:{
  asOf:string;provider:string;providerRank:number;sourceUrl:string;sourceMethod:string;
  reportedValuationEstimate:number;year1:number;year2Baseline:number;confidence:string;
};calibration?:{
  status:string;development:{breakout:number;improve:number;steady:number;decline:number;
    maxGain:number;maxLoss:number;volatility:string};
  draftDeclarationProbability:number|null;portalExitProbability:number|null;
  sources:string[];summary:string;nil?:{year1:number;year2Baseline:number};
}}>;

describe("CFB GM evidence-backed player calibration integrity", () => {
  it("preserves all 468 role identities and grades while distinguishing researched entries from priors", () => {
    expect(researched).toHaveLength(468);
    expect(CFB_GM_PLAYERS).toHaveLength(468);
    expect(new Set(CFB_GM_PLAYERS.map((p) => p.id)).size).toBe(468);
    expect(new Set(researched.map((r) => r.id)).size).toBe(468);
    expect(new Set(CFB_GM_PLAYERS.map((p) => p.schoolId))).toEqual(new Set(CFB_GM_AP_SCHOOLS));
    expect(researched.filter((r) => r.calibration)).toHaveLength(468);
    for (const row of researched) {
      const player = cfbGmPlayer(row.id);
      expect(player, row.id).toBeTruthy();
      expect(player!.classification).not.toBeNull();
      expect(player!.currentGrade).toBeGreaterThanOrEqual(50);
      expect(player!.currentGrade).toBeLessThanOrEqual(99);
      expect(player!.nilYear1).toBeGreaterThan(0);
      expect(player!.nilYear2).toBeGreaterThan(0);
      expect(player!.nilYear1 % 25_000).toBe(0);
      expect(player!.nilYear2 % 25_000).toBe(0);
      const profile = cfbGmDevProfile(row.id,player!.currentGrade,player!.classification);
      expect(profile.breakout+profile.improve+profile.steady+profile.decline).toBe(100);
      expect(profile.maxGain).toBeGreaterThanOrEqual(0);
      expect(profile.maxLoss).toBeGreaterThanOrEqual(0);
      expect(profile.maxGain).toBeLessThanOrEqual(99-player!.currentGrade);
      expect(profile.confidence).toBe(row.calibration?"reviewed-anchor":"provisional");
      for(const seed of ["cfb-evidence-one","cfb-evidence-two"]) {
        const d=cfbGmDevelop(row.id,player!.currentGrade,player!.classification,seed);
        expect(d).toEqual(cfbGmDevelop(row.id,player!.currentGrade,player!.classification,seed));
        expect(d.delta).toBeGreaterThanOrEqual(-profile.maxLoss);
        expect(d.delta).toBeLessThanOrEqual(profile.maxGain);
      }
    }
  });

  it("has twenty-five completely audited school cohorts with exact existing identities and grades", () => {
    for(const schoolId of ["alabama","oregon","texas","ohio-state","miami","georgia","lsu","notre-dame","byu","indiana","smu","florida","tennessee","boise-state","houston","iowa","utah","ucla","usc","missouri","texas-tech","mississippi-state","oklahoma-state","ole-miss","pittsburgh"]) {
      const school=CFB_GM_PLAYERS.filter((p)=>p.schoolId===schoolId);
      expect(school.length).toBeGreaterThan(10);
      for(const player of school){
        const evidence=researched.find((row)=>row.id===player.id);
        expect(evidence,player.id).toBeTruthy();
        expect(evidence!.calibration,player.id).toBeTruthy();
        expect(evidence!.calibration!.sources[0]).toContain("https://");
        expect(player.currentGrade).toBeGreaterThanOrEqual(50);
      }
    }
    expect(cfbGmPlayer("texas|herokanu")!.classification).toBe("5TH");
    expect(cfbGmPlayer("texas|raleekbrown")!.classification).toBe("5TH");
    expect(cfbGmPlayer("texas|hollywoodsmothers")!.classification).toBe("SR");
    expect(cfbGmPlayer("texas|spencershannon")!.classification).toBe("SR");
    for(const id of ["ohio-state|earllittlejr","ohio-state|jakobijackson","ohio-state|kenyattajacksonjr"])
      expect(cfbGmPlayer(id)!.classification).toBe("5TH");
  });

  it("validates probabilities, defensible sources, independent NIL and safe fallback provenance", () => {
    for(const row of researched.filter((r)=>r.calibration)){
      const c=row.calibration!, d=c.development;
      expect(c.status).toBe("evidence-informed-estimate");
      expect(Array.isArray(c.sources)).toBe(true);
      expect(c.sources.length).toBeGreaterThan(0);
      expect(c.sources.every((url)=>url.startsWith("https://"))).toBe(true);
      expect(c.summary.length).toBeGreaterThan(40);
      expect([d.breakout,d.improve,d.steady,d.decline].every(Number.isInteger)).toBe(true);
      expect(d.breakout+d.improve+d.steady+d.decline).toBe(100);
      for(const p of [c.draftDeclarationProbability,c.portalExitProbability])
        if(p!==null) {expect(p).toBeGreaterThanOrEqual(0);expect(p).toBeLessThanOrEqual(1);}
      if(c.nil){
        expect(c.nil.year1).toBe(cfbGmPlayer(row.id)!.nilYear1);
        expect(c.nil.year2Baseline).toBe(cfbGmPlayer(row.id)!.nilYear2);
      }
    }
    expect(CFB_GM_BUDGETS.POWERHOUSE).toBe(11_000_000);
    expect(CFB_GM_BUDGETS.BUILDER).toBe(7_500_000);
  });

  it("keeps all external NIL valuation-provider dollars and ranks out of runtime and research", () => {
    expect(researched.filter((r) => r.nilMarketEvidence)).toHaveLength(0);
    for (const row of researched) {
      const c=row.calibration as typeof row.calibration & {nilEvidence?:unknown};
      expect(c?.nil).toBeUndefined();
      expect(c?.nilEvidence).toBeUndefined();
      expect(c?.sources.every(url=>!url.includes("on3.com"))).toBe(true);
      const game=cfbGmPlayer(row.id)!;
      expect(game.nilYear1).toBeGreaterThanOrEqual(150_000);
      expect(game.nilYear2).toBeGreaterThan(game.nilYear1);
    }
    expect(cfbGmPlayer("missouri|ahmadhardy")!.nilYear1).toBe(1_925_000);
    expect(cfbGmPlayer("georgia|ellisrobinsoniv")!.nilYear1).toBe(1_625_000);
  });

  it("honors actual NFL draft timing and forced final-year eligibility in every seeded result", () => {
    const arch=cfbGmPlayer("texas|archmanning")!;
    const toure=cfbGmPlayer("miami|mohamedtoure")!;
    const stockton=cfbGmPlayer("georgia|gunnerstockton")!;
    expect(arch.classification).toBe("SR");
    expect(isModelDraftEligible("alabama|keelonrussell","SO")).toBe(false);
    expect(isModelDraftEligible("oregon|dakorienmoore","SO")).toBe(false);
    for(let i=0;i<24;i++){
      const run=cfbGmInitial("cfb-eligibility-"+String(i).padStart(3,"0"));
      run.roster=[
        {slot:"QB",playerId:stockton.id,acquired:"draft"},
        {slot:"FRONT_7_A",playerId:toure.id,acquired:"draft"},
      ];
      const departures=cfbGmForcedDepartures(run);
      expect(departures.map((x)=>x.playerId)).toEqual(expect.arrayContaining([toure.id,stockton.id]));
      expect(departures.every((x)=>x.reason==="NFL declaration"||x.reason==="Eligibility")).toBe(true);
      expect(cfbGmForcedDepartures(run)).toEqual(departures);
    }
    expect(researched.find((r)=>r.id==="texas|archmanning")?.remainingEligibility).toBe(1);
    expect(researched.find((r)=>r.id==="miami|mohamedtoure")?.remainingEligibility).toBe(0);
    expect(researched.find((r)=>r.id==="georgia|gunnerstockton")?.remainingEligibility).toBe(0);
    expect(researched.find((r)=>r.id==="indiana|joshhoover")?.remainingEligibility).toBe(0);
    expect(researched.find((r)=>r.id==="smu|kevinjennings")?.remainingEligibility).toBe(0);
    expect(researched.find((r)=>r.id==="ole-miss|trinidadchambliss")?.remainingEligibility).toBe(0);
    expect(isModelDraftEligible("oklahoma-state|drewmestemaker","SO")).toBe(true);
    for(const id of ["byu|bearbachmeier","mississippi-state|kamariotaylor","miami|malachitoney","tennessee|georgemacintyre"])
      expect(isModelDraftEligible(id,cfbGmPlayer(id)!.classification)).toBe(false);
  });
});
