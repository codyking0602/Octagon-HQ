import type { PickBout } from "./picksModel";
import type { PickEventMemberProgress } from "./groupProgressModel";

export interface UfcLiveBaseStanding {
  wins: number; losses: number; points: number; settled: number; rank: number; tied: boolean;
}
/** Before the canonical event settlement, only confirmed correct picks are graded.
 * Underdog lock bonuses are explicitly excluded: per-member frozen lock odds are
 * not available to this read model, and presenting guessed totals would be wrong. */
export function ufcLiveBaseStandingsForMembers(
  members: PickEventMemberProgress[], bouts: PickBout[],
): Map<string, UfcLiveBaseStanding> {
  const graded = bouts.filter((bout) => bout.includedInPicks !== false
    && (bout.resultStatus === "red_win" || bout.resultStatus === "blue_win"));
  const rows = members.map((member) => {
    let wins = 0; let losses = 0;
    for (const bout of graded) {
      const pick = bout.groupPicks?.find((candidate) => candidate.displayName === member.displayName);
      if (!pick?.pickedFighterSlug) continue;
      if (pick.pickedFighterSlug === bout.winnerFighterSlug) wins++;
      else losses++;
    }
    return { profileId: member.profileId, wins, losses, points: wins * 4, settled: wins + losses };
  });
  const sorted = [...rows].sort((a,b) => b.points-a.points || b.wins-a.wins || a.profileId.localeCompare(b.profileId));
  return new Map(rows.map(row => {
    const rank = sorted.findIndex(other => other.points===row.points)+1;
    const tied = sorted.filter(other => other.points===row.points).length>1;
    return [row.profileId, {...row,rank,tied}];
  }));
}
