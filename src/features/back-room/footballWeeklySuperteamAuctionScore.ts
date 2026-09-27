/**
 * Presentation-only CFB Superteam score.
 *
 * The server-owned raw seven-player average remains the source of truth for
 * ranking and tiebreaking. This linear display scale simply makes meaningful
 * raw-average separation read like a conventional scoreboard:
 * 90 -> 70, 92 -> 80, 94 -> 90, 96 -> 100.
 */
export function footballWeeklySuperteamAuctionScore(
  rawScore: number | null | undefined,
): number | null {
  if (rawScore == null || !Number.isFinite(Number(rawScore))) return null;
  return Math.round(Number(rawScore) * 5 - 380);
}
