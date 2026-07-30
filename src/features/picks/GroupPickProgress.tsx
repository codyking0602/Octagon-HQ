import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import type { PickEvent } from "./picksModel";
import type { PickEventMemberProgress } from "./groupProgressModel";

interface GroupPickProgressProps {
  event: PickEvent;
  locked: boolean;
  mySelections: Readonly<Record<string, string>>;
}

interface ProgressRow {
  profile_id: string;
  display_name: string;
  completed: number;
  total: number;
  has_underdog_lock: boolean;
  is_current_user: boolean;
}

function memberStatus(member: PickEventMemberProgress) {
  if (member.completed === member.total && member.total > 0) return "COMPLETE";
  if (member.completed > 0) return "IN PROGRESS";
  return "NOT STARTED";
}

function mapProgress(rows: ProgressRow[]): PickEventMemberProgress[] {
  return rows.map((row) => ({
    profileId: row.profile_id,
    displayName: row.display_name,
    completed: row.completed,
    total: row.total,
    hasUnderdogLock: row.has_underdog_lock,
    isCurrentUser: row.is_current_user,
  }));
}

export function GroupPickProgress({ event, locked, mySelections }: GroupPickProgressProps) {
  const [members, setMembers] = useState<PickEventMemberProgress[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const selected = members.find((member) => member.displayName === selectedName) ?? null;
  const completedMembers = members.filter((member) => member.completed === member.total && member.total > 0).length;

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return undefined;
    let active = true;

    const load = async () => {
      const { data, error } = await supabase.rpc("get_event_pick_progress", { p_event_id: event.eventId });
      if (!active || error) return;
      setMembers(mapProgress((data ?? []) as ProgressRow[]));
    };

    void load();
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [event.eventId]);

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

  if (!members.length) return null;

  return (
    <>
      <details className="surface-card picks-group-progress">
        <summary>
          <span>GROUP PICKS</span>
          <strong>{completedMembers}/{members.length} COMPLETE</strong>
        </summary>
        <div className="picks-group-progress__members">
          {members.map((member) => (
            <button
              type="button"
              className={member.isCurrentUser ? "is-current-user" : ""}
              key={member.profileId}
              onClick={() => setSelectedName(member.displayName)}
            >
              <span>
                <strong>{member.displayName}{member.isCurrentUser ? " · YOU" : ""}</strong>
                <small>{memberStatus(member)}{member.hasUnderdogLock ? " · LOCK SET" : ""}</small>
              </span>
              <b>{member.completed}/{member.total}</b>
            </button>
          ))}
        </div>
      </details>

      {selected ? (
        <div className="picks-member-progress-dialog" role="dialog" aria-modal="true" aria-label={`${selected.displayName} Picks progress`}>
          <button className="picks-member-progress-dialog__backdrop" type="button" aria-label="Close" onClick={() => setSelectedName(null)} />
          <section className="surface-card picks-member-progress-dialog__sheet">
            <header>
              <div><span>MEMBER PICKS</span><h2>{selected.displayName}</h2></div>
              <button type="button" aria-label="Close" onClick={() => setSelectedName(null)}>×</button>
            </header>
            <div className="picks-member-progress-dialog__summary">
              <strong>{selected.completed}/{selected.total} PICKS</strong>
              <span>{memberStatus(selected)} · {selected.hasUnderdogLock ? "UNDERDOG LOCK SET" : "NO UNDERDOG LOCK"}</span>
            </div>
            {!locked ? (
              <p className="picks-member-progress-dialog__note">Individual picks stay hidden until the event locks.</p>
            ) : (
              <div className="picks-member-progress-dialog__picks">
                {selectedPicks.map((pick) => (
                  <div key={pick.boutId}>
                    <span>{pick.fight}</span>
                    <strong>{selected.displayName}: {pick.memberPick}</strong>
                    <small>{pick.same ? "SAME AS YOU" : `YOU: ${pick.myPick}`}</small>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
