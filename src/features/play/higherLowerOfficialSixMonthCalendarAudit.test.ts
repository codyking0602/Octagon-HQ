import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildNbaServerDailyPublication } from "../nba/nbaDailyServerPublication";
import { nbaHigherLowerMatchupKey, type NbaHigherLowerQuestion } from "../nba/nbaHigherLowerModel";

/**
 * This is the merged Part 1 (PR #2104) official 182-day calendar.
 * Football and UFC Higher or Lower have not been activated in that calendar;
 * no speculative dates should ever be represented as official appearances.
 */
const CALENDAR = "docs/audits/locked-three-sport-daily-calendar-20261025-20270424.csv";
const NBA_SCHEDULE_VERSION = "nba-daily-regular-v2-locked";
const SOURCE_BY_CATEGORY = {
  career: "nbaFindTheLeaderModel career factual inputs",
  season: "nbaFindTheLeaderModel season factual inputs; nbaHigherLowerSupplement 2025 threes",
  awards: "nbaHigherLowerSupplement NBA All-Star and All-NBA authored counts",
  draft: "nbaHigherLowerSupplement NBA Draft pick records",
} as const;

type Row = Record<string, unknown>;
function record(x:unknown):Row { return x as Row; }
function records(x:unknown):Row[]{ return x as Row[]; }
function schedule() {
  const rows=readFileSync(CALENDAR,"utf8").trim().split(/\r?\n/).map(row=>row.split(","));
  const headers=rows.shift()!;
  for(const key of ["central_day","football_after","ufc_after","nba_after"]) {
    if(!headers.includes(key)) throw new Error("Canonical schedule is missing "+key);
  }
  return rows.map(cols=>Object.fromEntries(headers.map((key,index)=>[key,cols[index]??""])));
}
describe("Six-month Higher or Lower calendar-bound source and duplication audit",()=>{
  it("publishes every actually scheduled NBA appearance as two factual boards, with fail-open gaps reported",()=>{
    const dates=schedule();
    expect(dates).toHaveLength(182);
    const bySport=Object.fromEntries(["football","ufc","nba"].map(sport=>[
      sport,dates.filter(row=>row[sport+"_after"]==="higher_lower").map(row=>row.central_day),
    ])) as Record<string,string[]>;
    const result:{
      calendar:string,calendarDates:number,sourceSchedule:string,
      appearances:Record<string,number>,requiredBoards:Record<string,number>,
      blockers:string[],duplicates:{metric:string,semantic:string}[],
      boards:Array<Record<string,unknown>>
    }={
      calendar:CALENDAR,calendarDates:dates.length,sourceSchedule:NBA_SCHEDULE_VERSION,
      appearances:Object.fromEntries(Object.entries(bySport).map(([sport,v])=>[sport,v.length])),
      requiredBoards:Object.fromEntries(Object.entries(bySport).map(([sport,v])=>[sport,v.length*2])),
      blockers:[],duplicates:[],boards:[],
    };
    if(!bySport.football?.length) result.blockers.push("Football Higher or Lower not activated in Part 1 official calendar");
    if(!bySport.ufc?.length) result.blockers.push("UFC Higher or Lower not activated in Part 1 official calendar");
    const exact=new Set<string>(),semantic=new Set<string>();
    for(const day of bySport.nba??[]) {
      const pub=buildNbaServerDailyPublication(day,NBA_SCHEDULE_VERSION,"higher_lower");
      expect(pub.scoringVersion).toBe("daily-two-game-average-score-v1");
      const roundEvidence=records(pub.privateSetupEvidence.rounds);
      expect(roundEvidence).toHaveLength(2);
      const daily=new Set<string>();
      for(const [index,round] of roundEvidence.entries()) {
        const board=record(record(round.private_setup_evidence).board);
        const questions=records(board.questions) as unknown as NbaHigherLowerQuestion[];
        expect(questions).toHaveLength(10);
        const grading=record(round.private_grading_evidence);
        expect(grading.question_ids).toEqual(questions.map(q=>q.id));
        expect(grading.correct_choices).toEqual(questions.map(q=>q.answer));
        const rows=questions.map(q=>{
          const metric=nbaHigherLowerMatchupKey(q);
          const identities=[q.known.name.toLowerCase(),q.hidden.name.toLowerCase()].sort().join("|");
          const semanticKey=identities;
          if(exact.has(metric))result.duplicates.push({metric,semantic:semanticKey});
          if(semantic.has(semanticKey))result.duplicates.push({metric,semantic:semanticKey});
          exact.add(metric);semantic.add(semanticKey);daily.add(metric);
          expect(q.answer).toBe(q.hidden.value>q.known.value?"higher":"lower");
          expect(q.known.value).not.toBe(q.hidden.value);
          expect(q.known.name).not.toBe(q.hidden.name);
          return {
            questionId:q.id,metricKey:q.metricKey,metricLabel:q.metricLabel,
            category:q.category,difficulty:q.difficulty,matchupKey:metric,
            semanticPair:identities,sourceCatalog:SOURCE_BY_CATEGORY[q.category],
            known:q.known,hidden:q.hidden,answer:q.answer,
          };
        });
        result.boards.push({sport:"nba",day,gameNumber:index+1,seed:board.seed,questions:rows});
      }
      expect(daily.size).toBe(20);
    }
    expect(result.boards).toHaveLength((bySport.nba??[]).length*2);
    expect(result.duplicates).toEqual([]);
    if(process.env.OCTAGON_WRITE_HL_AUDIT==="1"){
      mkdirSync("artifacts",{recursive:true});
      writeFileSync("artifacts/higher-lower-canonical-six-month-audit.json",
        JSON.stringify({...result,certified:result.blockers.length===0},null,2)+"\\n");
    }
    console.info("HIGHER_LOWER_CALENDAR_AUDIT",JSON.stringify({
      appearances:result.appearances,requiredBoards:result.requiredBoards,
      duplicates:result.duplicates.length,blockers:result.blockers
    }));
  },240_000);
});
