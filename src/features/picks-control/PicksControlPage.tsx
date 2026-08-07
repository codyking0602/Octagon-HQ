import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import type { PickBoutResultStatus } from "../picks/picksModel";
import {
  pickControlResultLabel,
  pickControlResultOptions,
  type PickControlBout,
  type PickControlEvent,
} from "./pickControlModel";
import {
  createPickControlRepository,
  type PickControlRepository,
} from "./pickControlRepository";
import OpenPicksDashboard from "./OpenPicksDashboard";

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
  now?: number;
}

export default function PicksControlPage({
  repository: suppliedRepository,
  now = Date.now(),
}: PicksControlPageProps) {
  const identity = useIdentity();
  const [repository] = useState<PickControlRepository | null>(() => (
    suppliedRepository === undefined ? createPickControlRepository() : suppliedRepository
  ));
  const [event, setEvent] = useState<PickControlEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadEvent = useCallback(async (eventId?: string) => {
    if (!repository || !identity.profile) return;
    setLoading(true);
    try {
      setEvent(await repository.loadControlEvent(eventId));
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
      setError("Fight Night Control is not connected on this build.");
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
  const resolved = orderedBouts.filter((bout) => bout.resultStatus !== "pending").length;
  const progress = orderedBouts.length ? Math.round((resolved / orderedBouts.length) * 100) : 0;

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
      setError(readableError(nextError));
    } finally {
      setBusyAction("");
    }
  }

  function recordResult(bout: PickControlBout, result: PickBoutResultStatus) {
    if (!event || event.status !== "locked" || bout.resultStatus !== "pending") return;
    const label = pickControlResultLabel({ ...bout, resultStatus: result });
    if (!window.confirm(
      `Are you sure you want to record ${label} as the official result for ${bout.redFighterName} vs. ${bout.blueFighterName}?`,
    )) return;
    void runAction(
      `bout:${bout.boutId}`,
      () => repository!.recordResult(event.eventId, bout.boutId, result),
      `${bout.redFighterName} vs. ${bout.blueFighterName} recorded as ${label}.`,
    );
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
    const nextLabel = pickControlResultLabel({ ...bout, resultStatus: nextResult });
    if (!window.confirm(
      `Are you sure you want to correct ${bout.redFighterName} vs. ${bout.blueFighterName} from ${pickControlResultLabel(bout)} to ${nextLabel}? Scoring, standings, season totals, and recaps will recalculate automatically.`,
    )) return;
    void runAction(
      `correct:${bout.boutId}`,
      () => repository!.correctResult(
        event.eventId,
        bout,
        nextResult,
        `Owner confirmed official result correction from ${pickControlResultLabel(bout)} to ${nextLabel}`,
      ),
      `${bout.redFighterName} vs. ${bout.blueFighterName} corrected to ${nextLabel}.`,
    );
  }

  function completeEvent() {
    if (!event || !event.canComplete) return;
    if (!window.confirm(
      "Are you sure you want to complete this event and publish the recap? Later official-result corrections remain available through the audited correction action.",
    )) return;
    void runAction("complete", () => repository!.completeEvent(event.eventId));
  }

  if (!identity.ready || loading) {
    return (
      <div className="page picks-control-page">
        <section className="surface-card picks-control-state" aria-live="polite">
          <strong>Loading Fight Night Control…</strong>
        </section>
      </div>
    );
  }

  if (!identity.profile) {
    return (
      <div className="page picks-control-page">
        <section className="surface-card picks-control-state">
          <p className="eyebrow">OWNER SIGN-IN REQUIRED</p>
          <h2>Sign in to open Fight Night Control.</h2>
          <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN</button>
        </section>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page picks-control-page">
        <section className="surface-card picks-control-state">
          <p className="eyebrow">{error ? "CONTROL UNAVAILABLE" : "NO PICKS EVENT"}</p>
          <h2>{error || "There is no published or completed card to control."}</h2>
          {!error ? <p>Sync and publish the next UFC card in Event Setup.</p> : null}
          <Link className="primary-action" to={error ? "/picks" : "/picks/setup"}>
            {error ? "BACK TO PICKS" : "OPEN EVENT SETUP"}
          </Link>
        </section>
      </div>
    );
  }

  if (event.status === "upcoming") {
    return <OpenPicksDashboard repository={repository} now={now} />;
  }

  return (
    <div className="page picks-control-page">
      <section className="page-heading picks-control-heading">
        <p className="eyebrow">PRIVATE OWNER TOOL</p>
        <h1>Fight Night Control</h1>
        <p>Enter official results and make audited corrections with confirmation only.</p>
        <div className="picks-control-heading__links">
          <Link to="/picks/monitoring">MONITORING INBOX</Link>
          <Link to="/picks/setup">EVENT SETUP</Link>
          <Link to="/picks">PLAYER PICKS</Link>
        </div>
      </section>

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
          aria-label={`${resolved} of ${orderedBouts.length} active fight results resolved`}
        >
          <div><span>OFFICIAL RESULTS</span><b>{resolved} OF {orderedBouts.length}</b></div>
          <div className="picks-control-progress__track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <section className="picks-control-bouts" aria-label={`${event.name} official results`}>
        {orderedBouts.map((bout, index) => {
          const saving = busyAction === `bout:${bout.boutId}` || busyAction === `correct:${bout.boutId}`;
          const isPending = bout.resultStatus === "pending";
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

              {isPending && event.status === "locked" ? (
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
                    <p className="pick-control-replacement-history"><strong>CORRECTION HISTORY EXISTS</strong> · Prior result states remain privately audited.</p>
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

      {event.status === "locked" ? (
        <section className="surface-card picks-control-complete">
          <div>
            <p className="eyebrow">FINAL STEP</p>
            <h2>Complete event</h2>
            <p>Every active fight must have a winner, draw, no contest, or cancellation before the recap can publish.</p>
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
      ) : (
        <section className="surface-card picks-control-complete">
          <div>
            <p className="eyebrow">EVENT COMPLETE</p>
            <h2>Recap published automatically</h2>
            <p>Confirmed corrections recalculate scoring, standings, season totals, and completed recaps without reopening Picks.</p>
          </div>
        </section>
      )}

      {notice ? <p className="picks-control-feedback picks-control-feedback--success" role="status">{notice}</p> : null}
      {error ? <p className="picks-error" role="status">{error}</p> : null}
    </div>
  );
}
