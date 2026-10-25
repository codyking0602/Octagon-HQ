import { test } from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createReviewReceipt,flattenEspnRoster,inventoryFromAuthorities,wheelPriorityIdentityKeys} from "./wheel-monitor-census-policy.mjs";
const divisions=["Flyweight","Bantamweight","Featherweight","Lightweight","Welterweight","Middleweight","Light Heavyweight","Heavyweight"];
const fighters=divisions.flatMap((division)=>[{fighter_id:division+"c",display_name:division+" Champ",division,ranking:null,is_champion:true,active:true,headshot_url:"/img",grade_version:"fixed"},
...Array.from({length:15},(_,i)=>({fighter_id:division+i,display_name:division+" "+i,division,ranking:i+1,is_champion:false,active:true,headshot_url:"/img",grade_version:"fixed"}))]);
const roster=flattenEspnRoster({athletes:[{position:"QB",items:[{id:"1",displayName:"Josh Allen"}]}]});
const data=inventoryFromAuthorities({football:[{team_code:"BUF",position_group:"QB",name_key:"joshallen",display_name:"Josh Allen",grade_version:"v1",effective_date:"2026-10-03"}],ufc:fighters,rosters:{"NFL:BUF":roster},activePriorityKeys:new Set(["NFL:BUF:QB:joshallen"])});
const complete={db:true,nflRosters:true,cfbRosters:true,officialUfcVerified:true,gmContracts:true};
test("entire active authority is enumerated; 128 UFC ranked identities integrity",()=>{
 assert.deepEqual([data.coverage.NFL,data.coverage.UFC,data.coverage.rosterConfirmed],[1,128,1]);
 assert.equal(data.identities.length,129);
});
test("never commits partial snapshot or claims success if official UFC / contracts unverified",()=>{
 const receipt=createReviewReceipt({lastGood:{identities:data.identities},current:data,
 evidenceByKey:{},sourceStatus:{...complete,officialUfcVerified:false},createdAt:"2026-10-25"});
 assert.equal(receipt.status,"blocked");
 assert.equal(receipt.preservedLastGood,true);assert.deepEqual(receipt.blockers,["officialUfcVerified"]);
});
test("first run does not invent prior evidence or grade proposals",()=>{
 const receipt=createReviewReceipt({lastGood:null,current:data,sourceStatus:complete,createdAt:"2026-10-25"});
 assert.equal(receipt.status,"baseline-review-required");
 assert.equal(receipt.gradeChanges,0);
});
test("full unchanged week generates no grading reviews",()=>{
 const receipt=createReviewReceipt({lastGood:{identities:data.identities},current:data,sourceStatus:complete,createdAt:"2026-10-25"});
 assert.equal(receipt.status,"compared");assert.equal(receipt.review.changed,0);assert.equal(receipt.gradeChanges,0);
});
test("team roster mismatch produces factual item with verified source evidence, no grade change",()=>{
 const next={...data,identities:data.identities.map(row=>row.sport==="NFL"?{...row,rosterStatus:"not-on-espn-roster"}:row)};
 const receipt=createReviewReceipt({lastGood:{identities:data.identities},current:next,sourceStatus:complete,
 evidenceByKey:{"NFL:BUF:QB:joshallen":{sourceUrl:"https://site.api.espn.com/",observedAt:"2026-10-25"}},
 createdAt:"2026-10-25"});
 assert.equal(receipt.review.changed,1);assert.equal(receipt.review.changes[0].gradeAction,"none");
});
test("malformed UFC active contender set fails closed",()=>{
 assert.throws(()=>inventoryFromAuthorities({football:[],ufc:fighters.slice(1),rosters:{},activePriorityKeys:new Set()}),/expected one/);
});

test("canonical wheel priorities are 626 NFL and 1277 CFB non-Flex identities",()=>{
 const nfl=JSON.parse(readFileSync("data/generated/football/wheel-football-priorities.json","utf8"));
 const cfb=JSON.parse(readFileSync("data/generated/football/cfb/wheel-football-current-priorities-2026.json","utf8"));
 const boise=JSON.parse(readFileSync("data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json","utf8"));
 const keys=wheelPriorityIdentityKeys({nfl,cfb,extraTeams:[boise]});
 assert.equal([...keys].filter(k=>k.startsWith("NFL:")).length,626);
 assert.equal([...keys].filter(k=>k.startsWith("CFB:")).length,1277);
 assert.equal(keys.size,1903);
});
test("unselected old grading rows do not create fake active identities",()=>{
 const scoped=inventoryFromAuthorities({football:[
 {team_code:"BUF",position_group:"QB",name_key:"joshallen",display_name:"Josh Allen",grade_version:"v1"},
 {team_code:"BUF",position_group:"QB",name_key:"retiredextra",display_name:"Retired Extra",grade_version:"old"}
 ],ufc:fighters,rosters:{"NFL:BUF":roster},activePriorityKeys:new Set(["NFL:BUF:QB:joshallen"])});
 assert.equal(scoped.coverage.NFL,1);
 assert.equal(scoped.coverage.staleGradeIdentities,1);
 assert.throws(()=>inventoryFromAuthorities({football:[],ufc:fighters,rosters:{},activePriorityKeys:new Set(["NFL:BUF:QB:joshallen"])}),/missing grade-authority/);
});
