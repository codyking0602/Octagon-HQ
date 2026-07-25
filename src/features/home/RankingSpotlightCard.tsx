import { Link } from "react-router-dom";
import { FighterPhoto } from "../rankings/FighterPhoto";
import type { RankingFighter } from "../rankings/rankingModel";
import { resolveProfileWatchAction } from "../rankings/rankingPresentation";

export function RankingSpotlightCard({ fighter }: { fighter: RankingFighter }) {
  const watchAction = resolveProfileWatchAction(fighter.slug);

  return (
    <section className="surface-card ranking-spotlight" aria-labelledby="ranking-spotlight-title">
      <div className="ranking-spotlight__fighter">
        <FighterPhoto
          className="ranking-spotlight__photo"
          name={fighter.name}
          src={fighter.thumbUrl}
        />
        <div>
          <p className="eyebrow">RANKING SPOTLIGHT</p>
          <h2 id="ranking-spotlight-title">{fighter.name}</h2>
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
        <Link className="secondary-action" to={`/fighters/${fighter.slug}`}>
          VIEW PROFILE →
        </Link>
      </div>
    </section>
  );
}
