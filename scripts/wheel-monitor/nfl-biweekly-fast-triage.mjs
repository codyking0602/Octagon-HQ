#!/usr/bin/env node
// Madden +/-2 movement is the ONLY NFL player rating trigger. No grading here.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {pathToFileURL} from "node:url";
const teams="ARI ATL BAL BUF CAR CHI CIN CLE DAL DEN DET GB HOU IND JAX KC LAC LAR LV MIA MIN NE NO NYG NYJ PHI PIT SEA SF TB TEN WSH".split(" ");
const names=["Arizona Cardinals","Atlanta Falcons","Baltimore Ravens","Buffalo Bills","Carolina Panthers","Chicago Bears","Cincinnati Bengals","Cleveland Browns","Dallas Cowboys","Denver Broncos","Detroit Lions","Green Bay Packers","Houston Texans","Indianapolis Colts","Jacksonville Jaguars","Kansas City Chiefs","Los Angeles Chargers","Los Angeles Rams","Las Vegas Raiders","Miami Dolphins","Minnesota Vikings","New England Patriots","New Orleans Saints","New York Giants","New York Jets","Philadelphia Eagles","Pittsburgh Steelers","Seattle Seahawks","San Francisco 49ers","Tampa Bay Buccaneers","Tennessee Titans","Washington Commanders"];
const teamCodes=new Map(names.map((n,i)=>[n,teams[i]]));
const normalized=s=>String(s??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"").replace(/(?:iii|ii|iv|jr|sr|v)$/,"");
const k=(t,f,n)=>t+"|"+f+"|"+normalized(n);
const safe=s=>String(s??"").replace(/[|\r\n\t]/g," ").trim().slice(0,170);
export function loadGrades(){
 const text=readFileSync("src/features/back-room/wheelFootballNflCurrentAuthority.ts","utf8");
 const files=[...new Set([...text.matchAll(/wheel-nfl-(?:qb|rb|wr|te|front-seven|secondary)-grades-\d{4}-\d\d-\d\d\.json/g)].map(m=>m[0]))];
 if(files.length!==6)throw Error("Missing one of six NFL current-grade families");
 const rows=files.flatMap(file=>{
  const family=file.includes("front-seven")?"Front Seven":file.includes("secondary")?"Secondary":
   ({qb:"QB",rb:"RB",wr:"WR",te:"TE"})[file.match(/wheel-nfl-(qb|rb|wr|te)-grades-/)?.[1]];
  return JSON.parse(readFileSync("data/generated/football/"+file,"utf8")).grades.map(p=>({...p,family}));
 });
 if(rows.length!==594||new Set(rows.map(p=>k(p.team,p.family,p.player))).size!==594)throw Error("Invalid canonical NFL grade census");
 return rows;
}
export function buildPacket(combined,grades,profiles){
 if(grades.length!==594||profiles.length!==594)throw Error("Expected 594 NFL player positions");
 const current=new Map(grades.map(p=>[k(p.team,p.family,p.player),p]));
 const byName=new Map();
 for(const p of profiles){
  const id=p.team+"|"+normalized(p.name),rows=byName.get(id)??[];
  rows.push(p);byName.set(id,rows);
 }
 const sourceBlockers=[...(combined.sourceBlockers??[])];
 const baselineDays=combined.counts?.maddenComparisonDays;
 const valid=Number.isFinite(baselineDays)&&baselineDays>=12&&baselineDays<=17&&!sourceBlockers.some(x=>x.startsWith("madden:"));
 if(!valid)sourceBlockers.push("madden:14-day-snapshot-not-verified; player queue is provisional");
 const flags=(combined.reviewCandidates??[]).filter(c=>(c.flags??[]).some(f=>f.monitor==="madden"));
 const players=[],unresolved=[];
 for(const c of flags){
  const source=(c.flags??[]).find(f=>f.monitor==="madden");
  const delta=Number(source?.reason?.match(/^overall-(-?\d+)-review$/)?.[1]);
  if(!Number.isInteger(delta)||Math.abs(delta)<2){
   unresolved.push({name:c.name,team:c.team,reason:"bad-movement-record"});continue;
  }
  const team=teamCodes.get(c.team)??c.team;
  const matches=byName.get(team+"|"+normalized(c.name))??[];
  if(!matches.length){unresolved.push({name:c.name,team,reason:"identity-unmatched"});continue;}
  for(const p of matches){
   const grade=current.get(k(p.team,p.family,p.name));
   if(!grade){unresolved.push({name:p.name,team:p.team,reason:"grade-identity-unmatched"});continue;}
   const eaNow=Number(c.details?.madden?.overallNow);
   const gap=Number.isFinite(eaNow)?Math.abs(eaNow-grade.grade):null;
   // Time-budget escalation, not a score or approval formula.
   const deep=Math.abs(delta)>=4||(Math.abs(delta)>=3&&gap!==null&&gap>=4)||
     (Math.abs(delta)>=2&&gap!==null&&gap>=7);
   players.push({id:p.id,team:p.team,name:p.name,family:p.family,hq:grade.grade,
    eaBefore:c.details?.madden?.overallBefore??null,eaNow:Number.isFinite(eaNow)?eaNow:null,
    movement:delta,gap,triage:deep?"detailed":"quick",
    rationale:deep?"Large movement or Madden/HQ discrepancy requires context":"Routine movement: quick sense-check only",
    editorialDecision:"pending",proposedHq:null});
  }
 }
 const uniq=[...new Map(players.map(p=>[p.id,p])).values()];
 uniq.sort((a,b)=>(a.triage==="detailed"?0:1)-(b.triage==="detailed"?0:1)||
   Math.abs(b.movement)-Math.abs(a.movement)||a.team.localeCompare(b.team));
 const coaches=(combined.coachGradeReviewQueue??[]).map(c=>({
  team:c.team,name:c.coach,hq:c.hqGrade,officialStatus:c.officialStatus,
  officialCoach:c.currentOfficialCoach??null,decision:"pending-individual-review",
  proposedHq:null,reason:null
 }));
 if(coaches.length!==32||new Set(coaches.map(c=>c.team)).size!==32)sourceBlockers.push("coaches:missing-all-32-review-queue");
 return {schema:1,sport:"NFL",mode:"fast-biweekly-approval-packet",observedAt:combined.observedAt,
  baselineValid:valid,baselineDays,
  maddenFlagged:flags.length,detailed:uniq.filter(p=>p.triage==="detailed"),
  quick:uniq.filter(p=>p.triage==="quick"),unresolved,coaches,
  exceptions:{contractChanges:combined.counts?.contractChanges??null,
   transfers:combined.counts?.contractTransfers??null,
   roster:combined.counts?.rosterExceptions??null},
  blockers:[...new Set(sourceBlockers)],
  notes:"Triage is deterministic, not film or independent football research. Madden movement is the only player rating trigger. No grades, probabilities, roster or contracts auto-changed.",
  afterApproval:"All published HQ rating changes trigger development reassessment; independently check aging-low-decline and early-career outliers. Editorial approval before probability updates.",
  automaticGradeChanges:0,automaticDevelopmentChanges:0};
}
export function renderPacket(p){
 const rows=["# NFL GM — biweekly approval preparation","",
  "**Madden baseline:** "+(p.baselineValid?"Verified 12–17 day checkpoint":"NOT VERIFIED — no player clearance permitted"),
  "**Player trigger:** only official Madden overall movement of 2+ points. A static EA/HQ gap is a triage factor AFTER a movement flag, never a new flag.","",
  "| Madden flagged | Detailed reviews | Quick screens | Unresolved | Coaches |",
  "|---:|---:|---:|---:|---:|",
  "| "+[p.maddenFlagged,p.detailed.length,p.quick.length,p.unresolved.length,p.coaches.length].join(" | ")+" |","",
  "## Deeper player research queue","",
  "Use current performance, film reporting, health and position peers. Madden never sets an HQ grade.","",
  "| Team | Player | HQ | EA before / now | Reason | Editorial recommendation |",
  "|---|---|---:|---|---|---|"];
 for(const c of p.detailed)rows.push("| "+[c.team,safe(c.name)+" ("+c.family+")",c.hq,
  String(c.eaBefore??"?")+" → "+String(c.eaNow??"?")+" ("+(c.movement>0?"+":"")+c.movement+")",
  safe(c.rationale),"**Pending**"].join(" | ")+" |");
 rows.push("","## Fast-screened Madden movements","",
  "Do not turn this list into automatic retain decisions. Investigate anomalies and escalate when warranted.","",
  "| Team | Player | HQ | EA delta |","|---|---|---:|---:|");
 for(const c of p.quick)rows.push("| "+[c.team,safe(c.name)+" ("+c.family+")",c.hq,(c.movement>0?"+":"")+c.movement].join(" | ")+" |");
 rows.push("","## Mandatory 32-coach editorial review","",
  "Identity checks are not football judgments. Evaluate scheme, game management, counter-adjustments, staff/player development and sustained ability.","",
  "| Team | Coach | HQ | Source status | Decision |","|---|---|---:|---|---|");
 for(const c of p.coaches)rows.push("| "+[c.team,safe(c.name),c.hq,safe(c.officialStatus),"**Pending real review**"].join(" | ")+" |");
 rows.push("","## Roster / contract exceptions","",
  "- Material contract flags: "+(p.exceptions.contractChanges??"source unavailable"),
  "- Potential transfers: "+(p.exceptions.transfers??"source unavailable"),
  "- Roster exceptions: "+(p.exceptions.roster??"source unavailable"),
  "Missing provider identities are not verified transactions.","",
  "## After owner approval: development","",p.afterApproval,"",
  "## Final approval sheet (after actual editorial research)","",
  "Publish only evidence-backed OLD → NEW proposals. One owner approval is required before any grade or probability change.","");
 if(p.unresolved.length)rows.push("## Identity exceptions","",...p.unresolved.map(x=>"- "+safe(x.team)+" "+safe(x.name)+": "+safe(x.reason)),"");
 if(p.blockers.length)rows.push("## Source blockers","",...p.blockers.map(x=>"- "+safe(x)),"");
 rows.push("**Safety:** read-only packet; it is NOT an approved ratings slate.","");
 return rows.join("\n");
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{
  const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith("--")).map(x=>{
   const p=x.indexOf("=");return [x.slice(2,p),x.slice(p+1)];}));
  if(!args.input||!args.json||!args.md)throw Error("--input, --json and --md required");
  const combined=JSON.parse(readFileSync(args.input,"utf8"));
  const profiles=JSON.parse(readFileSync("data/curated/football/gm-nfl-development-profiles-2026-10-07.json","utf8")).profiles;
  const packet=buildPacket(combined,loadGrades(),profiles);
  for(const file of [args.json,args.md])mkdirSync(dirname(resolve(file)),{recursive:true});
  writeFileSync(args.json,JSON.stringify(packet,null,2)+"\n");
  writeFileSync(args.md,renderPacket(packet));
  console.log(JSON.stringify({baselineValid:packet.baselineValid,detailed:packet.detailed.length,
   quick:packet.quick.length,coaches:packet.coaches.length,unresolved:packet.unresolved.length,
   blockers:packet.blockers.length,automaticChanges:0}));
 }catch(error){console.error(String(error));process.exitCode=1;}
}
