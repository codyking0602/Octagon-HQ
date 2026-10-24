import { describe, expect, it } from "vitest";
import {
  matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudEntity, type FamilyFeudPack, type FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import type { UFCFeudDraft } from "./ufcSportsFeudV2DraftHelpers";
import { UFC_SPORTS_FEUD_V2_MAIN_DRAFT } from "./ufcSportsFeudV2MainDraft";
import { UFC_SPORTS_FEUD_V2_FAST_DRAFT } from "./ufcSportsFeudV2FastDraft";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH2 } from "./ufcSportsFeudV2MainBatch2";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH2 } from "./ufcSportsFeudV2FastBatch2";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH3 } from "./ufcSportsFeudV2MainBatch3";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH3 } from "./ufcSportsFeudV2FastBatch3";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH4 } from "./ufcSportsFeudV2MainBatch4";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH4 } from "./ufcSportsFeudV2FastBatch4";

const batch = [...UFC_SPORTS_FEUD_V2_MAIN_BATCH4, ...UFC_SPORTS_FEUD_V2_FAST_BATCH4];
const all = [...UFC_SPORTS_FEUD_V2_MAIN_DRAFT, ...UFC_SPORTS_FEUD_V2_FAST_DRAFT,
  ...UFC_SPORTS_FEUD_V2_MAIN_BATCH2, ...UFC_SPORTS_FEUD_V2_FAST_BATCH2,
  ...UFC_SPORTS_FEUD_V2_MAIN_BATCH3, ...UFC_SPORTS_FEUD_V2_FAST_BATCH3, ...batch];

function makePack(q: UFCFeudDraft) {
  const names = [...q.answers, ...(q.alsoAcceptedAnswers ?? [])];
  const entities: FamilyFeudEntity[] = names.map((a,i) => ({
    id: q.id + ":" + i, kind:q.entityKind, displayName:a.name, aliases:a.aliases ?? [],
  }));
  const board: FamilyFeudQuestion = {
    id:q.id, prompt:q.prompt,
    candidateIds:entities.map(e=>e.id),
    answers:entities.slice(0,8).map((e,i)=>({entityId:e.id,points:8-i})),
    alsoAcceptedEntityIds:entities.slice(8).map(e=>e.id),
  };
  const pack: FamilyFeudPack = {id:q.id,sport:"ufc",entities,mainBoards:[],fastMoney:[]};
  return {pack,board,names};
}

describe("UFC Feud v2 batch 4 — isolated editorial staging",()=>{
  it("adds 4 factual Main and 12 easy Fast prompts with distinct identifiers and lanes",()=>{
    expect(UFC_SPORTS_FEUD_V2_MAIN_BATCH4).toHaveLength(4);
    expect(UFC_SPORTS_FEUD_V2_FAST_BATCH4).toHaveLength(12);
    expect(all).toHaveLength(84);
    expect(new Set(all.map(x=>x.id)).size).toBe(84);
    expect(new Set(all.map(x=>x.collisionGroup)).size).toBe(84);
  });
  it("provides eight ranked names and recognizes every authored accepted answer and alias",()=>{
    for(const q of batch) {
      expect(q.answers,q.id).toHaveLength(8);
      expect(q.alsoAcceptedAnswers?.length ?? 0,q.id).toBeGreaterThan(q.entityKind==="person" ? 0 : 6);
      if(q.entityKind==="person") expect(q.source?.length ?? 0,q.id).toBeGreaterThan(0);
      const {pack,board,names}=makePack(q);
      expect(new Set(names.map(x=>normalizeFamilyFeudInput(x.name))).size,q.id).toBe(names.length);
      for (const [i,answer] of names.entries()) {
        const x=matchFamilyFeudAnswer(pack,board,answer.name);
        expect(x.status,q.id+" canonical "+answer.name).toBe("matched");
        if (x.status==="matched") expect(x.entityId).toBe(q.id+":"+i);
        for (const alias of answer.aliases ?? []) {
          const y=matchFamilyFeudAnswer(pack,board,alias);
          expect(y.status,q.id+" alias "+alias).toBe("matched");
          if(y.status==="matched") expect(y.entityId,q.id+" alias "+alias).toBe(q.id+":"+i);
        }
      }
    }
  });
  it("does not falsely count fights outside the UFC as Nunes opponents",()=>{
    const q=UFC_SPORTS_FEUD_V2_MAIN_BATCH4.find(x=>x.id==="ufc-v2-main4-amanda-nunes-opponents")!;
    const {pack,board}=makePack(q);
    for(const name of ["Julia Budd","Alexis Davis","Sarah Kaufman"]){
      expect(matchFamilyFeudAnswer(pack,board,name).status,name).toBe("unrecognized");
    }
  });
  it("handles fan shorthand on actual new boards",()=>{
    const checks=[
      ["ufc-v2-main4-mcgregor-opponents","Cowboy"],
      ["ufc-v2-main4-anderson-silva-opponents","The Count"],
      ["ufc-v2-main4-amanda-nunes-opponents","Cyborg"],
      ["ufc-v2-main4-bellator-ufc-veterans","Rampage Jackson"],
      ["ufc-v2-fast4-arena-entry","Scan QR code"],
      ["ufc-v2-fast4-referee-foul","Point deduction"],
      ["ufc-v2-fast4-fighter-thanks","Parents"],
    ] as const;
    for(const [id,answer] of checks){
      const q=batch.find(x=>x.id===id)!;
      const {pack,board}=makePack(q);
      expect(matchFamilyFeudAnswer(pack,board,answer).status,id).toBe("matched");
    }
  });
});
