import { useEffect } from "react";
import { Link } from "react-router-dom";
import { WatchFighterPhoto, WatchMovementBadge } from "./ShanesWatchlistCard";
import { shanesWatchlist, type ShaneWatchFighter } from "./shanesWatchlist";

function FighterStats({ fighter }: { fighter: ShaneWatchFighter }) {
  const stats = [
    ["PRO RECORD", fighter.proRecord],
    ["UFC RECORD", fighter.ufcRecord],
    ["WIN STREAK", fighter.winStreak],
    ["FINISHES", fighter.finishes],
  ] as const;

  return (
    <div className="watchlist-stat-grid">
      {stats.map(([label, value]) => (
        <div key={label}><strong>{value}</strong><span>{label}</span></div>
      ))}
    </div>
  );
}

function FeaturedFighter({ fighter }: { fighter: ShaneWatchFighter }) {
  return (
    <article className="watchlist-feature" id={fighter.id}>
      <div className="watchlist-feature__topline">
        <span>#1 TO WATCH</span>
        <div>
          <span className={`watch-status watch-status--${fighter.status.toLowerCase()}`}>{fighter.status}</span>
          <WatchMovementBadge fighter={fighter} />
        </div>
      </div>

      <div className="watchlist-feature__identity">
        <WatchFighterPhoto fighter={fighter} />
        <div>
          <p className="eyebrow">SHANE’S CURRENT #1</p>
          <h2>{fighter.name}</h2>
          {fighter.nickname ? <strong>“{fighter.nickname}”</strong> : null}
          <span>{fighter.division} · Age {fighter.age} · {fighter.country}</span>
        </div>
      </div>

      <FighterStats fighter={fighter} />
      <blockquote>“{fighter.scoutingNote}”</blockquote>

      <div className="watchlist-detail-grid">
        <div><span>STYLE COMP</span><strong>{fighter.comparison || "—"}</strong></div>
        <div><span>WHY HE’S HERE</span><strong>{fighter.highlight}</strong></div>
        <div><span>TRACKED SINCE</span><strong>{fighter.added}</strong></div>
        <div><span>LAST REVIEWED</span><strong>{fighter.lastReviewed}</strong></div>
      </div>

      <a className="secondary-action" href={fighter.ufcUrl} target="_blank" rel="noopener noreferrer">
        VIEW UFC PROFILE ↗
      </a>
    </article>
  );
}

function RankedFighterRow({ fighter }: { fighter: ShaneWatchFighter }) {
  return (
    <details className="watchlist-rank-row" id={fighter.id}>
      <summary>
        <strong className="watchlist-rank-row__rank">#{fighter.rank}</strong>
        <WatchFighterPhoto fighter={fighter} />
        <span className="watchlist-rank-row__identity">
          <b>{fighter.name}</b>
          {fighter.nickname ? <em>“{fighter.nickname}”</em> : null}
          <small>{fighter.division} · {fighter.ufcRecord} UFC</small>
        </span>
        <span className="watchlist-rank-row__signals">
          <span className={`watch-status watch-status--${fighter.status.toLowerCase()}`}>{fighter.status}</span>
          <WatchMovementBadge fighter={fighter} />
        </span>
      </summary>

      <div className="watchlist-rank-row__body">
        <FighterStats fighter={fighter} />
        <blockquote>“{fighter.scoutingNote}”</blockquote>
        <div className="watchlist-detail-grid">
          <div><span>STYLE COMP</span><strong>{fighter.comparison || "—"}</strong></div>
          <div><span>MOMENTUM</span><strong>{fighter.highlight}</strong></div>
          <div><span>TRACKED SINCE</span><strong>{fighter.added}</strong></div>
          <div><span>LAST REVIEWED</span><strong>{fighter.lastReviewed}</strong></div>
        </div>
        <a className="secondary-action" href={fighter.ufcUrl} target="_blank" rel="noopener noreferrer">
          VIEW UFC PROFILE ↗
        </a>
      </div>
    </details>
  );
}

export default function ShanesWatchlistPage() {
  const [featured, ...rankedFighters] = shanesWatchlist.fighters;

  useEffect(() => {
    const fighterId = window.location.hash.slice(1);
    if (!fighterId) return;
    const target = document.getElementById(fighterId);
    if (target instanceof HTMLDetailsElement) target.open = true;
    target?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <div className="page watchlist-page">
      <Link className="watchlist-back" to="/">← Back to Home</Link>

      <section className="page-heading watchlist-page__heading">
        <p className="eyebrow">SCOUTING BOARD</p>
        <h1>{shanesWatchlist.title}</h1>
        <p>{shanesWatchlist.subtitle}</p>
        <div>
          <strong>{shanesWatchlist.fighters.length} / {shanesWatchlist.capacity}</strong>
          <span>ranked spots filled</span>
          <small>Updated {shanesWatchlist.lastUpdated}</small>
        </div>
      </section>

      <FeaturedFighter fighter={featured} />

      <section className="surface-card watchlist-board" aria-labelledby="watchlist-current-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CURRENT RANKINGS</p>
            <h2 id="watchlist-current-title">The Top 15</h2>
            <p>Tap any fighter to open Shane’s full scouting card.</p>
          </div>
        </div>
        <div className="watchlist-rank-list">
          {rankedFighters.map((fighter) => <RankedFighterRow fighter={fighter} key={fighter.id} />)}
          {Array.from({ length: shanesWatchlist.capacity - shanesWatchlist.fighters.length }, (_, index) => (
            <div className="watchlist-open-slot" key={index}>
              <strong>#{shanesWatchlist.fighters.length + index + 1}</strong>
              <span>OPEN SPOT</span>
            </div>
          ))}
        </div>
      </section>

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
