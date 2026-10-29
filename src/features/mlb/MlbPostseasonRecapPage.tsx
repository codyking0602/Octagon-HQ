import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { formatChampionshipPoints } from "./mlbChampionship";
import { useMlbChampionship } from "./useMlbChampionship";
import MlbPicksPage from "./MlbPicksPage";
import { MlbSeasonArchive } from "./MlbSeasonArchive";
import "../../styles/mlb-postseason-recap.css";

export default function MlbPostseasonRecapPage() {
  const identity = useIdentity();
  const signedIn = Boolean(identity.profile?.id);
  const { championship, loading, error } = useMlbChampionship(signedIn, 2026);
  const own = championship?.own;

  return (
    <div className="page mlb-postseason-recap" data-sport="mlb">
      <header className="mlb-postseason-recap__heading">
        <Link to="/#mlb-2026-standings">← CHAMPIONSHIP STANDINGS</Link>
        <small>SEASON COMPLETE · 2026</small>
        <h1>MLB Postseason</h1>
        <p>Our finished brackets, series picks, and Play championship results.</p>
      </header>
      {signedIn ? (
        <>
          <section className="mlb-postseason-recap__score" aria-label="Your 2026 championship summary">
            <header><span>2026 CHAMPIONSHIP</span><span>FINAL</span></header>
            {loading ? <p role="status">Loading final scores…</p>
              : error || !championship ? <p role="alert">Final scoring is temporarily unavailable.</p>
                : <div className="mlb-postseason-recap__hero">
                    <div><small>YOUR FINAL RANK</small><strong>{own ? `#${own.overall_rank}` : "—"}</strong><span>OF {championship.standings.length}</span></div>
                    <div><small>TOTAL POINTS</small><strong>{own ? formatChampionshipPoints(own.total_points) : "—"}</strong><span>OF {championship.totalMax}</span></div>
                  </div>}
            {championship ? (
              <div className="mlb-postseason-recap__lanes">
                <div><span>SERIES PICKS</span><strong>{own ? formatChampionshipPoints(own.series_points) : "—"} / {championship.seriesMax}</strong><small>{own ? `#${own.series_rank} FINISH` : "NO RESULT"}</small></div>
                <div><span>BRACKET</span><strong>{own ? formatChampionshipPoints(own.bracket_points) : "—"} / {championship.bracketMax}</strong><small>{own ? `#${own.bracket_rank} FINISH` : "NO RESULT"}</small></div>
                <div><span>PLAY</span><strong>{own ? formatChampionshipPoints(own.play_points) : "—"} / {championship.playMax}</strong><small>{own ? `#${own.play_rank} FINISH` : "NO RESULT"}</small></div>
              </div>
            ) : null}
          </section>
          <MlbPicksPage archiveMode />
          <MlbSeasonArchive profileId={identity.profile?.id ?? null} />
        </>
      ) : <section className="surface-card mlb-state-card">
        <h2>2026 results</h2><p>Sign in to review finished brackets, picks, Play scoring, and standings.</p>
        <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN</button>
      </section>}
    </div>
  );
}
