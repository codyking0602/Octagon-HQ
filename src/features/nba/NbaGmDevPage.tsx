import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { GmFootballWheel } from "../back-room/FootballGmModePage";
import { NBA_GM_ROSTER_SLOTS } from "./nbaGmFoundation";
import { nbaGmDevelopmentOutcome } from "./NbaGmDevelopmentReport";
import { NbaGmFinalExperience } from "./NbaGmFinalExperience";
import { nbaGmPlayoffFinishText } from "./nbaGmPlayoffFinishText";
import {
  NBA_GM_DEV_SKILL_LABELS, NBA_GM_DEV_SLOT_LABELS,
  nbaGmDevAssignRoster, nbaGmDevCanAdd, nbaGmDevCandidates, nbaGmDevCatalogErrors, nbaGmDevSpend,
  nbaGmDevDisplaySalaryYear, nbaGmDevSalary, type NbaGmDevPlayer, type NbaGmDevRun,
} from "./nbaGmDevModel";
import { nbaGmScoutLetter, nbaGmScoutTier, nbaGmScoutOutlook, nbaGmRepriceLabel } from "./nbaGmScouting";
import { createNbaGmDevRepository, type NbaGmDevOperation, type NbaGmTradeOffer } from "./nbaGmDevRepository";
import { NBA_TEAMS } from "./nbaFutures";
import { nbaTeamColor, nbaTeamLogoSrc } from "./nbaTeamBranding";
import { nbaGmOfficialHeadshotId } from "./nbaGmOfficialHeadshots";
import { nbaGmPickerAge } from "./nbaGmPickerAge";
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
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[code]);
  const logo=nbaTeamLogoSrc(code);
  return <span className="nba-gm-dev__team-mark" style={{borderColor:nbaTeamColor(code)}} title={code}>
    {logo&&!failed?<img src={logo} alt="" onError={()=>setFailed(true)}/>:<b>{code}</b>}
  </span>;
}
/** NFL-style candidate portraits use only verified NBA IDs, with a team-mark fallback. */
function PlayerPortrait({player}:{player:NbaGmDevPlayer}){
  const [failed,setFailed]=useState(false);
  const id=nbaGmOfficialHeadshotId(player);
  return <span className="nba-gm-dev__portrait" aria-hidden="true">
    {id&&/^\d+$/.test(id)&&!failed
      ? <img src={`https://cdn.nba.com/headshots/nba/latest/260x190/${id}.png`}
          alt="" loading="lazy" onError={()=>setFailed(true)}/>
      : <TeamMark code={player.teamCode}/>}
  </span>;
}
function ScoutBadges({player,run,showContract=true}:{player:NbaGmDevPlayer;run?:NbaGmDevRun;showContract?:boolean}){
  const {currentGrade:originalGrade}=player;
  const development=run?.development?.[player.id];
  const year=run?.phase==="offseason"?2:run?.phase==="final"?3:1;
  const currentGrade=year===2?development?.year2Grade:year===3?development?.year3Grade:undefined;
  const display={...player,currentGrade:currentGrade??originalGrade};
  const tier=nbaGmScoutTier(display);
  const outlook=nbaGmScoutOutlook(display,year);
  const tone=outlook==="HIGH UPSIDE"?"upside":outlook==="RISING"?"rising"
    :outlook==="BOOM/BUST"?"volatile":outlook==="DECLINE RISK"?"decline":"stable";
  return <span className="nba-gm-dev__scout-pills">
    <span className={"football-gm__quality-pill quality-"+tier.toLowerCase()}>{tier}</span>
    {year<3&&<span className={"football-gm__outlook-pill outlook-"+tone}>{outlook}</span>}
    {showContract&&<>
      <span className="nba-gm-dev__term">{player.gameContract}</span>
      <span className={`nba-gm-dev__term nba-gm-dev__reprice is-${nbaGmRepriceLabel(player.repriceRisk,player.gameContract).tone}`}>
        {nbaGmRepriceLabel(player.repriceRisk,player.gameContract).label}</span>
    </>}
  </span>;
}
function PlayerCard({player,onPick,disabled,action="DRAFT",salaryYear=0,run}:{
  player:NbaGmDevPlayer;onPick?:()=>void;disabled?:boolean;action?:string;salaryYear?:0|1|2;
  run?:NbaGmDevRun;
}){
  const {currentGrade:originalGrade}=player;
  const delta=salaryYear===1&&run?.development?.[player.id]
    ?run.development[player.id]!.year2Grade-originalGrade:0;
  const age=nbaGmPickerAge(player);
  return <article className="nba-gm-dev__player" style={{borderTopColor:nbaTeamColor(player.teamCode)}}>
    <div className="nba-gm-dev__player-head">
      <PlayerPortrait player={player}/>
      <div className="nba-gm-dev__identity">
        <strong>{player.name}</strong><small>{player.positions.join(" / ")} · AGE {age??"—"} · {money(nbaGmDevSalary(player,salaryYear))} YEAR {salaryYear+1}</small>
        <ScoutBadges player={player} run={run}/>
      </div>
    </div>
    <div className="nba-gm-dev__skills" aria-label={"Scouting grades for "+player.name}>
      {labels.map(key=><div key={key}>
        <small>{NBA_GM_DEV_SKILL_LABELS[key]}</small>
        <strong>{nbaGmScoutLetter(Math.max(0,Math.min(99,Math.round(player.skills[key]+delta))))}</strong>
      </div>)}
    </div>
    {onPick&&<button type="button" className="nba-gm-dev__primary" disabled={disabled} onClick={onPick}>
      {action} {player.name}
    </button>}
  </article>;
}
function tradeYearTwoSkillLetter(player:NbaGmDevPlayer,run:NbaGmDevRun,key:keyof typeof NBA_GM_DEV_SKILL_LABELS){
  const {currentGrade:baseGrade}=player;
  const adjustedGrade=run.development?.[player.id]?.year2Grade;
  const delta=adjustedGrade===undefined?0:adjustedGrade-baseGrade;
  return nbaGmScoutLetter(Math.max(0,Math.min(99,Math.round(player.skills[key]+delta))));
}
function Results({seasons,graded}:{seasons:NbaGmDevRun["results"];graded:boolean}){
  return <div className="nba-gm-dev__season-summary">
    {seasons.map(season=><article key={season.season} className="football-gm__season-card nba-gm-dev__year-one-card is-year-one">
      <strong>{season.wins}–{season.losses}</strong>
      <b>{season.finish}</b>
      {season.teamOverall!=null&&season.titleOdds!=null&&
        <span className="nba-gm-dev__headline-odds">{season.teamOverall} OVR · {season.titleOdds.toFixed(1)}% TITLE ODDS</span>}
      <span>{graded?`OFFENSE GRADE ${Math.round(season.offense)} · DEFENSE GRADE ${Math.round(season.defense)}`:`OFFENSE ${season.offense.toFixed(1)} · DEFENSE ${season.defense.toFixed(1)}`}</span>
    </article>)}
  </div>;
}
/** Front-end-only season reveal: final outcomes are already fixed by the server. */
function NbaGmSeasonReveal({run,onReveal}:{run:NbaGmDevRun;onReveal:()=>void}){
  return <section className="nba-gm-dev__season-reveal surface-card" aria-label="NBA GM Years 2 and 3 results">
    <header><small>THE WINDOW</small><h2>YEARS 2 &amp; 3</h2></header>
    <div className="nba-gm-dev__reveal-grid">
      {run.results.filter(season=>season.season>=2).map(season=><article key={season.season}>
        <small className="nba-gm-dev__reveal-year">YEAR {season.season}</small>
        <strong>{season.teamOverall??Math.round((season.offense+season.defense)/2)} <span>{(run.simulationModelVersion===7||run.simulationModelVersion===8||run.simulationModelVersion===9)?"OVR":run.simulationModelVersion===6?"GRD":"SIM"}</span></strong>
        <b>{season.wins}–{season.losses}</b>
        <em>{nbaGmPlayoffFinishText(season.finish)}</em>
        {season.titleOdds!=null&&<small>{season.titleOdds.toFixed(1)}% TITLE ODDS</small>}
      </article>)}
    </div>
    <button type="button" className="nba-gm-dev__primary" onClick={onReveal}>REVEAL GM SCORE</button>
  </section>;
}
export default function NbaGmDevPage(){
  const identity=useIdentity();
  const signedIn=Boolean(identity.profile?.id);
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
  const [showSeasonReveal,setShowSeasonReveal]=useState(false);
  const [tradeTarget,setTradeTarget]=useState<string|null>(null);
  const [expandedTradeCandidate,setExpandedTradeCandidate]=useState<string|null>(null);
  const [tradeOffers,setTradeOffers]=useState<NbaGmTradeOffer[]>([]);
  const [offersBusy,setOffersBusy]=useState(false);
  const [tradeOfferError,setTradeOfferError]=useState("");
  const [swapOut,setSwapOut]=useState<string>("");
  useEffect(()=>{
    setTradeTarget(null);setExpandedTradeCandidate(null);setTradeOffers([]);setTradeOfferError("");
  },[run?.shopPlayerId,run?.tradeTeam]);
  // Trade talks are a dedicated screen; do not leave the player halfway down the offseason.
  useEffect(()=>{
    if(run?.phase==="offseason")window.scrollTo({top:0,behavior:"instant"});
  },[run?.phase,run?.shopPlayerId,run?.tradeTeam,tradeTarget]);
  useEffect(()=>{
    if(!identity.ready)return;
    if(!signedIn){
      setRun(null);setCatalog([]);setError("");setLoading(false);
      return;
    }
    if(!repo){setError("NBA GM is temporarily unavailable.");setLoading(false);return;}
    let mounted=true;
    setLoading(true);
    Promise.all([repo.catalog(),repo.action("load")]).then(([players,saved])=>{
      if(!mounted)return;
      const issues=nbaGmDevCatalogErrors(players);
      if(issues.length)throw Error(issues[0]);
      setCatalog(players);setRun(saved);
    }).catch(failure=>{if(mounted)setError(failure instanceof Error?failure.message:String(failure));})
      .finally(()=>{if(mounted)setLoading(false);});
    return()=>{mounted=false;};
  },[repo,identity.ready,signedIn,identity.profile?.id]);

  async function act(action:NbaGmDevOperation,playerId?:string,extraTradeChip?:string){
    if(!repo||busy)return;
    setBusy(true);setError("");setNotice("");
    try {
      const state=await repo.action(action,playerId,extraTradeChip);
      if(action==="trade"&&state&&run&&state.tradesUsed===run.tradesUsed){
        setNotice("Offer declined. The partner wanted more value.");
      }
      if(action==="pick")setPositionFilter(null);
      
      if(action==="advance"&&state?.phase==="final"){setShowSeasonReveal(true);window.scrollTo({top:0,behavior:"instant"});}
      if(action==="start")setShowSeasonReveal(false);
      if(["shop","trade","cancel-trade"].includes(action)){
        setTradeTarget(null);setTradeOffers([]);setTradeOfferError("");
      }
      setRun(state);
      if(state&&["start","offseason","trade","sign","emergency-sign","advance"].includes(action)){
        void repo.catalog().then(setCatalog).catch(()=>setNotice("Salary scouting will refresh on reload."));
      }
      return state;
    } catch(failure){
      setError(failure instanceof Error?failure.message:"Action rejected by the server.");
    } finally{setBusy(false);}
  }
  async function chooseTradeTarget(playerId:string){
    if(!repo||offersBusy)return;
    setTradeTarget(playerId);setOffersBusy(true);setTradeOfferError("");setTradeOffers([]);
    try{setTradeOffers(await repo.tradeOffers(playerId));}
    catch(failure){setTradeOfferError(failure instanceof Error?failure.message:"Could not load asking prices.");}
    finally{setOffersBusy(false);}
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
  // Historical completed sessions remain immutable. Surface old accidental
  // superstar bench assignments rather than silently rewriting their records.
  const benchAlert=run?.picks.some(bench=>{
    if(bench.slot!=="GUARD"&&bench.slot!=="BIG")return false;
    const p=byId.get(bench.playerId);
    if(!p)return false;
    return run.picks.some(starter=>{
      if(starter.slot==="BIG"||starter.slot==="GUARD")return false;
      const sp=byId.get(starter.playerId);
      return sp&&p.currentGrade>=sp.currentGrade+5&&
        (bench.slot==="BIG"?["PF","C"].includes(starter.slot):["PG","SG"].includes(starter.slot))&&
        p.positions.includes(starter.slot as "PG"|"SG"|"SF"|"PF"|"C");
    });
  })??false;
  // NFL-parity held assets remain on the cap until released/traded, even when
  // outside the active seven. They must never silently become free salaries.
  const heldPlayers=run?.displacedAssets??[];
  const activeSpend=run?nbaGmDevSpend(run.picks,catalog):null;
  const spend=activeSpend&&run?activeSpend.map((v,i)=>v+heldPlayers.reduce((sum,id)=>{
    const player=byId.get(id);
    return sum+(player?nbaGmDevSalary(player,i as 0|1|2):0);
  },0)) as [number,number,number]:null;
  const displaySalaryYear=run?nbaGmDevDisplaySalaryYear(run.phase):0;
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
  // A release budget is constrained by BOTH remaining seasons, exactly as the
  // server's two-year cap gate. This is a ceiling, not guaranteed FA inventory.
  const releasePanel=run?.phase==="offseason"&&spend&&run.picks.length===7
    &&(run.releasedIds.filter(id=>!(run.displacedReleasedIds??[]).includes(id)).length<1||capCrisis)
    &&heldPlayers.length===0&&!run.shopPlayerId&&!run.freeAgencyTeam
    ?<details className="nba-gm-dev__release" aria-label="Voluntary player release">
      <summary className="nba-gm-dev__release-heading">
        <span><small>ONE VOLUNTARY RELEASE</small><strong>CREATE ONE EXTRA FA OPENING</strong></span>
        <b>{run.releasedIds.filter(id=>!(run.displacedReleasedIds??[]).includes(id)).length===0?"AVAILABLE":"CAP RECOVERY"}</b>
      </summary>
      
      <div className="nba-gm-dev__release-list">
        {run.picks.map(pick=>{
          const player=byId.get(pick.playerId);
          if(!player)return null;
          const budget=Math.max(0,Math.min(
            run.caps[1]-spend[1]+nbaGmDevSalary(player,1),
            run.caps[2]-spend[2]+nbaGmDevSalary(player,2)));
          return <div className="nba-gm-dev__release-row" key={player.id}>
            <span><strong>{player.name}</strong>
              <small>{NBA_GM_DEV_SLOT_LABELS[pick.slot]} · FA BUDGET {money(budget)}</small></span>
            <button type="button" className="nba-gm-dev__secondary" disabled={busy}
              onClick={()=>{if(window.confirm("Release "+player.name+"? This move cannot be undone."))void act("release",player.id);}}>
              RELEASE
            </button>
          </div>;
        })}
      </div>
      <small className="nba-gm-dev__release-warning">Permanent release. No re-signing this offseason; visits do not reset.</small>
    </details>:null;
  const isDraft=run?.phase==="draft";
  // Keep the wheel mounted during its animation and after its result.
  // Unmounting at pendingTeam would hide the exact NFL GM spin the player expects.
  const wheelEnabled=!busy&&!wheelSpinning&&Boolean(run&&(
    isDraft&&!run.pendingTeam||
    run.phase==="offseason"&&run.shopPlayerId&&!run.tradeTeam||
    run.phase==="offseason"&&run.picks.length<7&&run.freeAgencyVisits<3&&!run.freeAgencyTeam&&!run.shopPlayerId
  ));
  const draftStage=run?.phase==="draft"?<section className="nba-gm-dev__draft" aria-label="NBA GM draft wheel">
    <div className="football-gm__draft-context nba-gm-dev__draft-context" aria-label="Draft round and positions">
      <span>ROUND {run.picks.length+1} OF 7</span>
      <strong>{run.pendingTeam?"CHOOSE YOUR PLAYER":"PG · SG · SF · PF · C · GUARD · BIG"}</strong>
      {run.pendingTeam&&<TeamMark code={run.pendingTeam}/>}
    </div>
    <GmFootballWheel ariaLabel="NBA team wheel" teams={wheelTeams} rotation={wheelRotation} spinning={wheelSpinning}
      pendingTeam={wheelSpinning?null:wheelTeam} canSpin={wheelEnabled} onSpin={()=>void spin("spin")}/>
    {run.pendingTeam&&!wheelSpinning&&<PlayerPicker players={visible} all={candidates} filter={positionFilter}
      setFilter={setPositionFilter} disabled={busy} onPick={id=>void act("pick",id)}/>}
  </section>:null;
  const isTradeStage=run?.phase==="offseason"&&Boolean(run.shopPlayerId);
  const tradeStage=run?.phase==="offseason"&&run.shopPlayerId?<section className="nba-gm-dev__trade-screen" aria-label="NBA GM trade negotiation">
    <div className="nba-gm-dev__trade-screen-context"><small>OFFSEASON · SHOPPING {byId.get(run.shopPlayerId)?.name.toUpperCase()}</small>
      <strong>{run.tradeTeam?"TRADE TALKS":"FIND A TRADE PARTNER"}</strong></div>
    <div className="nba-gm-dev__trade">
          {!run.tradeTeam||wheelSpinning?
            <GmFootballWheel ariaLabel="NBA team trade wheel" teams={wheelTeams} rotation={wheelRotation} spinning={wheelSpinning}
              pendingTeam={null} canSpin={wheelEnabled} onSpin={()=>void spin("trade-spin")}/>:null}
          {run.tradeTeam&&!wheelSpinning&&<>
            <header className="nba-gm-dev__trade-team">
              <TeamMark code={run.tradeTeam}/>
              <span><small>TRADE TALKS</small><strong>{NBA_TEAMS.find(t=>t.id===run.tradeTeam)?.name}</strong></span>
            </header>
            {!tradeTarget?<><p className="nba-gm-dev__hint">Shopping <b>{byId.get(run.shopPlayerId)?.name}</b>. Tap a player to inspect all six scouting grades, then choose VIEW OFFERS when you're ready. Your target locks when you request offers.</p>
              <div className="nba-gm-dev__trade-candidates">
                {eligibleTrade.map(player=><article key={player.id}
                  className={"nba-gm-dev__trade-candidate"+(expandedTradeCandidate===player.id?" is-expanded":"")}>
                  <button type="button" className="nba-gm-dev__trade-candidate-toggle"
                    aria-expanded={expandedTradeCandidate===player.id}
                    aria-controls={expandedTradeCandidate===player.id?"nba-trade-scout-"+player.id:undefined}
                    disabled={busy||offersBusy}
                    onClick={()=>setExpandedTradeCandidate(current=>current===player.id?null:player.id)}>
                    <PlayerPortrait player={player}/>
                    <span className="nba-gm-dev__trade-candidate-copy">
                      <small>{player.positions.join(" / ")} · AGE {nbaGmPickerAge(player)??"—"} · {player.gameContract}</small>
                      <strong>{player.name}</strong>
                      <ScoutBadges player={player} run={run} showContract={false}/>
                    </span>
                    <b>{money(nbaGmDevSalary(player,1))}</b>
                    <span className="nba-gm-dev__trade-chevron" aria-hidden="true">⌄</span>
                  </button>
                  {expandedTradeCandidate===player.id&&<div className="nba-gm-dev__trade-candidate-details"
                    id={"nba-trade-scout-"+player.id}>
                    <div className="nba-gm-dev__trade-scout-heading"><strong>YEAR 2 SCOUTING</strong><small>Six current skill grades</small></div>
                    <div className="nba-gm-dev__skills" aria-label={"Scouting grades for "+player.name}>
                      {labels.map(key=><div key={key}>
                        <small>{NBA_GM_DEV_SKILL_LABELS[key]}</small>
                        <strong>{tradeYearTwoSkillLetter(player,run,key)}</strong>
                      </div>)}
                    </div>
                    <button type="button" className="nba-gm-dev__primary" disabled={busy||offersBusy}
                      onClick={()=>void chooseTradeTarget(player.id)}>VIEW OFFERS FOR {player.name}</button>
                  </div>}
                </article>)}
              </div>
            </>:<div className="nba-gm-dev__asking-room">
              <div className="nba-gm-dev__target-lock">
                <span><small>YOUR TARGET</small><strong>{byId.get(tradeTarget)?.name}</strong></span>
                <b>{byId.get(tradeTarget)?.teamCode} · {byId.get(tradeTarget)?.positions.join(" / ")}</b>
              </div>
              {byId.get(tradeTarget)&&<PlayerCard player={byId.get(tradeTarget)!} run={run} salaryYear={1}/>}
              {offersBusy?<p role="status">Checking legal asking prices…</p>:null}
              {tradeOfferError?<p className="nba-gm-dev__trade-warning" role="alert">{tradeOfferError}</p>:null}
              {!offersBusy&&!tradeOfferError&&tradeOffers.length===0?<div className="nba-gm-dev__no-offer">
                <strong>NO LEGAL DEAL AVAILABLE</strong>
                <p>No mutually acceptable value-and-position package exists for this target. As in NFL GM, a temporary salary-cap crisis alone does not reject a trade. End talks to choose a different trade partner.</p>
              </div>:null}
              {tradeOffers.length>0&&<>
                <p className="nba-gm-dev__hint">{tradeOffers.length} accepted asking {tradeOffers.length===1?"price":"prices"}. All are legal; none is automatically the best choice.</p>
                {tradeOffers.map((offer,index)=><article key={index} className="nba-gm-dev__asking-price">
                  <header><small>ASKING PRICE {index+1}</small><strong>{offer.shape}</strong></header>
                  <div><small>YOU SEND</small>{offer.outgoingPlayerIds.map(id=><span key={id}>{byId.get(id)?.name??id} <b>{byId.has(id)?money(nbaGmDevSalary(byId.get(id)!,1)):""}</b></span>)}</div>
                  <div><small>YOU GET</small>{offer.incomingPlayerIds.map(id=><span key={id}>{byId.get(id)?.name??id} <b>{byId.has(id)?money(nbaGmDevSalary(byId.get(id)!,1)):""}</b></span>)}</div>
                  {offer.requiresFreeAgency?<p>Leaves an open slot for your three-visit free-agent market.</p>:null}
                  {offer.requiresRosterMove?<p>One acquired asset will be held outside your seven-player rotation until you resolve it.</p>:null}
                  {((offer.capOverYear2??0)>0||(offer.capOverYear3??0)>0)&&<p className="nba-gm-dev__cap-crisis" role="status">
                    CAP CRISIS IF ACCEPTED · {[
                      (offer.capOverYear2??0)>0?"Year 2 "+money(offer.capOverYear2! )+" over":null,
                      (offer.capOverYear3??0)>0?"Year 3 "+money(offer.capOverYear3! )+" over":null,
                    ].filter(Boolean).join(" · ")}. You must clear the excess before simulating.
                  </p>}
                  <button type="button" className="nba-gm-dev__primary" disabled={busy}
                    onClick={()=>void act("trade",tradeTarget,"offer:"+(index+1))}>ACCEPT ASKING PRICE {index+1}</button>
                </article>)}
              </>}
              <small className="nba-gm-dev__target-locked-note">TARGET LOCKED · End talks to shop another target.</small>
            </div>}
          </>}
          <button className="nba-gm-dev__secondary" disabled={busy||offersBusy} onClick={()=>void act("cancel-trade")}>KEEP MY PLAYER · END TALKS</button>
        </div>
  </section>:null;
  return <main className="page nba-gm-dev" data-testid="nba-gm-development-page">
    <header className="football-gm__header nba-gm-dev__header">
      <Link to="/nba" className="nba-gm-dev__back">← BASKETBALL HQ</Link>
      <span>
        <small>NBA FRONT OFFICE</small>
        <strong>THE GM</strong>
        
      </span>
      <b>3 YEARS</b>
    </header>
    {error&&<div className="nba-gm-dev__error" role="alert">{error}</div>}
    {notice&&<div className="nba-gm-dev__notice" role="status">{notice}</div>}
    {loading&&<p className="nba-gm-dev__status">Loading your franchise…</p>}
    {!loading&&!signedIn&&<section className="nba-gm-dev__panel nba-gm-dev__intro" aria-label="Sign in to NBA GM">
      <strong>NBA FRONT OFFICE CHALLENGE</strong>
      <h2>BUILD YOUR FRANCHISE.</h2>
      <p>Seven players. Three seasons. One offseason. Sign in to save your draft and compete.</p>
      <button type="button" className="nba-gm-dev__primary" onClick={identity.openDialog}>SIGN IN TO PLAY</button>
    </section>}
    {!loading&&signedIn&&!run&&<section className="nba-gm-dev__panel nba-gm-dev__intro">
      <strong>NBA FRONT OFFICE CHALLENGE</strong><h2>BUILD IT. SURVIVE THE OFFSEASON. SEE IF IT WINS.</h2>
      <p>Seven team-wheel picks. The game automatically assigns eligible NBA positions, including a backup guard and a backup big. Ratings stay hidden; scouting is letter grades.</p>
      <div className="nba-gm-dev__summary"><span>1YR / 3YR DEALS</span><span>THREE SEASONS</span><span>ONE OFFSEASON</span></div>
      <button className="nba-gm-dev__primary" disabled={busy||catalog.length!==330}
        onClick={()=>void act("start")}>START THE DRAFT</button>
    </section>}
    {run&&<>
      {tradeStage}
      {(run.phase==="draft"||run.phase==="year1"||run.phase==="offseason")&&!isTradeStage&&<section className={`football-gm__cap surface-card nba-gm-dev__caps${(spend?.[displaySalaryYear]??0)>run.caps[displaySalaryYear]?" is-over":""}`}>
        <div className="nba-gm-dev__cap-main">
          <span><small>YEAR {displaySalaryYear+1} CAP</small>
            <strong>{money(spend?.[displaySalaryYear]??0)} / {money(run.caps[displaySalaryYear]!)}</strong></span>
          <b>{money(Math.abs(run.caps[displaySalaryYear]!-(spend?.[displaySalaryYear]??0)))}
            {(spend?.[displaySalaryYear]??0)>run.caps[displaySalaryYear]?" OVER":" LEFT"}</b>
        </div>
        <i><em style={{width:Math.min(100,100*(spend?.[displaySalaryYear]??0)/run.caps[displaySalaryYear]!)+"%"}}/></i>
        <div className="nba-gm-dev__cap-forecast">
          {[0,1,2].filter(index=>index!==displaySalaryYear).map(index=>
            <span key={index}><small>YEAR {index+1}</small><b>{money(spend?.[index]??0)} / {money(run.caps[index]!)}</b></span>)}
        </div>
      </section>}
      {run.phase==="draft"&&run.picks.length===0&&draftStage}
      {(run.phase==="draft"||run.phase==="year1"||run.phase==="offseason")&&!isTradeStage&&<section className="football-gm__roster surface-card nba-gm-dev__roster-panel">
        <header><span><small>YOUR TEAM</small><strong>7-MAN ROTATION</strong></span><b>{run.picks.length}/7</b></header>
        {benchAlert&&<p className="nba-gm-dev__notice" role="status">Older saved rotation: a higher-rated eligible player is on your bench. New franchises optimize starters. Your saved result is unchanged.</p>}
        <div className="football-gm__roster-grid nba-gm-dev__roster">
          {NBA_GM_ROSTER_SLOTS.map(slot=>{
            const pick=run.picks.find(p=>p.slot===slot);
            const player=pick?byId.get(pick.playerId):null;
            return <article className={player?"is-filled":""} key={slot}
              style={player?{borderLeftColor:nbaTeamColor(player.teamCode)}:undefined}>
              <small>{NBA_GM_DEV_SLOT_LABELS[slot]}</small>
              {player?<>
                <div className="football-gm__roster-player">
                  <PlayerPortrait key={player.id} player={player}/>
                  <span className="nba-gm-dev__roster-copy">
                    <strong>{player.name}</strong>
                    <em>{player.teamCode} · {player.positions.join(" / ")}</em>
                    <span className="football-gm__roster-scouting"><ScoutBadges player={player} run={run} showContract={false}/></span>
                    {run.phase==="offseason"&&run.development?.[player.id]&&(()=>{
                      const change=run.development[player.id]!;
                      const outcome=nbaGmDevelopmentOutcome(change.year2Grade-change.startingGrade);
                      return <small className={"nba-gm-dev__roster-development is-"+outcome.tone}>
                        {outcome.label==="STEADY"?"Held steady":outcome.label.toLowerCase()} in Year 1
                      </small>;
                    })()}
                  </span>
                </div>
                <div className="football-gm__roster-contract nba-gm-dev__roster-contract">
                  <b>{money(nbaGmDevSalary(player,nbaGmDevDisplaySalaryYear(run.phase)))}</b>
                  <span>{player.gameContract}</span>
                  <small className={`nba-gm-dev__roster-reprice is-${nbaGmRepriceLabel(player.repriceRisk,player.gameContract).tone}`}>
                    {nbaGmRepriceLabel(player.repriceRisk,player.gameContract).label}
                  </small>
                  {run.phase==="offseason"&&heldPlayers.length===0&&!run.shopPlayerId&&!run.freeAgencyTeam&&
                    <button className="nba-gm-dev__secondary nba-gm-dev__inline-shop" type="button"
                      aria-label={"Shop "+player.name} disabled={busy} onClick={()=>void act("shop",player.id)}>SHOP</button>}
                </div>
              </>:<span className="football-gm__open">OPEN</span>}
            </article>;
          })}
        </div>
      </section>}
      {run.phase==="draft"&&run.picks.length>0&&draftStage}
      {run.phase==="year1"&&<section className="football-gm__year-reveal surface-card nba-gm-dev__year-reveal">
        <p className="eyebrow">YEAR 1 COMPLETE</p>
        <Results seasons={run.results} graded={run.simulationModelVersion===6||run.simulationModelVersion===7||run.simulationModelVersion===8||run.simulationModelVersion===9}/>
        <button className="nba-gm-dev__primary" disabled={busy} onClick={()=>void act("offseason")}>
          ENTER THE OFFSEASON
        </button>
      </section>}
      {run.phase==="offseason"&&!isTradeStage&&<section className="nba-gm-dev__panel nba-gm-dev__offseason">
        <div className="nba-gm-dev__section-title"><div><small>AFTER SEASON 1</small><h2>OFFSEASON MOVES</h2></div></div>
        {capCrisis&&<p className="nba-gm-dev__cap-crisis" role="alert">SALARY CAP CRISIS · Your future payroll is over the cap. Trade or cut a player, then sign an affordable replacement before advancing.</p>}
        <p className="nba-gm-dev__hint">Shop a player above, or open a free-agent spot below.</p>
        {heldPlayers.length>0&&!run.shopPlayerId&&<section className="nba-gm-dev__displaced" aria-label="Displaced NBA trade assets">
          <small>ROSTER WORK REQUIRED</small><h2>HELD TRADE ASSET</h2>
          <p>You own this player outside your active seven. Promote them by choosing an active player to replace, or release the held asset. No free-agent visit is used.</p>
          {heldPlayers.map(id=><article key={id}>
            <strong>{byId.get(id)?.name??id}</strong>
            <span>{byId.get(id)?.positions.join(" / ")} · {byId.has(id)?money(nbaGmDevSalary(byId.get(id)!,1)):""} YEAR 2</span>
            <label>Move to roster for
              <select value={swapOut} onChange={e=>setSwapOut(e.target.value)}>
                <option value="">Choose active player</option>
                {run.picks.filter(pick=>{
                  const player=byId.get(id);
                  // Swapping a held asset does not change total salary. NFL GM
                  // permits the swap even during a temporary cap crisis.
                  return player&&nbaGmDevAssignRoster([
                    ...run.picks.filter(row=>row.playerId!==pick.playerId).map(row=>row.playerId),
                    player.id,
                  ],catalog)!==null;
                }).map(pick=><option key={pick.playerId} value={pick.playerId}>
                  {byId.get(pick.playerId)?.name??pick.playerId}</option>)}
              </select>
            </label>
            <button type="button" className="nba-gm-dev__secondary" disabled={busy}
              onClick={()=>void act("shop",id)}>SHOP HELD ASSET</button>
            <button type="button" className="nba-gm-dev__secondary" disabled={busy||!swapOut}
              onClick={()=>void act("promote-displaced",id,swapOut)}>PUT IN LINEUP</button>
            <button type="button" className="nba-gm-dev__secondary" disabled={busy}
              onClick={()=>{if(window.confirm("Release "+(byId.get(id)?.name??id)+" from held assets?"))void act("release-displaced",id);}}>RELEASE HELD ASSET</button>
          </article>)}
        </section>}
        {run.picks.length<7&&!run.shopPlayerId&&
          <div className="nba-gm-dev__trade">
            <p className="nba-gm-dev__hint">FREE AGENCY · {run.freeAgencyVisits}/3 VISITS · 1YR DEALS</p>
            {run.freeAgencyVisits<3||run.freeAgencyTeam?<GmFootballWheel ariaLabel="NBA team wheel" teams={wheelTeams} rotation={wheelRotation} spinning={wheelSpinning}
              pendingTeam={wheelSpinning?null:run.freeAgencyTeam?wheelTeam:null}
              canSpin={wheelEnabled} onSpin={()=>void spin("fa-spin")}/>:null}
            {run.freeAgencyTeam&&!wheelSpinning&&<>
              <strong>{NBA_TEAMS.find(t=>t.id===run.freeAgencyTeam)?.name} · 1YR FREE AGENTS</strong>
              <div className="nba-gm-dev__candidate-grid">
                {candidates.map(player=><PlayerCard key={player.id} player={player} run={run} disabled={busy}
                  action="SIGN" salaryYear={1} onPick={()=>void act("sign",player.id)}/>)}
              </div>
              <button className="nba-gm-dev__secondary" disabled={busy} onClick={()=>void act("pass-fa")}>PASS THIS TEAM</button>
            </>}
          </div>}
        {emergency.length>0&&<div className="nba-gm-dev__trade">
          <strong>EMERGENCY ROSTER COMPLETION</strong>
          <p className="nba-gm-dev__hint">All three visits used. Only affordable depth players may fill an open position. No rerolls.</p>
          <div className="nba-gm-dev__candidate-grid">
            {emergency.map(player=><PlayerCard key={player.id} player={player} run={run} disabled={busy}
              salaryYear={1} action="SIGN DEPTH" onPick={()=>void act("emergency-sign",player.id)}/>)}
          </div>
        </div>}
        {releasePanel}
      </section>}
      {run.phase==="offseason"&&!isTradeStage&&run.picks.length===7&&!run.shopPlayerId&&!run.freeAgencyTeam&&
        <section className={"nba-gm-dev__window-status surface-card"+(capCrisis||heldPlayers.length>0?" is-crisis":" is-ready")} role="status">
          {(capCrisis||heldPlayers.length>0)&&
            <small className="nba-gm-dev__window-eyebrow">{capCrisis?"CAP CRISIS":"ROSTER WORK REQUIRED"}</small>}
          <strong>{capCrisis||heldPlayers.length>0?"YOU HAVE MOVES TO MAKE":"READY TO ADVANCE"}</strong>
          <p>{heldPlayers.length>0?"Resolve your held trade asset.":capCrisis?"Get both future seasons under the cap.":"Roster fits both future salary caps."}</p>
          <button type="button" className="nba-gm-dev__primary" disabled={busy||capCrisis||heldPlayers.length>0} onClick={()=>void act("advance")}>
            SIMULATE YEARS 2 & 3
          </button>
        </section>}
      {run.phase==="final"&&(showSeasonReveal
        ?<NbaGmSeasonReveal run={run} onReveal={()=>{setShowSeasonReveal(false);window.scrollTo({top:0,behavior:"instant"});}}/>
        :<><NbaGmFinalExperience run={run} catalog={catalog}/>
          <button className="nba-gm-dev__primary" disabled={busy} onClick={()=>void act("start")}>NEW GM RUN</button></>)}
      <footer className="nba-gm-dev__disclaimer">Three seasons · Signed NBA salary windows</footer>
    </>}
  </main>;
}
function PlayerPicker({players,all,filter,setFilter,disabled,onPick}:{
  players:NbaGmDevPlayer[];all:NbaGmDevPlayer[];
  filter:string|null;setFilter:(value:string|null)=>void;disabled:boolean;
  onPick:(id:string)=>void;
}){
  const positions=["PG","SG","SF","PF","C"].filter(pos=>all.some(p=>p.positions.includes(pos as "PG"|"SG"|"SF"|"PF"|"C")));
  const code=all[0]?.teamCode??"";
  return <section className="football-wheel-picker football-gm__picker surface-card nba-gm-dev__picker">
    <header>
      {code&&<span className="football-wheel-team-logo"><TeamMark code={code}/></span>}
      <div><p className="eyebrow">YOUR SPIN</p><h2>{NBA_TEAMS.find(team=>team.id===code)?.name??"NBA TEAM"}</h2>
        <span>Choose a position, then a player. GM automatically fits the legal roster.</span>
      </div>
    </header>
    <div className="football-wheel-picker__slots football-gm__position-tabs nba-gm-dev__position-tabs"
      role="group" aria-label="Filter team candidates by basketball position">
      <button type="button" className={!filter?"is-active is-selected":""} aria-pressed={!filter}
        onClick={()=>setFilter(null)}><strong>ALL</strong></button>
      {positions.map(position=><button type="button" key={position} className={filter===position?"is-active is-selected":""}
        aria-pressed={filter===position} onClick={()=>setFilter(position)}><strong>{position}</strong></button>)}
    </div>
    <div className="football-wheel-picker__candidates nba-gm-dev__candidate-grid">
      {players.map(player=><PlayerCard key={player.id} player={player} disabled={disabled}
        onPick={()=>onPick(player.id)}/>)}
    </div>
  </section>;
}
