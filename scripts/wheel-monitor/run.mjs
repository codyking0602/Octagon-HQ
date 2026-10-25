#!/usr/bin/env node
// Read-only, staged evidence collector. Never mutates ratings, rankings or contracts.
// The GitHub Actions job must publish a snapshot ONLY after all required sources passed.
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { JSDOM } from "jsdom";
import {
  DIVISIONS, NFL_CODES, assert, nameKey, identity, validateCatalog, validateFlex,
  compareEvidence, summarizeDecisions,
} from "./core.mjs";

const root = resolve(import.meta.dirname, "../..");
const repoRead = p => readFileSync(resolve(root, p), "utf8");
const readJson = p => JSON.parse(repoRead(p));
const cli = Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith("--"))
  .map(x=>{const [k,...v]=x.slice(2).split("=");return [k,v.join("=")];}));
const outputDir = resolve(cli.out ?? "tmp/wheel-monitor");
const at = new Date().toISOString();
const project = process.env.SUPABASE_PROJECT_ID || "rvbspcjvebgwqzssayts";
const sqlToken = process.env.SUPABASE_ACCESS_TOKEN;
const errors = [];
const evidence = [];

function record(type, message, source, extra = {}) {
  evidence.push({type, message, source, checkedAt:at, ...extra});
}
async function fetchWithRetry(url, options = {}, attempts = 3) {
  let last;
  for (let i=0;i<attempts;i++) {
    const ctl = new AbortController();
    const timeout = setTimeout(()=>ctl.abort(), 15000);
    try {
      const r = await fetch(url, { ...options, signal:ctl.signal,
        headers:{ "User-Agent":"OctagonHQ-WheelMonitor/3.0 (read-only)",
          Accept:"application/json,text/html", ...options.headers }});
      if (!r.ok) {
        last = new Error(url + " returned HTTP " + r.status);
        if (![429,500,502,503,504].includes(r.status)) throw last;
      } else return r;
    } catch (e) { last=e; if (i===attempts-1) break; }
    finally { clearTimeout(timeout); }
    if (i<attempts-1) await new Promise(ok=>setTimeout(ok, 500*(i+1)));
  }
  throw last ?? new Error("Source not available: " + url);
}
async function sql(query) {
  assert(sqlToken, "SUPABASE_ACCESS_TOKEN is required for live, complete coverage");
  const url = "https://api.supabase.com/v1/projects/" + encodeURIComponent(project) + "/database/query";
  const r = await fetchWithRetry(url, { method:"POST", headers:{
    Authorization:"Bearer " + sqlToken, "Content-Type":"application/json",
  }, body:JSON.stringify({query}) });
  const value = await r.json();
  assert(Array.isArray(value), "Supabase management query did not return a row array");
  return value;
}
function footballCatalog() {
  const files = readdirSync(resolve(root, "data/generated/football")).filter(f=>
    /^wheel-nfl-(qb|rb|wr|te|front-seven|secondary|head-coach)-grades-\d{4}-\d{2}-\d{2}\.json$/.test(f));
  const families = {qb:"QB",rb:"RB",wr:"WR",te:"TE",
    "front-seven":"Front Seven",secondary:"Secondary","head-coach":"Head Coach"};
  const byFamily = new Map();
  for (const file of files.sort()) {
    const family = file.match(/^wheel-nfl-(.+)-grades-/)[1];
    byFamily.set(family,file); // latest dated existing artifact
  }
  assert(byFamily.size===7, "Missing NFL Wheel grade family artifact");
  const nfl = [];
  for (const [slug, file] of byFamily) {
    for (const row of readJson("data/generated/football/"+file).grades) {
      nfl.push({ sport:"nfl", team:row.team, family:families[slug],
        name:row.player??row.coach, grade:row.grade });
    }
  }
  return nfl;
}
function priorityTeams() {
  const nfl=readJson("data/generated/football/wheel-football-priorities.json").teams;
  const cfb=readJson("data/generated/football/cfb/wheel-football-current-priorities-2026.json").teams;
  const extras=readdirSync(resolve(root,"data/curated/football/cfb"))
    .filter(file=>/^wheel-football-.+-grading-audit-\d{4}-\d\d-\d\d\.json$/.test(file))
    .map(file=>readJson("data/curated/football/cfb/"+file))
    .filter(row=>row.status==="audit-locked-runtime" && row.auditResult?.result==="passed");
  const teamInfo = Object.fromEntries(Object.entries(cfb).map(([key,t])=>[key, {name:t.school,id:String(t.espnId),buckets:t}]));
  for (const extra of extras) {
    assert(extra.auditResult?.priorityAndGradeStatus==="locked"
      && extra.eaDiscrepancyAudit?.result==="passed"
      && extra.coachExternalAudit?.result==="passed",
      "Incomplete CFB extra-team full audit");
    teamInfo[extra.schoolId] = { name:extra.priority?.school ?? extra.schoolId,
      id:String(extra.priority?.espnId), buckets:extra.priority };
  }
  for (const [sport, teams] of [
    ["nfl", nfl],
    ["cfb", Object.fromEntries(Object.entries(teamInfo).map(([id,team])=>[id,team.buckets]))],
  ]) {
    for (const [team, buckets] of Object.entries(teams)) {
      const allowed = new Set(["RB","WR","TE"].flatMap(f=>(buckets[f]??[]).map(nameKey)));
      for (const player of buckets.Flex??[]) if (!allowed.has(nameKey(player))) {
        record("flex-inheritance-blocker", "Flex name absent from its RB/WR/TE shortlist",
          sport==="nfl"?"data/generated/football/wheel-football-priorities.json":
          "data/generated/football/cfb/wheel-football-current-priorities-2026.json",
          {sport,team,player});
      }
    }
  }
  assert(Object.keys(nfl).length===32,"Expected all 32 NFL audited teams");
  assert(Object.keys(teamInfo).length>=69, "Missing 68-school base or Boise extra-team audit");
  return {nfl,teamInfo,cfb};
}
async function liveCatalog() {
  const [ufcRows, cfbRows, apRows] = await Promise.all([
    sql("select fighter_id, display_name, division, ranking, is_champion, hidden_grade, headshot_url, rankings_as_of, ranking_source from private.wheel_ufc_fighters where active = true order by division, fighter_id"),
    sql("select distinct on (team_code, position_group, name_key) team_code, position_group, display_name, hidden_grade from private.wheel_football_grade_authority order by team_code, position_group, name_key, effective_date desc"),
    sql("select season, poll_date, rank, team_code from private.wheel_football_ap_top_25 where poll_date = (select max(poll_date) from private.wheel_football_ap_top_25) order by rank"),
  ]);
  const ufc = ufcRows.map(x=>({
    sport:"ufc", division:x.division, name:x.display_name, grade:Number(x.hidden_grade),
    rank:x.ranking, champion:x.is_champion, fighterId:x.fighter_id,
    photo:!!x.headshot_url, rankingsAsOf:x.rankings_as_of, rankingSource:x.ranking_source,
  }));
  const nflLive = cfbRows.filter(x=>NFL_CODES.has(x.team_code)).map(x=>({
    sport:"nfl", team:x.team_code, family:x.position_group, name:x.display_name,
    grade:Number(x.hidden_grade),
  }));
  const cfb = cfbRows.filter(x=>!NFL_CODES.has(x.team_code)).map(x=>({
    sport:"cfb", team:x.team_code, family:x.position_group, name:x.display_name,
    grade:Number(x.hidden_grade),
  }));
  return {ufc,cfb,nflLive,apRows};
}
function extractUfcRankings(html) {
  const doc=new JSDOM(html).window.document;
  const headers=[...doc.querySelectorAll("h1,h2")];
  const standard=headers.find(h=>h.textContent.trim()==="All Rankings");
  const meta=headers.find(h=>h.textContent.trim()==="All Meta Rankings");
  assert(standard && meta && (standard.compareDocumentPosition(meta)&4),
    "Cannot delimit standard UFC All Rankings from separate Meta rankings");
  const groups=[...doc.querySelectorAll(".view-grouping")].filter(x=>{
    const location=standard.compareDocumentPosition(x);
    const after=!!(location&4);
    const before=!!(x.compareDocumentPosition(meta)&4);
    return after && before;
  });
  const found=[];
  for (const division of DIVISIONS) {
    const group=groups.find(x=>
      [...x.querySelectorAll("h3,.view-grouping-header")].some(h=>h.textContent.trim()===division));
    assert(group, "UFC standard All Rankings missing " + division);
    const names=[...group.querySelectorAll("h4,h5,.rankings--athlete--champion a")]
      .map(e=>e.textContent.trim()).filter(Boolean);
    const champion=names.find(n=>nameKey(n)!==nameKey(division));
    assert(champion, "UFC champion not parseable: " + division);
    found.push({division, champion:true, name:champion, rank:null});
    const tableRows=[...group.querySelectorAll("table tbody tr")];
    for (const tr of tableRows) {
      const tds=[...tr.querySelectorAll("td")];
      const rank=Number(tds[0]?.textContent.trim());
      const name=tds[1]?.textContent.trim();
      if (Number.isInteger(rank) && rank>0 && rank<=15 && name) {
        found.push({division, champion:false, name, rank});
      }
    }
  }
  // Validate source separately: a duplicated UFC source rank is NOT a software failure.
  const bad=DIVISIONS.filter(d=>{
    const rows=found.filter(r=>r.division===d);
    const ranks=rows.filter(r=>!r.champion).map(r=>r.rank).sort((a,b)=>a-b);
    return rows.length!==16 || ranks.some((rank,i)=>rank!==i+1);
  });
  return {rows:found,structuralWarnings:bad};
}
async function ufcExternal() {
  const url="https://www.ufc.com/rankings";
  const html=await (await fetchWithRetry(url,{headers:{Accept:"text/html"}})).text();
  const data=extractUfcRankings(html);
  if (data.structuralWarnings.length) {
    record("source-integrity-review","Official UFC table contains missing/duplicate ranks",
      url,{divisions:data.structuralWarnings});
  }
  return {url,...data};
}
function apSnapshotSource() {
  const text=repoRead("src/features/back-room/wheelFootballApTop25.ts");
  const rows=[...text.matchAll(/\{ rank: (\d+), schoolId: "([^"]+)" \}/g)]
    .map(m=>({rank:Number(m[1]),team:m[2]}));
  assert(rows.length===25, "Checked-in AP snapshot is not 25 teams");
  return rows;
}
async function apExternal(teamInfo, applied) {
  const url="https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings";
  const body=await (await fetchWithRetry(url)).json();
  const poll=body.rankings?.find(x=>/AP Top 25/i.test(x.name ?? x.shortName ?? ""));
  assert(poll, "ESPN AP Top 25 mirror unavailable");
  const rows=(poll.ranks??[]).map(row=>({rank:Number(row.current??row.rank??row.ranking),
    id:String(row.team?.id??""),name:row.team?.displayName??row.team?.location??""}))
    .filter(row=>row.rank>=1&&row.rank<=25&&Number.isInteger(row.rank)).sort((a,b)=>a.rank-b.rank);
  assert(rows.length===25 && rows.every(x=>x.id)
    && new Set(rows.map(x=>x.id)).size===25
    && rows.every((x,i)=>i===0||x.rank>=rows[i-1].rank),
    "ESPN AP Top 25 rows are incomplete/ambiguous; preserve last good snapshot");
  // AP can officially tie positions (e.g., two #20 teams and no #21).
  // A slot is only a comparison position, NEVER a fabricated official AP rank.
  rows.forEach((row,i)=>row.position=i+1);
  const duplicates=rows.filter((row,i)=>i>0&&row.rank===rows[i-1].rank);
  if(duplicates.length) record("source-ranking-tie",
    "Official AP poll contains tied positions; reviewed canonical publication needs a tie policy",
    url,{officialTies:duplicates.map(row=>({rank:row.rank,id:row.id,name:row.name}))});
  const idToSchool=new Map(Object.entries(teamInfo).map(([key,t])=>[t.id,key]));
  const changed=rows.filter(row=>applied[row.position-1]?.team!==idToSchool.get(row.id));
  if(changed.length) record("factual-correction",
    "AP poll changed; reviewed versioned frontend/backend poll update required (not CI software failure)",
    url,{changes:changed.map(x=>({...x,auditedSchool:idToSchool.get(x.id)??null})),
      newUnauditedSchools:changed.filter(x=>!idToSchool.has(x.id))});
  return rows;
}
function rosterPlayers(body) {
  const groups=body.athletes??[];
  const rows=groups.flatMap(g=>Array.isArray(g.items)?g.items:[]);
  assert(rows.length>=20,"ESPN roster unexpectedly empty/incomplete");
  return rows.filter(row=>row.displayName||row.fullName).map(row=>({
    id:String(row.id??""), name:row.displayName??row.fullName,
    role:String(row.position?.abbreviation??row.position?.name??""),
    status:String(row.status?.type??row.status?.name??""),
  }));
}
async function rosters(nflTeams, cfbTeams) {
  const tasks=[
    ...Object.keys(nflTeams).map(team=>({sport:"nfl",team, id:team.toLowerCase()})),
    ...Object.entries(cfbTeams).map(([team,info])=>({sport:"cfb",team,id:info.id})),
  ];
  const output={};let cursor=0;
  async function worker() {
    while(cursor<tasks.length) {
      const task=tasks[cursor++];
      const path=task.sport==="nfl"?"football/nfl":"football/college-football";
      const url="https://site.api.espn.com/apis/site/v2/sports/"+path+"/teams/"+task.id+"/roster";
      try {
        const json=await (await fetchWithRetry(url)).json();
        output[task.sport+"|"+task.team]={url,players:rosterPlayers(json)};
      } catch(e) {
        errors.push({stage:"roster",sport:task.sport,team:task.team,url,reason:String(e)});
      }
    }
  }
  await Promise.all(Array.from({length:5},worker));
  assert(Object.keys(output).length===tasks.length,
    "Incomplete NFL/CFB roster source coverage; previous successful snapshot not superseded");
  return output;
}
function reconcile(rows, sourceRosters, ufcRanks, previous) {
  const externalByName=new Map();
  for (const [key,roster] of Object.entries(sourceRosters)) {
    for (const person of roster.players) {
      const k=key.split("|")[0]+"|"+nameKey(person.name);
      externalByName.set(k,[...(externalByName.get(k)??[]),{team:key.split("|")[1],...person}]);
    }
  }
  const rankByDivisionName=new Map(ufcRanks.rows.map(x=>[x.division+"|"+nameKey(x.name),x]));
  const marked=rows.map(row=>{
    const updated={...row,checkedAt:at,sourceStatus:"matched"};
    if(row.sport==="ufc") {
      updated.sourceUrl=ufcRanks.url;
      const candidate=rankByDivisionName.get(row.division+"|"+nameKey(row.name));
      // Unranked UFC options have no official ranked counterpart; correct, not a roster failure.
      if(row.champion||row.rank!=null) {
        updated.sourceStatus=candidate?"matched":"missing";
        if(candidate && (candidate.rank!==row.rank||candidate.champion!==row.champion)) {
          record("factual-correction","UFC canonical ranking differs from official All Rankings",
            ufcRanks.url,{fighterId:row.fighterId,division:row.division,
              canonical:{rank:row.rank,champion:row.champion},
              official:{rank:candidate.rank,champion:candidate.champion}});
        }
      } else updated.sourceStatus="unranked-not-verified-by-ranked-table";
      if(!row.photo) record("factual-correction","Missing UFC canonical headshot",
        "live:private.wheel_ufc_fighters",{fighterId:row.fighterId,division:row.division});
      return updated;
    }
    const r=sourceRosters[row.sport+"|"+row.team];
    updated.sourceUrl=r?.url??null;
    if(row.family==="Head Coach") {
      // ESPN player roster is not coaching authority. Never claim coach checked by player roster.
      updated.sourceStatus="coaching-source-needed";
      return updated;
    }
    const own=r?.players.filter(p=>nameKey(p.name)===nameKey(row.name))??[];
    if(own.length===1) {updated.sourceRole=own[0].role;return updated;}
    updated.sourceStatus=own.length>1?"ambiguous":"missing";
    const elsewhere=(externalByName.get(row.sport+"|"+nameKey(row.name))??[])
      .filter(p=>p.team!==row.team);
    // Only corroborate a transfer when the matched name is unique across source teams.
    if(own.length===0 && elsewhere.length===1) updated.sourceTeam=elsewhere[0].team;
    return updated;
  });
  const result=compareEvidence(marked,previous);
  return {result,snapshot:marked.map(x=>({
    // Never write out hidden UFC grade or the optional current rating field.
    sport:x.sport, name:x.name, team:x.team, division:x.division, family:x.family,
    rank:x.rank, champion:x.champion, sourceStatus:x.sourceStatus,
    sourceRole:x.sourceRole, sourceTeam:x.sourceTeam, sourceUrl:x.sourceUrl,
  }))};
}
function gmCoverage(nfl) {
  // Contract coverage check never regenerates/reprices contracts as a side effect.
  const authority=repoRead("src/features/back-room/wheelFootballNflCurrentAuthority.ts");
  const filename=authority.match(/contractFile:\s*"([^"]+)"/)?.[1];
  assert(filename, "GM current authority contract binding not found");
  const data=readJson("data/generated/football/"+filename);
  const expected=nfl.filter(row=>row.family!=="Head Coach");
  const expectedKeys=new Set(expected.map(row=>
    [row.team,row.family,nameKey(row.name)].join("|")));
  const actualKeys=new Set(data.players.map(row=>
    [row.team,row.family,nameKey(row.player)].join("|")));
  assert(actualKeys.size===data.players.length,"Duplicate GM contract identities");
  assert(expectedKeys.size===actualKeys.size
    && [...expectedKeys].every(key=>actualKeys.has(key)),
    "GM contract identities differ from current NFL Wheel population");
  for (const row of data.players) {
    assert(Number.isInteger(row.salaryApy)&&row.salaryApy>=0,
      "Missing GM contract amount: "+row.player);
    assert(["1YR","3YR"].includes(row.gameContract),
      "Invalid GM contract classification: "+row.player);
    assert(Number.isFinite(row.age)&&row.age>17,
      "Invalid GM age: "+row.player);
    assert(Array.isArray(row.gmEligibleSlots)&&row.gmEligibleSlots.length,
      "GM identity missing eligible slots: "+row.player);
  }
  const sourceFiles=[...authority.matchAll(
    /"(wheel-nfl-(?:qb|rb|wr|te|front-seven|secondary)-grades-\d{4}-\d\d-\d\d\.json)"/g)]
    .map(m=>m[1]);
  assert(new Set(sourceFiles).size===6,"GM grade authority must bind six current Wheel grade files");
  for(const family of ["qb","rb","wr","te","front-seven","secondary"]){
    const gradeFile=readdirSync(resolve(root,"data/generated/football")).filter(f=>
      new RegExp("^wheel-nfl-"+family+"-grades-\\d{4}-\\d\\d-\\d\\d\\.json$").test(f)).sort().at(-1);
    assert(gradeFile && sourceFiles.includes(gradeFile),
      "GM current-ability binding is stale for "+family);
  }
  return {snapshotDate:data.snapshotDate,snapshotFile:filename,
    coverage:data.players.length,gradeFamilies:6,
    source:data.source,staleness:"contract-facts-require-independent-current-provider-visit",
    economySimulation:"not-run-read-only-stage"};
}

async function main() {
  const priorPath=cli.previous;
  const previous=priorPath && existsSync(resolve(priorPath))
    ? JSON.parse(readFileSync(resolve(priorPath),"utf8")):null;
  const teams=priorityTeams();
  const nfl=footballCatalog();
  const db=await liveCatalog();
  const gm=gmCoverage(nfl);
  validateCatalog(nfl,"nfl");validateCatalog(db.nflLive,"nfl");
  validateCatalog(db.cfb,"cfb");validateCatalog(db.ufc,"ufc");
  const nflKeys = new Set(nfl.map(identity));
  const liveKeys = new Set(db.nflLive.map(identity));
  assert(nflKeys.size===liveKeys.size && [...nflKeys].every(key=>liveKeys.has(key)),
    "NFL checked-in artifact identities differ from active live Wheel authority; review required");
  const liveGradeByKey=new Map(db.nflLive.map(row=>[identity(row),row.grade]));
  assert(nfl.every(row=>row.grade===liveGradeByKey.get(identity(row))),
    "NFL backend/GM grade bindings differ from checked-in artifacts; do not publish a snapshot");
  // Verify live DB coverage against approved base and extra-team (not a new grading authority).
  const missingCfb=db.cfb.filter(r=>!teams.teamInfo[r.team]);
  assert(missingCfb.length===0, "Unrecognized live CFB team(s): "+
    [...new Set(missingCfb.map(r=>r.team))].join(", "));
  const checkedIn=apSnapshotSource();
  const [sourceRosters, ufcRanks, currentPoll] = await Promise.all([
    rosters(teams.nfl,teams.teamInfo), ufcExternal(),
    apExternal(teams.teamInfo,checkedIn),
  ]);
  const {result,snapshot}=reconcile([...nfl,...db.cfb,...db.ufc],
    sourceRosters,ufcRanks,previous);
  const orphaned=(previous?.identities??[]).filter(x=>!snapshot.some(y=>identity(x)===identity(y)));
  for(const x of orphaned) record("mandatory-factual-correction",
    "Identity removed from active authority; verify retirement, transfer or offboarding before approval",
    "canonical",{oldIdentity:identity(x)});
  const all= {
    schema:1, checkedAt:at, sourceCommit:process.env.GITHUB_SHA??null,
    identities:snapshot, poll:currentPoll, catalogCounts:{
      nfl:nfl.length,cfb:db.cfb.length,ufc:db.ufc.length,
    },
    sourceCounts:{nflTeams:Object.keys(teams.nfl).length,
      cfbTeams:Object.keys(teams.teamInfo).length,ufcDivisions:DIVISIONS.length},
  };
  const summaries=Object.fromEntries(["nfl","cfb","ufc"].map(sport=>
    [sport,summarizeDecisions(result.filter(row=>row.sport===sport))]));
  const output={status:"review-blocked-until-verified",checkedAt:at,
    sourceCommit:all.sourceCommit,previousSnapshot:previous?.checkedAt??null,
    summaries,gmContractAuthority:gm,sourceEvidence:evidence,
    reviews:result.filter(row=>row.classification!=="no-meaningful-change"),
    rosterSourceGaps:result.filter(x=>x.sourceStatus==="coaching-source-needed"
      ||x.sourceStatus==="ambiguous").map(x=>({key:x.key,status:x.sourceStatus})),
    removedIdentities:orphaned.map(identity),
    ufcSourceIntegrityWarnings:ufcRanks.structuralWarnings,
    latestLiveApPoll:db.apRows[0]?.poll_date??null,
    checkedInAp:checkedIn,
    errors,
    gradeChangesApplied:0, ratingPrCreated:false, gmContractsRefreshed:false,
    outstandingStages:["editorial-performance-review","GM-contract-snapshot-comparison",
      "live-source-grade-headshot-HTTP-checks","owner-approved-factual-publishing"],
  };
  mkdirSync(outputDir,{recursive:true});
  writeFileSync(resolve(outputDir,"report.json"),JSON.stringify(output,null,2)+"\n");
  assert(!ufcRanks.structuralWarnings.length,
    "Official UFC ranking source integrity needs editorial resolution; snapshot not promoted");
  assert(!evidence.some(row=>row.type==="flex-inheritance-blocker"),
    "Flex shortlist inheritance discrepancies require reviewed correction; snapshot not promoted");
  output.status="complete-read-only";
  writeFileSync(resolve(outputDir,"report.json"),JSON.stringify(output,null,2)+"\n");
  writeFileSync(resolve(outputDir,"snapshot.json"),JSON.stringify(all,null,2)+"\n");
  console.log(JSON.stringify({status:output.status,summaries,
    evidenceCount:evidence.length,previousSnapshot:output.previousSnapshot}));
}
try {await main();} catch(e) {
  mkdirSync(outputDir,{recursive:true});
  const path=resolve(outputDir,"failure.json");
  writeFileSync(path,JSON.stringify({status:"failed-not-promoted",at,
    reason:String(e),sourceErrors:errors,sourceEvidence:evidence},null,2)+"\n");
  console.error(String(e));
  process.exitCode=1;
}
