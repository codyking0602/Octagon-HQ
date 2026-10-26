#!/usr/bin/env node
// The GitHub release asset has its own update timestamp and checksum;
// the date we queried nflreadpy is NEVER substituted as the publisher date.
// This is metadata provenance, not a claim that downloaded bytes were pinned.
import {writeFileSync,mkdirSync} from "node:fs";
import {dirname,resolve} from "node:path";
export const CONTRACT_RELEASE_URL=
  "https://api.github.com/repos/nflverse/nflverse-data/releases/tags/contracts";
export const CONTRACT_ASSET="historical_contracts.parquet";

export function reviewContractRelease(release,at=new Date().toISOString(),maxAgeDays=14){
  if(typeof at!=="string" || !Number.isFinite(Date.parse(at)) ||
      !Number.isInteger(maxAgeDays) || maxAgeDays<1 || maxAgeDays>30)
    throw new Error("Invalid independent contract release observation policy");
  const assets=release?.assets;
  if(release?.tag_name!=="contracts" || !Array.isArray(assets))
    throw new Error("Wrong/missing nflverse contracts release");
  const matches=assets.filter(x=>x.name===CONTRACT_ASSET);
  if(matches.length!==1) throw new Error("Missing/ambiguous historical contracts parquet asset");
  const x=matches[0];
  const publishedAt=x.updated_at;
  const publishedMs=Date.parse(publishedAt), observedMs=Date.parse(at);
  const digest=String(x.digest??"");
  if(!Number.isFinite(publishedMs) || publishedMs>observedMs+20*60*1000 ||
      typeof x.size!=="number" || x.size<100000 ||
      !/^sha256:[a-f0-9]{64}$/i.test(digest) ||
      typeof x.browser_download_url!=="string" ||
      x.browser_download_url!==
      "https://github.com/nflverse/nflverse-data/releases/download/contracts/"+CONTRACT_ASSET)
    throw new Error("Contract release artifact lacks verified publication metadata");
  const ageDays=Math.round((observedMs-publishedMs)/864000)/100;
  return {
    schema:1,status:ageDays<=maxAgeDays?
      "provider-release-freshness-observed":"provider-release-stale-review-held",
    observedAt:at,sourcePublicationAt:publishedAt,
    sourceAssetName:x.name,sourceAssetUrl:x.browser_download_url,
    sourceReleaseApiUrl:CONTRACT_RELEASE_URL,
    digestSha256:digest.slice(7),assetBytes:x.size,sourceAgeDays:ageDays,
    maximumAllowedSourceAgeDays:maxAgeDays,
    independentlyObservedProviderReleaseFreshness:ageDays<=maxAgeDays,
    // The generator may cache the original dataset. Publication of an asset
    // alone does NOT prove its local downloaded bytes or upstream OTC truth.
    generatedContractByteDigestMatched:false,
    otcSourceContractTruthCertified:false,
    contractAuthorityChangesApplied:0,ratingsChanged:0,
  };
}

if(process.argv[1] && /gm-provider-provenance\.mjs$/.test(process.argv[1])){
  const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith("--"))
    .map(x=>{const [k,...value]=x.slice(2).split("=");return [k,value.join("=")];}));
  if(!args.out) throw new Error("Missing required --out");
  const observedAt=new Date().toISOString(),out=resolve(args.out);
  mkdirSync(dirname(out),{recursive:true});
  try{
    const resp=await fetch(CONTRACT_RELEASE_URL,{headers:{
      Accept:"application/vnd.github+json","User-Agent":"Octagon-HQ-read-only-contract-provenance",
    },signal:AbortSignal.timeout(20000)});
    if(!resp.ok) throw new Error("GitHub publisher provenance HTTP "+resp.status);
    const report=reviewContractRelease(await resp.json(),observedAt);
    writeFileSync(out,JSON.stringify(report,null,2)+"\n");
    console.log(JSON.stringify({status:report.status,
      assetUpdatedAt:report.sourcePublicationAt,sourceAgeDays:report.sourceAgeDays,
      independentFreshness:report.independentlyObservedProviderReleaseFreshness,
      byteMatched:report.generatedContractByteDigestMatched}));
    if(!report.independentlyObservedProviderReleaseFreshness) process.exitCode=2;
  }catch(e){
    writeFileSync(out,JSON.stringify({status:"source-provenance-unavailable",
      observedAt,reason:String(e),contractAuthorityChangesApplied:0},null,2)+"\n");
    console.error(String(e));process.exitCode=1;
  }
}
