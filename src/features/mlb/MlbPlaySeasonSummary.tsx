
import { useEffect, useMemo, useState } from "react";
import { formatChampionshipPoints, type MlbChampionship } from "./mlbChampionship";
import type { MlbSeasonRecap } from "./mlbSeasonRecap";

export function MlbPlaySeasonSummary({ championship, recap, error, currentProfileId }: {
  championship: MlbChampionship | null;
  recap: MlbSeasonRecap | null;
  error: string;
  currentProfileId: string | null;
}) {
  const [selectedProfile, setSelectedProfile] = useState("");
  useEffect(() => {
    if (currentProfileId && !selectedProfile) setSelectedProfile(currentProfileId);
  }, [currentProfileId, selectedProfile]);
  const players = championship?.standings ?? [];
  const playerId = selectedProfile || currentProfileId || "";
  const player = players.find(entry => entry.profile_id === playerId) ?? null;
  const results = useMemo(() => (recap?.playResults ?? [])
    .filter(row => row.profile_id === playerId)
    .sort((a, b) => a.slot - b.slot), [recap, playerId]);
  const totalGames = new Set(recap?.playResults.map(result => result.challenge_key) ?? []).size;
  const firsts = results.filter(result => result.rank === 1).length;
  const seconds = results.filter(result => result.rank === 2).length;
  const averageScore = results.length ? Math.round(results.reduce((sum, result) => sum + result.raw_score, 0) / results.length) : 0;

  return <section className="mlb-play-season-summary" aria-label="2026 MLB Play season recap">
    <header className="mlb-play-season-summary__heading">
      <div><small>2026 POSTSEASON · PLAY</small><h2>Play season recap</h2></div><small>FINAL</small>
    </header>
    <p className="mlb-postseason-recap__scoring-caption">Every participant's completed challenges and placement points, using the original results.</p>
    {players.length ? <div className="mlb-play-season-summary__people" aria-label="Choose a participant to review Play results">
      {players.map(entry => <button key={entry.profile_id} type="button"
        className={playerId === entry.profile_id ? "is-selected" : ""} aria-pressed={playerId === entry.profile_id}
        onClick={() => setSelectedProfile(entry.profile_id)}>
        {entry.display_name}{entry.profile_id === currentProfileId ? " · YOU" : ""}
      </button>)}
    </div> : null}
    {error ? <p role="alert">{error}</p> : !recap ? <p role="status">Loading final Play results…</p> : (
      <>
        <div className="mlb-play-season-summary__stats">
          <div><strong>{results.length}/{totalGames}</strong><small>GAMES PLAYED</small></div>
          <div><strong>{firsts}</strong><small>FIRST PLACE</small></div>
          <div><strong>{seconds}</strong><small>SECOND PLACE</small></div>
        </div>
        <div className="mlb-play-season-summary__stats">
          <div><strong>{averageScore}</strong><small>AVG GAME SCORE</small></div>
          <div><strong>{player ? formatChampionshipPoints(player.play_points) : "—"}</strong><small>OF 25 PLAY PTS</small></div>
          <div><strong>{player ? "#" + player.play_rank : "—"}</strong><small>PLAY RANK</small></div>
        </div>
        <details className="mlb-play-season-summary__details">
          <summary>VIEW ALL {results.length} COMPLETED GAMES</summary>
          <div className="mlb-play-season-summary__rows">
            {results.map(result => (
              <div key={result.challenge_key} className="mlb-play-season-summary__row">
                <b>{result.slot}</b>
                <span><strong>{result.title}</strong>
                  <small>{result.date} · {formatChampionshipPoints(result.raw_score)} / 100 · #{result.rank} PLACE</small>
                </span>
                <em>+{formatChampionshipPoints(result.points)} PTS</em>
              </div>
            ))}
            {!results.length ? <p>No completed Play challenges for this participant.</p> : null}
          </div>
        </details>
      </>
    )}
  </section>;
}
