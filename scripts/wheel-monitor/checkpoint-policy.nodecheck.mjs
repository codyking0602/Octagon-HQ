import {test} from "node:test";
import assert from "node:assert/strict";
import {selectLatestCheckpointArtifact} from "./checkpoint-policy.mjs";
const artifact=(id, date, branch="main", expired=false, name="wheel-monitor-snapshot")=>({
  id,name,created_at:date,expired,workflow_run:{id:id*100,head_branch:branch},
});
test("never chooses report-only runs or expired / PR-branch snapshots",()=>{
 const selected=selectLatestCheckpointArtifact([
  artifact(11,"2026-10-20T08:00:00Z"),
  artifact(12,"2026-10-22T08:00:00Z","feature"),
  artifact(13,"2026-10-24T08:00:00Z","main",true),
  artifact(14,"2026-10-25T08:00:00Z","main",false,"wheel-monitor-run-report"),
  artifact(15,"2026-10-21T08:00:00Z"),
 ]);
 assert.equal(selected.id,15);
 assert.equal(selected.workflow_run.id,1500);
});
test("report-only history is valid and has no recovery artifact",()=>{
 assert.equal(selectLatestCheckpointArtifact([
  artifact(10,"2026-10-25T08:00:00Z","main",false,"wheel-monitor-run-report"),
 ]),null);
 assert.equal(selectLatestCheckpointArtifact([]),null);
});
test("malformed GitHub response must not silently count as empty history",()=>{
 assert.throws(()=>selectLatestCheckpointArtifact(null),/Missing GitHub/);
 assert.equal(selectLatestCheckpointArtifact([{name:"wheel-monitor-snapshot",expired:false,workflow_run:{head_branch:"main"}}]),null);
});
