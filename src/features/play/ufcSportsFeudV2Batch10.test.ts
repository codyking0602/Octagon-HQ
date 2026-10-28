import { describe, expect, it } from "vitest";
import {
  matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudPack, type FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH10 } from "./ufcSportsFeudV2MainBatch10";

function fixture(q: (typeof UFC_SPORTS_FEUD_V2_MAIN_BATCH10)[number]) {
  const all = [...q.answers, ...(q.alsoAcceptedAnswers ?? [])];
  const entities = all.map((a, i) => ({
    id: q.id + ":" + i, displayName: a.name,
    kind: q.entityKind, aliases: a.aliases ?? [],
  }));
  const board: FamilyFeudQuestion = {
    id: q.id, prompt: q.prompt,
    candidateIds: entities.map(e => e.id),
    answers: entities.slice(0, 8).map((e,i) => ({entityId:e.id,points:8-i})),
    alsoAcceptedEntityIds:entities.slice(8).map(e => e.id),
  };
  const pack={id:q.id,sport:"ufc",mainBoards:[],fastMoney:[],entities} satisfies FamilyFeudPack;
  return {all,pack,board};
}

describe("UFC V2 batch10: distinct top-ten official career categories, editorial only",()=>{
  it("is exactly six Main boards with eight ranked answers and full tied eligibility",()=>{
    const q=UFC_SPORTS_FEUD_V2_MAIN_BATCH10;
    expect(q).toHaveLength(6);
    expect(new Set(q.map(row=>row.collisionGroup)).size).toBe(6);
    const byId=Object.fromEntries(q.map(x=>[x.id,x]));
    const expected={
      "ufc-v2-main10-longest-average-fights":10,
      "ufc-v2-main10-total-fight-time":10,
      "ufc-v2-main10-control-time":10,
      "ufc-v2-main10-career-takedowns":10,
      "ufc-v2-main10-takedown-defense":10,
      "ufc-v2-main10-submission-attempts":13,
    };
    for(const [id,total] of Object.entries(expected)){
      const row=byId[id];expect(row,id).toBeDefined();
      expect(row.answers,id).toHaveLength(8);
      expect([...row.answers,...(row.alsoAcceptedAnswers??[])],id).toHaveLength(total);
      expect(row.prompt,id).toContain("October 18, 2026");
      expect(row.source?.length,id).toBeGreaterThan(0);
    }
  });
  it("matches each ranked, off-board and nickname response to one owner",()=>{
    for (const q of UFC_SPORTS_FEUD_V2_MAIN_BATCH10) {
      const {all,pack,board}=fixture(q);
      const keys=all.map(a=>normalizeFamilyFeudInput(a.name));
      expect(new Set(keys).size,q.id).toBe(keys.length);
      for(const [index,answer] of all.entries()){
        for(const text of [answer.name,...(answer.aliases??[])]){
          const m=matchFamilyFeudAnswer(pack,board,text);
          expect(m.status,q.id+" / "+text).toBe("matched");
          if(m.status==="matched")expect(m.entityId,q.id+" / "+text).toBe(q.id+":"+index);
        }
      }
    }
  });
  it("does not award a different top-ten answer to an unrelated fighter",()=>{
    for(const [id,wrong] of [
      ["ufc-v2-main10-career-takedowns","Conor McGregor"],
      ["ufc-v2-main10-takedown-defense","Demetrious Johnson"],
      ["ufc-v2-main10-control-time","Max Holloway"],
      ["ufc-v2-main10-longest-average-fights","Charles Oliveira"],
    ] as const){
      const q=UFC_SPORTS_FEUD_V2_MAIN_BATCH10.find(row=>row.id===id)!;
      const {pack,board}=fixture(q);
      expect(matchFamilyFeudAnswer(pack,board,wrong).status,id+" / "+wrong).toBe("unrecognized");
    }
  });
});
