import {test} from "node:test";
import assert from "node:assert/strict";
import {sourceReviewBlockers} from "./source-review-gates.mjs";
test("invalid Flex membership blocks global certification, not passive monitoring",()=>{
 const result=sourceReviewBlockers([{type:"flex-inheritance-blocker",
   sport:"nfl",team:"CAR",player:"Darren Waller"}],[]);
 assert.deepEqual(result,["invalid-flex-priority:nfl:CAR:Darren Waller"]);
});
test("ambiguous roster identity cannot be certified as matched",()=>{
 const result=sourceReviewBlockers([],[
  {sport:"nfl",sourceStatus:"missing"},{sport:"cfb",sourceStatus:"missing"},
  {sport:"cfb",sourceStatus:"ambiguous"},{sport:"ufc",sourceStatus:"matched"}]);
 assert.deepEqual(result,["cfb-unresolved-source-identities:2","nfl-unresolved-source-identities:1"]);
});
test("verified official UFC ties and normal AP changes are valid source observations",()=>{
 assert.deepEqual(sourceReviewBlockers([
  {type:"verified-official-ranking-tie"},
  {type:"factual-correction",changes:[{rank:2}],newUnauditedSchools:[]},
 ],[{sport:"ufc",sourceStatus:"unranked-not-verified-by-ranked-table"}]),[]);
});
test("new unaudited AP participant must not enter global certified snapshot",()=>{
 assert.deepEqual(sourceReviewBlockers([
  {type:"factual-correction",newUnauditedSchools:[{id:"999"}]}
 ],[]),["cfb-unaudited-live-ap-schools:1"]);
});
test("malformed evidence cannot silently certify",()=>{
 assert.throws(()=>sourceReviewBlockers(null,[]),/Complete/);
 assert.throws(()=>sourceReviewBlockers([],null),/Complete/);
});
