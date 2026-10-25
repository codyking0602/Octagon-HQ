import test from 'node:test';
import assert from 'node:assert/strict';
import { DIVISIONS, validateCatalog, validateUfc, validateFlex, compareEvidence, summarizeDecisions, selectApprovedGrades, snapshotReadiness, validateOfficialUfcTable } from './core.mjs';

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
  assert.equal(finding.signals[0].kind,'roster-absence-not-proof-of-release');
  // Follow up identity cheaply; do not pay for an ability/peer regrade.
  assert.equal(summarizeDecisions([finding]).identityReconciliationCandidates,1);
  assert.equal(summarizeDecisions([finding]).deepReviewCandidates,0);
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

test('active-only reconciliation rejects stale grade rows and reports every missing approved identity', () => {
  const approved=new Set(['CFB:texas:QB:playerone','CFB:texas:RB:playertwo']);
  const rows=[
    {sport:'cfb',team:'texas',family:'QB',name:'Player One',nameKey:'playerone',grade:88},
    {sport:'cfb',team:'texas',family:'QB',name:'Retired',nameKey:'retired',grade:85},
  ];
  const report=selectApprovedGrades(rows,'cfb',approved);
  assert.equal(report.expected,2);
  assert.equal(report.selected.length,1);
  assert.deepEqual(report.missing,['CFB:texas:RB:playertwo']);
  assert.deepEqual(report.stale,['CFB:texas:QB:retired']);
  assert.deepEqual(snapshotReadiness(report.missing),{
    status:'review-blocked',snapshotReady:false,blockers:report.missing,
  });
});
test('certification is possible only after all blockers resolved', () => {
  assert.deepEqual(snapshotReadiness([]),{status:'source-certified',snapshotReady:true,blockers:[]});
});

test('official UFC ties use competition ranks rather than malformed sequential rankings', () => {
 const rows=[{name:'Champion',champion:true,rank:null},
   ...Array.from({length:15},(_,i)=>({
     name:'Contender '+i,champion:false,rank:i===12?12:i+1,
   }))];
 // 1..12,12,14,15 is a legitimate official vote tie at #12.
 const valid=validateOfficialUfcTable(rows,'Welterweight');
 assert.equal(valid.valid,true);
 assert.deepEqual(valid.tiedRanks,[{rank:12,name:'Contender 12'}]);
 const gap=rows.map(x=>({...x})); gap.at(-1).rank=13;
 assert.equal(validateOfficialUfcTable(gap,'Welterweight').valid,false);
 const duplicated=rows.map(x=>({...x})); duplicated.at(-1).name='Contender 0';
 assert.equal(validateOfficialUfcTable(duplicated,'Welterweight').valid,false);
});
