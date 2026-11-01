#!/usr/bin/env node
/**
 * Validate the private, PROVISIONAL Nov-2026 NBA GM salary-window audit.
 * Run: node scripts/nba-gm-average-audit-check.mjs
 * Do not claim 330/330 independent verification: this checks arithmetic,
 * identity coverage and fail-closed conditions, NOT external contracts.
 */
import {readFileSync} from "node:fs";
function parseCsv(s){
  const out=[];let row=[],part="",q=false;
  for(let i=0;i<s.length;i++){
    const c=s[i];
    if(c==='"'){if(q&&s[i+1]==='"'){part+='"';i++}else q=!q}
    else if(c===','&&!q){row.push(part);part=""}
    else if(c==='\n'&&!q){row.push(part.replace(/\r$/,""));if(row.length>1)out.push(row);row=[];part=""}
    else part+=c;
  }
  const[head,...values]=out;
  return values.map(items=>Object.fromEntries(head.map((key,i)=>[key,items[i]])));
}
const root="docs/";
const original=parseCsv(readFileSync(root+"nba-gm-contract-source-audit-2026-11-01.csv","utf8"));
const average=parseCsv(readFileSync(root+"nba-gm-contract-averages-2026-11-01.csv","utf8"));
const nfl=JSON.parse(readFileSync("data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json","utf8")).players;
const originalMap=new Map(original.map(p=>[p.stable_game_id,p]));
if(original.length!==330||average.length!==330||originalMap.size!==330)throw Error("Expected 330 distinct source players");
const ids=new Set,summary={complete:0,unresolved:0,oneYear:0,threeYear:0,averageSalaryDollars:0};
for(const r of average){
  if(ids.has(r.stable_game_id))throw Error("Duplicate average player "+r.stable_game_id);
  ids.add(r.stable_game_id);
  const prior=originalMap.get(r.stable_game_id);
  if(!prior||prior.player_name!==r.player_name||prior.game_team!==r.game_team||
    prior.proposed_contract!==r.game_term||
    prior.candidate_2026_27_salary_usd!==r.salary_2026_27_usd)
    throw Error("Changed identity, team, contract or first-year source for "+r.stable_game_id);
  const signedThrough=Number(r.signed_through_season.slice(0,4));
  if(!Number.isInteger(signedThrough)||signedThrough<2026)throw Error("Bad signed end");
  const years=Math.min(3,signedThrough-2025);
  if(Number(r.signed_seasons_in_game_window)!==years||
    (r.game_term==="3YR")!==(signedThrough>=2028))throw Error("Bad term/year window for "+r.player_name);
  summary[r.game_term==="3YR"?"threeYear":"oneYear"]++;
  const y1=Number(r.salary_2026_27_usd),y2=r.salary_2027_28_usd===""?null:Number(r.salary_2027_28_usd),y3=r.salary_2028_29_usd===""?null:Number(r.salary_2028_29_usd);
  const complete=r.average_game_salary_usd!=="";
  if(complete){
    if(years>=2&&(!Number.isSafeInteger(y2)||y2<=0))throw Error("Missing year 2 for "+r.player_name);
    if(years===3&&(!Number.isSafeInteger(y3)||y3<=0))throw Error("Missing year 3 for "+r.player_name);
    if(years<=1&&y2!==null||years<=2&&y3!==null)throw Error("Salary after signed game window for "+r.player_name);
    const avg=Math.round((y1+(y2||0)+(y3||0))/years);
    if(avg!==Number(r.average_game_salary_usd)||!Number.isSafeInteger(avg))
      throw Error("Incorrect signed-season average for "+r.player_name);
    if(r.average_status==="UNRESOLVED_FUTURE_SALARY")throw Error("Resolved row marked unresolved");
    summary.complete++;summary.averageSalaryDollars+=avg;
  }else{
    if(r.average_status!=="UNRESOLVED_FUTURE_SALARY"||years===1)
      throw Error("Incomplete three-season sourcing not correctly flagged for "+r.player_name);
    summary.unresolved++;
  }
}
const wemby=average.find(p=>p.player_name==="Victor Wembanyama");
if(wemby?.average_game_salary_usd!=="35782749"||wemby?.salary_2027_28_usd!=="43500000"||
  wemby?.salary_2028_29_usd!=="46980000")throw Error("Wembanyama extension not averaged correctly");
const active=nfl.filter(p=>p.currentRosterEligible!==false);
const nflOne=active.filter(p=>p.gameContract==="1YR").length,nflThree=active.filter(p=>p.gameContract==="3YR").length;
if(nflOne+nflThree!==active.length)throw Error("NFL term census incomplete");
if(summary.oneYear+summary.threeYear!==330||summary.complete+summary.unresolved!==330)
  throw Error("NBA term/average census incomplete");
console.log(JSON.stringify({
  kind:"PRIVATE STAGING ONLY - NEVER independently certified",
  nba:summary,
  nfl:{active:active.length,oneYear:nflOne,threeYear:nflThree,
    oneYearPct:Math.round(nflOne/active.length*1000)/10,
    threeYearPct:Math.round(nflThree/active.length*1000)/10},
  wembanyamaAverage:Number(wemby.average_game_salary_usd),
  sourceWarnings:"July 2026 future-year source still stale or incomplete; 72 no averaging data"
},null,2));
