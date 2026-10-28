import test from "node:test";
import assert from "node:assert/strict";
import {buildPacket,renderPacket} from "./nfl-biweekly-fast-triage.mjs";
const codes="ARI ATL BAL BUF CAR CHI CIN CLE DAL DEN DET GB HOU IND JAX KC LAC LAR LV MIA MIN NE NO NYG NYJ PHI PIT SEA SF TB TEN WSH".split(" ");
function fixture(){
 const grades=[],profiles=[];
 for(let i=0;i<594;i++){
  const team=codes[i%32],name="Fixture Player "+i,family="WR";
  profiles.push({id:team+"|WR|"+i,team,name,family});
  grades.push({team,player:name,family,grade:82});
 }
 const coachGradeReviewQueue=codes.map((team,i)=>({team,coach:"Coach "+i,hqGrade:80,
  officialStatus:"matched",currentOfficialCoach:"Coach "+i,
  reviewCriteria:["scheme","game-management","adaptability"]}));
 const reviewCandidates=profiles.slice(0,80).map((p,i)=>{
  const delta=i<20?4:i<50?3:2;
  const overallNow=i<50?74:81;
  return {team:p.team,name:p.name,
   flags:[{monitor:"madden",reason:"overall-"+delta+"-review"}],
   details:{madden:{overallBefore:overallNow-delta,overallNow,overallDelta:delta}}};
 });
 return {grades,profiles,combined:{observedAt:"2026-11-10",counts:{
  maddenComparisonDays:14,contractChanges:0,contractTransfers:1,rosterExceptions:2},
  reviewCandidates,sourceBlockers:[],coachGradeReviewQueue}};
}
test("fast lane prioritizes only Madden-moving HQ players and keeps all 32 coach decisions pending",()=>{
 const p=fixture();
 p.combined.reviewCandidates.push({team:"ARI",name:"Unflagged",
  flags:[{monitor:"contracts",reason:"new contract"}]});
 const result=buildPacket(p.combined,p.grades,p.profiles);
 assert.equal(result.baselineValid,true);
 assert.equal(result.maddenFlagged,80);
 assert.equal(result.detailed.length,50);
 assert.equal(result.quick.length,30);
 assert.equal(result.coaches.length,32);
 assert.equal(result.detailed.every(p=>p.proposedHq===null),true);
 assert.equal(result.automaticGradeChanges,0);
 assert.equal(result.automaticDevelopmentChanges,0);
 assert.ok(renderPacket(result).includes("Pending real review"));
 assert.equal(result.exceptions.transfers,1);
});
test("a source outage, short comparison or stale source cannot be reported as a clean cycle",()=>{
 const p=fixture();
 p.combined.counts.maddenComparisonDays=1;
 const short=buildPacket(p.combined,p.grades,p.profiles);
 assert.equal(short.baselineValid,false);
 assert.ok(short.blockers.some(s=>s.includes("snapshot-not-verified")));
 p.combined.counts.maddenComparisonDays=14;
 p.combined.sourceBlockers=["madden:source-unavailable"];
 assert.equal(buildPacket(p.combined,p.grades,p.profiles).baselineValid,false);
});
test("same-named athlete in two position slots is safely reviewed separately",()=>{
 const p=fixture(),first=p.profiles[0];
 p.profiles[1].team=first.team;
 p.profiles[1].name=first.name;
 p.profiles[1].family="Secondary";
 p.grades[1].team=first.team;
 p.grades[1].player=first.name;
 p.grades[1].family="Secondary";
 const report=buildPacket(p.combined,p.grades,p.profiles);
 const found=[...report.detailed,...report.quick].filter(row=>row.name===first.name);
 assert.equal(found.length,2);
 assert.deepEqual(new Set(found.map(p=>p.family)),new Set(["WR","Secondary"]));
});
test("missing match and incomplete coaching census stay exceptions, not silent holds",()=>{
 const p=fixture();
 p.combined.reviewCandidates[0].name="Missing NFL Subject";
 p.combined.coachGradeReviewQueue.pop();
 const result=buildPacket(p.combined,p.grades,p.profiles);
 assert.equal(result.unresolved.length,1);
 assert.ok(result.blockers.includes("coaches:missing-all-32-review-queue"));
 assert.equal(result.maddenFlagged,80);
});
