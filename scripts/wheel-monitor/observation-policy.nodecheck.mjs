import test from "node:test";
import assert from "node:assert/strict";
import {validateObservation} from "./observation-policy.mjs";
import {selectLatestObservationArtifact,selectLatestCheckpointArtifact} from "./checkpoint-policy.mjs";
const stamp="2026-10-25T12:00:00.000Z";
const now=Date.parse("2026-10-26T12:00:00.000Z");
const row=(sport,name)=>({sport,name,team:sport==="ufc"?undefined:"DAL",
  division:sport==="ufc"?"Flyweight":undefined,family:"QB",sourceStatus:"matched"});
const observation=()=>({schema:3,status:"read-only-observation",checkedAt:stamp,
  identities:[row("nfl","A"),row("cfb","B"),row("ufc","C")],
  catalogCounts:{nfl:1,cfb:1,ufc:1}});
const artifact=(id,name="wheel-monitor-observation",branch="main",expired=false)=>({
  id,name,created_at:stamp,expired,workflow_run:{id:1000+id,head_branch:branch},
});
test("report-only scans can restore observations but never certified snapshots",()=>{
  const a=[artifact(1),artifact(2,"wheel-monitor-run-report"),artifact(3,"wheel-monitor-observation","feature"),artifact(4,"wheel-monitor-observation","main",true)];
  assert.equal(selectLatestCheckpointArtifact(a),null);
  assert.equal(selectLatestObservationArtifact(a).id,1);
});
test("read-only observations preserve source facts without conferring certification",()=>{
  assert.equal(validateObservation(observation(),now).status,"read-only-observation");
  assert.equal(validateObservation(null,now),null);
  const o=observation();o.status="source-certified";
  assert.throws(()=>validateObservation(o,now),/Untrusted/);
  const withGrade=observation();withGrade.identities[0].grade=89;
  assert.throws(()=>validateObservation(withGrade,now),/rating-bearing/);
});
test("duplicate and partial observations fail closed",()=>{
  const d=observation();d.identities.push({...d.identities[0]});d.catalogCounts.nfl=2;
  assert.throws(()=>validateObservation(d,now),/Duplicate/);
  const incomplete=observation();incomplete.catalogCounts.cfb=2;
  assert.throws(()=>validateObservation(incomplete,now),/Incomplete/);
  assert.throws(()=>validateObservation({...observation(),checkedAt:"garbage"},now),/timestamp/);
});
test("older than 45 days is baseline-only, not a weekly comparison",()=>{
  assert.equal(validateObservation(observation(),now+46*86400000),null);
});
