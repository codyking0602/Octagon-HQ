import { useMemo, useState } from "react";
import type { PickEvent } from "./picksModel";
import { usePicks } from "./PicksProvider";

interface GroupPickProgressProps {
  event: PickEvent;
  locked: boolean;
  mySelections: Readonly<Record<string, string>>;
}

export function GroupPickProgress({ event, locked, mySelections }: GroupPickProgressProps) {
  const picks = usePicks();
  const members = picks.groupProgress;
  const loading = picks.groupProgressLoading;
  const error = picks.groupProgressError;
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const selected = members.find((member) => member.displayName === selectedName) ?? null;
  const completedMembers = members.filter((member) => member.completed === member.total && member.total > 0).length;
  const selectedPicks = useMemo(() => {
    if (!selected || !locked) return [];
    return event.bouts.map((bout) => {
      const memberPick = bout.groupPicks?.find((pick) => pick.displayName === selected.displayName)?.pickedFighterSlug ?? null;
      const myPick = mySelections[bout.boutId] ?? null;
      const fighterName = (slug: string | null) => {
        if (slug === bout.redFighterSlug) return bout.redFighterName;
        if (slug === bout.blueFighterSlug) return bout.blueFighterName;
        return "No pick";
      };
      return {
        boutId: bout.boutId,
        fight: `${bout.redFighterName} vs ${bout.blueFighterName}`,
        memberPick: fighterName(memberPick),
        myPick: fighterName(myPick),
        same: Boolean(memberPick && myPick && memberPick === myPick),
      };
    });
  }, [event.bouts, locked, mySelections, selected]);

  if (loading || error || !members.length) {
    const status = loading ? "LOADING" : error ? "UNAVAILABLE" : "NO PICKS YET";
    return (
      <div className="surface-card picks-group-progress picks-group-progress--static" aria-live="polite">
        <span>GROUP PICKS</span>
        <strong>{status}</strong>
      </div>
    );
  }

  return (
    <details className="surface-card picks-group-progress">
      <summary>
        <span>GROUP PICKS</span>
        <strong>{completedMembers}/{members.length} COMPLETE</strong>
      </summary>
      <div className="picks-group-progress__members">
        {members.map((member) => {
          const isSelected = member.displayName === selectedName;
          return (
            <div className="picks-group-progress__member" key={member.profileId}>
              <button
                type="button"
                className={member.isCurrentUser ? "is-current-user" : ""}
                aria-expanded={isSelected}
                onClick={() => setSelectedName(isSelected ? null : member.displayName)}
              >
                <strong>{member.displayName}{member.isCurrentUser ? " · YOU" : ""}</strong>
                <b>{member.completed}/{member.total}</b>
              </button>
              {isSelected ? (
                <div className="picks-group-progress__inline">
                  <div className="picks-group-progress__inline-meta">
                    <span>UNDERDOG LOCK</span>
                    <strong>{member.hasUnderdogLock ? "SET" : "—"}</strong>
                  </div>
                  {!locked ? (
                    <p>Individual picks stay hidden until the event locks.</p>
                  ) : (
                    <div className="picks-group-progress__inline-picks">
                      {selectedPicks.map((pick) => (
                        <div key={pick.boutId}>
                          <span>{pick.fight}</span>
                          <strong>{pick.memberPick}</strong>
                          <small>{pick.same ? "SAME AS YOU" : `YOU: ${pick.myPick}`}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </details>
  );
}
