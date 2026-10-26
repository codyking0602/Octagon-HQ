import test from "node:test";
import assert from "node:assert/strict";
import {integrateNflPerformanceAndSnap} from "./nfl-cross-source-review.mjs";

function source(type,options={}) {
  const production=type==="production";
  const decisions=Array.from({length:594},(_,i)=>({
    team:"ARI",family:"WR",name:"Sample "+i,
    classification:production?"no-sustained-metric-shift":"no-usage-shift-detected",
    ...(production?{sourcePlayerId:"gsis-"+i}:{sourcePfrId:"pfr-"+i}),
  }));
  return {
    status:production?"read-only-nfl-weekly-production":"read-only-nfl-snap-evidence",
    approvedPlayerIdentities:production?594:undefined,
    playerPopulation:production?undefined:594,
    decisionLedgerComplete:true,season:2026,datasetLastObservedWeek:7,
    observedAt:"2026-10-25T12:00:00Z",decisions,...options,
  };
}

test("complete NFL joint ledger preserves 594 individual classifications and IDs",()=>{
  const prod=source("production"),snap=source("snaps");
  prod.decisions[3].classification="priority-performance-review";
  snap.decisions[5].classification="priority-factual-review";
  prod.decisions[9].classification="unobserved";
  snap.decisions[10].classification="insufficient-window";
  const report=integrateNflPerformanceAndSnap(prod,snap);
  assert.equal(report.approvedGMPlayerCount,594);
  assert.equal(report.decisions.length,594);
  assert.equal(report.counts.jointlyEvaluable,592);
  assert.equal(report.counts.notJointlyEvaluable,2);
  assert.equal(report.counts.priorityPerformanceReviewsAmongJoint,1);
  assert.equal(report.counts.independentSnapFactualReviews,1);
  assert.equal(report.provisionalDeepReviewAvoidancePct,99.83);
  assert.deepEqual(report.decisions[0].productionPlayerId,"gsis-0");
  assert.deepEqual(report.decisions[0].pfrPlayerId,"pfr-0");
  assert.equal(report.sourceProviderIdentityCrosswalkCertified,false);
  assert.equal(report.detailedReviewAvoidanceCertified,false);
  assert.equal(report.abilitiesOrContractsChanged,0);
  assert.ok(report.blockers.some(x=>x.startsWith("insufficient-or-unobserved")));
});
test("do not promote despite zero reported source changes",()=>{
  const report=integrateNflPerformanceAndSnap(source("production"),source("snaps"));
  assert.equal(report.provisionalDeepReviewAvoidancePct,100);
  assert.equal(report.targetMetOnProvisionalComparableSubset,true);
  assert.equal(report.abilityMonitoringCertified,false);
  assert.equal(report.promotedCheckpoint,false);
  assert.equal(report.blockers.includes("source-publication-and-downloaded-byte-verification-pending"),true);
});
test("reject incomplete or mislabeled source decisions",()=>{
  const p=source("production"),s=source("snaps");
  p.decisions.pop();
  assert.throws(()=>integrateNflPerformanceAndSnap(p,s),/complete 594/);
  p.decisions.push({...p.decisions[0]});
  assert.throws(()=>integrateNflPerformanceAndSnap(p,s),/duplicated/);
  p.decisions[593].name="Sample 593";
  s.decisions[593].name="Different";
  assert.throws(()=>integrateNflPerformanceAndSnap(p,s),/populations differ/);
});
test("conflicting source weeks are visible holds, not fabricated freshness",()=>{
  const p=source("production"),s=source("snaps",{datasetLastObservedWeek:6});
  const report=integrateNflPerformanceAndSnap(p,s);
  assert.equal(report.alignedLastObservedWeek,false);
  assert.ok(report.blockers.includes("production-and-snap-dataset-week-mismatch"));
  assert.equal(report.abilityMonitoringCertified,false);
});
test("conflicting seasons and sources without completeness fail closed",()=>{
  assert.throws(()=>integrateNflPerformanceAndSnap(source("production"),source("snaps",{season:2025})),/season conflict/);
  assert.throws(()=>integrateNflPerformanceAndSnap(source("production"),source("snaps",{decisionLedgerComplete:false})),/complete 594/);
});

test("IDs from nflverse master can match GSIS/PFR without ever certifying ability",()=>{
  const prod=source("production"),snap=source("snaps");
  const master={
    status:"read-only-nflverse-player-id-master",
    sourcePublicationFreshnessCertified:false,
    inputMasterCount:25000,
    mappings:Array.from({length:594},(_,i)=>({gsisId:"gsis-"+i,pfrId:"pfr-"+i})),
  };
  const report=integrateNflPerformanceAndSnap(prod,snap,master);
  assert.equal(report.counts.jointlyEvaluableIdMapped,594);
  assert.equal(report.counts.jointlyEvaluableIdUnmapped,0);
  assert.equal(report.sourceProviderIdentityMasterMatchedForJoint,true);
  assert.equal(report.sourceProviderIdentityCrosswalkCertified,false);
  assert.equal(report.abilityMonitoringCertified,false);
  assert.ok(report.blockers.includes("independent-gsis-pfr-identity-certification-pending"));
});
test("partial GSIS/PFR link never disguises unmatched source as unchanged athlete",()=>{
  const master={
    status:"read-only-nflverse-player-id-master",
    sourcePublicationFreshnessCertified:false,inputMasterCount:25000,
    mappings:[{gsisId:"gsis-0",pfrId:"pfr-0"}],
  };
  const report=integrateNflPerformanceAndSnap(source("production"),source("snaps"),master);
  assert.equal(report.counts.jointlyEvaluableIdMapped,1);
  assert.equal(report.counts.jointlyEvaluableIdUnmapped,593);
  assert.ok(report.blockers.includes("gsis-pfr-master-mappings-unresolved:593"));
  assert.equal(report.detailedReviewAvoidanceCertified,false);
});
test("duplicate GSIS/PFR master IDs and malformed provenance fail closed",()=>{
  const row={gsisId:"gsis-0",pfrId:"pfr-0"};
  const master={status:"read-only-nflverse-player-id-master",
    sourcePublicationFreshnessCertified:false,inputMasterCount:25000,
    mappings:[row,{...row}]};
  assert.throws(()=>integrateNflPerformanceAndSnap(source("production"),source("snaps"),master),/Ambiguous/);
  master.mappings=[row];
  master.sourcePublicationFreshnessCertified=true;
  assert.throws(()=>integrateNflPerformanceAndSnap(source("production"),source("snaps"),master),/usable/);
});

function publishedBytesFixture(){
  const kinds=["production","snaps","identityMaster"];
  const sources=Object.fromEntries(kinds.map((kind,i)=>[kind,{
    sourceUrl:"https://github.com/nflverse/nflverse-data/releases/download/"+kind+"/data.parquet",
    publisherAssetCurrent:true,digestSha256:String(i).repeat(64),
    assetBytes:2000+i,publisherUpdatedAt:"2026-10-26T00:00:00Z",
  }]));
  return [
    {status:"publisher-assets-recent",sourcePublisherAssetsFresh:true,sources},
    {status:"exact-published-NFL-source-bytes-verified",allSourceByteDigestsMatched:true,
      sourcesVerified:3,expectedSources:3,
      verificationChecks:kinds.map(kind=>({
        kind,sha256:sources[kind].digestSha256,
        verifiedByteCount:sources[kind].assetBytes,
        sourceUrl:sources[kind].sourceUrl,
        publishedAt:sources[kind].publisherUpdatedAt,
      }))},
  ];
}
test("verified exact provider bytes establish publication provenance, not ability authority",()=>{
  const [pub,receipt]=publishedBytesFixture();
  const report=integrateNflPerformanceAndSnap(source("production"),source("snaps"),null,pub,receipt);
  assert.equal(report.exactlyPublishedSourceBytesUsed,true);
  assert.equal(report.sourcePublicationFreshnessCertified,true);
  assert.equal(report.sourcePublicationDates.production,"2026-10-26T00:00:00Z");
  assert.equal(report.abilityMonitoringCertified,false);
  assert.equal(report.detailedReviewAvoidanceCertified,false);
});
test("stale and mismatched publisher bytes can never be certified",()=>{
  const [pub,receipt]=publishedBytesFixture();
  pub.sources.snaps.digestSha256="b".repeat(64);
  assert.throws(()=>integrateNflPerformanceAndSnap(
    source("production"),source("snaps"),null,pub,receipt),/did not bind/);
  const [p,r]=publishedBytesFixture();
  r.verificationChecks.pop();
  assert.throws(()=>integrateNflPerformanceAndSnap(
    source("production"),source("snaps"),null,p,r),/Unusable/);
});
