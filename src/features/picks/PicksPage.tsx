import { useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  americanOddsLabel,
  fightCardLabel,
  pickBoutLocked,
  pickEventPresentation,
  pickEventStartsAt,
  pickProgress,
  underdogBonusForOdds,
  underdogBonusTiers,
  type PickBout,
  type PickBoutResultStatus,
} from "./picksModel";
import { usePicks } from "./PicksProvider";
import { FighterThumbnail } from "./FighterThumbnail";
import { approvedUfcPicksHeadshot } from "./officialUfcPicksHeadshots";
import { GroupPickProgress } from "./GroupPickProgress";
import type { PickEventMemberProgress } from "./groupProgressModel";
import type { PickEvent } from "./picksModel";
import { GroupPickReveal } from "./GroupPickReveal";
import { MainEventSpotlight } from "./MainEventSpotlight";
import { pickEventPoster } from "./picksEventAssets";
import { reviewedMmaManiaPoster, reviewedOfficialUfcEventBanner } from "./ufcMmaManiaPoster";
import { UfcFighterIdentityBadges } from "./UfcFighterIdentityBadges";
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
  if (selected) return null;
  if (removed) return "REMOVED FROM PICKS";
  if (cancelled) return "FIGHT CANCELLED";
  return locked ? "NOT PICKED" : null;
}

function choiceClassName(selected: boolean, readOnly: boolean) {
  return ["pick-choice", selected ? "is-selected" : "", readOnly ? "is-read-only" : ""]
    .filter(Boolean)
    .join(" ");
}

function fighterNameStyle(name: string, isMainEvent: boolean): CSSProperties | undefined {
  if (isMainEvent || name.length <= 17) return undefined;
  return { minHeight: 31, WebkitLineClamp: 2 };
}

function savedPickLabel(completed: number) {
  return `${completed} ${completed === 1 ? "PICK" : "PICKS"} SAVED`;
}

/** Live group placement, based only on resolved picks. Underdog bonuses
 * remain explicit estimates until the server settles each member's frozen lock. */
function ufcLiveBoard(
  event: PickEvent,
  members: readonly PickEventMemberProgress[],
  selections: Readonly<Record<string,string>>,
  lock: {boutId:string;fighterSlug:string;frozenAmericanOdds:number|null}|null,
) {
  const resolved = event.bouts.filter(b => b.includedInPicks !== false && (b.resultStatus === "red_win" || b.resultStatus === "blue_win"));
  const eligible = members.filter(m => m.completed > 0);
  const rows = eligible.map(member => {
    let correct = 0, lockBonus = 0;
    for (const bout of resolved) {
      const selection = member.isCurrentUser
        ? selections[bout.boutId] ?? null
        : bout.groupPicks?.find(p => p.displayName === member.displayName)?.pickedFighterSlug ?? null;
      if (!selection || selection !== bout.winnerFighterSlug) continue;
      correct++;
      if (member.underdogLockBoutId === bout.boutId && member.underdogLockFighterSlug === selection) {
        const currentOdds = selection === bout.redFighterSlug ? bout.redAmericanOdds : bout.blueAmericanOdds;
        const odds = member.isCurrentUser && lock?.boutId === bout.boutId
          ? lock.frozenAmericanOdds ?? currentOdds : currentOdds;
        lockBonus += underdogBonusForOdds(odds);
      }
    }
    return {member, correct, estimatedPoints:correct * 4 + lockBonus};
  });
  rows.sort((a,b) => b.estimatedPoints-a.estimatedPoints || b.correct-a.correct);
  const current=rows.find(row => row.member.isCurrentUser);
  const rank=current ? rows.findIndex(row => row.estimatedPoints===current.estimatedPoints && row.correct===current.correct)+1 : 0;
  const tied = rank > 0 && rows.filter(row => row.estimatedPoints===current?.estimatedPoints && row.correct===current?.correct).length > 1;
  return {resolved:resolved.length,current,rank,tied,active:eligible.length};
}

export default function PicksPage() {
  const identity = useIdentity();
  const picks = usePicks();
  const event = picks.event;
  const lifecycle = event ? pickEventPresentation(event) : null;
  const activeEvent = lifecycle?.state === "complete" ? null : event;
  const activeLifecycle = activeEvent ? lifecycle : null;
  const progress = pickProgress(activeEvent, picks.selections);
  const liveBoard = activeEvent ? ufcLiveBoard(activeEvent, picks.groupProgress ?? [], picks.selections, picks.underdogLock) : null;
  const lockName = picks.underdogLock ? "SET" : "NONE";
  const livePlacement = liveBoard?.rank ? `${liveBoard.tied ? "T-" : ""}${liveBoard.rank}` : "—";
  const locked = activeLifecycle ? activeLifecycle.state !== "upcoming" : false;
  const orderedBouts = useMemo(
    () => activeEvent?.bouts
      .filter((bout) => bout.includedInPicks !== false)
      .slice()
      .sort((left, right) => left.position - right.position) ?? [],
    [activeEvent],
  );
  const spotlightsByBout = useMemo(
    () => new Map((activeEvent?.spotlights ?? []).map((spotlight) => [spotlight.boutId, spotlight])),
    [activeEvent?.spotlights],
  );
  const cardOddsMeta = orderedBouts
    .map((bout) => oddsProvenance(bout.oddsSource, bout.oddsUpdatedAt))
    .find(Boolean) ?? null;
  const officialUfcBanner = reviewedOfficialUfcEventBanner(activeEvent);
  const eventPoster = reviewedMmaManiaPoster(activeEvent) ?? officialUfcBanner ?? pickEventPoster(activeEvent);
  const artOnlyPoster = Boolean(officialUfcBanner && eventPoster === officialUfcBanner);
  const numberedUfcEvent = Boolean(
    activeEvent?.sport !== "football" && activeEvent?.name.match(/^UFC\s+\d+\b/i),
  );
  const eventVisualStyle = eventPoster
    ? ({
        "--picks-event-poster": `url("${eventPoster.src}")`,
        "--picks-event-poster-aspect": eventPoster.aspectRatio,
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={`page picks-page${eventPoster ? " has-event-atmosphere" : ""}`}
      style={eventVisualStyle}
    >
      <section className="page-heading picks-page-heading">
        <p className="eyebrow">EVENT PICKS</p>
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
          {identity.profile?.canControlPicks === true ? (
            <div className="picks-owner-empty-actions">
              <Link className="primary-action picks-owner-stage-action" to="/picks/control#setup">
                STAGE NEXT UFC EVENT
              </Link>
              <p className="picks-owner-empty-flow">
                Stage → sync → review → publish → monitor → lock/results.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeEvent && activeLifecycle ? (
        <>
          <section
            className={`surface-card picks-event-hero${eventPoster ? " has-poster" : ""}${artOnlyPoster ? " is-art-only" : ""}${numberedUfcEvent ? " is-numbered-event" : ""}`}
            aria-labelledby="picks-event-title"
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
                <span>{eventDate(pickEventStartsAt(activeEvent))}</span>
                <span>{activeEvent.venue} · {activeEvent.location}</span>
                <span>{numberedUfcEvent ? "MAIN + PRELIMS" : "MAIN CARD ONLY"}</span>
                <span>{progress.total} FIGHTS</span>
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
            <details className="surface-card ufc-group-hub" aria-label="UFC Picks and Standings">
              <summary className="ufc-group-hub__summary">
                <div className="ufc-group-hub__heading">
                  <strong>PICKS &amp; STANDINGS</strong>
                  <small>{progress.total} FIGHTS</small>
                </div>
                {liveBoard && liveBoard.resolved > 0 ? (
                  <div className="ufc-group-hub__scorecard">
                    <div><strong>{liveBoard.current?.correct ?? 0}/{liveBoard.resolved}</strong><small>CORRECT PICKS</small></div>
                    <div><strong>{liveBoard.current?.estimatedPoints ?? 0}</strong><small>LIVE EST. PTS</small></div>
                    <div><strong>{livePlacement}</strong><small>LIVE EST. RANK</small></div>
                  </div>
                ) : (
                  <div className="ufc-group-hub__scorecard">
                    <div><strong>{progress.completed}/{progress.total}</strong><small>PICKS MADE</small></div>
                    <div><strong>{lockName}</strong><small>UNDERDOG LOCK</small></div>
                    <div><strong>{liveBoard?.active ?? 0}</strong><small>GROUP ENTERED</small></div>
                  </div>
                )}
                <div className="ufc-group-hub__foot">
                  <small>{liveBoard?.resolved ? "LIVE · ESTIMATES UNTIL RESULTS SETTLE" : progress.total-progress.completed+" PICKS REMAINING"}</small>
                  <span>VIEW STANDINGS</span>
                </div>
              </summary>
              <div className="ufc-group-hub__body">
                <GroupPickProgress event={activeEvent} locked={locked} mySelections={picks.selections} embedded />
              </div>
            </details>
          ) : null}

          {identity.profile ? (
            <section className="picks-card-zone">
              {cardOddsMeta ? (
                <p className="picks-card-odds" aria-label="Sportsbook odds source">
                  <strong>{cardOddsMeta}</strong>
                </p>
              ) : null}

              <section className="picks-card-list" aria-label={`${activeEvent.name} fight picks`}>
                {orderedBouts.map((bout, index) => {
                  const segmentIndex = orderedBouts
                    .slice(0, index + 1)
                    .filter((candidate) => (candidate.cardSegment ?? "main") === (bout.cardSegment ?? "main"))
                    .length;
                  const selection = picks.selections[bout.boutId] ?? null;
                  const saving = picks.savingBoutId === bout.boutId;
                  const removed = bout.includedInPicks === false;
                  const isMainEvent = index === 0;
                  const boutLocked = pickBoutLocked(activeEvent, bout);
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
                  const resolved = removed || (bout.resultStatus ?? "pending") !== "pending";
                  const readOnly = boutLocked || cancelled || removed;
                  const selectedCorner = selection === bout.redFighterSlug
                    ? "red"
                    : selection === bout.blueFighterSlug
                      ? "blue"
                      : null;
                  const redChoiceLabel = choiceLabel(selection === bout.redFighterSlug, boutLocked, cancelled, removed);
                  const blueChoiceLabel = choiceLabel(selection === bout.blueFighterSlug, boutLocked, cancelled, removed);
                  return (
                    <article
                      className={`surface-card pick-bout-card${isMainEvent ? " is-main-event" : ""}${cancelled || removed ? " is-cancelled" : ""}${removed ? " is-removed" : ""}`}
                      key={bout.boutId}
                    >
                      <header className="pick-bout-card__meta">
                        <div className="pick-bout-card__heading">
                          <span>{fightCardLabel(bout, index, segmentIndex)}</span>
                          <small>{bout.weightClass}</small>
                        </div>
                        {!removed && !cancelled ? (
                          <span
                            className={`picks-status picks-status--${boutLocked ? "locked" : "upcoming"}`}
                            aria-label={`${bout.redFighterName} versus ${bout.blueFighterName} is ${boutLocked ? "locked" : "open"}`}
                          >
                            {boutLocked ? "LOCKED" : "OPEN"}
                          </span>
                        ) : null}
                      </header>
                      <div className="pick-bout-card__choices">
                        <div className={`pick-choice-shell pick-choice-shell--red`}>
                        <button
                          type="button"
                          className={choiceClassName(selection === bout.redFighterSlug, readOnly)}
                          aria-pressed={selection === bout.redFighterSlug}
                          disabled={readOnly || Boolean(picks.savingBoutId)}
                          onClick={() => void picks.setPick(bout.boutId, bout.redFighterSlug)}
                        >
                          <FighterThumbnail name={bout.redFighterName} slug={bout.redFighterSlug} officialHeadshot={approvedUfcPicksHeadshot(activeEvent.eventId, bout.redFighterSlug)} suppressContenderBadge />
                          <span style={fighterNameStyle(bout.redFighterName, isMainEvent)}>{bout.redFighterName}</span>
                          <small>{removed ? "NOT ACTIVE" : `${redOdds ?? "ODDS TBD"}${favorite === "red" ? " · FAVORITE" : ""}`}</small>
                          {selection === bout.redFighterSlug ? <i className="pick-choice__check" aria-label="Your pick">✓</i> : null}
                          {redChoiceLabel ? <em>{redChoiceLabel}</em> : null}
                        </button>
                        <UfcFighterIdentityBadges slug={bout.redFighterSlug} />
                        </div>
                        <span className="pick-bout-card__versus">VS</span>
                        <div className={`pick-choice-shell pick-choice-shell--blue`}>
                        <button
                          type="button"
                          className={choiceClassName(selection === bout.blueFighterSlug, readOnly)}
                          aria-pressed={selection === bout.blueFighterSlug}
                          disabled={readOnly || Boolean(picks.savingBoutId)}
                          onClick={() => void picks.setPick(bout.boutId, bout.blueFighterSlug)}
                        >
                          <FighterThumbnail name={bout.blueFighterName} slug={bout.blueFighterSlug} officialHeadshot={approvedUfcPicksHeadshot(activeEvent.eventId, bout.blueFighterSlug)} suppressContenderBadge />
                          <span style={fighterNameStyle(bout.blueFighterName, isMainEvent)}>{bout.blueFighterName}</span>
                          <small>{removed ? "NOT ACTIVE" : `${blueOdds ?? "ODDS TBD"}${favorite === "blue" ? " · FAVORITE" : ""}`}</small>
                          {selection === bout.blueFighterSlug ? <i className="pick-choice__check" aria-label="Your pick">✓</i> : null}
                          {blueChoiceLabel ? <em>{blueChoiceLabel}</em> : null}
                        </button>
                        <UfcFighterIdentityBadges slug={bout.blueFighterSlug} />
                        </div>
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
                      {!removed && !cancelled && boutLocked && lockSelected ? (
                        <div className={`pick-lock-row is-${selectedCorner ?? "red"}`}>
                          <div className="pick-lock-readonly" aria-label="Selected Underdog Lock">
                            ★ UNDERDOG LOCK{selectedLockBonusLabel ? ` · ${selectedLockBonusLabel}` : ""}
                          </div>
                        </div>
                      ) : !removed && !cancelled && !boutLocked && selection && (selectedOdds ?? 0) > 0 ? (
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
                      <MainEventSpotlight bout={bout} spotlight={spotlightsByBout.get(bout.boutId) ?? null} />
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

      {activeEvent && activeLifecycle ? (
          <details className="surface-card picks-scoring-guide hq-picks-disclosure">
            <summary><span className="hq-picks-disclosure__title">SCORING &amp; UNDERDOG LOCK RULES</span><span className="hq-picks-disclosure__chevron" aria-hidden="true">⌄</span></summary>
            <p><strong>Correct pick +4</strong><span>Incorrect and missing picks score 0. Draws, no contests, cancellations, and fights removed from Picks are excluded.</span></p>
            <p><strong>Underdog Lock bonus by odds</strong><span>Choose one fighter at +100 or longer. A winning lock adds the frozen lock-time bonus below.</span></p>
            <div className="picks-scoring-tiers" aria-label="Underdog Lock bonus tiers">
              {underdogBonusTiers.map((tier) => (
                <span key={tier.odds}><b>{tier.odds}</b><em>{tier.bonus}</em></span>
              ))}
            </div>
          </details>
      ) : null}
    </div>
  );
}
