import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const proposals=read("data/curated/football/cfb/wheel-cfb-13-missing-grade-proposals-2026-10-25.json");
const priority=read("data/generated/football/cfb/wheel-football-current-priorities-2026.json");
const boise=read("data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json");
const key=x=>x.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"").replace(/(?:iii|ii|iv|jr|sr|v)$/,"");

test("exact 13 draft proposals have credible separate sources and no runtime authority status",()=>{
 assert.equal(proposals.players.length,13);
 assert.equal(proposals.status,"draft-owner-review-only-not-runtime-authority");
 assert.equal(proposals.publicationAuthorized,false);
 assert.equal(proposals.ownerApprovalRequired,true);
 assert.equal(proposals.currentlyGraded+proposals.proposedAdditions,1277);
 const seen=new Set();
 for(const player of proposals.players){
   assert.ok(player.displayName && player.school && player.curatedFamily);
   assert.ok(Number.isInteger(player.proposedHiddenGrade) &&
     player.proposedHiddenGrade>=60 && player.proposedHiddenGrade<=100);
   assert.ok(player.roleEvidence.length>=60 && player.peerCalibration.length>=20);
   assert.ok(player.primarySources.length>=1 &&
     player.primarySources.every(url=>url.startsWith("https://")));
   assert.equal(player.mustNotApplyUntilOwnerApproval,true);
   const bucket=priority.teams[player.school];
   assert.ok(bucket,"Unknown curated school: "+player.school);
   assert.ok(bucket[player.curatedFamily]?.some(name=>key(name)===key(player.displayName)),
     "Missing active candidate binding: "+player.displayName);
   const id=player.school+"|"+player.curatedFamily+"|"+key(player.displayName);
   assert.ok(!seen.has(id),"Repeated proposal identity: "+id);
   seen.add(id);
 }
});
test("family reclassifications are plainly flagged rather than silently applied",()=>{
 const moves=proposals.players.filter(x=>x.proposedFamily!==x.curatedFamily);
 assert.deepEqual(moves.map(x=>x.displayName).sort(),["Braylan Lovelace","Luke Mergott"]);
 assert.ok(moves.every(x=>x.proposedFamily==="Front Seven" &&
   x.familyDecision.includes("owner-approved")));
 const jimcoily=proposals.players.find(x=>x.displayName==="CJ Jimcoily");
 assert.ok(jimcoily.familyDecision.includes("conflict"));
});
