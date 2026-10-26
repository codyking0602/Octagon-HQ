import test from "node:test";
import assert from "node:assert/strict";
import {reviewContractRelease,CONTRACT_ASSET} from "./gm-provider-provenance.mjs";

const at="2026-10-25T20:00:00Z";
const asset=(updated="2026-10-25T12:28:02Z")=>({
  name:CONTRACT_ASSET,updated_at:updated,size:11168541,
  digest:"sha256:"+"a".repeat(64),
  browser_download_url:"https://github.com/nflverse/nflverse-data/releases/download/contracts/"+CONTRACT_ASSET,
});
const release=(a=asset())=>({tag_name:"contracts",assets:[a]});
test("release asset update time, not scan date, establishes observable provider freshness",()=>{
  const result=reviewContractRelease(release(),at);
  assert.equal(result.status,"provider-release-freshness-observed");
  assert.equal(result.sourcePublicationAt,"2026-10-25T12:28:02Z");
  assert.equal(result.independentlyObservedProviderReleaseFreshness,true);
  assert.equal(result.generatedContractByteDigestMatched,false);
  assert.equal(result.otcSourceContractTruthCertified,false);
  assert.equal(result.contractAuthorityChangesApplied,0);
});
test("stale provider release is a review hold, not a fresh query",()=>{
  const result=reviewContractRelease(release(asset("2026-09-01T00:00:00Z")),at);
  assert.equal(result.status,"provider-release-stale-review-held");
  assert.equal(result.independentlyObservedProviderReleaseFreshness,false);
});
test("malformed, ambiguous, and future-dated asset metadata fail closed",()=>{
  assert.throws(()=>reviewContractRelease(release({...asset(),digest:null}),at),/metadata/);
  assert.throws(()=>reviewContractRelease(release(asset("2026-10-26T03:00:00Z")),at),/metadata/);
  assert.throws(()=>reviewContractRelease({tag_name:"contracts",assets:[asset(),asset()]},at),/ambiguous/);
  assert.throws(()=>reviewContractRelease({tag_name:"players",assets:[asset()]},at),/Wrong/);
  assert.throws(()=>reviewContractRelease({tag_name:"contracts",assets:[]},at),/Missing/);
});
