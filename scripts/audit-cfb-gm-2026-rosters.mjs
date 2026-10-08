import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

const baseline = JSON.parse(readFileSync("data/generated/football/cfb/wheel-football-current-priorities-2026.json","utf8")).teams;
const overrides = JSON.parse(readFileSync("data/curated/football/cfb/wheel-football-priority-audit-2026-10-03.json","utf8")).overrides;
const boise = JSON.parse(readFileSync("data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json","utf8")).priority;
const top25 = readFileSync("src/features/back-room/wheelFootballApTop25.ts","utf8");
const ids = [...top25.matchAll(/schoolId: "([^"]+)"/g)].map((m) => m[1]);
if (ids.length !== 25 || new Set(ids).size !== 25) throw new Error("AP Top 25 source changed");

const normalize = (x) => String(x||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const groups = ["QB","RB","WR","TE","Flex","Front Seven","Secondary"];
const officialRows = JSON.parse(readFileSync("data/curated/football/cfb/gm-2026-official-class-overrides.json","utf8")).rows;
const officialById = new Map(officialRows.map((row) => [row.id,row]));
if (officialById.size !== officialRows.length) throw new Error("Duplicate official classification overrides");

const classLabels = {fr:"FR",freshman:"FR",so:"SO",sophomore:"SO",jr:"JR",junior:"JR",sr:"SR",senior:"SR","5th":"5TH",graduate:"GR",grad:"GR",gr:"GR"};
function classification(item) {
  const exp = item.experience && typeof item.experience === "object" ? item.experience : {};
  const raw = String(exp.displayValue || exp.abbreviation || item.class || item.year || "").trim();
  const rs = /\b(redshirt|rs)[-\s]?/i.test(raw);
  const cleaned = raw.toLowerCase().replace(/redshirt|\brs\b/g,"").replace(/[^a-z0-9]/g,"");
  return { label:classLabels[cleaned]||null, redshirt:rs?true:null, raw:raw||null };
}
async function getRoster(team) {
  const url=team.rosterUrl||"https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/"+team.espnId+"/roster";
  const response=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 (compatible; OctagonHQ-CFB-GM-Research/1.0)","Accept":"application/json"}});
  if(!response.ok) throw new Error("ESPN HTTP "+response.status+" at "+team.school);
  const json=await response.json();
  const athletes=(Array.isArray(json.athletes)?json.athletes:[]).flatMap(g=>Array.isArray(g.items)?g.items:[]);
  return {url,athletes};
}
const out=[];
const failures=[];
for (const id of ids) {
  const school=id==="boise-state"?boise:{...baseline[id],...(overrides[id]||{})};
  if (!school) throw new Error("Missing CFB baseline "+id);
  const selected=new Map();
  for(const group of groups)for(const name of school[group]||[]){
    const key=normalize(name);
    if(!selected.has(key))selected.set(key,{id:id+"|"+key,schoolId:id,school:school.school,name,groups:[]});
    selected.get(key).groups.push(group);
  }
  let roster={url:school.rosterUrl||null,athletes:[]};
  try{roster=await getRoster(school)}catch(error){failures.push({schoolId:id,error:String(error)})}
  const athletes=roster.athletes.map(item=>({
    item,name:item.displayName||item.fullName||[item.firstName,item.lastName].filter(Boolean).join(" "),
    key:normalize(item.displayName||item.fullName||[item.firstName,item.lastName].filter(Boolean).join(" ")),
  }));
  for(const player of selected.values()){
    const matching=athletes.filter(x=>x.key===normalize(player.name));
    const single=matching.length===1?matching[0]:null;
    const cls=single?classification(single.item):{label:null,redshirt:null,raw:null};
    const official=officialById.get(player.id);
    out.push({...player,
      classification:official?.classification || cls.label,redshirt:official?.redshirt ?? cls.redshirt,
      sourceClass:official?.classification || cls.raw,
      espnAthleteId:single?String(single.item.id||""):null,
      matchStatus:official?"official-school-roster":single?"exact":matching.length>1?"ambiguous":"unmatched",
      sourceUrl:official?.sourceUrl || roster.url,
      confidence:official?"official-roster-2026":single&&cls.label?"roster-classification":"unverified",
      // Class alone cannot certify remaining seasons after redshirts, exceptions, or transfers.
      remainingEligibility:null,earliestDraftYear:null,draftEligible2027:null,
    });
  }
  const covered=out.filter(p=>p.schoolId===id&&p.classification).length;
  console.log("SCHOOL "+id+" "+covered+"/"+selected.size+" classified; ESPN roster entries "+athletes.length);
}
out.sort((a,b)=>a.schoolId.localeCompare(b.schoolId)||a.name.localeCompare(b.name));
if(out.length!==468)throw new Error("CFB population changed: "+out.length);
const result={schemaVersion:1,source:"2026 ESPN team rosters cross-referenced against manually audited Octagon CFB Wheel shortlist",snapshotAt:new Date().toISOString(),schoolCount:ids.length,population:out.length,classified:out.filter(p=>p.classification).length,officialOverrides:officialRows.length,exactMatches:out.filter(p=>p.matchStatus==="exact").length,failures,players:out};
mkdirSync("artifacts",{recursive:true});
writeFileSync("artifacts/cfb-gm-2026-classification-audit.json",JSON.stringify(result,null,2)+"\n");
console.log("AUDIT_SUMMARY "+JSON.stringify({population:result.population,classified:result.classified,exactMatches:result.exactMatches,failures:result.failures}));
console.log("CFB_AUDIT_LEDGER_JSON_START"+JSON.stringify(result)+"CFB_AUDIT_LEDGER_JSON_END");
