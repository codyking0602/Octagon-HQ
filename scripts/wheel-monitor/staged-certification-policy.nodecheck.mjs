import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {inspectStagedEvidence} from "./staged-certification-policy.mjs";

const sha="a".repeat(40), now=Date.parse("2026-10-26T14:00:00Z");
const at="2026-10-26T13:00:00Z";
const defs={
  coach:["wheel-nfl-current-coach-evidence","current-coaches.json","Wheel NFL Official Current Coach Evidence (staged)"],
  performance:["wheel-nfl-cross-source-evidence","cross-source-review.json","Wheel NFL Cross-Source Evidence (staged)"],
  gm:["wheel-gm-contract-source-review","comparison.json","Wheel GM Contract Source Review (staged)"],
  ufc:["wheel-ufc-unranked-profile-evidence","unranked-profiles.json","Wheel UFC Unranked Profile Evidence (staged)"],
};
function fixture(callback){
  const root=mkdtempSync(join(tmpdir(),"wheel-evidence-"));
  try{callback(root);}finally{rmSync(root,{recursive:true,force:true});}
}
function save(root,kind,doc,override={}){
  const [artifactName,file,workflowName]=defs[kind],folder=join(root,artifactName);
  mkdirSync(folder,{recursive:true});
  writeFileSync(join(folder,file),JSON.stringify(doc));
  writeFileSync(join(folder,"provenance.json"),JSON.stringify({
    artifactName,workflowName,headSha:sha,headBranch:"main",runId:42,
    event:"workflow_dispatch",status:"completed",conclusion:"success",
    completedAt:at,...override,
  }));
}
function coaches(){
  return {schema:1,status:"current-official-coach-sources-certified",
    approved:32,observed:32,matched:32,livePublicationFreshnessVerified:32,
    observedAt:at,gradeChangesApplied:0,contractChangesApplied:0,
    coachAuthorityChangesApplied:0,
    rows:Array.from({length:32},(_,i)=>({
      team:"T"+i,sourceStatus:"matched",publicationFreshnessVerified:true,
      sourceUrl:"https://www.nfl.com/teams/club"+i+"/",
    }))};
}
test("missing reports never clear any mandatory pending gate",()=>fixture(root=>{
  const got=inspectStagedEvidence(root,sha,now);
  assert.equal(got.complete,false);
  assert.equal(got.blockers.length,5);
  assert.equal(got.stages.performance.status,"missing-exact-head-staged-report");
}));
test("fresh exact-SHA verified current coach report clears only coach gate",()=>fixture(root=>{
  save(root,"coach",coaches());
  const got=inspectStagedEvidence(root,sha,now);
  assert.equal(got.stages.coach.certified,true);
  assert.equal(got.blockers.includes("independent-head-coach-live-freshness-pending"),false);
  assert.equal(got.blockers.length,4);
}));
test("PR artifact or different SHA can never certify coaches",()=>fixture(root=>{
  save(root,"coach",coaches(),{headSha:"b".repeat(40)});
  assert.equal(inspectStagedEvidence(root,sha,now).stages.coach.certified,false);
  save(root,"coach",coaches(),{event:"pull_request"});
  assert.equal(inspectStagedEvidence(root,sha,now).stages.coach.certified,false);
}));
test("stale coach publication and incomplete team census fail closed",()=>fixture(root=>{
  const doc=coaches();doc.rows[0].publicationFreshnessVerified=false;
  save(root,"coach",doc);
  assert.equal(inspectStagedEvidence(root,sha,now).stages.coach.certified,false);
  save(root,"coach",coaches(),{completedAt:"2026-09-01T12:00:00Z"});
  assert.equal(inspectStagedEvidence(root,sha,now).stages.coach.certified,false);
}));
test("594 source rows and publisher hashes do not alone certify NFL ability",()=>fixture(root=>{
  save(root,"performance",{
    schema:1,sport:"nfl",status:"read-only-cross-source-review-held",
    observedAt:at,productionObservedAt:at,approvedGMPlayerCount:594,
    decisions:Array.from({length:594},(_,i)=>({key:String(i)})),
    abilitiesOrContractsChanged:0,promotedCheckpoint:false,
    sourcePublicationFreshnessCertified:true,exactlyPublishedSourceBytesUsed:true,
    counts:{jointlyEvaluable:284,jointlyEvaluableIdMapped:280},
    sourceProviderIdentityCrosswalkCertified:false,abilityMonitoringCertified:false,
    detailedReviewAvoidanceCertified:false,
  });
  const got=inspectStagedEvidence(root,sha,now);
  assert.equal(got.stages.performance.status,"performance-review-held");
  assert.equal(got.stages.performance.certified,false);
}));
test("verified GM bytes do not auto-approve material contracts or economy",()=>fixture(root=>{
  save(root,"gm",{
    observedAt:at,status:"contract-fact-review-required",
    sourceProvenanceStatus:"exact-published-GM-contract-bytes-verified",
    sourceAssetSha256:"c".repeat(64),publishedCount:594,generatedCount:594,
    gradeChangesApplied:0,contractChangesApplied:0,ratingPrCreated:false,
    changes:[{reviewKind:"contract-fact"}],missing:[],extra:[],
    summary:{materialChanged:1},sourceIdentityCompletenessCertified:false,
    economyRegressionStatus:"not-run",
  });
  const got=inspectStagedEvidence(root,sha,now);
  assert.equal(got.stages.gm.status,"gm-contract-review-held");
  assert.equal(got.stages.gm.certified,false);
  assert.equal(got.blockers.includes("nfl-gm-economy-regression-pending"),true);
}));
test("UFC profile rows never imply approved ranked or active population",()=>fixture(root=>{
  save(root,"ufc",{
    schema:1,status:"official-profile-observed-not-independent-certified",
    sourceCoverage:"active-unranked-current-DB",observedAt:at,
    rows:[{fighterId:1,division:"Lightweight",status:"official-active-designation"}],
    gradeChangesApplied:0,rankingChangesApplied:0,populationChangesApplied:0,
    fullUfcCertification:false,summary:{unresolved:0,officialNotFighting:0},
  });
  const got=inspectStagedEvidence(root,sha,now);
  assert.equal(got.stages.ufc.status,"ufc-profile-review-held");
  assert.equal(got.stages.ufc.certified,false);
}));
