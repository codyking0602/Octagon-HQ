import { describe,expect,it } from "vitest";
import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";
import {
  buildUfcFeudTwentyFourAppearancePlan,
  UFC_FUTURE_FEUD_MAIN_PER_APPEARANCE,
  UFC_FUTURE_FEUD_FAST_PER_APPEARANCE,
} from "./ufcSportsFeudFutureRotation";

const make=(id:string,group=id):SportsFeudAuthoredQuestion=>({
  id,category:group,collisionGroup:group,prompt:"Name an example for "+group,
  entityKind:"other",
  answers:Array.from({length:8},(_,i)=>({name:"Answer "+i})),
});
const family=(q:SportsFeudAuthoredQuestion)=>q.collisionGroup??q.category;

describe("UFC future-only 24-appearance no-repeat planner",()=>{
  it("allocates 48 Main + 120 Fast independently without any semantic-family repetitions",()=>{
    const main=Array.from({length:52},(_,i)=>make("main-"+i));
    const fast=Array.from({length:138},(_,i)=>make("fast-"+i));
    const p=buildUfcFeudTwentyFourAppearancePlan({main,fast,family},0);
    expect(p.appearances).toHaveLength(24);
    const ids:string[]=[];
    const families:string[]=[];
    for(const x of p.appearances){
      expect(x.main).toHaveLength(UFC_FUTURE_FEUD_MAIN_PER_APPEARANCE);
      expect(x.fast).toHaveLength(UFC_FUTURE_FEUD_FAST_PER_APPEARANCE);
      for(const q of [...x.main,...x.fast]){ids.push(q.id);families.push(family(q))}
    }
    expect(ids).toHaveLength(168);
    expect(new Set(ids).size).toBe(168);
    expect(new Set(families).size).toBe(168);
    expect(p.mainFamilies).toHaveLength(48);
    expect(p.fastFamilies).toHaveLength(120);
    expect(buildUfcFeudTwentyFourAppearancePlan({main,fast,family},0)).toEqual(p);
    expect(buildUfcFeudTwentyFourAppearancePlan({main,fast,family},1)).not.toEqual(p);
  });
  it("reserves cross-round shared topic families only once",()=>{
    const main=[
      ...Array.from({length:45},(_,i)=>make("main-only-"+i)),
      ...Array.from({length:7},(_,i)=>make("main-shared-"+i,"shared-"+i)),
    ];
    const fast=[
      ...Array.from({length:118},(_,i)=>make("fast-only-"+i)),
      ...Array.from({length:7},(_,i)=>make("fast-shared-"+i,"shared-"+i)),
    ];
    const p=buildUfcFeudTwentyFourAppearancePlan({main,fast,family},3);
    const groups=p.appearances.flatMap(x=>[...x.main,...x.fast].map(family));
    expect(new Set(groups).size).toBe(168);
    expect(groups.filter(x=>x.startsWith("shared-"))).toHaveLength(5);
  });
  it("fails closed for the currently documented 29 Main / 78 Fast provisional-family gap",()=>{
    const main=Array.from({length:29},(_,i)=>make("m-"+i));
    const fast=Array.from({length:78},(_,i)=>make("f-"+i));
    expect(()=>buildUfcFeudTwentyFourAppearancePlan({main,fast,family},0))
      .toThrow(/insufficient distinct semantic topics/);
  });
  it("fails when raw rows are plentiful but 24-appearance family coverage is not",()=>{
    const main=Array.from({length:200},(_,i)=>make("m-"+i,"main-topic-"+i%10));
    const fast=Array.from({length:300},(_,i)=>make("f-"+i,"fast-topic-"+i%15));
    expect(()=>buildUfcFeudTwentyFourAppearancePlan({main,fast,family},0))
      .toThrow(/insufficient distinct semantic topics/);
  });
  it("rejects invalid cycle and incomplete group attribution",()=>{
    const q=make("a");
    expect(()=>buildUfcFeudTwentyFourAppearancePlan({main:[q],fast:[q],family},-1))
      .toThrow(/nonnegative/);
    expect(()=>buildUfcFeudTwentyFourAppearancePlan({main:[q],fast:[q],family:()=>""},0))
      .toThrow(/semantic family missing/);
  });
});
