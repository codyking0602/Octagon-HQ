import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import type { PickBoutResultStatus } from "../picks/picksModel";
import {
  cancelledBoutCount,
  pickControlResultLabel,
  pickControlResultOptions,
  removedBoutCount,
  resolvedBoutCount,
  type PickControlBout,
  type PickControlEvent,
} from "./pickControlModel";
import {
  createPickControlRepository,
  type PickControlRepository,
} from "./pickControlRepository";

function eventTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
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
  const message = error instanceof Error ? error.message : "Fight Night Control could not complete that request.";
  if (message.toLowerCase().includes("pick control owner required")) {
    return "This control room is available only to the designated Fight Night owner.";
  }
  return message;
}

function resultButtonClass(active: boolean) {
  return active ? "pick-control-result is-active" : "pick-control-result";
}

function sameOrder(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function parseCorrectedResult(value: string): PickBoutResultStatus | null {
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "red" || normalized === "red_win") return "red_win";
  if (normalized === "blue" || normalized === "blue_win") return "blue_win";
  if (normalized === "draw") return "draw";
  if (normalized === "no_contest" || normalized === "nc") return "no_contest";
  if (normalized === "cancelled" || normalized === "canceled") return "cancelled";
  return null;
}

interface PicksControlPageProps {
  repository?: PickControlRepository | null;
}

export default function PicksControlPage({ repository: suppliedRepository }: PicksControlPageProps) {
  const identity = useIdentity();
  const [repository] = useState<PickControlRepository | null>(() => (
    suppliedRepository === undefined ? createPickControlRepository() : suppliedRepository
  ));
  const [event, setEvent] = useState<PickControlEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [draftOrder, setDraftOrder] = useState<string[] | null>(null);

  const loadEvent = useCallback(async (eventId?: string) => {
    if (!repository || !identity.profile) return;
    setLoading(true);
    try {
      const nextEvent = await repository.loadControlEvent(eventId);
      setEvent(nextEvent);
      setDraftOrder(null);
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
      return;
    }
    if (!repository) {
      setLoading(false);
      setError("Fight Night Control is not connected on this build.");
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
  const resolved = resolvedBoutCount(event);
  const cancelled = cancelledBoutCount(event);
  const removed = removedBoutCount(event);
  const progressCount = event?.status === "upcoming" ? cancelled + removed : resolved;
  const progress = event?.bouts.length ? Math.round((progressCount / event.bouts.length) * 100) : 0;

  async function runAction(key: string, action: () => Promise<void>) {
    setBusyAction(key);
    setError("");
    try {
      await action();
      await loadEvent(event?.eventId);
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

  function recordResult(bout: PickControlBout, result: PickBoutResultStatus) {
    if (!event || event.status !== "locked" || !bout.includedInPicks || bout.resultStatus !== "pending") return;
    if (!window.confirm(`Record ${pickControlResultLabel({ ...bout, resultStatus: result })} as the official result for ${bout.redFighterName} vs. ${bout.blueFighterName}?`)) return;
    void runAction(`bout:${bout.boutId}`, () => repository!.recordResult(event.eventId, bout.boutId, result));
  }

  function correctResult(bout: PickControlBout) {
    if (!event || !bout.canCorrectResult || !bout.resultRecordedAt) return;
    const input = window.prompt(
      `Correct ${bout.redFighterName} vs. ${bout.blueFighterName}.\nCurrent result: ${pickControlResultLabel(bout)}.\nEnter RED, BLUE, DRAW, NO CONTEST, or CANCELLED.`,
    );
    if (input === null) return;
    const nextResult = parseCorrectedResult(input);
    if (!nextResult) {
      setError("Enter a valid final corrected official result.");
      return;
    }
    if (nextResult === bout.resultStatus) {
      setError("The corrected official result must be different from the current result.");
      return;
    }
    const reason = window.prompt("Why is this official result being corrected?")?.trim();
    if (!reason) return;
    if (reason.length < 3) {
      setError("An official result correction requires a reason of at least 3 characters.");
      return;
    }
    const nextLabel = pickControlResultLabel({ ...bout, resultStatus: nextResult });
    if (!window.confirm(
      `Correct ${bout.redFighterName} vs. ${bout.blueFighterName} from ${pickControlResultLabel(bout)} to ${nextLabel}? Submitted picks and Underdog Locks will not change. Scoring, standings, season totals, and recaps will recalculate from the corrected canonical result.`,
    )) return;
    void runAction(`correct:${bout.boutId}`, () => (
      repository!.correctResult(event.eventId, bout, nextResult, reason)
    ));
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
      event.eventId, bout, cornerInput, slug, name, reason,
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
    if (!window.confirm(`Approve this new live fight order?\n\nBEFORE\n${numbered(canonicalOrder)}\n\nAFTER\n${numbered(draftOrder)}\n\nThis changes display order only. Picks and Underdog Locks stay attached to their bouts.`)) return;
    void runAction("reorder", () => repository!.reorderCard(event.eventId, canonicalOrder, draftOrder, reason));
  }

  function adjustLockTime() {
    if (!event || event.status !== "upcoming" || Date.now() >= Date.parse(event.startsAt)) return;
    const input = window.prompt(
      "Enter the new event-wide Picks deadline in your local time (YYYY-MM-DDTHH:MM). All fights lock together.",
      localDateTimeValue(event.locksAt),
    )?.trim();
    if (!input) return;
    const proposed = new Date(input);
    if (!Number.isFinite(proposed.getTime())) {
      setError("Enter a valid local Picks deadline.");
      return;
    }
    if (proposed.getTime() <= Date.now()) {
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
      `Change the deadline for every fight from ${eventTime(event.locksAt)} to ${eventTime(proposed.toISOString())}? This does not reopen an event that was manually moved to LOCKED.`,
    )) return;
    void runAction("lock-time", () => repository!.adjustLockTime!(
      event.eventId,
      proposed.toISOString(),
      event.locksAt,
      reason,
    ));
  }

  function lockEvent() {
    if (!event || !event.canLock) return;
    if (!window.confirm("Lock all picks and begin Fight Night result entry? Picks will remain private until each fight is resolved.")) return;
    void runAction("lock", () => repository!.lockEvent(event.eventId));
  }

  function completeEvent() {
    if (!event || !event.canComplete) return;
    if (!window.confirm("Complete this event? The recap will publish automatically. Any later official-result correction must use the audited correction workflow.")) return;
    void runAction("complete", () => repository!.completeEvent(event.eventId));
  }

  return (
    <div className="page picks-control-page">
      <section className="page-heading picks-control-heading">
        <p className="eyebrow">PRIVATE OWNER TOOL</p>
        <h1>Fight Night Control</h1>
        <p>Approve pre-lock card changes, enter each first official result after Picks lock, and correct finalized results through a separate audited workflow.</p>
        <div className="picks-control-heading__links">
          <Link to="/picks/monitoring">MONITORING INBOX</Link>
          <Link to="/picks/setup">EVENT SETUP</Link>
          <Link to="/picks">PLAYER PICKS</Link>
        </div>
      </section>

      {!identity.ready || loading ? (
        <section className="surface-card picks-control-state" aria-live="polite">
          <strong>Loading Fight Night Control…</strong>
        </section>
      ) : null}

      {identity.ready && !identity.profile ? (
        <section className="surface-card picks-control-state">
          <p className="eyebrow">OWNER SIGN-IN REQUIRED</p>
          <h2>Sign in to open Fight Night Control.</h2>
          <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN</button>
        </section>
      ) : null}

      {identity.profile && !loading && error && !event ? (
        <section className="surface-card picks-control-state">
          <p className="eyebrow">CONTROL UNAVAILABLE</p>
          <h2>{error}</h2>
          <Link className="secondary-action" to="/picks">BACK TO PICKS</Link>
        </section>
      ) : null}

      {identity.profile && !loading && !error && !event ? (
        <section className="surface-card picks-control-state">
          <p className="eyebrow">NO PICKS EVENT</p>
          <h2>There is no published or completed card to control.</h2>
          <p>Sync and publish the next UFC card in Event Setup.</p>
          <Link className="primary-action" to="/picks/setup">OPEN EVENT SETUP</Link>
        </section>
      ) : null}

      {event ? (
        <>
          <section className="surface-card picks-control-hero" aria-labelledby="pick-control-event-title">
            <div className="picks-control-hero__top">
              <p className="eyebrow">SEASON {event.season}</p>
              <span className={`picks-control-status picks-control-status--${event.status}`}>{event.status.toUpperCase()}</span>
            </div>
            <h2 id="pick-control-event-title">{event.name}</h2>
            <strong>{event.subtitle}</strong>
            <p>{eventTime(event.startsAt)} · {event.venue} · {event.location}</p>

            {(event.recentCompletedEvents?.length ?? 0) > 0 ? (
              <div className="picks-control-heading__links" aria-label="Completed event correction access">
                {event.status === "complete" ? (
                  <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={() => void loadEvent()}>
                    OPEN CURRENT EVENT
                  </button>
                ) : null}
                {event.recentCompletedEvents?.filter((item) => item.eventId !== event.eventId).map((item) => (
                  <button
                    className="secondary-action"
                    type="button"
                    key={item.eventId}
                    disabled={Boolean(busyAction)}
                    onClick={() => void loadEvent(item.eventId)}
                  >
                    VIEW {item.name.toUpperCase()}
                  </button>
                ))}
              </div>
            ) : null}

            <div
              className="picks-control-progress"
              aria-label={event.status === "upcoming"
                ? `${cancelled} fights cancelled and ${removed} removed from Picks`
                : `${resolved} of ${event.bouts.length} results or exclusions resolved`}
            >
              <div>
                <span>{event.status === "upcoming" ? "CARD CHANGES" : "OFFICIAL RESULTS"}</span>
                <b>{progressCount} OF {event.bouts.length}</b>
              </div>
              <div className="picks-control-progress__track" aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

            {event.status === "upcoming" ? (
              <div className="picks-control-deadline">
                <div>
                  <span>ALL FIGHTS LOCK TOGETHER</span>
                  <strong>{eventTime(event.locksAt)}</strong>
                  <small>Deadline can move while the event is upcoming, but never past the main-card start.</small>
                </div>
                <button
                  className="secondary-action"
                  type="button"
                  disabled={Boolean(busyAction) || Date.now() >= Date.parse(event.startsAt)}
                  onClick={adjustLockTime}
                >
                  {busyAction === "lock-time" ? "CHANGING…" : "CHANGE LOCK TIME"}
                </button>
              </div>
            ) : null}

            {event.status === "upcoming" ? (
              <button
                className="primary-action picks-control-lock"
                type="button"
                disabled={!event.canLock || Boolean(busyAction)}
                onClick={lockEvent}
              >
                {busyAction === "lock"
                  ? "LOCKING PICKS…"
                  : event.canLock
                    ? "LOCK PICKS & BEGIN RESULTS"
                    : `PICKS LOCK ${eventTime(event.locksAt).toUpperCase()}`}
              </button>
            ) : null}
          </section>

          {event.status === "upcoming" ? (
            <section className="picks-control-bouts" aria-label={`${event.name} pre-lock card controls`}>
              <div className="surface-card picks-control-reorder">
                <div>
                  <strong>LIVE FIGHT ORDER</strong>
                  <span>{event.canReorder ? "Move locally, then approve once." : "Fight-order changes are closed."}</span>
                </div>
                {event.hasReorderHistory ? <small>REORDER HISTORY EXISTS</small> : null}
                {event.canReorder && orderChanged ? (
                  <button className="primary-action" type="button" disabled={Boolean(busyAction)} onClick={approveOrder}>
                    {busyAction === "reorder" ? "APPROVING…" : "APPROVE NEW ORDER"}
                  </button>
                ) : null}
              </div>
              {displayedBouts.map((bout, index) => {
                const saving = busyAction === `card:${bout.boutId}` || busyAction === `include:${bout.boutId}`;
                const isCancelled = bout.resultStatus === "cancelled";
                const isRemoved = !bout.includedInPicks;
                return (
                  <article className="surface-card pick-control-bout" key={bout.boutId}>
                    <div className="pick-control-bout__heading">
                      <div>
                        <span>{index === 0 ? "MAIN EVENT" : `MAIN CARD · FIGHT ${index + 1}`}</span>
                        <small>{bout.weightClass}</small>
                      </div>
                      <em className={`pick-control-bout__state pick-control-bout__state--${isRemoved ? "removed" : bout.resultStatus}`}>
                        {saving ? "SAVING…" : pickControlResultLabel(bout)}
                      </em>
                    </div>
                    {event.canReorder ? (
                      <div className="pick-control-move" aria-label={`Move ${bout.redFighterName} vs. ${bout.blueFighterName}`}>
                        <button type="button" disabled={index === 0 || Boolean(busyAction)} onClick={() => moveBout(index, -1)}>MOVE UP</button>
                        <button type="button" disabled={index === displayedBouts.length - 1 || Boolean(busyAction)} onClick={() => moveBout(index, 1)}>MOVE DOWN</button>
                      </div>
                    ) : null}
                    <div className="pick-control-winners">
                      <div><span>RED CORNER</span><strong>{bout.redFighterName}</strong></div>
                      <span>VS</span>
                      <div><span>BLUE CORNER</span><strong>{bout.blueFighterName}</strong></div>
                    </div>
                    <p>
                      {isRemoved
                        ? "The fight and submitted picks are preserved, but it is excluded from progress and scoring."
                        : isCancelled
                          ? "Original picks are preserved. This fight is excluded from scoring and cannot receive new picks."
                          : "Cancellation means the fight is off. Removal means it stays stored but no longer belongs to the pickable card."}
                    </p>
                    {bout.hasReplacementHistory ? (
                      <p className="pick-control-replacement-history"><strong>REPLACEMENT HISTORY EXISTS</strong> · The matchup above is currently stored.</p>
                    ) : null}
                    {bout.hasRemovalHistory ? (
                      <p className="pick-control-replacement-history"><strong>REMOVAL HISTORY EXISTS</strong> · Prior inclusion actions remain audited.</p>
                    ) : null}

                    {!isRemoved && !isCancelled ? (
                      <button
                        className="secondary-action"
                        type="button"
                        disabled={Boolean(busyAction) || !bout.canReplace}
                        onClick={() => replaceFighter(bout)}
                      >
                        {busyAction === `replace:${bout.boutId}` ? "REPLACING…" : "REPLACE FIGHTER"}
                      </button>
                    ) : null}

                    {!isRemoved ? (
                      <button
                        className={isCancelled ? "secondary-action" : "pick-control-clear"}
                        type="button"
                        disabled={Boolean(busyAction) || (isCancelled ? !bout.canRestore : !bout.canCancel)}
                        onClick={() => setCancellation(bout, !isCancelled)}
                      >
                        {isCancelled ? "RESTORE FIGHT" : "CANCEL FIGHT"}
                      </button>
                    ) : null}

                    {!isCancelled ? (
                      <button
                        className={isRemoved ? "secondary-action" : "pick-control-clear"}
                        type="button"
                        disabled={Boolean(busyAction) || (isRemoved ? !bout.canRestoreToPicks : !bout.canRemoveFromPicks)}
                        onClick={() => setBoutInclusion(bout, isRemoved)}
                      >
                        {isRemoved ? "RESTORE TO PICKS" : "REMOVE FROM PICKS"}
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </section>
          ) : null}

          {event.status === "locked" || event.status === "complete" ? (
            <section className="picks-control-bouts" aria-label={`${event.name} official results`}>
              {orderedBouts.map((bout, index) => {
                const saving = busyAction === `bout:${bout.boutId}` || busyAction === `correct:${bout.boutId}`;
                const isRemoved = !bout.includedInPicks;
                const isPending = bout.resultStatus === "pending";
                return (
                  <article className="surface-card pick-control-bout" key={bout.boutId}>
                    <div className="pick-control-bout__heading">
                      <div>
                        <span>{index === 0 ? "MAIN EVENT" : `MAIN CARD · FIGHT ${index + 1}`}</span>
                        <small>{bout.weightClass}</small>
                      </div>
                      <em className={`pick-control-bout__state pick-control-bout__state--${isRemoved ? "removed" : bout.resultStatus}`}>
                        {saving ? "SAVING…" : pickControlResultLabel(bout)}
                      </em>
                    </div>

                    {isRemoved ? (
                      <>
                        <div className="pick-control-winners">
                          <div><span>RED CORNER</span><strong>{bout.redFighterName}</strong></div>
                          <span>VS</span>
                          <div><span>BLUE CORNER</span><strong>{bout.blueFighterName}</strong></div>
                        </div>
                        <p><strong>EXCLUDED FROM SCORING</strong> · No official Picks result is required for this stored fight.</p>
                      </>
                    ) : isPending && event.status === "locked" ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <div className="pick-control-winners">
                          <div><span>RED CORNER</span><strong>{bout.redFighterName}</strong></div>
                          <span>VS</span>
                          <div><span>BLUE CORNER</span><strong>{bout.blueFighterName}</strong></div>
                        </div>
                        <p><strong>CURRENT OFFICIAL RESULT</strong> · {pickControlResultLabel(bout)}</p>
                        {bout.hasCorrectionHistory ? (
                          <p className="pick-control-replacement-history"><strong>CORRECTION HISTORY EXISTS</strong> · Prior result states and reasons remain privately audited.</p>
                        ) : null}
                        <button
                          className="secondary-action"
                          type="button"
                          disabled={Boolean(busyAction) || !bout.canCorrectResult}
                          onClick={() => correctResult(bout)}
                        >
                          {busyAction === `correct:${bout.boutId}` ? "CORRECTING…" : "CORRECT RESULT"}
                        </button>
                      </>
                    )}
                  </article>
                );
              })}
            </section>
          ) : null}

          {event.status === "locked" ? (
            <section className="surface-card picks-control-complete">
              <div>
                <p className="eyebrow">FINAL STEP</p>
                <h2>Complete event</h2>
                <p>Every included fight must have a winner, draw, no contest, or cancellation before the recap can publish. Removed fights need no result.</p>
              </div>
              <button
                className="primary-action"
                type="button"
                disabled={!event.canComplete || Boolean(busyAction)}
                onClick={completeEvent}
              >
                {busyAction === "complete" ? "COMPLETING EVENT…" : "COMPLETE EVENT"}
              </button>
            </section>
          ) : null}

          {event.status === "complete" ? (
            <section className="surface-card picks-control-complete">
              <div>
                <p className="eyebrow">EVENT COMPLETE</p>
                <h2>Recap published automatically</h2>
                <p>Corrections update the canonical result and automatically recalculate scoring, standings, season totals, and completed recaps without reopening Picks or changing the event lifecycle.</p>
              </div>
            </section>
          ) : null}

          {error ? <p className="picks-error" role="status">{error}</p> : null}
        </>
      ) : null}
    </div>
  );
}
