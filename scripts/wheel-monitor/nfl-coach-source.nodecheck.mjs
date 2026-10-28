import test from "node:test";
import assert from "node:assert/strict";
import {
  NFL_COACH_TEAM_NAMES, OFFICIAL_NFL_COACHES_URL,
  extractOfficialNflCoaches,reconcileOfficialNflCoach,
} from "./nfl-coach-source.mjs";
const html=(lines,heading=true)=>'<main>'+
  (heading?'<h2>2026 NFL Head Coaches, By High School</h2>':'<h2>2025 NFL Coaches</h2>')+
  '<ul>'+lines.map(([code,name])=>'<li>'+NFL_COACH_TEAM_NAMES[code]+
    ' — '+name+', high-school details.</li>').join('')+'</ul></main>';
const rows=Object.entries(NFL_COACH_TEAM_NAMES)
  .map(([code])=>[code,code==="ARI"?"Mike LaFleur":"Coach "+code]);
const normalize=x=>String(x).toLowerCase().replace(/[^a-z0-9]/g,"");
test("official 2026 coach list contains exactly 32 independently named teams",()=>{
  const value=extractOfficialNflCoaches(html(rows));
  assert.equal(Object.keys(value).length,32);
  assert.equal(value.ARI,"Mike LaFleur");
  const match=reconcileOfficialNflCoach(
    {sport:"nfl",family:"Head Coach",team:"ARI",name:"Mike LaFleur"},value,normalize);
  assert.equal(match.sourceStatus,"matched");
  assert.equal(match.sourceUrl,OFFICIAL_NFL_COACHES_URL);
  assert.equal(match.coachSourceFreshnessCertified,false);
});
test("coach mismatch is flagged and never silently changes curated identity",()=>{
  const value=extractOfficialNflCoaches(html(rows));
  const mismatch=reconcileOfficialNflCoach(
    {sport:"nfl",family:"Head Coach",team:"ARI",name:"Other Coach"},value,normalize);
  assert.equal(mismatch.sourceStatus,"coach-source-mismatch");
  assert.equal(mismatch.sourceCoachName,"Mike LaFleur");
  assert.throws(()=>reconcileOfficialNflCoach(
    {sport:"nfl",family:"QB",team:"ARI",name:"Other Coach"},value,normalize),/Expected/);
});
test("missing, duplicate, malformed or stale official page fails closed",()=>{
  assert.throws(()=>extractOfficialNflCoaches(html(rows.slice(1))),/Incomplete/);
  assert.throws(()=>extractOfficialNflCoaches(html([...rows,rows[0]])),/Duplicate/);
  assert.throws(()=>extractOfficialNflCoaches(html(rows,false)),/heading/);
  assert.throws(()=>extractOfficialNflCoaches(html(rows),2027),/No source-certified/);
  assert.throws(()=>reconcileOfficialNflCoach(
    {sport:"nfl",family:"Head Coach",team:"UNKNOWN",name:"Someone"},
    extractOfficialNflCoaches(html(rows)),normalize),/missing canonical team/);
});
