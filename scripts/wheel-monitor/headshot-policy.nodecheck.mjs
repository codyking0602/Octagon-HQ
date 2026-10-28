import test from "node:test";
import assert from "node:assert/strict";
import {headshotTarget,verifyHeadshots} from "./headshot-policy.mjs";
const root="/repo";
const row=(url,name="Fighter")=>({name,fighterId:name,division:"Flyweight",headshotUrl:url});
const image=(type="image/webp")=>({headers:{get:k=>k==="content-type"?type:null},body:{cancel:async()=>{}}});
test("blocks traversal, insecure hosts and missing image URL",()=>{
 assert.equal(headshotTarget("../secrets",root).error,"malformed-headshot-url");
 assert.equal(headshotTarget("/assets/fighters/../private.jpg",root).error,"unsafe-local-headshot-path");
 assert.equal(headshotTarget("http://a.espncdn.com/x.png",root).error,"unapproved-remote-headshot-host");
 assert.equal(headshotTarget("https://unknown.example/image.png",root).error,"unapproved-remote-headshot-host");
 assert.equal(headshotTarget("",root).error,"missing-headshot-url");
});
test("verifies local image file and public image response independently",async()=>{
 const seen=[];
 const result=await verifyHeadshots([row("/assets/fighters/a.webp")],{
   root,exists:file=>file==="/repo/public/assets/fighters/a.webp",
   fetcher:async url=>{seen.push(url);return image()},
 });
 assert.equal(result.verified,1);
 assert.equal(result.fullyVerified,true);
 assert.deepEqual(seen,["https://octagon.hq-app.workers.dev/assets/fighters/a.webp"]);
});
test("duplicate fighter/division URLs are probed once but counted twice",async()=>{
 let calls=0;
 const result=await verifyHeadshots([row("https://a.espncdn.com/i/a.png","A"),
   row("https://a.espncdn.com/i/a.png","B")],{root,
   fetcher:async()=>{calls++;return image("image/png")},
 });
 assert.equal(calls,1);assert.equal(result.total,2);assert.equal(result.verified,2);
});
test("HTTP image failures and locally absent files remain explicit blockers",async()=>{
 const result=await verifyHeadshots([row("/assets/fighters/missing.webp","A"),
   row("https://ufc.com/x.png","B")],{root,exists:()=>false,
   fetcher:async()=>image("text/html"),
 });
 assert.equal(result.fullyVerified,false);assert.equal(result.unverified.length,2);
 assert.equal(result.unverified[0].reason,"local-asset-missing");
 assert.equal(result.unverified[1].reason,"invalid-image-content-type");
});
test("GET range fallback supports CDNs that reject HEAD",async()=>{
 const methods=[];
 const result=await verifyHeadshots([row("https://a.espncdn.com/i/a.jpg")],{root,
   fetcher:async(_,{method})=>{methods.push(method);if(method==="HEAD")throw new Error("405");return image("image/jpeg");},
 });
 assert.deepEqual(methods,["HEAD","GET"]);assert.equal(result.verified,1);
});
