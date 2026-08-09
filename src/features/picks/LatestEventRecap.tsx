import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { shareCanonicalDestination } from "../../app/nativeShare";
import {
  groupRankLabel,
  mainCardFightLabel,
  pickWinPercentage,
  type PickHistoryBout,
  type PickHistoryEvent,
} from "./picksModel";
import { pickEventPoster } from "./picksEventAssets";
import {
  createPicksRecapShareImage,
  type PicksRecapStory,
} from "./picksRecapShareImage";
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

function youtubeThumbnail(value: string) {
  try {
    const url = new URL(value);
    const id = url.hostname === "youtu.be"
      ? url.pathname.split("/").filter(Boolean)[0]
      : url.searchParams.get("v") ?? url.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/)?.[1];
    return id ? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}

function universalRecapText(
  event: PickHistoryEvent,
  championLabel: string,
  champions: string,
  winningPoints: number,
) {
  const watchMoments = event.watchMoments ?? [];
  const lines = [
    `${event.name} recap — ${championLabel}: ${champions} with ${winningPoints} points.`,
    ...watchMoments.map((moment, index) => (
      `${watchMoments.length > 1 ? `Must-watch moment ${index + 1}` : "Must-watch moment"}: ${moment.url}`
    )),
    "View your event recap in Octagon HQ:",
  ];
  return lines.join("\n");
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
  const scrollRef = useRef<HTMLElement | null>(null);
  const watchMoments = event.watchMoments ?? [];
  const eventPoster = pickEventPoster(event);
  const heroStyle = eventPoster
    ? ({
        "--picks-recap-poster": `url("${eventPoster.src}")`,
        "--picks-recap-poster-aspect": eventPoster.aspectRatio,
      } as CSSProperties)
    : undefined;
  const recap = useMemo(() => {
    const bouts = event.bouts.slice().sort((left, right) => left.position - right.position);
    const analyses = bouts.map(boutAnalysis).filter((value): value is BoutAnalysis => Boolean(value));
    const bestCall = analyses
      .filter((analysis) => analysis.correct > 0)
      .slice()
      .sort((left, right) => left.correctPercentage - right.correctPercentage || right.submitted - left.submitted)[0] ?? null;
    const roomNailed = analyses
      .filter((analysis) => analysis.correctPercentage >= 75)
      .slice()
      .sort((left, right) => right.correctPercentage - left.correctPercentage || right.submitted - left.submitted)[0] ?? null;
    const roomTrap = analyses
      .filter((analysis) => analysis.correctPercentage <= 50)
      .slice()
      .sort((left, right) => left.correctPercentage - right.correctPercentage || right.submitted - left.submitted)[0] ?? null;
    const winningPoints = event.groupResults.reduce((high, result) => Math.max(high, result.totalPoints), 0);
    const champions = event.groupResults.filter((result) => result.totalPoints === winningPoints);
    const current = event.groupResults.find((result) => result.isCurrentUser) ?? null;
    const decidedPicks = event.groupResults.reduce((total, result) => total + result.correct + result.incorrect, 0);
    const totalPicks = event.groupResults.reduce((total, result) => total + result.correct + result.incorrect + result.missing, 0);
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
      decidedPicks,
      totalPicks,
      correctPicks,
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
    document.documentElement.classList.add("picks-recap-open");
    document.body.classList.add("picks-recap-open");
    const frame = window.requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 0 });
      closeRef.current?.focus();
    });
    const closeOnEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove("picks-recap-open");
      document.body.classList.remove("picks-recap-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const championNames = recap.champions.map((result) => result.displayName);
  const championLabel = recap.champions.length > 1 ? "CO-CHAMPIONS" : "CHAMPION";
  const championCopy = joinNames(championNames);
  const gradedFights = recap.bouts.filter((bout) => bout.includedInPicks !== false && bout.verdict !== "excluded").length;
  const stories: PicksRecapStory[] = [];
  if (recap.bestCall) {
    stories.push({
      label: "BEST CALL",
      title: fighterName(recap.bestCall.bout, recap.bestCall.bout.winnerFighterSlug),
      detail: `${joinNames(recap.bestCall.correctNames)} called it · ${recap.bestCall.correct}/${recap.bestCall.submitted} backed the winner`,
    });
  }
  if (recap.roomNailed) {
    stories.push({
      label: "ROOM NAILED IT",
      title: fighterName(recap.roomNailed.bout, recap.roomNailed.bout.winnerFighterSlug),
      detail: `${recap.roomNailed.correct}/${recap.roomNailed.submitted} correct · ${Math.round(recap.roomNailed.correctPercentage)}%`,
    });
  }
  if (recap.roomTrap) {
    stories.push({
      label: "ROOM TRAP",
      title: `${recap.roomTrap.bout.redFighterName} vs. ${recap.roomTrap.bout.blueFighterName}`,
      detail: recap.roomTrap.correct
        ? `Only ${recap.roomTrap.correct}/${recap.roomTrap.submitted} picked ${fighterName(recap.roomTrap.bout, recap.roomTrap.bout.winnerFighterSlug)}`
        : `Nobody picked ${fighterName(recap.roomTrap.bout, recap.roomTrap.bout.winnerFighterSlug)}`,
    });
  }
  if (recap.lockWinners.length) {
    stories.push({
      label: "UNDERDOG LOCK",
      title: `${joinNames(recap.lockWinners.map((result) => result.displayName))} hit`,
      detail: recap.lockWinners.map((result) => `${result.displayName} +${result.lockBonus}`).join(" · "),
    });
  }

  const recapStory = [
    `${championCopy} ${recap.champions.length > 1 ? "shared the win" : "won the night"} with ${recap.winningPoints} points.`,
    recap.decidedPicks
      ? `The room went ${recap.correctPicks}-${Math.max(0, recap.decidedPicks - recap.correctPicks)} on graded picks (${recap.groupAccuracy}%).`
      : null,
    recap.roomTrap
      ? recap.roomTrap.correct
        ? `${fighterName(recap.roomTrap.bout, recap.roomTrap.bout.winnerFighterSlug)} was the toughest call of the card.`
        : `${fighterName(recap.roomTrap.bout, recap.roomTrap.bout.winnerFighterSlug)} was the result nobody saw coming.`
      : null,
  ].filter(Boolean).join(" ");

  async function shareRecap() {
    setShareLabel("PREPARING…");
    let files: File[] | undefined;
    try {
      const file = await createPicksRecapShareImage({
        eventName: event.name,
        subtitle: recap.subtitle,
        eventMeta: `${completedDate(event.completedAt)} · ${event.venue} · ${event.location}`,
        championLabel,
        champions: championCopy,
        winningPoints: recap.winningPoints,
        players: event.groupResults.length,
        groupAccuracy: recap.groupAccuracy,
        totalPicks: recap.totalPicks,
        groupRecord: `${recap.correctPicks}-${Math.max(0, recap.decidedPicks - recap.correctPicks)}`,
        stories,
        standings: recap.standings,
        watchMoments,
      });
      files = [file];
    } catch {
      files = undefined;
    }

    const copy = universalRecapText(event, championLabel, championCopy, recap.winningPoints);
    const outcome = await shareCanonicalDestination({
      destination: { kind: "picks-recap", eventId: event.eventId },
      title: `${event.name} recap · Octagon HQ`,
      text: copy,
      fallbackText: copy,
      files,
    });
    setShareLabel(outcome === "copied" ? "COPIED" : outcome === "unavailable" ? "TRY AGAIN" : "SHARE");
  }

  const overlay = open ? (
    <div
      className="picks-event-recap-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${event.name} Recap`}
      data-pull-refresh-ignore
    >
      <div className="picks-event-recap">
        <header className="picks-event-recap__header">
          <button ref={closeRef} type="button" aria-label="Close event recap" onClick={() => setOpen(false)}>×</button>
          <span>EVENT RECAP</span>
          <button type="button" disabled={shareLabel === "PREPARING…"} onClick={() => void shareRecap()}>{shareLabel}</button>
        </header>

        <main ref={scrollRef} className="picks-event-recap__scroll" data-testid="picks-event-recap-scroll">
          <section
            className={`picks-event-recap__hero${eventPoster ? " has-poster" : ""}`}
            style={heroStyle}
          >
            {eventPoster ? <div className="picks-event-recap__poster" aria-hidden="true" /> : null}
            <div className="picks-event-recap__hero-copy">
              <span>FINAL RESULTS</span>
              <h2 id={titleId}>{event.name}</h2>
              <strong>{recap.subtitle}</strong>
              <p>{completedDate(event.completedAt)} · {event.venue} · {event.location}</p>
              <div className="picks-event-recap__champion">
                <div><span>{championLabel}</span><strong>{championCopy}</strong></div>
                <b>{recap.winningPoints}<small>PTS</small></b>
              </div>
              <p className="picks-event-recap__story">{recapStory}</p>
              <div className="picks-event-recap__quickline" aria-label="Event recap totals">
                <span>{event.groupResults.length} {event.groupResults.length === 1 ? "PLAYER" : "PLAYERS"}</span>
                <span>{recap.groupAccuracy}% GROUP ACCURACY</span>
                {recap.current ? <span>YOU: {recap.current.correct}/{recap.current.correct + recap.current.incorrect} · {recap.current.totalPoints} PTS</span> : <span>DID NOT ENTER</span>}
              </div>
            </div>
          </section>

          {stories.length ? (
            <section className="picks-event-recap__stories" aria-label="Night awards">
              <div className="picks-event-recap__compact-heading"><span>NIGHT AWARDS</span><small>{stories.length}</small></div>
              <div className="picks-event-recap__story-strip">
                {stories.map((story) => (
                  <article key={story.label}>
                    <span>{story.label}</span>
                    <strong>{story.title}</strong>
                    <p>{story.detail}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {watchMoments.length ? (
            <section className="picks-event-recap__moments" aria-labelledby={`${titleId}-moments`}>
              <div className="picks-event-recap__compact-heading">
                <h3 id={`${titleId}-moments`}>Watch the card back</h3>
                <small>{watchMoments.length > 1 ? `${watchMoments.length} MOMENTS` : "MUST-WATCH MOMENT"}</small>
              </div>
              <div className="picks-event-recap__moment-list">
                {watchMoments.map((moment) => {
                  const thumbnail = youtubeThumbnail(moment.url);
                  return (
                    <a href={moment.url} target="_blank" rel="noreferrer" key={`${moment.title}:${moment.url}`}>
                      {thumbnail ? <img src={thumbnail} alt="" loading="lazy" /> : <span className="picks-event-recap__moment-placeholder" aria-hidden="true">▶</span>}
                      <div><strong>{moment.title}</strong><b>WATCH ↗</b></div>
                    </a>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="picks-event-recap__standings" aria-labelledby={`${titleId}-standings`}>
            <div className="picks-event-recap__compact-heading">
              <h3 id={`${titleId}-standings`}>Event Standings</h3>
              <small>{event.groupResults.length} {event.groupResults.length === 1 ? "PLAYER" : "PLAYERS"}</small>
            </div>
            <div className="picks-event-recap__standing-list">
              {recap.standings.map((result) => (
                <article className={result.isCurrentUser ? "is-current-user" : ""} key={result.profileId ?? result.displayName}>
                  <span>{groupRankLabel(result.rank, event.groupResults)}</span>
                  <div><strong>{result.displayName}{result.isCurrentUser ? <em>YOU</em> : null}</strong><small>{result.correct}/{result.correct + result.incorrect} · {winPercentage(result.correct, result.incorrect)}{result.lockBonus ? ` · +${result.lockBonus} lock` : ""}</small></div>
                  <b>{result.totalPoints}<small>PTS</small></b>
                </article>
              ))}
            </div>
          </section>

          <details className="picks-event-recap__fights">
            <summary>
              <div><span>FIGHT RESULTS</span><h3>Fight by Fight</h3></div>
              <small>{gradedFights} GRADED · VIEW FIGHTS ›</small>
            </summary>
            <div className="picks-event-recap__fight-list" id={`${titleId}-fights`}>
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
          </details>
        </main>
      </div>
    </div>
  ) : null;

  return (
    <>
      <article className="picks-latest-recap-card">
        <div>
          <span>FINAL RESULTS</span>
          <h3>{event.name} Recap</h3>
          <p>{recap.subtitle}</p>
        </div>
        <div className="picks-latest-recap-card__result">
          <small>{championLabel}</small>
          <strong>{championCopy}</strong>
          <b>{recap.winningPoints} PTS</b>
        </div>
        <button type="button" aria-label="OPEN FULL RECAP" onClick={() => setOpen(true)}>VIEW EVENT RECAP <span aria-hidden="true">›</span></button>
      </article>

      {overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
