import type { CSSProperties } from "react";
import { MLB_OWNER_PLAYER_SPOTLIGHT } from "./mlbTeamAssets";

export function MlbPlayerSpotlight() {
  const player = MLB_OWNER_PLAYER_SPOTLIGHT;

  return (
    <article
      className="mlb-player-spotlight"
      aria-label="MLB Player Spotlight"
      style={{ "--mlb-player-team-color": player.teamColor } as CSSProperties}
    >
      <div className="mlb-player-spotlight__media">
        <img src={player.photoUrl} alt={player.name} loading="lazy" />
      </div>
      <div className="mlb-player-spotlight__copy">
        <span>PLAYER SPOTLIGHT</span>
        <h3>{player.name}</h3>
        <strong>{player.team.toUpperCase()} · {player.position}</strong>
        <div className="mlb-player-spotlight__stats" aria-label={`${player.name} 2026 season stats`}>
          {player.stats.map((stat) => (
            <span key={stat.label}>
              <b>{stat.value}</b>
              <small>{stat.label}</small>
            </span>
          ))}
        </div>
        <p className="mlb-player-spotlight__meta">{player.meta}</p>
      </div>
    </article>
  );
}
