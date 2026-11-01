#!/usr/bin/env node
/**
 * Reproducible year-ONE signed-season-AVERAGE salary screen only. Not actual server-authoritative
 * three-season gameplay or a cap recommendation. No simulation of real
 * development/repricing, trades, releases, FA or championships.
 * Usage: node scripts/nba-gm-cap-screening.mjs
 */
import {readFileSync} from "node:fs";
function parseCsv(s){let out=[],row=[],v="",quoted=false;for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){v+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(v);v=""}else if(c==='\n'&&!quoted){row.push(v.replace(/\r$/,""));if(row.length>1)out.push(row);row=[];v=""}else v+=c}const[h,...r]=out;return r.map(arr=>Object.fromEntries(h.map((x,i)=>[x,arr[i]])))}
function pilot(board,src,N=160){
const sal=new Map(src.map(s=>[s.stable_game_id,s.provisional_game_salary_usd===""?NaN:Number(s.provisional_game_salary_usd)]));
const players=board.map(b=>({...b,salary:sal.get(b.editorialId)}));if(players.length!==330||players.some(x=>!Number.isSafeInteger(x.salary)))throw Error("Salary averaging incomplete: source-verified future seasons are missing. Refuse to screen a partial pool or silently fall back to first-year salaries.");
const roles=["PG","SG","SF","PF","C","GUARD","BIG"],caps=[155,165,175,185,195,205,220].map(x=>x*1e6);
const legal=(p,r)=>r==="GUARD"?p.candidatePositions.some(x=>["PG","SG"].includes(x)):r==="BIG"?p.candidatePositions.some(x=>["PF","C"].includes(x)):p.candidatePositions.includes(r);
const positionPools=roles.map(r=>players.filter(p=>legal(p,r)));
const cheapest=positionPools.map(x=>[...x].sort((a,b)=>a.salary-b.salary||a.editorialId.localeCompare(b.editorialId)));
const methods=["best","superstar","balanced","value","offense","defense","depth","random"];
const desirability=(p,m)=>{const s=p.skills,mil=p.salary/1e6;return m==="best"?p.overall:m==="superstar"?p.overall+(p.overall>=94?50:0):m==="balanced"?p.overall-mil*.6:m==="value"?p.overall/(3+mil):m==="offense"?.4*s.scoring+.35*s.shooting+.25*s.playmaking:m==="defense"?.6*s.perimeterDefense+.4*s.interiorDefense:m==="depth"?p.overall-mil*.9:0;};
const output=[];
for(let ci=0;ci<caps.length;ci++){const cap=caps[ci];let sum=0,success=0,spent=0,quality=0,candidateOffers=0,spins=0,multi=0,stars=0,empty=0;
for(let i=0;i<N;i++){let state=(0x87654321+(ci+1)*17919+(i+1)*9171)>>>0;const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
const strategy=methods[i%methods.length],owned=new Set(),selected=[];let salary=0,valid=true,spinOffers=0,spinCount=0;
for(let j=0;j<7;j++){
const candidatesAtSlot=positionPools[j].filter(p=>{
 if(owned.has(p.editorialId)||salary+p.salary>cap)return false;
 const reserved=new Set([...owned,p.editorialId]);let reserve=0;
 for(let k=j+1;k<7;k++){const cheap=cheapest[k].find(z=>!reserved.has(z.editorialId));if(!cheap)return false;reserve+=cheap.salary;reserved.add(cheap.editorialId)}
 return salary+p.salary+reserve<=cap
});
if(!candidatesAtSlot.length){valid=false;empty++;break}
const teamOptions=new Map;for(const p of candidatesAtSlot){const z=teamOptions.get(p.teamCode)||[];z.push(p);teamOptions.set(p.teamCode,z)}
const teams=[...teamOptions.keys()].sort(),chosenTeam=teams[Math.floor(rand()*teams.length)],offers=teamOptions.get(chosenTeam);
spinOffers+=offers.length;spinCount++;
let pick;if(strategy==="random")pick=offers[Math.floor(rand()*offers.length)];else{offers.sort((x,y)=>desirability(y,strategy)-desirability(x,strategy)||y.overall-x.overall||x.editorialId.localeCompare(y.editorialId));pick=offers[0]}
owned.add(pick.editorialId);selected.push(pick);salary+=pick.salary;
}
if(valid&&selected.length===7){success++;spent+=salary;const grades=selected.reduce((n,p,j)=>n+p.overall*(j<5?1:.55),0)/6.1;quality+=grades;const elite=selected.filter(p=>p.overall>=94).length;multi+=elite>=2?1:0;stars+=elite;}
spins+=spinCount;candidateOffers+=spinOffers;sum++;
}
output.push({cap:cap/1e6,attempts:sum,completed:success,draftCompletionPct:+(100*success/sum).toFixed(2),meanSalaryM:+(spent/success/1e6).toFixed(2),meanRoomM:+((cap-spent/success)/1e6).toFixed(2),meanRating:+(quality/success).toFixed(2),meanOffersPerSpin:+(candidateOffers/spins).toFixed(2),multipleElitePct:+(100*multi/success).toFixed(2),avgElites:+(stars/success).toFixed(2),emptyCandidateStates:empty});
}
return {kind:"PROVISIONAL AVERAGED SALARY / YEAR-ONE ONLY / NOT THREE-SEASON / NOT CAP RECOMMENDATION",simulations:caps.length*N,strategies:methods,results:output};
}
const board=JSON.parse(readFileSync("docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json","utf8")).players;
const salaryAudit=parseCsv(readFileSync("docs/nba-gm-three-season-salary-averages-2026-11-01.csv","utf8"));
console.log(JSON.stringify(pilot(board,salaryAudit,160),null,2));
