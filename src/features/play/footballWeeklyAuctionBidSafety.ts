export type FootballWeeklyAuctionBidMap = Record<1 | 2 | 3, number>;

export type FootballWeeklyAuctionBidSafety = {
  legal: boolean;
  committed: number;
  message: string | null;
};

export function evaluateFootballWeeklyAuctionBids(
  bankroll: number,
  ownedCount: number,
  bids: FootballWeeklyAuctionBidMap,
): FootballWeeklyAuctionBidSafety {
  const values = [bids[1], bids[2], bids[3]].map((value) => Math.max(0, Math.floor(value)));
  const committed = values.reduce((sum, value) => sum + value, 0);

  if (committed > bankroll) {
    return {
      legal: false,
      committed,
      message: `Today’s bids can total at most $${bankroll}.`,
    };
  }

  const teamsNeeded = Math.max(0, 3 - ownedCount);
  if (teamsNeeded <= 1) {
    return { legal: true, committed, message: null };
  }

  const sorted = [...values].sort((a, b) => b - a);
  let worstCaseSpend = 0;

  for (let wins = 1; wins < teamsNeeded; wins += 1) {
    worstCaseSpend += sorted[wins - 1] ?? 0;
    const reserveNeeded = teamsNeeded - wins;
    if (worstCaseSpend > bankroll - reserveNeeded) {
      return {
        legal: false,
        committed,
        message: reserveNeeded === 1
          ? `Keep at least $1 available if only your highest bid wins, unless today’s wins would complete your 3 teams.`
          : `Keep at least $${reserveNeeded} available if only your highest bid wins, unless today’s wins would complete your 3 teams.`,
      };
    }
  }

  return { legal: true, committed, message: null };
}
