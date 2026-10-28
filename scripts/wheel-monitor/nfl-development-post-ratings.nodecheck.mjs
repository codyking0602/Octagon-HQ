import test from "node:test";
import assert from "node:assert/strict";
import {buildPostRatingReview} from "./nfl-development-post-ratings.mjs";

function population(){
  const profiles=[],grades=[],contracts=[];
  for(let i=0;i<594;i++){
    const team=i<2?"JAX":["ARI","BUF","NYG","DAL"][i%4];
    const family=i===1?"Secondary":"WR";
    const name=i<2?"Travis Hunter":"Fixture Player "+i;
    profiles.push({id:team+"|"+family+"|"+i,name,team,family,
      ageAtCalibration:24,gradeAtCalibration:83,declinePct:20,
      breakoutPct:25,improvePct:40});
    grades.push({team,family,player:name,grade:i===0?84:83});
    contracts.push({team,family,player:name,draftYear:2023,
      stablePlayerId:team+"|"+family+"|"+i});
  }
  return {profiles,grades,contracts};
}
test("only grade changes trigger mandatory post-rating reevaluation and no automatic edits",()=>{
  const p=population();
  const out=buildPostRatingReview(p.profiles,p.grades,p.contracts,"2026-10-27T00:00:00Z");
  assert.equal(out.eligiblePlayers,594);
  assert.equal(out.changedSinceDevelopmentCalibration,1);
  assert.equal(out.mandatoryDevelopmentReevaluations[0].name,"Travis Hunter");
  assert.equal(out.mandatoryDevelopmentReevaluations[0].family,"WR");
  assert.equal(out.developmentProbabilitiesChanged,0);
  assert.equal(out.gradesChanged,0);
});
test("same named athlete in a second position is a distinct reviewed slot",()=>{
  const p=population();
  p.grades[1].grade=82;
  const out=buildPostRatingReview(p.profiles,p.grades,p.contracts,"2026-10-27T00:00:00Z");
  assert.equal(out.mandatoryDevelopmentReevaluations.length,2);
  assert.deepEqual(out.mandatoryDevelopmentReevaluations.map(x=>x.family),["WR","Secondary"]);
});
test("untrusted duplicated grade identities are blocked",()=>{
  const p=population();
  p.grades[1].family="WR";
  assert.throws(()=>buildPostRatingReview(p.profiles,p.grades,p.contracts,"now"),/Duplicate/);
});

test("player team transfer never disconnects original stable development identity",()=>{
  const p=population();
  p.grades[2].team="HOU";
  p.contracts[2].team="HOU";
  const out=buildPostRatingReview(p.profiles,p.grades,p.contracts,"now");
  assert.equal(out.eligiblePlayers,594);
  assert.equal(out.stableIdentityTeamTransitions.length,1);
  assert.equal(out.stableIdentityTeamTransitions[0].id,p.profiles[2].id);
  assert.equal(out.stableIdentityTeamTransitions[0].currentTeam,"HOU");
});
