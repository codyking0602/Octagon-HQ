import {test} from "node:test";
import assert from "node:assert/strict";
import {sourceReviewBlockers} from "./source-review-gates.mjs";
test("invalid NFL Flex membership blocks certification",()=>{
 assert.deepEqual(sourceReviewBlockers([{type:"flex-inheritance-blocker",
   sport:"nfl",team:"CAR",player:"Example"}],[]),
   ["invalid-flex-priority:nfl:CAR:Example"]);
});
test("CFB rating identity/coach/source gaps and AP changes are independent",()=>{
 const result=sourceReviewBlockers([
   {type:"flex-inheritance-blocker",sport:"cfb",team:"texas",player:"Example"},
   {type:"factual-correction",newUnauditedSchools:[{id:"999"}]},
 ],[{sport:"cfb",sourceStatus:"missing"},
    {sport:"cfb",sourceStatus:"coaching-source-needed"},
    {sport:"cfb",sourceStatus:"mystery"},
    {sport:"nfl",sourceStatus:"missing"}]);
 assert.deepEqual(result,["nfl-unresolved-source-identities:1"]);
});
test("unranked UFC fighters still require independent source",()=>{
 assert.deepEqual(sourceReviewBlockers([
   {type:"verified-official-ranking-tie"},
 ],[{sport:"ufc",sourceStatus:"unranked-not-verified-by-ranked-table"}]),
 ["ufc-unranked-source-unverified:1"]);
});
test("NFL coaches and unknown source statuses block certification",()=>{
 assert.deepEqual(sourceReviewBlockers([],[
   {sport:"nfl",sourceStatus:"coaching-source-needed"},
   {sport:"ufc",sourceStatus:"mystery"},
 ]),["nfl-coaching-source-unverified:1","ufc-unclassified-source-identities:1"]);
});
test("malformed evidence cannot silently certify",()=>{
 assert.throws(()=>sourceReviewBlockers(null,[]),/Complete/);
 assert.throws(()=>sourceReviewBlockers([],null),/Complete/);
});
