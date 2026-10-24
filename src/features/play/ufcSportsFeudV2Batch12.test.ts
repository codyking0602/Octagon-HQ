import { describe, expect, it } from "vitest";
import { matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudPack, type FamilyFeudQuestion } from "../games/familyFeudEngine";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH12 } from "./ufcSportsFeudV2MainBatch12";
import type { UFCFeudDraft } from "./ufcSportsFeudV2DraftHelpers";

function asPack(q: UFCFeudDraft){
  const entries=[...q.answers,...(q.alsoAcceptedAnswers??[])];
  const entities=entries.map((answer,i)=>({id:q.id+":"+i,displayName:answer.name,aliases:answer.aliases??[],kind:q.entityKind}));
  const board:FamilyFeudQuestion={
    id:q.id,prompt:q.prompt,candidateIds:entities.map(x=>x.id),
    answers:entities.slice(0,8).map((x,i)=>({entityId:x.id,points:8-i})),
    alsoAcceptedEntityIds:entities.slice(8).map(x=>x.id),
  };
  const pack:FamilyFeudPack={id:q.id,sport:"ufc",entities,mainBoards:[],fastMoney:[]};
  return {board,pack,entries};
}
describe("UFC Main V2 batch 12 source-anchored editorial (not live)",()=>{
  it("includes four separate tenable Main concepts with eight ranked, unique identity answers",()=>{
    expect(UFC_SPORTS_FEUD_V2_MAIN_BATCH12).toHaveLength(4);
    expect(new Set(UFC_SPORTS_FEUD_V2_MAIN_BATCH12.map(q=>q.collisionGroup)).size).toBe(4);
    for(const q of UFC_SPORTS_FEUD_V2_MAIN_BATCH12) {
      expect(q.answers,q.id).toHaveLength(8);
      expect(q.source?.length??0,q.id).toBeGreaterThan(0);
      const entries=[...q.answers,...(q.alsoAcceptedAnswers??[])];
      expect(new Set(entries.map(x=>normalizeFamilyFeudInput(x.name))).size,q.id).toBe(entries.length);
    }
  });
  it("grades every authored name, nickname and genuine off-board extra to exactly one owner",()=>{
    for(const q of UFC_SPORTS_FEUD_V2_MAIN_BATCH12){
      const {pack,board,entries}=asPack(q);
      for(const [i,x] of entries.entries()){
        for(const t of [x.name,...(x.aliases??[])]){
          const m=matchFamilyFeudAnswer(pack,board,t);
          expect(m.status,q.id+" "+t).toBe("matched");
          if(m.status==="matched")expect(m.entityId,q.id+" "+t).toBe(q.id+":"+i);
        }
      }
    }
  });
  it("bounds the referee category to the verified twelve highest-volume UFC referees",()=>{
    const q=UFC_SPORTS_FEUD_V2_MAIN_BATCH12.find(x=>x.id==="ufc-v2-main12-ufc-title-referees")!;
    expect(q.prompt).toContain("twelve with the most UFC fights");
    const {pack,board}=asPack(q);
    for(const name of ["Bruce Buffer","Kevin MacDonald","Joe Rogan","Sal D'Amato"])
      expect(matchFamilyFeudAnswer(pack,board,name).status,name).toBe("unrecognized");
  });
  it("does not confuse current challenger or famous former champion with two-division winner",()=>{
    const q=UFC_SPORTS_FEUD_V2_MAIN_BATCH12.find(x=>x.id==="ufc-v2-main12-two-division-ufc-champs")!;
    const {pack,board}=asPack(q);
    for(const name of ["Khabib Nurmagomedov","Stipe Miocic","Max Holloway"]){
      expect(matchFamilyFeudAnswer(pack,board,name).status,name).toBe("unrecognized");
    }
  });
});