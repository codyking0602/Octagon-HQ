import { underdogBonusForOdds, type PickEvent, type UnderdogLock } from "./picksModel";
import type { PickEventMemberProgress } from "./groupProgressModel";

export interface UfcLiveStanding {
  correct: number;
  incorrect: number;
  estimatedPoints: number;
  rank: number;
  tied: boolean;
  lockWins: number;
  lockLosses: number;
  settled: number;
}

/**
 * Shared UFC event-only live estimates for the Picks summary and group rows.
 * Unlike the final server settlement, other members' frozen underdog odds are
 * not available to the client, so their lock bonuses remain estimates.
 */
export function ufcLiveStandingsForMembers(
  event: PickEvent,
  members: readonly PickEventMemberProgress[],
  selections: Readonly<Record<string, string>>,
  myLock: UnderdogLock | null,
) {
  const eligibleBouts = event.bouts.filter((bout) =>
    bout.includedInPicks !== false && bout.resultStatus !== "cancelled");
  // Do not leak outcomes while the owner's manual-open override allows picks.
  const visibleBouts = eligibleBouts.filter((bout) =>
    event.status !== "upcoming" || bout.isLocked !== false);
  const finalCount = visibleBouts.filter((bout) =>
    bout.resultStatus != null && bout.resultStatus !== "pending").length;
  const resolvedBouts = visibleBouts.filter((bout) =>
    (bout.resultStatus === "red_win" || bout.resultStatus === "blue_win")
    && Boolean(bout.winnerFighterSlug));
  const activeMembers = members.filter((member) => member.completed > 0);

  const rows = activeMembers.map((member) => {
    let correct = 0;
    let incorrect = 0;
    let lockBonus = 0;
    let lockWins = 0;
    let lockLosses = 0;

    for (const bout of resolvedBouts) {
      const selection = member.isCurrentUser
        ? selections[bout.boutId] ?? null
        : bout.groupPicks?.find((pick) => pick.displayName === member.displayName)?.pickedFighterSlug ?? null;
      if (!selection) continue;

      const isCorrect = selection === bout.winnerFighterSlug;
      if (isCorrect) correct += 1;
      else incorrect += 1;

      if (member.underdogLockBoutId === bout.boutId
        && member.underdogLockFighterSlug === selection) {
        if (isCorrect) {
          lockWins += 1;
          const currentOdds = selection === bout.redFighterSlug
            ? bout.redAmericanOdds : bout.blueAmericanOdds;
          const odds = member.isCurrentUser && myLock?.boutId === bout.boutId
            ? myLock.frozenAmericanOdds ?? currentOdds : currentOdds;
          lockBonus += underdogBonusForOdds(odds);
        } else {
          lockLosses += 1;
        }
      }
    }

    return {
      profileId: member.profileId,
      correct,
      incorrect,
      estimatedPoints: correct * 4 + lockBonus,
      lockWins,
      lockLosses,
      settled: correct + incorrect,
    };
  });

  const ordered = rows.slice().sort((left, right) =>
    right.estimatedPoints - left.estimatedPoints
    || right.correct - left.correct
    || left.profileId.localeCompare(right.profileId));
  const rankByProfile = new Map<string, number>();
  let previousPoints: number | null = null;
  let previousCorrect: number | null = null;
  let previousRank = 0;
  ordered.forEach((row, index) => {
    const rank = row.estimatedPoints === previousPoints && row.correct === previousCorrect
      ? previousRank : index + 1;
    previousPoints = row.estimatedPoints;
    previousCorrect = row.correct;
    previousRank = rank;
    rankByProfile.set(row.profileId, rank);
  });
  const rankCounts = new Map<number, number>();
  rankByProfile.forEach((rank) => rankCounts.set(rank, (rankCounts.get(rank) ?? 0) + 1));

  const standings = new Map(rows.map((row): [string, UfcLiveStanding] => {
    const rank = rankByProfile.get(row.profileId) ?? 0;
    return [row.profileId, {
      ...row,
      rank,
      tied: (rankCounts.get(rank) ?? 0) > 1,
    }];
  }));
  const current = activeMembers.find((member) => member.isCurrentUser) ?? null;
  return {
    standings,
    current: current ? standings.get(current.profileId) ?? null : null,
    active: activeMembers.length,
    resolved: resolvedBouts.length,
    finalCount,
    remainingCount: eligibleBouts.length - finalCount,
  };
}
