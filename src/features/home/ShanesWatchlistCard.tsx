import { FighterPhoto } from "../rankings/FighterPhoto";
import { shanesWatchlist, type ShaneWatchFighter } from "./shanesWatchlist";

function WatchFighterCard({ fighter, index }: { fighter: ShaneWatchFighter; index: number }) {
  const stats = [
    ["PRO RECORD", fighter.proRecord],
    ["UFC RECORD", fighter.ufcRecord],
    ["WIN STREAK", fighter.winStreak],
    ["FINISHES", fighter.finishes],
  ] as const;

  return (
    <article className={`shane-watch-card${index === 0 ? " is-latest" : ""}`}>
      <div className="shane-watch-card__band">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <b>{fighter.status}</b>
        <time>{fighter.added}</time>
      </div>

      <div className="shane-watch-card__identity">
        <FighterPhoto name={fighter.name} src={fighter.photoUrl} />
        <div>
          <h3>{fighter.name}</h3>
          {fighter.nickname ? <p>“{fighter.nickname}”</p> : null}
        </div>
      </div>

      <p className="shane-watch-card__meta">
        {fighter.division} · Age {fighter.age} · {fighter.country}
      </p>

      <div className="shane-watch-card__stats">
        {stats.map(([label, value]) => (
          <div key={label}><strong>{value}</strong><span>{label}</span></div>
        ))}
      </div>

      <blockquote>“{fighter.scoutingNote}”</blockquote>

      <div className="shane-watch-card__footer">
        <span>COMP: <strong>{fighter.comparison || "—"}</strong></span>
        <span>{fighter.highlight}</span>
      </div>

      <a href={fighter.ufcUrl} target="_blank" rel="noopener noreferrer">
        VIEW UFC PROFILE <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

export function ShanesWatchlistCard() {
  return (
    <details className="home-collapsible shane-watchlist">
      <summary>
        <span className="home-collapsible__copy">
          <small>SCOUTING BOARD</small>
          <strong>{shanesWatchlist.title}</strong>
          <em>{shanesWatchlist.subtitle}</em>
        </span>
        <span className="home-collapsible__count">
          {shanesWatchlist.fighters.length} FIGHTERS
        </span>
      </summary>
      <div className="shane-watchlist__body">
        <div className="shane-watchlist__grid">
          {shanesWatchlist.fighters.map((fighter, index) => (
            <WatchFighterCard fighter={fighter} index={index} key={fighter.id} />
          ))}
        </div>
      </div>
    </details>
  );
}
