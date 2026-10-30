import { footballGmTalentTier } from "../back-room/footballGmScouting";
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
