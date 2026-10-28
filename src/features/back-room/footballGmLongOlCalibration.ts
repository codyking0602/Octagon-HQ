import type { NflGmLongPlayer } from "./footballGmLongCatalog";
/** Use existing source odds, moderating volatility for proven elite OL without inventing ages.
 * A source decline remains possible; major regression is a rare tail event. */
export function nflGmLongCalibratedOlDevelopment(player: NflGmLongPlayer) {
  const original = player.development;
  if (!original || player.family !== "OL" || player.currentGrade < 92) return original;
  const declinePct = Math.min(original.declinePct, 12);
  return { ...original, declinePct, steadyPct: original.steadyPct + original.declinePct - declinePct };
}
export function nflGmLongOlRegressionMagnitude(player: NflGmLongPlayer, severeTail: boolean): number {
  const odds = player.development;
  if (!odds) return 0;
  const normalLoss = Math.max(1, Math.ceil(odds.maxAnnualLoss * .7));
  return player.family === "OL" && player.currentGrade >= 92
    ? severeTail ? Math.max(3, normalLoss) : Math.min(2, normalLoss)
    : normalLoss;
}
