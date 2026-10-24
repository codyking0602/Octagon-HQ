import { describe, expect, it } from "vitest";
import { matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudEntity, type FamilyFeudQuestion, type FamilyFeudPack } from "../games/familyFeudEngine";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH6 } from "./ufcSportsFeudV2MainBatch6";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH6 } from "./ufcSportsFeudV2FastBatch6";
import type { UFCFeudDraft } from "./ufcSportsFeudV2DraftHelpers";

const batch = [...UFC_SPORTS_FEUD_V2_MAIN_BATCH6, ...UFC_SPORTS_FEUD_V2_FAST_BATCH6];
function pack(q: UFCFeudDraft) {
  const answers = [...q.answers,...(q.alsoAcceptedAnswers??[])];
  const entities: FamilyFeudEntity[] = answers.map((a,i)=>({
    id:q.id+":"+i,displayName:a.name,kind:q.entityKind,aliases:a.aliases??[],
  }));
  const board: FamilyFeudQuestion={
    id:q.id,prompt:q.prompt,candidateIds:entities.map(x=>x.id),
    answers:entities.slice(0,8).map((e,i)=>({entityId:e.id,points:8-i})),
    alsoAcceptedEntityIds:entities.slice(8).map(e=>e.id),
  };
  return {answers,board,pack:{id:q.id,sport:"ufc" as const,mainBoards:[],fastMoney:[],entities} satisfies FamilyFeudPack};
}
describe("UFC Feud sixth editorial batch — deliberately not live",()=>{
  it("stages eight Main and sixteen Fast drafts with no prompt or ID duplicates",()=>{
    expect(UFC_SPORTS_FEUD_V2_MAIN_BATCH6).toHaveLength(8);
    expect(UFC_SPORTS_FEUD_V2_FAST_BATCH6).toHaveLength(16);
    expect(batch).toHaveLength(24);
    expect(new Set(batch.map(x=>x.id)).size).toBe(24);
    expect(new Set(batch.map(x=>normalizeFamilyFeudInput(x.prompt))).size).toBe(24);
    expect(new Set(batch.map(x=>x.collisionGroup)).size).toBe(24);
  });
  it("all eight ranked, off-board, and alias responses resolve to their correct sole owner",()=>{
    for(const q of batch){
      expect(q.answers,q.id).toHaveLength(8);
      expect(q.alsoAcceptedAnswers?.length??0,q.id).toBeGreaterThanOrEqual(5);
      if(q.id.includes("main6") && q.entityKind==="person") expect(q.source?.length??0,q.id).toBeGreaterThan(0);
      const p=pack(q);
      const unique=new Set(p.answers.map(a=>normalizeFamilyFeudInput(a.name)));
      expect(unique.size,q.id).toBe(p.answers.length);
      for(const [i,a] of p.answers.entries()){
        const actual=matchFamilyFeudAnswer(p.pack,p.board,a.name);
        expect(actual.status,q.id+" answer "+a.name).toBe("matched");
        if(actual.status==="matched") expect(actual.entityId,q.id+" exact "+a.name).toBe(q.id+":"+i);
        for(const alias of a.aliases??[]){
          const check=matchFamilyFeudAnswer(p.pack,p.board,alias);
          expect(check.status,q.id+" alias "+alias).toBe("matched");
          if(check.status==="matched") expect(check.entityId,q.id+" alias owner "+alias).toBe(q.id+":"+i);
        }
      }
    }
  });
  it("rejects false historic candidates, not just exact spellings",()=>{
    const negatives=[
      ["ufc-v2-main6-women-title-holders","Jessica Penne"],
      ["ufc-v2-main6-trilogy-participants","Jose Aldo"],
      ["ufc-v2-main6-reclaimed-title","Frankie Edgar"],
    ] as const;
    for(const [id,name] of negatives){
      const q=batch.find(x=>x.id===id)!;
      expect(q).toBeDefined();
      const p=pack(q);
      expect(matchFamilyFeudAnswer(p.pack,p.board,name).status,id+" "+name).toBe("unrecognized");
    }
  });
  it("accepts alternate proper fighter names and nonperson venue names",()=>{
    for(const [id,name] of [
      ["ufc-v2-main6-reclaimed-title","GSP"],
      ["ufc-v2-main6-trilogy-participants","DC"],
      ["ufc-v2-main6-women-title-holders","Cyborg"],
      ["ufc-v2-main6-legendary-venues","MSG"],
      ["ufc-v2-fast6-illegal-actions","Eye gouge"],
      ["ufc-v2-fast6-championship-belt","Gold plates"],
      ["ufc-v2-fast6-mma-slang","Ground-and-pound"],
      ["ufc-v2-fast6-fight-result-determinations","KO"],
    ] as const){
      const q=batch.find(x=>x.id===id)!;
      const p=pack(q);
      expect(matchFamilyFeudAnswer(p.pack,p.board,name).status,id+" "+name).toBe("matched");
    }
  });
});
