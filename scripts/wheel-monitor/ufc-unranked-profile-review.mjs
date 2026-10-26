#!/usr/bin/env node
// Isolated read-only official UFC athlete profile fact scan. Never grades,
// changes eligibility, edits the current ranking table or certifies the whole
// UFC population from the availability of a historical athlete web page.
import {mkdirSync,writeFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {athleteSlug,readOfficialAthleteProfile,summarizeOfficialProfiles} from "./ufc-profile-policy.mjs";
import {fetchWithRetry} from "./fetch-policy.mjs";
const at=new Date().toISOString();
const out=resolve(process.argv.find(x=>x.startsWith("--out="))?.slice(6)||
  "tmp/wheel-monitor/ufc/unranked-profiles.json");
const project=process.env.SUPABASE_PROJECT_ID??"rvbspcjvebgwqzssayts";
const token=process.env.SUPABASE_ACCESS_TOKEN;
const sourceSql="select fighter_id, display_name, division, ranking, is_champion "+
  "from private.wheel_ufc_fighters "+
  "where active = true and ranking is null and is_champion = false "+
  "order by division, fighter_id";
try {
  if(!token)throw new Error("SUPABASE_ACCESS_TOKEN required for complete live UFC census");
  const response=await fetchWithRetry(
    "https://api.supabase.com/v1/projects/"+encodeURIComponent(project)+"/database/query",{
      method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},
      body:JSON.stringify({query:sourceSql}),
    });
  const population=await response.json();
  if(!Array.isArray(population)||population.length<1||population.length>170)
    throw new Error("Invalid or missing live active-unranked UFC source population");
  const keys=new Set(population.map(x=>String(x.division)+"|"+String(x.fighter_id)));
  if(keys.size!==population.length)throw new Error("Duplicate fighter/division identities");
  const results=new Array(population.length);let cursor=0;
  async function worker(){
    while(cursor<population.length){
      const index=cursor++,row=population[index];
      const url="https://www.ufc.com/athlete/"+athleteSlug(row.display_name);
      let profile;
      try {
        const response=await fetchWithRetry(url,{headers:{Accept:"text/html"}});
        const html=await response.text();
        profile=readOfficialAthleteProfile(html,row.display_name);
      }catch(error){
        profile={status:"request-failed",designation:null,observedName:null,
          reason:String(error)};
      }
      results[index]={
        fighterId:row.fighter_id,name:row.display_name,division:row.division,
        sourceUrl:url,observedAt:at,...profile,
        // Status by itself does not prove contract, eligibility or ability.
        contractStatusCertified:false,abilityRatingChanged:false,
      };
    }
  }
  // Modest concurrency; never repeatedly scrape the whole fighter universe.
  await Promise.all(Array.from({length:3},worker));
  const summary=summarizeOfficialProfiles(results);
  const report={schema:1,status:summary.unresolved||summary.officialNotFighting
    ?"source-review-required":"official-profile-observed-not-independent-certified",
    observedAt:at,source:"official UFC athlete pages",
    sourceCoverage:"active-unranked-current-DB",summary,rows:results,
    gradeChangesApplied:0,rankingChangesApplied:0,populationChangesApplied:0,
    fullUfcCertification:false,
    guidance:"Official athlete pages may be retained after roster exit; verify active status and division independently before changing eligibility or authority.",
  };
  mkdirSync(dirname(out),{recursive:true});
  writeFileSync(out,JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify({status:report.status,summary,notFighting:results
    .filter(x=>x.status==="official-not-fighting-designation")
    .map(x=>({name:x.name,division:x.division,url:x.sourceUrl})),
    unresolvedProfiles:results.filter(x=>!["official-active-designation",
      "official-not-fighting-designation"].includes(x.status))
      .map(x=>({name:x.name,division:x.division,status:x.status,url:x.sourceUrl}))}));
}catch(error){
  mkdirSync(dirname(out),{recursive:true});
  writeFileSync(out,JSON.stringify({status:"source-review-failed",observedAt:at,
    reason:String(error),gradeChangesApplied:0},null,2)+"\n");
  console.error(String(error));process.exitCode=1;
}
