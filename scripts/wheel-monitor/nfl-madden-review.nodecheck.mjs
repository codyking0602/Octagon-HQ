import test from "node:test";
import assert from "node:assert/strict";
import {compareMadden,canonicalize,flagDevelopmentProfiles} from "./nfl-madden-review.mjs";
const make=(id,overall,team="Buffalo Bills",speed=85)=>({
 id,firstName:"Sample",lastName:id,overallRating:overall,
 team:{label:team},position:{id:"WR"},stats:{speed:{value:speed}}
});
const rows=(s)=>Array.from({length:1750},(_,i)=>make(String(i),i===0?s.overall:80,i===0?s.team:"Buffalo Bills",i===0?s.speed:85));
const base=canonicalize(rows({overall:84,team:"Buffalo Bills",speed:85}),"2026-10-27T12:00:00Z");
test("weekly EA changes are review flags only, thresholds are inclusive",()=>{
 const now=canonicalize(rows({overall:87,team:"Miami Dolphins",speed:90}),"2026-10-29T12:00:00Z");
 const result=compareMadden(base,now);
 assert.equal(result.flags.length,1);
 assert.equal(result.flags[0].overallDelta,3);
 assert.equal(result.flags[0].attributeDeltas[0].delta,5);
 assert.equal(result.rosterHints.length,1);
 assert.equal(result.gradeChangesApplied,0);
});
test("subthreshold fluctuations do not trigger",()=>{
 const result=compareMadden(base,canonicalize(rows({overall:86,team:"Buffalo Bills",speed:89}),"2026-10-29"));
 assert.equal(result.flags.length,0);
 assert.equal(result.rosterHints.length,0);
});
test("cannot compare incomplete or duplicate Madden census",()=>{
 assert.throws(()=>canonicalize([make("a",80)],"now"),/incomplete/);
 const duplicate=rows({overall:84,team:"Buffalo Bills",speed:85});duplicate[1].id=duplicate[0].id;
 assert.throws(()=>canonicalize(duplicate,"now"),/Duplicate/);
});
test("development flags use aged-player risk and material Madden moves without auto-editing",()=>{
 const result=flagDevelopmentProfiles([
   {id:"LAR|QB|vet",name:"Veteran",team:"LAR",family:"QB",ageAtCalibration:36,breakoutPct:17,improvePct:24},
   {id:"BUF|WR|sample0",name:"Sample 0",team:"BUF",family:"WR",ageAtCalibration:23,breakoutPct:5,improvePct:38}
 ],[{id:"0",name:"Sample 0",team:"Buffalo Bills",overallDelta:3}]);
 assert.equal(result.candidates.length,2);
 assert.equal(result.candidates[0].reasons[0],"aging-player-high-upside-odds");
 assert.ok(result.candidates[1].reasons.includes("young-breakout-low-progression-probability"));
});
