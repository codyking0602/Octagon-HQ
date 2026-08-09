import { useCallback, useEffect, useMemo, useState } from "react";
import { useIdentity } from "../identity/IdentityProvider";
import type { PickBoutResultStatus } from "../picks/picksModel";
import {
  pickControlResultLabel,
  pickControlResultOptions,
  type PickControlBout,
  type PickControlEvent,
} from "./pickControlModel";
import type { PickControlRepository } from "./pickControlRepository";
import {
  effectivePickControlBoutLock,
  PICK_LOCK_MINUTE_MS,
  pickControlBoutCanExtend,
  pickControlBoutCanRecordResult,
  pickControlBoutCanSetDeadline,
  pickControlBoutIsFinal,
  pickControlLockWarning,
} from "./progressiveLockTiming";

function eventTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function compactLockTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function localDateTimeValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function pickSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : "Open Picks could not complete that request.";
  if (message.toLowerCase().includes("pick control owner required")) {
    return "This dashboard is available only to the designated Fight Night owner.";
  }
  return message;
}

function sameOrder(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function compactBoutStatus(event: PickControlEvent, bout: PickControlBout, now: number) {
  if (bout.resultStatus === "cancelled") return "CANCELLED";
  if (pickControlBoutIsFinal(event, bout, now)) return "LOCKED";
  if (pickControlLockWarning(event, bout, now)) return "LOCKING SOON";
  return "OPEN";
}

function boutLockClosedReason(event: PickControlEvent, bout: PickControlBout, now: number) {
  if (event.status !== "upcoming") return "The event-wide master lock is active, so this deadline is final.";
  if (bout.resultStatus !== "pending") return "This fight already has an official result, so its deadline is final.";
  if (!bout.includedInPicks) return "This fight is removed from Picks and its deadline cannot be edited.";
  if (pickControlBoutCanRecordResult(event, bout, now)) {
    return "Picks are locked for members. As owner, you can enter the result now or explicitly reopen this fight with a new future deadline.";
  }
  if (!bout.canAdjustLock) return "This fight’s lock time can no longer be edited.";
  return "Adjust this fight while it remains open. Existing picks stay attached to the fight.";
}

function resultButtonClass(active: boolean) {
  return active ? "pick-control-result is-active" : "pick-control-result";
}

interface OpenPicksDashboardProps {
  repository: PickControlRepository | null;
  now?: number;
}

export default function OpenPicksDashboard({ repository, now = Date.now() }: OpenPicksDashboardProps) {
  const identity = useIdentity();
  const [event, setEvent] = useState<PickControlEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draftOrder, setDraftOrder] = useState<string[] | null>(null);
  const [expandedBoutId, setExpandedBoutId] = useState<string | null>(null);

  const loadEvent = useCallback(async (eventId?: string) => {
    if (!repository || !identity.profile) return;
    setLoading(true);
    try {
      const nextEvent = await repository.loadControlEvent(eventId);
      setEvent(nextEvent);
      setDraftOrder(null);
      setExpandedBoutId((current) => (
        current && nextEvent?.bouts.some((bout) => bout.boutId === current && bout.includedInPicks)
          ? current
          : null
      ));
      setError("");
    } catch (nextError) {
      setEvent(null);
      setError(readableError(nextError));
    } finally {
      setLoading(false);
    }
  }, [identity.profile, repository]);

  useEffect(() => {
    if (!identity.ready) return;
    if (!identity.profile) {
      setEvent(null);
      setLoading(false);
      setError("");
      setNotice("");
      return;
    }
    if (!repository) {
      setLoading(false);
      setError("Open Picks is not connected on this build.");
      return;
    }
    void loadEvent();
  }, [identity.profile, identity.ready, loadEvent, repository]);

  const orderedBouts = useMemo(
    () => event?.bouts.slice().sort((left, right) => left.position - right.position) ?? [],
    [event],
  );
  const canonicalOrder = useMemo(() => orderedBouts.map((bout) => bout.boutId), [orderedBouts]);
  const visibleBouts = useMemo(() => {
    const byId = new Map(orderedBouts.map((bout) => [bout.boutId, bout]));
    const ids = draftOrder ?? canonicalOrder;
    return ids
      .map((id) => byId.get(id))
      .filter((bout): bout is PickControlBout => Boolean(bout?.includedInPicks));
  }, [canonicalOrder, draftOrder, orderedBouts]);
  const orderChanged = draftOrder !== null && !sameOrder(draftOrder, canonicalOrder);

  async function runAction(key: string, action: () => Promise<void>, successMessage?: string) {
    if (busyAction) return;
    setBusyAction(key);
    setError("");
    setNotice("");
    try {
      await action();
      await loadEvent(event?.eventId);
      if (successMessage) setNotice(successMessage);
    } catch (nextError) {
      const message = readableError(nextError);
      if ((key === "reorder" || key === "add") && message.toLowerCase().includes("refresh")) {
        setDraftOrder(null);
      }
      setError(message);
    } finally {
      setBusyAction("");
    }
  }

  function adjustLockTime() {
    if (!event || event.status !== "upcoming" || now >= Date.parse(event.startsAt)) return;
    const input = window.prompt(
      "Enter the new event-wide Picks deadline in your local time (YYYY-MM-DDTHH:MM).",
      localDateTimeValue(event.locksAt),
    )?.trim();
    if (!input) return;
    const proposed = new Date(input);
    if (!Number.isFinite(proposed.getTime()) || proposed.getTime() <= now) {
      setError("Enter a valid future Picks deadline.");
      return;
    }
    if (proposed.getTime() > Date.parse(event.startsAt)) {
      setError("The Picks deadline cannot be later than the main-card start.");
      return;
    }
    if (!window.confirm(
      `Are you sure you want to change the master deadline from ${eventTime(event.locksAt)} to ${eventTime(proposed.toISOString())}? Open fights synchronized to the master deadline move with it; already-final fight deadlines stay final.`,
    )) return;
    void runAction("lock-time", () => repository!.adjustLockTime(
      event.eventId,
      proposed.toISOString(),
      event.locksAt,
      "Owner confirmed master Picks deadline change",
    ));
  }

  function lockEvent() {
    if (!event?.canLock) return;
    if (!window.confirm("Are you sure you want to lock all remaining open picks and begin Fight Night result entry?")) return;
    void runAction("lock", () => repository!.lockEvent(event.eventId));
  }

  function extendBoutLockTime(bout: PickControlBout, minutes: 10 | 20) {
    if (!event || !repository?.adjustBoutLockTime || !pickControlBoutCanExtend(event, bout, now)) return;
    const proposed = new Date(
      Date.parse(effectivePickControlBoutLock(event, bout)) + minutes * PICK_LOCK_MINUTE_MS,
    ).toISOString();
    void runAction(
      `bout-lock:${bout.boutId}:${minutes}`,
      () => repository.adjustBoutLockTime!(event.eventId, bout.boutId, proposed),
      `${bout.redFighterName} vs. ${bout.blueFighterName} extended ${minutes} minutes.`,
    );
  }

  function setBoutLockTime(bout: PickControlBout) {
    if (!event || !repository?.adjustBoutLockTime || !pickControlBoutCanSetDeadline(event, bout)) return;
    const reopening = pickControlBoutCanRecordResult(event, bout, now);
    const input = window.prompt(
      `${reopening ? "Reopen" : "Set"} the lock time for ${bout.redFighterName} vs. ${bout.blueFighterName} in your local time (YYYY-MM-DDTHH:MM).`,
      localDateTimeValue(effectivePickControlBoutLock(event, bout)),
    )?.trim();
    if (!input) return;
    const proposed = new Date(input);
    if (!Number.isFinite(proposed.getTime()) || proposed.getTime() <= now) {
      setError("Enter a valid future fight lock time.");
      return;
    }
    const confirmation = reopening
      ? `This fight is already locked for members. Reopen ${bout.redFighterName} vs. ${bout.blueFighterName} until ${eventTime(proposed.toISOString())}? Existing picks stay preserved, members can edit this fight again until the new deadline, and group picks may already have been revealed.`
      : `Are you sure you want ${bout.redFighterName} vs. ${bout.blueFighterName} to lock at ${eventTime(proposed.toISOString())}?`;
    if (!window.confirm(confirmation)) return;
    void runAction(
      `bout-lock:${bout.boutId}:set`,
      () => repository.adjustBoutLockTime!(event.eventId, bout.boutId, proposed.toISOString()),
      reopening
        ? `${bout.redFighterName} vs. ${bout.blueFighterName} reopened with a new deadline.`
        : `${bout.redFighterName} vs. ${bout.blueFighterName} deadline updated.`,
    );
  }

  function recordResult(bout: PickControlBout, result: PickBoutResultStatus) {
    if (!event || !repository || !pickControlBoutCanRecordResult(event, bout, now)) return;
    const label = pickControlResultLabel({ ...bout, resultStatus: result });
    if (!window.confirm(
      `Record ${label} as the official result for ${bout.redFighterName} vs. ${bout.blueFighterName}? Later fights stay on their own lock times and the event remains live.`,
    )) return;
    void runAction(
      `result:${bout.boutId}`,
      () => repository.recordResult(event.eventId, bout.boutId, result),
      `${bout.redFighterName} vs. ${bout.blueFighterName} recorded as ${label}.`,
    );
  }

  function setCancellation(bout: PickControlBout, cancelled: boolean) {
    if (!event) return;
    const confirmed = window.confirm(
      cancelled
        ? `Are you sure you want to cancel ${bout.redFighterName} vs. ${bout.blueFighterName}? Existing picks stay stored and the fight is excluded from scoring.`
        : `Are you sure you want to restore ${bout.redFighterName} vs. ${bout.blueFighterName}? Existing picks remain preserved.`,
    );
    if (!confirmed) return;
    void runAction(`card:${bout.boutId}`, () => repository!.setCancellation(
      event.eventId,
      bout.boutId,
      cancelled,
      cancelled ? "Owner confirmed fight cancellation" : "Owner confirmed fight restoration",
    ));
  }

  function removeBout(bout: PickControlBout) {
    if (!event || !bout.canRemoveFromPicks) return;
    if (!window.confirm(
      `Are you sure you want to remove ${bout.redFighterName} vs. ${bout.blueFighterName} from Picks? It disappears from ordinary owner and player cards. Submitted picks remain privately preserved and excluded from scoring.`,
    )) return;
    void runAction(
      `include:${bout.boutId}`,
      () => repository!.setBoutInclusion(
        event.eventId,
        bout,
        false,
        "Owner confirmed fight removal from Picks",
      ),
      `${bout.redFighterName} vs. ${bout.blueFighterName} removed from Picks.`,
    );
  }

  function replaceFighter(bout: PickControlBout) {
    if (!event || !bout.canReplace) return;
    const cornerInput = window.prompt(
      `Which corner should be replaced in ${bout.redFighterName} vs. ${bout.blueFighterName}? Enter RED or BLUE.`,
    )?.trim().toLowerCase();
    if (cornerInput !== "red" && cornerInput !== "blue") return;
    const name = window.prompt("Enter the replacement fighter’s canonical display name:")?.trim();
    if (!name) return;
    const slug = pickSlug(name);
    if (!slug) {
      setError("Enter a valid replacement fighter name.");
      return;
    }
    if (!window.confirm(
      `Are you sure you want to replace the ${cornerInput.toUpperCase()} corner with ${name}? Existing picks on this fight will be invalidated and affected members must repick.`,
    )) return;
    void runAction(`replace:${bout.boutId}`, () => repository!.replaceFighter(
      event.eventId,
      bout,
      cornerInput,
      slug,
      name,
      "Owner confirmed fighter replacement",
    ));
  }

  function addFight() {
    if (!event || !event.canReorder || !repository?.addBout) return;
    const redFighterName = window.prompt("Enter the first fighter’s canonical display name:")?.trim();
    if (!redFighterName) return;
    const blueFighterName = window.prompt("Enter the second fighter’s canonical display name:")?.trim();
    if (!blueFighterName) return;
    const weightClass = window.prompt("Enter the weight class:")?.trim();
    if (!weightClass) return;
    const lockInput = window.prompt(
      "Enter this fight’s Picks deadline in your local time (YYYY-MM-DDTHH:MM).",
      localDateTimeValue(event.startsAt),
    )?.trim();
    if (!lockInput) return;
    const lock = new Date(lockInput);
    if (!Number.isFinite(lock.getTime()) || lock.getTime() <= now) {
      setError("Enter a valid future fight deadline.");
      return;
    }
    if (!window.confirm(
      `Add ${redFighterName} vs. ${blueFighterName} to the current main-card Picks slate? Existing picks stay preserved. Members will need to make a pick for the new fight. You can reorder it afterward if needed.`,
    )) return;
    void runAction(
      "add",
      () => repository.addBout!(event.eventId, canonicalOrder, {
        redFighterName,
        blueFighterName,
        weightClass,
        locksAt: lock.toISOString(),
        segmentSequence: canonicalOrder.length + 1,
      }, "Owner confirmed fight addition to Picks"),
      `${redFighterName} vs. ${blueFighterName} added to Picks.`,
    );
  }

  function moveBout(index: number, offset: -1 | 1) {
    if (!event?.canReorder || busyAction) return;
    const target = index + offset;
    if (target < 0 || target >= visibleBouts.length) return;
    const order = [...(draftOrder ?? canonicalOrder)];
    const sourceId = visibleBouts[index].boutId;
    const targetId = visibleBouts[target].boutId;
    const sourceIndex = order.indexOf(sourceId);
    const targetIndex = order.indexOf(targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    [order[sourceIndex], order[targetIndex]] = [order[targetIndex], order[sourceIndex]];
    setDraftOrder(sameOrder(order, canonicalOrder) ? null : order);
  }

  function approveOrder() {
    if (!event?.canReorder || !draftOrder || !orderChanged) return;
    const visibleName = (id: string) => {
      const bout = event.bouts.find((item) => item.boutId === id);
      return bout?.includedInPicks ? `${bout.redFighterName} vs. ${bout.blueFighterName}` : null;
    };
    const numbered = (ids: string[]) => ids
      .map(visibleName)
      .filter((value): value is string => Boolean(value))
      .map((value, index) => `${index + 1}. ${value}`)
      .join("\n");
    if (!window.confirm(
      `Approve this new live fight order?\n\nBEFORE\n${numbered(canonicalOrder)}\n\nAFTER\n${numbered(draftOrder)}\n\nThis changes display order only. Picks and Underdog Locks stay attached to their fights, and fight deadlines stay with their bouts.`,
    )) return;
    void runAction("reorder", () => repository!.reorderCard(
      event.eventId,
      canonicalOrder,
      draftOrder,
      "Owner confirmed live fight order change",
    ));
  }

  if (!identity.ready || loading) {
    return <div className="page open-picks-dashboard"><section className="surface-card picks-control-state"><strong>Loading Open Picks…</strong></section></div>;
  }
  if (!identity.profile || !event || event.status !== "upcoming") {
    return error ? <p className="picks-error" role="status">{error}</p> : null;
  }

  return (
    <div className="page open-picks-dashboard">
      <section className="surface-card open-picks-toolbar" aria-label="Open Picks primary controls">
        <div className="open-picks-toolbar__lock">
          <div><span>MASTER LOCK</span><strong>{compactLockTime(event.locksAt)}</strong></div>
          <span>{event.canLock ? "PICKS OPEN" : "LOCK PENDING"}</span>
        </div>
        <div className="open-picks-toolbar__actions">
          <button className="secondary-action" type="button" disabled={Boolean(busyAction) || now >= Date.parse(event.startsAt)} onClick={adjustLockTime}>
            {busyAction === "lock-time" ? "CHANGING…" : "CHANGE MASTER LOCK"}
          </button>
          <button className="primary-action" type="button" disabled={!event.canLock || Boolean(busyAction)} onClick={lockEvent}>
            {busyAction === "lock" ? "LOCKING…" : "LOCK ALL PICKS"}
          </button>
        </div>
      </section>

      <section className="open-picks-card" aria-label={`${event.name} compact fight controls`}>
        <div className={`surface-card open-picks-reorder${orderChanged ? " has-pending-order" : ""}`}>
          <div><span>FIGHT ORDER</span><strong>{orderChanged ? "NEW ORDER READY" : "MOVE LOCALLY · APPROVE ONCE"}</strong></div>
          {event.hasReorderHistory ? <small>PRIOR ORDER CHANGE AUDITED</small> : null}
          {event.canReorder && repository?.addBout ? (
            <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={addFight}>
              {busyAction === "add" ? "ADDING…" : "ADD FIGHT"}
            </button>
          ) : null}
          {event.canReorder && orderChanged ? (
            <button className="primary-action" type="button" disabled={Boolean(busyAction)} onClick={approveOrder}>
              {busyAction === "reorder" ? "APPROVING…" : "APPROVE NEW ORDER"}
            </button>
          ) : null}
        </div>

        <div className="open-picks-list">
          {visibleBouts.map((bout, index) => {
            const expanded = expandedBoutId === bout.boutId;
            const cancelled = bout.resultStatus === "cancelled";
            const lockFinal = pickControlBoutIsFinal(event, bout, now);
            const canExtend = Boolean(repository?.adjustBoutLockTime) && pickControlBoutCanExtend(event, bout, now);
            const canSetDeadline = Boolean(repository?.adjustBoutLockTime) && pickControlBoutCanSetDeadline(event, bout);
            const canRecordResult = pickControlBoutCanRecordResult(event, bout, now);
            const warning = pickControlLockWarning(event, bout, now);
            const saving = busyAction === `card:${bout.boutId}`
              || busyAction === `include:${bout.boutId}`
              || busyAction === `result:${bout.boutId}`;
            return (
              <article className={`surface-card open-pick-row${expanded ? " is-expanded" : ""}`} key={bout.boutId}>
                <button
                  className="open-pick-row__summary"
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`open-pick-details-${bout.boutId}`}
                  aria-label={`${expanded ? "COLLAPSE" : "EXPAND"} ${bout.redFighterName} vs. ${bout.blueFighterName}`}
                  onClick={() => setExpandedBoutId(expanded ? null : bout.boutId)}
                >
                  <span className="open-pick-row__position"><strong>{index === 0 ? "MAIN EVENT" : `FIGHT ${index + 1}`}</strong><small>{bout.weightClass}</small></span>
                  <span className="open-pick-row__matchup"><strong><b>{bout.redFighterName}</b><i>VS</i><b>{bout.blueFighterName}</b></strong><small>LOCK {compactLockTime(effectivePickControlBoutLock(event, bout))}</small></span>
                  <span className="open-pick-row__state"><em>{saving ? "SAVING…" : compactBoutStatus(event, bout, now)}</em><b aria-hidden="true">{expanded ? "−" : "+"}</b></span>
                </button>

                {expanded ? (
                  <div className="open-pick-row__details" id={`open-pick-details-${bout.boutId}`}>
                    <div className={`picks-control-deadline picks-control-deadline--${lockFinal ? "final" : "open"}`}>
                      <div>
                        <span>FIGHT LOCK · {canRecordResult ? "PASSED" : lockFinal ? "FINAL" : warning ? "LOCKING SOON" : "OPEN"}</span>
                        <strong>{eventTime(effectivePickControlBoutLock(event, bout))}</strong>
                        {warning ? <b className="picks-control-lock-warning" role="status">{warning}</b> : null}
                        <small>{boutLockClosedReason(event, bout, now)}</small>
                      </div>
                      {canExtend ? (
                        <div className="picks-control-lock-actions" aria-label={`Adjust ${bout.redFighterName} versus ${bout.blueFighterName} deadline`}>
                          <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={() => extendBoutLockTime(bout, 10)}>+10 MIN</button>
                          <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={() => extendBoutLockTime(bout, 20)}>+20 MIN</button>
                          <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={() => setBoutLockTime(bout)}>SET TIME</button>
                        </div>
                      ) : canSetDeadline ? (
                        <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={() => setBoutLockTime(bout)}>EDIT LOCK TIME</button>
                      ) : <span className="picks-control-lock-final">DEADLINE FINAL</span>}
                    </div>

                    {canRecordResult ? (
                      <div className="open-pick-row__result-entry" aria-label={`Record ${bout.redFighterName} versus ${bout.blueFighterName} result`}>
                        <div className="pick-control-winners">
                          <button
                            className={resultButtonClass(false)}
                            type="button"
                            disabled={Boolean(busyAction)}
                            aria-label={`RED WINNER ${bout.redFighterName}`}
                            onClick={() => recordResult(bout, "red_win")}
                          >
                            <span>RED WINNER</span>
                            <strong>{bout.redFighterName}</strong>
                          </button>
                          <span>VS</span>
                          <button
                            className={resultButtonClass(false)}
                            type="button"
                            disabled={Boolean(busyAction)}
                            aria-label={`BLUE WINNER ${bout.blueFighterName}`}
                            onClick={() => recordResult(bout, "blue_win")}
                          >
                            <span>BLUE WINNER</span>
                            <strong>{bout.blueFighterName}</strong>
                          </button>
                        </div>
                        <div className="pick-control-exclusions" aria-label="Other official result options">
                          {pickControlResultOptions.map((option) => (
                            <button
                              className={resultButtonClass(false)}
                              type="button"
                              key={option.value}
                              disabled={Boolean(busyAction)}
                              onClick={() => recordResult(bout, option.value)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {event.canReorder ? (
                      <div className="pick-control-move" aria-label={`Move ${bout.redFighterName} vs. ${bout.blueFighterName}`}>
                        <button type="button" disabled={index === 0 || Boolean(busyAction)} onClick={() => moveBout(index, -1)}>MOVE UP</button>
                        <button type="button" disabled={index === visibleBouts.length - 1 || Boolean(busyAction)} onClick={() => moveBout(index, 1)}>MOVE DOWN</button>
                      </div>
                    ) : null}

                    <p className="open-pick-row__explanation">
                      {cancelled
                        ? "Original picks remain preserved. The cancelled fight is excluded from scoring and cannot receive new picks."
                        : canRecordResult
                          ? "This fight is locked for members. Enter the official result now, or explicitly reopen it with a new future lock time."
                          : lockFinal
                            ? "Submitted picks are preserved and revealed through the existing fight-specific privacy owner."
                            : "Use these actions only when the live UFC card or deadline actually changes."}
                    </p>
                    {bout.hasReplacementHistory ? <p className="pick-control-replacement-history"><strong>REPLACEMENT HISTORY EXISTS</strong> · The matchup above is currently stored.</p> : null}
                    <div className="open-pick-row__actions" aria-label={`${bout.redFighterName} vs. ${bout.blueFighterName} uncommon actions`}>
                      {!cancelled ? (
                        <button className="secondary-action" type="button" disabled={Boolean(busyAction) || !bout.canReplace} onClick={() => replaceFighter(bout)}>REPLACE FIGHTER</button>
                      ) : null}
                      <button className={cancelled ? "secondary-action" : "pick-control-clear"} type="button" disabled={Boolean(busyAction) || (cancelled ? !bout.canRestore : !bout.canCancel)} onClick={() => setCancellation(bout, !cancelled)}>
                        {cancelled ? "RESTORE FIGHT" : "CANCEL FIGHT"}
                      </button>
                      {!cancelled ? (
                        <button className="pick-control-clear" type="button" disabled={Boolean(busyAction) || !bout.canRemoveFromPicks} onClick={() => removeBout(bout)}>REMOVE FROM PICKS</button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      {notice ? <p className="picks-control-feedback picks-control-feedback--success" role="status">{notice}</p> : null}
      {error ? <p className="picks-error" role="status">{error}</p> : null}
    </div>
  );
}
