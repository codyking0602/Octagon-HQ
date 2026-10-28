import { describe, expect, it } from "vitest";
import { matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudPack, type FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH9 } from "./ufcSportsFeudV2FastBatch9";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH10 } from "./ufcSportsFeudV2FastBatch10";
import type { UFCFeudDraft } from "./ufcSportsFeudV2DraftHelpers";

const questions: readonly UFCFeudDraft[] = [...UFC_SPORTS_FEUD_V2_FAST_BATCH9, ...UFC_SPORTS_FEUD_V2_FAST_BATCH10];
function fixture(q: UFCFeudDraft) {
  const all = [...q.answers, ...(q.alsoAcceptedAnswers ?? [])];
  const entities = all.map((answer, i) => ({
    id: q.id + ":" + i,
    kind: q.entityKind, displayName: answer.name, aliases: answer.aliases ?? [],
  }));
  const board: FamilyFeudQuestion = {
    id:q.id, prompt:q.prompt, candidateIds:entities.map(x=>x.id),
    answers:entities.slice(0,8).map((x,i)=>({entityId:x.id,points:8-i})),
    alsoAcceptedEntityIds:entities.slice(8).map(x=>x.id),
  };
  const pack: FamilyFeudPack = {
    id:q.id, sport:"ufc", entities, mainBoards:[], fastMoney:[],
  };
  return {all,board,pack};
}
describe("UFC V2 Fast Money batches 9 and 10 are candidates, not approved for production", () => {
  it("stage 42 distinct draft prompts, all with eight ranked results",()=>{
    expect(UFC_SPORTS_FEUD_V2_FAST_BATCH9).toHaveLength(20);
    expect(UFC_SPORTS_FEUD_V2_FAST_BATCH10).toHaveLength(22);
    expect(questions).toHaveLength(42);
    expect(new Set(questions.map(q=>q.id)).size).toBe(42);
    expect(new Set(questions.map(q=>q.prompt)).size).toBe(42);
    for (const q of questions) {
      expect(q.answers,q.id).toHaveLength(8);
      const all=[...q.answers,...(q.alsoAcceptedAnswers??[])];
      expect(new Set(all.map(a=>normalizeFamilyFeudInput(a.name))).size,q.id).toBe(all.length);
    }
  });
  it("recognizes every drafted ranked/off-board answer and explicit alias as its unique owner",()=>{
    for (const q of questions) {
      const {all,board,pack} = fixture(q);
      for (const [i, answer] of all.entries()) {
        for (const response of [answer.name,...(answer.aliases??[])]) {
          const match=matchFamilyFeudAnswer(pack,board,response);
          expect(match.status,q.id+" "+response).toBe("matched");
          if (match.status==="matched") expect(match.entityId,q.id+" "+response).toBe(q.id+":"+i);
        }
      }
    }
  });
});