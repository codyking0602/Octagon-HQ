import {useEffect,useRef,useState,type CSSProperties} from "react";
import {Navigate} from "react-router-dom";
import {useIdentity} from "../identity/IdentityProvider";
import {NBA_TEAM_BY_ID} from "./nbaFutures";
import {NbaTeamMark,nbaTeamColor} from "./nbaTeamBranding";
import {CUP_GROUPS,cupPickCount,type CupGroupPicks} from "./nbaCup2026";
import {loadCupPreview,saveCupPreview} from "./nbaCupRepository";
import "../../styles/nba-hq.css";
import "./nbaCup2026.css";

const serializePicks=(value:CupGroupPicks)=>JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b))));

/** Cup group picks live directly within Basketball Picks; the old /nba/cup URL redirects. */
export function NbaCupGroups(){
  const {profile}=useIdentity();
  const [conference,setConference]=useState<"East"|"West">("East");
  const [picks,setPicks]=useState<CupGroupPicks|null>(null);
  const [saved,setSaved]=useState("{}");
  const [locked,setLocked]=useState(false);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [saveVisible,setSaveVisible]=useState(true);
  const tabsRef=useRef<HTMLDivElement>(null);
  const saveRef=useRef<HTMLDivElement>(null);
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
  useEffect(()=>{
    const target=saveRef.current;
    if(!target||typeof IntersectionObserver==="undefined")return;
    const observer=new IntersectionObserver(entries=>setSaveVisible(entries[0]?.isIntersecting??false),{
      rootMargin:"0px 0px -105px 0px",threshold:0.1,
    });
    observer.observe(target);
    return()=>observer.disconnect();
  },[loading,dirtySaveTarget]);
  const dirtySaveTarget=picks!==null&&serializePicks(picks)!==saved;
  const count=cupPickCount(picks??{});
  const dirty=picks!==null&&serializePicks(picks)!==saved;
  const complete=count===6&&!dirty;
  async function save(){
    if(!picks||locked||saving||!dirty)return;
    setSaving(true);setError("");setNotice("");
    try{
      const response=await saveCupPreview(picks);
      setPicks(response.picks);setSaved(serializePicks(response.picks));setLocked(response.locked);
      setNotice("Picks saved.");
    }catch(err){setError(err instanceof Error?err.message:"Unable to save picks.");}
    finally{setSaving(false);}
  }
  function switchConference(next:"East"|"West",scroll=false){
    setConference(next);
    if(scroll)tabsRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
  }
  return <section className="nba-cup" data-testid="nba-cup-picks" aria-label="NBA Cup 2026 group picks">
    <div className="nba-cup__main">
      <section className="nba-cup__summary" aria-label="NBA Cup group-pick progress">
        <h1>NBA Cup 2026</h1>
        <div className="nba-cup__summary-title"><strong>GROUP WINNERS</strong><span>OCT 30 – NOV 27</span></div>
        <p>Six group winners. December knockout bracket coming next.</p>
        <div className="nba-cup__progress-line">
          <div className="nba-cup__progress" role="progressbar" aria-label="Groups picked" aria-valuenow={count} aria-valuemin={0} aria-valuemax={6}><span style={{width:(count/6*100)+"%"}} /></div>
          <strong>{count}/6 {dirty?"SELECTED · UNSAVED":complete?"PICKS SAVED ✓":locked?"LOCKED":"PICKED"}</strong>
        </div>
      </section>
      {loading?<p role="status">Loading NBA Cup picks…</p>:null}
      {error?<p role="alert" className="nba-hq-error">{error}</p>:null}
      {picks?<><div className="nba-cup__tabs" ref={tabsRef} role="group" aria-label="Conference">
        {(["East","West"] as const).map(conf=><button key={conf} type="button" aria-pressed={conference===conf} className={conference===conf?"is-active":""} onClick={()=>switchConference(conf)}>
          {conf.toUpperCase()} · {CUP_GROUPS.filter(g=>g.conference===conf&&picks[g.id]).length}/3
        </button>)}
      </div>
      {CUP_GROUPS.filter(g=>g.conference===conference).map(group=><section className="nba-cup__group" key={group.id} aria-label={group.name}>
        <header><h2>{group.name}</h2>{picks[group.id]?<small>✓ PICKED</small>:null}</header>
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
      {dirty&&!locked?<section className="nba-cup__save" ref={saveRef}>
        <div><strong>{count===6?"ALL SIX GROUPS SELECTED":(6-count)+" PICKS REMAIN"}</strong><small>Unsaved changes</small></div>
        <button type="button" className="primary-action" disabled={saving} onClick={()=>void save()}>
          {saving?"SAVING…":"SAVE PICKS"}
        </button>
      </section>:null}
      <span className="sr-only" role="status" aria-live="polite">{notice}</span>
      {dirty&&!locked&&!saveVisible?<div className="nba-cup__floating-save" role="region" aria-label="Unsaved NBA Cup picks">
        <span>{count}/6 SELECTED</span><button type="button" disabled={saving} onClick={()=>void save()}>{saving?"SAVING…":"SAVE PICKS"}</button>
      </div>:null}
      </>:null}
    </div>
  </section>;
}

/** Legacy deep links go to the single Basketball Picks screen, with the same server-side Cup gate. */
export default function NbaCup2026Page(){return <Navigate to="/nba/picks" replace/>;}
