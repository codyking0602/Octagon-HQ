import { useMemo } from "react";
import { useIdentity } from "../identity/IdentityProvider";
import {
  eventPicksLocked,
  pickProgress,
  type PickHistoryBout,
  type PickHistoryEvent,
  type PickHistoryRecord,
} from "./picksModel";
import { usePicks } from "./PicksProvider";

function eventDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function completedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function fighterName(bout: PickHistoryBout, slug: string | null) {
  if (!slug) return "No pick";
  if (slug === bout.redFighterSlug) return bout.redFighterName;
  if (slug === bout.blueFighterSlug) return bout.blueFighterName;
  return "Unknown fighter";
}

function officialResult(bout: PickHistoryBout) {
  if (bout.resultStatus === "red_win" || bout.resultStatus === "blue_win") {
    return fighterName(bout, bout.winnerFighterSlug);
  }
  if (bout.resultStatus === "draw") return "Draw";
  if (bout.resultStatus === "no_contest") return "No contest";
  if (bout.resultStatus === "cancelled") return "Cancelled";
  return "Pending";
}

function verdictLabel(verdict: PickHistoryBout["verdict"]) {
  if (verdict === "correct") return "Correct";
  if (verdict === "incorrect") return "Incorrect";
  if (verdict === "missing") return "No pick";
  if (verdict === "excluded") return "Excluded";
  return "Pending";
}

function recordNote(record: PickHistoryRecord) {
  const details = [];
  if (record.missing) details.push(`${record.missing} missing`);
  if (record.excluded) details.push(`${record.excluded} excluded`);
  return details.length ? details.join(" · ") : "All eligible fights scored";
}

function EventRecap({ event, latest }: { event: PickHistoryEvent; latest: boolean }) {
  const orderedBouts = event.bouts.slice().sort((left, right) => left.position - right.position);

  return (
    <details className="surface-card picks-recap-card" open={latest}>
      <summary className="picks-recap-card__summary">
        <div>
          <span>{latest ? "LATEST RECAP" : completedDate(event.completedAt)}</span>
          <h3>{event.name}</h3>
          <p>{event.subtitle}</p>
        </div>
        <div className="picks-recap-card__record" aria-label={`${event.record.correct} wins and ${event.record.incorrect} losses`}>
          <strong>{event.record.correct}-{event.record.incorrect}</strong>
          <small>{recordNote(event.record)}</small>
        </div>
      </summary>

      <div className="picks-recap-card__body">
        <section className="picks-recap-group" aria-labelledby={`group-results-${event.eventId}`}>
          <div className="picks-recap-section-heading">
            <div>
              <span>GROUP RESULTS</span>
              <h4 id={`group-results-${event.eventId}`}>How everyone did</h4>
            </div>
            <small>{event.groupResults.length} ENTERED</small>
          </div>
          <div className="picks-group-results">
            {event.groupResults.map((result, index) => (
              <div
                className={result.isCurrentUser ? "picks-group-result is-current-user" : "picks-group-result"}
                key={result.displayName}
              >
                <span>{index + 1}</span>
                <strong>{result.displayName}</strong>
                <div>
                  <b>{result.correct}-{result.incorrect}</b>
                  <small>{recordNote(result)}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="picks-recap-fights" aria-labelledby={`your-results-${event.eventId}`}>
          <div className="picks-recap-section-heading">
            <div>
              <span>YOUR CARD</span>
              <h4 id={`your-results-${event.eventId}`}>Fight by fight</h4>
            </div>
            <small>{completedDate(event.completedAt)}</small>
          </div>
          <div className="picks-recap-fight-list">
            {orderedBouts.map((bout) => (
              <article className="picks-recap-fight" key={bout.boutId}>
                <div className="picks-recap-fight__topline">
                  <span>{bout.position === 1 ? "MAIN EVENT" : `FIGHT ${bout.position}`}</span>
                  <small>{bout.weightClass}</small>
                </div>
                <div className="picks-recap-fight__matchup">
                  <strong>{bout.redFighterName}</strong>
                  <span>VS</span>
                  <strong>{bout.blueFighterName}</strong>
                </div>
                <div className="picks-recap-fight__result">
                  <div><span>OFFICIAL</span><b>{officialResult(bout)}</b></div>
                  <div><span>YOUR PICK</span><b>{fighterName(bout, bout.pickedFighterSlug)}</b></div>
                  <em className={`picks-verdict picks-verdict--${bout.verdict}`}>{verdictLabel(bout.verdict)}</em>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </details>
  );
}

export default function PicksPage() {
  const identity = useIdentity();
  const picks = usePicks();
  const event = picks.event;
  const progress = pickProgress(event, picks.selections);
  const locked = event ? eventPicksLocked(event) : false;
  const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
  const orderedBouts = useMemo(
    () => event?.bouts.slice().sort((left, right) => left.position - right.position) ?? [],
    [event],
  );

  return (
    <div className="page picks-page">
      <section className="page-heading">
        <p className="eyebrow">EVENT PICKS</p>
        <h1>Call the fights</h1>
        <p>Make your picks before the main card begins. Every choice saves to your Octagon HQ profile.</p>
      </section>

      {picks.loading && !event ? (
        <section className="surface-card picks-state-card" aria-live="polite">
          <strong>Loading the next UFC event…</strong>
        </section>
      ) : null}

      {!picks.loading && !event ? (
        <section className="surface-card picks-state-card">
          <p className="eyebrow">NO ACTIVE CARD</p>
          <h2>The next Picks card is being prepared.</h2>
          <p>{picks.error || "Check back when the next UFC main card is ready."}</p>
        </section>
      ) : null}

      {event ? (
        <>
          <section className="surface-card picks-event-hero" aria-labelledby="picks-event-title">
            <div className="picks-event-hero__topline">
              <p className="eyebrow">NEXT UFC EVENT</p>
              <span className={`picks-status picks-status--${locked ? "locked" : "upcoming"}`}>
                {locked ? "LOCKED" : "UPCOMING"}
              </span>
            </div>
            <h2 id="picks-event-title">{event.name}</h2>
            <strong>{event.subtitle}</strong>
            <p>{eventDate(event.startsAt)} · {event.venue} · {event.location}</p>

            <div className="picks-progress" aria-label={`${progress.completed} of ${progress.total} picks completed`}>
              <div><span>YOUR PICKS</span><b>{progress.completed} OF {progress.total}</b></div>
              <div className="picks-progress__track" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
            </div>

            {!identity.profile ? (
              <button className="primary-action" type="button" onClick={identity.openDialog}>
                SIGN IN TO MAKE PICKS
              </button>
            ) : (
              <p className="picks-event-hero__save-note">
                {locked
                  ? "Picks are locked for this event."
                  : progress.completed === progress.total
                    ? `ALL ${progress.total} PICKS SAVED TO ${identity.profile.displayName}`
                    : `EACH PICK SAVES TO ${identity.profile.displayName}`}
              </p>
            )}
          </section>

          {identity.profile ? (
            <section className="picks-card-list" aria-label={`${event.name} fight picks`}>
              {orderedBouts.map((bout) => {
                const selection = picks.selections[bout.boutId] ?? null;
                const saving = picks.savingBoutId === bout.boutId;
                return (
                  <article className="surface-card pick-bout-card" key={bout.boutId}>
                    <div className="pick-bout-card__heading">
                      <span>{bout.position === 1 ? "MAIN EVENT" : `MAIN CARD · FIGHT ${bout.position}`}</span>
                      <small>{bout.weightClass}</small>
                    </div>
                    <div className="pick-bout-card__choices">
                      <button
                        type="button"
                        className={selection === bout.redFighterSlug ? "pick-choice is-selected" : "pick-choice"}
                        aria-pressed={selection === bout.redFighterSlug}
                        disabled={locked || Boolean(picks.savingBoutId)}
                        onClick={() => void picks.setPick(bout.boutId, bout.redFighterSlug)}
                      >
                        <span>{bout.redFighterName}</span>
                        <small>{selection === bout.redFighterSlug ? "YOUR PICK" : "PICK FIGHTER"}</small>
                      </button>
                      <span className="pick-bout-card__versus">VS</span>
                      <button
                        type="button"
                        className={selection === bout.blueFighterSlug ? "pick-choice is-selected" : "pick-choice"}
                        aria-pressed={selection === bout.blueFighterSlug}
                        disabled={locked || Boolean(picks.savingBoutId)}
                        onClick={() => void picks.setPick(bout.boutId, bout.blueFighterSlug)}
                      >
                        <span>{bout.blueFighterName}</span>
                        <small>{selection === bout.blueFighterSlug ? "YOUR PICK" : "PICK FIGHTER"}</small>
                      </button>
                    </div>
                    {saving ? <p className="pick-bout-card__saving" role="status">SAVING PICK…</p> : null}
                  </article>
                );
              })}
            </section>
          ) : null}

          {picks.error ? <p className="picks-error" role="status">{picks.error}</p> : null}
        </>
      ) : null}

      {identity.profile ? (
        <section className="picks-history" aria-labelledby="picks-history-title">
          <div className="picks-history__heading">
            <div>
              <p className="eyebrow">COMPLETED EVENTS</p>
              <h2 id="picks-history-title">Your event recaps</h2>
            </div>
            <span>{picks.history.season ?? new Date().getFullYear()} SEASON</span>
          </div>

          {picks.loading && !picks.history.events.length ? (
            <section className="surface-card picks-state-card" aria-live="polite">
              <strong>Loading your event history…</strong>
            </section>
          ) : null}

          {!picks.loading && !picks.history.events.length ? (
            <section className="surface-card picks-history-empty">
              <strong>No completed event recaps yet.</strong>
              <p>Your first scored card will appear here after the event is completed.</p>
            </section>
          ) : null}

          {picks.history.events.length ? (
            <>
              <section className="surface-card picks-history-summary" aria-label="Season Picks recap">
                <div>
                  <span>SEASON RECORD</span>
                  <strong>{picks.history.summary.correct}-{picks.history.summary.incorrect}</strong>
                </div>
                <dl>
                  <div><dt>EVENTS</dt><dd>{picks.history.summary.eventsEntered}</dd></div>
                  <div><dt>MISSING</dt><dd>{picks.history.summary.missing}</dd></div>
                  <div><dt>EXCLUDED</dt><dd>{picks.history.summary.excluded}</dd></div>
                </dl>
              </section>

              <div className="picks-recap-list">
                {picks.history.events.map((completedEvent, index) => (
                  <EventRecap event={completedEvent} latest={index === 0} key={completedEvent.eventId} />
                ))}
              </div>
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
