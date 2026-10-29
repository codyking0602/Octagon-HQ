import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useIdentity } from "../identity/IdentityProvider";
import { formatChampionshipPoints } from "./mlbChampionship";
import { useMlbChampionship } from "./useMlbChampionship";
import MlbPicksPage from "./MlbPicksPage";
import { MlbSeasonArchive } from "./MlbSeasonArchive";
import { loadMlbSeasonRecap, type MlbSeasonRecap } from "./mlbSeasonRecap";
import { MlbPlaySeasonSummary } from "./MlbPlaySeasonSummary";
import "../../styles/mlb-postseason-recap.css";

export default function MlbPostseasonRecapPage() {
  const identity = useIdentity();
  const signedIn = Boolean(identity.profile?.id);
  const { championship, loading, error } = useMlbChampionship(signedIn, 2026);
  const own = championship?.own;
  const [seasonRecap, setSeasonRecap] = useState<MlbSeasonRecap | null>(null);
  const [recapError, setRecapError] = useState("");
  useEffect(() => {
    let active = true;
    if (!signedIn) return;
    void loadMlbSeasonRecap(2026).then(data => {
      if (active) { setSeasonRecap(data); setRecapError(""); }
    }).catch(() => { if (active) setRecapError("Detailed results temporarily unavailable."); });
    return () => { active = false; };
  }, [signedIn]);

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
              <>
              <p className="mlb-postseason-recap__scoring-caption">Points earned toward the 100-point championship · not the number of picks correct</p>
              <div className="mlb-postseason-recap__lanes">
                <div><span>SERIES PICKS</span><strong>{own ? formatChampionshipPoints(own.series_points) : "—"}</strong><small>OF {championship.seriesMax} MAX</small><b>{own ? `#${own.series_rank} PLACE` : "NO RESULT"}</b></div>
                <div><span>BRACKET</span><strong>{own ? formatChampionshipPoints(own.bracket_points) : "—"}</strong><small>OF {championship.bracketMax} MAX</small><b>{own ? `#${own.bracket_rank} PLACE` : "NO RESULT"}</b></div>
                <div><span>PLAY</span><strong>{own ? formatChampionshipPoints(own.play_points) : "—"}</strong><small>OF {championship.playMax} MAX</small><b>{own ? `#${own.play_rank} PLACE` : "NO RESULT"}</b></div>
              </div>
              </>
            ) : null}
          </section>
          <MlbPicksPage archiveMode archiveSeriesPicks={seasonRecap?.seriesPicks ?? []} />
          <MlbPlaySeasonSummary championship={championship} recap={seasonRecap} error={recapError} currentProfileId={identity.profile?.id ?? null} />
          <MlbSeasonArchive profileId={identity.profile?.id ?? null} />
        </>
      ) : <section className="surface-card mlb-state-card">
        <h2>2026 results</h2><p>Sign in to review finished brackets, picks, Play scoring, and standings.</p>
        <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN</button>
      </section>}
    </div>
  );
}
