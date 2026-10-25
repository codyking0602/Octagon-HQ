import test from "node:test";
import assert from "node:assert/strict";
import {compareGmContractSnapshots} from "./gm-contract-compare.mjs";
const date="2026-10-25T12:00:00Z";
const row=(player,more={})=>({
  team:"ARI",family:"WR",player,normalizedName:player.toLowerCase().replace(/[^a-z]/g,""),
  position:"WR",salaryApy:8000000,realContractEndSeason:2028,gameContract:"3YR",
  age:24,gmEligibleSlots:["WR","FLEX"],
  source:{provider:"OverTheCap via nflverse",otcId:23,
    playerPage:"https://overthecap.com/player/"+player.toLowerCase()+"/23/"},
  ...more,
});
const baseline={snapshotDate:"2026-10-05",players:[row("Example")]};
const fresh={snapshotDate:"2026-10-25",players:[row("Example")]};
test("unchanged week leaves contracts and grades untouched",()=>{
 const review=compareGmContractSnapshots(baseline,fresh,date);
 assert.deepEqual([review.status,review.summary.changed,review.gradeChangesApplied,
   review.contractChangesApplied],["unchanged",0,0,0]);
});
test("APY and contract term changes are review facts, not automutations",()=>{
 const next={...fresh,players:[row("Example",{salaryApy:12000000,
   gameContract:"1YR",realContractEndSeason:2027})]};
 const review=compareGmContractSnapshots(baseline,next,date);
 assert.equal(review.status,"contract-fact-review-required");
 assert.deepEqual(review.changes[0].differences,
   ["salaryApy","realContractEndSeason","gameContract"]);
 assert.equal(review.changes[0].sourceUrl,"https://overthecap.com/player/example/23/");
 assert.equal(review.contractChangesApplied,0);
 assert.equal(review.summary.materialChanged,1);
 assert.equal(review.summary.metadataOnly,0);
});
test("no silent population shrinkage or new names",()=>{
 const changed={...fresh,players:[row("Different")]};
 const review=compareGmContractSnapshots(baseline,changed,date);
 assert.equal(review.status,"identity-review-blocked");
 assert.deepEqual(review.missing,["ARI|WR|example"]);
 assert.deepEqual(review.extra,["ARI|WR|different"]);
});
test("fail closed on duplicate identities and invalid contracts",()=>{
 assert.throws(()=>compareGmContractSnapshots(baseline,{...fresh,players:[row("Example"),row("Example")]},date),/duplicated/);
 assert.throws(()=>compareGmContractSnapshots(baseline,{...fresh,players:[row("Example",{salaryApy:-1})]},date),/malformed/);
 assert.throws(()=>compareGmContractSnapshots(baseline,{players:[]},date),/missing GM contract/);
});
test("age-only change is cheap roster metadata, never an expensive contract adjustment",()=>{
 const next={...fresh,players:[row("Example",{age:25})]};
 const report=compareGmContractSnapshots(baseline,next,date);
 assert.equal(report.status,"metadata-review-required");
 assert.equal(report.summary.materialChanged,0);
 assert.equal(report.summary.metadataOnly,1);
 assert.equal(report.summary.fieldCounts.age,1);
 assert.equal(report.contractChangesApplied,0);
});
