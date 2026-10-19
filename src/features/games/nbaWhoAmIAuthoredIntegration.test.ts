import { describe, it, expect } from "vitest";
import { nbaWhoAmIAuthoredIdentities } from "./nbaWhoAmIAuthoredScripts";
import { nbaWhoAmIAuthoredBatch1 } from "./nbaWhoAmIAuthoredBatch1";
import { nbaWhoAmIAuthoredBatch2 } from "./nbaWhoAmIAuthoredBatch2";
import { nbaWhoAmIAuthoredBatch3 } from "./nbaWhoAmIAuthoredBatch3";
import { nbaWhoAmIAuthoredBatch4 } from "./nbaWhoAmIAuthoredBatch4";
import { buildNbaWhoAmIAuthoredRound, resolveNbaWhoAmIAuthoredSharedRound } from "../play/nbaWhoAmIAuthoredRound";
import { whoAmIRescueChoices } from "./whoAmIEngine";
import { storedWhoAmIChallengeRound, whoAmIChallengeSetup } from "../play/whoAmIChallenge";
import { canPreviewNbaWhoAmI } from "../nba/NbaWhoAmIOwnerGate";

const bands = ["broad","broad","helpful","helpful","helpful","strong","strong","strong","giveaway","giveaway"];
const approved = ["Michael Jordan","Kobe Bryant","LeBron James","Stephen Curry","Tim Duncan","Shaquille O'Neal","Giannis Antetokounmpo","Nikola Jokić"];
const early = /\b(?:Lakers|Warriors|Celtics|Bulls|Knicks|Nuggets|Spurs|Raptors|Clippers|Pistons|Suns|Heat|Mavericks|Rockets|Cavaliers|Thunder|76ers|Magic|Bucks|Pacers|Grizzlies|Nets|Hawks|Hornets|Kings|Jazz|Timberwolves|Trail Blazers|New York|Los Angeles|Chicago|Dallas|Miami|Denver|Cleveland|Boston|Detroit|Golden State|Oklahoma City|San Antonio|Houston|Milwaukee|Atlanta|Orlando|Phoenix|Portland|Minnesota|Indiana|Washington|Charlotte|Toronto|Memphis|Sacramento|Duke|Kentucky|UCLA|Serbian|Slovenian|Turkish|Croatian|Cameroonian|Georgetown|No\. ?\d+|first overall|number one pick)\b/i;
const iconic = /\b(?:only player|first ever|first unanimous|100 points|81 points|Black Mamba|Air Jordan|the Answer|the Admiral|the Dream|the Logo|skyhook)\b/i;

describe("NBA authored Who Am I 200-player final integration", () => {
 it("retains eight exact calibration identities and adds four exclusive batches", () => {
   expect(nbaWhoAmIAuthoredIdentities.slice(0,8).map(p=>p.name)).toEqual(approved);
   for(const b of [nbaWhoAmIAuthoredBatch1,nbaWhoAmIAuthoredBatch2,nbaWhoAmIAuthoredBatch3,nbaWhoAmIAuthoredBatch4])expect(b).toHaveLength(48);
   expect(nbaWhoAmIAuthoredIdentities).toHaveLength(200);
   expect(new Set(nbaWhoAmIAuthoredIdentities.map(p=>p.subjectId)).size).toBe(200);
   expect(new Set(nbaWhoAmIAuthoredIdentities.map(p=>p.name)).size).toBe(200);
   expect(nbaWhoAmIAuthoredIdentities.slice(8)).toEqual([...nbaWhoAmIAuthoredBatch1,...nbaWhoAmIAuthoredBatch2,...nbaWhoAmIAuthoredBatch3,...nbaWhoAmIAuthoredBatch4]);
 });
 it("validates 400 independent scripts and all 4,000 unique factual clue IDs and texts", () => {
   const ids=new Set<string>(),texts=new Set<string>();let scripts=0;
   for(const p of nbaWhoAmIAuthoredIdentities){
     expect(p.subjectId).toMatch(/^nba:[a-z0-9-]+$/);
     expect(Object.keys(p.scripts).sort()).toEqual(["A","B"]);
     for(const url of Object.values(p.sources)){
       const u=new URL(url);
       expect(u.protocol).toBe("https:");
       expect(u.hostname).toMatch(/(?:^|\.)(?:nba\.com|hoophall\.com|basketball-reference\.com)$/);
     }
     for(const id of ["A","B"] as const){
       scripts++;const clues=p.scripts[id].clues;
       expect(clues).toHaveLength(10);
       expect(clues.map(c=>c.band)).toEqual(bands);
       for(const c of clues){
         expect(c.verification).toBe("verified");
         if (!approved.includes(p.name)) expect(c.text).toMatch(/\b(?:I|my|me)\b/i);
         expect(c.text.toLocaleLowerCase()).not.toContain(p.name.toLocaleLowerCase());
         expect(c.sourceIds.length).toBeGreaterThan(0);
         for(const key of c.sourceIds)expect(p.sources[key]).toBeTruthy();
         expect(ids.has(c.id),`duplicate clue id ${c.id}`).toBe(false);ids.add(c.id);
         const text=c.text.toLocaleLowerCase().trim();
         expect(texts.has(text),`repeated clue text ${p.name} ${c.id}`).toBe(false);texts.add(text);
       }
     }
     expect(p.scripts.A.clues.map(c=>c.text)).not.toEqual(p.scripts.B.clues.map(c=>c.text));
   }
   expect(scripts).toBe(400);expect(ids.size).toBe(4000);expect(texts.size).toBe(4000);
 });
 it("protects both cumulative early two-clue reveal windows and A/B variation",()=>{
   for(const p of nbaWhoAmIAuthoredIdentities)for(const id of ["A","B"] as const){
     const first=p.scripts[id].clues.slice(0,4);
     for(const c of first)expect(early.test(c.text),`${p.name} ${id}: ${c.text}`).toBe(false);
     for(const c of first.slice(0,2))expect(iconic.test(c.text),`${p.name} ${id}: ${c.text}`).toBe(false);
     expect(new Set(first.map(c=>c.text)).size).toBe(4);
     const other=p.scripts[id==="A"?"B":"A"].clues;
     expect(first.map(c=>c.text)).not.toEqual(other.slice(0,4).map(c=>c.text));
     expect(p.scripts[id].clues.slice(8).map(c=>c.text)).not.toEqual(other.slice(8).map(c=>c.text));
   }
 });
 it("builds all 400 rounds with five-choice Recovery including target, share and restoration",()=>{
   for(const p of nbaWhoAmIAuthoredIdentities)for(const id of ["A","B"] as const){
     const r=buildNbaWhoAmIAuthoredRound({subjectId:p.subjectId,scriptId:id});
     expect(r.sport).toBe("nba");expect(r.hiddenSubject.id).toBe(p.subjectId);
     expect(r.subjects).toHaveLength(200);expect(r.clues).toHaveLength(10);
     const choices=whoAmIRescueChoices(r,()=>0.5);
     expect(choices).toHaveLength(5);expect(new Set(choices.map(c=>c.id)).size).toBe(5);
     expect(choices.some(c=>c.id===p.subjectId)).toBe(true);
     expect(resolveNbaWhoAmIAuthoredSharedRound(p.subjectId,r.clues.map(c=>c.id))).toEqual(r);
     expect(storedWhoAmIChallengeRound(whoAmIChallengeSetup(r),"nba")).toEqual(r);
   }
 });
 it("does not open NBA to non-owners",()=>{
   expect(canPreviewNbaWhoAmI({displayName:"Cody",canControlPicks:true})).toBe(true);
   expect(canPreviewNbaWhoAmI({displayName:"Guest",canControlPicks:true})).toBe(false);
   expect(canPreviewNbaWhoAmI({displayName:"Cody",canControlPicks:false})).toBe(false);
 });
});