#!/usr/bin/env node
// Consume an isolated fresh provider artifact. Never write to data/generated,
// private authority, production GM contracts or any game-state table.
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {compareGmContractSnapshots} from "./gm-contract-compare.mjs";
const args=Object.fromEntries(process.argv.slice(2)
  .filter(arg=>arg.startsWith("--")).map(arg=>{
    const [key,...parts]=arg.slice(2).split("=");return [key,parts.join("=")];
  }));
const output=resolve(args.out??"tmp/wheel-monitor/gm-review.json");
const at=new Date().toISOString();
try {
  if(!args.generated) throw new Error("--generated must point to an isolated provider snapshot");
  const text=readFileSync("src/features/back-room/wheelFootballNflCurrentAuthority.ts","utf8");
  const file=text.match(/contractFile:\s*"([^"]+)"/)?.[1];
  if(!file || !/^wheel-nfl-gm-contracts-\d{4}-\d\d-\d\d\.json$/.test(file))
    throw new Error("Missing canonical current NFL GM contracts binding");
  const published=JSON.parse(readFileSync(resolve("data/generated/football",file),"utf8"));
  const generated=JSON.parse(readFileSync(resolve(args.generated),"utf8"));
  const report=compareGmContractSnapshots(published,generated,at);
  report.publishedFile=file;
  mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify({status:report.status,summary:report.summary,
    publishedDate:report.publishedDate,sourceQueryDate:report.sourceQueryDate}));
} catch(error) {
  mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,JSON.stringify({
    status:"source-review-failed",at,reason:String(error),changesApplied:0,
  },null,2)+"\n");
  console.error(String(error));
  process.exitCode=1;
}
