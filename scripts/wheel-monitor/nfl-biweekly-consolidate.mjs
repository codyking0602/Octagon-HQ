#!/usr/bin/env node
// Unifies five NFL review inputs. Missing inputs remain explicit blockers, never "no flags".
import {readFileSync,existsSync,mkdirSync,writeFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
const base=resolve(process.argv[2]??"tmp/wheel-monitor/biweekly");
const out=resolve(process.argv[3]??"tmp/wheel-monitor/nfl-biweekly-report.json");
const files={madden:"madden/review.json",contracts:"contracts/comparison.json",
  coaches:"coaches/biweekly-coach-review.json",roster:"roster/roster-integrity.json"};
const data={},blockers=[],counts={};
for(const [type,file] of Object.entries(files)){
  const path=resolve(base,file);
  if(!existsSync(path)){blockers.push(type+":missing-source-report");data[type]=null;continue;}
  try{data[type]=JSON.parse(readFileSync(path,"utf8"));}
  catch(error){data[type]=null;blockers.push(type+":invalid-report:"+String(error));}
}
const TEAM_ABBREVS={ARI:"Arizona Cardinals",ATL:"Atlanta Falcons",BAL:"Baltimore Ravens",BUF:"Buffalo Bills",
  CAR:"Carolina Panthers",CHI:"Chicago Bears",CIN:"Cincinnati Bengals",CLE:"Cleveland Browns",
  DAL:"Dallas Cowboys",DEN:"Denver Broncos",DET:"Detroit Lions",GB:"Green Bay Packers",
  HOU:"Houston Texans",IND:"Indianapolis Colts",JAX:"Jacksonville Jaguars",KC:"Kansas City Chiefs",
  LAC:"Los Angeles Chargers",LAR:"Los Angeles Rams",LV:"Las Vegas Raiders",MIA:"Miami Dolphins",
  MIN:"Minnesota Vikings",NE:"New England Patriots",NO:"New Orleans Saints",NYG:"New York Giants",
  NYJ:"New York Jets",PHI:"Philadelphia Eagles",PIT:"Pittsburgh Steelers",SEA:"Seattle Seahawks",
  SF:"San Francisco 49ers",TB:"Tampa Bay Buccaneers",TEN:"Tennessee Titans",WSH:"Washington Commanders"};
const teamCodes=new Map(Object.entries(TEAM_ABBREVS).map(([code,name])=>[name,code]));
const standardTeam=team=>teamCodes.get(team)??team;
const normName=name=>String(name??"").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"")
  .replace(/(?:iii|ii|iv|jr|sr|v)$/,"");
const candidates=new Map(),key=(team,name)=>standardTeam(team)+"|"+normName(name);
function add(team,name,monitor,reason,priority="medium",details={}){
  const id=key(team,name);if(!team||!name)return;
  team=standardTeam(team);
  const existing=candidates.get(id)??{team,name,priority,flags:[],details:{}};
  if(priority==="high")existing.priority="high";
  if(!existing.flags.some(x=>x.monitor===monitor&&x.reason===reason))existing.flags.push({monitor,reason});
  existing.details[monitor]=details;
  candidates.set(id,existing);
}
const gmProfiles=JSON.parse(readFileSync("data/curated/football/gm-nfl-development-profiles-2026-10-07.json","utf8")).profiles;
if(gmProfiles.length!==594)throw new Error("Canonical NFL GM development population changed");
const gmKeys=new Set(gmProfiles.map(p=>key(p.team,p.name)));
const m=data.madden;
if(m){
  if(!Array.isArray(m.flags)||!m.developmentReview?.candidates)blockers.push("madden:incomplete-output");
  const relevant=(m.flags??[]).filter(row=>gmKeys.has(key(row.team,row.name)));
  for(const row of relevant)add(row.team,row.name,"madden","overall-"+row.overallDelta+"-review",Math.abs(row.overallDelta)>=4?"high":"medium",row);
  // Stage 1 is ratings research only. Development can be recalibrated only
  // after HQ has made and published its approved rating decisions.
  counts.developmentStage="deferred-until-approved-hq-rating-decisions";
  counts.developmentFlagged=0;
  if(m.developmentReview?.status!=="deferred-until-hq-rating-review-complete")
    blockers.push("development:legacy-pre-rating-review-output-ignored");
  if(m.baselineProvenance?.kind==="EA archived historical iteration" &&
     m.exactOctober3SourceCertified!==true)
    blockers.push("madden:archived-week-3-is-not-a-certified-october-3-capture");
  const archived=m.baselineProvenance?.kind==="EA archived historical iteration";
  const start=Date.parse(m.baselineObservedAt??"");
  const end=Date.parse(m.currentObservedAt??"");
  counts.maddenComparisonDays=null;
  if(!archived&&Number.isFinite(start)&&Number.isFinite(end)){
    const days=(end-start)/86400000;
    counts.maddenComparisonDays=Math.round(days*100)/100;
    if(days<7)blockers.push("madden:short-comparison-window-not-a-representative-biweekly-cycle");
  }
  counts.maddenFullPopulation=m.currentCount??0;
  counts.maddenFlags=m.flags?.length??0;
  counts.maddenGmFlags=relevant.length;
  counts.maddenOutsideGm=(m.flags?.length??0)-relevant.length;
  counts.earlyCareerScreened=null; // Checked only by post-rating development monitor.
  counts.unmatchedMaddenFlags=null;
  counts.maddenBaselineProvenance=m.baselineProvenance??null;
}
const c=data.contracts;
if(c){
  if(!["unchanged","contract-fact-review-required","metadata-review-required","identity-review-blocked"].includes(c.status))
    blockers.push("contracts:"+String(c.status));
  // Birthdays, age changes and other metadata-only observations are not contract actions.
  for(const row of c.changes??[])if(row.reviewKind==="contract-fact")
    add(row.team,row.player,"contracts",row.differences.join(", "),"high",row);
  for(const row of c.transfers??[])add(row.fromTeam,row.player,"transfers","unconfirmed-OTC-transfer","high",row);
  counts.contractChanges=c.summary?.materialChanged??null;
  counts.contractMetadataOnly=c.summary?.metadataOnly??null;
  counts.contractTransfers=c.transfers?.length??0;
  counts.contractMissingIdentities=c.missing?.length??0;
  if(c.status==="identity-review-blocked")blockers.push("contracts:unresolved-provider-identity-coverage");
  if(c.sourceIdentityCompletenessCertified===false)blockers.push("contracts:source-identity-completeness-not-certified");
}
const coach=data.coaches;
const coachGradeReviewQueue=coach?.reviews??[];
if(coach){
  if(coach.reviewCount!==32||coachGradeReviewQueue.length!==32)
    blockers.push("coaches:missing-full-32-editorial-ledger");
  for(const row of coachGradeReviewQueue){
    if(row.officialStatus!=="matched"||row.currentOfficialCoach!==row.coach)
      add(row.team,row.coach,"coaches",row.officialStatus??"mismatched-coach","high",row);
  }
  counts.coachesScreened=coach.reviewCount??0;
  counts.coachesMandatoryGradeReviews=coachGradeReviewQueue.length;
  counts.coachesEditorialDecisionsCompleted=coachGradeReviewQueue.filter(row=>
    row.reviewedThisCycle===true&&row.reviewDecision!=="pending-editorial-judgment").length;
  counts.coachesPendingEditorialDecisions=coachGradeReviewQueue.length-
    counts.coachesEditorialDecisionsCompleted;
  if(counts.coachesPendingEditorialDecisions)
    blockers.push("coaches:"+counts.coachesPendingEditorialDecisions+"-mandatory-editorial-grade-decisions-pending");
}
const roster=data.roster;
if(roster){
  if(roster.status!=="read-only-roster-screen")blockers.push("roster:"+roster.status);
  for(const row of roster.exceptions??[])add(row.team,row.player,"roster",row.status,"medium",row);
  counts.rosterScreened=roster.playerPopulation??null;
  counts.rosterExceptions=roster.exceptions?.length??null;
}
const combined=[...candidates.values()].sort((a,b)=>(a.priority==="high"?0:1)-(b.priority==="high"?0:1)||a.team.localeCompare(b.team)||a.name.localeCompare(b.name));
const report={schema:1,sport:"NFL",mode:"biweekly-read-only-pilot",observedAt:new Date().toISOString(),
  maddenRule:"overall +/-2 only; attributes disabled",monitors:["madden","contracts-transfers","head-coaches","roster-integrity","development"],
  counts:{...counts,uniqueReviewCandidates:combined.length},
  sourceBlockers:blockers,reviewCandidates:combined,
  coachGradeReviewQueue,postRatingDevelopment:{
    status:"awaiting-hq-rating-decisions",
    trigger:"Run separate NFL post-rating development monitor after approved HQ grades land in main",
    automaticChangesApplied:0
  },automaticChangesApplied:0,
  note:"Candidate means research needed, NOT an approved grade, development or transaction change; sources can be incomplete."};
mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({counts:report.counts,sourceBlockers:blockers}));
