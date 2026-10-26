import test from "node:test";
import assert from "node:assert/strict";
import {buildSourceCoverageLedger} from "./source-coverage-policy.mjs";

test("reports full-population denominator instead of claiming missing players unchanged",()=>{
  const ledger=buildSourceCoverageLedger([
    {sport:"nfl",team:"ATL",name:"One",sourceStatus:"matched"},
    {sport:"nfl",team:"CHI",name:"Two",sourceStatus:"missing",sourceUrl:"https://source.test/roster"},
    {sport:"cfb",team:"texas",name:"Coach",family:"Head Coach",sourceStatus:"coaching-source-needed"},
    {sport:"ufc",division:"Lightweight",name:"Other",sourceStatus:"unranked-not-verified-by-ranked-table"},
  ],{nfl:3,cfb:2,ufc:1});
  assert.equal(ledger.bySport.nfl.approved,3);
  assert.equal(ledger.bySport.nfl.presentInCollector,2);
  assert.equal(ledger.bySport.nfl.matchedToComparedSource,1);
  assert.equal(ledger.bySport.nfl.notYetPresentInCollector,1);
  assert.equal(ledger.bySport.nfl.matchedToComparedSourcePct,33.33);
  assert.equal(ledger.bySport.cfb.sourceStatusCounts["coaching-source-needed"],1);
  assert.equal(ledger.bySport.ufc.matchedToComparedSource,0);
  assert.equal(ledger.unresolved.length,3);
  assert.equal(ledger.unresolved[0].sourceUrl,"https://source.test/roster");
  assert.equal(ledger.bySport.nfl.detailedReviewAvoidanceCertified,false);
});
test("matched source cannot be mistaken for ability certification",()=>{
  const ledger=buildSourceCoverageLedger([
    {sport:"nfl",name:"Player",sourceStatus:"matched"},
    {sport:"cfb",name:"Player",sourceStatus:"matched"},
    {sport:"ufc",name:"Fighter",sourceStatus:"matched"},
  ],{nfl:1,cfb:1,ufc:1});
  for(const row of Object.values(ledger.bySport)){
    assert.equal(row.matchedToComparedSourcePct,100);
    assert.equal(row.abilityMonitoringCertified,false);
  }
  assert.equal(ledger.matchedDoesNotCertifyAbility,true);
});
test("unknown source status is unresolved, not silently counted unchanged",()=>{
  const ledger=buildSourceCoverageLedger([{sport:"nfl",name:"Unknown"}],{nfl:1,cfb:0,ufc:0});
  assert.equal(ledger.unresolved[0].reason,"unclassified-source-status");
  assert.equal(ledger.bySport.nfl.matchedToComparedSource,0);
});
test("rejects partial, invalid or overfull population evidence",()=>{
  assert.throws(()=>buildSourceCoverageLedger([],null),/required/);
  assert.throws(()=>buildSourceCoverageLedger([], {nfl:1,cfb:2}),/required/);
  assert.throws(()=>buildSourceCoverageLedger([{sport:"nfl"}],{nfl:0,cfb:0,ufc:0}),/exceed/);
});
