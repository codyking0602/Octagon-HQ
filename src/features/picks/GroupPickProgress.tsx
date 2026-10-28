import { useMemo, useState } from "react";
import { footballLiveStandingsForMembers } from "./footballGroupLiveStandings";
import { ufcLiveBaseStandingsForMembers } from "./ufcLiveBaseStandings";
import type { PickEvent } from "./picksModel";
import { usePicks } from "./PicksProvider";

interface GroupPickProgressProps {
  event: PickEvent;
  locked: boolean;
  mySelections: Readonly<Record<string, string>>;
  embedded?: boolean;
}

function ordinalPlace(rank: number, tied = false) {
  const mod100 = rank % 100;
  const suffix = mod100 >= 11 && mod100 <= 13
    ? "TH"
    : rank % 10 === 1 ? "ST"
      : rank % 10 === 2 ? "ND"
        : rank % 10 === 3 ? "RD"
          : "TH";
  return `${tied ? "T-" : ""}${rank}${suffix}`;
}

function liveRecord(wins: number, losses: number, pushes: number) {
  return `${wins}-${losses}${pushes ? `-${pushes}` : ""}`;
}

export function GroupPickProgress({ event, locked: _locked, mySelections, embedded = false }: GroupPickProgressProps) {
  const picks = usePicks();
  const members = picks.groupProgress;
  const loading = picks.groupProgressLoading;
  const error = picks.groupProgressError;
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const masterLocked = event.status !== "upcoming";
  const isFootball = event.sport === "football";
  const unit = isFootball ? "game" : "fight";
  const visibleMembers = useMemo(
    () => members.filter((member) => member.completed > 0),
    [members],
  );
  const selected = visibleMembers.find((member) => member.displayName === selectedName) ?? null;
  const completedMembers = visibleMembers.filter((member) => member.completed === member.total && member.total > 0).length;
  const eligibleBouts = useMemo(() => event.bouts
    .filter((bout) => bout.includedInPicks !== false && (bout.resultStatus ?? "pending") !== "cancelled")
    .slice()
    .sort((left, right) => left.position - right.position), [event.bouts]);

  const footballLiveStandings = useMemo(
    () => isFootball ? footballLiveStandingsForMembers(visibleMembers, eligibleBouts) : new Map(),
    [eligibleBouts, isFootball, visibleMembers],
  );

  const ufcLiveStandings = useMemo(
    () => !isFootball ? ufcLiveBaseStandingsForMembers(visibleMembers, eligibleBouts) : new Map(),
    [eligibleBouts, isFootball, visibleMembers],
  );

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
          isUnderdogLock: !isFootball
            && selected.underdogLockBoutId === bout.boutId
            && selected.underdogLockFighterSlug === memberPick,
          isFootballLock: isFootball && memberSelection?.isLock === true,
        };
      });
  }, [eligibleBouts, isFootball, masterLocked, mySelections, selected]);
  const hiddenFightCount = selected ? Math.max(eligibleBouts.length - selectedPicks.length, 0) : 0;
  const currentFootballLive = visibleMembers
    .filter((member) => member.isCurrentUser)
    .map((member) => footballLiveStandings.get(member.profileId) ?? null)
    .find(Boolean) ?? null;

  if (loading || error || !visibleMembers.length) {
    const status = loading ? "LOADING" : error ? "UNAVAILABLE" : "NO PICKS YET";
    return (
      <div className="surface-card picks-group-progress picks-group-progress--static" aria-live="polite">
        <span>GROUP PICKS</span>
        <strong>{status}</strong>
      </div>
    );
  }

  const groupSummary = isFootball
    ? currentFootballLive && currentFootballLive.settled > 0
      ? `${ordinalPlace(currentFootballLive.rank, currentFootballLive.tied)} · ${liveRecord(currentFootballLive.wins, currentFootballLive.losses, currentFootballLive.pushes)}`
      : `${visibleMembers.length} ENTERED`
    : `${completedMembers}/${visibleMembers.length} COMPLETE`;

  return (
    <details className="surface-card picks-group-progress" open={embedded ? true : undefined}>
      <summary>
        <span>GROUP PICKS</span>
        <strong>{groupSummary}</strong>
      </summary>
      <div className="picks-group-progress__members">
        {visibleMembers.map((member) => {
          const isSelected = member.displayName === selectedName;
          const isComplete = member.completed === member.total && member.total > 0;
          const memberStateClass = [member.isCurrentUser ? "is-current-user" : "", isComplete ? "is-complete" : ""]
            .filter(Boolean)
            .join(" ");
          const live = isFootball ? footballLiveStandings.get(member.profileId) ?? null : null;
          const lockSettled = live ? live.lockWins + live.lockLosses + live.lockPushes : 0;
          const ufcLive = !isFootball ? ufcLiveStandings.get(member.profileId) ?? null : null;
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
                {isFootball && live && live.settled > 0 ? (
                  <span className="football-group-live">
                    <b>{liveRecord(live.wins, live.losses, live.pushes)} · {ordinalPlace(live.rank, live.tied)}</b>
                    <small>{live.points} PTS · LOCKS {lockSettled ? liveRecord(live.lockWins, live.lockLosses, live.lockPushes) : "—"}</small>
                  </span>
                ) : !isFootball && ufcLive && ufcLive.settled > 0 ? (
                  <span className="football-group-live">
                    <b>{ufcLive.wins}-{ufcLive.losses} · {ordinalPlace(ufcLive.rank,ufcLive.tied)}*</b>
                    <small>{ufcLive.points} BASE PTS · {member.completed}/{member.total} PICKS</small>
                  </span>
                ) : (
                  <b>{member.completed}/{member.total}</b>
                )}
              </button>
              {isSelected ? (
                <section className="picks-group-progress__comparison" aria-label={`${member.displayName} pick comparison`}>
                  <header className="picks-group-progress__comparison-header">
                    <div>
                      <span>{member.displayName}'S PICKS</span>
                      <strong>
                        {isFootball && live && live.settled > 0
                          ? `${liveRecord(live.wins, live.losses, live.pushes)} · ${ordinalPlace(live.rank, live.tied)} · ${live.points} PTS · LOCKS ${lockSettled ? liveRecord(live.lockWins, live.lockLosses, live.lockPushes) : "—"}`
                          : !isFootball && ufcLive && ufcLive.settled > 0
                            ? `${ufcLive.wins}-${ufcLive.losses} · ${ufcLive.points} BASE PTS · PROVISIONAL (NO LOCK BONUS)`
                            : `${member.completed}/${member.total} COMPLETE`}
                      </strong>
                    </div>
                    {!isFootball && !masterLocked && member.hasUnderdogLock ? <b>UNDERDOG LOCK SET</b> : null}
                  </header>
                  {!selectedPicks.length ? (
                    <div className="picks-group-progress__privacy">
                      <strong>PICKS HIDDEN</strong>
                      <p>Individual picks reveal as each {unit} locks.</p>
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
                                {pick.isUnderdogLock || pick.isFootballLock ? (
                                  <b className="picks-group-progress__lock-marker">
                                    {pick.isFootballLock ? "★ LOCK" : "★ UNDERDOG LOCK"}
                                  </b>
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
                          <strong>{hiddenFightCount} {unit.toUpperCase()}{hiddenFightCount === 1 ? "" : "S"} STILL OPEN</strong>
                          <p>Those picks reveal when each {unit} locks.</p>
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
