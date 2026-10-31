import { footballGmOutlookFromOdds } from "../back-room/footballGmScouting";
import type { NbaGmDevPlayer } from "./nbaGmDevModel";

/** Only a display translation. Internal 0-99 values stay intact and hidden. */
export function nbaGmScoutLetter(value:number):string{
  if(value>=95)return "A+";
  if(value>=90)return "A";
  if(value>=85)return "A-";
  if(value>=80)return "B+";
  if(value>=75)return "B";
  if(value>=70)return "B-";
  if(value>=65)return "C+";
  if(value>=60)return "C";
  if(value>=55)return "C-";
  if(value>=50)return "D+";
  if(value>=45)return "D";
  if(value>=40)return "D-";
  return "F";
}

/** NBA-specific labels for 330 calibrated, *unchanged* editorial overalls.
 * 94+ remains scarce; 88+ is excellent impact; 79+ is credible starter caliber.
 * These labels do not mutate ratings or Football GM's NFL thresholds. */
export type NbaGmScoutTalentTier = "ELITE"|"IMPACT"|"STARTER"|"DEPTH";
export function nbaGmScoutTier(player:Pick<NbaGmDevPlayer,"currentGrade">):NbaGmScoutTalentTier{
  if(player.currentGrade>=94)return "ELITE";
  if(player.currentGrade>=88)return "IMPACT";
  if(player.currentGrade>=79)return "STARTER";
  return "DEPTH";
}
export type NbaGmRepriceRisk = "LOW"|"MEDIUM"|"HIGH"|"LOCKED";
export function nbaGmRepriceLabel(risk:NbaGmRepriceRisk|null|undefined,
  contract:"1YR"|"3YR"):{
    label:string;tone:"low"|"med"|"high"|"locked"|"unknown";
  }{
  if(contract==="3YR"||risk==="LOCKED")return {label:"SALARY LOCKED",tone:"locked"};
  if(risk==="LOW")return {label:"LOW REPRICE",tone:"low"};
  if(risk==="MEDIUM")return {label:"MED REPRICE",tone:"med"};
  if(risk==="HIGH")return {label:"HIGH REPRICE",tone:"high"};
  // Older saved games have no equivalent forecast; avoid invented precision.
  return {label:"REPRICE RISK",tone:"unknown"};
}

// The authoritative v4 SQL odds ALWAYS take precedence in new franchises.
// Preserve the original age-only display fallback for old V2/V3 saved games
// as a compatibility policy; it is not the source for any new-run outcomes.
export function nbaGmScoutOutlook(player:Pick<NbaGmDevPlayer,
  "currentGrade"|"ageAtStart"|"reviewFlags"|"developmentOdds">,
  year:1|2|3=1):"HIGH UPSIDE"|"RISING"|"STEADY"|"BOOM/BUST"|"DECLINE RISK"{
  if(year<3&&player.developmentOdds)return footballGmOutlookFromOdds(player.developmentOdds);
  const age=player.ageAtStart==null?null:player.ageAtStart+year-1;
  if(age===null||year===3)return "STEADY";
  if(age>=35||(age>=32&&player.currentGrade<=85))return "DECLINE RISK";
  if(age>=32&&player.reviewFlags.includes("availability-separate"))return "BOOM/BUST";
  if(age<=23&&player.currentGrade<=92)return "HIGH UPSIDE";
  if(age<=26&&player.currentGrade<=91)return "RISING";
  return "STEADY";
}
