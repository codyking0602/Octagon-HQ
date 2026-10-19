import { useCallback,useEffect,useMemo,useRef,useState } from "react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { NbaTeamMark,nbaTeamColor } from "./nbaTeamBranding";
import { useIdentity } from "../identity/IdentityProvider";
import { NBA_SEASON,NBA_TEAMS,NBA_FUTURES_MAX,NBA_FUTURES_SELECTIONS,
  NBA_FUTURES_LINE_SOURCE,emptyNbaFutures,
  isNbaFuturesComplete,nbaFuturesProgress,validateNbaFutures,
  type NbaFuturesPicks,type WinPick,type Conference } from "./nbaFutures";
import { loadNbaFutures,saveNbaFutures,type NbaFuturesSnapshot } from "./nbaFuturesRepository";
import "../../styles/nba-hq.css";

function formattedLock(value:string) {
  return new Intl.DateTimeFormat("en-US",{timeZone:"America/Chicago",month:"short",day:"numeric",
    hour:"numeric",minute:"2-digit",timeZoneName:"short"}).format(new Date(value));
}
function FuturesSection({title,progress,points,open,onToggle,children}:{
  title:string;progress:string;points:number;open:boolean;onToggle:()=>void;children:ReactNode;
}) {
  return <section className="nba-futures-section">
    <button type="button" className="nba-futures-section-toggle" onClick={onToggle} aria-expanded={open}>
      <strong>{title}</strong><span>{progress} · {points} PTS</span><b aria-hidden="true">{open?"⌃":"⌄"}</b>
    </button>
    {open?<div className="nba-futures-section-body">{children}</div>:null}
  </section>;
}
function TeamSelector({title,points,selected,options,limit,perConference,onChange,locked,help,open,onToggle}:{
  title:string;points:number;selected:string[];options:string[];limit:number;perConference:number;
  onChange:(next:string[])=>void;locked:boolean;help?:string;open:boolean;onToggle:()=>void;
}) {
  return <FuturesSection title={title} progress={selected.length+"/"+limit} points={points} open={open} onToggle={onToggle}>
    {help?<p className="nba-futures-helper">{help}</p>:null}
    <div className="nba-futures-teams">
      {(["East","West"] as const).map(conf=><div key={conf} className="nba-futures-conference">
        <h3>{conf.toUpperCase()}</h3>
        <div className="nba-futures-choices">
          {NBA_TEAMS.filter(t=>t.conference===conf&&options.includes(t.id)).map(t=>{
            const picked=selected.includes(t.id);
            const limitReached=selected.length>=limit||selected.filter(id=>NBA_TEAMS.some(team=>team.id===id&&team.conference===conf)).length>=perConference;
            return <button key={t.id} type="button" aria-pressed={picked} className={picked?"is-selected":""}
              disabled={locked||(!picked&&limitReached)}
              style={{borderLeftColor:nbaTeamColor(t.id)}}
              onClick={()=>onChange(picked?selected.filter(id=>id!==t.id):[...selected,t.id])}>
              <NbaTeamMark team={t}/><span>{t.name}</span>
            </button>;
          })}
        </div>
        {!options.some(id=>NBA_TEAMS.find(t=>t.id===id)?.conference===conf)
          ?<p className="nba-futures-empty">Choose eligible teams in the previous section first.</p>:null}
      </div>)}
    </div>
  </FuturesSection>;
}
function NbaFuturesForm({picks,locked,onChange}:{
  picks:NbaFuturesPicks;locked:boolean;onChange:(p:NbaFuturesPicks)=>void;
}){
  const [showWest,setShowWest]=useState(false);
  const [openSection,setOpenSection]=useState<string|null>("wins");
  const toggle=(section:string)=>setOpenSection(current=>current===section?null:section);
  const update=<K extends keyof NbaFuturesPicks>(key:K,value:NbaFuturesPicks[K])=>onChange({...picks,[key]:value});
  const alterTeam=(key:"playoffTeams"|"conferenceFinalists"|"finalsTeams",values:string[])=>{
    const next={...picks,[key]:values};
    if(key==="playoffTeams"){
      next.conferenceFinalists=picks.conferenceFinalists.filter(id=>values.includes(id));
      next.finalsTeams=picks.finalsTeams.filter(id=>next.conferenceFinalists.includes(id));
      if(!next.finalsTeams.includes(picks.champion)) next.champion="";
    }
    if(key==="conferenceFinalists"){
      next.finalsTeams=picks.finalsTeams.filter(id=>values.includes(id));
      if(!next.finalsTeams.includes(picks.champion))next.champion="";
    }
    if(key==="finalsTeams"&&!values.includes(picks.champion))next.champion="";
    onChange(next);
  };
  return <>
    <FuturesSection title="30-Team Win Totals" progress={Object.keys(picks.winTotals).length+"/30"}
      points={30} open={openSection==="wins"} onToggle={()=>toggle("wins")}>
      <p className="nba-futures-helper">One tap per team. Win totals are locked for every player to the same published board.</p>
      <div className="nba-futures-segments" role="group" aria-label="Win totals conference">
        <button className={!showWest?"is-active":""} type="button" aria-pressed={!showWest} onClick={()=>setShowWest(false)}>East · {NBA_TEAMS.filter(t=>t.conference==="East"&&picks.winTotals[t.id]).length}/15</button>
        <button className={showWest?"is-active":""} type="button" aria-pressed={showWest} onClick={()=>setShowWest(true)}>West · {NBA_TEAMS.filter(t=>t.conference==="West"&&picks.winTotals[t.id]).length}/15</button>
      </div>
      <div className="nba-futures-win-list">
        {NBA_TEAMS.filter(t=>t.conference===(showWest?"West":"East")).map(t=><div className="nba-futures-win-row" key={t.id}>
          <div className="nba-futures-teamline"><NbaTeamMark team={t}/><span><strong>{t.name}</strong><small>{t.line} wins</small></span></div>
          <div className="nba-futures-win-buttons">
            {(["over","under"] as const).map(choice=><button type="button" key={choice}
              aria-pressed={picks.winTotals[t.id]===choice} disabled={locked}
              className={picks.winTotals[t.id]===choice?"is-selected":""}
              onClick={()=>{
                const updated={...picks.winTotals}; 
                if(updated[t.id]===choice) delete updated[t.id];else updated[t.id]=choice as WinPick;
                update("winTotals",updated);
              }}>{choice==="over"?"OVER":"UNDER"}</button>)}
          </div>
        </div>)}
      </div>
      <p className="nba-futures-source">Source: <a href="https://sports.betmgm.com/en/blog/nba/nba-odds-predictions-season-win-totals-bm23/" target="_blank" rel="noreferrer">{NBA_FUTURES_LINE_SOURCE} ↗</a></p>
    </FuturesSection>
    <TeamSelector title="16 Playoff Teams" points={16} selected={picks.playoffTeams} options={NBA_TEAMS.map(t=>t.id)}
      limit={16} perConference={8} locked={locked} open={openSection==="playoffs"} onToggle={()=>toggle("playoffs")}
      onChange={v=>alterTeam("playoffTeams",v)}
      help="Choose eight teams per conference. These are the 16 teams that make the final playoff bracket after the Play-In."/>
    <TeamSelector title="Conference Finals" points={12} selected={picks.conferenceFinalists}
      options={picks.playoffTeams} limit={4} perConference={2} locked={locked}
      open={openSection==="conference"} onToggle={()=>toggle("conference")}
      onChange={v=>alterTeam("conferenceFinalists",v)}
      help="Pick two teams from each conference (3 points each)."/>
    <TeamSelector title="NBA Finals Matchup" points={12} selected={picks.finalsTeams}
      options={picks.conferenceFinalists} limit={2} perConference={1} locked={locked}
      open={openSection==="finals"} onToggle={()=>toggle("finals")}
      onChange={v=>alterTeam("finalsTeams",v)} help="One Eastern and one Western Conference finalist (6 points each)."/>
    <FuturesSection title="NBA Champion" progress={(picks.champion?"1":"0")+"/1"} points={20}
      open={openSection==="champion"} onToggle={()=>toggle("champion")}>
      <select aria-label="NBA Champion" disabled={locked||!picks.finalsTeams.length}
        value={picks.champion} onChange={e=>update("champion",e.target.value)}>
        <option value="">Select your champion</option>
        {NBA_TEAMS.filter(t=>picks.finalsTeams.includes(t.id)).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
    </FuturesSection>
    <FuturesSection title="Season Awards" progress={[picks.mvp,picks.dpoy].filter(Boolean).length+"/2"}
      points={10} open={openSection==="awards"} onToggle={()=>toggle("awards")}>
      <p className="nba-futures-helper">Enter the player’s full name. Use the NBA’s official season awards.</p>
      {([["mvp","Most Valuable Player",7],["dpoy","Defensive Player of the Year",3]] as const).map(([key,label,points])=>
        <label className="nba-futures-award" key={key}>
          <span><strong>{label}</strong><small>{points} PTS</small></span>
          <input type="text" autoComplete="off" maxLength={120} disabled={locked} value={picks[key]}
            placeholder="Player name" onChange={e=>update(key,e.target.value)}/>
        </label>)}
    </FuturesSection>
  </>;
}
export default function NbaFuturesPage() {
  const identity=useIdentity();
  const [snapshot,setSnapshot]=useState<NbaFuturesSnapshot|null>(null);
  const [draft,setDraft]=useState<NbaFuturesPicks|null>(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [saved,setSaved]=useState(false);
  const queue=useRef<Promise<void>>(Promise.resolve());
  const persisted=useRef("");
  const current=useRef("");
  useEffect(()=>{
    let alive=true;
    setDraft(null);setSnapshot(null);setLoading(true);setError("");
    if(!identity.profile?.id){setLoading(false);return()=>{alive=false};}
    void loadNbaFutures().then(data=>{
      if(!alive)return;
      // Never silently overwrite the canonical server-published lines.
      if(data.lines.length!==NBA_TEAMS.length||data.lines.some(t=>NBA_TEAMS.find(x=>x.id===t.id)?.line!==t.line))
        throw new Error("Frozen NBA win-total lines could not be verified.");
      // Retired categories may exist in an earlier owner-preview draft; never resubmit them.
      const restored={...emptyNbaFutures(),...data.own,oneSeeds:[],roy:"",mip:"",cupChampion:""};
      current.current=JSON.stringify(restored);persisted.current=current.current;
      setSnapshot(data);setDraft(restored);setLoading(false);
    }).catch(reason=>{if(alive){setError(reason instanceof Error?reason.message:"Futures unavailable.");setLoading(false);}});
    return()=>{alive=false};
  },[identity.profile?.id]);
  const persist=useCallback((next:NbaFuturesPicks)=>{
    const serialized=JSON.stringify(next);
    if(serialized===persisted.current)return;
    setSaving(true);setSaved(false);setError("");
    const write=queue.current.catch(()=>undefined).then(()=>saveNbaFutures(next));
    queue.current=write.catch(()=>undefined);
    void write.then(()=>{
      persisted.current=serialized;
      if(current.current===serialized){setSaving(false);setSaved(true);}
    }).catch(reason=>{setSaving(false);setError(reason instanceof Error?reason.message:"Could not save NBA Futures.");});
  },[]);
  useEffect(()=>{
    if(!draft||!snapshot||snapshot.locked)return;
    const json=JSON.stringify(draft);current.current=json;
    if(json===persisted.current)return;
    const timeout=setTimeout(()=>persist(draft),650);
    return()=>clearTimeout(timeout);
  },[draft,snapshot,persist]);
  const errors=useMemo(()=>draft?validateNbaFutures(draft):[],[draft]);
  const progress=draft?nbaFuturesProgress(draft):0;
  const locked=snapshot?.locked??false;
  return <div className="page nba-hq-page" data-sport="nba">
    <header className="nba-hq-hero">
      <p className="eyebrow">BASKETBALL HQ · 2026–27</p>
      <h1>NBA Futures</h1>
      <p>Pick the entire season. One card, 100 points, and 15% of the Basketball Championship.</p>
      <div className="nba-hq-weightline"><span>FUTURES 15%</span><span>CUP 10%</span><span>PLAYOFFS 55%</span><span>GAMES 20%</span></div>
      <Link to="/championship/nba">BASKETBALL CHAMPIONSHIP ↗</Link>
    </header>
    {!identity.profile?.id?<section className="surface-card nba-hq-notice"><p>Sign in to save your official NBA Futures predictions.</p>
      <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN TO PICK</button></section>:null}
    {loading?<p role="status" className="nba-hq-notice">Loading NBA Futures…</p>:null}
    {error?<p role="alert" className="nba-hq-error">{error}</p>:null}
    {draft&&snapshot?<main className="nba-futures-form">
      <div className="nba-futures-progress">
        <div><strong>{progress}/{NBA_FUTURES_SELECTIONS} PICKS</strong><span>{locked?"LOCKED":saving?"SAVING…":saved?"SAVED ✓":isNbaFuturesComplete(draft)?"ALL PICKS READY":"AUTOSAVES AS YOU PICK"}</span></div>
        <div className="nba-futures-track"><span style={{width:(100*progress/NBA_FUTURES_SELECTIONS)+"%"}} /></div>
        <p>{locked?"Your saved picks are final.": "Scheduled lock: "+formattedLock(snapshot.lock_at)+". Picks stay editable until HQ officially closes entries."}</p>
      </div>
      <NbaFuturesForm picks={draft} locked={locked} onChange={next=>{setDraft(next);setSaved(false);}}/>
      {errors.length?<p role="alert" className="nba-hq-error">{errors[0]}</p>:null}
      <div className="nba-futures-save">
        <button className="primary-action" type="button" disabled={locked||saving||errors.length>0}
          onClick={()=>persist(draft)}>{locked?"PICKS LOCKED":"SAVE MY FUTURES PICKS"}</button>
        <small>{isNbaFuturesComplete(draft)?"All 55 selections complete.":"Partial drafts are saved and can be finished later."}</small>
      </div>
    </main>:null}
  </div>;
}
