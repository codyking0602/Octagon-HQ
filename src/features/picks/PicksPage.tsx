import { useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  americanOddsLabel,
  groupRankLabel,
  mainCardFightLabel,
  pickEventPresentation,
  pickProgress,
  underdogBonusTiers,
  type PickBoutResultStatus,
  type PickHistoryBout,
  type PickHistoryEvent,
  type PickHistoryRecord,
} from "./picksModel";
import { usePicks } from "./PicksProvider";
import { FighterThumbnail } from "./FighterThumbnail";
import { GroupPickReveal } from "./GroupPickReveal";

interface BoutResultView {
  redFighterSlug: string;
  redFighterName: string;
  blueFighterSlug: string;
  blueFighterName: string;
  resultStatus?: PickBoutResultStatus;
  winnerFighterSlug: string | null;
  includedInPicks?: boolean;
}

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

function oddsProvenance(source?: string | null, updatedAt?: string | null) {
  if (!source || !updatedAt || !Number.isFinite(Date.parse(updatedAt))) return null;
  const updated = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(updatedAt));
  return `${source} · UPDATED ${updated}`;
}

function fighterName(bout: BoutResultView, slug: string | null) {
  if (!slug) return "No pick";
  if (slug === bout.redFighterSlug) return bout.redFighterName;
  if (slug === bout.blueFighterSlug) return bout.blueFighterName;
  return "Unknown fighter";
}

function officialResult(bout: BoutResultView) {
  if (bout.includedInPicks === false) return "Removed from Picks";
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
  return details.length ? details.join(" · ") : null;
}

function choiceLabel(selected: boolean, locked: boolean, cancelled: boolean, removed: boolean) {
  if (selected) return "YOUR PICK";
  if (removed) return "REMOVED FROM PICKS";
  if (cancelled) return "FIGHT CANCELLED";
  return locked ? "NOT PICKED" : null;
}

function choiceClassName(selected: boolean, readOnly: boolean) {
  return ["pick-choice", selected ? "is-selected" : "", readOnly ? "is-read-only" : ""]
    .filter(Boolean)
    .join(" ");
}

function savedPickLabel(completed: number) {
  return `${completed} ${completed === 1 ? "PICK" : "PICKS"} SAVED`;
}

function EventRecap({ event, latest }: { event: PickHistoryEvent; latest: boolean }) {
  const orderedBouts = event.bouts.slice().sort((left, right) => left.position - right.position);
  const currentResult = event.groupResults.find((result) => result.isCurrentUser) ?? null;
  const finish = currentResult
    ? `${groupRankLabel(currentResult.rank, event.groupResults)} OF ${event.groupResults.length}`
    : null;
  const note = recordNote(event.record);

  return (
    <details className="surface-card picks-recap-card">
      <summary className="picks-recap-card__summary">
        <div>
          <div className="picks-recap-card__date">
            {latest ? <span className="picks-recap-card__latest">LATEST</span> : null}
            <time dateTime={event.completedAt}>{completedDate(event.completedAt)}</time>
          </div>
          <h3>{event.name}</h3>
          <p>{event.subtitle}</p>
        </div>
        <div
          className="picks-recap-card__record"
          aria-label={finish
            ? `Your event finish ${finish}. ${event.record.correct} wins and ${event.record.incorrect} losses.`
            : `${event.record.correct} wins and ${event.record.incorrect} losses`}
        >
          <strong>{finish ?? `${event.record.correct}-${event.record.incorrect}`}</strong>
          <small>{event.record.correct}-{event.record.incorrect} · {event.record.totalPoints} PTS</small>
          {note ? <em>{note}</em> : null}
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
            {event.groupResults.map((result) => (
              <div
                className={result.isCurrentUser ? "picks-group-result is-current-user" : "picks-group-result"}
                key={result.displayName}
              >
                <span>{groupRankLabel(result.rank, event.groupResults)}</span>
                <strong>{result.displayName}</strong>
                <div>
                  <b>{result.totalPoints} PTS</b>
                  <small>{result.correct}-{result.incorrect} · +{result.lockBonus} lock</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="picks-recap-points" aria-label="Your scoring totals">
          <div><span>RECORD</span><strong>{event.record.correct}-{event.record.incorrect}</strong></div>
          <div><span>BASE</span><strong>{event.record.basePoints}</strong></div>
          <div><span>LOCK</span><strong>+{event.record.lockBonus}</strong></div>
          <div><span>TOTAL</span><strong>{event.record.totalPoints}</strong></div>
        </section>

        <details className="picks-recap-fights">
          <summary>
            <span>VIEW FIGHT-BY-FIGHT RESULTS</span>
            <small>{orderedBouts.length} FIGHTS · {completedDate(event.completedAt)}</small>
          </summary>
          <div className="picks-recap-fight-list">
            {orderedBouts.map((bout, index) => {
              const removed = bout.includedInPicks === false;
              return (
                <article className="picks-recap-fight" key={bout.boutId}>
                  <div className="picks-recap-fight__topline">
                    <span>{mainCardFightLabel(index)}</span>
                    <small>{bout.weightClass}</small>
                  </div>
                  <div className="picks-recap-fight__matchup">
                    <strong>{bout.redFighterName}</strong>
                    <span>VS</span>
                    <strong>{bout.blueFighterName}</strong>
                  </div>
                  <div className="picks-recap-fight__result">
                    <div><span>{removed ? "PICKS STATUS" : "OFFICIAL"}</span><b>{officialResult(bout)}</b></div>
                    <div><span>YOUR PICK</span><b>{fighterName(bout, bout.pickedFighterSlug)}</b></div>
                    <em className={`picks-verdict picks-verdict--${bout.verdict}`}>
                      {removed ? "Excluded from scoring" : verdictLabel(bout.verdict)}
                    </em>
                  </div>
                  <GroupPickReveal
                    redFighterSlug={bout.redFighterSlug}
                    redFighterName={bout.redFighterName}
                    blueFighterSlug={bout.blueFighterSlug}
                    blueFighterName={bout.blueFighterName}
                    picks={bout.groupPicks ?? []}
                  />
                </article>
              );
            })}
          </div>
        </details>
      </div>
    </details>
  );
}

export default function PicksPage() {
  const identity = useIdentity();
  const picks = usePicks();
  const event = picks.event;
  const lifecycle = event ? pickEventPresentation(event) : null;
  const activeEvent = lifecycle?.state === "complete" ? null : event;
  const activeLifecycle = activeEvent ? lifecycle : null;
  const progress = pickProgress(activeEvent, picks.selections);
  const locked = activeLifecycle ? activeLifecycle.state !== "upcoming" : false;
  const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;
  const completeProgress = progress.total > 0 && progress.completed === progress.total;
  const orderedBouts = useMemo(
    () => activeEvent?.bouts.slice().sort((left, right) => left.position - right.position) ?? [],
    [activeEvent],
  );
  const underdogLockName = picks.underdogLock
    ? orderedBouts.flatMap((bout) => [
        [bout.redFighterSlug, bout.redFighterName],
        [bout.blueFighterSlug, bout.blueFighterName],
      ]).find(([slug]) => slug === picks.underdogLock?.fighterSlug)?.[1] ?? picks.underdogLock.fighterSlug
    : "NONE SELECTED";
  const eventPoster = activeEvent
    && activeEvent.location.toLowerCase().includes("belgrade")
    && activeEvent.subtitle.toLowerCase().includes("rodriguez")
      ? "/events/ufc-fight-night-belgrade.svg"
      : null;
  const heroStyle = eventPoster
    ? ({ "--picks-event-poster": `url("${eventPoster}")` } as CSSProperties)
    : undefined;

  return (
    <div className="page picks-page">
      <section className="page-heading picks-page-heading">
        <p className="eyebrow">EVENT PICKS</p>
        <h1>Call the fights</h1>
        <p>Pick every matchup before the card locks.</p>
      </section>

      {picks.loading && !activeEvent ? (
        <section className="surface-card picks-state-card" aria-live="polite">
          <strong>Loading the next UFC event…</strong>
        </section>
      ) : null}

      {!picks.loading && !activeEvent ? (
        <section className="surface-card picks-state-card">
          <p className="eyebrow">NO ACTIVE CARD</p>
          <h2>The next Picks card is being prepared.</h2>
          <p>{picks.error || "Check back when the next UFC main card is ready."}</p>
        </section>
      ) : null}

      {activeEvent && activeLifecycle ? (
        <>
          <section
            className={`surface-card picks-event-hero${eventPoster ? " has-poster" : ""}`}
            aria-labelledby="picks-event-title"
            style={heroStyle}
          >
            <div className="picks-event-hero__topline">
              <p className="eyebrow">{activeLifecycle.eyebrow}</p>
              <span className={`picks-status picks-status--${activeLifecycle.state.replace("_", "-")}`}>
                {activeLifecycle.status}
              </span>
            </div>
            <div className="picks-event-hero__copy">
              <h2 id="picks-event-title">{activeEvent.name}</h2>
              <strong>{activeEvent.subtitle}</strong>
              <p>{eventDate(activeEvent.startsAt)} · {activeEvent.venue} · {activeEvent.location}</p>
            </div>

            <div className="picks-event-hero__dashboard">
              <div className="picks-progress" aria-label={`${progress.completed} of ${progress.total} picks completed`}>
                <div><span>YOUR PICKS</span><b>{progress.completed} OF {progress.total}</b></div>
                <div className={completeProgress ? "picks-progress__track is-complete" : "picks-progress__track"} aria-hidden="true">
                  <span style={{ width: `${percent}%` }} />
                </div>
                <p>UNDERDOG LOCK · {underdogLockName}</p>
              </div>

              {!identity.profile ? (
                <button className="primary-action" type="button" onClick={identity.openDialog}>
                  SIGN IN TO MAKE PICKS
                </button>
              ) : (
                <div className="picks-event-hero__actions">
                  <p className="picks-save-state">
                    <span aria-hidden="true">✓</span>
                    {activeLifecycle.state === "awaiting_results"
                      ? "EVENT UNDERWAY"
                      : locked
                        ? "PICKS LOCKED"
                        : savedPickLabel(progress.completed)}
                  </p>
                  {activeEvent.canControl ? (
                    <Link className="picks-control-entry" to="/picks/control">
                      MANAGE EVENT
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </section>

          <details className="surface-card picks-scoring-guide">
            <summary>SCORING &amp; UNDERDOG LOCK RULES</summary>
            <p><strong>Correct pick +4</strong><span>Incorrect and missing picks score 0. Draws, no contests, cancellations, and fights removed from Picks are excluded.</span></p>
            <p><strong>Underdog Lock bonus by odds</strong><span>Choose one fighter at +100 or longer. A winning lock adds the frozen lock-time bonus below.</span></p>
            <div className="picks-scoring-tiers" aria-label="Underdog Lock bonus tiers">
              {underdogBonusTiers.map((tier) => (
                <span key={tier.odds}><b>{tier.odds}</b><em>{tier.bonus}</em></span>
              ))}
            </div>
          </details>

          {identity.profile ? (
            <section className="picks-card-zone">
              <div className="picks-sticky-progress" aria-label="Current Picks progress">
                <strong>{activeEvent.name}</strong>
                <span>{progress.completed}/{progress.total} PICKS</span>
                <em>LOCK · {underdogLockName}</em>
              </div>

              <section className="picks-card-list" aria-label={`${activeEvent.name} fight picks`}>
                {orderedBouts.map((bout, index) => {
                  const selection = picks.selections[bout.boutId] ?? null;
                  const saving = picks.savingBoutId === bout.boutId;
                  const removed = bout.includedInPicks === false;
                  const redOdds = removed ? null : americanOddsLabel(bout.redAmericanOdds);
                  const blueOdds = removed ? null : americanOddsLabel(bout.blueAmericanOdds);
                  const favorite = !removed && bout.redAmericanOdds !== null && bout.blueAmericanOdds !== null
                    ? (bout.redAmericanOdds < bout.blueAmericanOdds ? "red" : bout.blueAmericanOdds < bout.redAmericanOdds ? "blue" : null)
                    : null;
                  const selectedOdds = selection === bout.redFighterSlug
                    ? bout.redAmericanOdds
                    : selection === bout.blueFighterSlug
                      ? bout.blueAmericanOdds
                      : null;
                  const lockSelected = picks.underdogLock?.boutId === bout.boutId;
                  const cancelled = (bout.resultStatus ?? "pending") === "cancelled";
                  const repickRequired = Boolean(!removed && bout.repickRequired && !selection);
                  const resolved = removed || (bout.resultStatus ?? "pending") !== "pending";
                  const readOnly = locked || cancelled || removed;
                  const oddsMeta = removed ? null : oddsProvenance(bout.oddsSource, bout.oddsUpdatedAt);
                  const selectedCorner = selection === bout.redFighterSlug
                    ? "red"
                    : selection === bout.blueFighterSlug
                      ? "blue"
                      : null;
                  const redChoiceLabel = choiceLabel(selection === bout.redFighterSlug, locked, cancelled, removed);
                  const blueChoiceLabel = choiceLabel(selection === bout.blueFighterSlug, locked, cancelled, removed);
                  return (
                    <article
                      className={`surface-card pick-bout-card${index === 0 ? " is-main-event" : ""}${cancelled || removed ? " is-cancelled" : ""}${removed ? " is-removed" : ""}${repickRequired ? " is-repick-required" : ""}`}
                      key={bout.boutId}
                    >
                      <header className="pick-bout-card__meta">
                        <div className="pick-bout-card__heading">
                          <span>{mainCardFightLabel(index)}</span>
                          <small>{bout.weightClass}</small>
                        </div>
                        {oddsMeta ? <p aria-label="Sportsbook odds source">{oddsMeta}</p> : null}
                      </header>
                      {repickRequired ? (
                        <div className="pick-bout-card__repick" role="status">
                          <strong>REPICK REQUIRED</strong>
                          <span>The matchup changed. Pick either current fighter again; your previous pick and Underdog Lock are no longer active.</span>
                        </div>
                      ) : null}
                      <div className="pick-bout-card__choices">
                        <button
                          type="button"
                          className={choiceClassName(selection === bout.redFighterSlug, readOnly)}
                          aria-pressed={selection === bout.redFighterSlug}
                          disabled={readOnly || Boolean(picks.savingBoutId)}
                          onClick={() => void picks.setPick(bout.boutId, bout.redFighterSlug)}
                        >
                          <FighterThumbnail name={bout.redFighterName} slug={bout.redFighterSlug} />
                          <span>{bout.redFighterName}</span>
                          <small>{removed ? "NOT ACTIVE" : `${redOdds ?? "ODDS TBD"}${favorite === "red" ? " · FAVORITE" : ""}`}</small>
                          {redChoiceLabel ? <em>{redChoiceLabel}</em> : null}
                        </button>
                        <span className="pick-bout-card__versus">VS</span>
                        <button
                          type="button"
                          className={choiceClassName(selection === bout.blueFighterSlug, readOnly)}
                          aria-pressed={selection === bout.blueFighterSlug}
                          disabled={readOnly || Boolean(picks.savingBoutId)}
                          onClick={() => void picks.setPick(bout.boutId, bout.blueFighterSlug)}
                        >
                          <FighterThumbnail name={bout.blueFighterName} slug={bout.blueFighterSlug} />
                          <span>{bout.blueFighterName}</span>
                          <small>{removed ? "NOT ACTIVE" : `${blueOdds ?? "ODDS TBD"}${favorite === "blue" ? " · FAVORITE" : ""}`}</small>
                          {blueChoiceLabel ? <em>{blueChoiceLabel}</em> : null}
                        </button>
                      </div>
                      {removed ? (
                        <div className="pick-bout-card__official">
                          <span>PICKS STATUS</span>
                          <strong>REMOVED FROM PICKS · EXCLUDED FROM SCORING</strong>
                        </div>
                      ) : cancelled ? (
                        <div className="pick-bout-card__official">
                          <span>FIGHT STATUS</span>
                          <strong>CANCELLED · EXCLUDED FROM SCORING</strong>
                        </div>
                      ) : resolved ? (
                        <div className="pick-bout-card__official">
                          <span>OFFICIAL RESULT</span>
                          <strong>{officialResult(bout)}</strong>
                        </div>
                      ) : null}
                      {!removed && !cancelled && locked && lockSelected ? (
                        <div className={`pick-lock-row is-${selectedCorner ?? "red"}`}>
                          <div className="pick-lock-readonly" aria-label="Selected Underdog Lock">★ UNDERDOG LOCK</div>
                        </div>
                      ) : !removed && !cancelled && !locked && selection && (selectedOdds ?? 0) > 0 ? (
                        <div className={`pick-lock-row is-${selectedCorner ?? "red"}`}>
                          <button
                            className={lockSelected ? "pick-lock-action is-selected" : "pick-lock-action"}
                            type="button"
                            disabled={picks.savingLock}
                            aria-pressed={lockSelected}
                            onClick={() => lockSelected
                              ? void picks.clearUnderdogLock()
                              : void picks.setUnderdogLock(bout.boutId, selection)}
                          >
                            {lockSelected ? "★ UNDERDOG LOCK · REMOVE" : "☆ MAKE UNDERDOG LOCK"}
                          </button>
                        </div>
                      ) : null}
                      {saving ? <p className="pick-bout-card__saving" role="status">SAVING PICK…</p> : null}
                      <GroupPickReveal
                        redFighterSlug={bout.redFighterSlug}
                        redFighterName={bout.redFighterName}
                        blueFighterSlug={bout.blueFighterSlug}
                        blueFighterName={bout.blueFighterName}
                        picks={bout.groupPicks ?? []}
                      />
                    </article>
                  );
                })}
              </section>
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
              <h2 id="picks-history-title">Your event archive</h2>
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
                  <div><dt>BASE</dt><dd>{picks.history.summary.basePoints}</dd></div>
                  <div><dt>LOCK</dt><dd>+{picks.history.summary.lockBonus}</dd></div>
                  <div><dt>TOTAL</dt><dd>{picks.history.summary.totalPoints}</dd></div>
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
