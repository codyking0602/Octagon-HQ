import { formatChampionshipPoints, type MlbChampionship } from "./mlbChampionship";

type Props = {
  championship: MlbChampionship;
  className?: string;
};

export default function MlbChampionshipSummary({ championship, className = "" }: Props) {
  const own = championship.own;
  if (!own) return null;

  return (
    <section className={`mlb-championship-summary ${className}`.trim()} aria-label="Your MLB Championship score">
      <header>
        <div>
          <span>YOUR SCORE</span>
          <strong>#{own.overall_rank} OVERALL</strong>
        </div>
        <b>{formatChampionshipPoints(own.total_points)} <small>PTS</small></b>
      </header>
      <div className="mlb-championship-summary__lanes">
        <span>
          <small>SERIES</small>
          <strong>{formatChampionshipPoints(own.series_points)} PTS</strong>
        </span>
        <span>
          <small>BRACKET</small>
          <strong>{formatChampionshipPoints(own.bracket_points)} PTS</strong>
        </span>
        <span>
          <small>PLAY</small>
          <strong>{formatChampionshipPoints(own.play_points)} PTS</strong>
        </span>
      </div>
    </section>
  );
}
