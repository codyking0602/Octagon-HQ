import { formatChampionshipPoints, type MlbChampionship } from "./mlbChampionship";

type Props = {
  championship: MlbChampionship;
  className?: string;
};

export default function MlbChampionshipSummary({ championship, className = "" }: Props) {
  const own = championship.own;
  if (!own) return null;

  const playerCount = championship.standings.length;
  return (
    <section className={`mlb-championship-summary ${className}`.trim()} aria-label="MLB Championship score breakdown">
      <header>
        <div>
          <span>MLB CHAMPIONSHIP</span>
          <strong>#{own.overall_rank} OF {playerCount}</strong>
        </div>
        <b>{formatChampionshipPoints(own.total_points)} <small>/ {championship.totalMax} PTS</small></b>
      </header>
      <div className="mlb-championship-summary__lanes">
        <span>
          <small>SERIES PICKS</small>
          <strong>{formatChampionshipPoints(own.series_points)} / {championship.seriesMax}</strong>
          <em>#{own.series_rank}</em>
        </span>
        <span>
          <small>BRACKET</small>
          <strong>{formatChampionshipPoints(own.bracket_points)} / {championship.bracketMax}</strong>
          <em>#{own.bracket_rank}</em>
        </span>
        <span>
          <small>PLAY</small>
          <strong>{formatChampionshipPoints(own.play_points)} / {championship.playMax}</strong>
          <em>#{own.play_rank}</em>
        </span>
      </div>
    </section>
  );
}
