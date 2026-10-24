import {describe,expect,it} from "vitest";
import {matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudPack,type FamilyFeudQuestion} from "../games/familyFeudEngine";
import {UFC_SPORTS_FEUD_V2_FAST_BATCH12} from "./ufcSportsFeudV2FastBatch12";

function fixture(q:(typeof UFC_SPORTS_FEUD_V2_FAST_BATCH12)[number]){
  const all=[...q.answers,...(q.alsoAcceptedAnswers??[])];
  const entities=all.map((a,i)=>({id:q.id+":"+i,displayName:a.name,kind:q.entityKind,aliases:a.aliases??[]}));
  const question:FamilyFeudQuestion={id:q.id,prompt:q.prompt,candidateIds:entities.map(x=>x.id),
    answers:entities.slice(0,8).map((x,i)=>({entityId:x.id,points:8-i})),
    alsoAcceptedEntityIds:entities.slice(8).map(x=>x.id)};
  const pack:FamilyFeudPack={id:q.id,sport:"ufc",entities,mainBoards:[],fastMoney:[]};
  return {all,pack,question};
}
describe("UFC V2 Fast12 new fight-week and fan concepts: not production certified",()=>{
  it("uses exactly ten new prompts, eight-ranked answers and no duplicate answer labels",()=>{
    expect(UFC_SPORTS_FEUD_V2_FAST_BATCH12).toHaveLength(10);
    expect(new Set(UFC_SPORTS_FEUD_V2_FAST_BATCH12.map(q=>q.id)).size).toBe(10);
    expect(new Set(UFC_SPORTS_FEUD_V2_FAST_BATCH12.map(q=>q.collisionGroup)).size).toBe(10);
    for(const q of UFC_SPORTS_FEUD_V2_FAST_BATCH12){
      expect(q.answers,q.id).toHaveLength(8);
      const all=[...q.answers,...(q.alsoAcceptedAnswers??[])];
      expect(new Set(all.map(a=>normalizeFamilyFeudInput(a.name))).size,q.id).toBe(all.length);
    }
  });
  it("credits all ranked, extra and explicit alias inputs to their unique rightful owner",()=>{
    for(const q of UFC_SPORTS_FEUD_V2_FAST_BATCH12){
      const {all,pack,question}=fixture(q);
      for(const [i,a] of all.entries())for(const t of [a.name,...(a.aliases??[])]){
        const match=matchFamilyFeudAnswer(pack,question,t);
        expect(match.status,q.id+" / "+t).toBe("matched");
        if(match.status==="matched")expect(match.entityId,q.id+" / "+t).toBe(q.id+":"+i);
      }
    }
  });
});