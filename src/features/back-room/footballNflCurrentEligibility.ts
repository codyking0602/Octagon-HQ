/**
 * Verified current NFL affiliations as of October 26, 2026.
 * These three released players must not appear in NEW Wheel/GM drafts.
 * Preserve original contract/grade/source records and saved GM player IDs.
 * CHI Xavier Woods: https://www.chicagobears.com/team/transactions/
 * IND Darius Slayton: https://www.colts.com/news/colts-release-wide-receiver-darius-slayton
 * NYG Najee Harris: https://www.giants.com/team/transactions/2026
 * A release is not proof of future free-agent status; verify signings before reactivation.
 */
export const NFL_CURRENT_RELEASED_GM_IDS = new Set([
  "CHI|Secondary|xavierwoods",
  "IND|WR|dariusslayton",
  "NYG|RB|najeeharris",
] as const);

export function nflPlayerEligibleForNewGame(id: string): boolean {
  return !NFL_CURRENT_RELEASED_GM_IDS.has(id as never);
}
