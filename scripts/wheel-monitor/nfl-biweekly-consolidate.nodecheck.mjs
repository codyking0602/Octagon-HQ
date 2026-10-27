import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,dirname} from "node:path";
import {execFileSync} from "node:child_process";
const script="scripts/wheel-monitor/nfl-biweekly-consolidate.mjs";
test("biweekly NFL report deduplicates full EA team names and HQ codes",()=>{
  const root=mkdtempSync(join(tmpdir(),"nfl-biweekly-test-"));
  try{
    const input=join(root,"inputs"),output=join(root,"report.json");
    const put=(name,value)=>{const path=join(input,name);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,JSON.stringify(value));};
    put("madden/review.json",{currentCount:1941,flags:[
      {name:"Sample Quarterback",team:"Buffalo Bills",overallBefore:81,overallNow:83,overallDelta:2}
    ],developmentReview:{firstTwoSeasonsScreened:109,candidates:[
      {name:"Sample Quarterback",team:"BUF",reasons:["hq-grade-changed-since-development-calibration"],priority:"high"}
    ],unmatchedMaddenFlags:[]}});
    put("contracts/comparison.json",{status:"unchanged",sourceIdentityCompletenessCertified:false,changes:[],transfers:[],summary:{changed:0}});
    put("coaches/biweekly-coach-review.json",{reviewCount:32,reviews:[]});
    put("roster/roster-integrity.json",{status:"read-only-roster-screen",playerPopulation:594,exceptions:[]});
    execFileSync(process.execPath,[script,input,output],{stdio:"pipe"});
    const report=JSON.parse(readFileSync(output,"utf8"));
    assert.equal(report.counts.uniqueReviewCandidates,1);
    assert.equal(report.reviewCandidates[0].team,"BUF");
    assert.equal(report.reviewCandidates[0].flags.length,2);
    assert.equal(report.automaticChangesApplied,0);
    assert.equal(report.maddenRule,"overall +/-2 only; attributes disabled");
    assert.equal(report.counts.earlyCareerScreened,109);
  }finally{rmSync(root,{recursive:true,force:true});}
});
test("missing source files remain explicit blockers, not unchanged",()=>{
  const root=mkdtempSync(join(tmpdir(),"nfl-biweekly-empty-"));
  try{
    const out=join(root,"report.json");
    execFileSync(process.execPath,[script,join(root,"missing"),out],{stdio:"pipe"});
    const r=JSON.parse(readFileSync(out,"utf8"));
    assert.equal(r.sourceBlockers.length,4);
    assert.equal(r.counts.uniqueReviewCandidates,0);
  }finally{rmSync(root,{recursive:true,force:true});}
});
