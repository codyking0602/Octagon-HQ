// NFL Wheel GM read-only contract source comparison. No ratings, grading,
// published contracts, or canonical GM authorities may be modified here.
import { createHash } from "node:crypto";
const nameKey = value=>String(value??"").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g,"").toLowerCase()
  .replace(/[^a-z0-9]/g,"").replace(/(?:iii|ii|iv|jr|sr|v)$/,"");
const getKey=row=>[row.team,row.family,row.normalizedName??nameKey(row.player)].join("|");
function indexSnapshot(doc,label) {
  if(!Array.isArray(doc?.players)||!doc.players.length)
    throw new Error(label+" missing GM contract player records");
  const map=new Map();
  for(const row of doc.players) {
    const key=getKey(row);
    if(!row.team || !row.family || !row.player || !row.source?.provider ||
       !Number.isSafeInteger(row.salaryApy) || row.salaryApy<=0 ||
       !Number.isInteger(row.realContractEndSeason) ||
       !["1YR","3YR"].includes(row.gameContract) ||
       !Array.isArray(row.gmEligibleSlots) || !row.gmEligibleSlots.length)
      throw new Error(label+" malformed GM contract record "+key);
    if(map.has(key)) throw new Error(label+" duplicated GM identity "+key);
    map.set(key,row);
  }
  return map;
}
const digest=value=>createHash("sha256").update(JSON.stringify(value)).digest("hex");
export function compareGmContractSnapshots(published,generated,observedAt) {
  const old=indexSnapshot(published,"published");
  const next=indexSnapshot(generated,"generated");
  const keys=[...new Set([...old.keys(),...next.keys()])].sort();
  const changes=[], missing=[], extra=[];
  const fields=["salaryApy","realContractEndSeason","gameContract","position","age"];
  for(const key of keys) {
    const prev=old.get(key),cur=next.get(key);
    if(!cur){missing.push(key);continue;}
    if(!prev){extra.push(key);continue;}
    const differences=fields.filter(field=>String(prev[field]??"")!==String(cur[field]??""));
    if(JSON.stringify([...(prev.gmEligibleSlots??[])].sort())!==
       JSON.stringify([...(cur.gmEligibleSlots??[])].sort()))
      differences.push("gmEligibleSlots");
    if(String(prev.source?.otcId??"")!==String(cur.source?.otcId??""))
      differences.push("source.otcId");
    if(differences.length) {
      changes.push({key,player:cur.player,team:cur.team,family:cur.family,
        differences,previous:Object.fromEntries(differences.map(field=>
          [field,field==="source.otcId"?prev.source?.otcId:prev[field]])),
        current:Object.fromEntries(differences.map(field=>
          [field,field==="source.otcId"?cur.source?.otcId:cur[field]])),
        sourceUrl:cur.source?.playerPage??null,
      });
    }
  }
  const sourceUrl=generated.source??"https://nflreadr.nflverse.com/reference/load_contracts.html";
  return {
    status:missing.length||extra.length?"identity-review-blocked":
      changes.length?"contract-fact-review-required":"unchanged",
    observedAt,sourceUrl,
    publishedDate:published.snapshotDate,sourceQueryDate:generated.snapshotDate,
    publishedCount:old.size,generatedCount:next.size,missing,extra,changes,
    summary:{changed:changes.length,missing:missing.length,extra:extra.length,
      unchanged:[...next.keys()].filter(key=>old.has(key)).length-changes.length},
    sourceProvenanceStatus:"provider-dataset-freshness-not-independently-certified",
    economyRegressionStatus:"not-run",
    gradeChangesApplied:0,contractChangesApplied:0,ratingPrCreated:false,
    publishedHash:digest([...old].sort()),
    generatedHash:digest([...next].sort()),
  };
}
