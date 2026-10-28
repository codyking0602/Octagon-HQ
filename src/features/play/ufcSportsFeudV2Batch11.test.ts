import { describe,expect,it } from "vitest";
import { matchFamilyFeudAnswer,normalizeFamilyFeudInput,type FamilyFeudPack,type FamilyFeudQuestion } from "../games/familyFeudEngine";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH11 } from "./ufcSportsFeudV2MainBatch11";
describe("UFC record book October 18 2026 Main candidates — not release approved",()=>{
 it("has eight official leaderboard categories, eight ranked answers each, and accepted tied placements",()=>{
   expect(UFC_SPORTS_FEUD_V2_MAIN_BATCH11).toHaveLength(8);
   expect(new Set(UFC_SPORTS_FEUD_V2_MAIN_BATCH11.map(x=>x.collisionGroup)).size).toBe(8);
   for(const q of UFC_SPORTS_FEUD_V2_MAIN_BATCH11){
     expect(q.answers,q.id).toHaveLength(8);
     expect(q.source,q.id).toContain("https://statleaders.ufc.com/en");
     expect(q.prompt,q.id).toContain("October 18, 2026");
     const all=[...q.answers,...(q.alsoAcceptedAnswers??[])];
     expect(new Set(all.map(a=>normalizeFamilyFeudInput(a.name))).size,q.id).toBe(all.length);
   }
 });
 it("matches every ranked, extra and alias name with real answer matcher",()=>{
   for(const q of UFC_SPORTS_FEUD_V2_MAIN_BATCH11){
     const all=[...q.answers,...(q.alsoAcceptedAnswers??[])];
     const entities=all.map((a,i)=>({id:q.id+":"+i,displayName:a.name,kind:q.entityKind,aliases:a.aliases??[]}));
     const board:FamilyFeudQuestion={id:q.id,prompt:q.prompt,candidateIds:entities.map(e=>e.id),
       answers:entities.slice(0,8).map((e,i)=>({entityId:e.id,points:8-i})),
       alsoAcceptedEntityIds:entities.slice(8).map(e=>e.id)};
     const pack={id:q.id,sport:"ufc",mainBoards:[],fastMoney:[],entities} satisfies FamilyFeudPack;
     for(const [i,a] of all.entries())for(const text of [a.name,...(a.aliases??[])]){
       const matched=matchFamilyFeudAnswer(pack,board,text);
       expect(matched.status,q.id+" / "+text).toBe("matched");
       if(matched.status==="matched")expect(matched.entityId,q.id+" / "+text).toBe(q.id+":"+i);
     }
   }
 });
});
