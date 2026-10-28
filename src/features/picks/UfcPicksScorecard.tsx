import { useMemo } from "react";
import { underdogBonusForOdds, type PickEvent } from "./picksModel";
import { usePicks } from "./PicksProvider";
import { GroupPickProgress } from "./GroupPickProgress";
import { ufcLiveBaseStandingsForMembers } from "./ufcLiveBaseStandings";

interface Props {
  event: PickEvent;
  locked: boolean;
  completed: number;
  total: number;
  underdogLockName: string;
  mySelections: Readonly<Record<string,string>>;
}

/** Football's compact three-metric disclosure, with UFC-specific pre/post-fight states. */
export function UfcPicksScorecard({event,locked,completed,total,underdogLockName,mySelections}:Props) {
  const {groupProgress,underdogLock} = usePicks();
  const entered = useMemo(() => (groupProgress??[]).filter(member=>member.completed>0),[groupProgress]);
  const standings = useMemo(() => ufcLiveBaseStandingsForMembers(entered,event.bouts),[entered,event.bouts]);
  const me=entered.find(member=>member.isCurrentUser);
  const live=me ? standings.get(me.profileId) : null;
  const hasResults=event.bouts.some(bout=>bout.resultStatus==="red_win"||bout.resultStatus==="blue_win");
  const lockBout=event.bouts.find(bout=>bout.boutId===underdogLock?.boutId);
  const lockOdds=underdogLock?.frozenAmericanOdds
    ?? (lockBout && underdogLock?.fighterSlug===lockBout.redFighterSlug ? lockBout.redAmericanOdds
      : lockBout && underdogLock?.fighterSlug===lockBout.blueFighterSlug ? lockBout.blueAmericanOdds : null);
  const lockBonus=underdogBonusForOdds(lockOdds??null);
  const liveRank=live&&live.settled>0 ? `${live.tied?"T-":""}${live.rank}` : "—";
  const winnerText=hasResults ? `${live?.wins??0}-${live?.losses??0}` : `${completed}/${total}`;
  const memberLabel=hasResults ? "CORRECT-WRONG" : "PICKS MADE";
  return (
    <details className="surface-card ufc-picks-scorecard">
      <summary className="ufc-picks-scorecard__summary">
        <div className="ufc-picks-scorecard__heading">
          <strong>PICKS &amp; STANDINGS</strong>
          <small>{total} FIGHTS</small>
        </div>
        <div className="ufc-picks-scorecard__metrics">
          <div><b>{winnerText}</b><small>{memberLabel}</small></div>
          <div><b>{hasResults ? `${live?.points??0}` : underdogLockName==="NONE SELECTED"?"—":"★"}</b><small>{hasResults ? "BASE PTS*" : "UNDERDOG LOCK"}</small></div>
          <div><b>{hasResults ? liveRank : `${entered.length}`}</b><small>{hasResults ? "BASE RANK*" : "GROUP ENTERED"}</small></div>
        </div>
        <div className="ufc-picks-scorecard__foot">
          <small>{hasResults ? "LIVE · LOCK BONUSES PENDING" : locked ? "PICKS LOCKED" : `${completed} OF ${total} SAVED`}</small>
          <span>VIEW STANDINGS</span>
        </div>
      </summary>
      <div className="ufc-picks-scorecard__body">
        {hasResults ? <p className="ufc-picks-scorecard__disclaimer">* Provisional rankings exclude underdog lock bonuses. Official points and placements appear in the Results Archive once settled.</p> : null}
        {underdogLockName !== "NONE SELECTED" && !hasResults ?
          <p className="ufc-picks-scorecard__lock">UNDERDOG LOCK · {underdogLockName}{lockBonus>0 ? ` · +${lockBonus} IF CORRECT` : ""}</p> : null}
        <GroupPickProgress event={event} locked={locked} mySelections={mySelections} embedded />
      </div>
    </details>
  );
}
