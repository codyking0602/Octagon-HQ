import { describe,expect,it } from "vitest";
import { matchFamilyFeudAnswer,normalizeFamilyFeudInput,
  type FamilyFeudEntity,type FamilyFeudPack,type FamilyFeudQuestion } from "../games/familyFeudEngine";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH7 } from "./ufcSportsFeudV2FastBatch7";
import { UFC_V2_HELD_IDS } from "./ufcSportsFeudV2EditorialReleaseGate";
function materialize(q:(typeof UFC_SPORTS_FEUD_V2_FAST_BATCH7)[number]){
  const list=[...q.answers,...(q.alsoAcceptedAnswers??[])];
  const entities:FamilyFeudEntity[]=list.map((a,i)=>({
    id:q.id+":"+i,displayName:a.name,kind:q.entityKind,aliases:a.aliases??[],
  }));
  const board:FamilyFeudQuestion={
    id:q.id,prompt:q.prompt,candidateIds:entities.map(x=>x.id),
    answers:entities.slice(0,8).map((e,i)=>({entityId:e.id,points:8-i})),
    alsoAcceptedEntityIds:entities.slice(8).map(e=>e.id),
  };
  const pack:FamilyFeudPack={id:q.id,sport:"ufc",entities,mainBoards:[],fastMoney:[]};
  return {pack,board,list};
}
describe("UFC Feud batch 7 — nineteen non-live Fast Money drafts",()=>{
  it("preserves unique IDs, family keys and eight ranked examples",()=>{
    expect(UFC_SPORTS_FEUD_V2_FAST_BATCH7).toHaveLength(19);
    expect(new Set(UFC_SPORTS_FEUD_V2_FAST_BATCH7.map(x=>x.id)).size).toBe(19);
    expect(new Set(UFC_SPORTS_FEUD_V2_FAST_BATCH7.map(x=>x.prompt)).size).toBe(19);
    expect(new Set(UFC_SPORTS_FEUD_V2_FAST_BATCH7.map(x=>x.collisionGroup)).size).toBe(19);
    for(const q of UFC_SPORTS_FEUD_V2_FAST_BATCH7){
      expect(q.answers,q.id).toHaveLength(8);
      expect((q.alsoAcceptedAnswers??[]).length,q.id).toBeGreaterThanOrEqual(8);
    }
  });
  it("awards each ranked, off-board and manually authored alias to exactly its intended owner",()=>{
    for(const q of UFC_SPORTS_FEUD_V2_FAST_BATCH7){
      const {pack,board,list}=materialize(q);
      expect(new Set(list.map(x=>normalizeFamilyFeudInput(x.name))).size,q.id).toBe(list.length);
      for(const [i,a]of list.entries()){
        const exact=matchFamilyFeudAnswer(pack,board,a.name);
        expect(exact.status,q.id+" "+a.name).toBe("matched");
        if(exact.status==="matched")expect(exact.entityId,q.id+" wrong canonical owner").toBe(q.id+":"+i);
        for(const alias of a.aliases??[]){
          const matched=matchFamilyFeudAnswer(pack,board,alias);
          expect(matched.status,q.id+" "+alias).toBe("matched");
          if(matched.status==="matched")expect(matched.entityId,q.id+" wrong alias owner "+alias).toBe(q.id+":"+i);
        }
      }
    }
  });
  it("retains editorial holds and does not count them as production-ready",()=>{
    const held=UFC_SPORTS_FEUD_V2_FAST_BATCH7.filter(q=>UFC_V2_HELD_IDS.has(q.id));
    expect(held).toHaveLength(8);
    const advanced=UFC_SPORTS_FEUD_V2_FAST_BATCH7.filter(q=>!UFC_V2_HELD_IDS.has(q.id));
    expect(advanced).toHaveLength(11);
  });
});
