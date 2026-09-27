import { useEffect, useMemo, useState } from "react";
import "../../styles/football-weekly-superteam.css";
import type {
  FootballWeeklyAuctionBidPayload,
  FootballWeeklySuperteamCard,
  FootballWeeklySuperteamFinal,
  FootballWeeklySuperteamRosterSlot,
  FootballWeeklySuperteamState,
} from "../play/footballWeeklyAuctionRepository";
import { footballCfbTeamMediaId } from "./footballMediaIdentity";
import { footballTeamAssets } from "./footballSubjectAssets";
import { CFB_BUILD_QB_SCHOOL_COLORS } from "./cfbBuildQbVisualIdentity";

const ROSTER_SLOTS: readonly FootballWeeklySuperteamRosterSlot[] = ["QB","RB","WR","Flex","Front Seven","Secondary","Head Coach"];
type ClaimDraft = { amount:number; roster_slot:FootballWeeklySuperteamRosterSlot; priority:number };
type ClaimMap = Record<number, ClaimDraft>;
type FinalTab = "standings"|"team"|"rosters";

function SchoolMark({school}:{school:string}) {
  const [failed,setFailed]=useState(false);
  const asset=footballTeamAssets[footballCfbTeamMediaId(school)];
  return <span className="football-weekly-superteam__mark" aria-hidden="true">
    {asset&&!failed?<img src={asset.src} alt="" onError={()=>setFailed(true)}/>:<b>{school.slice(0,2).toUpperCase()}</b>}
  </span>;
}
function schoolStyle(school:string) {
  const colors=CFB_BUILD_QB_SCHOOL_COLORS[school]??["#17365D","#FFFFFF"];
  return {"--superteam-primary":colors[0],"--superteam-secondary":colors[1]} as React.CSSProperties;
}
function eligibleTargets(card:FootballWeeklySuperteamCard):FootballWeeklySuperteamRosterSlot[] {
  switch(card.candidate_group){
    case "QB":return ["QB"]; case "RB":return ["RB","Flex"]; case "WR":return ["WR","Flex"];
    case "TE":return ["Flex"]; case "Front Seven":return ["Front Seven"];
    case "Secondary":return ["Secondary"]; case "Head Coach":return ["Head Coach"];
  }
}
function defaultTarget(card:FootballWeeklySuperteamCard,filled:ReadonlySet<FootballWeeklySuperteamRosterSlot>){
  const targets=eligibleTargets(card); return targets.find((target)=>!filled.has(target))??targets[0]!;
}
function initialClaimMap(state:FootballWeeklySuperteamState):ClaimMap {
  const filled=new Set(state.roster.map((entry)=>entry.roster_slot));
  return Object.fromEntries(state.teams.map((card)=>[card.slot,state.claims[String(card.slot)]??{
    amount:0,roster_slot:defaultTarget(card,filled),priority:card.slot,
  }])) as ClaimMap;
}
function RulesCover({onStart}:{onStart:()=>void}){
  return <section className="football-weekly-superteam__cover surface-card">
    <p className="eyebrow">WEEKLY AUCTION · CFB</p><h1>BUILD A SUPERTEAM</h1><strong>7 spots. $50. 7 days.</strong>
    <div><p>Build a complete college football superteam from peak single-season versions.</p><ul>
      <li>Fill QB, RB, WR, Flex, Front Seven, Secondary and Head Coach.</li>
      <li>Eight candidates appear each day. Every candidate burns after appearing.</li>
      <li>Rank claims freely. Lower-priority wins cancel when cash or a roster slot is gone.</li>
      <li>You can win at most <strong>2 players per day</strong>.</li>
      <li><strong>$1 stays protected for every open roster spot.</strong></li>
      <li>Same bid: higher claim priority wins. Same priority: the weekly waiver order rotates daily.</li>
      <li>Your seven hidden grades are averaged for the final score.</li>
    </ul></div>
    <button className="football-weekly-superteam__primary" type="button" onClick={onStart}>START TODAY’S AUCTION</button>
  </section>;
}
function RosterStrip({state}:{state:FootballWeeklySuperteamState}){
  const roster=new Map(state.roster.map((entry)=>[entry.roster_slot,entry]));
  return <section className="football-weekly-superteam__roster" aria-label="Your Superteam roster">{ROSTER_SLOTS.map((slot)=>{
    const entry=roster.get(slot);
    return <article className={entry?"is-filled":""} key={slot}><small>{slot}</small><strong>{entry?entry.display_name:"OPEN"}</strong><span>{entry?entry.school+" · "+entry.season_year:"$1 RESERVED"}</span></article>;
  })}</section>;
}
function PriorResults({state}:{state:FootballWeeklySuperteamState}){
  if(!state.prior_results.length)return null;
  return <section className="football-weekly-superteam__prior surface-card"><header><p className="eyebrow">YESTERDAY</p><strong>Resolved claims</strong></header><div>
    {state.prior_results.map((result)=><article key={result.slot}>
      <span>{result.display_name} · {result.school} {result.season_year}</span>
      <strong>{result.winner_display_name?result.winner_display_name+" · $"+result.winning_bid+(result.roster_slot?" → "+result.roster_slot:""):"No winner"}</strong>
      <details><summary>All claims</summary>{result.bids.map((bid)=><p key={bid.profile_id}><span>{bid.display_name}</span><b>{bid.amount?"#"+(bid.priority??"—")+" · $"+bid.amount:"PASS"}</b></p>)}</details>
    </article>)}
  </div></section>;
}
function CandidateCard({card,claim,filled,maxBid,disabled,onClaim,onMove}:{
  card:FootballWeeklySuperteamCard; claim:ClaimDraft; filled:ReadonlySet<FootballWeeklySuperteamRosterSlot>;
  maxBid:number; disabled:boolean; onClaim:(claim:ClaimDraft)=>void; onMove:(direction:-1|1)=>void;
}){
  const available=eligibleTargets(card).filter((target)=>!filled.has(target));
  const closed=!available.length;
  const target=available.includes(claim.roster_slot)?claim.roster_slot:available[0]??claim.roster_slot;
  const amount=closed?0:claim.amount;
  return <article className={"football-weekly-superteam__candidate"+(closed?" is-closed":"")} style={schoolStyle(card.school)}>
    <div className="football-weekly-superteam__candidate-main"><SchoolMark school={card.school}/><div><small>{card.candidate_group}</small><strong>{card.display_name}</strong><span>{card.school} · {card.season_year}</span></div>
      <div className="football-weekly-superteam__priority"><button type="button" disabled={disabled||claim.priority<=1} onClick={()=>onMove(-1)}>↑</button><b>#{claim.priority}</b><button type="button" disabled={disabled||claim.priority>=8} onClick={()=>onMove(1)}>↓</button></div>
    </div>
    {closed?<div className="football-weekly-superteam__closed">ELIGIBLE SLOT FILLED</div>:<div className="football-weekly-superteam__controls">
      <label className="football-weekly-superteam__target"><span>ROSTER SLOT</span>{available.length===1?<strong>{available[0]}</strong>:<select disabled={disabled} value={target} onChange={(event)=>onClaim({...claim,roster_slot:event.target.value as FootballWeeklySuperteamRosterSlot})}>{available.map((value)=><option key={value}>{value}</option>)}</select>}</label>
      <div className="football-weekly-superteam__bid"><button type="button" disabled={disabled||amount<=0} onClick={()=>onClaim({...claim,roster_slot:target,amount:Math.max(0,amount-1)})}>−</button>
        <label><span>BID</span><b>$</b><input inputMode="numeric" pattern="[0-9]*" type="number" min={0} max={maxBid} step={1} disabled={disabled} value={amount} onChange={(event)=>{const next=Math.floor(Number(event.currentTarget.value));onClaim({...claim,roster_slot:target,amount:Number.isFinite(next)?Math.max(0,Math.min(maxBid,next)):0});}}/></label>
        <button type="button" disabled={disabled||amount>=maxBid} onClick={()=>onClaim({...claim,roster_slot:target,amount:Math.min(maxBid,amount+1)})}>+</button>
      </div>
    </div>}
  </article>;
}
export function FootballWeeklySuperteamFinalResult({result,busy,onAcknowledge,showNewWeekAction=true}:{
  result:FootballWeeklySuperteamFinal;busy:boolean;onAcknowledge:()=>void;showNewWeekAction?:boolean;
}){
  const [tab,setTab]=useState<FinalTab>("standings");
  const me=result.my_result;
  const [selectedProfileId,setSelectedProfileId]=useState(result.standings.find((entry)=>entry.is_current_user)?.profile_id??result.standings[0]?.profile_id??"");
  const selected=result.standings.find((entry)=>entry.profile_id===selectedProfileId);
  const selectedRoster=result.all_rosters.filter((entry)=>entry.profile_id===selectedProfileId).sort((a,b)=>ROSTER_SLOTS.indexOf(a.roster_slot)-ROSTER_SLOTS.indexOf(b.roster_slot));
  return <section className="football-weekly-superteam__final surface-card">
    <header><p className="eyebrow">WEEKLY AUCTION · CFB SUPERTEAM</p><h1>FINAL RESULTS</h1><span>Seven-slot average decides the week.</span></header>
    <div className={me.is_winner?"is-champion":"is-finish"}><small>{me.is_winner?"WEEKLY CHAMPION":"YOUR FINISH"}</small><strong>{me.is_winner?"You":me.final_rank?"#"+me.final_rank:"—"}</strong><b>{me.final_score?.toFixed(1)??"—"}</b></div>
    <nav><button className={tab==="standings"?"is-active":""} onClick={()=>setTab("standings")}>Standings</button><button className={tab==="team"?"is-active":""} onClick={()=>setTab("team")}>Your Team</button><button className={tab==="rosters"?"is-active":""} onClick={()=>setTab("rosters")}>All Rosters</button></nav>
    {tab==="standings"?<div className="football-weekly-superteam__standings">{result.standings.map((entry)=><div className={entry.is_current_user?"is-current":""} key={entry.profile_id}><b>#{entry.rank??"—"}</b><strong>{entry.display_name}</strong><span>{entry.final_score?.toFixed(1)??"—"}</span></div>)}</div>:null}
    {tab==="team"?<div className="football-weekly-superteam__final-roster">{result.collection.map((entry)=><article key={entry.roster_slot} style={schoolStyle(entry.school)}><SchoolMark school={entry.school}/><div><small>{entry.roster_slot}</small><strong>{entry.display_name}</strong><span>{entry.school} · {entry.season_year} · ${entry.price_paid}{entry.source==="autofill"?" · AUTOFILL":""}</span></div><b>{entry.grade.toFixed(1)}</b></article>)}</div>:null}
    {tab==="rosters"?<div className="football-weekly-superteam__all-rosters"><div className="football-weekly-superteam__player-picker">{result.standings.map((entry)=><button className={entry.profile_id===selectedProfileId?"is-active":""} key={entry.profile_id} onClick={()=>setSelectedProfileId(entry.profile_id)}>{entry.display_name}</button>)}</div><strong>{selected?.display_name??"Roster"} · {selected?.final_score?.toFixed(1)??"—"}</strong>{selectedRoster.map((entry)=><article key={entry.roster_slot}><span>{entry.roster_slot}</span><b>{entry.player_name}</b><small>{entry.school} · {entry.season_year} · {entry.grade.toFixed(1)}</small></article>)}</div>:null}
    {showNewWeekAction?<button className="football-weekly-superteam__primary" type="button" disabled={busy} onClick={onAcknowledge}>START THE NEW WEEK</button>:null}
  </section>;
}
export function FootballWeeklySuperteamGate({state,busy,error,forceBoard=false,onSubmit,onContinue}:{
  state:FootballWeeklySuperteamState;busy:boolean;error:string|null;forceBoard?:boolean;
  onSubmit:(bids:FootballWeeklyAuctionBidPayload)=>Promise<void>;onContinue:()=>void;
}){
  const [introDismissed,setIntroDismissed]=useState(false);
  const [editing,setEditing]=useState(!state.submitted_today);
  const filled=useMemo(()=>new Set(state.roster.map((entry)=>entry.roster_slot)),[state.roster]);
  const initial=useMemo(()=>initialClaimMap(state),[state]);
  const [claims,setClaims]=useState<ClaimMap>(initial);
  useEffect(()=>{setClaims(initial);setEditing(!state.submitted_today);},[initial,state.submitted_today]);
  if(state.show_intro&&!introDismissed&&!forceBoard)return <RulesCover onStart={()=>setIntroDismissed(true)}/>;
  const submitted=state.submitted_today&&!editing;
  const totalClaims=Object.values(claims).reduce((sum,claim)=>sum+claim.amount,0);
  function movePriority(slot:number,direction:-1|1){setClaims((current)=>{const source=current[slot];if(!source)return current;const next=source.priority+direction;const pair=Object.entries(current).find(([,claim])=>claim.priority===next);if(!pair)return current;const other=Number(pair[0]);return {...current,[slot]:{...source,priority:next},[other]:{...current[other],priority:source.priority}};});}
  const payload:FootballWeeklyAuctionBidPayload=Object.fromEntries(state.teams.map((card)=>{const claim=claims[card.slot]!;const available=eligibleTargets(card).filter((target)=>!filled.has(target));const rosterSlot=available.includes(claim.roster_slot)?claim.roster_slot:available[0]??claim.roster_slot;return [card.slot,{amount:available.length?claim.amount:0,roster_slot:rosterSlot,priority:claim.priority}];}));
  return <div className="football-weekly-superteam">
    <div className="football-weekly-superteam__status"><div><small>ROSTER</small><strong>{state.owned_count}/7</strong></div><div><small>BANKROLL</small><strong>${state.bankroll}</strong></div><div><small>MAX CLAIM</small><strong>${state.max_commit}</strong></div></div>
    <RosterStrip state={state}/><PriorResults state={state}/>
    <section className="football-weekly-superteam__board surface-card"><header><div><p className="eyebrow">WEEKLY AUCTION · CFB</p><h1>SUPERTEAM</h1><span>DAY {state.day_index} OF 7</span></div><div><strong>${totalClaims}</strong><small>RANKED CLAIMS</small></div></header>
      <p className="football-weekly-superteam__note">Claims may total more than your bankroll. Priority decides which conditional wins survive. Max 2 wins today.</p>
      <div className="football-weekly-superteam__cards">{state.teams.map((card)=><CandidateCard key={card.slot} card={card} claim={claims[card.slot]!} filled={filled} maxBid={state.max_commit} disabled={submitted||busy} onClaim={(claim)=>setClaims((current)=>({...current,[card.slot]:claim}))} onMove={(direction)=>movePriority(card.slot,direction)}/>)}</div>
      {error?<p className="football-weekly-superteam__error">{error}</p>:null}
      <p className="football-weekly-superteam__reserve">${state.reserve_floor} protected · $1 for each open roster spot · bids lock at midnight CT</p>
      {submitted?<div className="football-weekly-superteam__submitted"><div><strong>CLAIMS SUBMITTED</strong><span>Edit until midnight CT.</span></div><button type="button" disabled={busy} onClick={()=>setEditing(true)}>EDIT CLAIMS</button><button className="football-weekly-superteam__primary" type="button" disabled={busy} onClick={onContinue}>CONTINUE TO DAILY CHALLENGE</button></div>:<button className="football-weekly-superteam__primary" type="button" disabled={busy} onClick={()=>void onSubmit(payload)}>{state.submitted_today?"SAVE CLAIM CHANGES":"SUBMIT TODAY’S CLAIMS"}</button>}
    </section>
  </div>;
}
