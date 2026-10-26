import test from "node:test";
import assert from "node:assert/strict";
import {buildSourceCoverageLedger} from "./source-coverage-policy.mjs";
test("NFL/UFC source census preserves unresolved denominator",()=>{
 const ledger=buildSourceCoverageLedger([
   {sport:"nfl",team:"ATL",name:"One",sourceStatus:"matched"},
   {sport:"nfl",team:"CHI",name:"Two",sourceStatus:"missing",sourceUrl:"https://source.test/roster"},
   {sport:"ufc",division:"Lightweight",name:"Other",sourceStatus:"unranked-not-verified-by-ranked-table"},
 ],{nfl:3,ufc:1});
 assert.equal(ledger.bySport.nfl.approved,3);
 assert.equal(ledger.bySport.nfl.presentInCollector,2);
 assert.equal(ledger.bySport.nfl.notYetPresentInCollector,1);
 assert.equal(ledger.bySport.nfl.matchedToComparedSourcePct,33.33);
 assert.equal(ledger.bySport.ufc.sourceUnverified,1);
 assert.equal(ledger.unresolved.length,2);
 assert.equal(ledger.unresolved[0].sourceUrl,"https://source.test/roster");
 assert.equal(ledger.bySport.nfl.detailedReviewAvoidanceCertified,false);
});
test("CFB observations never block or masquerade as certified NFL/UFC coverage",()=>{
 const ledger=buildSourceCoverageLedger([
   {sport:"nfl",name:"Player",sourceStatus:"matched"},
   {sport:"cfb",name:"CFB player",sourceStatus:"missing"},
   {sport:"ufc",name:"Fighter",sourceStatus:"matched"},
 ],{nfl:1,ufc:1});
 assert.deepEqual(Object.keys(ledger.bySport),["nfl","ufc"]);
 assert.equal(ledger.unresolved.length,0);
 for(const row of Object.values(ledger.bySport)){
   assert.equal(row.matchedToComparedSourcePct,100);
   assert.equal(row.abilityMonitoringCertified,false);
 }
});
test("unknown source status is unresolved",()=>{
 const ledger=buildSourceCoverageLedger([{sport:"nfl",name:"Unknown"}],{nfl:1,ufc:0});
 assert.equal(ledger.unresolved[0].reason,"unclassified-source-status");
});
test("rejects partial, invalid or overfull NFL/UFC evidence",()=>{
 assert.throws(()=>buildSourceCoverageLedger([],null),/required/);
 assert.throws(()=>buildSourceCoverageLedger([], {nfl:1}),/required/);
 assert.throws(()=>buildSourceCoverageLedger([{sport:"nfl"}],{nfl:0,ufc:0}),/exceed/);
});
