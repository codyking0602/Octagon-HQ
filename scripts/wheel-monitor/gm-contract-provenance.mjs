#!/usr/bin/env node
// Staged read-only GM provider publication proof. No canonical modification.
import {mkdirSync,writeFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {fetchWithRetry} from "./fetch-policy.mjs";
import {CONTRACT_RELEASE_API,verifyContractReleaseProvenance}
  from "./gm-contract-provenance-policy.mjs";
const out=resolve(process.argv.find(arg=>arg.startsWith("--out="))?.slice(6)
  ??"tmp/wheel-monitor/gm/provider-provenance.json");
const now=new Date().toISOString();
async function run(){
  const response=await fetchWithRetry(CONTRACT_RELEASE_API,{
    headers:{Accept:"application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN?{Authorization:"Bearer "+process.env.GITHUB_TOKEN}:{})},
  });
  const release=await response.json();
  const report=verifyContractReleaseProvenance(release,now);
  mkdirSync(dirname(out),{recursive:true});
  writeFileSync(out,JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify({status:report.status,
    providerPublishedAt:report.providerPublishedAt,
    ageDays:report.ageDays,loaderBytesMatched:report.loaderBytesMatchedToReleaseDigest,
    authorityChanges:0}));
}
run().catch(error=>{
  mkdirSync(dirname(out),{recursive:true});
  writeFileSync(out,JSON.stringify({schema:1,status:"provider-release-source-failed",
    observedAt:now,source:CONTRACT_RELEASE_API,
    reason:String(error),contractAuthorityChangesApplied:0},null,2)+"\n");
  console.error(String(error));process.exitCode=1;
});
