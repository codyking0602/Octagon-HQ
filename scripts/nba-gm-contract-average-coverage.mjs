#!/usr/bin/env node
/**
 * Owner-only research artifact: validate real three-season salary averages.
 * 1YR means a one-year GAME agreement, not a one-year signed NBA agreement.
 * Salaries are averaged over the signed seasons inside 2026-27..2028-29.
 * Incomplete schedules remain missing; do not manufacture estimates.
 * --strict fails until every one of the 330 schedules is complete.
 */
import {readFileSync} from "node:fs";

function parseCsv(input) {
  const records=[],row=[];let value="",quoted=false;
  for(let i=0;i<input.length;i++){
    const ch=input[i];
    if(ch==='"'){
      if(quoted && input[i+1]==='"'){value+='"';i++}
      else quoted=!quoted;
    }else if(ch===','&&!quoted){row.push(value);value=""}
    else if(ch===String.fromCharCode(10)&&!quoted){
      row.push(value.replace(/\\r$/,""));
      if(row.length>1)records.push([...row]);
      row.length=0;value="";
    }else value+=ch;
  }
  const [headers,...body]=records;
  return body.map(columns=>Object.fromEntries(headers.map((key,i)=>[key,columns[i]])));
}

const rows=parseCsv(readFileSync("docs/nba-gm-contract-window-averages-2026-11-01.csv","utf8"));
const terms={"1YR":0,"3YR":0};
if(rows.length!==330 || new Set(rows.map(r=>r.stable_game_id)).size!==330){
  throw Error("Expected exactly 330 unique NBA GM player IDs");
}
const unresolved=[];
for(const r of rows){
  if(!(r.game_contract in terms))throw Error("Invalid game term: "+r.player_name);
  terms[r.game_contract]++;
  const finalYear=Number(r.signed_expiry.slice(0,4));
  const numberOfSeasons=Math.min(3,finalYear-2026+1);
  if(r.game_contract!==(finalYear>=2028?"3YR":"1YR")){
    throw Error("Contract expiration/term disagreement: "+r.player_name);
  }
  if(Number(r.window_seasons)!==numberOfSeasons||numberOfSeasons<1){
    throw Error("Window duration disagreement: "+r.player_name);
  }
  const amounts=[r.salary_2026_27_usd,r.salary_2027_28_usd,r.salary_2028_29_usd]
    .slice(0,numberOfSeasons).map(x=>x===""?null:Number(x));
  const complete=amounts.every(n=>Number.isSafeInteger(n)&&n>0);
  if(!complete){
    if(r.annual_average_usd!=="")throw Error("Incomplete salary but average populated: "+r.player_name);
    unresolved.push(r.player_name);
    continue;
  }
  const annualAverage=Math.round(amounts.reduce((a,b)=>a+b,0)/numberOfSeasons);
  if(annualAverage!==Number(r.annual_average_usd)){
    throw Error("Incorrect annual average: "+r.player_name);
  }
}
const victor=rows.find(r=>r.player_name==="Victor Wembanyama");
if(!victor||Number(victor.annual_average_usd)!==35782749){
  throw Error("Wembanyama window average should equal $35,782,749");
}
const result={total:330,terms,complete:330-unresolved.length,missing:unresolved.length,unresolved};
console.log(JSON.stringify(result,null,2));
if(process.argv.includes("--strict") && unresolved.length)process.exitCode=2;
