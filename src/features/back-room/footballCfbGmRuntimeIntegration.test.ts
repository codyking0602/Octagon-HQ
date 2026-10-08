import { describe, expect, it } from "vitest";
import { cfbGmDevelop } from "./footballCfbGmDevelopment";
import { cfbGmEstimateNil } from "./footballCfbGmNilMarket";
import {
  CFB_GM_BUDGETS, CFB_GM_PLAYERS, cfbGmCandidates, cfbGmEffectiveGrade,
  cfbGmEligibleSchools, cfbGmEnterOffseason, cfbGmInitial, cfbGmPick,
  cfbGmPlayer, cfbGmPortalOut, cfbGmSeason, cfbGmSpent,
  cfbGmSpin, cfbGmTeamGrade, cfbGmValidateRun, isModelDraftEligible,
} from "./footballCfbGmEngine";

describe("CFB GM 2026 class + NIL + development runtime integration", () => {
  it("binds the complete researched population without inventing class labels", () => {
    expect(CFB_GM_PLAYERS).toHaveLength(468);
    expect(CFB_GM_PLAYERS.filter((p) => p.classification !== null)).toHaveLength(423);
    expect(CFB_GM_PLAYERS.filter((p) => p.classification === null)).toHaveLength(45);
    expect(cfbGmPlayer("texas|colinsimmons")?.classification).toBe("JR");
    for (const player of CFB_GM_PLAYERS) {
      expect(player.classVerified).toBe(player.classification !== null);
      expect(player.nilYear1 % 25_000).toBe(0);
      expect(player.nilYear2 % 25_000).toBe(0);
    }
  });

  it("uses the NIL authority independently from the audited HQ grades and both budget settings", () => {
    const arch = cfbGmPlayer("texas|archmanning")!;
    expect(arch.nilYear1).toBe(4_200_000);
    expect(arch.nilYear2).toBe(4_625_000);
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
    expect(CFB_GM_PLAYERS.filter((p) => p.classification === "FR" ||
      p.classification === "SO").every((p) => !isModelDraftEligible(p.id,p.classification))).toBe(true);
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
});
