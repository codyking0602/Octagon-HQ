import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cfbGmDevelop } from "./footballCfbGmDevelopment";
import { cfbGmEstimateNil } from "./footballCfbGmNilMarket";
import {
  CFB_GM_BUDGETS, CFB_GM_PLAYERS, cfbGmCandidates, cfbGmEffectiveGrade,
  cfbGmEligibleSchools, cfbGmEnterOffseason, cfbGmInitial, cfbGmPick,
  cfbGmPlayer, cfbGmPortalOut, cfbGmSeason, cfbGmSpent,
  cfbGmSpin, cfbGmTeamGrade, cfbGmValidateRun, cfbGmFinalResult, isModelDraftEligible,
} from "./footballCfbGmEngine";

describe("CFB GM 2026 class + NIL + development runtime integration", () => {
  it("binds the complete researched population without inventing class labels", () => {
    expect(CFB_GM_PLAYERS).toHaveLength(468);
    expect(CFB_GM_PLAYERS.filter((p) => p.classification !== null)).toHaveLength(468);
    expect(CFB_GM_PLAYERS.filter((p) => p.classification === null)).toHaveLength(0);
    expect(cfbGmPlayer("texas|colinsimmons")?.classification).toBe("JR");
    const ledger = JSON.parse(readFileSync("data/curated/football/cfb/gm-2026-classification-evidence.json","utf8"));
    const runtime = JSON.parse(readFileSync("data/generated/football/cfb-gm-classification-runtime-2026.json","utf8"));
    expect(runtime.population).toBe(ledger.population);
    expect(runtime.players).toEqual(ledger.players.map((p: {
      id: string; classification: string | null; remainingEligibility: number | null;
      earliestDraftYear: number | null; draftEligible2027: boolean | null;
      nilMarketEvidence?:{year1:number;year2Baseline:number;providerRank:number;confidence:string};
      calibration?:{status:string;development:Record<string,number|string>;
        draftDeclarationProbability:number|null;portalExitProbability:number|null;
        nil?:{year1:number;year2Baseline:number;confidence:string;basis:string}};
    }) => ({id:p.id, classification:p.classification, remainingEligibility:p.remainingEligibility,
      earliestDraftYear:p.earliestDraftYear, draftEligible2027:p.draftEligible2027,
      ...(p.nilMarketEvidence ? {nilMarket:{year1:p.nilMarketEvidence.year1,year2Baseline:p.nilMarketEvidence.year2Baseline,providerRank:p.nilMarketEvidence.providerRank,confidence:p.nilMarketEvidence.confidence}} : {}),
      ...(p.calibration ? {calibration:{status:p.calibration.status,
        development:p.calibration.development,
        draftDeclarationProbability:p.calibration.draftDeclarationProbability,
        portalExitProbability:p.calibration.portalExitProbability,
        ...(p.calibration.nil ? {nil:p.calibration.nil} : {})}} : {})})));

    for (const player of CFB_GM_PLAYERS) {
      expect(player.classVerified).toBe(player.classification !== null);
      expect(player.nilYear1 % 25_000).toBe(0);
      expect(player.nilYear2 % 25_000).toBe(0);
    }
  });

  it("uses the NIL authority independently from the audited HQ grades and both budget settings", () => {
    const arch = cfbGmPlayer("texas|archmanning")!;
    expect(arch.nilYear1).toBe(2_500_000);
    expect(arch.nilYear2).toBe(2_750_000);
    const sameMarket = cfbGmEstimateNil({schoolId:"texas",name:"Arch Manning",
      family:"QB",positionRoleRank:0,apRank:1});
    expect(arch.nilYear1).toBe(sameMarket.year1);
    expect(CFB_GM_BUDGETS.BUILDER).toBe(7_500_000);
    expect(CFB_GM_BUDGETS.POWERHOUSE).toBe(11_000_000);
  });

  it("prevents premature NFL declarations and does not treat all seniors as automatically expired", () => {
    expect(isModelDraftEligible("texas|colinsimmons","JR")).toBe(true);
    expect(isModelDraftEligible("model|freshman","FR")).toBe(false);
    expect(isModelDraftEligible("model|sophomore","SO")).toBe(false);
    expect(isModelDraftEligible("model|unknown",null)).toBe(false);
    expect(isModelDraftEligible("model|older","5TH")).toBe(true);
    expect(isModelDraftEligible("miami|mohamedtoure","8TH")).toBe(true);
    expect(cfbGmPlayer("smu|jimmywyrick")?.classification).toBe("6TH");
    expect(cfbGmPlayer("texas|archmanning")?.classification).toBe("SR");
    expect(isModelDraftEligible("alabama|keelonrussell","SO")).toBe(false);
    // Classification alone is not NFL eligibility: 2026 redshirt sophomore Drew
    // Mestemaker entered college in 2024 and is eligible for the 2027 draft.
    expect(isModelDraftEligible("oklahoma-state|drewmestemaker","SO")).toBe(true);
    // A 2026 redshirt-sophomore label can follow 2024 matriculation.
    // Check eligibility against the player's researched initial entry rather
    // than inventing a blanket sophomore prohibition.
    const classEvidence = JSON.parse(readFileSync("data/curated/football/cfb/gm-2026-classification-evidence.json","utf8")) as {
      players:Array<{id:string;earliestDraftYear:number|null;draftEligible2027:boolean|null}>;
    };
    const draftYears=new Map(classEvidence.players.map((row)=>[row.id,row]));
    for(const player of CFB_GM_PLAYERS.filter((p)=>p.classification==="FR"||p.classification==="SO")) {
      const observed=isModelDraftEligible(player.id,player.classification);
      const evidence=draftYears.get(player.id)!;
      if(observed) {
        expect(evidence.draftEligible2027,player.id).toBe(true);
        expect(evidence.earliestDraftYear,player.id).not.toBeNull();
        expect(evidence.earliestDraftYear!,player.id).toBeLessThanOrEqual(2027);
      } else if(evidence.draftEligible2027!==null) {
        expect(evidence.draftEligible2027,player.id).toBe(false);
      }
    }
    expect(isModelDraftEligible("lsu|dilinjones","SO")).toBe(true);
  });

  it("applies actual seeded development to the second-year team and leaves Wheel HQ untouched", () => {
    const player = cfbGmPlayer("texas|ryanwingo")!;
    const initialGrade = player.currentGrade;
    let hasChange = false;
    for (let i = 0; i < 100; i++) {
      const seed = "cfb-integrated-" + i;
      const modeled = cfbGmDevelop(player.id, initialGrade, player.classification, seed);
      expect(cfbGmEffectiveGrade(player,2,seed)).toBe(modeled.after);
      expect(cfbGmEffectiveGrade(player,1,seed)).toBe(initialGrade);
      hasChange ||= modeled.delta !== 0;
    }
    expect(hasChange).toBe(true);
    expect(cfbGmPlayer(player.id)?.currentGrade).toBe(initialGrade);
    const roster = [{slot: "WR" as const, playerId: player.id, acquired: "draft" as const}];
    expect(cfbGmTeamGrade(roster,2,"cfb-integrated-1"))
      .toBe(Math.round(cfbGmEffectiveGrade(player,2,"cfb-integrated-1")*.13*10)/10);
  });

  it("version-gates existing owner runs so previous outcomes are never silently recalculated", () => {
    const run=cfbGmInitial("cfb-old-protection-123");
    expect(cfbGmValidateRun(run)).not.toBeNull();
    expect(cfbGmValidateRun({...run,version:"cfb-gm-owner-preview-v2-cfp"})).toBeNull();
    expect(cfbGmValidateRun({...run,version:"cfb-gm-owner-preview-v3-market-development"})).toBeNull();
    expect(cfbGmValidateRun({...run,version:"cfb-gm-owner-preview-v4-official-classes"})).toBeNull();
    expect(cfbGmValidateRun({...run,version:"cfb-gm-owner-preview-v5-extended-year-evidence"})).toBeNull();
  });

  it("completes multiple seeded seven-player draft paths under both budgets", () => {
    for (const mode of ["POWERHOUSE","BUILDER"] as const) for (let i=0;i<16;i++) {
      let run=cfbGmInitial("market-stress-"+mode+"-"+i,mode);
      const budget=CFB_GM_BUDGETS[mode];
      for(let round=0;round<7;round++) {
        const schools=cfbGmEligibleSchools(run.roster,budget,1,run.previousSchool);
        expect(schools.length).toBeGreaterThan(0);
        const school=cfbGmSpin(run.seed,round,schools)!;
        const candidates=cfbGmCandidates(school,run.roster,budget,1);
        expect(candidates.length).toBeGreaterThan(0);
        // A range of reasonable choices, not just the universally cheapest.
        const priced=[...candidates].sort((a,b)=>a.nilYear1-b.nilYear1);
        const player=priced[Math.floor((priced.length-1)*(i%4)/6)]!;
        const roster=cfbGmPick(run.roster,player.id,budget,1)!;
        expect(roster).not.toBeNull();
        run={...run,roster,previousSchool:school,spinIndex:round+1};
      }
      expect(run.roster).toHaveLength(7);
      expect(cfbGmSpent(run.roster,1)).toBeLessThanOrEqual(budget);
      const season1=cfbGmSeason(run,1);
      expect(season1.wins+season1.losses).toBe(12);
      run=cfbGmEnterOffseason({...run,phase:"year1"});
      expect(run.departures.every((d)=>d.reason!=="NFL declaration" ||
        isModelDraftEligible(d.playerId,cfbGmPlayer(d.playerId)!.classification))).toBe(true);
      expect(cfbGmSeason(run,2).teamGrade)
        .toBe(cfbGmTeamGrade(run.finalRoster,2,run.seed));
      // The unfinished postseason is never presented as a finalized run.
      expect(run.phase).toBe("offseason");
    }
  });
  it("finishes seeded two-year games after realistic forced departures and portal replacements", () => {
    for (const mode of ["POWERHOUSE","BUILDER"] as const) for (let i=0;i<8;i++) {
      let run=cfbGmInitial("full-cfb-game-"+mode+"-"+i, mode);
      const budget=CFB_GM_BUDGETS[mode];
      for (let round=0;round<7;round++) {
        const schools=cfbGmEligibleSchools(run.roster,budget,1,run.previousSchool);
        expect(schools.length).toBeGreaterThan(0);
        const school=cfbGmSpin(run.seed,round,schools)!;
        const choices=[...cfbGmCandidates(school,run.roster,budget,1)]
          .sort((a,b)=>a.nilYear1-b.nilYear1);
        const player=choices[Math.floor((choices.length-1)/4)]!;
        const roster=cfbGmPick(run.roster,player.id,budget,1)!;
        expect(roster).not.toBeNull();
        run={...run,roster,previousSchool:school,spinIndex:round+1};
      }
      run=cfbGmEnterOffseason({...run,phase:"year1"});
      let attempts=0;
      while (run.finalRoster.length<7 || cfbGmSpent(run.finalRoster,2)>budget) {
        expect(attempts++).toBeLessThan(12);
        const excluded=new Set([...run.roster.map(p=>p.playerId),
          ...run.departures.map(p=>p.playerId), ...run.voluntaryPortalOuts]);
        const schools=run.finalRoster.length<7
          ? cfbGmEligibleSchools(run.finalRoster,budget,2,run.previousPortalSchool,run.schoolIds,excluded)
          : [];
        if (!schools.length) {
          expect(run.voluntaryPortalOuts.length).toBeLessThan(2);
          const highest=[...run.finalRoster].sort((a,b)=>
            cfbGmPlayer(b.playerId)!.nilYear2-cfbGmPlayer(a.playerId)!.nilYear2)[0]!;
          run=cfbGmPortalOut(run,highest.playerId)!;
          expect(run).not.toBeNull();
          continue;
        }
        const school=cfbGmSpin(run.seed,100+run.portalSpins,schools)!;
        const choices=[...cfbGmCandidates(school,run.finalRoster,budget,2,true,excluded)]
          .sort((a,b)=>a.nilYear2-b.nilYear2);
        expect(choices.length).toBeGreaterThan(0);
        const roster=cfbGmPick(run.finalRoster,choices[0]!.id,budget,2,excluded)!;
        expect(roster).not.toBeNull();
        run={...run,finalRoster:roster,previousPortalSchool:school,portalSpins:run.portalSpins+1};
      }
      expect(run.finalRoster).toHaveLength(7);
      expect(cfbGmSpent(run.finalRoster,2)).toBeLessThanOrEqual(budget);
      run={...run,phase:"final"};
      const report=cfbGmFinalResult(run);
      expect(report.seasons).toHaveLength(2);
      expect(Number.isFinite(report.score)).toBe(true);
      expect(report.seasons.every(s=>s.wins+s.losses===12)).toBe(true);
      expect(report.seasons[1].teamGrade).toBe(cfbGmTeamGrade(run.finalRoster,2,run.seed));
    }
  });

});
