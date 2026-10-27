#!/usr/bin/env node
// Read-only recovery of EA Madden NFL 27 Week 3 as an October 3, 2026 reference.
// Never substitute a live/current EA dataset when history is unavailable.
import {mkdirSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {canonicalize} from "./nfl-madden-review.mjs";

const SOURCE="https://drop-api.ea.com/rating/madden-nfl";
const AS_OF="2026-10-03";
const REFERENCE_WEEK=3;
const PAGE_SIZE=100;

export function selectOct3Iteration(filters){
  const rows=filters?.iterations;
  if(!Array.isArray(rows)||!rows.length)
    throw new Error("EA historical iterations unavailable; cannot certify October 3 baseline");
  const pattern=new RegExp("(?:^|[^0-9])week[\\s_-]*"+REFERENCE_WEEK+"(?:$|[^0-9])","i");
  const matches=rows.filter(row=>pattern.test(String(row?.id??""))||pattern.test(String(row?.label??"")));
  if(matches.length!==1||!matches[0].id)
    throw new Error("Expected exactly one EA Week 3 historical iteration, found "+matches.length+"; manual verification required");
  return matches[0];
}
async function getJson(url){
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const response=await fetch(url,{headers:{"User-Agent":"OctagonHQ-NFL-Review/1.0","Accept":"application/json"},
        signal:AbortSignal.timeout(15000)});
      if(!response.ok)throw new Error("EA HTTP "+response.status);
      return await response.json();
    }catch(error){
      if(attempt===3)throw error;
      await new Promise(ok=>setTimeout(ok,attempt*1000));
    }
  }
}
export async function retrieveOct3Benchmark(){
  const iteration=selectOct3Iteration(await getJson(SOURCE+"/filters?locale=en"));
  const all=[];
  let total=null;
  for(let offset=0;total===null||offset<total;offset+=PAGE_SIZE){
    const u=new URL(SOURCE);
    u.searchParams.set("locale","en");u.searchParams.set("limit",String(PAGE_SIZE));
    u.searchParams.set("offset",String(offset));u.searchParams.set("iteration",String(iteration.id));
    const response=await getJson(u.toString());
    if(!Number.isInteger(response?.totalItems)||response.totalItems<1700||
      response.totalItems>4000||!Array.isArray(response.items))
      throw new Error("EA historical ratings returned an invalid population");
    if(total===null)total=response.totalItems;
    if(total!==response.totalItems||!response.items.length)
      throw new Error("EA historical ratings pagination is incomplete or inconsistent");
    if(response.items.some(row=>row.iteration?.id&&row.iteration.id!==iteration.id))
      throw new Error("EA returned players from a different ratings iteration");
    all.push(...response.items);
  }
  if(all.length!==total)
    throw new Error("EA historical census mismatch: expected "+total+"; got "+all.length);
  // The observedAt cutoff is NOT a claim that this data was downloaded October 3.
  const baseline=canonicalize(all,AS_OF+"T23:59:59Z");
  baseline.provenance={kind:"EA archived historical iteration",asOfDate:AS_OF,
    referenceWeek:REFERENCE_WEEK,iterationId:iteration.id,
    iterationLabel:iteration.label??null,retrievedAt:new Date().toISOString(),
    observationNote:"Week 3 version as an October 3 historical reference, not a contemporaneous capture."};
  return baseline;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const arg=process.argv.slice(2).find(x=>x.startsWith("--out="));
  if(!arg)throw new Error("--out=PATH is required");
  retrieveOct3Benchmark().then(data=>{
    const dest=resolve(arg.slice(6));mkdirSync(dirname(dest),{recursive:true});
    writeFileSync(dest,JSON.stringify(data,null,2)+"\n");
    console.log(JSON.stringify({asOfDate:AS_OF,referenceWeek:REFERENCE_WEEK,
      iterationId:data.provenance.iterationId,players:data.playerCount,output:dest}));
  }).catch(e=>{console.error(String(e));process.exitCode=1;});
}