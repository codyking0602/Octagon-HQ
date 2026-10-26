// Exact-main staged reports may inform the central Wheel monitor, but must
// never masquerade as owner approvals, grade authority or a certified snapshot.
import {existsSync,readFileSync} from "node:fs";
import {join} from "node:path";

const STAGES = Object.freeze({
  coach: {artifact:"wheel-nfl-current-coach-evidence", file:"current-coaches.json", workflow:"Wheel NFL Official Current Coach Evidence (staged)"},
  performance: {artifact:"wheel-nfl-cross-source-evidence", file:"cross-source-review.json", workflow:"Wheel NFL Cross-Source Evidence (staged)"},
  gm: {artifact:"wheel-gm-contract-source-review", file:"comparison.json", workflow:"Wheel GM Contract Source Review (staged)"},
  ufc: {artifact:"wheel-ufc-unranked-profile-evidence", file:"unranked-profiles.json", workflow:"Wheel UFC Unranked Profile Evidence (staged)"},
});
const MAX_AGE_MS=7*86400_000;
function validTime(v,now) {
  const t=Date.parse(v??"");
  return Number.isFinite(t) && t<=now+300_000 && now-t>=0 && now-t<=MAX_AGE_MS;
}
function stageCheck(root,kind,sha,now) {
  const spec=STAGES[kind],folder=join(root,spec.artifact);
  const metaPath=join(folder,"provenance.json"),filePath=join(folder,spec.file);
  if(!existsSync(metaPath) || !existsSync(filePath))
    return {kind,status:"missing-exact-head-staged-report",certified:false};
  let metadata,doc;
  try {
    metadata=JSON.parse(readFileSync(metaPath,"utf8"));
    doc=JSON.parse(readFileSync(filePath,"utf8"));
  } catch {
    return {kind,status:"invalid-staged-report-json",certified:false};
  }
  if(metadata.artifactName!==spec.artifact || metadata.workflowName!==spec.workflow ||
     metadata.headSha!==sha || metadata.headBranch!=="main" ||
     metadata.conclusion!=="success" || metadata.status!=="completed" ||
     metadata.event!=="workflow_dispatch" || !Number.isInteger(metadata.runId) ||
     !validTime(metadata.completedAt,now)) {
    return {kind,status:"untrusted-staged-run-provenance",certified:false};
  }
  const observedAt=doc.observedAt??doc.productionObservedAt;
  if(!validTime(observedAt,now))
    return {kind,status:"stale-or-missing-source-observation",certified:false};
  if(kind==="coach"){
    const good=doc.schema===1 && doc.approved===32 && doc.observed===32 &&
      doc.matched===32 && doc.livePublicationFreshnessVerified===32 &&
      doc.status==="current-official-coach-sources-certified" &&
      Array.isArray(doc.rows) && doc.rows.length===32 &&
      new Set(doc.rows.map(x=>x.team)).size===32 &&
      doc.rows.every(x=>x.sourceStatus==="matched" &&
        x.publicationFreshnessVerified===true && /^https:\/\/www\.nfl\.com\//.test(x.sourceUrl)) &&
      doc.gradeChangesApplied===0 && doc.contractChangesApplied===0 &&
      doc.coachAuthorityChangesApplied===0;
    return {kind,status:good?"source-certified":"independent-coach-freshness-unverified",
      certified:good,observedAt,matched:doc.matched??null};
  }
  if(kind==="performance"){
    const safe=doc.schema===1 && doc.sport==="nfl" &&
      doc.approvedGMPlayerCount===594 &&
      doc.status==="read-only-cross-source-review-held" &&
      Array.isArray(doc.decisions) && doc.decisions.length===594 &&
      doc.abilitiesOrContractsChanged===0 && doc.promotedCheckpoint===false &&
      doc.sourcePublicationFreshnessCertified===true &&
      doc.exactlyPublishedSourceBytesUsed===true;
    const certified=safe && doc.counts?.jointlyEvaluable===594 &&
      doc.counts?.jointlyEvaluableIdMapped===594 &&
      doc.sourceProviderIdentityCrosswalkCertified===true &&
      doc.abilityMonitoringCertified===true &&
      doc.detailedReviewAvoidanceCertified===true &&
      doc.targetMetOnProvisionalComparableSubset===true &&
      Array.isArray(doc.blockers) && doc.blockers.length===0;
    return {kind,status:!safe?"source-report-incomplete":certified?"source-certified":"performance-review-held",
      certified,observedAt,jointlyEvaluable:doc.counts?.jointlyEvaluable??null,
      provisionalAvoidancePct:safe?doc.provisionalDeepReviewAvoidancePct:null,
      sourceByteIntegrityVerified:safe};
  }
  if(kind==="gm"){
    const safe=doc.sourceProvenanceStatus==="exact-published-GM-contract-bytes-verified" &&
      /^[a-f0-9]{64}$/.test(doc.sourceAssetSha256??"") &&
      doc.publishedCount===594 && Number.isInteger(doc.generatedCount) &&
      doc.gradeChangesApplied===0 && doc.contractChangesApplied===0 &&
      doc.ratingPrCreated===false && Array.isArray(doc.missing) &&
      Array.isArray(doc.extra) && Array.isArray(doc.changes);
    const certified=safe && doc.generatedCount===594 && !doc.missing.length &&
      !doc.extra.length && doc.status==="unchanged" &&
      doc.summary?.materialChanged===0 &&
      doc.sourceIdentityCompletenessCertified===true;
    // Both GM jobs are unconditional. A completed successful exact-head
    // workflow run proves the separate economy regression job passed, even
    // when the provider comparison correctly remains owner-review-held.
    return {kind,status:!safe?"source-report-incomplete":certified?"source-certified":"gm-contract-review-held",
      certified,economyRegressionVerified:safe,observedAt,generated:doc.generatedCount??null,
      materialChanges:doc.summary?.materialChanged??null,
      sourceByteIntegrityVerified:safe};
  }
  const safe=doc.schema===1 && doc.sourceCoverage==="active-unranked-current-DB" &&
    Array.isArray(doc.rows) && doc.rows.length>0 &&
    new Set(doc.rows.map(x=>String(x.division)+"|"+String(x.fighterId))).size===doc.rows.length &&
    doc.gradeChangesApplied===0 && doc.rankingChangesApplied===0 &&
    doc.populationChangesApplied===0;
  const certified=safe && doc.fullUfcCertification===true &&
    doc.rows.every(x=>x.status==="official-active-designation") &&
    doc.summary?.unresolved===0 && doc.summary?.officialNotFighting===0;
  return {kind,status:!safe?"source-report-incomplete":certified?"source-certified":"ufc-profile-review-held",
    certified,observedAt,unrankedProfiles:doc.rows?.length??null,
    unresolved:doc.summary?.unresolved??null};
}
export function inspectStagedEvidence(root,sha,now=Date.now()) {
  if(!root || !/^[a-f0-9]{40}$/.test(String(sha??"")))
    throw new Error("Explicit exact-main SHA and evidence directory required");
  const stages=Object.fromEntries(Object.keys(STAGES).map(kind=>[
    kind,stageCheck(root,kind,sha,now)]));
  const blockers=[
    ...(!stages.coach.certified?["independent-head-coach-live-freshness-pending"]:[]),
    ...(!stages.performance.certified?["performance-evidence-pending"]:[]),
    ...(!stages.gm.certified?["nfl-gm-live-contract-source-comparison-pending"]:[]),
    ...(!stages.gm.economyRegressionVerified?["nfl-gm-economy-regression-pending"]:[]),
    ...(!stages.ufc.certified?["ufc-unranked-source-coverage-pending"]:[]),
  ];
  return {exactMainSha:sha,stages,blockers,complete:blockers.length===0};
}
