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
      {name:"Jared Goff",team:"Detroit Lions",overallBefore:81,overallNow:83,overallDelta:2}
    ],developmentReview:{firstTwoSeasonsScreened:109,candidates:[
      {name:"Jared Goff",team:"DET",reasons:["hq-grade-changed-since-development-calibration"],priority:"high"}
    ],unmatchedMaddenFlags:[]}});
    put("contracts/comparison.json",{status:"unchanged",sourceIdentityCompletenessCertified:false,changes:[],transfers:[],summary:{changed:0}});
    put("coaches/biweekly-coach-review.json",{reviewCount:32,reviews:[]});
    put("roster/roster-integrity.json",{status:"read-only-roster-screen",playerPopulation:594,exceptions:[]});
    execFileSync(process.execPath,[script,input,output],{stdio:"pipe"});
    const report=JSON.parse(readFileSync(output,"utf8"));
    assert.equal(report.counts.uniqueReviewCandidates,1);
    assert.equal(report.reviewCandidates[0].team,"DET");
    assert.equal(report.reviewCandidates[0].flags.length,1);
    assert.equal(report.reviewCandidates[0].flags[0].monitor,"madden");
    assert.equal(report.counts.developmentFlagged,0);
    assert.equal(report.postRatingDevelopment.status,"awaiting-hq-rating-decisions");
    assert.equal(report.automaticChangesApplied,0);
    assert.equal(report.maddenRule,"overall +/-2 only; attributes disabled");
    assert.equal(report.counts.earlyCareerScreened,null);
    assert.equal(report.counts.maddenGmFlags,1);
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

test("metadata-only birthday changes do not flood actionable contract queue",()=>{
  const root=mkdtempSync(join(tmpdir(),"nfl-contract-noise-"));
  try{
    const input=join(root,"inputs"),output=join(root,"report.json");
    const put=(name,value)=>{const path=join(input,name);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,JSON.stringify(value));};
    put("madden/review.json",{baselineObservedAt:"2026-10-27T00:00:00Z",
      currentObservedAt:"2026-11-10T00:00:00Z",currentCount:1941,flags:[],
      developmentReview:{firstTwoSeasonsScreened:109,candidates:[],unmatchedMaddenFlags:[]}});
    put("contracts/comparison.json",{status:"contract-fact-review-required",
      sourceIdentityCompletenessCertified:false,changes:[
        {team:"DET",player:"Jared Goff",reviewKind:"metadata-only",differences:["age"]},
        {team:"GB",player:"Christian Watson",reviewKind:"contract-fact",differences:["salaryApy"]}
      ],transfers:[],missing:[],summary:{changed:2,materialChanged:1,metadataOnly:1}});
    put("coaches/biweekly-coach-review.json",{reviewCount:32,reviews:[]});
    put("roster/roster-integrity.json",{status:"read-only-roster-screen",playerPopulation:594,exceptions:[]});
    execFileSync(process.execPath,[script,input,output],{stdio:"pipe"});
    const report=JSON.parse(readFileSync(output,"utf8"));
    assert.equal(report.counts.contractChanges,1);
    assert.equal(report.counts.contractMetadataOnly,1);
    assert.equal(report.counts.uniqueReviewCandidates,1);
    assert.equal(report.reviewCandidates[0].name,"Christian Watson");
    assert.equal(report.counts.maddenComparisonDays,14);
  }finally{rmSync(root,{recursive:true,force:true});}
});
test("short Madden window is explicitly held instead of misreported as zero meaningful movement",()=>{
  const root=mkdtempSync(join(tmpdir(),"nfl-short-window-"));
  try{
    const input=join(root,"inputs"),output=join(root,"report.json");
    const p=join(input,"madden/review.json");mkdirSync(dirname(p),{recursive:true});
    writeFileSync(p,JSON.stringify({baselineObservedAt:"2026-10-27T21:56:00Z",
      currentObservedAt:"2026-10-27T21:57:00Z",currentCount:1941,flags:[],
      developmentReview:{firstTwoSeasonsScreened:109,candidates:[],unmatchedMaddenFlags:[]}}));
    execFileSync(process.execPath,[script,input,output],{stdio:"pipe"});
    const report=JSON.parse(readFileSync(output,"utf8"));
    assert.ok(report.sourceBlockers.some(x=>x.startsWith("madden:short-comparison-window")));
  }finally{rmSync(root,{recursive:true,force:true});}
});

test("all 32 coaches remain mandatory editorial review, not just single flagged coach",()=>{
  const root=mkdtempSync(join(tmpdir(),"nfl-coach-32-"));
  try{
    const input=join(root,"inputs"),output=join(root,"report.json");
    const path=join(input,"coaches/biweekly-coach-review.json");
    mkdirSync(dirname(path),{recursive:true});
    const reviews=Array.from({length:32},(_,i)=>({team:"T"+String(i).padStart(2,"0"),
      coach:"Coach "+i,currentOfficialCoach:"Coach "+i,officialStatus:"matched",
      hqGrade:80,reviewRequired:true,reviewedThisCycle:false,
      reviewDecision:"pending-editorial-judgment"}));
    writeFileSync(path,JSON.stringify({reviewCount:32,reviews}));
    execFileSync(process.execPath,[script,input,output],{stdio:"pipe"});
    const result=JSON.parse(readFileSync(output,"utf8"));
    assert.equal(result.coachGradeReviewQueue.length,32);
    assert.equal(result.counts.coachesMandatoryGradeReviews,32);
    assert.equal(result.counts.coachesPendingEditorialDecisions,32);
    assert.ok(result.sourceBlockers.some(x=>x.includes("mandatory-editorial-grade-decisions-pending")));
  }finally{rmSync(root,{recursive:true,force:true});}
});
