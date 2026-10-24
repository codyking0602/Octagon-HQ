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

export function ShanesWatchlistCard({ compact = false }: { compact?: boolean }) {
  const [featured, ...ranked] = shanesWatchlist.fighters;
  const nextFighters = ranked.slice(0, 2);

  // The same two-row density and frame used by Football's Featured Games.
  if (compact) return (
    <section className="football-hq-games ufc-contender-series" id="shanes-watchlist" aria-labelledby="shanes-watchlist-title">
      <header>
        <span id="shanes-watchlist-title">SHANE'S CONTENDER SERIES</span>
        <Link className="ufc-contender-series__full" to="/fighters-to-watch">FULL BOARD →</Link>
      </header>
      <div className="ufc-contender-series__list">
        <Link className="ufc-contender-series__lead" to={`/fighters-to-watch#${featured.id}`}>
          <strong>#{featured.rank}</strong>
          <WatchFighterPhoto fighter={featured} />
          <span><b>{featured.name}</b><small>{featured.division} · {featured.ufcRecord} UFC</small></span>
          <span className={`watch-status watch-status--${featured.status.toLowerCase()}`}>{featured.status}</span>
        </Link>
        <div className="ufc-contender-series__pair">
          {nextFighters.map((fighter) => (
            <Link key={fighter.id} to={`/fighters-to-watch#${fighter.id}`}>
              <strong>#{fighter.rank}</strong>
              <WatchFighterPhoto fighter={fighter} />
              <span><b>{fighter.name}</b><small>{fighter.division} · {fighter.ufcRecord} UFC</small></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <section className="surface-card shane-watchlist-preview" id="shanes-watchlist" aria-labelledby="shanes-watchlist-title">
      <div className="shane-watchlist-preview__heading">
        <div>
          <p className="eyebrow">SHANE KING’S CONTENDER SERIES</p>
          <h2 id="shanes-watchlist-title">Fighters to Watch</h2>
        </div>
        <span>{shanesWatchlist.fighters.length} / {shanesWatchlist.capacity}</span>
      </div>

      <Link className="shane-watchlist-featured" to={`/fighters-to-watch#${featured.id}`}>
        <strong className="shane-watchlist-featured__rank">#1</strong>
        <WatchFighterPhoto fighter={featured} />
        <span className="shane-watchlist-featured__identity">
          <b>{featured.name}</b>
          <small>{featured.division} · {featured.ufcRecord} UFC</small>
        </span>
        <span className={`watch-status watch-status--${featured.status.toLowerCase()}`}>{featured.status}</span>
      </Link>

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
        VIEW FULL BOARD →
      </Link>
    </section>
  );
}
