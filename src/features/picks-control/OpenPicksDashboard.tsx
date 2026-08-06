import { useCallback, useEffect, useMemo, useState } from "react";
import { useIdentity } from "../identity/IdentityProvider";
import {
  pickControlResultLabel,
  type PickControlBout,
  type PickControlEvent,
} from "./pickControlModel";
import type { PickControlRepository } from "./pickControlRepository";
import {
  effectivePickControlBoutLock,
  PICK_LOCK_MINUTE_MS,
  pickControlBoutCanExtend,
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

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : "Manage Open Picks could not complete that request.";
  if (message.toLowerCase().includes("pick control owner required")) {
    return "This dashboard is available only to the designated Fight Night owner.";
  }
  return message;
}

function sameOrder(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function boutLockClosedReason(event: PickControlEvent, bout: PickControlBout, now: number) {
  if (event.status !== "upcoming") return "The event-wide master lock is active, so no fight can reopen.";
  if (bout.resultStatus !== "pending") return "Completed, resulted, or cancelled fights cannot be reopened.";
  if (!bout.includedInPicks) return "Removed fights cannot receive a new Picks deadline.";
  if (pickControlBoutIsFinal(event, bout, now)) return "This deadline is final and cannot be reopened.";
  if (!bout.canAdjustLock) return "This fight’s lock time can no longer be edited.";
  return "Extend this fight while it remains open. Once its effective deadline passes, it cannot reopen.";
}

function compactBoutStatus(event: PickControlEvent, bout: PickControlBout, now: number) {
  if (!bout.includedInPicks) return "REMOVED";
  if (bout.resultStatus === "cancelled") return "CANCELLED";
  if (pickControlBoutIsFinal(event, bout, now)) return "LOCKED";
  if (pickControlLockWarning(event, bout, now)) return "LOCKING SOON";
  return "OPEN";
}

interface OpenPicksDashboardProps {
  repository: PickControlRepository | null;
  now?: number;
}

export default function OpenPicksDashboard({
  repository,
  now = Date.now(),
}: OpenPicksDashboardProps) {
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
        current && nextEvent?.bouts.some((bout) => bout.boutId === current) ? current : null
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
      setError("Manage Open Picks is not connected on this build.");
      return;
    }
    void loadEvent();
  }, [identity.profile, identity.ready, loadEvent, repository]);

  const orderedBouts = useMemo(
    () => event?.bouts.slice().sort((left, right) => left.position - right.position) ?? [],
    [event],
  );
  const canonicalOrder = useMemo(
    () => orderedBouts.map((bout) => bout.boutId),
    [orderedBouts],
  );
  const displayedBouts = useMemo(() => {
    if (!draftOrder) return orderedBouts;
    const byId = new Map(orderedBouts.map((bout) => [bout.boutId, bout]));
    return draftOrder.map((id) => byId.get(id)).filter((bout): bout is PickControlBout => Boolean(bout));
  }, [draftOrder, orderedBouts]);
  const orderChanged = draftOrder !== null && !sameOrder(draftOrder, canonicalOrder);

  async function runAction(
    key: string,
    action: () => Promise<void>,
    successMessage?: string,
  ) {
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
      if (key === "reorder" && message.toLowerCase().includes("reload")) {
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
      "Enter the new event-wide Picks deadline in your local time (YYYY-MM-DDTHH:MM). This remains the master override.",
      localDateTimeValue(event.locksAt),
    )?.trim();
    if (!input) return;
    const proposed = new Date(input);
    if (!Number.isFinite(proposed.getTime())) {
      setError("Enter a valid local Picks deadline.");
      return;
    }
    if (proposed.getTime() <= now) {
      setError("The new Picks deadline must be in the future.");
      return;
    }
    if (proposed.getTime() > Date.parse(event.startsAt)) {
      setError("The Picks deadline cannot be later than the main-card start.");
      return;
    }
    const reason = window.prompt("Why is the Picks deadline changing?")?.trim();
    if (!reason) return;
    if (reason.length < 3) {
      setError("A Picks deadline change requires a reason of at least 3 characters.");
      return;
    }
    if (!window.confirm(
      `Change the event-wide master deadline from ${eventTime(event.locksAt)} to ${eventTime(proposed.toISOString())}? Fights still synchronized to the old default move with it; individually adjusted fights remain independent.`,
    )) return;
    void runAction("lock-time", () => repository!.adjustLockTime(
      event.eventId,
      proposed.toISOString(),
      event.locksAt,
      reason,
    ));
  }

  function lockEvent() {
    if (!event || !event.canLock) return;
    if (!window.confirm("Lock all picks and begin Fight Night result entry? The event-wide master lock closes every remaining open fight.")) return;
    void runAction("lock", () => repository!.lockEvent(event.eventId));
  }

  function extendBoutLockTime(bout: PickControlBout, minutes: 10 | 20) {
    if (!event || !repository?.adjustBoutLockTime || !pickControlBoutCanExtend(event, bout, now)) return;
    const currentLock = effectivePickControlBoutLock(event, bout);
    const proposed = new Date(Date.parse(currentLock) + minutes * PICK_LOCK_MINUTE_MS).toISOString();
    void runAction(
      `bout-lock:${bout.boutId}:${minutes}`,
      () => repository.adjustBoutLockTime!(event.eventId, bout.boutId, proposed),
      `${bout.redFighterName} vs. ${bout.blueFighterName} extended ${minutes} minutes.`,
    );
  }

  function setBoutLockTime(bout: PickControlBout) {
    if (!event || !repository?.adjustBoutLockTime || !pickControlBoutCanExtend(event, bout, now)) return;
    const currentLock = effectivePickControlBoutLock(event, bout);
    const input = window.prompt(
      `Set the new lock time for ${bout.redFighterName} vs. ${bout.blueFighterName} in your local time (YYYY-MM-DDTHH:MM).`,
      localDateTimeValue(currentLock),
    )?.trim();
    if (!input) return;
    const proposed = new Date(input);
    if (!Number.isFinite(proposed.getTime())) {
      setError("Enter a valid local fight lock time.");
      return;
    }
    if (proposed.getTime() <= now) {
      setError("The new fight lock time must be in the future.");
      return;
    }
    if (!window.confirm(
      `Set only ${bout.redFighterName} vs. ${bout.blueFighterName} to ${eventTime(proposed.toISOString())}? Once the effective deadline passes, it cannot reopen.`,
    )) return;
    void runAction(
      `bout-lock:${bout.boutId}:set`,
      () => repository.adjustBoutLockTime!(event.eventId, bout.boutId, proposed.toISOString()),
      `${bout.redFighterName} vs. ${bout.blueFighterName} deadline updated.`,
    );
  }

  function setCancellation(bout: PickControlBout, nextCancelled: boolean) {
    if (!event || !bout.includedInPicks) return;
    const reason = window.prompt(
      nextCancelled
        ? `Why is ${bout.redFighterName} vs. ${bout.blueFighterName} being cancelled?`
        : `Why is ${bout.redFighterName} vs. ${bout.blueFighterName} being restored?`,
    )?.trim();
    if (!reason) return;
    const confirmed = window.confirm(
      nextCancelled
        ? `Cancel ${bout.redFighterName} vs. ${bout.blueFighterName}? Existing picks will be preserved, the fight will be excluded from scoring, and any Underdog Lock on it will be cleared.`
        : `Restore ${bout.redFighterName} vs. ${bout.blueFighterName} before Picks lock? Existing picks remain preserved.`,
    );
    if (!confirmed) return;
    void runAction(`card:${bout.boutId}`, () => (
      repository!.setCancellation(event.eventId, bout.boutId, nextCancelled, reason)
    ));
  }

  function setBoutInclusion(bout: PickControlBout, includedInPicks: boolean) {
    if (!event) return;
    const reason = window.prompt(
      includedInPicks
        ? `Why is ${bout.redFighterName} vs. ${bout.blueFighterName} being restored to Picks?`
        : `Why is ${bout.redFighterName} vs. ${bout.blueFighterName} being removed from Picks?`,
    )?.trim();
    if (!reason) return;
    if (reason.length < 3) {
      setError("A Picks removal or restoration requires a reason of at least 3 characters.");
      return;
    }
    const confirmed = window.confirm(
      includedInPicks
        ? `Restore ${bout.redFighterName} vs. ${bout.blueFighterName} to Picks? Preserved picks become active again. Any previously cleared Underdog Lock will not be restored.`
        : `Remove ${bout.redFighterName} vs. ${bout.blueFighterName} from Picks? The fight and submitted picks stay preserved, but it will be excluded from progress and scoring. Any mutable Underdog Lock on it will be cleared.`,
    );
    if (!confirmed) return;
    void runAction(`include:${bout.boutId}`, () => (
      repository!.setBoutInclusion(event.eventId, bout, includedInPicks, reason)
    ));
  }

  function replaceFighter(bout: PickControlBout) {
    if (!event || !bout.canReplace || !bout.includedInPicks) return;
    const cornerInput = window.prompt(
      `Which corner should be replaced in ${bout.redFighterName} vs. ${bout.blueFighterName}? Enter RED or BLUE.`,
    )?.trim().toLowerCase();
    if (cornerInput !== "red" && cornerInput !== "blue") return;
    const name = window.prompt("Enter the replacement fighter’s canonical display name:")?.trim();
    if (!name) return;
    const suggestedSlug = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = window.prompt("Confirm the replacement fighter’s canonical slug:", suggestedSlug)?.trim().toLowerCase();
    if (!slug) return;
    const reason = window.prompt("Why is this fighter being replaced?")?.trim();
    if (!reason) return;
    if (!window.confirm(
      `Approve ${cornerInput.toUpperCase()} corner replacement with ${name}? Every existing pick on this bout will be invalidated and require an active repick. Mutable Underdog Locks and prior odds will be cleared and will not return automatically.`,
    )) return;
    void runAction(`replace:${bout.boutId}`, () => repository!.replaceFighter(
      event.eventId,
      bout,
      cornerInput,
      slug,
      name,
      reason,
    ));
  }

  function moveBout(index: number, offset: -1 | 1) {
    if (!event?.canReorder || busyAction) return;
    const order = displayedBouts.map((bout) => bout.boutId);
    const target = index + offset;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    setDraftOrder(sameOrder(order, canonicalOrder) ? null : order);
  }

  function approveOrder() {
    if (!event?.canReorder || !draftOrder || !orderChanged) return;
    const reason = window.prompt("Why is the live fight order changing?")?.trim();
    if (!reason) return;
    if (reason.length < 3) {
      setError("A fight-order change requires a reason of at least 3 characters.");
      return;
    }
    const numbered = (ids: string[]) => ids.map((id, index) => {
      const bout = event.bouts.find((item) => item.boutId === id)!;
      return `${index + 1}. ${bout.redFighterName} vs. ${bout.blueFighterName}`;
    }).join("\n");
    if (!window.confirm(
      `Approve this new live fight order?\n\nBEFORE\n${numbered(canonicalOrder)}\n\nAFTER\n${numbered(draftOrder)}\n\nThis changes display order only. Picks and Underdog Locks stay attached to their bouts.`,
    )) return;
    void runAction("reorder", () => repository!.reorderCard(event.eventId, canonicalOrder, draftOrder, reason));
  }

  if (!identity.ready || loading) {
    return (
      <div className="page open-picks-dashboard">
        <section className="surface-card picks-control-state" aria-live="polite">
          <strong>Loading Manage Open Picks…</strong>
        </section>
      </div>
    );
  }

  if (!identity.profile || !event || event.status !== "upcoming") {
    return error ? <p className="picks-error" role="status">{error}</p> : null;
  }

  return (
    <div className="page open-picks-dashboard">
      <section className="surface-card open-picks-toolbar" aria-label="Open Picks primary controls">
        <div className="open-picks-toolbar__lock">
          <div>
            <span>MASTER LOCK</span>
            <strong>{compactLockTime(event.locksAt)}</strong>
          </div>
          <span>{event.canLock ? "PICKS OPEN" : "LOCK PENDING"}</span>
        </div>
        <div className="open-picks-toolbar__actions">
          <button
            className="secondary-action"
            type="button"
            disabled={Boolean(busyAction) || now >= Date.parse(event.startsAt)}
            onClick={adjustLockTime}
          >
            {busyAction === "lock-time" ? "CHANGING…" : "CHANGE MASTER LOCK"}
          </button>
          <button
            className="primary-action"
            type="button"
            disabled={!event.canLock || Boolean(busyAction)}
            onClick={lockEvent}
          >
            {busyAction === "lock" ? "LOCKING…" : "LOCK ALL PICKS"}
          </button>
        </div>
      </section>

      <section className="open-picks-card" aria-label={`${event.name} compact fight controls`}>
        <div className={`surface-card open-picks-reorder${orderChanged ? " has-pending-order" : ""}`}>
          <div>
            <span>FIGHT ORDER</span>
            <strong>{orderChanged ? "NEW ORDER READY" : "MOVE LOCALLY · APPROVE ONCE"}</strong>
          </div>
          {event.hasReorderHistory ? <small>PRIOR ORDER CHANGE AUDITED</small> : null}
          {event.canReorder && orderChanged ? (
            <button className="primary-action" type="button" disabled={Boolean(busyAction)} onClick={approveOrder}>
              {busyAction === "reorder" ? "APPROVING…" : "APPROVE NEW ORDER"}
            </button>
          ) : null}
        </div>

        <div className="open-picks-list">
          {displayedBouts.map((bout, index) => {
            const expanded = expandedBoutId === bout.boutId;
            const isCancelled = bout.resultStatus === "cancelled";
            const isRemoved = !bout.includedInPicks;
            const lockFinal = pickControlBoutIsFinal(event, bout, now);
            const canExtend = Boolean(repository?.adjustBoutLockTime)
              && pickControlBoutCanExtend(event, bout, now);
            const warning = pickControlLockWarning(event, bout, now);
            const saving = busyAction === `card:${bout.boutId}` || busyAction === `include:${bout.boutId}`;
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
                  <span className="open-pick-row__position">
                    <strong>{index === 0 ? "MAIN EVENT" : `FIGHT ${index + 1}`}</strong>
                    <small>{bout.weightClass}</small>
                  </span>
                  <span className="open-pick-row__matchup">
                    <strong><b>{bout.redFighterName}</b><i>VS</i><b>{bout.blueFighterName}</b></strong>
                    <small>LOCK {compactLockTime(effectivePickControlBoutLock(event, bout))}</small>
                  </span>
                  <span className="open-pick-row__state">
                    <em>{saving ? "SAVING…" : compactBoutStatus(event, bout, now)}</em>
                    <b aria-hidden="true">{expanded ? "−" : "+"}</b>
                  </span>
                </button>

                {expanded ? (
                  <div className="open-pick-row__details" id={`open-pick-details-${bout.boutId}`}>
                    <div className={`picks-control-deadline picks-control-deadline--${lockFinal ? "final" : "open"}`}>
                      <div>
                        <span>FIGHT LOCK · {lockFinal ? "FINAL" : warning ? "LOCKING SOON" : "OPEN"}</span>
                        <strong>{eventTime(effectivePickControlBoutLock(event, bout))}</strong>
                        {warning ? <b className="picks-control-lock-warning" role="status">{warning}</b> : null}
                        <small>{boutLockClosedReason(event, bout, now)}</small>
                      </div>
                      {canExtend ? (
                        <div className="picks-control-lock-actions" aria-label={`Adjust ${bout.redFighterName} versus ${bout.blueFighterName} deadline`}>
                          <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={() => extendBoutLockTime(bout, 10)}>
                            {busyAction === `bout-lock:${bout.boutId}:10` ? "UPDATING…" : "+10 MIN"}
                          </button>
                          <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={() => extendBoutLockTime(bout, 20)}>
                            {busyAction === `bout-lock:${bout.boutId}:20` ? "UPDATING…" : "+20 MIN"}
                          </button>
                          <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={() => setBoutLockTime(bout)}>
                            {busyAction === `bout-lock:${bout.boutId}:set` ? "UPDATING…" : "SET TIME"}
                          </button>
                        </div>
                      ) : <span className="picks-control-lock-final">DEADLINE FINAL</span>}
                    </div>

                    {event.canReorder ? (
                      <div className="pick-control-move" aria-label={`Move ${bout.redFighterName} vs. ${bout.blueFighterName}`}>
                        <button type="button" disabled={index === 0 || Boolean(busyAction)} onClick={() => moveBout(index, -1)}>MOVE UP</button>
                        <button type="button" disabled={index === displayedBouts.length - 1 || Boolean(busyAction)} onClick={() => moveBout(index, 1)}>MOVE DOWN</button>
                      </div>
                    ) : null}

                    <p className="open-pick-row__explanation">
                      {isRemoved
                        ? "This fight and its submitted picks remain stored, but it is excluded from progress and scoring."
                        : isCancelled
                          ? "Original picks remain preserved. The cancelled fight is excluded from scoring and cannot receive new picks."
                          : lockFinal
                            ? "Submitted picks are preserved and revealed through the existing fight-specific privacy owner."
                            : "Use these actions only when the live UFC card or deadline actually changes."}
                    </p>

                    {bout.hasReplacementHistory ? <p className="pick-control-replacement-history"><strong>REPLACEMENT HISTORY EXISTS</strong> · The matchup above is currently stored.</p> : null}
                    {bout.hasRemovalHistory ? <p className="pick-control-replacement-history"><strong>REMOVAL HISTORY EXISTS</strong> · Prior inclusion actions remain audited.</p> : null}

                    <div className="open-pick-row__actions" aria-label={`${bout.redFighterName} vs. ${bout.blueFighterName} uncommon actions`}>
                      {!isRemoved && !isCancelled ? (
                        <button className="secondary-action" type="button" disabled={Boolean(busyAction) || !bout.canReplace} onClick={() => replaceFighter(bout)}>
                          {busyAction === `replace:${bout.boutId}` ? "REPLACING…" : "REPLACE FIGHTER"}
                        </button>
                      ) : null}
                      {!isRemoved ? (
                        <button className={isCancelled ? "secondary-action" : "pick-control-clear"} type="button" disabled={Boolean(busyAction) || (isCancelled ? !bout.canRestore : !bout.canCancel)} onClick={() => setCancellation(bout, !isCancelled)}>
                          {isCancelled ? "RESTORE FIGHT" : "CANCEL FIGHT"}
                        </button>
                      ) : null}
                      {!isCancelled ? (
                        <button className={isRemoved ? "secondary-action" : "pick-control-clear"} type="button" disabled={Boolean(busyAction) || (isRemoved ? !bout.canRestoreToPicks : !bout.canRemoveFromPicks)} onClick={() => setBoutInclusion(bout, isRemoved)}>
                          {isRemoved ? "RESTORE TO PICKS" : "REMOVE FROM PICKS"}
                        </button>
                      ) : null}
                    </div>
                    <small className="open-pick-row__audit-note">CURRENT STATUS · {pickControlResultLabel(bout)}</small>
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
