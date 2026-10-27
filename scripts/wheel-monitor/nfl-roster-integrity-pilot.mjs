#!/usr/bin/env node
// NFL-only roster integrity evidence. Source absence is never a confirmed transaction.
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
const norm=s=>String(s??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
 .replace(/[^a-z0-9]/g,"").replace(/(?:iii|ii|iv|jr|sr|v)$/,"");
const TEAM_CODES="ARI ATL BAL BUF CAR CHI CIN CLE DAL DEN DET GB HOU IND JAX KC LAC LAR LV MIA MIN NE NO NYG NYJ PHI PIT SEA SF TB TEN WSH".split(" ");
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith("--")).map(x=>x.slice(2).split("=")));
const output=resolve(args.out??"tmp/wheel-monitor/nfl/roster-integrity.json");
async function collect(team){
  const url="https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/"+team.toLowerCase()+"/roster";
  const result=await fetch(url,{signal:AbortSignal.timeout(14000)});
  if(!result.ok)throw new Error("ESPN "+team+" HTTP "+result.status);
  const body=await result.json(),groups=body.athletes??[];
  const list=groups.flatMap(group=>Array.isArray(group.items)?group.items:[]);
  if(list.length<20)throw new Error("ESPN "+team+" incomplete roster: "+list.length);
  return {team,url,players:list.filter(p=>p.id&&(p.displayName||p.fullName)).map(p=>({
    id:String(p.id),name:p.displayName??p.fullName,role:p.position?.abbreviation??null,
    status:p.status?.type??p.status?.name??null}))};
}
async function run(){
  const start=Date.now();
  const contract=JSON.parse(readFileSync("data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json","utf8"));
  if(contract.players?.length!==594)throw new Error("Expected 594 NFL GM players");
  const collected=await Promise.allSettled(TEAM_CODES.map(collect));
  const good=collected.filter(x=>x.status==="fulfilled").map(x=>x.value);
  const gaps=collected.flatMap((x,i)=>x.status==="rejected"?[{team:TEAM_CODES[i],reason:String(x.reason)}]:[]);
  const byTeam=new Map(good.map(r=>[r.team,r])),byName=new Map();
  for(const r of good)for(const player of r.players){
    const key=norm(player.name),a=byName.get(key)??[];a.push({...player,team:r.team});byName.set(key,a);
  }
  const rows=contract.players.map(p=>{
    const own=byTeam.get(p.team)?.players.filter(x=>norm(x.name)===norm(p.player))??[];
    const anywhere=(byName.get(norm(p.player))??[]).filter(x=>x.team!==p.team);
    let status="matched";
    if(!byTeam.has(p.team))status="source-unavailable";
    else if(own.length>1)status="ambiguous-identity";
    else if(!own.length)status=anywhere.length===1?"potential-team-transfer":"missing-from-listed-team";
    return {team:p.team,player:p.player,family:p.family,sourceOtcId:p.source?.otcId??null,
      status,sourceEspnId:own.length===1?own[0].id:null,
      rosterStatus:own.length===1?own[0].status:null,
      proposedTeam:status==="potential-team-transfer"?anywhere[0].team:null,
      proposedEspnId:status==="potential-team-transfer"?anywhere[0].id:null,
      verifiedTransfer:false,action:status==="matched"?"none":"verify-independent-transaction"};
  });
  const counts=Object.fromEntries([...new Set(rows.map(x=>x.status))].map(k=>[k,rows.filter(x=>x.status===k).length]));
  const report={schema:1,status:gaps.length?"source-coverage-incomplete":"read-only-roster-screen",
    observedAt:new Date().toISOString(),durationMs:Date.now()-start,source:"ESPN NFL 32 team rosters",
    playerPopulation:594,sourceTeams:good.length,sourceGaps:gaps,summary:counts,
    exceptions:rows.filter(x=>x.status!=="matched"),confirmedChanges:[],
    note:"Name/team exceptions are NOT verified transactions; never update canonical identity without stable IDs and official confirmation.",
    changesApplied:0};
  mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify({status:report.status,teams:good.length,summary:counts}));
}
run().catch(error=>{mkdirSync(dirname(output),{recursive:true});
 writeFileSync(output,JSON.stringify({status:"source-collection-failed",error:String(error),changesApplied:0})+"\n");
 console.error(error);process.exitCode=1});
