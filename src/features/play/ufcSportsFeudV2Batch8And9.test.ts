import { describe, expect, it } from "vitest";
import { matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudPack, type FamilyFeudQuestion } from "../games/familyFeudEngine";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH9 } from "./ufcSportsFeudV2MainBatch9";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH8 } from "./ufcSportsFeudV2FastBatch8";
import type { UFCFeudDraft } from "./ufcSportsFeudV2DraftHelpers";

const allQuestions = [...UFC_SPORTS_FEUD_V2_MAIN_BATCH9, ...UFC_SPORTS_FEUD_V2_FAST_BATCH8];
function fixture(q: UFCFeudDraft) {
  const answers=[...q.answers,...(q.alsoAcceptedAnswers??[])];
  const entities=answers.map((a,index)=>({
    id:q.id+":"+index,displayName:a.name,kind:q.entityKind,aliases:a.aliases??[],
  }));
  const question:FamilyFeudQuestion={
    id:q.id,prompt:q.prompt,candidateIds:entities.map(e=>e.id),
    answers:entities.slice(0,8).map((e,i)=>({entityId:e.id,points:8-i})),
    alsoAcceptedEntityIds:entities.slice(8).map(e=>e.id),
  };
  const pack:FamilyFeudPack={id:q.id,sport:"ufc",entities,mainBoards:[],fastMoney:[]};
  return {answers,question,pack};
}
describe("UFC V2 factual-stat and fast-money expansion candidate verification",()=>{
  it("has eight ranked valid answer labels and no duplicate prompts or collision lanes",()=>{
    expect(UFC_SPORTS_FEUD_V2_MAIN_BATCH9).toHaveLength(12);
    expect(UFC_SPORTS_FEUD_V2_FAST_BATCH8).toHaveLength(20);
    expect(new Set(allQuestions.map(q=>q.id)).size).toBe(allQuestions.length);
    expect(new Set(allQuestions.map(q=>q.prompt)).size).toBe(allQuestions.length);
    expect(new Set(allQuestions.map(q=>q.collisionGroup)).size).toBe(allQuestions.length);
    for(const q of allQuestions){
      expect(q.answers,q.id).toHaveLength(8);
      const all=[...q.answers,...(q.alsoAcceptedAnswers??[])];
      expect(new Set(all.map(a=>normalizeFamilyFeudInput(a.name))).size,q.id).toBe(all.length);
      if(q.id.includes("main9"))expect(q.source?.length,q.id).toBeGreaterThan(0);
    }
  });
  it("recognizes every candidate name and synonym with exactly one response owner",()=>{
    for(const q of allQuestions){
      const f=fixture(q);
      for(const [index,answer] of f.answers.entries()){
        for(const input of [answer.name,...(answer.aliases??[])]){
          const match=matchFamilyFeudAnswer(f.pack,f.question,input);
          expect(match.status,q.id+" / "+input).toBe("matched");
          if(match.status==="matched")expect(match.entityId,q.id+" / "+input).toBe(q.id+":"+index);
        }
      }
    }
  });
  it("rejects representative real UFC stars below objectively specified thresholds",()=>{
    for(const [id,negative] of [
      ["ufc-v2-main9-ten-knockouts","Khabib Nurmagomedov"],
      ["ufc-v2-main9-eight-submissions","Ronda Rousey"],
      ["ufc-v2-main9-fight-appearances","Brock Lesnar"],
      ["ufc-v2-main9-fight-hall-of-fame","Conor McGregor"],
      ["ufc-v2-main9-title-fight-wins","Chael Sonnen"],
    ] as const){
      const q=allQuestions.find(q=>q.id===id)!;
      expect(matchFamilyFeudAnswer(fixture(q).pack,fixture(q).question,negative).status,id+"/"+negative).toBe("unrecognized");
    }
  });
});
