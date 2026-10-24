import {describe,expect,it} from "vitest";
import {matchFamilyFeudAnswer,normalizeFamilyFeudInput,
  type FamilyFeudPack,type FamilyFeudQuestion} from "../games/familyFeudEngine";
import {UFC_SPORTS_FEUD_V2_MAIN_BATCH13} from "./ufcSportsFeudV2MainBatch13";
function fixture(q:(typeof UFC_SPORTS_FEUD_V2_MAIN_BATCH13)[number]) {
  const a=[...q.answers,...(q.alsoAcceptedAnswers??[])];
  const entities=a.map((x,i)=>({id:q.id+":"+i,kind:q.entityKind,displayName:x.name,aliases:x.aliases??[]}));
  const board:FamilyFeudQuestion={id:q.id,prompt:q.prompt,candidateIds:entities.map(x=>x.id),
    answers:entities.slice(0,8).map((x,i)=>({entityId:x.id,points:8-i})),
    alsoAcceptedEntityIds:entities.slice(8).map(x=>x.id)};
  const pack:FamilyFeudPack={id:q.id,sport:"ufc",entities,mainBoards:[],fastMoney:[]};
  return {a,board,pack};
}
describe("UFC Main13 Pioneer Wing and scripted film/TV history",()=>{
 it("contains two separately sourced historical prompts and complete eight-answer ladders",()=>{
   expect(UFC_SPORTS_FEUD_V2_MAIN_BATCH13).toHaveLength(2);
   expect(new Set(UFC_SPORTS_FEUD_V2_MAIN_BATCH13.map(q=>q.collisionGroup)).size).toBe(2);
   for(const q of UFC_SPORTS_FEUD_V2_MAIN_BATCH13){
     expect(q.answers,q.id).toHaveLength(8);
     expect(q.source?.length??0,q.id).toBeGreaterThan(0);
     const all=[...q.answers,...(q.alsoAcceptedAnswers??[])];
     expect(new Set(all.map(x=>normalizeFamilyFeudInput(x.name))).size,q.id).toBe(all.length);
   }
 });
 it("accepts every ranked and off-board name and identity alias as exactly one competitor",()=>{
   for(const q of UFC_SPORTS_FEUD_V2_MAIN_BATCH13){
     const {a,pack,board}=fixture(q);
     for(const [i,answer] of a.entries())for(const name of [answer.name,...(answer.aliases??[])]){
       const result=matchFamilyFeudAnswer(pack,board,name);
       expect(result.status,q.id+" / "+name).toBe("matched");
       if(result.status==="matched")expect(result.entityId,q.id+" / "+name).toBe(q.id+":"+i);
     }
   }
 });
 it("does not confuse modern wing inductees with pioneer wing members",()=>{
   const q=UFC_SPORTS_FEUD_V2_MAIN_BATCH13[0]!;
   const {pack,board}=fixture(q);
   for(const name of ["Conor McGregor","Ronda Rousey","Daniel Cormier","Khabib Nurmagomedov"])
     expect(matchFamilyFeudAnswer(pack,board,name).status,name).toBe("unrecognized");
 });
});