#!/usr/bin/env node
// Independently record nflverse GitHub release ASSET update timestamps.
// Release creation timestamps (often years old) and local observation times
// must never be passed off as per-season dataset publication timestamps.
import {mkdirSync,writeFileSync} from "node:fs";
import {dirname,resolve} from "node:path";

export const NFL_RELEASES=Object.freeze({
  production:{tag:"stats_player",file:season=>"stats_player_week_"+season+".parquet",maxAgeDays:7},
  snaps:{tag:"snap_counts",file:season=>"snap_counts_"+season+".parquet",maxAgeDays:14},
  identityMaster:{tag:"players",file:()=>"players.parquet",maxAgeDays:30},
});
const apiUrl=tag=>"https://api.github.com/repos/nflverse/nflverse-data/releases/tags/"+tag;

export function auditNflReleaseAssets(releases,season,at=new Date().toISOString()){
  const instant=Date.parse(at);
  if(!Number.isInteger(season) || season<2020 || season>2099 ||
     !Number.isFinite(instant))
    throw new Error("Invalid NFL release season/observation time");
  const assets={};
  for(const [kind,config] of Object.entries(NFL_RELEASES)){
    const source=releases?.[config.tag];
    if(source?.tag_name!==config.tag || !Array.isArray(source.assets))
      throw new Error("Missing "+kind+" publisher release data");
    const filename=config.file(season);
    const candidates=source.assets.filter(a=>a.name===filename);
    if(candidates.length!==1) throw new Error(kind+" publisher asset missing or duplicated");
    const candidate=candidates[0],updated=Date.parse(candidate.updated_at);
    if(!Number.isFinite(updated) || updated>instant+20*60000 ||
       !Number.isInteger(candidate.size) || candidate.size<1000 ||
       !/^sha256:[a-f0-9]{64}$/i.test(String(candidate.digest??"")) ||
       candidate.browser_download_url!==
       "https://github.com/nflverse/nflverse-data/releases/download/"+config.tag+"/"+filename)
      throw new Error(kind+" publisher asset fails integrity/metadata validation");
    const ageDays=Math.round((instant-updated)/864000)/100;
    assets[kind]={
      filename,sourceUrl:candidate.browser_download_url,
      publisherApiUrl:apiUrl(config.tag),
      publisherUpdatedAt:candidate.updated_at,
      ageDays,maxAgeDays:config.maxAgeDays,
      digestSha256:candidate.digest.slice(7),assetBytes:candidate.size,
      publisherAssetCurrent:ageDays<=config.maxAgeDays,
    };
  }
  const current=Object.values(assets).every(x=>x.publisherAssetCurrent);
  return {
    schema:1,season,observedAt:at,
    status:current?"publisher-assets-recent":"publisher-asset-staleness-hold",
    sources:assets,
    sourcePublisherAssetsFresh:current,
    sourceCollectorLoadedByteHashMatched:false,
    fullyIndependentStatValidityCertified:false,
    abilityChangesApplied:0,contractsChanged:0,
  };
}

if(process.argv[1] && /nfl-source-provenance\.mjs$/.test(process.argv[1])){
  const args=Object.fromEntries(process.argv.slice(2).filter(v=>v.startsWith("--"))
    .map(v=>{const [k,...parts]=v.slice(2).split("=");return [k,parts.join("=")];}));
  const season=Number(args.season);
  if(!args.out || !Number.isInteger(season))throw new Error("--season and --out required");
  const at=new Date().toISOString(),out=resolve(args.out);
  mkdirSync(dirname(out),{recursive:true});
  try{
    const entries=await Promise.all([...new Set(Object.values(NFL_RELEASES).map(x=>x.tag))]
      .map(async tag=>{
        const response=await fetch(apiUrl(tag),{
          headers:{Accept:"application/vnd.github+json","User-Agent":"Octagon-HQ-read-only-NFL-source-audit",
            ...(process.env.GH_TOKEN?{Authorization:"Bearer "+process.env.GH_TOKEN}:{})},
          signal:AbortSignal.timeout(20000),
        });
        if(!response.ok)throw new Error(tag+" publisher HTTP "+response.status);
        return [tag,await response.json()];
      }));
    const report=auditNflReleaseAssets(Object.fromEntries(entries),season,at);
    writeFileSync(out,JSON.stringify(report,null,2)+"\n");
    console.log(JSON.stringify({status:report.status,
      publisherAssetsFresh:report.sourcePublisherAssetsFresh,
      sourceDates:Object.fromEntries(Object.entries(report.sources)
        .map(([k,v])=>[k,v.publisherUpdatedAt])),
      collectorBytesVerified:report.sourceCollectorLoadedByteHashMatched}));
    if(!report.sourcePublisherAssetsFresh)process.exitCode=2;
  }catch(error){
    writeFileSync(out,JSON.stringify({status:"publisher-metadata-unavailable",at,
      sourcePublisherAssetsFresh:false,error:String(error),
      abilityChangesApplied:0},null,2)+"\n");
    console.error(String(error));process.exitCode=1;
  }
}
