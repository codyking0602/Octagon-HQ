#!/usr/bin/env node
/**
 * NBA GM 2026-27 source-audit completeness gate.
 * `node scripts/nba-gm-contract-coverage.mjs --strict` must pass before
 * any migration activates verified NBA salaries/contract terms.
 * This program NEVER changes production, saved franchises, or player fixtures.
 */
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const data=(p)=>readFileSync(resolve(ROOT,p),"utf8");
const auditPath="docs/nba-gm-contract-source-audit-2026-11-01.csv";
const board=JSON.parse(data("docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json")).players;
const fixture=data("supabase/migrations/202612310894_nba_gm_private_330_development_fixtures.sql");
const oldSalary=new Map([...fixture.matchAll(
  /\('(nba-gm-draft-[^']+)','(?:''|[^'])*','[A-Z]{3}',ARRAY\[[^\]]+\]::text\[\],\d+,'[^']+'::jsonb,ARRAY\[(\d+),(\d+),(\d+)\]::bigint\[\]/g
)].map(m=>[m[1],Number(m[2])]));
function parseCSV(text){
  const out=[];let row=[],value="",quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];
    if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++}else quoted=!quoted}
    else if(c===","&&!quoted){row.push(value);value=""}
    else if(c==="\n"&&!quoted){row.push(value.replace(/\r$/,""));if(row.length>1)out.push(row);row=[];value=""}
    else value+=c;
  }
  if(row.length||value)out.push([...row,value]);
  const [columns,...records]=out;
  return records.map((record,index)=>{
    if(record.length!==columns.length)throw Error("Invalid CSV width at row "+(index+2));
    return Object.fromEntries(columns.map((col,i)=>[col,record[i]]));
  });
}
const records=parseCSV(data(auditPath));
const errors=[],boardById=new Map(board.map(p=>[p.editorialId,p]));
if(board.length!==330||boardById.size!==330)errors.push("Source board is not 330 unique players");
if(oldSalary.size!==330)errors.push("Baseline SQL fixture is not 330 unique players");
if(records.length!==330)errors.push("Audit must contain exactly 330 rows");
const seen=new Set();
for(const row of records){
  if(seen.has(row.stable_game_id))errors.push("Duplicate ID "+row.stable_game_id);
  seen.add(row.stable_game_id);
  const b=boardById.get(row.stable_game_id);
  if(!b){errors.push("Unknown game ID "+row.stable_game_id);continue}
  if(row.player_name!==b.name||row.game_team!==b.teamCode)errors.push("Game identity/team mismatch "+b.editorialId);
  if(Number(row.original_salary_usd)!==oldSalary.get(b.editorialId))errors.push("Old SQL salary mismatch "+b.editorialId);
  const old=b.overall>=95||(b.overall>=81&&b.overall<=87)||b.overall<=78?"1YR":"3YR";
  if(row.original_contract!==old)errors.push("Old term mismatch "+b.editorialId);
  const start=Number(row.candidate_2026_27_salary_usd);
  if(!Number.isSafeInteger(start)||start<=0)errors.push("Missing or invalid 2026-27 candidate salary "+b.editorialId);
  if(row.real_contract_end_season){
    const m=/^(20\d\d)-(\d\d)$/.exec(row.real_contract_end_season);
    if(!m||Number(m[2])!==(Number(m[1])+1)%100)errors.push("Invalid end season "+b.editorialId);
    else if(row.proposed_contract!==(Number(m[1])>=2028?"3YR":"1YR"))
      errors.push("Wrong option-inclusive term "+b.editorialId);
  }else if(row.proposed_contract)errors.push("Term without expiry "+b.editorialId);
  if(!row.source_url||!/^https:\/\//.test(row.source_url))errors.push("Missing source "+b.editorialId);
  if(!row.verification_status)errors.push("Missing verification status "+b.editorialId);
}
// Owner-approved salary basis: average only the actually signed 2026-27 onward
// seasons inside NBA GM's three-season window. Unknown future salary is NOT zero.
const scheduleRecords=parseCSV(data("docs/nba-gm-three-season-salary-averages-2026-11-01.csv"));
const schedules=new Map(scheduleRecords.map(r=>[r.stable_game_id,r]));
if(scheduleRecords.length!==330||schedules.size!==330)
  errors.push("Three-season annualized source must cover exactly 330 unique identities");
let averagedComplete=0,scheduleVerified=0;
for(const row of records){
  const s=schedules.get(row.stable_game_id);
  if(!s){errors.push("No three-season salary schedule for "+row.stable_game_id);continue}
  if(s.player_name!==row.player_name||s.game_team!==row.game_team||
      s.game_contract!==row.proposed_contract||
      s.real_contract_end_season!==row.real_contract_end_season||
      Number(s.salary_2026_27_usd)!==Number(row.candidate_2026_27_salary_usd))
    errors.push("Schedule identity, term, or first-year mismatch "+row.stable_game_id);
  const expectedYears=Math.min(3,Math.max(1,Number(row.real_contract_end_season.slice(0,4))-2026+1));
  if(Number(s.seasons_to_average)!==expectedYears)
    errors.push("Wrong contracted averaging window "+row.stable_game_id);
  const annual=[s.salary_2026_27_usd,s.salary_2027_28_usd,s.salary_2028_29_usd]
    .slice(0,expectedYears).map(x=>x===""?NaN:Number(x));
  const complete=annual.every(v=>Number.isSafeInteger(v)&&v>0);
  const expected=complete?Math.round(annual.reduce((a,b)=>a+b,0)/expectedYears):null;
  if(complete)averagedComplete++;
  if(s.provisional_game_salary_usd!== (expected===null?"":String(expected)))
    errors.push("Wrong annualized salary or missing year treated as zero "+row.stable_game_id);
  if(s.independently_verified==="true")scheduleVerified++;
  if(!/^https:\/\//.test(s.schedule_source_url))
    errors.push("Unattributed contract schedule "+row.stable_game_id);
}
const nfl=JSON.parse(data("data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json"));
const nflCounts={oneYear:nfl.players.filter(p=>p.gameContract==="1YR").length,
 threeYear:nfl.players.filter(p=>p.gameContract==="3YR").length};
if(nflCounts.oneYear+nflCounts.threeYear!==nfl.players.length)
  errors.push("NFL source includes unidentified game terms");

const verified=records.filter(r=>r.verification_status==="VERIFIED_INDEPENDENT"&&r.proposed_contract);
const byStatus=Object.fromEntries([...new Set(records.map(r=>r.verification_status))].sort().map(
  k=>[k,records.filter(r=>r.verification_status===k).length]));
const report={
  auditedRows:records.length,sourceSalaryCandidates:records.filter(r=>r.candidate_2026_27_salary_usd).length,
  resolvedTerms:records.filter(r=>r.proposed_contract).length,
  independentlyVerifiedRecords:verified.length,verificationStatuses:byStatus,
  originalTermCounts:{oneYear:records.filter(r=>r.original_contract==="1YR").length,
    threeYear:records.filter(r=>r.original_contract==="3YR").length},
  proposedResolvedTermCounts:{oneYear:records.filter(r=>r.proposed_contract==="1YR").length,
    threeYear:records.filter(r=>r.proposed_contract==="3YR").length},
  nflGameContracts:{players:nfl.players.length,...nflCounts,
    oneYearPct:Number((100*nflCounts.oneYear/nfl.players.length).toFixed(1)),
    threeYearPct:Number((100*nflCounts.threeYear/nfl.players.length).toFixed(1))},
  nbaAveraging:{players:scheduleRecords.length,complete:averagedComplete,
    missingScheduledSalaries:scheduleRecords.length-averagedComplete,
    independentlyVerified:scheduleVerified},
  structuralErrors:errors,
  economyActivationReady:errors.length===0&&verified.length===330&&averagedComplete===330&&scheduleVerified===330
};
console.log(JSON.stringify(report,null,2));
if(errors.length||process.argv.includes("--strict")&&!report.economyActivationReady)process.exitCode=1;
