#!/usr/bin/env node
// Read-only HQ-versus-current-EA NFL discrepancy audit.
// A Madden gap is an evidence trigger, NEVER an automatic grade change.
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {pathToFileURL} from "node:url";

const FAMILIES={
  QB:"QB",HB:"RB",WR:"WR",TE:"TE",
  CB:"Secondary",FS:"Secondary",SS:"Secondary",
  LEDG:"Front Seven",REDG:"Front Seven",DT:"Front Seven",
  MIKE:"Front Seven",WILL:"Front Seven",
};
const NAMES={ARI:"Arizona Cardinals",ATL:"Atlanta Falcons",BAL:"Baltimore Ravens",BUF:"Buffalo Bills",CAR:"Carolina Panthers",CHI:"Chicago Bears",CIN:"Cincinnati Bengals",CLE:"Cleveland Browns",DAL:"Dallas Cowboys",DEN:"Denver Broncos",DET:"Detroit Lions",GB:"Green Bay Packers",HOU:"Houston Texans",IND:"Indianapolis Colts",JAX:"Jacksonville Jaguars",KC:"Kansas City Chiefs",LAC:"Los Angeles Chargers",LAR:"Los Angeles Rams",LV:"Las Vegas Raiders",MIA:"Miami Dolphins",MIN:"Minnesota Vikings",NE:"New England Patriots",NO:"New Orleans Saints",NYG:"New York Giants",NYJ:"New York Jets",PHI:"Philadelphia Eagles",PIT:"Pittsburgh Steelers",SEA:"Seattle Seahawks",SF:"San Francisco 49ers",TB:"Tampa Bay Buccaneers",TEN:"Tennessee Titans",WSH:"Washington Commanders"};
const norm=x=>String(x??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[^a-z0-9]/g,"").replace(/(?:iii|ii|iv|jr|sr|v)$/,"");
const gradeFiles={QB:"wheel-nfl-qb-grades-2026-10-27.json",RB:"wheel-nfl-rb-grades-2026-10-27.json",
 WR:"wheel-nfl-wr-grades-2026-10-27.json",TE:"wheel-nfl-te-grades-2026-10-03.json",
 "Front Seven":"wheel-nfl-front-seven-grades-2026-10-03.json",
 Secondary:"wheel-nfl-secondary-grades-2026-10-03.json"};
export function auditGaps(snapshot,grades){
 if(snapshot.edition!=="Madden NFL 27"||!Array.isArray(snapshot.players)||snapshot.players.length<1700)
  throw new Error("Official complete Madden NFL 27 source required");
 if(grades.length!==594)throw new Error("Exact 594-player HQ grade authority required");
 const m=new Map(),duplicates=[];
 for(const p of snapshot.players){
   const team=Object.entries(NAMES).find(([,v])=>v===p.team)?.[0]??p.team;
   const family=FAMILIES[p.position];
   if(!family)continue;
   const k=team+"|"+family+"|"+norm(p.name);
   if(m.has(k))duplicates.push(k);else m.set(k,p);
 }
 if(duplicates.length)throw new Error("Ambiguous Madden team/position identities: "+duplicates.length);
 const rows=grades.map(g=>{
   const src=m.get(g.team+"|"+g.family+"|"+norm(g.player));
   const delta=src?Number(g.grade)-Number(src.overall):null;
   return {team:g.team,family:g.family,player:g.player,hqGrade:g.grade,
      eaOverall:src?.overall??null,hqMinusEa:delta,
      disposition:delta===null?"identity-unmatched":
        Math.abs(delta)>=10?"red-flag-10plus":Math.abs(delta)>=7?"mandatory-review-7plus":
        "no-large-current-gap",
      action:"research-current-ability-no-automatic-adjustment"};
 });
 return {sport:"NFL",observedAt:snapshot.observedAt,source:snapshot.source,
  comparison:"current HQ ability grade vs official current EA overall, independent of Week 3 historical delta",
  thresholds:{mandatory:7,redFlag:10},gradesCovered:594,
  matched:rows.filter(r=>r.hqMinusEa!==null).length,
  unmatched:rows.filter(r=>r.hqMinusEa===null).length,
  mandatoryCurrentGap:rows.filter(r=>r.disposition==="mandatory-review-7plus").length,
  redFlagCurrentGap:rows.filter(r=>r.disposition==="red-flag-10plus").length,
  rows,automaticChangesApplied:0};
}
function loadGrades(){
 return Object.entries(gradeFiles).flatMap(([family,file])=>
   JSON.parse(readFileSync("data/generated/football/"+file,"utf8")).grades
   .map(g=>({...g,family})));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{
  const args=Object.fromEntries(process.argv.slice(2).filter(a=>a.startsWith("--"))
    .map(a=>a.slice(2).split("=")));
  if(!args.snapshot||!args.out)throw new Error("--snapshot=FILE and --out=FILE are required");
  const snapshot=JSON.parse(readFileSync(args.snapshot,"utf8"));
  const report=auditGaps(snapshot,loadGrades());
  const out=resolve(args.out);mkdirSync(dirname(out),{recursive:true});
  writeFileSync(out,JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify({matched:report.matched,unmatched:report.unmatched,
   mandatory7:report.mandatoryCurrentGap,red10:report.redFlagCurrentGap,automaticChangesApplied:0}));
 }catch(error){console.error(String(error));process.exitCode=1}
}