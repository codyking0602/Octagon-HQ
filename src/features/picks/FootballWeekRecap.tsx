import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { shareCanonicalDestination } from "../../app/nativeShare";
import { GroupPickReveal } from "./GroupPickReveal";
import {
  groupRankLabel,
  pickWinPercentage,
  type PickHistoryBout,
  type PickHistoryEvent,
} from "./picksModel";

function completedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function teamName(game: PickHistoryBout, slug: string | null) {
  if (!slug) return "No pick";
  if (slug === game.redFighterSlug) return game.redFighterName;
  if (slug === game.blueFighterSlug) return game.blueFighterName;
  return "Unknown team";
}

function officialResult(game: PickHistoryBout) {
  if (game.includedInPicks === false) return "Removed from Picks";
  if (game.resultStatus === "red_win" || game.resultStatus === "blue_win") {
    return `${teamName(game, game.winnerFighterSlug)} covered`;
  }
  if (game.resultStatus === "draw") return "Push";
  if (game.resultStatus === "cancelled") return "Cancelled";
  if (game.resultStatus === "no_contest") return "No result";
  return "Pending";
}

function verdictLabel(game: PickHistoryBout) {
  if (game.includedInPicks === false || game.verdict === "excluded") return "Excluded";
  if (game.verdict === "correct") return "Covered";
  if (game.verdict === "incorrect") return "Missed";
  if (game.verdict === "push") return "Push";
  if (game.verdict === "missing") return "No pick";
  return "Pending";
}

function winPercentage(correct: number, incorrect: number) {
  return `${pickWinPercentage(correct, incorrect).toFixed(1)}%`;
}

function joinNames(names: readonly string[]) {
  if (!names.length) return "—";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
}

function leagueLabel(game: PickHistoryBout) {
  const value = game.weightClass.replace(/\s*ATS$/i, "").toUpperCase();
  return value.includes("COLLEGE") || value === "CFB" ? "CFB" : value || "FOOTBALL";
}

export function FootballWeekRecap({
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
  const recap = useMemo(() => {
    const standings = event.groupResults.slice().sort((left, right) => (
      left.rank - right.rank || right.totalPoints - left.totalPoints || left.displayName.localeCompare(right.displayName)
    ));
    const winningPoints = standings.reduce((high, result) => Math.max(high, result.totalPoints), 0);
    const champions = standings.filter((result) => result.totalPoints === winningPoints);
    const current = standings.find((result) => result.isCurrentUser) ?? null;
    const decided = standings.reduce((total, result) => total + result.correct + result.incorrect, 0);
    const correct = standings.reduce((total, result) => total + result.correct, 0);
    return {
      standings,
      winningPoints,
      champions,
      current,
      groupAccuracy: decided ? Math.round(correct / decided * 100) : 0,
      games: event.bouts.slice().sort((left, right) => left.position - right.position),
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
  const championLabel = recap.champions.length > 1 ? "CO-CHAMPIONS" : "WEEK CHAMPION";
  const championCopy = joinNames(championNames);
  const gradedGames = recap.games.filter((game) => game.includedInPicks !== false && game.verdict !== "excluded").length;

  async function shareRecap() {
    const copy = `${event.name} recap — ${championLabel}: ${championCopy} with ${recap.winningPoints} points.\nView the week recap in Octagon HQ:`;
    const outcome = await shareCanonicalDestination({
      destination: { kind: "picks-recap", eventId: event.eventId, sport: "football" },
      title: `${event.name} recap · Octagon HQ`,
      text: copy,
      fallbackText: copy,
    });
    setShareLabel(outcome === "copied" ? "COPIED" : outcome === "unavailable" ? "TRY AGAIN" : "SHARE");
  }

  const overlay = open ? (
    <div className="picks-event-recap-overlay" role="dialog" aria-modal="true" aria-label={`${event.name} Week Recap`} data-pull-refresh-ignore>
      <div className="picks-event-recap">
        <header className="picks-event-recap__header">
          <button ref={closeRef} type="button" aria-label="Close week recap" onClick={() => setOpen(false)}>×</button>
          <span>WEEK RECAP</span>
          <button type="button" onClick={() => void shareRecap()}>{shareLabel}</button>
        </header>

        <main ref={scrollRef} className="picks-event-recap__scroll" data-testid="football-week-recap-scroll">
          <section className="picks-event-recap__hero">
            <div className="picks-event-recap__hero-copy">
              <span>FINAL ATS RESULTS</span>
              <h2 id={titleId}>{event.name}</h2>
              {event.subtitle ? <strong>{event.subtitle}</strong> : null}
              <p>{completedDate(event.completedAt)}</p>
              <div className="picks-event-recap__champion">
                <div><span>{championLabel}</span><strong>{championCopy}</strong></div>
                <b>{recap.winningPoints}<small>PTS</small></b>
              </div>
              <div className="picks-event-recap__quickline" aria-label="Week recap totals">
                <span>{event.groupResults.length} {event.groupResults.length === 1 ? "PLAYER" : "PLAYERS"}</span>
                <span>{recap.groupAccuracy}% GROUP ATS</span>
                {recap.current ? <span>YOU: {recap.current.correct}-{recap.current.incorrect} · {recap.current.totalPoints} PTS</span> : <span>DID NOT ENTER</span>}
              </div>
            </div>
          </section>

          <section className="picks-event-recap__standings" aria-labelledby={`${titleId}-standings`}>
            <div className="picks-event-recap__compact-heading">
              <h3 id={`${titleId}-standings`}>Week Standings</h3>
              <small>{event.groupResults.length} {event.groupResults.length === 1 ? "PLAYER" : "PLAYERS"}</small>
            </div>
            <div className="picks-event-recap__standing-list">
              {recap.standings.map((result) => (
                <article className={result.isCurrentUser ? "is-current-user" : ""} key={result.profileId ?? result.displayName}>
                  <span>{groupRankLabel(result.rank, event.groupResults)}</span>
                  <div><strong>{result.displayName}{result.isCurrentUser ? <em>YOU</em> : null}</strong><small>{result.correct}-{result.incorrect} · {winPercentage(result.correct, result.incorrect)} ATS{result.lockBonus ? ` · +${result.lockBonus} lock` : ""}</small></div>
                  <b>{result.totalPoints}<small>PTS</small></b>
                </article>
              ))}
            </div>
          </section>

          <details className="picks-event-recap__fights">
            <summary>
              <div><span>GAME RESULTS</span><h3>Game by Game</h3></div>
              <small>{gradedGames} GRADED · VIEW GAMES ›</small>
            </summary>
            <div className="picks-event-recap__fight-list" id={`${titleId}-games`}>
              {recap.games.map((game) => (
                <article key={game.boutId}>
                  <div className="picks-event-recap__fight-meta"><span>{leagueLabel(game)}</span><small>ATS</small></div>
                  <div className="picks-event-recap__matchup"><strong>{game.blueFighterName}</strong><span>VS</span><strong>{game.redFighterName}</strong></div>
                  <div className="picks-event-recap__fight-result">
                    <div><span>ATS RESULT</span><strong>{officialResult(game)}</strong></div>
                    <div><span>YOUR PICK</span><strong>{teamName(game, game.pickedFighterSlug)}</strong></div>
                    <em className={`picks-verdict picks-verdict--${game.verdict}`}>{verdictLabel(game)}</em>
                  </div>
                  <GroupPickReveal
                    redFighterSlug={game.redFighterSlug}
                    redFighterName={game.redFighterName}
                    blueFighterSlug={game.blueFighterSlug}
                    blueFighterName={game.blueFighterName}
                    picks={game.groupPicks ?? []}
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
          <span>FINAL ATS RESULTS</span>
          <h3>{event.name} Recap</h3>
          <p>{event.subtitle}</p>
        </div>
        <div className="picks-latest-recap-card__result">
          <small>{championLabel}</small>
          <strong>{championCopy}</strong>
          <b>{recap.winningPoints} PTS</b>
        </div>
        <button type="button" aria-label="OPEN FULL WEEK RECAP" onClick={() => setOpen(true)}>VIEW WEEK RECAP <span aria-hidden="true">›</span></button>
      </article>

      {overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
