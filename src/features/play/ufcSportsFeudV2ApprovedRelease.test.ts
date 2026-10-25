import { describe, expect, it } from "vitest";
import { buildUfcFeudV2DailyPack } from "./sportsFeudDailyBanks";
import { UFC_V2_APPROVED_MAIN_IDS,UFC_V2_APPROVED_FAST_IDS,UFC_V2_HELD_IDS,
  UFC_V2_NEW_MAIN_DRAFTS,UFC_V2_NEW_FAST_DRAFTS,ufcFeudAppearanceDatesInWindow,
  ufcFeudSemanticFamily,ufcFeudSixMonthReleaseReadiness } from "./ufcSportsFeudV2EditorialReleaseGate";
import { UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT,UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT } from "./ufcSportsFeudV2RetainedDraft";
import { planUfcFeudV2Appearance } from "./ufcSportsFeudV2FutureSelection";

const main=[...UFC_V2_NEW_MAIN_DRAFTS,...UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT].filter(q=>UFC_V2_APPROVED_MAIN_IDS.has(q.id));
const fast=[...UFC_V2_NEW_FAST_DRAFTS,...UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT].filter(q=>UFC_V2_APPROVED_FAST_IDS.has(q.id));

describe("UFC V2 official release topic and Daily selection coverage",()=>{
 it("includes exactly 48 Main and 120 Fast unique, never-held concepts",()=>{
   expect(main).toHaveLength(48); expect(fast).toHaveLength(120);
   expect(UFC_V2_APPROVED_MAIN_IDS.size).toBe(48);
   expect(UFC_V2_APPROVED_FAST_IDS.size).toBe(120);
   const all=[...main,...fast];
   expect(new Set(all.map(q=>ufcFeudSemanticFamily(q))).size).toBe(168);
   for(const q of all){ expect(UFC_V2_HELD_IDS.has(q.id),q.id).toBe(false); expect(q.answers,q.id).toHaveLength(8); }
   expect(ufcFeudSixMonthReleaseReadiness().ready).toBe(true);
 });
 it("has no repeated topic in any overlapping 24-appearance window across 72 appearances",()=>{
   const packs=Array.from({length:72},(_,i)=>planUfcFeudV2Appearance(main,fast,i));
   for(let start=0;start<=48;start++) {
     const keys=packs.slice(start,start+24).flatMap(p=>[...p.main,...p.fast].map(ufcFeudSemanticFamily));
     expect(new Set(keys).size,"window "+start).toBe(168);
   }
 });
 it("publishes two Main and five Fast on exactly 24 official future calendar days",()=>{
   const dates=ufcFeudAppearanceDatesInWindow("2026-10-24","2027-04-24");
   expect(dates).toHaveLength(24);
   const seen=new Set<string>();
   for(const [i,day] of dates.entries()){
     const pack=buildUfcFeudV2DailyPack(day);
     expect(pack.id).toContain("sports-feud-v2-ufc-"+day);
     expect(pack.mainBoards).toHaveLength(2);
     expect(pack.fastMoney).toHaveLength(5);
     const plan=planUfcFeudV2Appearance(main,fast,i);
     expect(pack.mainBoards.map(q=>q.id)).toEqual(plan.main.map(q=>q.id));
     expect(pack.fastMoney.map(q=>q.id)).toEqual(plan.fast.map(q=>q.id));
     for(const q of [...plan.main,...plan.fast]){ expect(seen.has(ufcFeudSemanticFamily(q)),q.id).toBe(false);seen.add(ufcFeudSemanticFamily(q));}
   }
   expect(seen.size).toBe(168);
 });
});