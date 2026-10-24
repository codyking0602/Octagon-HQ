import { describe, expect, it } from "vitest";
import {
  matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudEntity, type FamilyFeudPack, type FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import type { UFCFeudDraft } from "./ufcSportsFeudV2DraftHelpers";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH5 } from "./ufcSportsFeudV2MainBatch5";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH5_SUPPLEMENT } from "./ufcSportsFeudV2MainBatch5Supplement";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH5 } from "./ufcSportsFeudV2FastBatch5";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH5_SUPPLEMENT } from "./ufcSportsFeudV2FastBatch5Supplement";
import { UFC_SPORTS_FEUD_V2_MAIN_DRAFT } from "./ufcSportsFeudV2MainDraft";
import { UFC_SPORTS_FEUD_V2_FAST_DRAFT } from "./ufcSportsFeudV2FastDraft";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH2 } from "./ufcSportsFeudV2MainBatch2";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH2 } from "./ufcSportsFeudV2FastBatch2";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH3 } from "./ufcSportsFeudV2MainBatch3";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH3 } from "./ufcSportsFeudV2FastBatch3";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH4 } from "./ufcSportsFeudV2MainBatch4";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH4 } from "./ufcSportsFeudV2FastBatch4";

const batch: readonly UFCFeudDraft[] = [
  ...UFC_SPORTS_FEUD_V2_MAIN_BATCH5, ...UFC_SPORTS_FEUD_V2_MAIN_BATCH5_SUPPLEMENT,
  ...UFC_SPORTS_FEUD_V2_FAST_BATCH5, ...UFC_SPORTS_FEUD_V2_FAST_BATCH5_SUPPLEMENT,
];
const allNew: readonly UFCFeudDraft[] = [
  ...UFC_SPORTS_FEUD_V2_MAIN_DRAFT, ...UFC_SPORTS_FEUD_V2_FAST_DRAFT,
  ...UFC_SPORTS_FEUD_V2_MAIN_BATCH2, ...UFC_SPORTS_FEUD_V2_FAST_BATCH2,
  ...UFC_SPORTS_FEUD_V2_MAIN_BATCH3, ...UFC_SPORTS_FEUD_V2_FAST_BATCH3,
  ...UFC_SPORTS_FEUD_V2_MAIN_BATCH4, ...UFC_SPORTS_FEUD_V2_FAST_BATCH4,
  ...batch,
];
const make = (q: UFCFeudDraft) => {
  const answers = [...q.answers, ...(q.alsoAcceptedAnswers ?? [])];
  const entities: FamilyFeudEntity[] = answers.map((a,i) => ({
    id: q.id+":"+i, kind: q.entityKind, displayName:a.name, aliases:a.aliases ?? [],
  }));
  const board: FamilyFeudQuestion = {
    id:q.id,prompt:q.prompt,
    candidateIds:entities.map(x=>x.id),
    answers:entities.slice(0,8).map((x,i)=>({entityId:x.id,points:8-i})),
    alsoAcceptedEntityIds:entities.slice(8).map(x=>x.id),
  };
  const pack: FamilyFeudPack = {id:q.id,sport:"ufc",entities,mainBoards:[],fastMoney:[]};
  return {board,pack,answers};
};
describe("UFC Sports Feud batch five editorial questions — no live imports",()=>{
  it("adds seven Main and fifteen Fast boards without repeating a preexisting question ID or prompt",()=>{
    expect(UFC_SPORTS_FEUD_V2_MAIN_BATCH5).toHaveLength(6);
    expect(UFC_SPORTS_FEUD_V2_MAIN_BATCH5_SUPPLEMENT).toHaveLength(1);
    expect(UFC_SPORTS_FEUD_V2_FAST_BATCH5).toHaveLength(12);
    expect(UFC_SPORTS_FEUD_V2_FAST_BATCH5_SUPPLEMENT).toHaveLength(3);
    expect(batch).toHaveLength(22);
    expect(allNew).toHaveLength(106);
    expect(new Set(allNew.map(x=>x.id)).size).toBe(106);
    expect(new Set(allNew.map(x=>x.collisionGroup)).size).toBe(106);
    expect(new Set(allNew.map(x=>normalizeFamilyFeudInput(x.prompt))).size).toBe(106);
  });
  it("matches all eight ranked responses, all extras and every authored alias to only its proper answer",()=>{
    for(const q of batch){
      expect(q.answers,q.id).toHaveLength(8);
      expect(q.alsoAcceptedAnswers?.length ?? 0,q.id).toBeGreaterThan(0);
      if(q.entityKind==="person")expect(q.source?.length ?? 0,q.id).toBeGreaterThan(0);
      const {board,pack,answers}=make(q);
      expect(new Set(answers.map(a=>normalizeFamilyFeudInput(a.name))).size,q.id).toBe(answers.length);
      for(const [i,a]of answers.entries()){
        const m=matchFamilyFeudAnswer(pack,board,a.name);
        expect(m.status,q.id+" "+a.name).toBe("matched");
        if(m.status==="matched")expect(m.entityId,q.id+" "+a.name).toBe(q.id+":"+i);
        for(const alias of a.aliases ?? []){
          const v=matchFamilyFeudAnswer(pack,board,alias);
          expect(v.status,q.id+" alias "+alias).toBe("matched");
          if(v.status==="matched")expect(v.entityId,q.id+" alias "+alias).toBe(q.id+":"+i);
        }
      }
    }
  });
  it("rejects known historically inaccurate nominees despite accepting proper aliases",()=>{
    const invalid=[
      ["ufc-v2-main5-ncaa-champs","Kevin Jackson"],
      ["ufc-v2-main5-dwcs-graduates","Gregory Rodrigues"],
      ["ufc-v2-fast5-japanese-fighters","Doo Ho Choi"],
      ["ufc-v2-fast5-korean-fighters","Tatsuro Taira"],
    ] as const;
    for(const [id,answer]of invalid){
      const q=batch.find(b=>b.id===id)!;
      expect(q,id).toBeDefined();
      const {pack,board}=make(q);
      expect(matchFamilyFeudAnswer(pack,board,answer).status,id+" "+answer).toBe("unrecognized");
    }
  });
  it("recognizes everyday and fighter-name shorthand without inventing more ranked choices",()=>{
    const samples=[
      ["ufc-v2-main5-ufc-siblings","Big Nog"],
      ["ufc-v2-main5-dwcs-graduates","JDM"],
      ["ufc-v2-main5-title-by-strikes","GSP"],
      ["ufc-v2-fast5-korean-fighters","Chan Sung Jung"],
      ["ufc-v2-fast5-chinese-fighters","The Leech"],
      ["ufc-v2-fast5-historic-tv","Paramount Plus"],
      ["ufc-v2-fast5-other-promotions","Bellator"],
      ["ufc-v2-fast5-ufc-programming","DWCS"],
    ] as const;
    for(const [id,guess]of samples){
      const q=batch.find(b=>b.id===id)!;
      const {pack,board}=make(q);
      expect(matchFamilyFeudAnswer(pack,board,guess).status,id+" "+guess).toBe("matched");
    }
  });
});
