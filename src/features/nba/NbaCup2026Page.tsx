import {useEffect,useRef,useState,type CSSProperties} from "react";
import {Link} from "react-router-dom";
import {useIdentity} from "../identity/IdentityProvider";
import {NBA_TEAM_BY_ID} from "./nbaFutures";
import {NbaTeamMark,nbaTeamColor} from "./nbaTeamBranding";
import {CUP_GROUPS,CUP_POINTS,cupPickCount,type CupGroupPicks} from "./nbaCup2026";
import {loadCupPreview,saveCupPreview} from "./nbaCupRepository";
import {NbaCupHero} from "./NbaCupHero";
import "../../styles/nba-hq.css";
import "./nbaCup2026.css";

const serializePicks=(value:CupGroupPicks)=>JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b))));

export default function NbaCup2026Page(){
  const {profile}=useIdentity();
  const [conference,setConference]=useState<"East"|"West">("East");
  const [picks,setPicks]=useState<CupGroupPicks|null>(null);
  const [saved,setSaved]=useState("{}");
  const [locked,setLocked]=useState(false);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const tabsRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    let active=true;
    setLoading(true);setError("");
    if(!profile?.id){setLoading(false);return()=>{active=false};}
    void loadCupPreview().then(snapshot=>{
      if(!active)return;
      setPicks(snapshot.picks);setSaved(serializePicks(snapshot.picks));
      setLocked(snapshot.locked);setLoading(false);
    }).catch(err=>{if(active){setError(err instanceof Error?err.message:"Could not load Cup picks.");setLoading(false);}});
    return()=>{active=false};
  },[profile?.id]);
  const count=cupPickCount(picks??{});
  const dirty=picks!==null&&serializePicks(picks)!==saved;
  async function save(){
    if(!picks||locked||saving||!dirty)return;
    setSaving(true);setError("");setNotice("");
    try{
      const response=await saveCupPreview(picks);
      setPicks(response.picks);setSaved(serializePicks(response.picks));setLocked(response.locked);
      setNotice("NBA Cup picks saved.");
    }catch(err){setError(err instanceof Error?err.message:"Unable to save picks.");}
    finally{setSaving(false);}
  }
  function switchConference(next:"East"|"West",scroll=false){
    setConference(next);
    if(scroll)tabsRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
  }
  return <div className="page nba-hq-page nba-cup" data-sport="nba" data-testid="nba-cup-picks">
    <NbaCupHero/>
    <main className="nba-cup__main">
      <section className="nba-cup__summary" aria-label="NBA Cup group-pick progress">
        <div className="nba-cup__summary-title"><b>GROUP WINNERS</b><b>{count}/6 PICKED</b></div>
        <div className="nba-cup__progress" role="progressbar" aria-label="Groups picked" aria-valuenow={count} aria-valuemin={0} aria-valuemax={6}><span style={{width:(count/6*100)+"%"}} /></div>
        <p>Pick one winner from each group. Two wildcards also advance automatically—no extra picks needed.</p>
        <div className="nba-cup__summary-foot"><span>OCT 30 – NOV 27 · GROUP PLAY</span><strong>{locked?"PICKS LOCKED":dirty?"UNSAVED CHANGES":"PICKS OPEN"}</strong></div>
      </section>
      <Link className="nba-cup__back" to="/nba/picks">← BASKETBALL PICKS</Link>
      {loading?<p role="status">Loading NBA Cup picks…</p>:null}
      {error?<p role="alert" className="nba-hq-error">{error}</p>:null}
      {picks?<><div className="nba-cup__tabs" ref={tabsRef} role="group" aria-label="Conference">
        {(["East","West"] as const).map(conf=><button key={conf} type="button" aria-pressed={conference===conf} className={conference===conf?"is-active":""} onClick={()=>switchConference(conf)}>
          {conf.toUpperCase()} · {CUP_GROUPS.filter(g=>g.conference===conf&&picks[g.id]).length}/3
        </button>)}
      </div>
      {CUP_GROUPS.filter(g=>g.conference===conference).map(group=><section className="nba-cup__group" key={group.id} aria-label={group.name}>
        <header><h2>{group.name}</h2><small>{picks[group.id]?"✓ PICKED":"5 POINTS"}</small></header>
        <div className="nba-cup__teams">{group.teams.map(id=>{
          const team=NBA_TEAM_BY_ID.get(id);
          if(!team)return null;
          const chosen=picks[group.id]===id;
          return <button key={id} type="button" disabled={locked||saving} aria-pressed={chosen}
            className={"nba-cup__team"+(chosen?" is-selected":"")}
            style={{"--team-accent":nbaTeamColor(id)} as CSSProperties}
            onClick={()=>{setPicks(x=>({...x,[group.id]:id}));setNotice("");}}>
            <NbaTeamMark team={team}/><span>{team.name}</span><b aria-hidden="true">{chosen?"✓":"○"}</b>
          </button>;
        })}</div>
      </section>)}
      <button className="nba-cup__conference-next" type="button" onClick={()=>switchConference(conference==="East"?"West":"East",true)}>
        {conference==="East"?"CONTINUE TO WEST GROUPS →":"← REVIEW EAST GROUPS"}
      </button>
      <section className="nba-cup__save">
        <div><strong>{count===6?"ALL SIX GROUPS PICKED":(6-count)+" PICKS REMAIN"}</strong>
          <small>{locked?"Your NBA Cup picks are locked.":dirty?"Unsaved changes": "Selections saved"}</small></div>
        {!locked?<button type="button" className="primary-action" disabled={!dirty||saving} onClick={()=>void save()}>
          {saving?"SAVING…":"SAVE MY PICKS"}
        </button>:null}
      </section>
      {notice?<p role="status" className="nba-cup__notice">{notice}</p>:null}
      <details className="nba-cup__next">
        <summary><span><small>COMING IN DECEMBER</small><strong>KNOCKOUT BRACKET</strong></span><b aria-hidden="true">⌄</b></summary>
        <div className="nba-cup__next-body">
          <p>Once the eight teams qualify, pick four quarterfinal winners, two semifinal winners and the Cup champion.</p>
          <div className="nba-cup__points">{Object.entries(CUP_POINTS).map(([key,value])=><span key={key}>{key==="groups"?"Groups":key==="quarterfinals"?"Quarterfinals":key==="semifinals"?"Semifinals":"Champion"}<b>{value}</b></span>)}</div>
        </div>
      </details>
      {dirty&&!locked?<div className="nba-cup__floating-save" role="region" aria-label="Unsaved NBA Cup picks">
        <span>{count}/6 SELECTED</span><button type="button" disabled={saving} onClick={()=>void save()}>{saving?"SAVING…":"SAVE PICKS"}</button>
      </div>:null}
      </>:null}
    </main>
  </div>;
}
