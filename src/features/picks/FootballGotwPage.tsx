import { Link, useSearchParams } from "react-router-dom";
import { FootballMatchupBreakdowns } from "./FootballMatchupBreakdowns";
import { PicksProvider } from "./PicksProvider";
import { publishedFootballMatchup, usePublishedFootballWeek } from "../home/footballWeeklyPublication";

/**
 * Phone and bell Game of the Week alerts open the published editorial itself,
 * even when this game is not part of the current Football Picks slate.
 */
function FootballGotwContent() {
  const [params] = useSearchParams();
  const published = usePublishedFootballWeek();
  const league = params.get("league");
  const weekOf = params.get("week");
  const sport = league === "nfl" || league === "cfb" ? league : null;
  const item = sport ? published?.[sport] : null;
  const matchesRequestedWeek = item && (!weekOf || item.week_of === weekOf);
  const breakdown = sport && item && matchesRequestedWeek
    ? publishedFootballMatchup(sport, item) : null;

  return (
    <main className="page football-gotw-page">
      <header className="surface-card">
        <p className="eyebrow">FOOTBALL HQ · GAME OF THE WEEK</p>
        <h1>{breakdown?.title ?? "Game of the Week"}</h1>
        <p>{breakdown
          ? "The HQ matchup breakdown."
          : published === undefined ? "Loading the published matchup…"
          : "That week's published breakdown is no longer available here."}</p>
        <Link to="/football/picks">FOOTBALL PICKS</Link>
      </header>
      {breakdown ? (
        <FootballMatchupBreakdowns
          breakdowns={[breakdown]}
          requestedBreakdownId={breakdown.id}
        />
      ) : null}
    </main>
  );
}

export default function FootballGotwPage() {
  return <PicksProvider sport="football"><FootballGotwContent /></PicksProvider>;
}
