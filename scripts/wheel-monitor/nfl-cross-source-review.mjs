#!/usr/bin/env node
// Read-only cross-source NFL usage/performance ledger. Joining canonical
// labels is NOT a verified ESPN/GSIS/PFR person-ID crosswalk. Never promote
// this review as source-certified or automatically revise grades/contracts.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {dirname,resolve} from "node:path";

const EXPECTED=594;
const PERFORMANCE_EVALUABLE=new Set(["no-sustained-metric-shift","priority-performance-review"]);
const SNAP_EVALUABLE=new Set(["no-usage-shift-detected","priority-factual-review"]);
function nameKey(v) {
  return String(v??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/[^a-z0-9]/g,"").replace(/(?:iii|ii|iv|jr|sr|v)$/,"");
}
const keyOf=row=>[row.team,row.family,nameKey(row.name)].join("|");
function index(document,label,expectedStatus){
  if(document?.status!==expectedStatus || document?.approvedPlayerIdentities!==undefined &&
      document.approvedPlayerIdentities!==EXPECTED ||
      document?.playerPopulation!==undefined && document.playerPopulation!==EXPECTED ||
      document?.decisionLedgerComplete!==true ||
      !Array.isArray(document.decisions) || document.decisions.length!==EXPECTED)
    throw new Error(label+": missing complete 594-player read-only decision ledger");
  const entries=new Map();
  for(const row of document.decisions){
    if(!row || !row.team || !row.family || !row.name || !row.classification)
      throw new Error(label+": invalid source decision identity/status");
    const k=keyOf(row);
    if(entries.has(k)) throw new Error(label+": duplicated source decision "+k);
    entries.set(k,row);
  }
  if(entries.size!==EXPECTED) throw new Error(label+": wrong unique source decision count");
  return entries;
}

function crosswalkIndex(master){
  if(master==null) return new Map();
  if(master.status!=="read-only-nflverse-player-id-master" ||
      master.sourcePublicationFreshnessCertified!==false ||
      !Array.isArray(master.mappings) || !Number.isInteger(master.inputMasterCount) ||
      master.inputMasterCount<1000)
    throw new Error("Missing usable nflverse GSIS/PFR identity master");
  const byGsis=new Map(),byPfr=new Set();
  for(const x of master.mappings){
    if(typeof x.gsisId!=="string" || !x.gsisId.trim() ||
       typeof x.pfrId!=="string" || !x.pfrId.trim() ||
       byGsis.has(x.gsisId) || byPfr.has(x.pfrId))
      throw new Error("Ambiguous or malformed nflverse cross-provider mapping");
    byGsis.set(x.gsisId,x.pfrId);
    byPfr.add(x.pfrId);
  }
  return byGsis;
}

function certifyPublishedCollectorBytes(publications,receipt){
  if(publications==null && receipt==null) return false;
  if(publications?.status!=="publisher-assets-recent" ||
      publications.sourcePublisherAssetsFresh!==true ||
      receipt?.status!=="exact-published-NFL-source-bytes-verified" ||
      receipt.allSourceByteDigestsMatched!==true ||
      receipt.sourcesVerified!==3 || receipt.expectedSources!==3 ||
      !Array.isArray(receipt.verificationChecks) ||
      receipt.verificationChecks.length!==3)
    throw new Error("Unusable exact-source NFL publication/byte verification receipt");
  const kinds=["production","snaps","identityMaster"];
  for(const kind of kinds){
    const x=publications.sources?.[kind];
    const rows=receipt.verificationChecks.filter(y=>y.kind===kind);
    if(rows.length!==1 || !x?.publisherAssetCurrent ||
       rows[0].sha256!==x.digestSha256 ||
       rows[0].verifiedByteCount!==x.assetBytes ||
       rows[0].sourceUrl!==x.sourceUrl ||
       rows[0].publishedAt!==x.publisherUpdatedAt)
      throw new Error("NFL published asset did not bind to collector bytes for "+kind);
  }
  return true;
}

export function integrateNflPerformanceAndSnap(production,snap,master=null,
    publications=null,byteReceipt=null){
  const sourceBytesCertified=certifyPublishedCollectorBytes(publications,byteReceipt);
  const idMap=crosswalkIndex(master);
  const p=index(production,"production","read-only-nfl-weekly-production");
  const s=index(snap,"snaps","read-only-nfl-snap-evidence");
  if(!Number.isInteger(production.season) || production.season!==snap.season)
    throw new Error("NFL evidence season conflict");
  if(!Number.isInteger(production.datasetLastObservedWeek) ||
      !Number.isInteger(snap.datasetLastObservedWeek))
    throw new Error("Source last-observed weeks missing");
  const pKeys=[...p.keys()].sort(), sKeys=[...s.keys()].sort();
  if(pKeys.some((key,i)=>key!==sKeys[i]))
    throw new Error("NFL production and snap source populations differ");
  const sameWeek=production.datasetLastObservedWeek===snap.datasetLastObservedWeek;
  const decisions=pKeys.map(key=>{
    const perf=p.get(key),usage=s.get(key);
    const performanceEvaluable=PERFORMANCE_EVALUABLE.has(perf.classification);
    const snapEvaluable=SNAP_EVALUABLE.has(usage.classification);
    const jointlyEvaluable=performanceEvaluable && snapEvaluable;
    const priorityPerformanceReview=perf.classification==="priority-performance-review";
    const idMapped=typeof perf.sourcePlayerId==="string" &&
      typeof usage.sourcePfrId==="string" &&
      idMap.get(perf.sourcePlayerId)===usage.sourcePfrId;
    return {
      key,team:perf.team,family:perf.family,name:perf.name,
      productionClassification:perf.classification,
      snapClassification:usage.classification,
      productionPlayerId:perf.sourcePlayerId??null,
      pfrPlayerId:usage.sourcePfrId??null,
      performanceEvaluable,snapEvaluable,jointlyEvaluable,
      priorityPerformanceReview,
      // A matching team/family/name label is not independent provider-ID proof.
      crossProviderIdentityCertified:false,
      gsisPfrMasterIdMatched:idMapped,
      // Omitted/insufficient source cases must never become "unchanged ability".
      evidenceLimited:!jointlyEvaluable,
      requiresFactualReview:usage.classification==="priority-factual-review",
    };
  });
  const joint=decisions.filter(row=>row.jointlyEvaluable);
  const mappedJoint=joint.filter(row=>row.gsisPfrMasterIdMatched);
  const priority=joint.filter(row=>row.priorityPerformanceReview).length;
  const avoided=joint.length-priority;
  const provisionalAvoidancePct=joint.length?
    Math.round(10000*avoided/joint.length)/100:null;
  return {
    schema:1,status:"read-only-cross-source-review-held",
    sport:"nfl",approvedGMPlayerCount:EXPECTED,season:production.season,
    productionObservedAt:production.observedAt,snapObservedAt:snap.observedAt,
    productionDatasetLastWeek:production.datasetLastObservedWeek,
    snapDatasetLastWeek:snap.datasetLastObservedWeek,
    alignedLastObservedWeek:sameWeek,
    counts:{
      performanceEvaluable:decisions.filter(row=>row.performanceEvaluable).length,
      snapEvaluable:decisions.filter(row=>row.snapEvaluable).length,
      jointlyEvaluable:joint.length,
      notJointlyEvaluable:EXPECTED-joint.length,
      jointlyEvaluableIdMapped:mappedJoint.length,
      jointlyEvaluableIdUnmapped:joint.length-mappedJoint.length,
      priorityPerformanceReviewsAmongJoint:priority,
      deepReviewsAvoidableAmongJoint:avoided,
      independentSnapFactualReviews:decisions.filter(row=>row.requiresFactualReview).length,
    },
    provisionalDeepReviewAvoidancePct:provisionalAvoidancePct,
    targetMetOnProvisionalComparableSubset:provisionalAvoidancePct!==null &&
      provisionalAvoidancePct>=80,
    // Both source collectors explicitly lack independent release publication proof.
    sourcePublicationFreshnessCertified:sourceBytesCertified,
    exactlyPublishedSourceBytesUsed:sourceBytesCertified,
    sourcePublicationDates:sourceBytesCertified?
      Object.fromEntries(Object.entries(publications.sources)
        .map(([k,v])=>[k,v.publisherUpdatedAt])):null,
    sourceProviderIdentityCrosswalkCertified:false,
    gsisPfrMasterMappingsChecked:master!==null,
    sourceProviderIdentityMasterMatchedForJoint:joint.length>0 && mappedJoint.length===joint.length,
    abilityMonitoringCertified:false,
    detailedReviewAvoidanceCertified:false,
    promotedCheckpoint:false,
    abilitiesOrContractsChanged:0,
    blockers:[
      ...(sameWeek?[]:["production-and-snap-dataset-week-mismatch"]),
      ...(sourceBytesCertified?[]:["source-publication-and-downloaded-byte-verification-pending"]),
      "independent-gsis-pfr-identity-certification-pending",
      ...(mappedJoint.length===joint.length?[]:["gsis-pfr-master-mappings-unresolved:"+String(joint.length-mappedJoint.length)]),
      ...(joint.length===EXPECTED?[]:["insufficient-or-unobserved-nfl-weekly-evidence:"+String(EXPECTED-joint.length)]),
    ],
    methodology:"Only both-window evaluable source observations enter the provisional denominator; canonical team/family/name alignment does not prove cross-provider identity; no ability regrading.",
    decisions,
  };
}

if(process.argv[1] && /nfl-cross-source-review\.mjs$/.test(process.argv[1])){
  const args=Object.fromEntries(process.argv.slice(2).filter(a=>a.startsWith("--"))
    .map(a=>{const [key,...value]=a.slice(2).split("=");return [key,value.join("=")];}));
  if(!args.production || !args.snap || !args.out)
    throw new Error("Required --production, --snap, --out");
  const result=integrateNflPerformanceAndSnap(
    JSON.parse(readFileSync(resolve(args.production),"utf8")),
    JSON.parse(readFileSync(resolve(args.snap),"utf8")),
    args.crosswalk?JSON.parse(readFileSync(resolve(args.crosswalk),"utf8")):null,
    args.publications?JSON.parse(readFileSync(resolve(args.publications),"utf8")):null,
    args.byteReceipt?JSON.parse(readFileSync(resolve(args.byteReceipt),"utf8")):null);
  const out=resolve(args.out);
  mkdirSync(dirname(out),{recursive:true});
  writeFileSync(out,JSON.stringify(result,null,2)+"\n");
  console.log(JSON.stringify({status:result.status,counts:result.counts,
    provisionalDeepReviewAvoidancePct:result.provisionalDeepReviewAvoidancePct,
    blockers:result.blockers,certified:result.abilityMonitoringCertified}));
}
