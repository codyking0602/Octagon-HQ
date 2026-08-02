import { useMemo, useState } from "react";
import type { PickEvent } from "./picksModel";
import { usePicks } from "./PicksProvider";

interface GroupPickProgressProps {
  event: PickEvent;
  locked: boolean;
  mySelections: Readonly<Record<string, string>>;
}

export function GroupPickProgress({ event, locked: _locked, mySelections }: GroupPickProgressProps) {
  const picks = usePicks();
  const members = picks.groupProgress;
  const loading = picks.groupProgressLoading;
  const error = picks.groupProgressError;
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const selected = members.find((member) => member.displayName === selectedName) ?? null;
  const completedMembers = members.filter((member) => member.completed === member.total && member.total > 0).length;
  const masterLocked = event.status !== "upcoming";
  const eligibleBouts = useMemo(() => event.bouts
    .filter((bout) => bout.includedInPicks !== false && (bout.resultStatus ?? "pending") !== "cancelled")
    .slice()
    .sort((left, right) => left.position - right.position), [event.bouts]);
  const selectedPicks = useMemo(() => {
    if (!selected) return [];

    return eligibleBouts
      .map((bout, index) => ({ bout, index }))
      .filter(({ bout }) => masterLocked || bout.isLocked === true)
      .map(({ bout, index }) => {
        const memberSelection = bout.groupPicks?.find((pick) => pick.displayName === selected.displayName) ?? null;
        const memberPick = memberSelection?.pickedFighterSlug ?? null;
        const myPick = mySelections[bout.boutId] ?? null;
        const fighterName = (slug: string | null) => {
          if (slug === bout.redFighterSlug) return bout.redFighterName;
          if (slug === bout.blueFighterSlug) return bout.blueFighterName;
          return "No pick";
        };

        return {
          boutId: bout.boutId,
          fightNumber: index + 1,
          fight: `${bout.redFighterName} vs ${bout.blueFighterName}`,
          memberPick: fighterName(memberPick),
          myPick: fighterName(myPick),
          same: memberPick === myPick,
          isUnderdogLock: selected.underdogLockBoutId === bout.boutId
            && selected.underdogLockFighterSlug === memberPick,
        };
      });
  }, [eligibleBouts, masterLocked, mySelections, selected]);
  const hiddenFightCount = selected ? Math.max(eligibleBouts.length - selectedPicks.length, 0) : 0;

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
          const isComplete = member.completed === member.total && member.total > 0;
          const memberStateClass = [member.isCurrentUser ? "is-current-user" : "", isComplete ? "is-complete" : ""]
            .filter(Boolean)
            .join(" ");
          return (
            <div className="picks-group-progress__member" key={member.profileId}>
              <button
                type="button"
                className={memberStateClass}
                aria-expanded={isSelected}
                onClick={() => setSelectedName(isSelected ? null : member.displayName)}
              >
                <span className="picks-group-progress__member-status" aria-hidden="true">
                  {isComplete ? "✓" : member.displayName.trim().charAt(0).toUpperCase()}
                </span>
                <strong>{member.displayName}{member.isCurrentUser ? " · YOU" : ""}</strong>
                <b>{member.completed}/{member.total}</b>
              </button>
              {isSelected ? (
                <section className="picks-group-progress__comparison" aria-label={`${member.displayName} pick comparison`}>
                  <header className="picks-group-progress__comparison-header">
                    <div>
                      <span>{member.displayName}'S PICKS</span>
                      <strong>{member.completed}/{member.total} COMPLETE</strong>
                    </div>
                    {!masterLocked && member.hasUnderdogLock ? <b>UNDERDOG LOCK SET</b> : null}
                  </header>
                  {!selectedPicks.length ? (
                    <div className="picks-group-progress__privacy">
                      <strong>PICKS HIDDEN</strong>
                      <p>Individual picks reveal as each fight locks.</p>
                    </div>
                  ) : (
                    <>
                      <div className="picks-group-progress__comparison-list">
                        {selectedPicks.map((pick) => (
                          <article
                            className={`picks-group-progress__fight ${pick.same ? "is-same" : "is-different"}`}
                            key={pick.boutId}
                          >
                            <div className="picks-group-progress__matchup">
                              <b>{pick.fightNumber}</b>
                              <span>{pick.fight}</span>
                            </div>
                            <div className="picks-group-progress__choices">
                              <div>
                                <small>{member.displayName}</small>
                                <strong>{pick.memberPick}</strong>
                                {pick.isUnderdogLock ? (
                                  <b className="picks-group-progress__lock-marker">★ UNDERDOG LOCK</b>
                                ) : null}
                              </div>
                              <em>{pick.same ? "SAME" : "DIFF"}</em>
                              <div className="is-you">
                                <small>YOU</small>
                                <strong>{pick.myPick}</strong>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                      {hiddenFightCount ? (
                        <div className="picks-group-progress__privacy">
                          <strong>{hiddenFightCount} {hiddenFightCount === 1 ? "FIGHT" : "FIGHTS"} STILL OPEN</strong>
                          <p>Those picks reveal when each fight locks.</p>
                        </div>
                      ) : null}
                    </>
                  )}
                </section>
              ) : null}
            </div>
          );
        })}
      </div>
    </details>
  );
}