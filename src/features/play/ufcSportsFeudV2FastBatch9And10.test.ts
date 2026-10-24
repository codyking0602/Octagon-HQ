import { describe, expect, it } from "vitest";
import { matchFamilyFeudAnswer, normalizeFamilyFeudInput, type FamilyFeudPack, type FamilyFeudQuestion } from "../games/familyFeudEngine";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH9 } from "./ufcSportsFeudV2FastBatch9";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH10 } from "./ufcSportsFeudV2FastBatch10";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH11 } from "./ufcSportsFeudV2FastBatch11";
import type { UFCFeudDraft } from "./ufcSportsFeudV2DraftHelpers";

const batch = [...UFC_SPORTS_FEUD_V2_FAST_BATCH9, ...UFC_SPORTS_FEUD_V2_FAST_BATCH10, ...UFC_SPORTS_FEUD_V2_FAST_BATCH11];
function fixture(q:UFCFeudDraft) {
 const all=[...q.answers,...(q.alsoAcceptedAnswers??[])];
 const entities=all.map((a,i)=>({id:q.id+":"+i,displayName:a.name,kind:q.entityKind,aliases:a.aliases??[]}));
 const board:FamilyFeudQuestion={
   id:q.id,prompt:q.prompt,candidateIds:entities.map(e=>e.id),
   answers:entities.slice(0,8).map((e,i)=>({entityId:e.id,points:8-i})),
   alsoAcceptedEntityIds:entities.slice(8).map(e=>e.id),
 };
 const pack={id:q.id,sport:"ufc",mainBoards:[],fastMoney:[],entities} satisfies FamilyFeudPack;
 return {all,board,pack};
}
describe("UFC Feud V2 Fast Money batches 9–11: editorial candidates, not production",()=>{
 it("stages 62 genuinely different prompt strings and eight ranked choices each",()=>{
   expect(UFC_SPORTS_FEUD_V2_FAST_BATCH9).toHaveLength(20);
   expect(UFC_SPORTS_FEUD_V2_FAST_BATCH10).toHaveLength(22);
   expect(UFC_SPORTS_FEUD_V2_FAST_BATCH11).toHaveLength(20);
   expect(batch).toHaveLength(62);
   expect(new Set(batch.map(q=>q.id)).size).toBe(62);
   expect(new Set(batch.map(q=>q.collisionGroup)).size).toBe(62);
   expect(new Set(batch.map(q=>normalizeFamilyFeudInput(q.prompt))).size).toBe(62);
   for(const q of batch){
     expect(q.answers,q.id).toHaveLength(8);
     expect(q.alsoAcceptedAnswers?.length??0,q.id).toBeGreaterThanOrEqual(6);
     const all=[...q.answers,...(q.alsoAcceptedAnswers??[])];
     expect(new Set(all.map(a=>normalizeFamilyFeudInput(a.name))).size,q.id).toBe(all.length);
   }
 });
 it("recognizes ranked answers, extra valid answers and each documented alias with one owner",()=>{
   for(const q of batch){
     const {all,board,pack}=fixture(q);
     for(const [i,a] of all.entries()){
       for(const answer of [a.name,...(a.aliases??[])]){
         const result=matchFamilyFeudAnswer(pack,board,answer);
         expect(result.status,q.id+" / "+answer).toBe("matched");
         if(result.status==="matched")expect(result.entityId,q.id+" / "+answer).toBe(q.id+":"+i);
       }
     }
   }
 });
});
