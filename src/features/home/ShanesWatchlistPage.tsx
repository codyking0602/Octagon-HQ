import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { WatchFighterPhoto, WatchMovementBadge } from "./ShanesWatchlistCard";
import { shanesWatchlist, watchMovement, type ShaneWatchFighter } from "./shanesWatchlist";

function fighterIdFromHash() {
  const fighterId = window.location.hash.slice(1);
  return shanesWatchlist.fighters.some((fighter) => fighter.id === fighterId) ? fighterId : null;
}

function replaceFighterHash(fighterId: string | null) {
  const nextUrl = `${window.location.pathname}${window.location.search}${fighterId ? `#${fighterId}` : ""}`;
  window.history.replaceState({}, "", nextUrl);
}

function FeaturedFighter({
  fighter,
  onOpen,
}: {
  fighter: ShaneWatchFighter;
  onOpen: (fighter: ShaneWatchFighter) => void;
}) {
  return (
    <button
      className="watchlist-feature"
      id={fighter.id}
      type="button"
      onClick={() => onOpen(fighter)}
      aria-label={`Open scouting report for ${fighter.name}`}
    >
      <div className="watchlist-feature__topline">
        <span>#1 TO WATCH</span>
        <span className={`watch-status watch-status--${fighter.status.toLowerCase()}`}>{fighter.status}</span>
      </div>

      <div className="watchlist-feature__identity">
        <WatchFighterPhoto fighter={fighter} />
        <div>
          <p className="eyebrow">SHANE’S CURRENT #1</p>
          <h2>{fighter.name}</h2>
          <span>{fighter.division} · {fighter.ufcRecord} UFC</span>
        </div>
      </div>

      <blockquote>“{fighter.boardNote}”</blockquote>
    </button>
  );
}

function RankedFighterRow({
  fighter,
  onOpen,
}: {
  fighter: ShaneWatchFighter;
  onOpen: (fighter: ShaneWatchFighter) => void;
}) {
  return (
    <button
      className="watchlist-rank-row"
      id={fighter.id}
      type="button"
      onClick={() => onOpen(fighter)}
      aria-label={`Open scouting report for ${fighter.name}`}
    >
      <strong className="watchlist-rank-row__rank">#{fighter.rank}</strong>
      <WatchFighterPhoto fighter={fighter} />
      <span className="watchlist-rank-row__identity">
        <b>{fighter.name}</b>
        {fighter.nickname ? <em>“{fighter.nickname}”</em> : null}
        <small>{fighter.division} · {fighter.ufcRecord} UFC</small>
      </span>
      <span className="watchlist-rank-row__signals">
        <WatchMovementBadge fighter={fighter} />
      </span>
    </button>
  );
}

function ScoutingReport({ fighter, onClose }: { fighter: ShaneWatchFighter; onClose: () => void }) {
  return createPortal(
    <div
      className="watchlist-scouting-overlay"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        className="watchlist-scouting-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="watchlist-scouting-title"
      >
        <div className="watchlist-scouting-card__handle" aria-hidden="true" />
        <header className="watchlist-scouting-card__header">
          <div>
            <p className="eyebrow">SHANE’S RANKING · #{fighter.rank}</p>
            <h2 id="watchlist-scouting-title">{fighter.name}</h2>
            {fighter.nickname ? <strong>“{fighter.nickname}”</strong> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Close scouting report" autoFocus>×</button>
        </header>

        <div className="watchlist-scouting-card__identity">
          <WatchFighterPhoto fighter={fighter} />
          <div>
            <span className={`watch-status watch-status--${fighter.status.toLowerCase()}`}>{fighter.status}</span>
            <strong>{fighter.division}</strong>
            <small>Age {fighter.age} · {fighter.country}</small>
          </div>
        </div>

        <section className="watchlist-scouting-card__read" aria-label="Scouting snapshot">
          <span>SCOUTING SNAPSHOT</span>
          <p>{fighter.scoutingSnapshot}</p>
        </section>

        <div className="watchlist-scouting-card__stats" aria-label={`${fighter.name} UFC statistics`}>
          <div><strong>{fighter.ufcRecord}</strong><span>UFC RECORD</span></div>
          <div><strong>{fighter.ufcWinStreak}</strong><span>UFC WIN STREAK</span></div>
          <div><strong>{fighter.ufcFinishes}</strong><span>UFC FINISHES</span></div>
        </div>

        <section className="watchlist-scouting-card__intel" aria-label="Why this fighter is on Shane's board">
          <span>WHY HE’S ON THE BOARD</span>
          <strong>{fighter.whyOnBoard}</strong>
        </section>

        <div className="watchlist-scouting-card__actions">
          <a className="primary-action" href={fighter.videoUrl} target="_blank" rel="noopener noreferrer">
            WATCH FIGHT HIGHLIGHT ↗
          </a>
          <a className="secondary-action" href={fighter.ufcUrl} target="_blank" rel="noopener noreferrer">
            VIEW UFC PROFILE ↗
          </a>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function MovementSummary() {
  const movements = shanesWatchlist.fighters.map(watchMovement);
  const newCount = movements.filter((movement) => movement.direction === "new").length;
  const movedCount = movements.filter((movement) => movement.direction === "up" || movement.direction === "down").length;
  const heldCount = movements.filter((movement) => movement.direction === "same").length;

  return (
    <section className="watchlist-movement-summary" aria-label={`${shanesWatchlist.lastUpdated} movement summary`}>
      <div><strong>{newCount}</strong><span>NEW</span></div>
      <div><strong>{movedCount}</strong><span>MOVED</span></div>
      <div><strong>{heldCount}</strong><span>HELD</span></div>
    </section>
  );
}

export default function ShanesWatchlistPage() {
  const [featured, ...rankedFighters] = shanesWatchlist.fighters;
  const openSpots = shanesWatchlist.capacity - shanesWatchlist.fighters.length;
  const [selectedFighterId, setSelectedFighterId] = useState<string | null>(() => fighterIdFromHash());
  const selectedFighter = shanesWatchlist.fighters.find((fighter) => fighter.id === selectedFighterId) ?? null;

  const openScoutingReport = (fighter: ShaneWatchFighter) => {
    setSelectedFighterId(fighter.id);
    replaceFighterHash(fighter.id);
  };

  const closeScoutingReport = () => {
    setSelectedFighterId(null);
    replaceFighterHash(null);
  };

  useEffect(() => {
    const syncHash = () => setSelectedFighterId(fighterIdFromHash());
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (!selectedFighter) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSelectedFighterId(null);
      replaceFighterHash(null);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedFighter]);

  return (
    <div className="page watchlist-page">
      <Link className="watchlist-back" to="/">← Back to Home</Link>

      <section className="page-heading watchlist-page__heading">
        <p className="eyebrow">SCOUTING BOARD</p>
        <h1>{shanesWatchlist.title}</h1>
        <p>{shanesWatchlist.subtitle}</p>
        <p className="watchlist-page__meta">
          <strong>{shanesWatchlist.fighters.length} OF {shanesWatchlist.capacity} SPOTS FILLED</strong>
          <span>·</span>
          <small>UPDATED {shanesWatchlist.lastUpdated.toUpperCase()}</small>
        </p>
      </section>

      <FeaturedFighter fighter={featured} onOpen={openScoutingReport} />

      <section className="watchlist-board" aria-label="Current rankings">
        <div className="watchlist-rank-list">
          {rankedFighters.map((fighter) => (
            <RankedFighterRow fighter={fighter} key={fighter.id} onOpen={openScoutingReport} />
          ))}
        </div>
      </section>

      <section className="watchlist-open-summary" aria-label={`${openSpots} open ranked spots`}>
        <strong>{openSpots} SPOTS OPEN</strong>
        <p>Nobody else has earned a place on Shane’s board yet.</p>
      </section>

      <MovementSummary />

      <section className="surface-card watchlist-former" aria-labelledby="watchlist-former-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">HISTORY</p>
            <h2 id="watchlist-former-title">Former Picks</h2>
          </div>
        </div>
        {shanesWatchlist.formerFighters.length ? (
          <div className="watchlist-former__list">
            {shanesWatchlist.formerFighters.map((fighter) => (
              <article key={fighter.id}>
                <strong>{fighter.name}</strong>
                <span>Peak rank #{fighter.peakRank}</span>
                <p>{fighter.exitNote}</p>
                <small>{fighter.added} – {fighter.removed}</small>
              </article>
            ))}
          </div>
        ) : (
          <p className="watchlist-former__empty">
            No former picks yet. Fighters who leave the Top 15 will stay here with their peak rank and Shane’s final assessment.
          </p>
        )}
      </section>

      {selectedFighter ? <ScoutingReport fighter={selectedFighter} onClose={closeScoutingReport} /> : null}
    </div>
  );
}
