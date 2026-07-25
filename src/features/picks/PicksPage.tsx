import { useMemo } from "react";
import { useIdentity } from "../identity/IdentityProvider";
import { eventPicksLocked, pickProgress } from "./picksModel";
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
    </div>
  );
}
