import test from "node:test";
import assert from "node:assert/strict";
import {CONTRACT_ASSET_URL,verifyContractReleaseProvenance}
  from "./gm-contract-provenance-policy.mjs";

const url="https://github.com/nflverse/nflverse-data/releases/download/contracts/";
const date="2026-10-25T12:28:02Z";
const now="2026-10-26T03:00:00Z";
const valid=(stamp=date,marker=stamp)=>({
  tag_name:"contracts",published_at:"2022-04-25T19:40:32Z",
  assets:[
    {name:"historical_contracts.parquet",
      browser_download_url:CONTRACT_ASSET_URL,
      updated_at:stamp,id:321,size:999,digest:"sha256:"+("f".repeat(64))},
    {name:"timestamp.json",
      browser_download_url:url+"timestamp.json",
      updated_at:marker,id:322,size:43,digest:"sha256:"+("a".repeat(64))},
  ],
});
test("fresh provider asset is dated independently of 2022 release creation",()=>{
  const result=verifyContractReleaseProvenance(valid(),now);
  assert.equal(result.status,"provider-release-recent-loader-unbound");
  assert.equal(result.providerPublishedAt,date);
  assert.equal(result.releasePageCreatedAtIsNotDatasetPublishDate,true);
  assert.equal(result.sourcePublicationCurrent,true);
  assert.equal(result.loaderBytesMatchedToReleaseDigest,false);
  assert.equal(result.sourceIdContractFullyCertified,false);
  assert.equal(result.contractAuthorityChangesApplied,0);
});
test("stale provider release cannot be certified using today query date",()=>{
  const old="2026-09-01T01:00:00Z";
  const result=verifyContractReleaseProvenance(valid(old),now);
  assert.equal(result.status,"provider-release-stale");
  assert.equal(result.sourcePublicationCurrent,false);
});
test("missing/duplicate/misidentified release files fail closed",()=>{
  const gone=valid();gone.assets.pop();
  assert.throws(()=>verifyContractReleaseProvenance(gone,now),/Missing or duplicate/);
  const dup=valid();dup.assets.push({...dup.assets[0]});
  assert.throws(()=>verifyContractReleaseProvenance(dup,now),/Missing or duplicate/);
  const other=valid();other.tag_name="player_stats";
  assert.throws(()=>verifyContractReleaseProvenance(other,now),/independently published/);
  const urlChanged=valid();urlChanged.assets[0].browser_download_url="https://other.invalid/data";
  assert.throws(()=>verifyContractReleaseProvenance(urlChanged,now),/Invalid contract release/);
});
test("bad content fingerprint, future date or timestamp mismatch fail closed",()=>{
  const invalid=valid();invalid.assets[0].digest=""; 
  assert.throws(()=>verifyContractReleaseProvenance(invalid,now),/checksum/);
  assert.throws(()=>verifyContractReleaseProvenance(valid("2026-10-27T12:00:00Z"),now),/published timestamp/);
  assert.throws(()=>verifyContractReleaseProvenance(valid(date,"2026-10-20T12:00:00Z"),now),/disagree/);
  assert.throws(()=>verifyContractReleaseProvenance(valid(),now,0),/age policy/);
});
