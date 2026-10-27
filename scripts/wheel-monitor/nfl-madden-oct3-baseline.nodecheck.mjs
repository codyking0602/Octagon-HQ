import test from "node:test";
import assert from "node:assert/strict";
import {selectOct3Iteration} from "./nfl-madden-oct3-baseline.mjs";

test("select exact historical Week 3, never current Week 5",()=>{
  const v=selectOct3Iteration({iterations:[
    {id:"6-week-5",label:"Week 5"},{id:"4-week-3",label:"Week 3"},
    {id:"5-week-4",label:"Week 4"}]});
  assert.equal(v.id,"4-week-3");
});
test("never silently use current ratings when archived week is absent",()=>{
  assert.throws(()=>selectOct3Iteration({iterations:[{id:"6-week-5",label:"Week 5"}]}),
    /Expected exactly one/);
});
test("ambiguous Week 3 evidence is a blocker",()=>{
  assert.throws(()=>selectOct3Iteration({iterations:[
    {id:"4-week-3",label:"Week 3"},{id:"5-week-3",label:"Week 3"}]}),
    /Expected exactly one/);
});