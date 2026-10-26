import test from "node:test";
import assert from "node:assert/strict";
import {NFL_COACH_TEAM_NAMES} from "./nfl-coach-source.mjs";
import {
  NFL_TEAM_SLUGS,coachTeamUrl,parseNflTeamCoach,
  coachPublicationFreshness,summarizeLiveCoaches,
} from "./nfl-coach-current-source.mjs";
const fixture=(coach="Mike LaFleur",team="Arizona Cardinals")=>
  '<!DOCTYPE html><html><head><title>'+team+' News, Scores, Stats, Schedule | NFL.com</title>'+
  '</head><body><h1>'+team+'</h1><main><h2>Team Info</h2>'+
  '<ul><li><span>Head Coach</span><span>'+coach+'</span></li>'+
  '<li><span>Stadium</span><span>State Farm Stadium</span></li></ul>'+
  '</main></body></html>';
const observedAt="2026-10-25T23:00:00Z";
const expected=Object.fromEntries(Object.keys(NFL_COACH_TEAM_NAMES)
  .map(code=>[code,code==="ARI"?"Mike LaFleur":"Coach "+code]));
const sourceRows=()=>Object.keys(NFL_TEAM_SLUGS).map(team=>({
  team,coach:expected[team],sourceUrl:coachTeamUrl(team),lastModified:"2026-10-25T14:00:00Z",
}));
test("NFL live team pages are independently mapped for exactly 32 teams",()=>{
  assert.equal(Object.keys(NFL_TEAM_SLUGS).length,32);
  assert.deepEqual(Object.keys(NFL_TEAM_SLUGS).sort(),Object.keys(NFL_COACH_TEAM_NAMES).sort());
  assert.equal(coachTeamUrl("ARI"),"https://www.nfl.com/teams/arizona-cardinals/");
  assert.equal(parseNflTeamCoach(fixture(),"ARI"),"Mike LaFleur");
});
test("missing, wrong-team and ambiguous HTML cannot pass coach parsing",()=>{
  assert.throws(()=>parseNflTeamCoach(fixture("Mike LaFleur","Chicago Bears"),"ARI"),/team identity mismatch/);
  assert.throws(()=>parseNflTeamCoach(fixture().replace("Team Info","Team Bios"),"ARI"),/section missing/);
  assert.throws(()=>parseNflTeamCoach(fixture("Mike LaFleur").replace("Stadium","Roster"),"ARI"),/head coach missing/);
  assert.throws(()=>parseNflTeamCoach(fixture("Please sign in for coaching information"),"ARI"),/Ambiguous/);
  assert.throws(()=>parseNflTeamCoach("", "ARI"),/Empty/);
});
test("Last-Modified is distinct from crawl time, future or missing dates fail closed",()=>{
  assert.equal(coachPublicationFreshness("2026-10-24T23:00:00Z",observedAt),true);
  assert.equal(coachPublicationFreshness("2026-10-01T23:00:00Z",observedAt),false);
  assert.equal(coachPublicationFreshness(null,observedAt),false);
  assert.equal(coachPublicationFreshness("2026-10-26T23:00:00Z",observedAt),false);
});
test("complete matched coaches certify currentness only with dated source evidence",()=>{
  const result=summarizeLiveCoaches(sourceRows(),expected,observedAt);
  assert.equal(result.status,"current-official-coach-sources-certified");
  assert.equal(result.matched,32);
  assert.equal(result.livePublicationFreshnessVerified,32);
  assert.equal(result.noAbilityOrIdentityAuthorityChanges,true);
  const withoutDate=sourceRows();withoutDate[0].lastModified=null;
  const blocked=summarizeLiveCoaches(withoutDate,expected,observedAt);
  assert.equal(blocked.status,"source-review-required");
  assert.equal(blocked.matched,32);
  assert.equal(blocked.livePublicationFreshnessVerified,31);
  assert.equal(blocked.rows[0].publicationFreshnessVerified,false);
});
test("one new coach, failed request or missing team never certifies full coverage",()=>{
  const changed=sourceRows();changed[0].coach="Someone Else";
  let out=summarizeLiveCoaches(changed,expected,observedAt);
  assert.equal(out.status,"source-review-required");assert.equal(out.matched,31);
  assert.equal(out.rows[0].sourceStatus,"official-current-coach-mismatch");
  const absent=sourceRows().slice(1);
  out=summarizeLiveCoaches(absent,expected,observedAt);
  assert.equal(out.status,"source-review-required");assert.equal(out.matched,31);
  assert.equal(out.rows[0].sourceStatus,"missing-current-source");
  assert.throws(()=>summarizeLiveCoaches([...sourceRows(),sourceRows()[0]],expected,observedAt),/Duplicate/);
});
