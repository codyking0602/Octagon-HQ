import type { ReactNode } from "react";
import type { PickEvent, UnderdogLock } from "./picksModel";
import type { PickEventMemberProgress } from "./groupProgressModel";
import { GroupPickProgress } from "./GroupPickProgress";

type Props = {
  event: PickEvent;
  members: PickEventMemberProgress[];
  mySelections: Readonly<Record<string,string>>;
  completed: number;
  total: number;
  underdogLock: UnderdogLock | null;
  lockName: string;
  children?: ReactNode;
};

/** Football-style disclosure. Only submitted entries count; fight bonuses remain server-owned. */
export function UfcPicksScorecard({event,members,mySelections,completed,total,underdogLock,lockName}:Props) {
  const entered=members.filter(member=>member.completed>0);
  const finals=event.bouts.filter(bout=>
    bout.includedInPicks!==false && (bout.resultStatus==="red_win"||bout.resultStatus==="blue_win"));
  const wins=finals.filter(b=>mySelections[b.boutId]===b.winnerFighterSlug).length;
  const losses=finals.filter(b=>Boolean(mySelections[b.boutId])&&mySelections[b.boutId]!==b.winnerFighterSlug).length;
  // Provisional BASE result, not an official underdog-lock-adjusted event rank.
  const baseRows=entered.map(member=>({
    id:member.profileId, current:member.isCurrentUser,
    points:finals.filter(b=>b.groupPicks?.some(p=>p.displayName===member.displayName&&p.pickedFighterSlug===b.winnerFighterSlug)).length*4,
  }));
  const myBase=baseRows.find(row=>row.current)?.points??wins*4;
  const myBaseRank=1+baseRows.filter(row=>row.points>myBase).length;
  const myTied=baseRows.filter(row=>row.points===myBase).length>1;
  const rankLabel=baseRows.some(row=>row.current) ? `${myTied?"T-":""}${myBaseRank}` : "—";
  return (
    <details className="surface-card ufc-picks-hub">
      <summary className="ufc-picks-hub__summary">
        <div className="ufc-picks-hub__heading"><span>PICKS &amp; STANDINGS</span><small>{finals.length} FINAL · {total-finals.length} REMAINING</small></div>
        <div className="ufc-picks-hub__scorecard">
          {finals.length ? <>
            <div><strong>{wins}-{losses}</strong><small>CORRECT / MISSED</small></div>
            <div><strong>{myBase} <small>PTS</small></strong><small>BASE POINTS</small></div>
            <div><strong>{rankLabel}</strong><small>BASE RANK</small></div>
          </> : <>
            <div><strong>{completed}/{total}</strong><small>PICKS MADE</small></div>
            <div><strong>{underdogLock?"SET":"—"}</strong><small>UNDERDOG LOCK</small></div>
            <div><strong>{entered.length}</strong><small>GROUP ENTERED</small></div>
          </>}
        </div>
        <div className="ufc-picks-hub__foot">
          <small>{finals.length ? "PROVISIONAL · LOCK BONUSES SETTLE OFFICIALLY" : underdogLock ? `LOCK · ${lockName}` : "PICKS OPEN"}</small>
          <span>VIEW STANDINGS</span>
        </div>
      </summary>
      <div className="ufc-picks-hub__body">
        <GroupPickProgress event={event} locked={event.status!=="upcoming"} mySelections={mySelections} embedded />
      </div>
    </details>
  );
}
