#!/usr/bin/env node
// Stage 2 only. Review NFL development AFTER owner-approved HQ ratings are
// published; never automatically edit development probabilities or ratings.
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {pathToFileURL} from "node:url";
import {flagDevelopmentProfiles} from "./nfl-madden-review.mjs";

export function buildPostRatingReview(profiles,grades,contracts,at,previous=null){
  if(profiles.length!==594||grades.length!==594||contracts.length!==594)
    throw new Error("Canonical 594-player NFL identity census required for post-rating review");
  const normalized=s=>String(s??"").normalize("NFKD")
    .replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"")
    .replace(/(?:iii|ii|iv|jr|sr|v)$/,"");
  const currentKey=row=>row.team+"|"+row.family+"|"+normalized(row.player);
  const gradeMap=new Map(grades.map(row=>[currentKey(row),row]));
  const contractByStableId=new Map(contracts.map(row=>[
    row.stablePlayerId??currentKey(row),row]));
  if(gradeMap.size!==594||contractByStableId.size!==594 ||
    new Set(profiles.map(row=>row.id)).size!==594)
    throw new Error("Duplicate or ambiguous canonical NFL player identity");
  // Previous PUBLISHED checkpoint, not the fixed October 7 calibration.
  // Missing checkpoint bootstraps the latest already-approved grades as the baseline:
  // those older revisions were already screened by the earlier workflow.
  const priorRows=previous?.snapshot??null;
  if(priorRows!==null&&(!Array.isArray(priorRows)||priorRows.length!==594||
    new Set(priorRows.map(r=>r.id)).size!==594))
    throw new Error("Previous NFL grade checkpoint must cover 594 unique stable identities");
  const previousGrades=priorRows?new Map(priorRows.map(r=>[r.id,Number(r.grade)])):null;
  if(previousGrades&&([...previousGrades.values()].some(v=>!Number.isFinite(v))))
    throw new Error("Previous NFL grade checkpoint contains invalid grades");
  const gradeChanges=[],profileGradeRows=[],profileContracts=[],snapshot=[];
  let cumulativeGradeDrift=0;
  for(const row of profiles){
    const contract=contractByStableId.get(row.id);
    const current=contract && gradeMap.get(currentKey(contract));
    if(!current||!Number.isFinite(Number(current.grade))||
      !Number.isFinite(Number(row.gradeAtCalibration)))
      throw new Error("Missing stable-ID-linked HQ grade mapping for "+row.id);
    profileGradeRows.push({...current,team:row.team,family:row.family,player:row.name});
    profileContracts.push({...contract,team:row.team,family:row.family,player:row.name});
    snapshot.push({id:row.id,grade:Number(current.grade)});
    if(Number(current.grade)!==Number(row.gradeAtCalibration))cumulativeGradeDrift++;
    if(previousGrades&&!previousGrades.has(row.id))
      throw new Error("Prior grade checkpoint missing stable identity "+row.id);
    if(previousGrades&&Number(current.grade)!==previousGrades.get(row.id))
      gradeChanges.push({id:row.id,name:row.name,team:row.team,family:row.family,
        calibrationGrade:Number(row.gradeAtCalibration),previousPublishedGrade:previousGrades.get(row.id),
        approvedHqGrade:Number(current.grade),
        currentTeam:contract.team,rosterIdentityChanged:contract.team!==row.team,
        developmentAction:"reevaluate-probabilities-after-approved-rating-change",
        decision:"pending-editorial-review"});
  }
  const screen=flagDevelopmentProfiles(profiles,[],profileGradeRows,profileContracts,[]);
  return {schema:1,stage:"post-owner-rating-decisions",sport:"NFL",observedAt:at,
    eligiblePlayers:594,changedSinceDevelopmentCalibration:cumulativeGradeDrift,
    changedSinceLastPublishedCheckpoint:gradeChanges.length,
    baselineSource:previousGrades?"previous-published-594-grade-checkpoint":"initial-current-authority-bootstrap",
    gradeCheckpoint:{schema:1,sport:"NFL",observedAt:at,snapshot},
    mandatoryDevelopmentReevaluations:gradeChanges,
    independentProbabilityReview:screen.candidates.filter(c=>c.reasons.some(reason=>
      reason==="aging-player-low-decline-probability"||
      reason==="early-career-progression-risk-outlier")),
    stableIdentityTeamTransitions:profiles.flatMap(row=>{
      const c=contractByStableId.get(row.id);
      return c.team!==row.team?[{id:row.id,originalTeam:row.team,currentTeam:c.team,
        note:"Stable player identity preserved; roster transfer is separate from grading"}]:[];
    }),
    note:"All NEW published grade changes since the previous complete checkpoint trigger reevaluation. The first run initializes current baseline without requeueing old already-published changes. Independent age/early-career risk remains separate. Any development probability change requires editorial approval.",
    gradesChanged:0,developmentProbabilitiesChanged:0};
}
export function loadFromAuthority(){
  const read=p=>JSON.parse(readFileSync(p,"utf8"));
  const profiles=read("data/curated/football/gm-nfl-development-profiles-2026-10-07.json").profiles;
  const authority=readFileSync("src/features/back-room/wheelFootballNflCurrentAuthority.ts","utf8");
  const fileNames=[...new Set([...authority.matchAll(/wheel-nfl-(?:qb|rb|wr|te|front-seven|secondary)-grades-\d{4}-\d\d-\d\d\.json/g)]
    .map(m=>m[0]))];
  if(fileNames.length!==6)throw new Error("Expected exactly six current NFL grade authority files");
  const familyForFile=file=>{
    if(file.includes("-front-seven-"))return "Front Seven";
    if(file.includes("-secondary-"))return "Secondary";
    const tag=file.match(/wheel-nfl-(qb|rb|wr|te)-grades-/)?.[1];
    return {qb:"QB",rb:"RB",wr:"WR",te:"TE"}[tag]??null;
  };
  const grades=fileNames.flatMap(file=>read("data/generated/football/"+file).grades
    .map(row=>({...row,family:familyForFile(file)})));
  const contractsPath=authority.match(/contractFile:\s*"([^"]+)"/)?.[1];
  if(!contractsPath)throw new Error("Missing canonical NFL contract file binding");
  const contracts=read("data/generated/football/"+contractsPath).players;
  return {profiles,grades,contracts};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{
    const out=process.argv.find(arg=>arg.startsWith("--out="))?.slice(6);
    if(!out)throw new Error("--out=FILE required");
    const previousFile=process.argv.find(arg=>arg.startsWith("--previous="))?.slice(11);
    const prior=previousFile?JSON.parse(readFileSync(previousFile,"utf8")):null;
    const report=buildPostRatingReview(...Object.values(loadFromAuthority()),new Date().toISOString(),prior);
    const file=resolve(out);mkdirSync(dirname(file),{recursive:true});
    writeFileSync(file,JSON.stringify(report,null,2)+"\n");
    const checkpointFile=process.argv.find(arg=>arg.startsWith("--checkpoint="))?.slice(13);
    if(checkpointFile){
      mkdirSync(dirname(resolve(checkpointFile)),{recursive:true});
      writeFileSync(resolve(checkpointFile),JSON.stringify(report.gradeCheckpoint,null,2)+"\n");
    }
    console.log(JSON.stringify({stage:report.stage,mandatory:report.changedSinceLastPublishedCheckpoint,
      cumulativeGradeDrift:report.changedSinceDevelopmentCalibration,baseline:report.baselineSource,
      independent:report.independentProbabilityReview.length,automaticChanges:0}));
  }catch(error){console.error(String(error));process.exitCode=1;}
}