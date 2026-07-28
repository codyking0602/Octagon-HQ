import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import type { PickBoutResultStatus } from "../picks/picksModel";
import {
  cancelledBoutCount,
  pickControlResultLabel,
  pickControlResultOptions,
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

  const loadEvent = useCallback(async () => {
    if (!repository || !identity.profile) return;
    setLoading(true);
    try {
      const nextEvent = await repository.loadControlEvent();
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
  const displayedBouts = useMemo(() => {
    if (!draftOrder) return orderedBouts;
    const byId = new Map(orderedBouts.map((bout) => [bout.boutId, bout]));
    return draftOrder.map((id) => byId.get(id)).filter((bout): bout is PickControlBout => Boolean(bout));
  }, [draftOrder, orderedBouts]);
  const resolved = resolvedBoutCount(event);
  const cancelled = cancelledBoutCount(event);
  const progressCount = event?.status === "upcoming" ? cancelled : resolved;
  const progress = event?.bouts.length ? Math.round((progressCount / event.bouts.length) * 100) : 0;

  async function runAction(key: string, action: () => Promise<void>) {
    setBusyAction(key);
    setError("");
    try {
      await action();
      await loadEvent();
    } catch (nextError) {
      setError(readableError(nextError));
    } finally {
      setBusyAction("");
    }
  }

  function confirmResultChange(bout: PickControlBout, nextResult: PickBoutResultStatus) {
    if (bout.resultStatus === "pending" || bout.resultStatus === nextResult) return true;
    return window.confirm(
      `Change ${bout.redFighterName} vs. ${bout.blueFighterName} from ${pickControlResultLabel(bout)} to the new result?`,
    );
  }

  function recordResult(bout: PickControlBout, result: PickBoutResultStatus) {
    if (!event || bout.resultStatus === result || !confirmResultChange(bout, result)) return;
    void runAction(`bout:${bout.boutId}`, () => repository!.recordResult(event.eventId, bout.boutId, result));
  }

  function clearResult(bout: PickControlBout) {
    if (!event || bout.resultStatus === "pending") return;
    if (!window.confirm(`Clear the official result for ${bout.redFighterName} vs. ${bout.blueFighterName}?`)) return;
    void runAction(`bout:${bout.boutId}`, () => repository!.recordResult(event.eventId, bout.boutId, "pending"));
  }

  function setCancellation(bout: PickControlBout, nextCancelled: boolean) {
    if (!event) return;
    const action = nextCancelled ? "cancel" : "restore";
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
    const order = displayedBouts.map((bout) => bout.boutId);
    const target = index + offset;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    setDraftOrder(order);
  }

  function approveOrder() {
    if (!event || !draftOrder) return;
    const reason = window.prompt("Why is the live fight order changing?")?.trim();
    if (!reason) return;
    const numbered = (ids: string[]) => ids.map((id, index) => {
      const bout = event.bouts.find((item) => item.boutId === id)!;
      return `${index + 1}. ${bout.redFighterName} vs. ${bout.blueFighterName}`;
    }).join("\n");
    const expected = orderedBouts.map((bout) => bout.boutId);
    if (!window.confirm(`Approve this new live fight order?\n\nBEFORE\n${numbered(expected)}\n\nAFTER\n${numbered(draftOrder)}\n\nThis changes display order only. Picks and Underdog Locks stay attached to their bouts.`)) return;
    void runAction("reorder", () => repository!.reorderCard(event.eventId, expected, draftOrder, reason));
  }

  function lockEvent() {
    if (!event || !event.canLock) return;
    if (!window.confirm("Lock all picks and begin Fight Night result entry? Picks will remain private until each fight is resolved.")) return;
    void runAction("lock", () => repository!.lockEvent(event.eventId));
  }

  function completeEvent() {
    if (!event || !event.canComplete) return;
    if (!window.confirm("Complete this event? Results become immutable and the final recap will be published.")) return;
    void runAction("complete", () => repository!.completeEvent(event.eventId));
  }

  return (
    <div className="page picks-control-page">
      <section className="page-heading picks-control-heading">
        <p className="eyebrow">PRIVATE OWNER TOOL</p>
        <h1>Fight Night Control</h1>
        <p>Approve pre-lock cancellations, fighter replacements, or fight order, then record official results after Picks lock.</p>
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
          <p className="eyebrow">NO ACTIVE EVENT</p>
          <h2>There is no upcoming or locked card to control.</h2>
          <p>Sync and publish the next UFC card in Event Setup.</p>
          <Link className="primary-action" to="/picks/setup">OPEN EVENT SETUP</Link>
        </section>
      ) : null}

      {event ? (
        <>
          <section className="surface-card picks-control-hero" aria-labelledby="pick-control-event-title">
            <div className="picks-control-hero__topline">
              <p className="eyebrow">CARD & RESULTS</p>
              <span className={`picks-control-status picks-control-status--${event.status}`}>{event.status.toUpperCase()}</span>
            </div>
            <h2 id="pick-control-event-title">{event.name}</h2>
            <strong>{event.subtitle}</strong>
            <p>{eventTime(event.startsAt)} · {event.venue} · {event.location}</p>

            <div
              className="picks-control-progress"
              aria-label={event.status === "upcoming"
                ? `${cancelled} of ${event.bouts.length} fights cancelled`
                : `${resolved} of ${event.bouts.length} results entered`}
            >
              <div>
                <span>{event.status === "upcoming" ? "CARD CANCELLATIONS" : "OFFICIAL RESULTS"}</span>
                <b>{progressCount} OF {event.bouts.length}</b>
              </div>
              <div className="picks-control-progress__track" aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

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
                <div><strong>LIVE FIGHT ORDER</strong><span>Move locally, then approve once.</span></div>
                <button className="primary-action" type="button" disabled={!draftOrder || Boolean(busyAction)} onClick={approveOrder}>
                  {busyAction === "reorder" ? "APPROVING…" : "APPROVE NEW ORDER"}
                </button>
              </div>
              {displayedBouts.map((bout, index) => {
                const saving = busyAction === `card:${bout.boutId}`;
                const isCancelled = bout.resultStatus === "cancelled";
                return (
                  <article className="surface-card pick-control-bout" key={bout.boutId}>
                    <div className="pick-control-bout__heading">
                      <div>
                        <span>{index === 0 ? "MAIN EVENT" : `MAIN CARD · FIGHT ${index + 1}`}</span>
                        <small>{bout.weightClass}</small>
                      </div>
                      <em className={`pick-control-bout__state pick-control-bout__state--${bout.resultStatus}`}>
                        {saving ? "SAVING…" : pickControlResultLabel(bout)}
                      </em>
                    </div>
                    <div className="pick-control-move" aria-label={`Move ${bout.redFighterName} vs. ${bout.blueFighterName}`}>
                      <button type="button" disabled={index === 0 || Boolean(busyAction)} onClick={() => moveBout(index, -1)}>MOVE UP</button>
                      <button type="button" disabled={index === displayedBouts.length - 1 || Boolean(busyAction)} onClick={() => moveBout(index, 1)}>MOVE DOWN</button>
                    </div>
                    <div className="pick-control-winners">
                      <div><span>RED CORNER</span><strong>{bout.redFighterName}</strong></div>
                      <span>VS</span>
                      <div><span>BLUE CORNER</span><strong>{bout.blueFighterName}</strong></div>
                    </div>
                    <p>
                      {isCancelled
                        ? "Original picks are preserved. This fight is excluded from scoring and cannot receive new picks."
                        : "Cancel only after confirming the fight is off the pickable UFC card."}
                    </p>
                    {bout.hasReplacementHistory ? (
                      <p className="pick-control-replacement-history"><strong>REPLACEMENT HISTORY EXISTS</strong> · The matchup above is currently live.</p>
                    ) : null}
                    {!isCancelled ? (
                      <button
                        className="secondary-action"
                        type="button"
                        disabled={Boolean(busyAction) || !bout.canReplace}
                        onClick={() => replaceFighter(bout)}
                      >
                        {busyAction === `replace:${bout.boutId}` ? "REPLACING…" : "REPLACE FIGHTER"}
                      </button>
                    ) : null}
                    <button
                      className={isCancelled ? "secondary-action" : "pick-control-clear"}
                      type="button"
                      disabled={Boolean(busyAction) || (isCancelled ? !bout.canRestore : !bout.canCancel)}
                      onClick={() => setCancellation(bout, !isCancelled)}
                    >
                      {isCancelled ? "RESTORE FIGHT" : "CANCEL FIGHT"}
                    </button>
                  </article>
                );
              })}
            </section>
          ) : null}

          {event.status === "locked" ? (
            <section className="picks-control-bouts" aria-label={`${event.name} official results`}>
              {orderedBouts.map((bout, index) => {
                const saving = busyAction === `bout:${bout.boutId}`;
                return (
                  <article className="surface-card pick-control-bout" key={bout.boutId}>
                    <div className="pick-control-bout__heading">
                      <div>
                        <span>{index === 0 ? "MAIN EVENT" : `MAIN CARD · FIGHT ${index + 1}`}</span>
                        <small>{bout.weightClass}</small>
                      </div>
                      <em className={`pick-control-bout__state pick-control-bout__state--${bout.resultStatus}`}>
                        {saving ? "SAVING…" : pickControlResultLabel(bout)}
                      </em>
                    </div>

                    <div className="pick-control-winners">
                      <button
                        className={resultButtonClass(bout.resultStatus === "red_win")}
                        type="button"
                        disabled={Boolean(busyAction)}
                        aria-pressed={bout.resultStatus === "red_win"}
                        aria-label={`RED WINNER ${bout.redFighterName}`}
                        onClick={() => recordResult(bout, "red_win")}
                      >
                        <span>RED WINNER</span>
                        <strong>{bout.redFighterName}</strong>
                      </button>
                      <span>VS</span>
                      <button
                        className={resultButtonClass(bout.resultStatus === "blue_win")}
                        type="button"
                        disabled={Boolean(busyAction)}
                        aria-pressed={bout.resultStatus === "blue_win"}
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
                          className={resultButtonClass(bout.resultStatus === option.value)}
                          type="button"
                          key={option.value}
                          disabled={Boolean(busyAction)}
                          aria-pressed={bout.resultStatus === option.value}
                          onClick={() => recordResult(bout, option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {bout.resultStatus !== "pending" ? (
                      <button
                        className="pick-control-clear"
                        type="button"
                        disabled={Boolean(busyAction)}
                        onClick={() => clearResult(bout)}
                      >
                        CLEAR RESULT
                      </button>
                    ) : null}
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
                <p>Every fight must have a winner, draw, no contest, or cancellation before the recap can publish.</p>
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

          {error ? <p className="picks-error" role="status">{error}</p> : null}
        </>
      ) : null}
    </div>
  );
}
