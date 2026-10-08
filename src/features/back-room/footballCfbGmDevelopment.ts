/**
 * CFB GM development: two-year college-stage model, intentionally independent
 * of the canonical 2026 Wheel/HQ current-ability grades.
 *
 * Profiles are provisional college-career priors unless explicitly overridden.
 * Do not describe the priors as individualized performance research. A separate
 * 468-player evidence ledger remains the quality gate before final release.
 */
export type CfbGmClass = "FR" | "SO" | "JR" | "SR" | "3RD" | "5TH" | "6TH" | "7TH" | null;
export type CfbGmDevProfile = {
  breakout:number; improve:number; steady:number; decline:number;
  maxGain:number; maxLoss:number; volatility:"LOW"|"MEDIUM"|"HIGH";
  confidence:"provisional"|"reviewed-anchor";
};
export type CfbGmDevOutcome="BREAKOUT"|"IMPROVED"|"STEADY"|"DECLINED";
export type CfbGmDevResult={
  before:number; after:number; delta:number; outcome:CfbGmDevOutcome;
  profile:CfbGmDevProfile;
};
const normalize=(name:string)=>name.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");
const hash=(value:string)=>{let x=2166136261;for(let i=0;i<value.length;i++){x^=value.charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0};
const uniform=(token:string)=>hash(token)/4294967296;
const classes:Readonly<Record<Exclude<CfbGmClass,null>,readonly [number,number,number,number,number,number]>>={
  FR:[22,43,29,6,8,4], SO:[19,39,33,9,7,4], JR:[12,32,43,13,6,5],
  SR:[8,23,48,21,4,5], "3RD":[13,33,40,14,6,5],
  "5TH":[6,20,50,24,4,6],"6TH":[4,16,50,30,3,6],"7TH":[4,14,51,31,3,6],
};
const special:Readonly<Record<string,readonly [number,number,number,number,number,number]>>={
  // Individually reviewed direction only; exact 2025/2026 season-performance
  // evidence still needs to be attached to the complete research ledger.
  "texas|colinsimmons":[3,12,67,18,1,5],
  "ohio-state|jeremiahsmith":[4,18,62,16,2,5],
  "texas|archmanning":[7,26,49,18,3,5],
  "oregon|dantemoore":[9,27,49,15,4,5],
  "lsu|samleavitt":[10,28,47,15,4,5],
  "texas|ryanwingo":[11,35,43,11,5,4],
  "texas|camcoleman":[12,32,43,13,5,5],
};
export function cfbGmDevProfile(id:string,grade:number,stage:CfbGmClass):CfbGmDevProfile{
  const prior=special[id]??classes[stage??"JR"]??classes.JR;
  const [breakout,improve,steady,decline,maxGain,maxLoss]=prior;
  const volatility=stage==="FR"||stage==="SO"?"HIGH":stage==="JR"||stage==="3RD"?"MEDIUM":"LOW";
  // Grade ceiling is mathematical, never an excuse to rewrite Wheel HQ grades.
  return {breakout,improve,steady,decline,maxGain:Math.min(maxGain,Math.max(0,99-grade)),maxLoss,volatility,
    confidence:special[id]?"reviewed-anchor":"provisional"};
}
export function cfbGmDevelop(id:string,grade:number,stage:CfbGmClass,runSeed:string):CfbGmDevResult {
  if(!Number.isFinite(grade)||grade<50||grade>99)throw Error("Invalid CFB development authority grade");
  const profile=cfbGmDevProfile(id,grade,stage);
  const roll=uniform("cfb:develop:result:"+runSeed+":"+id)*100;
  const gainRoll=uniform("cfb:develop:magnitude:"+runSeed+":"+id);
  let delta=0;
  let outcome:CfbGmDevOutcome="STEADY";
  if(roll<profile.breakout){
    delta=profile.maxGain===0?0:Math.min(profile.maxGain,3+Math.floor(gainRoll*6));
    outcome=delta>0?"BREAKOUT":"STEADY";
  }else if(roll<profile.breakout+profile.improve){
    delta=profile.maxGain===0?0:Math.min(profile.maxGain,1+Math.floor(gainRoll*3));
    outcome=delta>0?"IMPROVED":"STEADY";
  }else if(roll>=profile.breakout+profile.improve+profile.steady){
    delta=-Math.min(profile.maxLoss,1+Math.floor(gainRoll*profile.maxLoss));
    outcome="DECLINED";
  }
  const after=Math.max(50,Math.min(99,grade+delta));
  return {before:grade,after,delta:after-grade,outcome,profile};
}
export function cfbGmNextClass(stage:CfbGmClass):CfbGmClass {
  if(stage==="FR")return "SO";
  if(stage==="SO")return "JR";
  if(stage==="JR"||stage==="3RD")return "SR";
  if(stage==="SR")return "5TH";
  if(stage==="5TH")return "6TH";
  if(stage==="6TH")return "7TH";
  return null; // 7th-year exceptions and unknown stages are never invented.
}
