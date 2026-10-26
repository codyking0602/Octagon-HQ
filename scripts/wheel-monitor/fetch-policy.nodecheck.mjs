import test from "node:test";
import assert from "node:assert/strict";
import {fetchWithRetry} from "./fetch-policy.mjs";
const response=(status,after=null)=>({
 status,ok:status>=200&&status<300,headers:{get:key=>key==="retry-after"?after:null},
});
test("permanent HTTP 401/403/404 fail immediately without consuming retry budget",async()=>{
 for(const status of [401,403,404]){
   let calls=0;
   await assert.rejects(fetchWithRetry("https://fake.invalid",{},4,{
     fetchImpl:async()=>{calls++;return response(status)},
     sleep:async()=>{throw new Error("should not sleep")},
   }),new RegExp("HTTP "+status));
   assert.equal(calls,1);
 }
});
test("429 honors bounded retry-after and preserves the original request",async()=>{
 const waits=[];let calls=0;
 const output=await fetchWithRetry("https://fake.invalid/api",{
   method:"POST",headers:{Authorization:"Bearer test"},body:"{}"},3,{
   fetchImpl:async(url,options)=>{
     calls++;
     assert.equal(url,"https://fake.invalid/api");
     assert.equal(options.method,"POST");
     assert.equal(options.headers.Authorization,"Bearer test");
     return response(calls===1?429:200,"2");
   },sleep:async ms=>waits.push(ms),
 });
 assert.equal(output.status,200);
 assert.equal(calls,2);
 assert.deepEqual(waits,[2000]);
});
test("repeated transient errors fail closed after finite attempts",async()=>{
 let calls=0;const waits=[];
 await assert.rejects(fetchWithRetry("https://fake.invalid",{},3,{
   fetchImpl:async()=>{calls++;return response(503)},
   sleep:async ms=>waits.push(ms),
 }),/HTTP 503/);
 assert.equal(calls,3);
 assert.deepEqual(waits,[500,1000]);
});
test("network interruption may recover without altering evidence",async()=>{
 let calls=0;
 const result=await fetchWithRetry("https://fake.invalid",{},2,{
   fetchImpl:async()=>{if(++calls===1)throw new Error("socket dropped");return response(200)},
   sleep:async()=>{},
 });
 assert.equal(calls,2);
 assert.equal(result.status,200);
});
test("retry attempts are bounded and malformed invocation is rejected",async()=>{
 await assert.rejects(fetchWithRetry("https://fake.invalid",{},0),/Invalid source retry/);
 let calls=0;
 await assert.rejects(fetchWithRetry("https://fake.invalid",{},1,{
   fetchImpl:async()=>{calls++;throw new Error("timeout")},
 }),/timeout/);
 assert.equal(calls,1);
});
