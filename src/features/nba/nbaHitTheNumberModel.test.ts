import { describe, expect, it } from "vitest";
import { hitTheNumberScore } from "../play/hitTheNumberEngine";
import { NBA_HIT_STAT_CATALOG, nbaHitSubjectById, nbaHitSubjects, nbaHitValue } from "./nbaHitTheNumberStats";
import {
  NBA_HIT_PICK_WEIGHTS, NBA_HIT_FORMAT_WEIGHTS, nbaHitPoolSize,
  createNbaHitTheNumberPlan, nbaHitSelectionSatisfies, nbaHitAvailableSubjectIds,
  nbaHitResult, nbaHitBoardQuality,
} from "./nbaHitTheNumberModel";

describe("NBA Hit the Number approved game contract",()=>{
  it("uses exactly the six intuitive per-game categories",()=>{
    expect(NBA_HIT_STAT_CATALOG.map(x=>x.id)).toEqual([
      "career-points","career-assists","career-rebounds",
      "season-points","season-assists","season-rebounds",
    ]);
    expect(NBA_HIT_STAT_CATALOG.every(x=>x.label.endsWith("Per Game"))).toBe(true);
  });
  it("locks 4/5 only and favors 4 by 85 to 15",()=>{
    expect(NBA_HIT_PICK_WEIGHTS).toEqual([{value:4,weight:85},{value:5,weight:15}]);
    expect(nbaHitPoolSize(4)).toBe(12);
    expect(nbaHitPoolSize(5)).toBe(14);
    expect(()=>nbaHitPoolSize(3)).toThrow();
    expect(()=>nbaHitPoolSize(6)).toThrow();
    expect(NBA_HIT_FORMAT_WEIGHTS.map(x=>x.value)).toEqual([
      "classic","themed-lineup","one-from-each","build-the-team",
    ]);
  });
  it("uses factual one-decimal snapshots, visible season labels and unique IDs",()=>{
    expect(nbaHitSubjects.length).toBeGreaterThan(100);
    expect(new Set(nbaHitSubjects.map(s=>s.id)).size).toBe(nbaHitSubjects.length);
    for(const s of nbaHitSubjects) {
      expect(Object.values(s.values).every(x=>Number.isFinite(x)&&x>=0&&Math.round(x*10)===x*10)).toBe(true);
      expect(s.scope==="career" ? s.season===null : s.subtitle.includes("season")).toBe(true);
      if(s.scope==="season") {
        expect(s.subtitle).toMatch(/20(24|25)–(25|26) season/);
      }
    }
  });
  it("uses canonical historical NBA IDs for classic player photos",()=>{
    expect(nbaHitSubjectById.get("career:Kareem Abdul-Jabbar")?.nbaId).toBe(76003);
    expect(nbaHitSubjectById.get("career:Magic Johnson")?.nbaId).toBe(77142);
  });
  it("generates diversified boards, preserving exact shared Bob Barker scoring",()=>{
    const foundFormats=new Set<string>(),foundStats=new Set<string>(),foundPicks=new Set<number>();
    for(let i=0;i<90;i++){
      const plan=createNbaHitTheNumberPlan("nba-regression-"+i);
      foundFormats.add(plan.formatId);foundStats.add(plan.statId);foundPicks.add(plan.pickCount);
      expect([4,5]).toContain(plan.pickCount);
      expect(plan.subjectIds).toHaveLength(nbaHitPoolSize(plan.pickCount));
      expect(new Set(plan.subjectIds).size).toBe(plan.subjectIds.length);
      const people=plan.subjectIds.map(id=>nbaHitSubjectById.get(id)!);
      expect(new Set(people.map(s=>s.name)).size).toBe(people.length);
      expect(people.every(s=>s.scope===(plan.season==null?"career":"season")&&(plan.season==null||s.season===plan.season))).toBe(true);
      const quality=nbaHitBoardQuality(plan);
      expect(quality.passes).toBe(true);
      expect(quality.goodUnderCount).toBeGreaterThanOrEqual(4);
      expect(quality.underCount).toBeGreaterThan(0);
      expect(quality.bustCount).toBeGreaterThan(0);
      if(!plan.slots.length){
        const ids=plan.subjectIds.slice(0,plan.pickCount);
        const result=nbaHitResult(plan,ids);
        expect(result.score).toBe(hitTheNumberScore({status:result.status,target:result.target,
          distance:result.distance,pickCount:plan.pickCount}));
      } else {
        const chosen:string[]=[];
        for(let slot=0;slot<plan.pickCount;slot++) {
          const possible=nbaHitAvailableSubjectIds(plan,chosen);
          expect(possible.length).toBeGreaterThan(0);
          chosen.push(possible[0]!);
        }
        expect(nbaHitSelectionSatisfies(plan,chosen)).toBe(true);
        expect(nbaHitResult(plan,chosen).selections).toHaveLength(plan.pickCount);
      }
      expect(people.every(p=>Number.isFinite(nbaHitValue(p,plan.statId)))).toBe(true);
    }
    expect(foundFormats.size).toBe(4);
    expect(foundStats.size).toBe(6);
    expect(foundPicks).toEqual(new Set([4,5]));
  });
});
