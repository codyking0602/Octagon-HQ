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
  structuralErrors:errors,
  economyActivationReady:errors.length===0&&verified.length===330
};
console.log(JSON.stringify(report,null,2));
if(errors.length||process.argv.includes("--strict")&&!report.economyActivationReady)process.exitCode=1;
