#!/usr/bin/env node
// Official EA Madden NFL 27 ratings: frozen baseline and weekly review flags.
// NFL only. Never writes a Wheel/GM grade or publishes a rating.
import {readFileSync, existsSync, mkdirSync, writeFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {pathToFileURL} from "node:url";
const EA="https://www.ea.com/games/madden-nfl/ratings";
export const OVERALL_DELTA=3;
export const ATTRIBUTE_DELTA=5;
export const KEY_ATTRIBUTES=Object.freeze([
  "speed","acceleration","strength","agility","changeOfDirection","awareness",
  "catching","breakTackle","carrying","shortRouteRunning","mediumRouteRunning",
  "deepRouteRunning","throwPower","throwAccuracyShort","throwAccuracyMid",
  "throwAccuracyDeep","throwUnderPressure","manCoverage","zoneCoverage",
  "playRecognition","blockShedding","tackle","passBlock","runBlock"
]);
const valued=x=>x===null||x===undefined||x===""?null:
  Number.isFinite(Number(x))?Number(x):null;
export function canonicalize(players,observedAt){
  if(!Array.isArray(players) || players.length<1700) throw new Error("EA Madden population is incomplete");
  const keys=new Set();
  const data=players.map(row=>{
    const id=String(row.id??"").trim();
    if(!id || keys.has(id)) throw new Error("Duplicate/missing Madden player ID "+id);
    keys.add(id);
    const attributes={};
    for(const key of KEY_ATTRIBUTES) attributes[key]=valued(row.stats?.[key]?.value);
    return {id,name:[row.firstName,row.lastName].filter(Boolean).join(" ").trim(),
      team:String(row.team?.label??""),position:String(row.position?.id??""),
      overall:valued(row.overallRating),attributes};
  });
  if(data.some(row=>!row.name||row.overall===null||row.overall<0||row.overall>99))
    throw new Error("EA Madden ratings contain missing/invalid identity or grade");
  return {source:EA,edition:"Madden NFL 27",observedAt,playerCount:data.length,players:data};
}
export function compareMadden(baseline,current){
  if(baseline?.source!==EA||current?.source!==EA ||
    baseline.edition!=="Madden NFL 27"||current.edition!=="Madden NFL 27" ||
    !Array.isArray(baseline.players)||!Array.isArray(current.players) ||
    baseline.players.length<1700||current.players.length<1700)
    throw new Error("Madden baseline/current census or edition invalid");
  const prior=new Map(baseline.players.map(row=>[row.id,row]));
  const now=new Map(current.players.map(row=>[row.id,row]));
  if(prior.size!==baseline.players.length||now.size!==current.players.length)
    throw new Error("Duplicate Madden player IDs in snapshot");
  const flags=[],rosterHints=[],missing=[];
  for(const row of current.players){
    const old=prior.get(row.id);
    if(!old) continue; // Newly listed Madden players require separate identity review.
    const overallDelta=row.overall-old.overall;
    const attributeDeltas=Object.entries(row.attributes).flatMap(([key,value])=>{
      const previous=old.attributes?.[key];
      return typeof previous==="number"&&typeof value==="number"
        &&Math.abs(value-previous)>=ATTRIBUTE_DELTA
        ? [{attribute:key,from:previous,to:value,delta:value-previous}]:[];
    });
    if(Math.abs(overallDelta)>=OVERALL_DELTA||attributeDeltas.length)
      flags.push({id:row.id,name:row.name,team:row.team,position:row.position,
        overallBefore:old.overall,overallNow:row.overall,overallDelta,
        attributeDeltas,decision:"HQ-editorial-review-required"});
    if(old.team&&row.team&&old.team!==row.team)
      rosterHints.push({id:row.id,name:row.name,fromTeam:old.team,toTeam:row.team,
        decision:"verify-NFL-transaction-before-roster-change"});
  }
  for(const old of baseline.players) if(!now.has(old.id)) missing.push(old.id);
  return {sport:"NFL",source:EA,baselineObservedAt:baseline.observedAt,
    currentObservedAt:current.observedAt,thresholds:{overall:OVERALL_DELTA,
      keyAttribute:ATTRIBUTE_DELTA},baselineCount:baseline.playerCount,
    currentCount:current.playerCount,flags,rosterHints,
    newIds:current.players.filter(row=>!prior.has(row.id)).map(row=>row.id),
    missingIds:missing,gradeChangesApplied:0,contractChangesApplied:0};
}

const normName=value=>String(value??"").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"")
  .replace(/(?:iii|ii|iv|jr|sr|v)$/,"");
export function flagDevelopmentProfiles(profiles,maddenFlags){
  if(!Array.isArray(profiles)||!Array.isArray(maddenFlags))throw new Error("Missing development profiles or Madden flags");
  const byIdentity=new Map(profiles.map(row=>[row.team+"|"+normName(row.name),row]));
  const teamNames={ARI:"Arizona Cardinals",ATL:"Atlanta Falcons",BAL:"Baltimore Ravens",BUF:"Buffalo Bills",
    CAR:"Carolina Panthers",CHI:"Chicago Bears",CIN:"Cincinnati Bengals",CLE:"Cleveland Browns",
    DAL:"Dallas Cowboys",DEN:"Denver Broncos",DET:"Detroit Lions",GB:"Green Bay Packers",
    HOU:"Houston Texans",IND:"Indianapolis Colts",JAX:"Jacksonville Jaguars",KC:"Kansas City Chiefs",
    LAC:"Los Angeles Chargers",LAR:"Los Angeles Rams",LV:"Las Vegas Raiders",MIA:"Miami Dolphins",
    MIN:"Minnesota Vikings",NE:"New England Patriots",NO:"New Orleans Saints",NYG:"New York Giants",
    NYJ:"New York Jets",PHI:"Philadelphia Eagles",PIT:"Pittsburgh Steelers",SEA:"Seattle Seahawks",
    SF:"San Francisco 49ers",TB:"Tampa Bay Buccaneers",TEN:"Tennessee Titans",WSH:"Washington Commanders"};
  const code=new Map(Object.entries(teamNames).map(([key,value])=>[value,key]));
  const maddenChangeIds=new Set();
  const noMatch=[];
  const results=[];
  for(const flag of maddenFlags){
    const row=byIdentity.get(code.get(flag.team)+"|"+normName(flag.name));
    if(row){maddenChangeIds.add(row.id);}else noMatch.push(flag.name+" ("+flag.team+")");
  }
  for(const row of profiles){
    const reasons=[];
    const age=Number(row.ageAtCalibration), breakout=Number(row.breakoutPct), improve=Number(row.improvePct);
    const riskAge=row.family==="QB"?35:row.family==="RB"?29:row.family==="WR"||row.family==="TE"?31:33;
    if(age>=riskAge && breakout+improve>=35)reasons.push("aging-player-high-upside-odds");
    if(maddenChangeIds.has(row.id)){
      reasons.push("madden-material-rating-change");
      if(age<=25 && breakout<=10)reasons.push("young-breakout-low-progression-probability");
    }
    if(reasons.length)results.push({id:row.id,name:row.name,team:row.team,age,
      breakoutPct:breakout,improvePct:improve,reasons,action:"editorial-review-not-auto-adjust"});
  }
  return {candidates:results,unmatchedMaddenFlags:noMatch,gmSimulationEvidence:"not-available-in-this-read-only-run"};
}
async function getText(url){
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 (compatible; OctagonHQ-NFLRatingsReview/1.0)","Accept":"text/html,application/json"} ,signal:AbortSignal.timeout(18000)});
      if(!response.ok)throw new Error("EA HTTP "+response.status);
      return await response.text();
    }catch(error){if(attempt===2)throw error;await new Promise(r=>setTimeout(r,1000*(attempt+1)));}
  }
}
async function collect(){
  const html=await getText(EA);
  const id=html.match(/\/_next\/static\/([^/]+)\/_buildManifest\.js/)?.[1];
  if(!id)throw new Error("EA Next.js build ID unavailable; never substitute stale ratings");
  const base="https://www.ea.com/_next/data/"+id+"/games/madden-nfl/ratings.json?page=";
  const first=JSON.parse(await getText(base+"1")).pageProps?.ratingDetails;
  if(!first?.items || !Number.isInteger(first.totalItems))
    throw new Error("EA Madden official dataset structure changed");
  const pages=Math.ceil(first.totalItems/100);
  if(pages<17||pages>40)throw new Error("Madden pagination count failed census gate");
  const all=[...first.items];
  for(let page=2;page<=pages;page++){
    const detail=JSON.parse(await getText(base+page)).pageProps?.ratingDetails;
    if(!Array.isArray(detail?.items))throw new Error("Missing EA Madden page "+page);
    all.push(...detail.items);
  }
  return canonicalize(all,new Date().toISOString());
}
async function main(){
  const args=Object.fromEntries(process.argv.slice(2).map(x=>x.replace(/^--/,"").split("=")));
  const baselinePath=resolve(args.baseline??"tmp/wheel-monitor/madden/baseline.json");
  const output=resolve(args.out??"tmp/wheel-monitor/madden/review.json");
  const current=await collect();
  const hadBaseline=existsSync(baselinePath);
  const baseline=hadBaseline?JSON.parse(readFileSync(baselinePath,"utf8")):current;
  const report=compareMadden(baseline,current);
  report.baselineCreated=!hadBaseline;
  const profiles=JSON.parse(readFileSync(
    "data/curated/football/gm-nfl-development-profiles-2026-10-07.json","utf8")).profiles;
  if(profiles.length!==594)throw new Error("GM development profile census incomplete");
  report.developmentReview=flagDevelopmentProfiles(profiles,report.flags);
  mkdirSync(dirname(baselinePath),{recursive:true});
  mkdirSync(dirname(output),{recursive:true});
  if(!hadBaseline)writeFileSync(baselinePath,JSON.stringify(baseline,null,2)+"\n");
  writeFileSync(output,JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify({baselineCreated:!hadBaseline,compared:report.currentCount,
    reviewFlags:report.flags.length,rosterHints:report.rosterHints.length}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)
  main().catch(error=>{console.error(String(error));process.exitCode=1;});
