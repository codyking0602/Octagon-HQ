import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildFootballHigherLowerTwoGameDailyPublication } from "./footballHigherLowerDailyRuntime";
import { buildUfcHigherLowerTwoGameDailyPublication } from "./ufcHigherLowerDailyRuntime";
import { buildNbaServerDailyPublication } from "../nba/nbaDailyServerPublication";
import { footballHigherLowerQuestionEvidence, type FootballHigherLowerQuestion } from "../back-room/footballHigherLowerModel";
import type { OfficialDailySetupPublication } from "./todaysChallengeRuntime";

type Sport = "football" | "ufc" | "nba";
type Q = {
  id: string; league?: string; category: string; metricKey: string; metricLabel: string;
  difficulty: string; answer: string;
  known: {subjectId: string; name: string; value: number; context?: string; referenceYear?: number};
  hidden: {subjectId: string; name: string; value: number; context?: string; referenceYear?: number};
};
type Row = {day:string; game:number; question:number; comparison:Q; comparisonKey:string;
  semanticPair:string; gradingValid:boolean; sources:unknown};
const csvPath="docs/audits/locked-three-sport-daily-calendar-20261025-20270424.csv";
const raw=readFileSync(csvPath,"utf8").trim().split("\n");
const header=raw[0]!.split(",");
const calendar=raw.slice(1).map(line => Object.fromEntries(header.map((column,i)=>[column,line.split(",")[i]??""])));
const dates=(sport:Sport) => calendar.filter(r => r[`${sport}_after`]==="higher_lower" && (sport==="football" || r[`${sport}_publication_day`]==="true"))
  .map(r=>r.central_day!);
const output:{calendarSource:string; sixMonthDates:string[]; actual:Record<Sport,unknown>; provisional:Record<string,unknown>; blockers:string[]}={
  calendarSource:csvPath, sixMonthDates:calendar.map(r=>r.central_day!),
  actual:{football:null,ufc:null,nba:null}, provisional:{},blockers:[],
};

function audit(sport:Sport, days:string[], scheduleVersion:string, strict:boolean) {
  const seen=new Set<string>(), seenSemantic=new Set<string>();
  const priorFootball:FootballHigherLowerQuestion[]=[];
  const subjects=new Map<string,number>(), comparisons:Row[]=[];
  const failures:string[]=[];
  const perDate:Array<{day:string;games:number;comparisons:number;errors:string[]}>=[];

  for(const day of days) {
    try {
      let pub:OfficialDailySetupPublication;
      if(sport==="football") pub=buildFootballHigherLowerTwoGameDailyPublication(day,scheduleVersion,priorFootball);
      else if(sport==="ufc") pub=buildUfcHigherLowerTwoGameDailyPublication(day,scheduleVersion);
      else pub=buildNbaServerDailyPublication(day,scheduleVersion,"higher_lower");
      const children=(pub.privateSetupEvidence.rounds as Array<Record<string,unknown>>);
      if(children.length!==2) throw Error("Expected two canonical child publications");
      let count=0;
      const localErrors:string[]=[];
      for(const [game,child] of children.entries()) {
        const board=(child.private_setup_evidence as {board:{questions:Q[]}}).board;
        if(board.questions.length!==10)localErrors.push(`Game ${game+1} has ${board.questions.length} questions`);
        if(sport==="football" && (board.questions.filter(q=>q.league==="NFL").length!==5 || board.questions.filter(q=>q.league==="CFB").length!==5))localErrors.push("Football NFL/CFB mix invalid");
        for(const [index,q] of board.questions.entries()) {
          const semanticPair=sport==="nba"
            ? [q.known.name.toLowerCase(),q.hidden.name.toLowerCase()].sort().join("|")
            : [q.known.subjectId,q.hidden.subjectId].sort().join("|");
          const comparisonKey=q.metricKey+"|"+semanticPair;
          const gradingValid=q.answer===(q.hidden.value>q.known.value?"higher":"lower");
          if(seen.has(comparisonKey))localErrors.push("Repeated comparison: "+comparisonKey);
          if(seenSemantic.has(semanticPair))localErrors.push("Repeated semantic matchup: "+semanticPair);
          if(!gradingValid)localErrors.push("Incorrect grading: "+q.id);
          seen.add(comparisonKey);seenSemantic.add(semanticPair);
          for(const id of [q.known.subjectId,q.hidden.subjectId])subjects.set(id,(subjects.get(id)??0)+1);
          let sources:unknown;
          if(sport==="football") {
            const evidence=footballHigherLowerQuestionEvidence(q as FootballHigherLowerQuestion);
            sources=evidence;
            if(evidence.known.registryOnly||evidence.hidden.registryOnly||!evidence.known.sourceIds.length||!evidence.hidden.sourceIds.length)localErrors.push("Unbound Football source: "+q.id);
            priorFootball.push(q as FootballHigherLowerQuestion);
          } else if(sport==="ufc") {
            sources={ledger:"pinned UFC factual bout ledger",snapshot:"2026-08-18",factMetric:q.metricKey};
          } else {
            sources={model:"NBA Higher or Lower stat and supplement catalogs",independentFactSource:"not attached to question"};
          }
          comparisons.push({day,game:game+1,question:index+1,comparison:q,comparisonKey,semanticPair,gradingValid,sources});
          count++;
        }
      }
      perDate.push({day,games:children.length,comparisons:count,errors:localErrors});
      failures.push(...localErrors.map(e=>day+": "+e));
    } catch(error) {
      const message=day+": generation failed: "+String(error);
      failures.push(message);
      perDate.push({day,games:0,comparisons:0,errors:[message]});
      if(strict)break;
    }
  }
  return {
    appearanceCount:days.length, requiredBoards:days.length*2, requiredComparisons:days.length*20,
    generatedBoards:perDate.reduce((sum,r)=>sum+r.games,0),
    generatedComparisons:comparisons.length,
    distinctMatchups:seenSemantic.size,
    highestSubjectReuse:Math.max(0,...subjects.values()),
    failures,dates:perDate,comparisons,
  };
}

describe("coordinated six-month Higher or Lower publication audit",()=>{
  it("documents the actual calendar and checks every scheduled 10+10 comparison with persisted source evidence",()=>{
    expect(calendar).toHaveLength(182);
    expect(calendar[0]?.central_day).toBe("2026-10-25");
    expect(calendar.at(-1)?.central_day).toBe("2027-04-24");
    for(const sport of ["football","ufc","nba"] as const) {
      const scheduled=dates(sport);
      output.actual[sport]=audit(sport,scheduled,
        sport==="football"?"football-daily-v21-locked-oct25":sport==="ufc"?"ufc-daily-v21-48h-oct25":"nba-daily-regular-v1",true);
      if(!scheduled.length)output.blockers.push(sport+" Higher or Lower has no slots in the merged canonical calendar; Part 2/3 must activate the approved weight before actual six-month certification.");
      if((output.actual[sport] as {failures:string[]}).failures.length)output.blockers.push(sport+" actual scheduled boards contain audit failures");
    }
    // Capacity stress is NON-PUBLISHING, until #2102 assigns the exact dates.
    const first=Date.UTC(2026,9,26);
    const footballDates=Array.from({length:14},(_,i)=>new Date(first+i*13*86_400_000).toISOString().slice(0,10));
    output.provisional.football14Appearances=audit("football",footballDates,"football-hl-two-game-provisional-capacity",false);
    const ufcDates=Array.from({length:8},(_,i)=>new Date(Date.UTC(2026,10,2)+i*24*86_400_000).toISOString().slice(0,10));
    output.provisional.ufc8Appearances=audit("ufc",ufcDates,"ufc-hl-two-game-provisional-capacity",false);
    for(const key of ["football14Appearances","ufc8Appearances"]) {
      const item=output.provisional[key] as {failures:string[];requiredBoards:number;generatedBoards:number};
      if(item.failures.length||item.requiredBoards!==item.generatedBoards)output.blockers.push(key+" provisional board capacity is NOT fully certified.");
    }
    output.blockers.push("NBA question rows lack individually bound independent source IDs; editorial provenance review is required.");
    if(process.env.OCTAGON_WRITE_HL_AUDIT==="1") {
      mkdirSync("artifacts",{recursive:true});
      writeFileSync("artifacts/higher-lower-two-game-six-month-audit.json",JSON.stringify({
        warning:"NOT A FULL SIX-MONTH CERTIFICATION. The merged scheduler contains zero Football/UFC Higher or Lower appearances. No merge or deployment.",
        ...output,
      },null,2)+"\n");
    }
    const nba=output.actual.nba as {appearanceCount:number;generatedBoards:number;generatedComparisons:number;failures:string[]};
    expect(nba.appearanceCount).toBe(6);
    expect(nba.generatedBoards).toBe(12);
    expect(nba.generatedComparisons).toBe(120);
    expect(nba.failures).toEqual([]);
  },300_000);
});
