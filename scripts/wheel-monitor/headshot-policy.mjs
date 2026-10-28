// Read-only UFC headshot verifier. Local files must exist in the checkout,
// and public HTTP assets must actually serve an image. No auto replacements.
import {existsSync} from "node:fs";
import {resolve} from "node:path";
import {fetchWithRetry} from "./fetch-policy.mjs";

const TRUSTED_IMAGE_HOSTS=new Set(["a.espncdn.com","ufc.com","www.ufc.com",
  "octagon.hq-app.workers.dev","the.hq-app.workers.dev"]);

export function headshotTarget(value,root,productionOrigin="https://octagon.hq-app.workers.dev") {
  if(typeof value!=="string" || !value.trim()) return {error:"missing-headshot-url"};
  if(value.startsWith("/assets/fighters/")) {
    if(value.includes("..") || value.includes("?") || value.includes("#") ||
       !/^\/assets\/fighters\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp)$/i.test(value))
      return {error:"unsafe-local-headshot-path"};
    const file=resolve(root,"public",value.slice(1));
    return {file,url:productionOrigin+value,sourceKind:"checked-in-asset"};
  }
  try {
    const uri=new URL(value);
    if(uri.protocol!=="https:" || !TRUSTED_IMAGE_HOSTS.has(uri.hostname))
      return {error:"unapproved-remote-headshot-host"};
    return {url:uri.href,sourceKind:"external-image"};
  } catch {
    return {error:"malformed-headshot-url"};
  }
}

export async function verifyHeadshots(rows,{root,productionOrigin,
  exists=existsSync,fetcher=fetchWithRetry,concurrency=6}={}) {
  if(!root || !Array.isArray(rows)) throw new Error("Headshot audit requires roster and repository root");
  const unique=[...new Set(rows.map(row=>row.headshotUrl??""))];
  const findings=new Map();
  let cursor=0;
  async function worker() {
    while(cursor<unique.length) {
      const raw=unique[cursor++];
      const target=headshotTarget(raw,root,productionOrigin);
      if(target.error){findings.set(raw,{status:"unverified",reason:target.error});continue;}
      if(target.file && !exists(target.file)) {
        findings.set(raw,{status:"unverified",reason:"local-asset-missing"});continue;
      }
      let verified=false,detail="remote-image-unverified";
      for(const method of ["HEAD","GET"]) {
        try {
          const response=await fetcher(target.url,
            {method,headers:method==="GET"?{Range:"bytes=0-0"}:{}},2);
          const contentType=String(response.headers.get("content-type")??"").toLowerCase();
          verified=contentType.startsWith("image/");
          detail=verified?"verified":"invalid-image-content-type";
          await response.body?.cancel?.();
          if(verified) break;
        } catch(error) {detail=String(error).slice(0,180);}
      }
      findings.set(raw,{status:verified?"verified":"unverified",
        reason:verified?null:detail,sourceKind:target.sourceKind});
    }
  }
  await Promise.all(Array.from({length:Math.min(concurrency,unique.length||1)},worker));
  const missing=[],unverified=[];
  const byKind={};
  for(const row of rows) {
    const result=findings.get(row.headshotUrl??"");
    const kind=result?.sourceKind??"unknown";
    byKind[kind]=(byKind[kind]??0)+1;
    if(result?.status==="verified") continue;
    const finding={fighterId:row.fighterId,division:row.division,
      name:row.name,url:row.headshotUrl??null,reason:result?.reason??"unverified"};
    (finding.reason==="missing-headshot-url"?missing:unverified).push(finding);
  }
  return {total:rows.length,uniqueUrls:unique.length,
    verified:rows.length-missing.length-unverified.length,
    localOrRemoteCounts:byKind,missing,unverified,
    fullyVerified:missing.length+unverified.length===0};
}
