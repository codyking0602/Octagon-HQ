import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GmFootballWheel } from "../back-room/FootballGmModePage";
import { NBA_GM_ROSTER_SLOTS } from "./nbaGmFoundation";
import {
  NBA_GM_DEV_SKILL_LABELS, NBA_GM_DEV_SLOT_LABELS,
  nbaGmDevCanAdd, nbaGmDevCandidates, nbaGmDevCatalogErrors, nbaGmDevFitSignals, nbaGmDevSpend,
  nbaGmDevSalary, type NbaGmDevPlayer, type NbaGmDevRun,
} from "./nbaGmDevModel";
import { nbaGmScoutLetter, nbaGmScoutTier } from "./nbaGmScouting";
import { createNbaGmDevRepository, type NbaGmDevOperation } from "./nbaGmDevRepository";
import { NBA_TEAMS } from "./nbaFutures";
import { nbaTeamColor, nbaTeamLogoSrc } from "./nbaTeamBranding";
import "../../styles/football-wheel.css";
import "../../styles/football-gm-mode.css";
import "../../styles/nba-gm-dev.css";

const money=(value:number)=>"$"+(value/1_000_000).toFixed(1)+"M";
const wheelTeams=NBA_TEAMS.map(team=>({
  code:team.id,shortCode:team.id,name:team.name,logoSrc:nbaTeamLogoSrc(team.id),
  primaryColor:nbaTeamColor(team.id),secondaryColor:"#0d1624",
}));
const labels=Object.keys(NBA_GM_DEV_SKILL_LABELS) as Array<keyof typeof NBA_GM_DEV_SKILL_LABELS>;
function TeamMark({code}:{code:string}){
  return <span className="nba-gm-dev__team-mark" style={{borderColor:nbaTeamColor(code)}} title={code}>
    <img src={nbaTeamLogoSrc(code)} alt="" onError={event=>{event.currentTarget.style.display="none";}} />
    <span>{code}</span>
  </span>;
}
/** NFL-style candidate portraits use only verified NBA IDs, with a team-mark fallback. */
function PlayerPortrait({player}:{player:NbaGmDevPlayer}){
  const [failed,setFailed]=useState(false);
  const id=player.officialNbaPlayerId;
  return <span className="nba-gm-dev__portrait" aria-hidden="true">
    {id&&/^\d+$/.test(id)&&!failed
      ? <img src={`https://cdn.nba.com/headshots/nba/latest/260x190/${id}.png`}
          alt="" loading="lazy" onError={()=>setFailed(true)}/>
      : <TeamMark code={player.teamCode}/>}
  </span>;
}
function ScoutBadges({player}:{player:NbaGmDevPlayer}){
  const tier=nbaGmScoutTier(player);
  return <span className="nba-gm-dev__scout-pills">
    <span className={"football-gm__quality-pill quality-"+tier.toLowerCase()}>{tier}</span>
    <span className="nba-gm-dev__term">{player.gameContract}</span>
    <span className="nba-gm-dev__term">{player.gameContract==="3YR"?"SALARY LOCKED":"REPRICE RISK"}</span>
  </span>;
}
function PlayerCard({player,onPick,disabled,action="DRAFT"}:{
  player:NbaGmDevPlayer;onPick?:()=>void;disabled?:boolean;action?:string;
}){
  return <article className="nba-gm-dev__player" style={{borderTopColor:nbaTeamColor(player.teamCode)}}>
    <div className="nba-gm-dev__player-head">
      <PlayerPortrait player={player}/>
      <div className="nba-gm-dev__identity">
        <strong>{player.name}</strong><small>{player.positions.join(" / ")} · {money(player.salaries[0])} YEAR 1</small>
        <ScoutBadges player={player}/>
      </div>
    </div>
    <div className="nba-gm-dev__skills" aria-label={"Scouting grades for "+player.name}>
      {labels.map(key=><div key={key}>
        <small>{NBA_GM_DEV_SKILL_LABELS[key]}</small>
        <strong>{nbaGmScoutLetter(player.skills[key])}</strong>
      </div>)}
    </div>
    {onPick&&<button type="button" className="nba-gm-dev__primary" disabled={disabled} onClick={onPick}>
      {action} {player.name}
    </button>}
  </article>;
}
function FitReport({picks,catalog}:{
  picks:NbaGmDevRun["picks"];catalog:NbaGmDevPlayer[];
}){
  const signals=nbaGmDevFitSignals(picks,catalog);
  if(!signals.length)return null;
  // Private diagnostic, not the unvalidated winning-percentage formula.
  return <section className="nba-gm-dev__panel nba-gm-dev__fit" aria-label="Season 1 roster scouting report">
    <div className="nba-gm-dev__section-title"><div><small>AFTER SEASON 1</small><h2>How your rotation fits</h2></div></div>
    <p className="nba-gm-dev__hint">These are roster-level scouting signals, not extra skill ratings or guaranteed outcomes. Use them to plan your offseason.</p>
    <div className="nba-gm-dev__fit-grid">
      {signals.map(signal=><div key={signal.label} title={signal.detail}>
        <span>{signal.label}</span>
        <strong className={signal.status==="STRONG"?"is-strong":signal.status==="FAIR"?"is-fair":"is-weak"}>
          {signal.status}
        </strong>
      </div>)}
    </div>
  </section>;
}
function Results({seasons}:{seasons:NbaGmDevRun["results"]}){
  return <div className="nba-gm-dev__season-grid">
    {seasons.map(season=><article key={season.season}>
      <small>SEASON {season.season}</small>
      <strong>{season.wins}–{season.losses}</strong><span>{season.finish}</span>
      <p>Offense {season.offense.toFixed(1)} · Defense {season.defense.toFixed(1)}</p>
    </article>)}
  </div>;
}
export default function NbaGmDevPage(){
  const repo=useMemo(()=>createNbaGmDevRepository(),[]);
  const [run,setRun]=useState<NbaGmDevRun|null>(null);
  const [catalog,setCatalog]=useState<NbaGmDevPlayer[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [wheelRotation,setWheelRotation]=useState(0);
  const [wheelSpinning,setWheelSpinning]=useState(false);
  const [positionFilter,setPositionFilter]=useState<string|null>(null);
  useEffect(()=>{
    if(!repo){setError("NBA GM needs a connected private backend.");setLoading(false);return;}
    let mounted=true;
    Promise.all([repo.catalog(),repo.action("load")]).then(([players,saved])=>{
      if(!mounted)return;
      const issues=nbaGmDevCatalogErrors(players);
      if(issues.length)throw Error(issues[0]);
      setCatalog(players);setRun(saved);
    }).catch(failure=>{if(mounted)setError(failure instanceof Error?failure.message:String(failure));})
      .finally(()=>{if(mounted)setLoading(false);});
    return()=>{mounted=false;};
  },[repo]);

  async function act(action:NbaGmDevOperation,playerId?:string){
    if(!repo||busy)return;
    setBusy(true);setError("");setNotice("");
    try {
      const state=await repo.action(action,playerId);
      if(action==="trade"&&state&&run&&state.tradesUsed===run.tradesUsed){
        setNotice("Offer declined. The partner wanted more value.");
      }
      if(action==="pick")setPositionFilter(null);
      setRun(state);
      return state;
    } catch(failure){
      setError(failure instanceof Error?failure.message:"Action rejected by the server.");
    } finally{setBusy(false);}
  }
  async function spin(action:"spin"|"trade-spin"|"fa-spin"){
    if(busy||wheelSpinning)return;
    const state=await act(action);
    if(!state)return;
    const teamCode=action==="spin"?state.pendingTeam:action==="trade-spin"?state.tradeTeam:state.freeAgencyTeam;
    const i=wheelTeams.findIndex(t=>t.code===teamCode);
    if(i<0)return;
    const slice=360/wheelTeams.length;
    const desired=((-(i*slice))%360+360)%360;
    setWheelRotation(prev=>{
      const current=((prev%360)+360)%360;
      return prev+1080+((desired-current+360)%360);
    });
    setWheelSpinning(true);
    window.setTimeout(()=>setWheelSpinning(false),1550);
  }
  const byId=useMemo(()=>new Map(catalog.map(p=>[p.id,p])),[catalog]);
  const spend=run?nbaGmDevSpend(run.picks,catalog):null;
  const candidates=run?nbaGmDevCandidates(run,catalog):[];
  const visible=candidates.filter(p=>!positionFilter||p.positions.includes(positionFilter as "PG"|"SG"|"SF"|"PF"|"C"));
  const currentTeam=run?.phase==="draft"?run.pendingTeam:run?.tradeTeam??run?.freeAgencyTeam;
  const wheelTeam=currentTeam?wheelTeams.find(team=>team.code===currentTeam)??null:null;
  const eligibleTrade=run?.shopPlayerId?catalog.filter(p=>
    p.teamCode===run.tradeTeam&&!run.picks.some(pick=>pick.playerId===p.id)
    && nbaGmDevCanAdd(run.picks.filter(pick=>pick.playerId!==run.shopPlayerId),p,catalog,run.caps,"offseason")
  ):[];
  const isDraft=run?.phase==="draft";
  // Keep the wheel mounted during its animation and after its result.
  // Unmounting at pendingTeam would hide the exact NFL GM spin the player expects.
  const wheelEnabled=!busy&&!wheelSpinning&&Boolean(run&&(
    isDraft&&!run.pendingTeam||
    run.phase==="offseason"&&run.shopPlayerId&&!run.tradeTeam&&run.tradesUsed===0||
    run.phase==="offseason"&&run.picks.length<7&&!run.freeAgencyTeam&&!run.shopPlayerId
  ));
  return <main className="page nba-gm-dev" data-testid="nba-gm-development-page">
    <header className="nba-gm-dev__header">
      <Link to="/nba" className="nba-gm-dev__back">← Basketball HQ</Link>
      <span>OWNER PLAYTEST · NOT PUBLIC</span>
      <h1>NBA <em>GM</em></h1>
      <p>Spin a team. Draft your seven-player rotation. Survive the offseason. Three seasons to build a winner.</p>
    </header>
    {error&&<div className="nba-gm-dev__error" role="alert">{error}</div>}
    {notice&&<div className="nba-gm-dev__notice" role="status">{notice}</div>}
    {loading&&<p className="nba-gm-dev__status">Loading your private franchise…</p>}
    {!loading&&!run&&<section className="nba-gm-dev__panel nba-gm-dev__intro">
      <strong>NBA FRONT OFFICE CHALLENGE</strong><h2>BUILD IT. SURVIVE THE OFFSEASON. SEE IF IT WINS.</h2>
      <p>Seven team-wheel picks. The game automatically assigns eligible NBA positions, including a backup guard and a backup big. Ratings stay hidden; scouting is letter grades.</p>
      <div className="nba-gm-dev__summary"><span>1YR / 3YR DEALS</span><span>THREE SEASONS</span><span>ONE OFFSEASON</span></div>
      <button className="nba-gm-dev__primary" disabled={busy||catalog.length!==330}
        onClick={()=>void act("start")}>START THE DRAFT</button>
    </section>}
    {run&&<>
      <section className="nba-gm-dev__panel nba-gm-dev__caps">
        <div><small>{isDraft?"DRAFT":"YOUR ROSTER"}</small><strong>{run.picks.length} / 7</strong></div>
        {[0,1,2].map(index=><div key={index}>
          <small>YEAR {index+1} CAP</small><strong>{money(spend?.[index]??0)} <span>/ {money(run.caps[index]!)}</span></strong>
          <div className="nba-gm-dev__bar"><i style={{width:Math.min(100,100*(spend?.[index]??0)/run.caps[index]!)+"%"}}/></div>
        </div>)}
      </section>
      <section className="nba-gm-dev__panel nba-gm-dev__roster-panel">
        <div className="nba-gm-dev__section-title">
          <div><small>YOUR TEAM</small><h2>7-MAN ROTATION</h2></div>
          <strong>{run.picks.length}/7</strong>
        </div>
        <div className="nba-gm-dev__roster">
          {NBA_GM_ROSTER_SLOTS.map(slot=>{
            const pick=run.picks.find(p=>p.slot===slot);
            const player=pick?byId.get(pick.playerId):null;
            return <article className="nba-gm-dev__roster-row" key={slot}>
              <strong>{NBA_GM_DEV_SLOT_LABELS[slot]}</strong>
              {player?<><PlayerPortrait player={player}/>
                <span><b>{player.name}</b><small>{player.positions.join(" / ")} · {money(nbaGmDevSalary(player,run.phase==="draft"?0:1))}</small>
                  <ScoutBadges player={player}/></span>
                {run.phase==="offseason"&&run.tradesUsed<1&&!run.shopPlayerId&&!run.freeAgencyTeam&&
                  <button className="nba-gm-dev__secondary" disabled={busy} onClick={()=>void act("shop",player.id)}>SHOP</button>}
                {run.phase==="offseason"&&run.releasedIds.length<1&&!run.shopPlayerId&&!run.freeAgencyTeam&&
                  <button className="nba-gm-dev__secondary" disabled={busy} onClick={()=>void act("release",player.id)}>CUT</button>}
              </>:<span className="nba-gm-dev__empty">OPEN</span>}
            </article>;
          })}
        </div>
      </section>
      {run.phase==="draft"&&<section className="nba-gm-dev__panel nba-gm-dev__draft">
        <div className="nba-gm-dev__section-title"><div><small>ROUND {run.picks.length+1} OF 7</small>
          <h2>{run.pendingTeam?"CHOOSE YOUR PLAYER":"SPIN FOR AN NBA TEAM"}</h2></div>
          {run.pendingTeam&&<TeamMark code={run.pendingTeam}/>}</div>
        {!run.pendingTeam&&<p className="nba-gm-dev__hint">Spin first, then choose any eligible player. The lineup reflows automatically to keep valid positions.</p>}
        {<GmFootballWheel teams={wheelTeams} rotation={wheelRotation} spinning={wheelSpinning}
          pendingTeam={wheelSpinning?null:wheelTeam} canSpin={wheelEnabled} onSpin={()=>void spin("spin")}/>}
        {run.pendingTeam&&!wheelSpinning&&<PlayerPicker players={visible} all={candidates} filter={positionFilter}
          setFilter={setPositionFilter} disabled={busy} onPick={id=>void act("pick",id)}/>}
      </section>}
      {run.phase==="year1"&&<section className="nba-gm-dev__panel nba-gm-dev__results">
        <small>YEAR 1 COMPLETE</small><h2>YOUR FIRST SEASON</h2>
        <Results seasons={run.results}/>
        <button className="nba-gm-dev__primary" disabled={busy} onClick={()=>void act("offseason")}>
          ENTER THE OFFSEASON
        </button>
      </section>}
      {(run.phase==="year1"||run.phase==="offseason"||run.phase==="final")&&<FitReport picks={run.yearOnePicks} catalog={catalog}/>}
      {run.phase==="offseason"&&<section className="nba-gm-dev__panel nba-gm-dev__offseason">
        <div className="nba-gm-dev__section-title"><div><small>AFTER SEASON 1</small><h2>THE OFFSEASON</h2></div></div>
        <Results seasons={run.results}/>
        <p className="nba-gm-dev__hint">1YR salaries reprice for Years 2–3; 3YR salaries remain locked. Shop one player, use your team-wheel trade partner, or cut and replace a player in the 1YR free-agent market.</p>
        {run.shopPlayerId&&<div className="nba-gm-dev__trade">
          <strong>SHOPPING {byId.get(run.shopPlayerId)?.name}</strong>
          <GmFootballWheel teams={wheelTeams} rotation={wheelRotation} spinning={wheelSpinning}
            pendingTeam={wheelSpinning?null:run.tradeTeam?wheelTeam:null}
            canSpin={wheelEnabled} onSpin={()=>void spin("trade-spin")}/>
          {run.tradeTeam&&!wheelSpinning&&
            <><p>Trading partner: {NBA_TEAMS.find(t=>t.id===run.tradeTeam)?.name}. Two offers maximum, one accepted trade.</p>
              <div className="nba-gm-dev__candidate-grid">
                {eligibleTrade.map(player=><PlayerCard player={player} key={player.id} disabled={busy}
                  action="OFFER FOR" onPick={()=>void act("trade",player.id)}/>)}
              </div>
            </>}
          <button className="nba-gm-dev__secondary" disabled={busy} onClick={()=>void act("cancel-trade")}>KEEP MY PLAYER</button>
        </div>}
        {run.picks.length<7&&!run.shopPlayerId&&
          <div className="nba-gm-dev__trade">
            <p className="nba-gm-dev__hint">FREE AGENCY · {run.freeAgencyVisits} MARKET VISITS · REPLACEMENT SPINS UNTIL ROSTER IS FILLED</p>
            <GmFootballWheel teams={wheelTeams} rotation={wheelRotation} spinning={wheelSpinning}
              pendingTeam={wheelSpinning?null:run.freeAgencyTeam?wheelTeam:null}
              canSpin={wheelEnabled} onSpin={()=>void spin("fa-spin")}/>
            {run.freeAgencyTeam&&!wheelSpinning&&<>
              <strong>{NBA_TEAMS.find(t=>t.id===run.freeAgencyTeam)?.name} · 1YR FREE AGENTS</strong>
              <div className="nba-gm-dev__candidate-grid">
                {candidates.map(player=><PlayerCard key={player.id} player={player} disabled={busy}
                  action="SIGN" onPick={()=>void act("sign",player.id)}/>)}
              </div>
              <button className="nba-gm-dev__secondary" disabled={busy} onClick={()=>void act("pass-fa")}>PASS THIS TEAM</button>
            </>}
          </div>}
        {run.picks.length===7&&!run.shopPlayerId&&!run.freeAgencyTeam&&
          <button className="nba-gm-dev__primary" disabled={busy} onClick={()=>void act("advance")}>
            LOCK ROSTER · SIMULATE SEASONS 2 & 3
          </button>}
      </section>}
      {run.phase==="final"&&<section className="nba-gm-dev__panel nba-gm-dev__results">
        <small>THREE SEASONS · PRIVATE PLAYTEST</small><h2>YOUR FRANCHISE RESULTS</h2>
        <Results seasons={run.results}/>
        <button className="nba-gm-dev__primary" disabled={busy} onClick={()=>void act("start")}>NEW FRANCHISE</button>
      </section>}
      <footer className="nba-gm-dev__disclaimer">Owner-only QA · Provisional positions and scouting · Fictional contract terms and prices · Simulation not historically calibrated or public.</footer>
    </>}
  </main>;
}
function PlayerPicker({players,all,filter,setFilter,disabled,onPick}:{
  players:NbaGmDevPlayer[];all:NbaGmDevPlayer[];
  filter:string|null;setFilter:(value:string|null)=>void;disabled:boolean;
  onPick:(id:string)=>void;
}){
  const positions=["PG","SG","SF","PF","C"].filter(pos=>all.some(p=>p.positions.includes(pos as "PG"|"SG"|"SF"|"PF"|"C")));
  return <div className="nba-gm-dev__picker">
    <div className="nba-gm-dev__position-tabs" role="group" aria-label="Filter team candidates by basketball position">
      <button type="button" className={!filter?"is-selected":""} onClick={()=>setFilter(null)}>ALL</button>
      {positions.map(position=><button type="button" key={position} className={filter===position?"is-selected":""}
        onClick={()=>setFilter(position)}>{position}</button>)}
    </div>
    <div className="nba-gm-dev__candidate-grid">
      {players.map(player=><PlayerCard key={player.id} player={player} disabled={disabled}
        onPick={()=>onPick(player.id)}/>)}
    </div>
  </div>;
}
