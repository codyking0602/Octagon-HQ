import { describe,expect,it } from "vitest";
import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";
import { planUfcFeudV2Appearance,UFC_FEUD_V2_UNIQUE_APPEARANCES } from "./ufcSportsFeudV2FutureSelection";
import { UFC_V2_NEW_MAIN_DRAFTS,UFC_V2_NEW_FAST_DRAFTS,ufcFeudSemanticFamily }
  from "./ufcSportsFeudV2EditorialReleaseGate";

const make=(round:"main"|"fast",family:string):SportsFeudAuthoredQuestion=>({
  id:`test-${round}-${family}`,category:family,collisionGroup:family,
  prompt:`Test ${round} ${family}`,entityKind:"other",
  answers:["A","B","C","D","E","F","G","H"].map(name=>({name})),
  alsoAcceptedAnswers:[{name:"Other"}],
});
function synthetic(mainFamilies:number,fastFamilies:number,shared:number) {
  const main=[
    ...Array.from({length:mainFamilies-shared},(_,i)=>make("main","main-only-"+i)),
    ...Array.from({length:shared},(_,i)=>make("main","shared-"+i)),
  ];
  const fast=[
    ...Array.from({length:fastFamilies-shared},(_,i)=>make("fast","fast-only-"+i)),
    ...Array.from({length:shared},(_,i)=>make("fast","shared-"+i)),
  ];
  return {main,fast};
}

describe("future UFC 24-appearance selector — not active in live Daily",()=>{
  it("delivers precisely 48 Main and 120 Fast semantic families across 24 official shared packs",()=>{
    const {main,fast}=synthetic(60,140,20);
    const packs=Array.from({length:UFC_FEUD_V2_UNIQUE_APPEARANCES},
      (_,index)=>planUfcFeudV2Appearance(main,fast,index));
    const ids=packs.flatMap(p=>[...p.main,...p.fast].map(ufcFeudSemanticFamily));
    expect(packs).toHaveLength(24);
    expect(packs.every(p=>p.main.length===2&&p.fast.length===5)).toBe(true);
    expect(ids).toHaveLength(168);
    expect(new Set(ids).size).toBe(168);
    expect(new Set(packs.flatMap(p=>p.main.map(q=>q.id))).size).toBe(48);
    expect(new Set(packs.flatMap(p=>p.fast.map(q=>q.id))).size).toBe(120);
    for(let i=0;i<24;i++){
      expect(planUfcFeudV2Appearance(main,fast,i)).toEqual(packs[i]);
      expect(new Set([...packs[i]!.main,...packs[i]!.fast].map(ufcFeudSemanticFamily)).size).toBe(7);
    }
  });

  it("handles the tightest feasible cross-lane overlap deterministically",()=>{
    const {main,fast}=synthetic(48,132,12);
    const used=Array.from({length:24},(_,i)=>planUfcFeudV2Appearance(main,fast,i))
      .flatMap(p=>[...p.main,...p.fast].map(ufcFeudSemanticFamily));
    expect(new Set(used).size).toBe(168);
  });

  it("blocks inadequate content and too much shared Main/Fast material",()=>{
    const shortage=synthetic(47,130,0);
    expect(()=>planUfcFeudV2Appearance(shortage.main,shortage.fast,0)).toThrow("lacks");
    const overlap=synthetic(48,120,1);
    expect(()=>planUfcFeudV2Appearance(overlap.main,overlap.fast,0)).toThrow("share too many");
    expect(()=>planUfcFeudV2Appearance(UFC_V2_NEW_MAIN_DRAFTS,UFC_V2_NEW_FAST_DRAFTS,0)).toThrow("lacks");
    expect(()=>planUfcFeudV2Appearance(shortage.main,shortage.fast,-1)).toThrow("Invalid");
  });

  it("rotates only at 24-appearance boundaries and never uses personal state",()=>{
    const {main,fast}=synthetic(60,140,20);
    const last=planUfcFeudV2Appearance(main,fast,23);
    const next=planUfcFeudV2Appearance(main,fast,24);
    expect(last.cycle).toBe(0);
    expect(next.cycle).toBe(1);
    expect(next.appearanceIndex).toBe(24);
    expect(planUfcFeudV2Appearance(main,fast,24)).toEqual(next);
  });
});
