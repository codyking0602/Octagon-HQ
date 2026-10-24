import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { FighterPhoto } from "../rankings/FighterPhoto";
import type { RankingFighter } from "../rankings/rankingModel";
import { resolveWatchMomentAction } from "../rankings/rankingPresentation";


export function RankingSpotlightCard({ fighter, compact = false }: { fighter: RankingFighter; compact?: boolean }) {
  const watchAction = resolveWatchMomentAction(fighter.slug);

  // Match the locked Football Player Spotlight structure without changing its component.
  if (compact) return (
    <article
      className="football-player-spotlight ufc-fighter-spotlight"
      aria-label="UFC Fighter Spotlight"
      style={{ "--player-team-color": "#e50914", "--player-team-secondary": "#a90918" } as CSSProperties}
    >
      <div className="football-player-spotlight__media">
        <FighterPhoto className="ufc-fighter-spotlight__photo" name={fighter.displayName} src={fighter.thumbUrl} />
      </div>
      <div className="football-player-spotlight__copy">
        <span>FIGHTER SPOTLIGHT</span>
        <h3>{fighter.displayName}</h3>
        <strong>{fighter.division.toUpperCase()}</strong>
        <div className="football-player-spotlight__stats" aria-label="Fighter ranking and statistics">
          <span><b>#{fighter.rank}</b><small>ALL-TIME</small></span>
          <span><b>{fighter.visibleStats.ufcRecord}</b><small>UFC RECORD</small></span>
          <span><b>{fighter.ovr}</b><small>OVR</small></span>
        </div>
        <p className="football-player-spotlight__meta">{fighter.resumeTag}</p>
        <div className="ufc-fighter-spotlight__actions">
          {watchAction ? <a href={watchAction.url} target="_blank" rel="noopener noreferrer">WATCH HIGHLIGHTS ↗</a> : null}
          <Link to={`/fighters/${fighter.slug}`}>VIEW PROFILE →</Link>
        </div>
      </div>
    </article>
  );

  return (
    <section className="surface-card ranking-spotlight" aria-labelledby="ranking-spotlight-title">
      <div className="ranking-spotlight__fighter">
        <FighterPhoto
          className="ranking-spotlight__photo"
          name={fighter.displayName}
          src={fighter.thumbUrl}
        />
        <div className="ranking-spotlight__copy">
          <p className="eyebrow">RANKING SPOTLIGHT</p>
          <h2 id="ranking-spotlight-title">{fighter.displayName}</h2>
          <p>
            <b>#{fighter.rank} ALL-TIME</b>
            <span aria-hidden="true"> · </span>
            {fighter.division}
            <span aria-hidden="true"> · </span>
            {fighter.visibleStats.ufcRecord}
            <span aria-hidden="true"> · </span>
            {fighter.ovr} OVR
          </p>
        </div>
      </div>

      <div className="ranking-spotlight__actions">
        {watchAction ? (
          <a
            className="secondary-action ranking-spotlight__watch"
            href={watchAction.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            WATCH MOMENT ↗
          </a>
        ) : null}
        <Link
          className="secondary-action"
          to={`/fighters/${fighter.slug}`}
        >
          VIEW PROFILE →
        </Link>
      </div>
    </section>
  );
}
