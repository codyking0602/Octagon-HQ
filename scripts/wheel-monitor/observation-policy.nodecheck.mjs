import test from "node:test";
import assert from "node:assert/strict";
import {validateObservation} from "./observation-policy.mjs";
import {selectLatestObservationArtifact,selectLatestCheckpointArtifact} from "./checkpoint-policy.mjs";
const stamp="2026-10-25T12:00:00.000Z";
const now=Date.parse("2026-10-26T12:00:00.000Z");
const row=(sport,name)=>({sport,name,team:sport==="ufc"?undefined:"DAL",
  division:sport==="ufc"?"Flyweight":undefined,family:"QB",sourceStatus:"matched"});
const observation=()=>({schema:4,status:"read-only-observation",checkedAt:stamp,
  identities:[row("nfl","A"),row("ufc","C")],
  catalogCounts:{nfl:1,ufc:1}});
const artifact=(id,name="wheel-monitor-observation",branch="main",expired=false)=>({
  id,name,created_at:stamp,expired,workflow_run:{id:1000+id,head_branch:branch},
});
test("observations are not certified checkpoint artifacts",()=>{
 const a=[artifact(1),artifact(2,"wheel-monitor-run-report"),artifact(3,"wheel-monitor-observation","feature")];
 assert.equal(selectLatestCheckpointArtifact(a),null);
 assert.equal(selectLatestObservationArtifact(a).id,1);
});
test("new NFL/UFC observations preserve source evidence without certifying grades",()=>{
 assert.equal(validateObservation(observation(),now).status,"read-only-observation");
 assert.equal(validateObservation(null,now),null);
 const o=observation();o.status="source-certified";
 assert.throws(()=>validateObservation(o,now),/Untrusted/);
 const withGrade=observation();withGrade.identities[0].grade=89;
 assert.throws(()=>validateObservation(withGrade,now),/rating-bearing/);
});
test("legacy CFB observations can be read safely while no new CFB source is collected",()=>{
 const old=observation();old.schema=3;old.identities.push(row("cfb","B"));old.catalogCounts.cfb=1;
 assert.equal(validateObservation(old,now).identities.length,3);
 const bad=observation();bad.identities.push(row("cfb","B"));
 assert.throws(()=>validateObservation(bad,now),/Malformed/);
});
test("duplicate and partial observations fail closed",()=>{
 const d=observation();d.identities.push({...d.identities[0]});d.catalogCounts.nfl=2;
 assert.throws(()=>validateObservation(d,now),/Duplicate/);
 const incomplete=observation();incomplete.catalogCounts.nfl=2;
 assert.throws(()=>validateObservation(incomplete,now),/Incomplete/);
 assert.throws(()=>validateObservation({...observation(),checkedAt:"garbage"},now),/timestamp/);
});
test("old observations require fresh baseline",()=>{
 assert.equal(validateObservation(observation(),now+46*86400000),null);
});
