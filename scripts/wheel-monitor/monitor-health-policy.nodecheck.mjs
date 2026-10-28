import test from "node:test";
import assert from "node:assert/strict";
import {describeMonitoringOutcome} from "./monitor-health-policy.mjs";
const stages={coach:{status:"source-certified",certified:true},
 performance:{status:"performance-review-held",certified:false,jointlyEvaluable:359},
 gm:{status:"gm-contract-review-held",certified:false},
 ufc:{status:"ufc-profile-review-held",certified:false}};
test("a completed read-only run can have held source publication and insufficient snaps",()=>{
 const health=describeMonitoringOutcome({
  readiness:{snapshotReady:false,blockers:["performance-evidence-pending","ufc-profile-review"]},
  staged:{stages},ratingReviewDue:true,
  decisions:[{sport:"nfl",classification:"no-meaningful-change",signals:[]}]});
 assert.equal(health.execution.status,"completed");
 assert.equal(health.sourceQuality.status,"review-held-or-incomplete");
 assert.equal(health.publication.eligible,false);
 assert.equal(health.nflRatingEvidence.insufficientCombinedEvidence,235);
 assert.equal(health.reviewExceptions.actionableFindings,0);
 assert.equal(health.reviewExceptions.publicationHolds,2);
});
test("roster identity exceptions remain factual and do not become rating proposals",()=>{
 const health=describeMonitoringOutcome({readiness:{snapshotReady:false,blockers:["roster-review"]},
  staged:{stages},ratingReviewDue:false,decisions:[
   {sport:"nfl",classification:"mandatory-factual-correction",signals:[{kind:"verified-mismatched-team-affiliation"}]},
   {sport:"nfl",classification:"review-suggested",signals:[{kind:"roster-absence-not-proof-of-release"}]},
  ]});
 assert.equal(health.nflTransactions.providerIdMatchedTeamChangeCount,1);
 assert.equal(health.nflTransactions.pendingRosterIdentityReviewCount,1);
 assert.equal(health.nflRatingEvidence.due,false);
 assert.equal(health.publication.status,"withheld");
});
test("certified source and no open findings are distinct from routine completion",()=>{
 const h=describeMonitoringOutcome({readiness:{snapshotReady:true,blockers:[]},
  staged:{stages:{...stages,performance:{status:"source-certified",certified:true,jointlyEvaluable:594}}},
  ratingReviewDue:false,decisions:[]});
 assert.equal(h.publication.eligible,true);
 assert.equal(h.sourceQuality.status,"source-certified");
 assert.equal(h.reviewExceptions.status,"none");
});
