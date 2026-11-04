import assert from "node:assert/strict";

const origin=process.env.OCTAGON_PRODUCTION_ORIGIN??"https://the.hq-app.workers.dev";
const expectedSha=process.env.EXPECTED_SOURCE_SHA??"";
assert.match(expectedSha,/^[0-9a-f]{40}$/i,"Exact deployed SHA required");
const url=new URL("/api/nba/cup-2026-scoreboard",origin);
url.searchParams.set("delivery",expectedSha);
const response=await fetch(url,{
  cache:"no-store",
  headers:{Accept:"application/json","Cache-Control":"no-cache"},
  signal:AbortSignal.timeout(25000),
});
assert.equal(response.status,200,"Live NBA Cup scoreboard must return HTTP 200");
const contentType=response.headers.get("content-type")??"";
assert.match(contentType,/application\/json/i,
  "The NBA Cup endpoint must reach the Worker, not the SPA HTML fallback");
const data=await response.json();
assert.equal(data.source,"NBA+ESPN","The NBA Cup source must be the verified combined score feed");
assert.ok(Array.isArray(data.events),"NBA Cup results require an events array");
const opening=data.events.filter(event=>event.id?.startsWith("2026-10-30|"));
assert.equal(opening.length,10,"All ten opening-night Cup games must be recognized");
assert.ok(opening.every(event=>event.status==="final"),"Opening-night Cup scores must be final");
const detroit=opening.find(event=>event.id==="2026-10-30|DET|BKN");
assert.deepEqual([detroit?.awayScore,detroit?.homeScore],[110,94],
  "Detroit's official Cup opener must populate the standings as 1-0, +16");
console.log("NBA Cup live score API verified:",{origin,source:data.source,
  openingGames:opening.length,detroit:"DET 110 - BKN 94",sha:expectedSha});
