import { describe, expect, it } from "vitest";
import { matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudPack, type FamilyFeudQuestion } from "../games/familyFeudEngine";
import { UFC_V2_NEW_MAIN_DRAFTS, UFC_V2_NEW_FAST_DRAFTS,
  UFC_V2_HELD_IDS, ufcFeudSemanticFamily } from "./ufcSportsFeudV2EditorialReleaseGate";
import type { UFCFeudDraft } from "./ufcSportsFeudV2DraftHelpers";

const advancing = [...UFC_V2_NEW_MAIN_DRAFTS, ...UFC_V2_NEW_FAST_DRAFTS]
  .filter(q => !UFC_V2_HELD_IDS.has(q.id));

function fixture(q: UFCFeudDraft) {
  const all = [...q.answers, ...(q.alsoAcceptedAnswers ?? [])];
  const entities = all.map((a,i) => ({
    id:q.id+":"+i,displayName:a.name,kind:q.entityKind,aliases:a.aliases??[],
  }));
  const board: FamilyFeudQuestion = {
    id:q.id,prompt:q.prompt,candidateIds:entities.map(e=>e.id),
    answers:entities.slice(0,8).map((e,i)=>({entityId:e.id,points:8-i})),
    alsoAcceptedEntityIds:entities.slice(8).map(e=>e.id),
  };
  const pack: FamilyFeudPack = {id:q.id,sport:"ufc",entities,mainBoards:[],fastMoney:[]};
  return {all,board,pack};
}

describe("All advancing UFC Sports Feud V2 new drafts — first-pass matcher invariant, not editorial certification",()=>{
  it("never counts held candidates, has eight ranked per board and distinct IDs",()=>{
    expect(advancing.length).toBeGreaterThan(0);
    expect(new Set(advancing.map(q=>q.id)).size).toBe(advancing.length);
    for(const q of advancing){
      expect(q.answers,q.id).toHaveLength(8);
      expect(ufcFeudSemanticFamily(q).trim().length,q.id).toBeGreaterThan(0);
      const all=[...q.answers,...(q.alsoAcceptedAnswers??[])];
      expect(new Set(all.map(a=>normalizeFamilyFeudInput(a.name))).size,q.id)
        .toBe(all.length);
    }
  });
  it("matches every ranked and off-board explicit spelling to one unique answer entity",()=>{
    for(const q of advancing){
      const {all,board,pack}=fixture(q);
      for(const [index,answer] of all.entries()){
        for(const spelling of [answer.name,...(answer.aliases??[])]){
          const actual=matchFamilyFeudAnswer(pack,board,spelling);
          expect(actual.status,q.id+" / "+spelling).toBe("matched");
          if(actual.status==="matched")
            expect(actual.entityId,q.id+" / "+spelling).toBe(q.id+":"+index);
        }
      }
    }
  });
});