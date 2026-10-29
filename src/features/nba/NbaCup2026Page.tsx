import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {useIdentity} from "../identity/IdentityProvider";
import {NBA_TEAM_BY_ID} from "./nbaFutures";
import {NbaTeamMark,nbaTeamColor} from "./nbaTeamBranding";
import {CUP_GROUPS,CUP_POINTS,cupPickCount,type CupGroupPicks} from "./nbaCup2026";
import {loadCupPreview,saveCupPreview} from "./nbaCupRepository";
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
    if(!picks||locked||saving)return;
    setSaving(true);setError("");setNotice("");
    try{
      const response=await saveCupPreview(picks);
      setSaved(serializePicks(response.picks));setLocked(response.locked);
      setNotice("Your NBA Cup picks have been saved to your HQ profile.");
    }catch(err){setError(err instanceof Error?err.message:"Unable to save picks.");}
    finally{setSaving(false);}
  }
  return <div className="page nba-hq-page nba-cup" data-sport="nba" data-testid="nba-cup-owner-preview">
    <header className="nba-hq-hero">
      <p className="eyebrow">BASKETBALL HQ · PRIVATE OWNER TEST</p>
      <h1>NBA Cup 2026</h1>
      <p>Pick the winner of each group. Six picks now, then a knockout bracket in December.</p>
      <div className="nba-hq-weightline"><span>GROUPS 30 PTS</span><span>KNOCKOUT 70 PTS</span><span>CUP 10% OF SEASON</span></div>
      <Link to="/nba/picks">← NBA FUTURES</Link>
    </header>
    <main className="nba-cup__main">
      <section className="nba-cup__summary">
        <div className="nba-cup__summary-title"><b>GROUP WINNERS</b><b>{count}/6</b></div>
        <div className="nba-cup__progress"><span style={{width:(count/6*100)+"%"}} /></div>
        <p>Choose the team that will finish first in each group. Six group winners and two wildcards advance to the eight-team knockout bracket. No wildcard picks needed.</p>
        <div className="nba-cup__summary-foot"><span>Oct 30 – Nov 27 · Group play</span><strong>{locked?"LOCKED":"OWNER TEST · MANUAL LOCK"}</strong></div>
      </section>
      {loading?<p role="status">Loading NBA Cup picks…</p>:null}
      {error?<p role="alert" className="nba-hq-error">{error}</p>:null}
      {picks?<><div className="nba-cup__tabs" role="group" aria-label="Conference">
        {(["East","West"] as const).map(conf=><button key={conf} type="button" aria-pressed={conference===conf} className={conference===conf?"is-active":""} onClick={()=>setConference(conf)}>
          {conf.toUpperCase()} · {CUP_GROUPS.filter(g=>g.conference===conf&&picks[g.id]).length}/3
        </button>)}
      </div>
      {CUP_GROUPS.filter(g=>g.conference===conference).map(group=><section className="nba-cup__group" key={group.id} aria-label={group.name}>
        <header><h2>{group.name}</h2><small>{picks[group.id]?"PICKED":"5 POINTS"}</small></header>
        <div className="nba-cup__teams">{group.teams.map(id=>{
          const team=NBA_TEAM_BY_ID.get(id);
          if(!team)return null;
          const chosen=picks[group.id]===id;
          return <button key={id} type="button" disabled={locked||saving} aria-pressed={chosen}
            className={"nba-cup__team"+(chosen?" is-selected":"")}
            style={{borderLeftColor:nbaTeamColor(id)}} onClick={()=>{setPicks(x=>({...x,[group.id]:id}));setNotice("");}}>
            <NbaTeamMark team={team}/><span>{team.name}</span><b aria-hidden="true">{chosen?"✓":"○"}</b>
          </button>;
        })}</div>
      </section>)}
      <section className="nba-cup__save">
        <div><strong>{count===6?"ALL SIX GROUPS PICKED":(6-count)+" PICKS REMAIN"}</strong>
          <small>{dirty?"Unsaved changes":"Your saved selections"}</small></div>
        <button type="button" className="primary-action" disabled={!dirty||locked||saving} onClick={()=>void save()}>
          {locked?"PICKS LOCKED":saving?"SAVING…":"SAVE MY PICKS"}
        </button>
      </section>
      {notice?<p role="status" className="nba-cup__notice">{notice}</p>:null}
      <section className="nba-cup__next">
        <small>COMING IN DECEMBER</small><h2>Knockout Bracket</h2>
        <p>When the eight teams qualify, pick four quarterfinal winners, two semifinal winners and the eventual Cup champion.</p>
        <div className="nba-cup__points">{Object.entries(CUP_POINTS).map(([key,value])=><span key={key}>{key==="groups"?"Groups":key==="quarterfinals"?"Quarterfinals":key==="semifinals"?"Semifinals":"Champion"}<b>{value}</b></span>)}</div>
        <small>Owner test only. No official standings or championship scoring yet.</small>
      </section>
      </>:null}
    </main>
  </div>;
}