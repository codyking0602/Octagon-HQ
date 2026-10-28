import type { CSSProperties } from "react";
import { MLB_OWNER_PLAYER_SPOTLIGHT } from "./mlbTeamAssets";

export function MlbPlayerSpotlight({ compact = false }: { compact?: boolean }) {
  const player = MLB_OWNER_PLAYER_SPOTLIGHT;

  return (
    <article
      className={`football-player-spotlight${compact ? " mlb-player-spotlight--compact" : ""}`}
      aria-label="MLB Player Spotlight"
      style={{ "--player-team-color": player.teamColor } as CSSProperties}
    >
      {compact ? (
        <a className="football-player-spotlight__media mlb-player-spotlight__profile-media"
          href={player.profileUrl} target="_blank" rel="noreferrer" aria-label={`View ${player.name} MLB player profile`}>
          <img src={player.photoUrl} alt={player.name} loading="lazy" />
        </a>
      ) : (
        <div className="football-player-spotlight__media">
          <img src={player.photoUrl} alt={player.name} loading="lazy" />
        </div>
      )}
      <div className="football-player-spotlight__copy">
        <span>PLAYER SPOTLIGHT</span>
        <h3>
          <a className="mlb-player-spotlight__name-link" href={player.profileUrl} target="_blank" rel="noreferrer">
            {player.name}
          </a>
        </h3>
        <strong>{player.team.toUpperCase()} · {player.position}</strong>
        <div className="football-player-spotlight__stats" aria-label={`${player.name} featured game stats`}>
          {player.stats.map((stat) => (
            <span key={stat.label}><b>{stat.value}</b><small>{stat.label}</small></span>
          ))}
        </div>
        <p className="football-player-spotlight__meta">{player.meta}</p>
        <a className="mlb-player-spotlight__watch" href={player.highlightUrl} target="_blank" rel="noreferrer">
          WATCH HIGHLIGHT ↗
        </a>
      </div>
    </article>
  );
}
