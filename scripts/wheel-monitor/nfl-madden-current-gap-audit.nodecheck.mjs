import test from "node:test";
import assert from "node:assert/strict";
import {auditGaps} from "./nfl-madden-current-gap-audit.mjs";
const grades=Array.from({length:594},(_,i)=>({
 team:"BUF",family:"WR",player:"Fixture Player "+i,grade:80}));
const rows=Array.from({length:1800},(_,i)=>({
 id:String(i),name:i<594?"Fixture Player "+i:"Unrelated "+i,
 team:"Buffalo Bills",position:"WR",overall:i===0?70:i===1?73:80}));
test("7+ discrepancies trigger review, 10+ red flag, no HQ changes",()=>{
 const r=auditGaps({edition:"Madden NFL 27",players:rows,observedAt:"today",source:"official"},grades);
 assert.equal(r.matched,594);
 assert.equal(r.redFlagCurrentGap,1);
 assert.equal(r.mandatoryCurrentGap,1);
 assert.equal(r.automaticChangesApplied,0);
 assert.equal(r.rows[0].disposition,"red-flag-10plus");
 assert.equal(r.rows[1].disposition,"mandatory-review-7plus");
});
test("incomplete data fails closed",()=>{
 assert.throws(()=>auditGaps({edition:"Madden NFL 27",players:rows.slice(0,594)},grades),/complete/);
});
test("missing identities are visible and not treated as same",()=>{
 const mismatched=grades.map(x=>({...x}));mismatched[0].player="Someone else";
 const r=auditGaps({edition:"Madden NFL 27",players:rows},mismatched);
 assert.equal(r.unmatched,1);
 assert.equal(r.rows[0].disposition,"identity-unmatched");
});