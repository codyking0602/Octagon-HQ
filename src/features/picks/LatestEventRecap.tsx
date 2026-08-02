import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { shareCanonicalDestination } from "../../app/nativeShare";
import {
  groupRankLabel,
  mainCardFightLabel,
  pickWinPercentage,
  type PickHistoryBout,
  type PickHistoryEvent,
} from "./picksModel";
import { GroupPickReveal } from "./GroupPickReveal";

interface BoutAnalysis {
  bout: PickHistoryBout;
  submitted: number;
  correct: number;
  correctPercentage: number;
  correctNames: string[];
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
  if (bout.includedInPicks === false) return "Removed from Picks";
  if (bout.resultStatus === "red_win" || bout.resultStatus === "blue_win") {
    return fighterName(bout, bout.winnerFighterSlug);
  }
  if (bout.resultStatus === "draw") return "Draw";
  if (bout.resultStatus === "no_contest") return "No contest";
  if (bout.resultStatus === "cancelled") return "Cancelled";
  return "Pending";
}

function verdictLabel(bout: PickHistoryBout) {
  if (bout.includedInPicks === false || bout.verdict === "excluded") return "Excluded";
  if (bout.verdict === "correct") return "Correct";
  if (bout.verdict === "incorrect") return "Incorrect";
  if (bout.verdict === "missing") return "No pick";
  return "Pending";
}

function winPercentage(correct: number, incorrect: number) {
  return `${Math.round(pickWinPercentage(correct, incorrect))}%`;
}

function joinNames(names: readonly string[]) {
  if (!names.length) return "Nobody";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
}

function boutAnalysis(bout: PickHistoryBout): BoutAnalysis | null {
  if (bout.includedInPicks === false) return null;
  if (bout.resultStatus !== "red_win" && bout.resultStatus !== "blue_win") return null;
  const submitted = (bout.groupPicks ?? []).filter((pick) => (
    pick.pickedFighterSlug === bout.redFighterSlug || pick.pickedFighterSlug === bout.blueFighterSlug
  ));
  if (!submitted.length || !bout.winnerFighterSlug) return null;
  const correct = submitted.filter((pick) => pick.pickedFighterSlug === bout.winnerFighterSlug);
  return {
    bout,
    submitted: submitted.length,
    correct: correct.length,
    correctPercentage: (correct.length / submitted.length) * 100,
    correctNames: correct.map((pick) => pick.displayName),
  };
}

function eventSubtitle(event: PickHistoryEvent, bouts: readonly PickHistoryBout[]) {
  if (event.subtitle.trim() && !/^main card$/i.test(event.subtitle.trim())) return event.subtitle;
  const mainEvent = bouts[0];
  return mainEvent ? `${mainEvent.redFighterName} vs. ${mainEvent.blueFighterName}` : event.subtitle;
}

function recapText(event: PickHistoryEvent, champions: readonly string[]) {
  const championLabel = champions.length > 1 ? "Co-champions" : "Champion";
  return `${event.name} recap. ${championLabel}: ${joinNames(champions)}. ${event.record.correct}-${event.record.incorrect} record and ${event.record.totalPoints} points.`;
}

export function LatestEventRecap({
  event,
  requestedOpen = false,
}: {
  event: PickHistoryEvent;
  requestedOpen?: boolean;
}) {
  const [open, setOpen] = useState(requestedOpen);
  const [shareLabel, setShareLabel] = useState("SHARE");
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const recap = useMemo(() => {
    const bouts = event.bouts.slice().sort((left, right) => left.position - right.position);
    const analyses = bouts.map(boutAnalysis).filter((value): value is BoutAnalysis => Boolean(value));
    const bestCall = analyses
      .filter((analysis) => analysis.correct > 0)
      .slice()
      .sort((left, right) => left.correctPercentage - right.correctPercentage || right.submitted - left.submitted)[0] ?? null;
    const roomNailed = analyses
      .slice()
      .sort((left, right) => right.correctPercentage - left.correctPercentage || right.submitted - left.submitted)[0] ?? null;
    const roomTrap = analyses
      .slice()
      .sort((left, right) => left.correctPercentage - right.correctPercentage || right.submitted - left.submitted)[0] ?? null;
    const winningPoints = event.groupResults.reduce((high, result) => Math.max(high, result.totalPoints), 0);
    const champions = event.groupResults.filter((result) => result.totalPoints === winningPoints);
    const current = event.groupResults.find((result) => result.isCurrentUser) ?? null;
    const decidedPicks = event.groupResults.reduce((total, result) => total + result.correct + result.incorrect, 0);
    const correctPicks = event.groupResults.reduce((total, result) => total + result.correct, 0);
    const lockWinners = event.groupResults.filter((result) => result.lockBonus > 0);
    return {
      bouts,
      bestCall,
      roomNailed,
      roomTrap,
      winningPoints,
      champions,
      current,
      groupAccuracy: decidedPicks ? Math.round((correctPicks / decidedPicks) * 100) : 0,
      lockWinners,
      subtitle: eventSubtitle(event, bouts),
      standings: event.groupResults.slice().sort((left, right) => (
        left.rank - right.rank || right.totalPoints - left.totalPoints || left.displayName.localeCompare(right.displayName)
      )),
    };
  }, [event]);

  useEffect(() => {
    setOpen(requestedOpen);
  }, [event.eventId, requestedOpen]);

  useEffect(() => {
    if (!open) return undefined;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const closeOnEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = priorOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  async function shareRecap() {
    const champions = recap.champions.map((result) => result.displayName);
    const outcome = await shareCanonicalDestination({
      destination: { kind: "picks-recap", eventId: event.eventId },
      title: `${event.name} recap · Octagon HQ`,
      text: recapText(event, champions),
    });
    setShareLabel(outcome === "copied" ? "COPIED" : outcome === "unavailable" ? "TRY AGAIN" : "SHARE");
  }

  const championNames = recap.champions.map((result) => result.displayName);
  const gradedFights = recap.bouts.filter((bout) => bout.includedInPicks !== false && bout.verdict !== "excluded").length;
  const stories = [{
    label: "BEST CALL",
    title: recap.bestCall ? fighterName(recap.bestCall.bout, recap.bestCall.bout.winnerFighterSlug) : "No pick split available",
    detail: recap.bestCall
      ? `${joinNames(recap.bestCall.correctNames)} called it · ${recap.bestCall.correct}/${recap.bestCall.submitted} backed the winner`
      : "This archived card does not include member pick splits.",
  }, {
    label: "ROOM NAILED IT",
    title: recap.roomNailed ? fighterName(recap.roomNailed.bout, recap.roomNailed.bout.winnerFighterSlug) : "No pick split available",
    detail: recap.roomNailed
      ? `${recap.roomNailed.correct}/${recap.roomNailed.submitted} correct · ${Math.round(recap.roomNailed.correctPercentage)}%`
      : "This archived card does not include member pick splits.",
  }, {
    label: "ROOM TRAP",
    title: recap.roomTrap ? `${recap.roomTrap.bout.redFighterName} vs. ${recap.roomTrap.bout.blueFighterName}` : "No pick split available",
    detail: recap.roomTrap
      ? recap.roomTrap.correct
        ? `Only ${recap.roomTrap.correct}/${recap.roomTrap.submitted} picked ${fighterName(recap.roomTrap.bout, recap.roomTrap.bout.winnerFighterSlug)}`
        : `Nobody picked ${fighterName(recap.roomTrap.bout, recap.roomTrap.bout.winnerFighterSlug)}`
      : "This archived card does not include member pick splits.",
  }, {
    label: "UNDERDOG LOCK",
    title: recap.lockWinners.length ? `${joinNames(recap.lockWinners.map((result) => result.displayName))} hit` : "No lock winner",
    detail: recap.lockWinners.length
      ? recap.lockWinners.map((result) => `${result.displayName} +${result.lockBonus}`).join(" · ")
      : "Nobody landed the bonus.",
  }];

  const overlay = open ? (
    <div
      className="picks-event-recap-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-pull-refresh-ignore
    >
      <div className="picks-event-recap">
        <header className="picks-event-recap__header">
          <button ref={closeRef} type="button" aria-label="Close event recap" onClick={() => setOpen(false)}>×</button>
          <span>EVENT RECAP</span>
          <button type="button" onClick={() => void shareRecap()}>{shareLabel}</button>
        </header>

        <main className="picks-event-recap__scroll">
          <section className="picks-event-recap__hero">
            <span>ARCHIVED EVENT FINAL</span>
            <h2 id={titleId}>{event.name} Recap</h2>
            <strong>{recap.subtitle}</strong>
            <p>{completedDate(event.completedAt)} · {event.venue} · {event.location}</p>
            <em>{gradedFights} GRADED {gradedFights === 1 ? "FIGHT" : "FIGHTS"}</em>
            <div className="picks-event-recap__champion">
              <span>{recap.champions.length > 1 ? "CO-CHAMPIONS" : "CHAMPION"}</span>
              <strong>{joinNames(championNames)}</strong>
              <b>{recap.winningPoints} PTS</b>
            </div>
          </section>

          <section className="picks-event-recap__metrics" aria-label="Event recap totals">
            <div><strong>{event.groupResults.length}</strong><span>PLAYERS</span></div>
            <div><strong>{recap.groupAccuracy}%</strong><span>GROUP ACCURACY</span></div>
            <div><strong>{recap.current ? `${recap.current.correct}/${recap.current.correct + recap.current.incorrect}` : `${event.record.correct}/${event.record.correct + event.record.incorrect}`}</strong><span>YOUR PICKS</span></div>
            <div><strong>{recap.current?.totalPoints ?? event.record.totalPoints}</strong><span>YOUR POINTS</span></div>
          </section>

          <section className="picks-event-recap__stories" aria-label="Story of the card">
            {stories.map((story) => (
              <article key={story.label}>
                <span>{story.label}</span>
                <strong>{story.title}</strong>
                <p>{story.detail}</p>
              </article>
            ))}
          </section>

          <section className="picks-event-recap__standings" aria-labelledby={`${titleId}-standings`}>
            <div className="picks-event-recap__section-heading">
              <div><span>FINAL TABLE</span><h3 id={`${titleId}-standings`}>Event Standings</h3></div>
              <small>{event.groupResults.length} PLAYERS</small>
            </div>
            <div className="picks-event-recap__standing-list">
              {recap.standings.map((result) => (
                <article className={result.isCurrentUser ? "is-current-user" : ""} key={result.profileId ?? result.displayName}>
                  <span>{groupRankLabel(result.rank, event.groupResults)}</span>
                  <div><strong>{result.displayName}{result.isCurrentUser ? <em>YOU</em> : null}</strong><small>{result.correct}/{result.correct + result.incorrect} correct · {winPercentage(result.correct, result.incorrect)}{result.lockBonus ? ` · +${result.lockBonus} lock` : ""}</small></div>
                  <b>{result.totalPoints}<small>PTS</small></b>
                </article>
              ))}
            </div>
          </section>

          <section className="picks-event-recap__fights" aria-labelledby={`${titleId}-fights`}>
            <div className="picks-event-recap__section-heading">
              <div><span>CARD RESULTS</span><h3 id={`${titleId}-fights`}>Fight by Fight</h3></div>
              <small>{recap.bouts.length} FIGHTS</small>
            </div>
            <div className="picks-event-recap__fight-list">
              {recap.bouts.map((bout, index) => (
                <article key={bout.boutId}>
                  <div className="picks-event-recap__fight-meta"><span>{mainCardFightLabel(index)}</span><small>{bout.weightClass}</small></div>
                  <div className="picks-event-recap__matchup"><strong>{bout.redFighterName}</strong><span>VS</span><strong>{bout.blueFighterName}</strong></div>
                  <div className="picks-event-recap__fight-result">
                    <div><span>OFFICIAL</span><strong>{officialResult(bout)}</strong></div>
                    <div><span>YOUR PICK</span><strong>{fighterName(bout, bout.pickedFighterSlug)}</strong></div>
                    <em className={`picks-verdict picks-verdict--${bout.verdict}`}>{verdictLabel(bout)}</em>
                  </div>
                  <GroupPickReveal
                    redFighterSlug={bout.redFighterSlug}
                    redFighterName={bout.redFighterName}
                    blueFighterSlug={bout.blueFighterSlug}
                    blueFighterName={bout.blueFighterName}
                    picks={bout.groupPicks ?? []}
                  />
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  ) : null;

  return (
    <>
      <article className="picks-latest-recap-card">
        <div>
          <span>ARCHIVED EVENT FINAL</span>
          <h3>{event.name} Recap</h3>
          <p>{recap.subtitle}</p>
        </div>
        <div className="picks-latest-recap-card__result">
          <small>{recap.champions.length > 1 ? "CO-CHAMPIONS" : "CHAMPION"}</small>
          <strong>{joinNames(championNames)}</strong>
          <b>{recap.winningPoints} PTS</b>
        </div>
        <button type="button" onClick={() => setOpen(true)}>OPEN FULL RECAP <span aria-hidden="true">›</span></button>
      </article>

      {overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
