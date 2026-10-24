import type { SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";

/**
 * Future-only UFC Feud editorial planning.
 * This pure planner is deliberately not imported by Daily publishing.
 *
 * Each official appearance uses two Main boards and five Fast Money boards.
 * Families are globally unique across the whole cycle, including collisions
 * between Main and Fast, not merely unique question IDs or prompt wording.
 *
 * Call this only with fully APPROVED, source-checked question banks. Historical
 * published packs remain under the existing v1 builder, not this planner.
 */
export const UFC_FUTURE_FEUD_MAIN_PER_APPEARANCE = 2;
export const UFC_FUTURE_FEUD_FAST_PER_APPEARANCE = 5;

export type UFCFeudSemanticFamily = (q: SportsFeudAuthoredQuestion) => string;
export interface UFCFeudCyclePlan {
  readonly appearances: readonly {
    readonly main: readonly SportsFeudAuthoredQuestion[];
    readonly fast: readonly SportsFeudAuthoredQuestion[];
  }[];
  readonly mainFamilies: readonly string[];
  readonly fastFamilies: readonly string[];
}
function hash(value:string) {
  let n=2166136261;
  for(const c of value) {n^=c.charCodeAt(0);n=Math.imul(n,16777619)}
  return n>>>0;
}
function sortedKeys(keys: Iterable<string>, seed:string){
  return [...keys].sort((a,b)=>hash(seed+"|"+a)-hash(seed+"|"+b)||a.localeCompare(b));
}
function representativeByFamily(source:readonly SportsFeudAuthoredQuestion[], family:UFCFeudSemanticFamily,seed:string) {
  const groups=new Map<string,SportsFeudAuthoredQuestion[]>();
  for(const q of source){
    const key=family(q)?.trim();
    if(!key) throw new Error("UFC Feud semantic family missing: "+q.id);
    const list=groups.get(key)??[];
    list.push(q);groups.set(key,list);
  }
  return new Map([...groups].map(([key,list])=>[
    key, [...list].sort((a,b)=>hash(seed+"|"+a.id)-hash(seed+"|"+b.id)||a.id.localeCompare(b.id))[0]!,
  ] as const));
}
export function buildUfcFeudTwentyFourAppearancePlan(
  input: {
    main:readonly SportsFeudAuthoredQuestion[];
    fast:readonly SportsFeudAuthoredQuestion[];
    family:UFCFeudSemanticFamily;
  },
  cycle:number,
  appearances=24,
):UFCFeudCyclePlan {
  if(!Number.isSafeInteger(cycle)||cycle<0)throw new Error("UFC Feud cycle must be nonnegative");
  if(!Number.isSafeInteger(appearances)||appearances<1)throw new Error("Invalid UFC Feud appearance count");
  const needMain=appearances*UFC_FUTURE_FEUD_MAIN_PER_APPEARANCE;
  const needFast=appearances*UFC_FUTURE_FEUD_FAST_PER_APPEARANCE;
  const seed="ufc-feud-future-v1:"+cycle;
  const main=representativeByFamily(input.main,input.family,seed);
  const fast=representativeByFamily(input.fast,input.family,seed);
  const mainOnly=sortedKeys([...main.keys()].filter(k=>!fast.has(k)),seed+"|mOnly");
  const fastOnly=sortedKeys([...fast.keys()].filter(k=>!main.has(k)),seed+"|fOnly");
  const shared=sortedKeys([...main.keys()].filter(k=>fast.has(k)),seed+"|shared");
  const requiredSharedMain=Math.max(0,needMain-mainOnly.length);
  const requiredSharedFast=Math.max(0,needFast-fastOnly.length);
  if(requiredSharedMain+requiredSharedFast>shared.length
    || main.size<needMain || fast.size<needFast){
    throw new Error("UFC Feud six-month editorial bank insufficient distinct semantic topics: "+
      JSON.stringify({needMain,needFast,availableMain:main.size,availableFast:fast.size,
        mainOnly:mainOnly.length,fastOnly:fastOnly.length,shared:shared.length}));
  }
  const mainKeys=[
    ...mainOnly.slice(0,Math.min(mainOnly.length,needMain)),
    ...shared.slice(0,requiredSharedMain),
  ];
  const usedMain=new Set(mainKeys);
  const fastKeys=[
    ...fastOnly.slice(0,Math.min(fastOnly.length,needFast)),
    ...shared.filter(k=>!usedMain.has(k)).slice(0,requiredSharedFast),
  ];
  // If either side was independently overfull, the two lists are already at
  // exact quota. Shared families can never be selected twice.
  if(mainKeys.length!==needMain||fastKeys.length!==needFast)
    throw new Error("UFC Feud cycle planner failed its semantic allocation");
  const orderedMain=sortedKeys(mainKeys,seed+"|main");
  const orderedFast=sortedKeys(fastKeys,seed+"|fast");
  const result=Array.from({length:appearances},(_,index)=>({
    main: orderedMain.slice(index*2,index*2+2).map(k=>main.get(k)!),
    fast: orderedFast.slice(index*5,index*5+5).map(k=>fast.get(k)!),
  }));
  return {appearances:result,mainFamilies:orderedMain,fastFamilies:orderedFast};
}
