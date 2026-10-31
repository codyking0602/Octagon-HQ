import { useState } from "react";
import { footballGmDevelopmentResult } from "../back-room/footballGmScouting";
import { NBA_GM_ROSTER_SLOTS } from "./nbaGmFoundation";
import {
  NBA_GM_DEV_SLOT_LABELS, nbaGmDevSpend,
  type NbaGmDevPlayer, type NbaGmDevRun,
} from "./nbaGmDevModel";
import { nbaGmScoutTier } from "./nbaGmScouting";
import { nbaTeamLogoSrc } from "./nbaTeamBranding";

const money = (amount: number) => "$" + (amount / 1_000_000).toFixed(1) + "M";
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

function Portrait({player}:{player:NbaGmDevPlayer}) {
  const [failed, setFailed] = useState(false);
  return <span className="nba-gm-dev__portrait">
    {player.officialNbaPlayerId && /^\d+$/.test(player.officialNbaPlayerId) && !failed
      ? <img src={`https://cdn.nba.com/headshots/nba/latest/260x190/${player.officialNbaPlayerId}.png`}
          alt="" loading="lazy" onError={() => setFailed(true)} />
      : <img src={nbaTeamLogoSrc(player.teamCode)} alt="" />}
  </span>;
}

function MovementBand({name, delta}: {name:string;delta:number}) {
  const outcome = footballGmDevelopmentResult(delta);
  const tone = delta >= .85 ? "up" : delta <= -.85 ? "down" : "steady";
  return <div className="gm-final__band" role="img"
    aria-label={name + ": " + outcome.toLowerCase() + " across three seasons. Categorical movement; no exact grade displayed."}>
    <div className="gm-final__band-track">
      <span className="gm-final__band-start" style={{left:"50%"}} />
      <span className={`gm-final__band-finish is-${tone}`} style={{left:clamp(50+delta*6.5,7,93)+"%"}} />
    </div>
    <div className="gm-final__band-legend">
      <small>DECLINED</small><small className="gm-final__band-start-label">START</small><small>IMPROVED</small>
    </div>
  </div>;
}

/** Mirrors FootballGmFinalExperience: same gm-final sections, hierarchy, score
 * layout, movement bands and financial recap. All results are server-owned.
 */
export function NbaGmFinalExperience({
  run, catalog,
}: {run:NbaGmDevRun;catalog:readonly NbaGmDevPlayer[]}) {
  const byId = new Map(catalog.map(player => [player.id,player]));
  const originalIds = new Set(run.yearOnePicks.map(pick => pick.playerId));
  const results = run.results;
  const score = run.scoreBreakdown;
  const finalRows = NBA_GM_ROSTER_SLOTS.flatMap(slot => {
    const pick = run.picks.find(row => row.slot===slot);
    const player = pick && byId.get(pick.playerId);
    if(!player)return [];
    const origin = run.yearOnePicks.find(row => row.slot===slot);
    const starting = origin && byId.get(origin.playerId);
    const d = run.development?.[player.id];
    const delta = d ? d.year3Grade-d.startingGrade : 0;
    return [{slot,player,starting,delta,report:d,retained:originalIds.has(player.id)}];
  });
  const arrivals=finalRows.filter(row=>!row.retained);
  const retained=finalRows.length-arrivals.length;
  const payroll=nbaGmDevSpend(run.picks,catalog)[2];
  const biggestJump=[...finalRows].sort((a,b)=>b.delta-a.delta)[0];
  const biggestDrop=[...finalRows].sort((a,b)=>a.delta-b.delta)[0];
  const verdict=!score?"LEGACY RUN"
    :score.score>=92?"ELITE RUN":score.score>=85?"STRONG BUILD"
      :score.score>=78?"SOLID FOUNDATION":score.score>=70?"MIXED RESULTS":"REBUILD NEEDED";
  return <div className="football-gm-final gm-final nba-gm-final"
    aria-label="Three-year NBA GM final result">
    <section className="gm-final__hero surface-card">
      <div className="gm-final__eyebrow">YOUR FINAL RESULT <span>NBA · PRIVATE GM PLAYTEST</span></div>
      <div className="gm-final__hero-main">
        <div className="gm-final__score"><strong>{score?score.score.toFixed(1):"—"}</strong><span>GM SCORE</span></div>
        <div className="gm-final__verdict"><small>BOTTOM LINE</small><b>{verdict}</b>
          <span>THREE SEASONS. YOUR ROSTER DECISIONS.</span></div>
      </div>
      <div className="gm-final__stats">
        <div><b>{score?score.roster.toFixed(1):"—"}</b><small>ROSTER GRADE</small></div>
        <div><b>{score?score.playoffs.toFixed(1):"—"}</b><small>PLAYOFF GRADE</small></div>
        <div><b>{retained}/7</b><small>CORE RETAINED</small></div>
        <div><b>{arrivals.length}</b><small>OFFSEASON CHANGES</small></div>
      </div>
    </section>
    <section className="gm-final__section surface-card" aria-label="Three-year NBA franchise results">
      <header className="gm-final__heading"><h2>THREE-YEAR RESULTS</h2><small>STRENGTH · RECORD · PLAYOFF FINISH</small></header>
      <div className="gm-final__seasons">
        {results.map(season=><div className="gm-final__season" key={season.season}>
          <small>YEAR {season.season}</small>
          <div><strong>{Math.round((season.offense+season.defense)/2)}</strong><span>STR</span></div>
          <b>{season.wins}–{season.losses}</b><em>{season.finish}</em>
        </div>)}
      </div>
    </section>
    <section className="gm-final__section surface-card" aria-label="NBA franchise run highlights">
      <header className="gm-final__heading"><h2>RUN HIGHLIGHTS</h2></header>
      <div className="gm-final__highlights">
        <article className="is-positive"><span aria-hidden="true">↗</span><div>
          <small>{arrivals.length?"KEY MOVE":"CORE KEPT"}</small>
          <strong>{arrivals[0]?.player.name??"Your opening seven"}</strong>
          <p>{arrivals.length?"Offseason trade or free agency":"No roster replacements"}</p>
        </div></article>
        <article className="is-gold"><span aria-hidden="true">★</span><div>
          <small>{(biggestJump?.delta??0)>=.85?"BIGGEST LEAP":"CORE ANCHOR"}</small>
          <strong>{biggestJump?.player.name??"Your rotation"}</strong>
          <p>{(biggestJump?.delta??0)>=.85
            ?footballGmDevelopmentResult(biggestJump!.delta):"Roster continuity"}</p>
        </div></article>
        <article className="is-negative"><span aria-hidden="true">↘</span><div>
          <small>DEVELOPMENT CHECK</small><strong>{biggestDrop?.player.name??"No setbacks"}</strong>
          <p>{(biggestDrop?.delta??0)<=-.85
            ?footballGmDevelopmentResult(biggestDrop!.delta):"No notable regression"}</p>
        </div></article>
      </div>
    </section>
    <section className="gm-final__section gm-final__roster surface-card" aria-label="Final NBA roster development outcomes">
      <header className="gm-final__heading"><h2>YOUR FINAL ROSTER</h2><small>YEAR 1 → YEAR 3</small></header>
      <p className="gm-final__hint">Start is fixed in the middle. Movement shows improvement or decline in categories; exact grades remain private.</p>
      <div className="gm-final__roster-list">
        {finalRows.map(row=><article className="gm-final__player" key={row.slot}>
          <div className="gm-final__player-identity">
            <b className="gm-final__position">{NBA_GM_DEV_SLOT_LABELS[row.slot]}</b>
            <Portrait player={row.player}/>
            <img className="nba-gm-final__team-logo" src={nbaTeamLogoSrc(row.player.teamCode)} alt="" />
            <div className="gm-final__player-name">
              <strong>{row.player.name}</strong>
              <small>{row.player.teamCode} · {money(row.report?.year3Salary??row.player.salaries[2])}</small>
            </div>
            <span className={`gm-final__acquired${row.retained?"":" is-new"}`}>{row.retained?"RETAINED":"ACQUIRED"}</span>
            <b className={`gm-final__tier is-${nbaGmScoutTier({...row.player,
              currentGrade:row.report?.year3Grade??row.player.currentGrade}).toLowerCase()}`}>
              {nbaGmScoutTier({...row.player,currentGrade:row.report?.year3Grade??row.player.currentGrade})}
            </b>
          </div>
          <div className="gm-final__player-outcome">
            {row.report?<MovementBand name={row.player.name} delta={row.delta}/>
              :<div className="gm-final__band-unavailable">LEGACY DEVELOPMENT UNAVAILABLE</div>}
            <span className={`gm-final__outcome-text is-${row.delta>=.85?"up":row.delta<=-.85?"down":"steady"}`}>
              {row.report?footballGmDevelopmentResult(row.delta):"NOT RECORDED"}
            </span>
          </div>
        </article>)}
      </div>
    </section>
    <section className="gm-final__section surface-card" aria-label="NBA offseason transactions">
      <header className="gm-final__heading"><h2>OFFSEASON MOVES</h2><small>{arrivals.length} CHANGED</small></header>
      {arrivals.length?<div className="gm-final__transactions">
        {arrivals.map(row=><div className="gm-final__transaction" key={row.slot}>
          <b>{NBA_GM_DEV_SLOT_LABELS[row.slot]}</b>
          <span><strong>{row.starting?.name??"OPEN"}</strong><small>→</small><strong>{row.player.name}</strong></span>
          <em>ACQUIRED</em>
        </div>)}
      </div>:<p className="gm-final__hint">You kept the entire original rotation.</p>}
      <details className="gm-final__disclosure">
        <summary>VIEW FULL ROSTER EVOLUTION <span>Y1 → Y3</span></summary>
        <div className="gm-final__evolution">
          {finalRows.map(row=><div key={row.slot}>
            <b>{NBA_GM_DEV_SLOT_LABELS[row.slot]}</b>
            <span><small>YEAR 1</small><strong>{row.starting?.name??"—"}</strong></span>
            <span aria-hidden="true">→</span>
            <span><small>YEAR 3</small><strong>{row.player.name}</strong></span>
          </div>)}
        </div>
      </details>
    </section>
    <div className="gm-final__bottom">
      <section className="gm-final__section surface-card" aria-label="NBA GM score breakdown">
        <header className="gm-final__heading"><h2>GM SCORE BREAKDOWN</h2></header>
        {[
          ["Roster (90%)",score?.roster],
          ["Season record (3%)",score?.regularSeason],
          ["Playoffs (7%)",score?.playoffs],
        ].map(([label,value])=><div className="gm-final__math" key={String(label)}>
          <span>{label}</span><i><b style={{width:(typeof value==="number"?value:0)+"%"}}/></i>
          <strong>{typeof value==="number"?value.toFixed(1):"—"}</strong>
        </div>)}
      </section>
      <section className="gm-final__section surface-card" aria-label="NBA Year 3 finances">
        <header className="gm-final__heading"><h2>FINANCIALS · YEAR 3</h2></header>
        <div className="gm-final__money"><span>Payroll</span><strong>{money(payroll)}</strong></div>
        <div className="gm-final__money"><span>Salary cap remaining</span>
          <strong>{money(run.caps[2]-payroll)}</strong></div>
      </section>
    </div>
  </div>;
}
