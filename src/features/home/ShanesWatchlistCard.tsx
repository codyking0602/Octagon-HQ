import { Link } from "react-router-dom";
import { FighterPhoto } from "../rankings/FighterPhoto";
import {
  shanesWatchlist,
  watchMovement,
  type ShaneWatchFighter,
} from "./shanesWatchlist";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export function WatchFighterPhoto({ fighter, className = "" }: { fighter: ShaneWatchFighter; className?: string }) {
  if (fighter.photoUrl) {
    return <FighterPhoto className={className} name={fighter.name} src={fighter.photoUrl} />;
  }

  return (
    <span className={`fighter-photo fighter-photo--fallback ${className}`} aria-hidden="true">
      {initials(fighter.name)}
    </span>
  );
}

export function WatchMovementBadge({ fighter }: { fighter: ShaneWatchFighter }) {
  const movement = watchMovement(fighter);
  return (
    <span className={`watch-movement watch-movement--${movement.direction}`}>
      {movement.label}
    </span>
  );
}

export function ShanesWatchlistCard() {
  const featured = shanesWatchlist.fighters[0];
  const nextFighters = shanesWatchlist.fighters.slice(1, 3);

  return (
    <section className="surface-card shane-watchlist-preview" id="shanes-watchlist" aria-labelledby="shanes-watchlist-title">
      <div className="shane-watchlist-preview__heading">
        <div>
          <p className="eyebrow">SCOUTING BOARD</p>
          <h2 id="shanes-watchlist-title">{shanesWatchlist.title}</h2>
          <p>{shanesWatchlist.subtitle}</p>
        </div>
        <span>{shanesWatchlist.fighters.length} OF {shanesWatchlist.capacity}</span>
      </div>

      <article className="shane-watchlist-featured">
        <div className="shane-watchlist-featured__topline">
          <strong>#1 TO WATCH</strong>
          <div>
            <span className={`watch-status watch-status--${featured.status.toLowerCase()}`}>{featured.status}</span>
            <WatchMovementBadge fighter={featured} />
          </div>
        </div>

        <div className="shane-watchlist-featured__identity">
          <WatchFighterPhoto fighter={featured} />
          <div>
            <h3>{featured.name}</h3>
            {featured.nickname ? <p>“{featured.nickname}”</p> : null}
            <small>{featured.division} · {featured.ufcRecord} UFC</small>
          </div>
        </div>

        <blockquote>“{featured.scoutingNote}”</blockquote>
        <div className="shane-watchlist-featured__footer">
          <span>STYLE COMP <strong>{featured.comparison || "—"}</strong></span>
          <span>{featured.highlight}</span>
        </div>
        <Link to={`/fighters-to-watch#${featured.id}`}>VIEW #1 DETAILS →</Link>
      </article>

      <div className="shane-watchlist-preview__next" aria-label="Next fighters on Shane's watchlist">
        {nextFighters.map((fighter) => (
          <Link to={`/fighters-to-watch#${fighter.id}`} key={fighter.id}>
            <strong>#{fighter.rank}</strong>
            <WatchFighterPhoto fighter={fighter} />
            <span>
              <b>{fighter.name}</b>
              <small>{fighter.division} · {fighter.ufcRecord} UFC</small>
            </span>
            <WatchMovementBadge fighter={fighter} />
          </Link>
        ))}
      </div>

      <Link className="shane-watchlist-preview__all" to="/fighters-to-watch">
        VIEW SHANE’S TOP 15 →
      </Link>
    </section>
  );
}
