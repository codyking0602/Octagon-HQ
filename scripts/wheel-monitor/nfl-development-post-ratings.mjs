#!/usr/bin/env node
// Stage 2 only. Review NFL development AFTER owner-approved HQ ratings are
// published; never automatically edit development probabilities or ratings.
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {pathToFileURL} from "node:url";
import {flagDevelopmentProfiles} from "./nfl-madden-review.mjs";

export function buildPostRatingReview(profiles,grades,contracts,at){
  if(profiles.length!==594||grades.length!==594||contracts.length!==594)
    throw new Error("Canonical 594-player NFL identity census required for post-rating review");
  const screen=flagDevelopmentProfiles(profiles,[],grades,contracts,[]);
  const normalized=s=>String(s??"").normalize("NFKD")
    .replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"")
    .replace(/(?:iii|ii|iv|jr|sr|v)$/,"");
  const gradeMap=new Map(grades.map(row=>[row.team+"|"+row.family+"|"+normalized(row.player),row]));
  const calibration=new Map(profiles.map(row=>[row.team+"|"+row.family+"|"+normalized(row.name),row]));
  if(gradeMap.size!==594||calibration.size!==594)
    throw new Error("Duplicate or ambiguous canonical NFL player identity");
  const gradeChanges=[];
  for(const [key,row] of calibration){
    const current=gradeMap.get(key);
    if(!current||!Number.isFinite(Number(current.grade))||!Number.isFinite(Number(row.gradeAtCalibration)))
      throw new Error("Missing grade mapping for "+key);
    if(Number(current.grade)!==Number(row.gradeAtCalibration))
      gradeChanges.push({id:row.id,name:row.name,team:row.team,family:row.family,
        calibrationGrade:Number(row.gradeAtCalibration),approvedHqGrade:Number(current.grade),
        developmentAction:"reevaluate-probabilities-after-approved-rating-change",
        decision:"pending-editorial-review"});
  }
  return {schema:1,stage:"post-owner-rating-decisions",sport:"NFL",observedAt:at,
    eligiblePlayers:594,changedSinceDevelopmentCalibration:gradeChanges.length,
    mandatoryDevelopmentReevaluations:gradeChanges,
    independentProbabilityReview:screen.candidates.filter(c=>c.reasons.some(reason=>
      reason==="aging-player-low-decline-probability"||
      reason==="early-career-progression-risk-outlier")),
    note:"All approved grade changes trigger reevaluation. An unchanged grade does not. Independent age/early-career risk can still be reviewed. Editorial approval required before any development probability changes.",
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
    const report=buildPostRatingReview(...Object.values(loadFromAuthority()),new Date().toISOString());
    const file=resolve(out);mkdirSync(dirname(file),{recursive:true});
    writeFileSync(file,JSON.stringify(report,null,2)+"\n");
    console.log(JSON.stringify({stage:report.stage,mandatory:report.changedSinceDevelopmentCalibration,
      independent:report.independentProbabilityReview.length,automaticChanges:0}));
  }catch(error){console.error(String(error));process.exitCode=1;}
}