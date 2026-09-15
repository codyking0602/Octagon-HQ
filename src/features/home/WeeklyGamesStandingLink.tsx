import { Link } from "react-router-dom";
import type { DailyChallengeChampionshipSnapshot } from "../play/dailyChallengeChampionship";
import type { PlaySport } from "../play/playRegistry";

function titleCountLabel(count: number) {
  return `${count} ${count === 1 ? "title" : "titles"}`;
}

export function WeeklyGamesStandingLink({
  sport,
  standing,
  loading,
  signedIn,
}: {
  sport: PlaySport;
  standing: DailyChallengeChampionshipSnapshot | null;
  loading: boolean;
  signedIn: boolean;
}) {
  const destination = sport === "football"
    ? "/football?standings=me#championship-standings"
    : "/play?standings=me#championship-standings";
  const summary = !signedIn
    ? "SIGN IN TO TRACK"
    : loading && !standing
      ? "LOADING"
      : standing
        ? `#${standing.rank} overall · ${titleCountLabel(standing.weeklyTitles)}`
        : "NO STANDING YET";

  return (
    <Link
      className="home-weekly-games-row"
      to={destination}
      aria-label={`View ${sport === "football" ? "Football" : "UFC"} Championship Standings`}
    >
      <span className="home-weekly-games-row__copy">
        <small>WEEKLY GAMES</small>
        <strong>{summary}</strong>
      </span>
      <b>VIEW →</b>
    </Link>
  );
}
