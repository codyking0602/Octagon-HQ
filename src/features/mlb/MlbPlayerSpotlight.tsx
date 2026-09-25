import type { CSSProperties } from "react";
import { MLB_OWNER_PLAYER_SPOTLIGHT } from "./mlbTeamAssets";

export function MlbPlayerSpotlight() {
  const player = MLB_OWNER_PLAYER_SPOTLIGHT;

  return (
    <article
      className="football-player-spotlight"
      aria-label="MLB Player Spotlight"
      style={{ "--player-team-color": player.teamColor } as CSSProperties}
    >
      <div className="football-player-spotlight__media">
        <img src={player.photoUrl} alt={player.name} loading="lazy" />
      </div>
      <div className="football-player-spotlight__copy">
        <span>PLAYER SPOTLIGHT</span>
        <h3>{player.name}</h3>
        <strong>{player.team.toUpperCase()} · {player.position}</strong>
        <div className="football-player-spotlight__stats" aria-label={`${player.name} 2026 season stats`}>
          {player.stats.map((stat) => (
            <span key={stat.label}>
              <b>{stat.value}</b>
              <small>{stat.label}</small>
            </span>
          ))}
        </div>
        <p className="football-player-spotlight__meta">{player.meta}</p>
        <a href={player.highlightUrl} target="_blank" rel="noreferrer">
          WATCH HIGHLIGHT ↗
        </a>
      </div>
    </article>
  );
}
