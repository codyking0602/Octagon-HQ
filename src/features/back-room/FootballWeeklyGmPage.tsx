import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { weeklyGmRepository, type WeeklyGmStanding, type WeeklyGmStatus, type WeeklyGmScenario } from "../play/weeklyGmRepository";
import "../../styles/football-gm-mode.css";

const SCENARIOS = [
  { id: "elite" as const, title: "Elite QB", qb: "Josh Allen", note: "Steady development" },
  { id: "young" as const, title: "Young QB", qb: "Jaxson Dart", note: "Guaranteed breakout · 82 → 87" },
];

export default function FootballWeeklyGmPage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const [status, setStatus] = useState<WeeklyGmStatus | null>(null);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<{ standing: WeeklyGmStanding; scenario: WeeklyGmScenario } | null>(null);
  useEffect(() => {
    if (!identity.ready || !identity.profile?.id) return;
    let active = true;
    void weeklyGmRepository.status().then((value) => { if (active) setStatus(value); })
      .catch((reason) => { if (active) setError(String(reason instanceof Error ? reason.message : reason)); });
    return () => { active = false; };
  }, [identity.ready, identity.profile?.id]);

  if (!identity.ready) return null;
  return <main className="page football-gm-page">
    <header className="football-gm__header"><button type="button" onClick={() => navigate("/football?tab=play")}>← FOOTBALL PLAY</button>
      <span><small>OCT 13–19 · WEEKLY FEATURED</small><strong>THE GM CHAMPIONSHIP</strong></span><b>200 PTS</b></header>
    <section className="surface-card" style={{padding:"1rem", marginBottom:"1rem"}}>
      <p className="eyebrow">TWO FRANCHISES · ONE OFFICIAL ATTEMPT EACH</p>
      <h1>THE GM · WEEKLY CHAMPIONSHIP</h1>
      <p>Six random spins after your assigned quarterback. Three seasons, one offseason, $150M cap. Your two normal franchise scores are added together. No rerolls; Casual GM stays unlimited.</p>
      <p>Opens Tuesday, October 13 at midnight Central. Closes Monday, October 19 at 11:59 PM Central.</p>
      {!status ? <p role="status">{error || "Loading official competition…"}</p> : null}
    </section>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 270px), 1fr))",gap:"0.8rem",marginBottom:"1rem"}}>
      {SCENARIOS.map((item) => {
        const entry = status?.entries.find((one) => one.scenario === item.id);
        return <section key={item.id} className="surface-card" style={{padding:"1rem"}}>
          <p className="eyebrow">{item.title}</p><h2>{item.qb}</h2><p>{item.note}</p>
          <strong>{entry?.completed_at ? `COMPLETE · ${entry.score?.toFixed(1)} / 100` : entry ? "IN PROGRESS" : "NOT STARTED"}</strong>
          <div style={{marginTop:"0.8rem"}}>
            <button className="primary-action" type="button"
              disabled={!status?.is_open || !!entry?.completed_at}
              onClick={() => navigate(`/football/weekly-gm/run/${item.id}`)}>
              {entry?.completed_at ? "OFFICIAL RESULT SAVED" : entry ? "RESUME OFFICIAL RUN" : status?.is_open ? "START OFFICIAL RUN" : "ENTRY CLOSED"}
            </button>
          </div>
        </section>;
      })}
    </div>
    <section className="surface-card" style={{padding:"1rem"}}>
      <p className="eyebrow">LIVE CHAMPIONSHIP STANDINGS</p><h2>WEEKLY GM LEADERBOARD</h2>
      <p>Completed run scores are shown immediately. Unfinished runs contribute no points until completed.</p>
      <div style={{display:"grid",gap:".6rem"}}>
        {status?.standings.map((standing, index) => <div key={standing.profile_id} style={{borderBottom:"1px solid var(--border-color, #5555)",paddingBottom:".6rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:".5rem"}}>
            <strong>{index + 1}. {standing.display_name}</strong>
            <strong>{standing.total.toFixed(1)} / 200</strong>
          </div>
          <div style={{display:"flex",gap:".9rem",flexWrap:"wrap",marginTop:".3rem"}}>
            {SCENARIOS.map((scenario) => {
              const score = scenario.id === "elite" ? standing.elite_score : standing.young_score;
              return <button type="button" key={scenario.id} disabled={score === null}
                onClick={() => setDetails({standing, scenario:scenario.id})}>
                {scenario.qb}: {score === null ? "—" : `${score.toFixed(1)} ↗`}
              </button>;
            })}
          </div>
        </div>)}
        {status && !status.standings.length ? <p>No finished franchises yet. Be the first to post a score.</p> : null}
      </div>
    </section>
    {details ? <div role="presentation" style={{position:"fixed",inset:0,background:"#000b",zIndex:1000,display:"grid",placeItems:"center",padding:"1rem"}} onClick={() => setDetails(null)}>
      <section className="surface-card" role="dialog" aria-modal="true" aria-label="Completed GM franchise" onClick={(event) => event.stopPropagation()}
        style={{width:"min(560px,100%)",maxHeight:"85vh",overflow:"auto",padding:"1.2rem"}}>
        <button type="button" onClick={() => setDetails(null)}>✕ CLOSE</button>
        <p className="eyebrow">{details.scenario === "elite" ? "JOSH ALLEN" : "JAXSON DART"} · FINISHED FRANCHISE</p>
        <h2>{details.standing.display_name}</h2>
        {(() => {
          const result = details.scenario === "elite" ? details.standing.elite_result : details.standing.young_result;
          if (!result) return <p>Result unavailable.</p>;
          return <><h2>{result.score.toFixed(1)} / 100</h2>
            <p>GM performance: {result.rosterManagementScore.toFixed(1)} · Three-year results: {result.resumeScore.toFixed(1)}</p>
            {result.seasons.map((season) => <p key={season.year}>Year {season.year}: {season.wins ?? "—"}–{season.losses ?? "—"} · {season.finish}</p>)}
            <h3>Final roster</h3>
            {result.roster.map((player) => <p key={player.slot}>{player.slot}: {player.name} · {player.team}</p>)}
          </>;
        })()}
      </section>
    </div> : null}
  </main>;
}
