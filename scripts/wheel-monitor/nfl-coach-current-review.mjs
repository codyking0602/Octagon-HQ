#!/usr/bin/env node
// Staged read-only 32-club live NFL coaching evidence, independent of the
// static 2026 season guide. Does not alter curated identities or abilities.
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {NFL_COACH_TEAM_NAMES} from "./nfl-coach-source.mjs";
import {NFL_TEAM_SLUGS,coachTeamUrl,parseNflTeamCoach,
  summarizeLiveCoaches} from "./nfl-coach-current-source.mjs";
import {fetchWithRetry,readStructurallyValidatedHtml} from "./fetch-policy.mjs";

const output=resolve(process.argv.find(arg=>arg.startsWith("--out="))?.slice(6)
  ??"tmp/wheel-monitor/nfl/current-coaches.json");
const at=new Date().toISOString();
async function main(){
  const priorities=JSON.parse(readFileSync("data/generated/football/wheel-football-priorities.json","utf8"));
  const teams=priorities.teams;
  if(Object.keys(NFL_TEAM_SLUGS).length!==32 || Object.keys(teams).length!==32)
    throw new Error("NFL priority team census is incomplete");
  const expected={};
  for(const team of Object.keys(NFL_TEAM_SLUGS)){
    if(!NFL_COACH_TEAM_NAMES[team] || !teams[team] ||
      !Array.isArray(teams[team]["Head Coach"]) || teams[team]["Head Coach"].length!==1)
      throw new Error("Missing approved canonical head coach for "+team);
    expected[team]=teams[team]["Head Coach"][0];
  }
  const codes=Object.keys(NFL_TEAM_SLUGS);
  const observed=new Array(codes.length);let cursor=0;
  async function worker(){
    while(cursor<codes.length){
      const i=cursor++,team=codes[i],url=coachTeamUrl(team);
      let lastModified=null;
      try {
        const coach=await readStructurallyValidatedHtml(async()=>{
          const response=await fetchWithRetry(url,{headers:{Accept:"text/html"}});
          lastModified=response.headers.get("last-modified");
          return response.text();
        },html=>parseNflTeamCoach(html,team),2);
        observed[i]={team,coach,sourceUrl:url,lastModified};
      }catch(error){
        observed[i]={team,coach:null,sourceUrl:url,lastModified,
          error:String(error)};
      }
    }
  }
  await Promise.all(Array.from({length:4},worker));
  const report=summarizeLiveCoaches(observed,expected,at);
  report.source="current NFL.com team information pages";
  report.seasonalGuideRemainsIndependent=true;
  report.gradeChangesApplied=0;
  report.contractChangesApplied=0;
  report.coachAuthorityChangesApplied=0;
  report.coordinatedScheduleActivationAuthorized=false;
  mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify({status:report.status,approved:report.approved,
    matched:report.matched,freshPublication:report.livePublicationFreshnessVerified,
    unresolved:report.rows.filter(row=>!row.publicationFreshnessVerified)
      .map(row=>({team:row.team,status:row.sourceStatus,reason:row.reason})),
    authorityChanges:0}));
}
main().catch(error=>{
  mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,JSON.stringify({status:"source-collection-failed",
    observedAt:at,reason:String(error),authorityChanges:0},null,2)+"\n");
  console.error(String(error));process.exitCode=1;
});
