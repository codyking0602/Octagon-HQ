import test from "node:test";
import assert from "node:assert/strict";
import {auditNflReleaseAssets,NFL_RELEASES} from "./nfl-source-provenance.mjs";
const at="2026-10-26T03:40:00Z";
function fixture(overrides={}){
  return Object.fromEntries(Object.values(NFL_RELEASES).map(x=>{
    const filename=x.file(2026);
    return [x.tag,{tag_name:x.tag,assets:[{
      name:filename,updated_at:overrides[x.tag]??"2026-10-25T09:00:00Z",
      size:200000,digest:"sha256:"+"a".repeat(64),
      browser_download_url:"https://github.com/nflverse/nflverse-data/releases/download/"+x.tag+"/"+filename,
    }]}];
  }));
}
test("published source-asset times are recorded distinctly from observation time",()=>{
  const out=auditNflReleaseAssets(fixture(),2026,at);
  assert.equal(out.status,"publisher-assets-recent");
  assert.equal(out.sourcePublisherAssetsFresh,true);
  assert.equal(out.sources.production.filename,"stats_player_week_2026.parquet");
  assert.equal(out.sources.snaps.filename,"snap_counts_2026.parquet");
  assert.equal(out.sources.identityMaster.filename,"players.parquet");
  assert.equal(out.sources.production.publisherUpdatedAt,"2026-10-25T09:00:00Z");
  assert.equal(out.sourceCollectorLoadedByteHashMatched,false);
  assert.equal(out.fullyIndependentStatValidityCertified,false);
  assert.equal(out.abilityChangesApplied,0);
});
test("old snap counts are explicitly held even when fetched right now",()=>{
  const out=auditNflReleaseAssets(fixture({snap_counts:"2026-09-01T08:00:00Z"}),2026,at);
  assert.equal(out.status,"publisher-asset-staleness-hold");
  assert.equal(out.sources.snaps.publisherAssetCurrent,false);
  assert.equal(out.sourcePublisherAssetsFresh,false);
});
test("source metadata fail-closed for old tag, wrong year, duplicate and missing digest",()=>{
  const x=fixture();
  x.stats_player.assets[0].digest=null;
  assert.throws(()=>auditNflReleaseAssets(x,2026,at),/integrity/);
  const y=fixture();
  y.players.assets.push({...y.players.assets[0]});
  assert.throws(()=>auditNflReleaseAssets(y,2026,at),/duplicated/);
  assert.throws(()=>auditNflReleaseAssets(fixture(),2025,at),/missing or duplicated/);
});
