import { describe, expect, it } from "vitest";
import { isUfcPublicationDay, lockedWeightedGameForDay } from "./dailyChallengeRotation";
import { nbaRegularSeasonDaily } from "../nba/nbaDailySchedule";
import { buildFootballHigherLowerTwoGameDailyPublication } from "./footballHigherLowerDailyRuntime";
import { buildUfcHigherLowerTwoGameDailyPublication } from "./ufcHigherLowerDailyRuntime";
import { buildNbaServerDailyPublication } from "../nba/nbaDailyServerPublication";
import { footballHigherLowerSemanticPairKey, footballHigherLowerQuestionEvidence, type FootballHigherLowerQuestion } from "../back-room/footballHigherLowerModel";
import { nbaHigherLowerSemanticPairKey } from "../nba/nbaHigherLowerModel";

type Sport = "football" | "ufc" | "nba";
type Pair = { id:string; answer:string; metricKey:string; league?:string;
  known:{subjectId:string;name:string;value:number}; hidden:{subjectId:string;name:string;value:number} };
function children(pub: { privateSetupEvidence: Record<string, unknown> }) {
  const rounds = pub.privateSetupEvidence.rounds as Array<{private_setup_evidence:{board:{questions:Pair[]}}}>;
  expect(rounds).toHaveLength(2);
  return rounds.map(r=>r.private_setup_evidence.board.questions);
}
describe("approved 2x Higher or Lower six-month publication audit",()=>{
  it("certifies all actual Football, UFC and NBA slots with 20 distinct, graded comparisons per appearance",()=>{
    const seen:Record<Sport,Set<string>>={football:new Set(),ufc:new Set(),nba:new Set()};
    const dates:Record<Sport,string[]>={football:[],ufc:[],nba:[]};
    const history:FootballHigherLowerQuestion[]=[];
    for(let offset=0;offset<182;offset++){
      const day=new Date(Date.UTC(2026,9,25+offset)).toISOString().slice(0,10);
      const nba=nbaRegularSeasonDaily(day);
      const sports:Sport[]=[];
      if(lockedWeightedGameForDay("football",day)==="higher_lower")sports.push("football");
      if(isUfcPublicationDay(day)&&lockedWeightedGameForDay("ufc",day)==="higher_lower")sports.push("ufc");
      if(nba?.isPublicationDay&&nba.gameType==="higher_lower")sports.push("nba");
      for(const sport of sports){
        const pub=sport==="football"
          ?buildFootballHigherLowerTwoGameDailyPublication(day,"football-daily-v22-higher-lower-oct27",history)
          :sport==="ufc"
            ?buildUfcHigherLowerTwoGameDailyPublication(day,"ufc-daily-v22-higher-lower-oct29")
            :buildNbaServerDailyPublication(day,"nba-daily-regular-v2-locked","higher_lower");
        const rounds=children(pub);
        dates[sport].push(day);
        for(const q of rounds){
          expect(q).toHaveLength(10);
          expect(new Set(q.map(r=>r.id)).size).toBe(10);
          if(sport==="football"){
            expect(q.filter(r=>r.league==="NFL")).toHaveLength(5);
            expect(q.filter(r=>r.league==="CFB")).toHaveLength(5);
          }
          for(const r of q){
            expect(r.known.value).not.toBe(r.hidden.value);
            expect(r.answer).toBe(r.hidden.value>r.known.value?"higher":"lower");
            const key=sport==="football"?footballHigherLowerSemanticPairKey(r.known.subjectId,r.hidden.subjectId)
              :sport==="nba"?nbaHigherLowerSemanticPairKey(r.known.name,r.hidden.name)
              :[r.known.subjectId,r.hidden.subjectId].sort().join("|");
            expect(seen[sport].has(key),sport+":"+day+":"+key).toBe(false);
            seen[sport].add(key);
            if(sport==="football"){
              const evidence=footballHigherLowerQuestionEvidence(r as FootballHigherLowerQuestion);
              expect(evidence.known.sourceIds.length).toBeGreaterThan(0);
              expect(evidence.hidden.sourceIds.length).toBeGreaterThan(0);
            }
          }
          if(sport==="football")history.push(...q as FootballHigherLowerQuestion[]);
        }
      }
    }
    expect(Object.fromEntries(Object.entries(dates).map(([k,v])=>[k,v.length]))).toEqual({football:13,ufc:6,nba:6});
    expect([...seen.football]).toHaveLength(260);
    expect([...seen.ufc]).toHaveLength(120);
    expect([...seen.nba]).toHaveLength(120);
    console.info("APPROVED_HIGHER_LOWER_ACTUAL_V22_DATES",JSON.stringify(dates));
  },180_000);
});
