export type FootballWeeklyAuctionBidMap = Record<1 | 2 | 3, number>;
export type FootballWeeklyBuildQbBidMap = Record<1 | 2 | 3 | 4, number>;

export type FootballWeeklyAuctionBidSafety = {
  legal: boolean;
  committed: number;
  message: string | null;
};

function evaluateRequiredWins(
  bankroll: number,
  required: number,
  ownedCount: number,
  values: number[],
  noun: string,
): FootballWeeklyAuctionBidSafety {
  const normalized = values.map((value) => Math.max(0, Math.floor(value)));
  const committed = normalized.reduce((sum, value) => sum + value, 0);

  if (committed > bankroll) {
    return {
      legal: false,
      committed,
      message: `Today’s bids can total at most $${bankroll}.`,
    };
  }

  const needed = Math.max(0, required - ownedCount);
  if (needed <= 1) return { legal: true, committed, message: null };

  const sorted = [...normalized].sort((a, b) => b - a);
  let worstCaseSpend = 0;

  for (let wins = 1; wins < needed; wins += 1) {
    worstCaseSpend += sorted[wins - 1] ?? 0;
    const reserveNeeded = needed - wins;
    if (worstCaseSpend > bankroll - reserveNeeded) {
      return {
        legal: false,
        committed,
        message: reserveNeeded === 1
          ? `Keep at least $1 available if only your highest bid wins, unless today’s wins would complete your ${noun}.`
          : `Keep at least $${reserveNeeded} available after your strongest possible partial win, unless today’s wins would complete your ${noun}.`,
      };
    }
  }

  return { legal: true, committed, message: null };
}

export function evaluateFootballWeeklyAuctionBids(
  bankroll: number,
  ownedCount: number,
  bids: FootballWeeklyAuctionBidMap,
): FootballWeeklyAuctionBidSafety {
  return evaluateRequiredWins(bankroll, 3, ownedCount, [bids[1], bids[2], bids[3]], "3 teams");
}

export function evaluateFootballWeeklyBuildQbBids(
  bankroll: number,
  ownedCount: number,
  bids: FootballWeeklyBuildQbBidMap,
): FootballWeeklyAuctionBidSafety {
  return evaluateRequiredWins(
    bankroll,
    4,
    ownedCount,
    [bids[1], bids[2], bids[3], bids[4]],
    "four traits",
  );
}
