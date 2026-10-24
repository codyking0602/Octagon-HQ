import { describe, expect, it } from "vitest";
import {
  matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudEntity, type FamilyFeudPack, type FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import type { UFCFeudDraft } from "./ufcSportsFeudV2DraftHelpers";
import { UFC_SPORTS_FEUD_SIX_MONTH_FAST_A } from "./ufcSportsFeudSixMonthSupplementFastA";
import { UFC_SPORTS_FEUD_SIX_MONTH_FAST_B } from "./ufcSportsFeudSixMonthSupplementFastB";
import { UFC_SPORTS_FEUD_SIX_MONTH_MAIN } from "./ufcSportsFeudSixMonthSupplementMain";
import { UFC_SPORTS_FEUD_SIX_MONTH_EDITORIAL } from "./ufcSportsFeudSixMonthSupplementEditorial";

const questions: readonly UFCFeudDraft[] = [
  ...UFC_SPORTS_FEUD_SIX_MONTH_MAIN,
  ...UFC_SPORTS_FEUD_SIX_MONTH_FAST_A,
  ...UFC_SPORTS_FEUD_SIX_MONTH_FAST_B,
];
function packFor(q: UFCFeudDraft) {
  const all = [...q.answers, ...(q.alsoAcceptedAnswers ?? [])];
  const entities: FamilyFeudEntity[] = all.map((a, i) => ({
    id: q.id + ":" + i, displayName:a.name, kind:q.entityKind, aliases:a.aliases ?? [],
  }));
  const question: FamilyFeudQuestion = {
    id:q.id,prompt:q.prompt,candidateIds:entities.map(e=>e.id),
    answers:entities.slice(0,8).map((e,i)=>({entityId:e.id,points:8-i})),
    alsoAcceptedEntityIds:entities.slice(8).map(e=>e.id),
  };
  const pack: FamilyFeudPack = {id:q.id,sport:"ufc",entities,mainBoards:[],fastMoney:[]};
  return {pack,question,all};
}

describe("UFC six-month Feud supplemental candidates, never imported by production", () => {
  it("tracks all 13 candidate IDs with six fast and one Main advancing", () => {
    expect(UFC_SPORTS_FEUD_SIX_MONTH_FAST_A).toHaveLength(6);
    expect(UFC_SPORTS_FEUD_SIX_MONTH_FAST_B).toHaveLength(6);
    expect(UFC_SPORTS_FEUD_SIX_MONTH_MAIN).toHaveLength(1);
    expect(questions).toHaveLength(13);
    expect(UFC_SPORTS_FEUD_SIX_MONTH_EDITORIAL).toHaveLength(13);
    expect(new Set(questions.map(q=>q.id)).size).toBe(13);
    expect(new Set(UFC_SPORTS_FEUD_SIX_MONTH_EDITORIAL.map(q=>q.id))).toEqual(new Set(questions.map(q=>q.id)));
    expect(UFC_SPORTS_FEUD_SIX_MONTH_EDITORIAL.filter(q=>q.decision==="advance")).toHaveLength(6);
  });
  it("recognizes all canonical and offboard candidates and unambiguous fan shorthand", () => {
    for(const q of questions){
      expect(q.answers,q.id).toHaveLength(8);
      const {pack,question,all}=packFor(q);
      expect(new Set(all.map(a=>normalizeFamilyFeudInput(a.name))).size,q.id).toBe(all.length);
      for(const [i,a]of all.entries()){
        const m=matchFamilyFeudAnswer(pack,question,a.name);
        expect(m.status,q.id+" "+a.name).toBe("matched");
        if(m.status==="matched")expect(m.entityId,q.id+" "+a.name).toBe(q.id+":"+i);
        for(const alias of a.aliases ?? []){
          const v=matchFamilyFeudAnswer(pack,question,alias);
          expect(v.status,q.id+" "+alias).toBe("matched");
          if(v.status==="matched")expect(v.entityId,q.id+" "+alias).toBe(q.id+":"+i);
        }
      }
    }
  });
  it("does not award unrelated celebrities for UFC Hall Contributor Wing",()=>{
    const q=UFC_SPORTS_FEUD_SIX_MONTH_MAIN[0]!;
    const {pack,question}=packFor(q);
    expect(matchFamilyFeudAnswer(pack,question,"Donald Trump").status).toBe("unrecognized");
    expect(matchFamilyFeudAnswer(pack,question,"Joe Silva").status).toBe("matched");
    expect(matchFamilyFeudAnswer(pack,question,"Mask").status).toBe("matched");
  });
});
