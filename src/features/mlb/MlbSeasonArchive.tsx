import { useEffect, useState } from "react";
import { loadMlbChampionship, formatChampionshipPoints, type MlbChampionship } from "./mlbChampionship";
import "../../styles/mlb-season-archive.css";

/** Permanent, read-only 2026 archive in Home standings. No scores are copied or reset. */
export function MlbSeasonArchive({ profileId }: { profileId: string | null }) {
  const [result, setResult] = useState<MlbChampionship | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setResult(null);
    setError(false);
    setLoading(Boolean(profileId));
    if (profileId) {
      void loadMlbChampionship(2026).then(data => {
        if (active) setResult(data);
      }).catch(() => {
        if (active) setError(true);
      }).finally(() => {
        if (active) setLoading(false);
      });
    }
    return () => { active = false; };
  }, [profileId]);

  return (
    <section id="mlb-2026-standings" className="mlb-season-archive" aria-labelledby="mlb-2026-archive-title">
      <div className="mlb-season-archive__header">
        <div>
          <small>SEASON ARCHIVE · 2026</small>
          <h2 id="mlb-2026-archive-title">MLB Postseason Standings</h2>
        </div>
        <span>FINAL RESULTS</span>
      </div>
      {!profileId ? <p>Sign in to view the preserved 2026 results.</p>
        : loading ? <p role="status">Loading 2026 standings…</p>
        : error || !result ? <p role="alert">2026 results are temporarily unavailable. Nothing has been reset.</p>
        : (
          <div className="mlb-season-archive__entries" aria-label="2026 MLB postseason final standings">
            <div className="mlb-season-archive__headings"><span>PLAYER</span><span>TOTAL POINTS</span></div>
            {[...result.standings].sort((a,b) => a.overall_rank - b.overall_rank).map(player => (
              <details key={player.profile_id} className="mlb-season-archive__entry">
                <summary>
                  <b>#{player.overall_rank}</b>
                  <span><strong>{player.display_name}</strong>{player.is_current_user ? <small>YOU</small> : null}</span>
                  <strong className="mlb-season-archive__points">{formatChampionshipPoints(player.total_points)} <small>PTS</small></strong>
                  <span aria-hidden="true">⌄</span>
                </summary>
                <div className="mlb-season-archive__breakdown">
                  <span>Series Picks <strong>{formatChampionshipPoints(player.series_points)} / {result.seriesMax} · #{player.series_rank}</strong></span>
                  <span>Bracket <strong>{formatChampionshipPoints(player.bracket_points)} / {result.bracketMax} · #{player.bracket_rank}</strong></span>
                  <span>Play <strong>{formatChampionshipPoints(player.play_points)} / {result.playMax} · #{player.play_rank}</strong></span>
                </div>
              </details>
            ))}
            {!result.standings.length ? <p>No archived scores are available yet.</p> : null}
          </div>
        )}
    </section>
  );
}
