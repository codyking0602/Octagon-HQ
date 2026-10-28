import { Link } from "react-router-dom";
import type { DailyChallengeChampionshipSnapshot } from "../play/dailyChallengeChampionship";
import type { PlaySport } from "../play/playRegistry";

/** Contextual link only: all season standings now live in the Championship hub. */
export function WeeklyGamesStandingLink({
  sport, standing, loading, signedIn,
}: {
  sport: PlaySport;
  standing: DailyChallengeChampionshipSnapshot | null;
  loading: boolean;
  signedIn: boolean;
}) {
  const summary = !signedIn ? "SIGN IN TO TRACK"
    : loading && !standing ? "LOADING"
      : "DAILY + FEATURED RESULTS";
  return (
    <Link className="home-weekly-games-row" to={"/championship/" + sport + "?tab=play"}
      aria-label={"Open " + (sport === "football" ? "Football" : "UFC") + " Play leaderboard"}>
      <span className="home-weekly-games-row__copy">
        <small>PLAY STANDINGS</small>
        <strong>{summary}</strong>
      </span>
      <b>VIEW →</b>
    </Link>
  );
}
