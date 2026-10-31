import { footballGmOutlookFromOdds } from "../back-room/footballGmScouting";
import type { NbaGmDevPlayer } from "./nbaGmDevModel";

export type NbaGmScoutTier = "ELITE" | "IMPACT" | "STARTER" | "DEPTH";
export type NbaGmRepriceRisk = "LOW" | "MED" | "HIGH" | "LOCKED";

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

/**
 * NBA-specific scouting roles, not Football GM's roster-size/position cutoffs.
 * Editorial 330-person census: 10 elite / 33 impact / 125 starter / 162 depth.
 * Grades, skills, cap prices and server simulation remain entirely unchanged.
 */
export function nbaGmScoutTier(player:Pick<NbaGmDevPlayer,"currentGrade">):NbaGmScoutTier{
  return player.currentGrade>=94?"ELITE":player.currentGrade>=86?"IMPACT":
    player.currentGrade>=79?"STARTER":"DEPTH";
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

type RepriceSubject=Pick<NbaGmDevPlayer,
  "currentGrade"|"gameContract"|"salaries"|"developmentOdds"|"developmentForecast">;
export type NbaGmRepriceProjection={
  risk:NbaGmRepriceRisk;
  /** E[max(projected next-season salary - current-season salary, 0)], in dollars. */
  expectedUpsideDollars:number;
  /** Chance of a >=18% next-year salary jump, based on development + market bands. */
  largeJumpProbability:number;
};

/**
 * Pre-draft projection, never a peek at the seeded outcome.
 * Integrates all four server-authoritative development probabilities against
 * the v3 salary engine's 1.105 grade multiplier, 1.065/1.12 market lifts,
 * 0.62-2.0 bounds, and nine equally spaced deterministic market scenarios.
 * No seed, resolved grade or undisclosed next-year salary is read.
 *
 * season=1 forecasts year 1 -> 2; season=2 forecasts year 2 -> 3.
 */
export function nbaGmScoutRepriceProjection(player:RepriceSubject,season:1|2=1):NbaGmRepriceProjection{
  if(player.gameContract==="3YR")return {
    risk:"LOCKED",expectedUpsideDollars:0,largeJumpProbability:0,
  };
  const currentSalary=player.salaries[season-1];
  const forecast=player.developmentForecast;
  const odds=player.developmentOdds;
  if(!forecast||!odds){
    // Historical V2 and pre-profile V3 saves do not expose v4 probabilities.
    // Use the frozen pre-draft salary fixture, never a realized seeded year 3
    // salary returned by the server after Season 1.
    const projected=player.salaries[0]*(season===1?1.05:1.10);
    const expectedUpsideDollars=Math.max(0,projected-currentSalary);
    return {
      risk:classifyReprice(expectedUpsideDollars/currentSalary,expectedUpsideDollars,0),
      expectedUpsideDollars,largeJumpProbability:0,
    };
  }
  const gain=Math.max(0,Math.min(forecast.maxAnnualGain,
    Math.min(99,forecast.gradeAtCalibration+forecast.careerHeadroom)-player.currentGrade));
  const loss=Math.max(0,forecast.maxAnnualLoss);
  const delta=[
    gain*.775,
    Math.min(gain*.62,.3+.5*Math.min(2.4,gain*.55)),
    0,
    -(.35+.5*Math.max(0,loss-.35)),
  ];
  const weights=[odds.breakoutPct,odds.improvePct,odds.steadyPct,odds.declinePct];
  const market=Math.max(0,Math.min(10,forecast.marketVariancePct))/100;
  const referenceSalary=player.salaries[0];
  let expectedUpsideDollars=0,largeJumpProbability=0;
  for(let outcome=0;outcome<4;outcome++){
    const probability=weights[outcome]!/100;
    const cumulativeGradeChange=player.currentGrade+delta[outcome]!-forecast.gradeAtCalibration;
    const core=Math.max(.66,Math.min(2,Math.pow(1.105,cumulativeGradeChange)*(season===1?1.065:1.12)));
    for(let marketIndex=-4;marketIndex<=4;marketIndex++){
      const factor=Math.max(.62,Math.min(2,core*(1+market*marketIndex/4)));
      const price=Math.max(2_500_000,Math.round(referenceSalary*factor/100_000)*100_000);
      expectedUpsideDollars+=probability*Math.max(0,price-currentSalary)/9;
      if(price>=currentSalary*1.18)largeJumpProbability+=probability/9;
    }
  }
  const relativeExposure=expectedUpsideDollars/currentSalary;
  return {risk:classifyReprice(relativeExposure,expectedUpsideDollars,largeJumpProbability),
    expectedUpsideDollars,largeJumpProbability};
}

/** $155M game cap calibrated, not Football GM's real-NFL-dollar thresholds. */
function classifyReprice(exposure:number,dollars:number,largeJump:number):Exclude<NbaGmRepriceRisk,"LOCKED">{
  if(dollars>=3_000_000||largeJump>=.36||(exposure>=.18&&dollars>=1_100_000))return "HIGH";
  if(dollars>=850_000||largeJump>=.15||exposure>=.10)return "MED";
  return "LOW";
}
export function nbaGmScoutRepriceLabel(player:RepriceSubject,season:1|2=1):string{
  const risk=nbaGmScoutRepriceProjection(player,season).risk;
  return risk==="LOCKED"?"SALARY LOCKED":risk+" REPRICE";
}
