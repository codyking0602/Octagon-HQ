import { gradeFootballAts } from "./footballPicksScoring";
import type { PickEventMemberProgress } from "./groupProgressModel";
import type { PickBout } from "./picksModel";

export interface FootballLiveStanding {
  rank: number; tied: boolean; wins: number; losses: number; pushes: number;
  points: number; lockWins: number; lockLosses: number; lockPushes: number; settled: number;
}

/** Canonical live ATS scoring, including locks, shared by the row table and scorecard. */
export function footballLiveStandingsForMembers(members: PickEventMemberProgress[], eligibleBouts: PickBout[]): Map<string, FootballLiveStanding> {
    const rows = members.map((member) => {
      let wins = 0;
      let losses = 0;
      let pushes = 0;
      let points = 0;
      let lockWins = 0;
      let lockLosses = 0;
      let lockPushes = 0;

      for (const bout of eligibleBouts) {
        if ((bout.resultStatus ?? "pending") === "pending" || bout.frozenSpreadHome == null) continue;
        const memberSelection = bout.groupPicks?.find((pick) => pick.displayName === member.displayName) ?? null;
        const selectedSlug = memberSelection?.pickedFighterSlug ?? null;
        const pickedTeam = selectedSlug === bout.redFighterSlug
          ? "home"
          : selectedSlug === bout.blueFighterSlug ? "away" : null;
        if (!pickedTeam) continue;

        const grade = gradeFootballAts({
          pickedTeam,
          homeScore: bout.homeFinalScore ?? null,
          awayScore: bout.awayFinalScore ?? null,
          frozenSpreadHome: bout.frozenSpreadHome,
          isFinal: bout.resultStatus !== "pending" && bout.resultStatus !== "cancelled",
          isCancelled: bout.resultStatus === "cancelled",
          isLock: memberSelection?.isLock === true,
        });
        if (grade.outcome === "unresolved") continue;

        points += grade.points;
        if (grade.outcome === "win") wins += 1;
        if (grade.outcome === "loss") losses += 1;
        if (grade.outcome === "push") pushes += 1;
        if (memberSelection?.isLock === true) {
          if (grade.outcome === "win") lockWins += 1;
          if (grade.outcome === "loss") lockLosses += 1;
          if (grade.outcome === "push") lockPushes += 1;
        }
      }

      return {
        profileId: member.profileId,
        points,
        wins,
        losses,
        pushes,
        lockWins,
        lockLosses,
        lockPushes,
        settled: wins + losses + pushes,
      };
    });

    const ordered = rows.slice().sort((left, right) => (
      right.points - left.points
      || right.wins - left.wins
      || left.losses - right.losses
      || left.profileId.localeCompare(right.profileId)
    ));
    const rankByProfile = new Map<string, number>();
    let previousPoints: number | null = null;
    let previousRank = 0;
    ordered.forEach((row, index) => {
      const rank = previousPoints === row.points ? previousRank : index + 1;
      previousPoints = row.points;
      previousRank = rank;
      rankByProfile.set(row.profileId, rank);
    });
    const rankCounts = new Map<number, number>();
    rankByProfile.forEach((rank) => rankCounts.set(rank, (rankCounts.get(rank) ?? 0) + 1));

    return new Map(rows.map((row) => {
      const rank = rankByProfile.get(row.profileId) ?? 0;
      return [row.profileId, {
        ...row,
        rank,
        tied: (rankCounts.get(rank) ?? 0) > 1,
      }];
    }));
}

export function footballStandingRankLabel(rank: number, tied: boolean) {
  const mod100 = rank % 100;
  const suffix = mod100 >= 11 && mod100 <= 13
    ? "TH" : rank % 10 === 1 ? "ST" : rank % 10 === 2 ? "ND" : rank % 10 === 3 ? "RD" : "TH";
  return `${tied ? "T-" : ""}${rank}${suffix}`;
}
