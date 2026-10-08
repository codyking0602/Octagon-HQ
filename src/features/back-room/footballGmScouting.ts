import { footballGmProjectedGradeForPlayer, type FootballGmPlayer } from "./footballGmEngine";
import { footballGmDevelopmentOdds } from "./wheelFootballGmEconomy";

export type FootballGmTalentTier = "ELITE" | "IMPACT" | "STARTER" | "DEPTH";
export type FootballGmFutureOutlook = "HIGH UPSIDE" | "RISING" | "STEADY" | "BOOM/BUST" | "DECLINE RISK";
export type FootballGmDevelopmentResult = "BREAKOUT" | "IMPROVED" | "HELD STEADY" | "REGRESSED" | "MAJOR REGRESSION";

export function footballGmTalentTier(grade: number): FootballGmTalentTier {
  if (grade >= 94) return "ELITE";
  if (grade >= 89) return "IMPACT";
  if (grade >= 83) return "STARTER";
  return "DEPTH";
}

/**
 * Based on the same authored probabilities consumed by the development roll.
 * Distributions are directional scouting signals, NOT promised outcomes.
 * The boom/bust branch must precede directional branches: a 25% breakout
 * chance paired with a 35% decline chance is not ordinary "rising" talent.
 */
export function footballGmOutlookFromOdds(odds: {
  breakoutPct: number; improvePct: number; steadyPct: number; declinePct: number;
}): FootballGmFutureOutlook {
  const { breakoutPct: breakout, improvePct: improve, declinePct: decline } = odds;
  const positive = breakout + improve;
  if (breakout >= 18 && decline >= 25 && positive >= 32) return "BOOM/BUST";
  if (decline >= positive + 6 || (decline >= 38 && decline >= positive * 0.8)) return "DECLINE RISK";
  if (breakout >= 18 && positive >= decline + 12) return "HIGH UPSIDE";
  if (positive >= decline + 12) return "RISING";
  if (decline >= positive + 5) return "DECLINE RISK";
  return "STEADY";
}

/** Reuse the same cutoffs as the established Year 1 offseason report. */
export function footballGmDevelopmentResult(delta: number): FootballGmDevelopmentResult {
  if (delta >= 3) return "BREAKOUT";
  if (delta >= 0.85) return "IMPROVED";
  if (delta <= -2.5) return "MAJOR REGRESSION";
  if (delta <= -0.85) return "REGRESSED";
  return "HELD STEADY";
}

export function footballGmScoutingSnapshot(player: FootballGmPlayer, year: 1 | 2, seed?: string) {
  const grade = footballGmProjectedGradeForPlayer(player, year, seed);
  const odds = footballGmDevelopmentOdds({
    playerId: player.id,
    step: year === 1 ? 0 : 1,
    grade,
    originalGrade: player.currentGrade,
    age: player.age + year - 1,
    position: player.marketPosition,
  });
  // Synthetic/legacy fixtures may lack an audited identity profile. Live
  // players all have a profile; fallback retains a neutral, honest scout read.
  const outlook = odds ? footballGmOutlookFromOdds(odds) : "STEADY";
  const development = year === 2
    ? footballGmDevelopmentResult(grade - player.currentGrade) : null;
  return { tier: footballGmTalentTier(grade), outlook, development };
}

export function footballGmRepriceLabel(risk: FootballGmPlayer["extensionRisk"]) {
  if (risk === "LOCKED") return "SALARY LOCKED";
  return risk === "MEDIUM" ? "MED REPRICE" : risk + " REPRICE";
}
