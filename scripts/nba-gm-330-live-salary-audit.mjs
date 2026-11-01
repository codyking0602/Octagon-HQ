#!/usr/bin/env node
/** NBA GM real signed salary-window research checks. No game writes. */
import {readFileSync} from "node:fs";
function csv(s){const out=[],r=[];let v="",quoted=false;for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){v+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){r.push(v);v=""}else if(c==='\n'&&!quoted){r.push(v.replace(/\r$/,""));if(r.length>1)out.push([...r]);r.length=0;v=""}else v+=c}const [h,...body]=out;return body.map(row=>Object.fromEntries(h.map((key,i)=>[key,row[i]])))}
const src=csv(readFileSync("docs/nba-gm-330-current-bref-reconciled-2026-11-01.csv","utf8"));
const old=csv(readFileSync("docs/nba-gm-contract-source-audit-2026-11-01.csv","utf8"));
if(src.length!==330||old.length!==330||new Set(src.map(p=>p.stable_game_id)).size!==330)throw Error("NBA player population != 330");
const original=new Map(old.map(p=>[p.stable_game_id,p]));
const summary={total:330,oneYear:0,threeYear:0,missing:0,unverified:0,averageTotal:0,firstYearDifferences:0,termChanges:0};
for(const p of src){
 const prior=original.get(p.stable_game_id);
 if(!prior||prior.player_name!==p.player_name||prior.game_team!==p.game_team)throw Error("Identity/team changed: "+p.stable_game_id);
 if(p.game_contract!=="1YR"&&p.game_contract!=="3YR")throw Error("Invalid game term "+p.player_name);
 const years=Math.min(3,Number(p.actual_signed_end_season.slice(0,4))-2026+1);
 if(![1,2,3].includes(years)||Number(p.game_window_seasons)!==years||
   p.game_contract!==(years===3?"3YR":"1YR"))throw Error("Signed end/game term mismatch "+p.player_name);
 const signed=[p.real_salary_2026_27_usd,p.real_salary_2027_28_usd,p.real_salary_2028_29_usd].slice(0,years).map(Number);
 if(signed.some(x=>!Number.isSafeInteger(x)||x<=0)||p.proposed_average_salary_usd==="")throw Error("Missing real salary "+p.player_name);
 const average=Math.round(signed.reduce((a,b)=>a+b,0)/years);
 if(average!==Number(p.proposed_average_salary_usd))throw Error("Wrong average "+p.player_name);
 if(p.independently_verified!=="true")summary.unverified++;
 if(!p.salary_schedule_source.startsWith("https://"))throw Error("Missing provenance "+p.player_name);
 summary[p.game_contract==="3YR"?"threeYear":"oneYear"]++;
 summary.averageTotal+=average;
 if(Number(prior.candidate_2026_27_salary_usd)!==signed[0])summary.firstYearDifferences++;
 if(prior.proposed_contract!==p.game_contract)summary.termChanges++;
}
const w=src.find(p=>p.player_name==="Victor Wembanyama");
if(!w||Number(w.proposed_average_salary_usd)!==35782749||w.game_contract!=="3YR")throw Error("Wembanyama extension averaging mismatch");
console.log(JSON.stringify(summary,null,2));
if(process.argv.includes("--strict")&&summary.unverified>0)process.exitCode=2;
