import { footballGmOutlookFromOdds, footballGmTalentTier } from "../back-room/footballGmScouting";
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
export function nbaGmScoutTier(player:Pick<NbaGmDevPlayer,"currentGrade">){
  return footballGmTalentTier(player.currentGrade);
}

// New franchises receive server-authored odds from the exact same SQL function
// that resolves development. The historical fallback only serves legacy runs.
export function nbaGmScoutOutlook(player:Pick<NbaGmDevPlayer,"currentGrade"|"ageAtStart"|"reviewFlags"|"developmentOdds">,
  year:1|2|3=1):"HIGH UPSIDE"|"RISING"|"STEADY"|"BOOM/BUST"|"DECLINE RISK"{
  if(year<3&&player.developmentOdds)return footballGmOutlookFromOdds(player.developmentOdds);
  const age=player.ageAtStart==null?null:player.ageAtStart+year-1;
  if(age===null||year===3)return "STEADY";
  if(age>=35 || (age>=32&&player.currentGrade<=85))return "DECLINE RISK";
  if(age>=32&&player.reviewFlags.includes("availability-separate"))return "BOOM/BUST";
  if(age<=23&&player.currentGrade<=92)return "HIGH UPSIDE";
  if(age<=26&&player.currentGrade<=91)return "RISING";
  return "STEADY";
}
