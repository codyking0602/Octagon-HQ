// Adapter over the canonical Wheel change policy introduced on main in PR #2126.
// This module adds source reconciliation/coverage only; it is NOT a second rating authority.
import {
  UFC_MENS_DIVISIONS, LEVEL, verifyUfcRankings, classifyWheelChange,
} from "../wheel-monitor-change-policy.mjs";
export const DIVISIONS = UFC_MENS_DIVISIONS;
export const NFL_CODES = new Set(
  "ARI ATL BAL BUF CAR CHI CIN CLE DAL DEN DET GB HOU IND JAX KC LAC LAR LV MIA MIN NE NO NYG NYJ PHI PIT SEA SF TB TEN WSH".split(" "),
);
export function assert(ok, message) {
  if (!ok) throw new Error(message);
}
export function nameKey(value) {
  return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]/g, "").replace(/(?:iii|ii|iv|jr|sr|v)$/g, "");
}
export function identity(row) {
  return [row.sport, row.team ?? row.division, row.family ?? "fighter", nameKey(row.name)].join("|");
}
export function validateUfc(rows) {
  return verifyUfcRankings(rows.map(row=>({
    division:row.division, identityKey:row.fighterId??identity(row),
    isChampion:row.champion, ranking:row.rank, active:true,
  })));
}
export function validateCatalog(rows, sport) {
  assert(Array.isArray(rows) && rows.length, sport+" active population is missing");
  const keys=rows.map(identity);
  assert(new Set(keys).size===keys.length,sport+" has duplicate active identities");
  for(const row of rows){
    assert(row.sport===sport && row.name && (row.team||row.division),
      "Missing "+sport+" canonical identity");
    assert(Number.isFinite(row.grade)&&row.grade>=0&&row.grade<=100,
      "Invalid private "+sport+" overall");
  }
  if(sport==="ufc") validateUfc(rows);
  return rows.length;
}
export function validateFlex(teams) {
  for(const [team,group] of Object.entries(teams)){
    const allowed = new Set(["RB","WR","TE"].flatMap(f=>(group[f]??[]).map(nameKey)));
    for(const name of group.Flex??[])
      assert(allowed.has(nameKey(name)),
        team+" Flex is not inherited from RB/WR/TE: "+name);
  }
}
function forPolicy(row, previous = false) {
  if(!row) return null;
  return {
    identityKey:identity(row), sport:row.sport,
    team: row.sourceTeam??row.team,
    division:row.division, ranking:row.rank, isChampion:!!row.champion,
    role:row.sourceRole??null,
    // Missing from an ESPN roster is uncertainty, not verified release.
    rosterStatus:null,
  };
}
export function compareEvidence(current, previous=null) {
  const old = new Map((previous?.identities??[]).map(row=>[identity(row),row]));
  return current.map(row=>{
    const key=identity(row);
    const prior=old.get(key);
    const source={sourceUrl:row.sourceUrl??"unknown",observedAt:row.checkedAt??new Date().toISOString()};
    const decision=classifyWheelChange(
      forPolicy(prior??row,true),forPolicy(row),source);
    // Baseline does not label all existing players as "new" on first run.
    let level=decision.level,reasons=[...decision.reasons];
    if(prior==null && previous){
      level=LEVEL.FACT;
      reasons.push("new-canonical-identity-requires-reconciliation");
    }
    if(row.sourceStatus==="missing" && prior?.sourceStatus!=="missing"
      && level===LEVEL.NONE) {
      level=LEVEL.REVIEW;
      reasons.push("roster-absence-not-proof-of-release");
    }
    if(row.sourceStatus==="missing" && !previous && level===LEVEL.NONE) {
      level=LEVEL.REVIEW;
      reasons.push("baseline-roster-identity-missing");
    }
    if(row.sourceTeam && row.sourceTeam!==row.team) {
      level=LEVEL.FACT;
      reasons.push("verified-mismatched-team-affiliation");
    }
    const signals=reasons.map(reason=>({kind:reason,reason,source:source.sourceUrl}));
    return {key,sport:row.sport,name:row.name,family:row.family??null,
      team:row.team??row.division,gradePreserved:true,
      classification:level,signals,
      checkedAt:row.checkedAt,sourceStatus:row.sourceStatus,sourceUrl:row.sourceUrl};
  });
}
export function summarizeDecisions(decisions) {
  const breakdown=Object.fromEntries(Object.values(LEVEL).map(level=>[level,0]));
  for(const decision of decisions) breakdown[decision.classification]++;
  return {covered:decisions.length,breakdown,
    deepReviewCandidates:breakdown[LEVEL.REVIEW]+breakdown[LEVEL.PRIORITY]};
}

export function selectApprovedGrades(rows, sport, approvedKeys) {
  assert(approvedKeys instanceof Set, "Canonical active-priority keys required");
  const selected=[], stale=[];
  const matched=new Set(), prefix=sport.toUpperCase()+":";
  for(const row of rows) {
    const key=prefix+[row.team,row.family,row.nameKey].join(":");
    if(!approvedKeys.has(key)) {stale.push(key);continue;}
    assert(!matched.has(key),"Duplicate latest current grade: "+key);
    matched.add(key);
    selected.push(row);
  }
  const missing=[...approvedKeys].filter(key=>key.startsWith(prefix)&&!matched.has(key));
  return {selected,missing,stale,expected:[...approvedKeys].filter(key=>key.startsWith(prefix)).length};
}
export function snapshotReadiness(blockers) {
  assert(Array.isArray(blockers),"Review blockers must be explicit");
  return {status:blockers.length?"review-blocked":"source-certified",snapshotReady:blockers.length===0,blockers};
}

export function validateOfficialUfcTable(rows, division) {
  const champions=rows.filter(r=>r.champion===true);
  const contenders=rows.filter(r=>r.champion===false).sort((a,b)=>a.rank-b.rank);
  if(champions.length!==1 || contenders.length!==15 ||
    new Set(rows.map(r=>nameKey(r.name))).size!==16 ||
    contenders.some((r,i)=>!Number.isInteger(r.rank) || r.rank<1 || r.rank>15 ||
      (i===0 ? r.rank!==1 : r.rank!==contenders[i-1].rank && r.rank!==i+1))) {
    return {valid:false,division,tiedRanks:[]};
  }
  const tiedRanks=contenders.filter((r,i)=>i>0 && r.rank===contenders[i-1].rank)
    .map(r=>({rank:r.rank,name:r.name}));
  return {valid:true,division,tiedRanks};
}
