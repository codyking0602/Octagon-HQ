import { useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  americanOddsLabel,
  mainCardFightLabel,
  pickEventPresentation,
  pickProgress,
  underdogBonusForOdds,
  underdogBonusTiers,
  type PickBout,
  type PickBoutResultStatus,
} from "./picksModel";
import { usePicks } from "./PicksProvider";
import { FighterThumbnail } from "./FighterThumbnail";
import { GroupPickProgress } from "./GroupPickProgress";
import { GroupPickReveal } from "./GroupPickReveal";
import { MainEventSpotlight } from "./MainEventSpotlight";
import { pickEventPoster } from "./picksEventAssets";
import { PicksSeasonHub } from "./PicksSeasonHub";

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

function fighterOdds(bout: PickBout | null, slug: string | null) {
  if (!bout || !slug) return null;
  if (slug === bout.redFighterSlug) return bout.redAmericanOdds;
  if (slug === bout.blueFighterSlug) return bout.blueAmericanOdds;
  return null;
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
  const underdogLockBout = picks.underdogLock
    ? orderedBouts.find((bout) => bout.boutId === picks.underdogLock?.boutId) ?? null
    : null;
  const underdogLockOdds = picks.underdogLock?.frozenAmericanOdds
    ?? fighterOdds(underdogLockBout, picks.underdogLock?.fighterSlug ?? null);
  const underdogLockBonus = underdogBonusForOdds(underdogLockOdds);
  const underdogLockBonusLabel = underdogLockBonus > 0 ? `+${underdogLockBonus}` : null;
  const cardOddsMeta = orderedBouts
    .map((bout) => oddsProvenance(bout.oddsSource, bout.oddsUpdatedAt))
    .find(Boolean) ?? null;
  const eventPoster = pickEventPoster(activeEvent);
  const heroStyle = eventPoster
    ? ({
        "--picks-event-poster": `url("${eventPoster.src}")`,
        "--picks-event-poster-aspect": eventPoster.aspectRatio,
      } as CSSProperties)
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
          {identity.profile?.canManagePicks ? (
            <div className="picks-owner-empty-entry">
              <small>WEEKLY OWNER FLOW</small>
              <span>Stage → sync → review → publish → monitor → lock/results.</span>
              <Link className="primary-action picks-owner-empty-entry__action" to="/picks/control#setup">
                STAGE NEXT UFC EVENT
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeEvent && activeLifecycle ? (
        <>
          <section
            className={`surface-card picks-event-hero${eventPoster ? " has-poster" : ""}`}
            aria-labelledby="picks-event-title"
            style={heroStyle}
          >
            <div className="picks-event-hero__poster" aria-hidden="true">
              {activeLifecycle.state !== "upcoming" ? (
                <div className="picks-event-hero__topline">
                  <p className="eyebrow">{activeLifecycle.eyebrow}</p>
                  <span className={`picks-status picks-status--${activeLifecycle.state.replace("_", "-")}`}>
                    {activeLifecycle.status}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="picks-event-hero__content">
              <div className="picks-event-hero__copy">
                <h2 id="picks-event-title">{activeEvent.name}</h2>
                <strong>{activeEvent.subtitle}</strong>
              </div>

              <div className="picks-event-hero__facts" aria-label="Event details">
                <span>{eventDate(activeEvent.startsAt)}</span>
                <span>{activeEvent.venue} · {activeEvent.location}</span>
                <span>MAIN CARD ONLY</span>
                <span>{progress.total} FIGHTS</span>
              </div>

              <div className="picks-progress" aria-label={`${progress.completed} of ${progress.total} picks completed`}>
                <div><span>YOUR PICKS</span><b>{progress.completed} OF {progress.total}</b></div>
                <div className={completeProgress ? "picks-progress__track is-complete" : "picks-progress__track"} aria-hidden="true">
                  <span style={{ width: `${percent}%` }} />
                </div>
                <p>
                  UNDERDOG LOCK · {underdogLockName}
                  {underdogLockBonusLabel ? ` · ${underdogLockBonusLabel} IF CORRECT` : ""}
                </p>
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
                      MANAGE EVENT ›
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </section>

          {identity.profile ? (
            <GroupPickProgress event={activeEvent} locked={locked} mySelections={picks.selections} />
          ) : null}

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
              {cardOddsMeta ? (
                <p className="picks-card-odds" aria-label="Sportsbook odds source">
                  <strong>{cardOddsMeta}</strong>
                </p>
              ) : null}

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
                  const selectedLockOdds = lockSelected
                    ? picks.underdogLock?.frozenAmericanOdds ?? selectedOdds
                    : selectedOdds;
                  const selectedLockBonus = underdogBonusForOdds(selectedLockOdds);
                  const selectedLockBonusLabel = selectedLockBonus > 0 ? `+${selectedLockBonus}` : null;
                  const cancelled = (bout.resultStatus ?? "pending") === "cancelled";
                  const repickRequired = Boolean(!removed && bout.repickRequired && !selection);
                  const resolved = removed || (bout.resultStatus ?? "pending") !== "pending";
                  const readOnly = locked || cancelled || removed;
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
                          <div className="pick-lock-readonly" aria-label="Selected Underdog Lock">
                            ★ UNDERDOG LOCK{selectedLockBonusLabel ? ` · ${selectedLockBonusLabel}` : ""}
                          </div>
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
                            {lockSelected
                              ? `★ UNDERDOG LOCK${selectedLockBonusLabel ? ` · ${selectedLockBonusLabel}` : ""} · REMOVE`
                              : `☆ LOCK FOR ${selectedLockBonusLabel ?? "BONUS"}`}
                          </button>
                        </div>
                      ) : null}
                      {index === 0 ? <MainEventSpotlight bout={bout} /> : null}
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

      {identity.profile ? <PicksSeasonHub history={picks.history} loading={picks.loading} /> : null}
    </div>
  );
}
