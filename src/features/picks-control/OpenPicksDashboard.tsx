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
  const message = error instanceof Error ? error.message : "Open Picks could not complete that request.";
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
  if (pickControlBoutIsFinal(event, bout, now)) return "This deadline is final and cannot be reopened.";
  if (!bout.canAdjustLock) return "This fight’s lock time can no longer be edited.";
  return "Extend this fight while it remains open. Once its effective deadline passes, it cannot reopen.";
}

function compactBoutStatus(event: PickControlEvent, bout: PickControlBout, now: number) {
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
    () => event?.bouts
      .filter((bout) => bout.includedInPicks)
      .slice()
      .sort((left, right) => left.position - right.position) ?? [],
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
      if ((key === "reorder" || key === "add") && message.toLowerCase().includes("reload")) {
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
    if (!window.confirm(
      `Are you sure you want to change the event-wide master deadline from ${eventTime(event.locksAt)} to ${eventTime(proposed.toISOString())}?`,
    )) return;
    void runAction("lock-time", () => repository!.adjustLockTime(
      event.eventId,
      proposed.toISOString(),
      event.locksAt,
      "Owner confirmed master Picks deadline change",
    ));
  }

  function lockEvent() {
    if (!event || !event.canLock) return;
    if (!window.confirm("Are you sure you want to lock all picks and begin Fight Night result entry?")) return;
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
      `Are you sure you want ${bout.redFighterName} vs. ${bout.blueFighterName} to lock at ${eventTime(proposed.toISOString())}?`,
    )) return;
    void runAction(
      `bout-lock:${bout.boutId}:set`,
      () => repository.adjustBoutLockTime!(event.eventId, bout.boutId, proposed.toISOString()),
      `${bout.redFighterName} vs. ${bout.blueFighterName} deadline updated.`,
    );
  }

  function setCancellation(bout: PickControlBout, nextCancelled: boolean) {
    if (!event) return;
    const confirmed = window.confirm(
      nextCancelled
        ? `Are you sure you want to cancel ${bout.redFighterName} vs. ${bout.blueFighterName}? Existing picks stay stored and the fight is excluded from scoring.`
        : `Are you sure you want to restore ${bout.redFighterName} vs. ${bout.blueFighterName}?`,
    );
    if (!confirmed) return;
    void runAction(`card:${bout.boutId}`, () => (
      repository!.setCancellation(
        event.eventId,
        bout.boutId,
        nextCancelled,
        nextCancelled ? "Owner confirmed fight cancellation" : "Owner confirmed fight restoration",
      )
    ));
  }

  function removeBout(bout: PickControlBout) {
    if (!event) return;
    if (!window.confirm(
      `Are you sure you want to remove ${bout.redFighterName} vs. ${bout.blueFighterName} from Picks? It will disappear from the owner and player cards. Submitted picks remain only in the private audit history and will not count.`,
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
    const suggestedSlug = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = window.prompt("Confirm the replacement fighter’s canonical slug:", suggestedSlug)?.trim().toLowerCase();
    if (!slug) return;
    if (!window.confirm(
      `Are you sure you want to replace the ${cornerInput.toUpperCase()} corner with ${name}? Affected members must repick.`,
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
    if (!event?.canReorder || !repository) return;
    const redFighterName = window.prompt("Enter the first fighter’s canonical display name:")?.trim();
    if (!redFighterName) return;
    const blueFighterName = window.prompt("Enter the second fighter’s canonical display name:")?.trim();
    if (!blueFighterName) return;
    const weightClass = window.prompt("Enter the weight class:")?.trim();
    if (!weightClass) return;
    const segmentInput = window.prompt("Enter MAIN or PRELIM:", "MAIN")?.trim().toLowerCase();
    if (segmentInput !== "main" && segmentInput !== "prelim") {
      setError("Enter MAIN or PRELIM for the fight segment.");
      return;
    }
    const positionInput = window.prompt(
      `Enter the card position from 1 to ${canonicalOrder.length + 1}. Position 1 is the main event.`,
      String(canonicalOrder.length + 1),
    )?.trim();
    if (!positionInput) return;
    const position = Number(positionInput);
    if (!Number.isInteger(position) || position < 1 || position > canonicalOrder.length + 1) {
      setError(`Enter a position from 1 to ${canonicalOrder.length + 1}.`);
      return;
    }
    if (!window.confirm(
      `Are you sure you want to add ${redFighterName} vs. ${blueFighterName} at position ${position}? The complete card order and position-owned lock times will be recalculated together.`,
    )) return;
    void runAction(
      "add",
      () => repository.addBout(event.eventId, canonicalOrder, {
        redFighterName,
        blueFighterName,
        weightClass,
        cardSegment: segmentInput,
        position,
      }, "Owner confirmed fight addition to Picks"),
      `${redFighterName} vs. ${blueFighterName} added to Picks.`,
    );
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
    const numbered = (ids: string[]) => ids.map((id, index) => {
      const bout = event.bouts.find((item) => item.boutId === id)!;
      return `${index + 1}. ${bout.redFighterName} vs. ${bout.blueFighterName}`;
    }).join("\n");
    if (!window.confirm(
      `Are you sure you want to apply this live fight order?\n\nBEFORE\n${numbered(canonicalOrder)}\n\nAFTER\n${numbered(draftOrder)}\n\nEach position owns its deadline, so the order and all fight lock times will update atomically. Picks and Underdog Locks stay attached to their bouts.`,
    )) return;
    void runAction(
      "reorder",
      () => repository!.reorderCard(
        event.eventId,
        canonicalOrder,
        draftOrder,
        "Owner confirmed live fight order change",
      ),
      "Fight order and position-owned deadlines updated.",
    );
  }

  if (!identity.ready || loading) {
    return (
      <div className="page open-picks-dashboard">
        <section className="surface-card picks-control-state" aria-live="polite">
          <strong>Loading Open Picks…</strong>
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
            <strong>{orderChanged ? "NEW ORDER READY" : "POSITION OWNS LOCK TIME"}</strong>
          </div>
          <div className="open-picks-reorder__actions">
            {event.hasReorderHistory ? <small>PRIOR ORDER CHANGE AUDITED</small> : null}
            {event.canReorder ? (
              <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={addFight}>
                {busyAction === "add" ? "ADDING…" : "ADD FIGHT"}
              </button>
            ) : null}
            {event.canReorder && orderChanged ? (
              <button className="primary-action" type="button" disabled={Boolean(busyAction)} onClick={approveOrder}>
                {busyAction === "reorder" ? "APPLYING…" : "APPLY ORDER + LOCKS"}
              </button>
            ) : null}
          </div>
        </div>

        <div className="open-picks-list">
          {displayedBouts.map((bout, index) => {
            const expanded = expandedBoutId === bout.boutId;
            const isCancelled = bout.resultStatus === "cancelled";
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
                      {isCancelled
                        ? "Original picks remain preserved. The cancelled fight is excluded from scoring and cannot receive new picks."
                        : lockFinal
                          ? "Submitted picks are preserved and revealed through the existing fight-specific privacy owner."
                          : "Use these actions only when the live UFC card or deadline actually changes."}
                    </p>

                    {bout.hasReplacementHistory ? <p className="pick-control-replacement-history"><strong>REPLACEMENT HISTORY EXISTS</strong> · The matchup above is currently stored.</p> : null}
                    {bout.hasRemovalHistory ? <p className="pick-control-replacement-history"><strong>REMOVAL HISTORY EXISTS</strong> · Prior inclusion actions remain privately audited.</p> : null}

                    <div className="open-pick-row__actions" aria-label={`${bout.redFighterName} vs. ${bout.blueFighterName} uncommon actions`}>
                      {!isCancelled ? (
                        <button className="secondary-action" type="button" disabled={Boolean(busyAction) || !bout.canReplace} onClick={() => replaceFighter(bout)}>
                          {busyAction === `replace:${bout.boutId}` ? "REPLACING…" : "REPLACE FIGHTER"}
                        </button>
                      ) : null}
                      <button className={isCancelled ? "secondary-action" : "pick-control-clear"} type="button" disabled={Boolean(busyAction) || (isCancelled ? !bout.canRestore : !bout.canCancel)} onClick={() => setCancellation(bout, !isCancelled)}>
                        {isCancelled ? "RESTORE FIGHT" : "CANCEL FIGHT"}
                      </button>
                      {!isCancelled ? (
                        <button className="pick-control-clear" type="button" disabled={Boolean(busyAction) || !bout.canRemoveFromPicks} onClick={() => removeBout(bout)}>
                          REMOVE FROM PICKS
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
