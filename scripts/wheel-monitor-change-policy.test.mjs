import { test } from "node:test";
import assert from "node:assert/strict";
import { LEVEL, classifyWheelChange, compareWheelSnapshots, verifyUfcRankings, UFC_MENS_DIVISIONS } from "./wheel-monitor-change-policy.mjs";
const e = {sourceUrl:"https://www.nfl.com/", observedAt:"2026-10-25T12:00:00Z"};
const player = {sport:"NFL", identityKey:"ARI:QB:test", team:"ARI", starter:true, ranking:null, grade:88};
test("unchanged grade is valid; missing games are neutral",()=>{
  assert.equal(classifyWheelChange(player, {...player}, {independentGames:0}).level,LEVEL.NONE);
  assert.equal(classifyWheelChange(player, {...player, grade:88}, {independentGames:0}).action,"hold-existing-grade");
});
test("roster and contract facts require correction but do not auto-regrade",()=>{
  const result=classifyWheelChange(player,{...player,team:"BUF",contractApy:9000000},e);
  assert.equal(result.level,LEVEL.FACT);
  assert.equal(result.gradeAction,"none");
});
test("sustained changes review, one-off noise holds, starter role priority",()=>{
  assert.equal(classifyWheelChange(player,{...player},{...e,verifiedPerformanceChange:true,independentGames:1}).level,LEVEL.NONE);
  assert.equal(classifyWheelChange(player,{...player},{...e,verifiedPerformanceChange:true,independentGames:3}).level,LEVEL.REVIEW);
  assert.equal(classifyWheelChange(player,{...player,starter:false},e).level,LEVEL.PRIORITY);
});
test("ranking changes are factual, never a fighter grade formula",()=>{
  const before={sport:"UFC",identityKey:"fighter:flyweight",division:"Flyweight",ranking:12,grade:84};
  const result=classifyWheelChange(before,{...before,ranking:8},e);
  assert.equal(result.level,LEVEL.FACT);
  assert.equal(result.gradeAction,"none");
});
test("changed evidence without attribution is blocked",()=>{
  assert.equal(classifyWheelChange(player,{...player,team:"BUF"},{}).blocker,"source URL and timestamp required");
});
test("stable entire population creates no review item and never edits grades",()=>{
  const result=compareWheelSnapshots([player],[{...player}],{});
  assert.deepEqual([result.monitored,result.changed,result.gradeChanges,result.unchanged],[1,0,0,1]);
});
test("new subject requires identity/onboarding review, duplicates fail",()=>{
  const result=compareWheelSnapshots([], [player]);
  assert.equal(result.changes[0].level,LEVEL.FACT);
  assert.throws(()=>compareWheelSnapshots([player,player],[player]),/duplicate identity/);
});
test("valid UFC champions and fifteen contender ranks across eight divisions",()=>{
  const rows=UFC_MENS_DIVISIONS.flatMap((division)=>[
    {division,identityKey:division+"-champ",isChampion:true,ranking:null,active:true},
    ...Array.from({length:15},(_,i)=>({division,identityKey:division+"-"+(i+1),isChampion:false,ranking:i+1,active:true})),
  ]);
  assert.equal(verifyUfcRankings(rows).officialSlots,128);
  assert.throws(()=>verifyUfcRankings(rows.filter(row=>row.ranking!==15)),/expected one/);
  assert.throws(()=>verifyUfcRankings([...rows,{...rows[0]}]),/expected one/);
});
