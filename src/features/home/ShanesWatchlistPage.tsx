import { useEffect } from "react";
import { Link } from "react-router-dom";
import { WatchFighterPhoto, WatchMovementBadge } from "./ShanesWatchlistCard";
import { shanesWatchlist, watchMovement, type ShaneWatchFighter } from "./shanesWatchlist";

function FeaturedFighter({ fighter }: { fighter: ShaneWatchFighter }) {
  return (
    <article className="watchlist-feature" id={fighter.id}>
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

      <blockquote>“{fighter.scoutingNote}”</blockquote>
    </article>
  );
}

function RankedFighterRow({ fighter }: { fighter: ShaneWatchFighter }) {
  return (
    <article className="watchlist-rank-row" id={fighter.id}>
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
    </article>
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

  useEffect(() => {
    const fighterId = window.location.hash.slice(1);
    if (!fighterId) return;
    document.getElementById(fighterId)?.scrollIntoView({ block: "start" });
  }, []);

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

      <FeaturedFighter fighter={featured} />

      <section className="watchlist-board" aria-label="Current rankings">
        <div className="watchlist-rank-list">
          {rankedFighters.map((fighter) => <RankedFighterRow fighter={fighter} key={fighter.id} />)}
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
    </div>
  );
}
