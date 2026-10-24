import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";
import { ufcFeudSemanticFamily } from "./ufcSportsFeudV2EditorialReleaseGate";

/** Future-only editorial selection. It has deliberately NO imports from live Daily.
 * A canonical appearance = one shared published UFC Feud day, not player attempts.
 * Never replace an already-published historical question pack with this plan.
 */
export const UFC_FEUD_V2_UNIQUE_APPEARANCES = 24;
export const UFC_FEUD_V2_MAIN_PER_APPEARANCE = 2;
export const UFC_FEUD_V2_FAST_PER_APPEARANCE = 5;

function stableHash(value:string){
  let hash=2166136261;
  for(let i=0;i<value.length;i++){
    hash^=value.charCodeAt(i);
    hash=Math.imul(hash,16777619);
  }
  return hash>>>0;
}
function seedOrder<T>(values:readonly T[],seed:string,key:(x:T)=>string):T[]{
  return [...values].sort((a,b)=>{
    const ah=stableHash(seed+"|"+key(a)),bh=stableHash(seed+"|"+key(b));
    return ah-bh || key(a).localeCompare(key(b));
  });
}
function topicGroups(source:readonly SportsFeudAuthoredQuestion[]){
  const groups=new Map<string,SportsFeudAuthoredQuestion[]>();
  for(const q of source){
    const family=ufcFeudSemanticFamily(q);
    const collection=groups.get(family)??[];
    collection.push(q);
    groups.set(family,collection);
  }
  return groups;
}
function chooseQuestion(questions:readonly SportsFeudAuthoredQuestion[],cycle:number,group:string){
  const sorted=[...questions].sort((a,b)=>a.id.localeCompare(b.id));
  return sorted[stableHash("ufc-feud-v2|"+cycle+"|"+group)%sorted.length]!;
}

export interface UfcFutureFeudSevenBoards {
  readonly appearanceIndex:number;
  readonly cycle:number;
  readonly main:readonly SportsFeudAuthoredQuestion[];
  readonly fast:readonly SportsFeudAuthoredQuestion[];
}

/** Pure planner; caller must supply explicitly reviewer-certified arrays.
 * Throws rather than padding inadequate volume with reprompted/synonymous topics.
 */
export function planUfcFeudV2Appearance(
  approvedMain:readonly SportsFeudAuthoredQuestion[],
  approvedFast:readonly SportsFeudAuthoredQuestion[],
  appearanceIndex:number,
):UfcFutureFeudSevenBoards{
  if(!Number.isSafeInteger(appearanceIndex)||appearanceIndex<0)
    throw new Error("Invalid UFC Feud official appearance index");
  const cycle=Math.floor(appearanceIndex/UFC_FEUD_V2_UNIQUE_APPEARANCES);
  const slot=appearanceIndex%UFC_FEUD_V2_UNIQUE_APPEARANCES;
  const requiredMain=UFC_FEUD_V2_UNIQUE_APPEARANCES*UFC_FEUD_V2_MAIN_PER_APPEARANCE;
  const requiredFast=UFC_FEUD_V2_UNIQUE_APPEARANCES*UFC_FEUD_V2_FAST_PER_APPEARANCE;
  const main=topicGroups(approvedMain),fast=topicGroups(approvedFast);
  if(main.size<requiredMain||fast.size<requiredFast)
    throw new Error("UFC Feud V2 lacks 24 appearances of semantically distinct certified questions");
  const allUnique=new Set([...main.keys(),...fast.keys()]);
  if(allUnique.size<requiredMain+requiredFast)
    throw new Error("UFC Feud V2 Main and Fast share too many recall concepts");

  // Some topics may legitimately exist in both pools. Choose a disjoint cycle
  // allocation, seeded only by cycle (never user or current time).
  for(let attempt=0;attempt<256;attempt++){
    const mainKeys=seedOrder([...main.keys()],`ufc-v2-main-${cycle}-${attempt}`,x=>x)
      .slice(0,requiredMain);
    const mainSet=new Set(mainKeys);
    const fastKeys=seedOrder([...fast.keys()].filter(k=>!mainSet.has(k)),
      `ufc-v2-fast-${cycle}-${attempt}`,x=>x).slice(0,requiredFast);
    if(fastKeys.length!==requiredFast)continue;
    const selectedMain=mainKeys
      .slice(slot*UFC_FEUD_V2_MAIN_PER_APPEARANCE,(slot+1)*UFC_FEUD_V2_MAIN_PER_APPEARANCE)
      .map(k=>chooseQuestion(main.get(k)!,cycle,k));
    const selectedFast=fastKeys
      .slice(slot*UFC_FEUD_V2_FAST_PER_APPEARANCE,(slot+1)*UFC_FEUD_V2_FAST_PER_APPEARANCE)
      .map(k=>chooseQuestion(fast.get(k)!,cycle,k));
    return {appearanceIndex,cycle,main:selectedMain,fast:selectedFast};
  }
  throw new Error("UFC Feud V2 cannot allocate distinct editorial families across all 24 appearances");
}
