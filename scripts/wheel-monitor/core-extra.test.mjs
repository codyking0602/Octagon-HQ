import test from 'node:test';
import assert from 'node:assert/strict';
import { DIVISIONS, validateCatalog, validateUfc, validateFlex, compareEvidence, summarizeDecisions } from './core.mjs';

function fighters() { return DIVISIONS.flatMap(division => [
  { sport:'ufc', division, name:division+' Champion', rank:null, champion:true, grade:95 },
  ...Array.from({length:15}, (_,i) => ({sport:'ufc', division, name:division+' Fighter '+(i+1), rank:i+1, champion:false, grade:82}))
]); }

test('one champion and exactly fifteen distinct ranks per division', () => {
  assert.equal(validateCatalog(fighters(),'ufc'),128);
  assert.throws(() => validateUfc(fighters().slice(1)),/champion/);
  const duplicate=fighters(); duplicate[2].rank=1;
  assert.throws(() => validateUfc(duplicate),/distinct contenders/);
});

test('stable evidence skips evaluation even when previous score differs', () => {
  const old={sport:'nfl',team:'DAL',family:'QB',name:'Test QB',grade:91,sourceStatus:'matched'};
  const next={...old,grade:90};
  const result=compareEvidence([next],{identities:[old]});
  assert.equal(result[0].classification,'no-meaningful-change');
  assert.equal(summarizeDecisions(result).deepReviewCandidates,0);
  assert.equal(result[0].gradePreserved,true);
});

test('absence prompts a review but not an ability downgrade', () => {
  const old={sport:'nfl',team:'DAL',family:'WR',name:'Receiver',grade:89,sourceStatus:'matched'};
  const next={...old,sourceStatus:'missing'};
  const [finding]=compareEvidence([next],{identities:[old]});
  assert.equal(finding.classification,'review-suggested');
  assert.equal(finding.signals[0].kind,'roster-absence');
});

test('team change mandates reconciliation; position change deserves priority', () => {
  const old={sport:'nfl',team:'SEA',family:'WR',name:'Receiver',grade:88,sourceRole:'reserve'};
  assert.equal(compareEvidence([{...old,sourceTeam:'PHI'}],{identities:[old]})[0].classification,'mandatory-factual-correction');
  assert.equal(compareEvidence([{...old,sourceRole:'starter'}],{identities:[old]})[0].classification,'priority-review');
});

test('fighter rank is a fact, not a score formula', () => {
  const old={sport:'ufc',division:'Flyweight',name:'Fighter',rank:8,champion:false,grade:85};
  const finding=compareEvidence([{...old,rank:4}],{identities:[old]})[0];
  assert.equal(finding.classification,'mandatory-factual-correction');
  assert.equal(finding.gradePreserved,true);
});

test('Flex is inherited from RB, WR, or TE', () => {
  validateFlex({DAL:{RB:['One'],WR:['Two'],TE:['Three'],Flex:['Two','Three']}});
  assert.throws(()=>validateFlex({DAL:{RB:['One'],WR:['Two'],TE:['Three'],Flex:['Unknown']}}),/not inherited/);
});
