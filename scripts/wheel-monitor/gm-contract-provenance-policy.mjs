// Provider-originated publication evidence for nflreadpy's OTC-backed NFL
// contracts. An observation/query date is NOT a provider publication date.
// This attests the release asset's metadata, NOT the exact bytes read by a
// cached third-party loader; that separate fingerprint remains a hard gate.
export const CONTRACT_RELEASE_API=
  "https://api.github.com/repos/nflverse/nflverse-data/releases/tags/contracts";
export const CONTRACT_ASSET_URL=
  "https://github.com/nflverse/nflverse-data/releases/download/contracts/historical_contracts.parquet";
const expectedTimeAsset=
  "https://github.com/nflverse/nflverse-data/releases/download/contracts/timestamp.json";

function asset(release,name,url){
  const rows=(release.assets??[]).filter(row=>row.name===name);
  if(rows.length!==1) throw new Error("Missing or duplicate official contract release asset: "+name);
  const result=rows[0];
  if(result.browser_download_url!==url ||
    !/^sha256:[a-f0-9]{64}$/i.test(String(result.digest??"")) ||
    !Number.isSafeInteger(result.size) || result.size<20)
    throw new Error("Invalid contract release asset source, checksum or size: "+name);
  return result;
}
function publishStamp(date,now){
  const d=Date.parse(date??"");
  if(!Number.isFinite(d)||d>now||d<0)throw new Error("Invalid provider-published timestamp");
  return d;
}
export function verifyContractReleaseProvenance(release,observedAt,maxAgeDays=14) {
  if(release?.tag_name!=="contracts" || !Array.isArray(release.assets))
    throw new Error("Not the independently published contracts release");
  if(!Number.isInteger(maxAgeDays)||maxAgeDays<1 || maxAgeDays>31)
    throw new Error("Invalid source age policy");
  const now=Date.parse(observedAt);
  if(!Number.isFinite(now))throw new Error("Invalid source observation time");
  const data=asset(release,"historical_contracts.parquet",CONTRACT_ASSET_URL);
  const marker=asset(release,"timestamp.json",expectedTimeAsset);
  const published=publishStamp(data.updated_at,now);
  const markerStamp=publishStamp(marker.updated_at,now);
  if(Math.abs(published-markerStamp)>24*3600_000)
    throw new Error("Contract release dataset and timestamp metadata disagree");
  const ageDays=(now-published)/86400_000;
  return {
    schema:1,
    status:ageDays<=maxAgeDays?"provider-release-recent-loader-unbound":"provider-release-stale",
    source:"nflverse-data/contracts release assets (OTC origin)",
    releaseApiUrl:CONTRACT_RELEASE_API,
    datasetUrl:CONTRACT_ASSET_URL,
    assetName:data.name,
    assetId:data.id??null,
    providerPublishedAt:data.updated_at,
    providerUpdatedAtFromAsset:true,
    releasePageCreatedAt:release.published_at??null,
    releasePageCreatedAtIsNotDatasetPublishDate:true,
    observedAt,
    ageDays:Math.round(ageDays*100)/100,
    assetSha256:data.digest.slice(7).toLowerCase(),
    assetBytes:data.size,
    manifestPublishedAt:marker.updated_at,
    sourcePublicationCurrent:ageDays<=maxAgeDays,
    loaderBytesMatchedToReleaseDigest:false,
    sourceIdContractFullyCertified:false,
    contractAuthorityChangesApplied:0,
    gradeChangesApplied:0,
    note:"Verify the third-party loader used exact asset bytes and reconcile all 594 identities before source certification; this is metadata-only.",
  };
}
