import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GmFootballWheel } from "../back-room/FootballGmModePage";
import { NBA_GM_ROSTER_SLOTS } from "./nbaGmFoundation";
import { NbaGmDevelopmentReport } from "./NbaGmDevelopmentReport";
import { NbaGmFinalExperience } from "./NbaGmFinalExperience";
import {
  NBA_GM_DEV_SKILL_LABELS, NBA_GM_DEV_SLOT_LABELS,
  nbaGmDevCanAdd, nbaGmDevCandidates, nbaGmDevCatalogErrors, nbaGmDevFitSignals, nbaGmDevSpend,
  nbaGmDevDisplaySalaryYear, nbaGmDevSalary, type NbaGmDevPlayer, type NbaGmDevRun,
} from "./nbaGmDevModel";
import { nbaGmScoutLetter, nbaGmScoutTier } from "./nbaGmScouting";
import { createNbaGmDevRepository, type NbaGmDevOperation } from "./nbaGmDevRepository";
import { NBA_TEAMS } from "./nbaFutures";
import { nbaTeamColor, nbaTeamLogoSrc } from "./nbaTeamBranding";
import "../../styles/football-wheel.css";
import "../../styles/football-gm-mode.css";
import "../../styles/football-gm-final.css";
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
function PlayerCard({player,onPick,disabled,action="DRAFT",salaryYear=0}:{
  player:NbaGmDevPlayer;onPick?:()=>void;disabled?:boolean;action?:string;salaryYear?:0|1|2;
}){
  return <article className="nba-gm-dev__player" style={{borderTopColor:nbaTeamColor(player.teamCode)}}>
    <div className="nba-gm-dev__player-head">
      <PlayerPortrait player={player}/>
      <div className="nba-gm-dev__identity">
        <strong>{player.name}</strong><small>{player.positions.join(" / ")} · {money(nbaGmDevSalary(player,salaryYear))} YEAR {salaryYear+1}</small>
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
  const wheelRequestRef=useRef(false);
  const wheelSequenceRef=useRef(0);
  useEffect(()=>()=>{wheelSequenceRef.current+=1;},[]);
  const [positionFilter,setPositionFilter]=useState<string|null>(null);
  const [tradeChip,setTradeChip]=useState<string|null>(null);
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

  async function act(action:NbaGmDevOperation,playerId?:string,extraTradeChip?:string){
    if(!repo||busy)return;
    setBusy(true);setError("");setNotice("");
    try {
      const state=await repo.action(action,playerId,extraTradeChip);
      if(action==="trade"&&state&&run&&state.tradesUsed===run.tradesUsed){
        setNotice("Offer declined. The partner wanted more value.");
      }
      if(action==="pick")setPositionFilter(null);
      if(["shop","trade","cancel-trade"].includes(action))setTradeChip(null);
      setRun(state);
      if(state&&["start","offseason","trade","sign","emergency-sign","advance"].includes(action)){
        void repo.catalog().then(setCatalog).catch(()=>setNotice("Salary scouting will refresh on reload."));
      }
      return state;
    } catch(failure){
      setError(failure instanceof Error?failure.message:"Action rejected by the server.");
    } finally{setBusy(false);}
  }
  async function spin(action:"spin"|"trade-spin"|"fa-spin"){
    if(!repo||busy||wheelRequestRef.current)return;
    // Visual feedback starts synchronously. Server alone decides the landing.
    wheelRequestRef.current=true;
    const sequence=++wheelSequenceRef.current;
    setBusy(true);setError("");setNotice("");setWheelSpinning(true);
    setWheelRotation(prev=>prev+1440);
    // An unusually slow eligibility RPC must not leave a motionless wheel.
    const keepTurning=window.setInterval(()=>{
      if(sequence===wheelSequenceRef.current)setWheelRotation(prev=>prev+720);
    },1150);
    try{
      const state=await repo.action(action);
      if(sequence!==wheelSequenceRef.current)return;
      if(!state)throw Error("Spin did not return a franchise state.");
      const teamCode=action==="spin"?state.pendingTeam:action==="trade-spin"?state.tradeTeam:state.freeAgencyTeam;
      const i=wheelTeams.findIndex(team=>team.code===teamCode);
      if(i<0)throw Error("The server returned an unknown team.");
      window.clearInterval(keepTurning);
      const slice=360/wheelTeams.length;
      const desired=((-(i*slice))%360+360)%360;
      setWheelRotation(prev=>{
        const current=((prev%360)+360)%360;
        return prev+720+((desired-current+360)%360);
      });
      // Hold the server result until the winning slice is beneath the pointer.
      window.setTimeout(()=>{
        if(sequence!==wheelSequenceRef.current)return;
        setRun(state);setWheelSpinning(false);setBusy(false);
        wheelRequestRef.current=false;
      },1550);
    }catch(failure){
      window.clearInterval(keepTurning);
      if(sequence!==wheelSequenceRef.current)return;
      setError(failure instanceof Error?failure.message:"The spin failed. Please retry.");
      setWheelSpinning(false);setBusy(false);
      wheelRequestRef.current=false;
    }
  }
  const byId=useMemo(()=>new Map(catalog.map(p=>[p.id,p])),[catalog]);
  const spend=run?nbaGmDevSpend(run.picks,catalog):null;
  const capCrisis=Boolean(run&&spend&&(spend[1]>run.caps[1]||spend[2]>run.caps[2]));
  const candidates=run?nbaGmDevCandidates(run,catalog):[];
  const visible=candidates.filter(p=>!positionFilter||p.positions.includes(positionFilter as "PG"|"SG"|"SF"|"PF"|"C"));
  const currentTeam=run?.phase==="draft"?run.pendingTeam:run?.tradeTeam??run?.freeAgencyTeam;
  const wheelTeam=currentTeam?wheelTeams.find(team=>team.code===currentTeam)??null:null;
  // Partner visibility is not a cap/roster filter. All unowned targets remain
  // visible, even if an immediate exchange requires another legal structure.
  const eligibleTrade=run?.shopPlayerId?catalog.filter(p=>
    p.teamCode===run.tradeTeam&&!run.picks.some(pick=>pick.playerId===p.id)
  ).sort((a,b)=>b.currentGrade-a.currentGrade||a.name.localeCompare(b.name)):[];
  const emergency=run?.phase==="offseason"&&run.picks.length<7&&
    run.freeAgencyVisits>=3&&!run.freeAgencyTeam&&!run.shopPlayerId
    ?catalog.filter(p=>p.gameContract==="1YR"&&p.currentGrade<=78
      &&!run.picks.some(pick=>pick.playerId===p.id)&&!run.releasedIds.includes(p.id)
      &&nbaGmDevCanAdd(run.picks,p,catalog,run.caps,"offseason"))
      .sort((a,b)=>nbaGmDevSalary(a,1)-nbaGmDevSalary(b,1)||a.name.localeCompare(b.name))
    :[];
  const isDraft=run?.phase==="draft";
  // Keep the wheel mounted during its animation and after its result.
  // Unmounting at pendingTeam would hide the exact NFL GM spin the player expects.
  const wheelEnabled=!busy&&!wheelSpinning&&Boolean(run&&(
    isDraft&&!run.pendingTeam||
    run.phase==="offseason"&&run.shopPlayerId&&!run.tradeTeam&&run.tradesUsed===0||
    run.phase==="offseason"&&run.picks.length<7&&run.freeAgencyVisits<3&&!run.freeAgencyTeam&&!run.shopPlayerId
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
              {player?<><PlayerPortrait key={player.id} player={player}/>
                <span><b>{player.name}</b><small>{player.positions.join(" / ")} · {money(nbaGmDevSalary(player,nbaGmDevDisplaySalaryYear(run.phase)))}</small>
                  <ScoutBadges player={player}/></span>
                {run.phase==="offseason"&&run.tradesUsed<1&&!run.shopPlayerId&&!run.freeAgencyTeam&&
                  <button className="nba-gm-dev__secondary" disabled={busy} onClick={()=>void act("shop",player.id)}>SHOP</button>}
                {run.phase==="offseason"&&(run.releasedIds.length<1||capCrisis)&&!run.shopPlayerId&&!run.freeAgencyTeam&&
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
        {<GmFootballWheel ariaLabel="NBA team wheel" teams={wheelTeams} rotation={wheelRotation} spinning={wheelSpinning}
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
      {run.phase==="offseason"&&<NbaGmDevelopmentReport run={run} catalog={catalog}/>}
      {run.phase==="offseason"&&<section className="nba-gm-dev__panel nba-gm-dev__offseason">
        <div className="nba-gm-dev__section-title"><div><small>AFTER SEASON 1</small><h2>THE OFFSEASON</h2></div></div>
        <Results seasons={run.results}/>
        {capCrisis&&<p className="nba-gm-dev__cap-crisis" role="alert">SALARY CAP CRISIS · Your future payroll is over the cap. Trade or cut a player, then sign an affordable replacement before advancing.</p>}
        <p className="nba-gm-dev__hint">Development now changes skills and 1YR market values. A 3YR salary stays locked. Shop a player, negotiate up to two offers, or use one voluntary cut and the limited free-agent market.</p>
        {run.shopPlayerId&&<div className="nba-gm-dev__trade">
          <strong>SHOPPING {byId.get(run.shopPlayerId)?.name}</strong>
          <GmFootballWheel ariaLabel="NBA team wheel" teams={wheelTeams} rotation={wheelRotation} spinning={wheelSpinning}
            pendingTeam={wheelSpinning?null:run.tradeTeam?wheelTeam:null}
            canSpin={wheelEnabled} onSpin={()=>void spin("trade-spin")}/>
          {run.tradeTeam&&!wheelSpinning&&
            <><p>Trading partner: {NBA_TEAMS.find(t=>t.id===run.tradeTeam)?.name}. Every available player is listed. A target may require a different legal package or more cap space. Two offers maximum.</p>
              <div className="nba-gm-dev__chip-list" role="group" aria-label="Optional second outgoing trade player">
                <span>OPTIONAL SECOND TRADE CHIP</span>
                {run.picks.filter(pick=>pick.playerId!==run.shopPlayerId).map(pick=>{
                  const player=byId.get(pick.playerId);
                  return player?<button type="button" className={tradeChip===player.id?"is-selected":""}
                    aria-pressed={tradeChip===player.id} key={player.id} disabled={busy}
                    onClick={()=>setTradeChip(current=>current===player.id?null:player.id)}>
                    {player.name}
                  </button>:null;
                })}
              </div>
              <div className="nba-gm-dev__candidate-grid">
                {eligibleTrade.map(player=>{
                  const remaining=run.picks.filter(pick=>pick.playerId!==run.shopPlayerId&&pick.playerId!==tradeChip);
                  const legal=nbaGmDevCanAdd(remaining,player,catalog,run.caps,"offseason");
                  return <div key={player.id} className="nba-gm-dev__trade-target">
                    {!legal&&<small className="nba-gm-dev__trade-warning">CURRENT PACKAGE NEEDS A DIFFERENT CAP / POSITION FIT</small>}
                    <PlayerCard player={player} disabled={busy} action={tradeChip?"OFFER PACKAGE FOR":"OFFER FOR"}
                      salaryYear={1} onPick={()=>void act("trade",player.id,tradeChip??undefined)}/>
                  </div>;
                })}
              </div>
            </>}
          <button className="nba-gm-dev__secondary" disabled={busy} onClick={()=>void act("cancel-trade")}>KEEP MY PLAYER</button>
        </div>}
        {run.picks.length<7&&!run.shopPlayerId&&
          <div className="nba-gm-dev__trade">
            <p className="nba-gm-dev__hint">FREE AGENCY · {run.freeAgencyVisits}/3 MARKET VISITS · 1YR SIGNINGS ONLY</p>
            {run.freeAgencyVisits<3||run.freeAgencyTeam?<GmFootballWheel ariaLabel="NBA team wheel" teams={wheelTeams} rotation={wheelRotation} spinning={wheelSpinning}
              pendingTeam={wheelSpinning?null:run.freeAgencyTeam?wheelTeam:null}
              canSpin={wheelEnabled} onSpin={()=>void spin("fa-spin")}/>:null}
            {run.freeAgencyTeam&&!wheelSpinning&&<>
              <strong>{NBA_TEAMS.find(t=>t.id===run.freeAgencyTeam)?.name} · 1YR FREE AGENTS</strong>
              <div className="nba-gm-dev__candidate-grid">
                {candidates.map(player=><PlayerCard key={player.id} player={player} disabled={busy}
                  action="SIGN" salaryYear={1} onPick={()=>void act("sign",player.id)}/>)}
              </div>
              <button className="nba-gm-dev__secondary" disabled={busy} onClick={()=>void act("pass-fa")}>PASS THIS TEAM</button>
            </>}
          </div>}
        {emergency.length>0&&<div className="nba-gm-dev__trade">
          <strong>EMERGENCY ROSTER COMPLETION</strong>
          <p className="nba-gm-dev__hint">All three visits used. Only affordable depth players may fill an open position. No rerolls.</p>
          <div className="nba-gm-dev__candidate-grid">
            {emergency.map(player=><PlayerCard key={player.id} player={player} disabled={busy}
              salaryYear={1} action="SIGN DEPTH" onPick={()=>void act("emergency-sign",player.id)}/>)}
          </div>
        </div>}
        {run.picks.length===7&&!run.shopPlayerId&&!run.freeAgencyTeam&&
          <button className="nba-gm-dev__primary" disabled={busy||capCrisis} onClick={()=>void act("advance")}>
            LOCK ROSTER · SIMULATE SEASONS 2 & 3
          </button>}
      </section>}
      {run.phase==="final"&&<><NbaGmFinalExperience run={run} catalog={catalog}/>
        <button className="nba-gm-dev__primary" disabled={busy} onClick={()=>void act("start")}>NEW FRANCHISE</button></>}
      <footer className="nba-gm-dev__disclaimer">Owner-only QA · Provisional positions and player progression assumptions · Fictional game contracts and cap · Results are not a certified NBA forecast or public.</footer>
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
