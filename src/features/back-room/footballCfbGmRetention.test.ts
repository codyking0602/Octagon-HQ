import { describe, expect, it } from "vitest";
import {
  CFB_GM_BUDGETS, CFB_GM_PLAYERS, cfbGmCandidates, cfbGmChemistry,
  cfbGmEligibleSchools, cfbGmEnterOffseason, cfbGmFinalResult, cfbGmInitial,
  cfbGmNegotiateRetention, cfbGmOffseasonReady, cfbGmPendingRetentions,
  cfbGmPick, cfbGmPlayer, cfbGmPortalOut, cfbGmPrice, cfbGmRetentionQuote,
  cfbGmSeason, cfbGmSpent, cfbGmSpin, cfbGmYear2Ask,
} from "./footballCfbGmEngine";

describe("CFB GM negotiated 2027 NIL and college chemistry", () => {
  it("keeps Year 1 market values independent of development while 2027 asks are seeded and player-specific", () => {
    const arch=cfbGmPlayer("texas|archmanning")!;
    expect(cfbGmPrice(arch,1,"any-seed")).toBe(arch.nilYear1);
    const asks=Array.from({length:25},(_,i)=>cfbGmYear2Ask(arch,"market-seed-"+i));
    expect(new Set(asks).size).toBeGreaterThan(1);
    expect(asks.every(x=>x>=125_000 && x%25_000===0)).toBe(true);
    expect(cfbGmPrice(arch,2)).toBe(arch.nilYear2);
  });
  it("rewards genuine teammate cohesion without changing pure team OVR or source grades", () => {
    const team=CFB_GM_PLAYERS.filter(p=>p.schoolId==="texas");
    const qb=team.find(p=>p.family==="QB")!;
    const wr=team.find(p=>p.family==="WR")!;
    const unrelated=CFB_GM_PLAYERS.find(p=>p.family==="WR" && p.schoolId!=="texas")!;
    const pair=[{slot:"QB" as const,playerId:qb.id,acquired:"draft" as const},
      {slot:"WR" as const,playerId:wr.id,acquired:"draft" as const}];
    const mixed=[pair[0]!,{...pair[1]!,playerId:unrelated.id}];
    expect(cfbGmChemistry(pair).meter).toBeGreaterThan(cfbGmChemistry(mixed).meter);
    const snapshot=qb.currentGrade;
    expect(cfbGmChemistry(pair,2,pair).adjustment).toBeGreaterThan(-1);
    expect(qb.currentGrade).toBe(snapshot);
  });
  it("makes binding offers enforceable, removes declined players and refuses repeats", () => {
    const budget=CFB_GM_BUDGETS.POWERHOUSE;
    let run=cfbGmInitial("retention-choice-12345");
    for(let turn=0;turn<7;turn++){
      const schools=cfbGmEligibleSchools(run.roster,budget,1,run.previousSchool);
      const school=cfbGmSpin(run.seed,turn,schools)!;
      const player=[...cfbGmCandidates(school,run.roster,budget,1)]
        .sort((a,b)=>a.nilYear1-b.nilYear1)[0]!;
      run={...run,roster:cfbGmPick(run.roster,player.id,budget,1)!,
        previousSchool:school,spinIndex:turn+1};
    }
    run=cfbGmEnterOffseason({...run,phase:"year1"});
    const pending=cfbGmPendingRetentions(run);
    expect(pending.length).toBe(run.finalRoster.length);
    if(!pending.length)return;
    const player=pending[0]!, quote=cfbGmRetentionQuote(run,player);
    const agreed=cfbGmNegotiateRetention(run,player.id,"PRIORITY")!;
    expect(agreed.retentionOffers[player.id]).toEqual({tier:"PRIORITY",amount:quote.PRIORITY,accepted:true});
    expect(cfbGmNegotiateRetention(agreed,player.id,"VALUE")).toBeNull();
    expect(cfbGmPrice(player,2,run.seed,agreed.retentionOffers)).toBe(quote.PRIORITY);
    let resolved=agreed;
    for(const prospect of cfbGmPendingRetentions(agreed)) resolved=cfbGmNegotiateRetention(resolved,prospect.id,"MARKET")!;
    expect(cfbGmPendingRetentions(resolved)).toHaveLength(0);
  });
  it("stress-tests Powerhouse and Builder complete seasons through negotiated retention and portal", () => {
    const summary:Record<string,{completed:number;cfp:number;score:number}>={};
    for(const mode of ["POWERHOUSE","BUILDER"] as const) {
      const budget=CFB_GM_BUDGETS[mode];
      let completed=0, cfp=0, score=0;
      for(let i=0;i<80;i++){
        let run=cfbGmInitial("nil-stress-"+mode+"-"+i,mode);
        for(let round=0;round<7;round++){
          const schools=cfbGmEligibleSchools(run.roster,budget,1,run.previousSchool);
          expect(schools.length,mode+" draft "+i+"/"+round).toBeGreaterThan(0);
          const school=cfbGmSpin(run.seed,round,schools)!;
          const picks=[...cfbGmCandidates(school,run.roster,budget,1)]
            .sort((a,b)=>a.nilYear1-b.nilYear1);
          const candidate=picks[Math.min(picks.length-1,i%3)]!;
          const roster=cfbGmPick(run.roster,candidate.id,budget,1)!;
          expect(roster).not.toBeNull();
          run={...run,roster,previousSchool:school,spinIndex:round+1};
        }
        run=cfbGmEnterOffseason({...run,phase:"year1"});
        for(const player of cfbGmPendingRetentions(run)) {
          const next=cfbGmNegotiateRetention(run,player.id,i%4===0?"VALUE":"MARKET");
          expect(next,player.id).not.toBeNull();
          run=next!;
        }
        expect(cfbGmPendingRetentions(run)).toHaveLength(0);
        let attempts=0;
        while(!cfbGmOffseasonReady(run)&&attempts++<15) {
          const excluded=new Set([...run.roster.map(r=>r.playerId),
            ...run.departures.map(r=>r.playerId),...run.voluntaryPortalOuts]);
          const schools=run.finalRoster.length<7?cfbGmEligibleSchools(run.finalRoster,budget,2,
            run.previousPortalSchool,run.schoolIds,excluded,run.seed,run.retentionOffers):[];
          if(!schools.length) {
            if(run.voluntaryPortalOuts.length>=2)break;
            const costly=[...run.finalRoster].sort((a,b)=>
              cfbGmPrice(cfbGmPlayer(b.playerId)!,2,run.seed,run.retentionOffers)-
              cfbGmPrice(cfbGmPlayer(a.playerId)!,2,run.seed,run.retentionOffers));
            if(!costly.length)break;
            run=cfbGmPortalOut(run,costly[0]!.playerId)!;
            continue;
          }
          const school=cfbGmSpin(run.seed,100+run.portalSpins,schools)!;
          const choices=[...cfbGmCandidates(school,run.finalRoster,budget,2,true,excluded,run.seed,run.retentionOffers)]
            .sort((a,b)=>cfbGmYear2Ask(a,run.seed)-cfbGmYear2Ask(b,run.seed));
          expect(choices.length).toBeGreaterThan(0);
          run={...run,finalRoster:cfbGmPick(run.finalRoster,choices[0]!.id,budget,2,excluded,run.seed,run.retentionOffers)!,
            previousPortalSchool:school,portalSpins:run.portalSpins+1};
        }
        if (!cfbGmOffseasonReady(run))continue;
        expect(run.finalRoster).toHaveLength(7);
        expect(cfbGmSpent(run.finalRoster,2,run.seed,run.retentionOffers)).toBeLessThanOrEqual(budget);
        expect(cfbGmSeason(run,2).chemistry).toBeGreaterThanOrEqual(15);
        const result=cfbGmFinalResult({...run,phase:"final"});
        score+=result.score;
        cfp+=result.seasons.filter(s=>s.cfpSeed!==null).length;
        completed++;
      }
      summary[mode]={completed,cfp,score};
      expect(completed,mode+" completion / 80 seeds").toBeGreaterThanOrEqual(70);
    }
    expect(summary.POWERHOUSE!.completed).toBeGreaterThan(0);
    expect(summary.BUILDER!.completed).toBeGreaterThan(0);
  }, 120_000);
});
