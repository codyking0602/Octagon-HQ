import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { NBA_CHAMPIONSHIP_WEIGHTS,NBA_FUTURES_SELECTIONS,
  emptyNbaFutures,nbaFuturesProgress } from "./nbaFutures";
import { loadNbaFutures,type NbaFuturesSnapshot } from "./nbaFuturesRepository";
import "../../styles/nba-hq.css";
export default function NbaChampionshipPage(){
  const identity=useIdentity();
  const [data,setData]=useState<NbaFuturesSnapshot|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{
    let alive=true;
    if(!identity.profile?.id)return;
    void loadNbaFutures().then(d=>{if(alive)setData(d)})
      .catch(e=>{if(alive)setError(e instanceof Error?e.message:"Standings unavailable")});
    return()=>{alive=false};
  },[identity.profile?.id]);
  return <div className="page nba-hq-page" data-sport="nba">
    <header className="nba-hq-hero"><p className="eyebrow">BASKETBALL HQ · 2026–27</p>
      <h1>Basketball Championship</h1><p>One season champion. Futures launch first; NBA Cup Picks, Playoff Picks, and games join later.</p>
    </header>
    <section className="surface-card nba-hq-championship">
      <h2>Season scoring</h2><div className="nba-hq-weightline">
        {Object.entries(NBA_CHAMPIONSHIP_WEIGHTS).map(([key,value])=><span key={key}>{key.toUpperCase()} {value}%</span>)}
      </div><p>Official championship standings will appear as results settle. Predictions alone do not award championship points or a provisional champion.</p>
      {data?<><strong>{data.participants} Futures {data.participants===1?"entry":"entries"}</strong>
        <p>{data.own?"Your Futures card: "+nbaFuturesProgress({...emptyNbaFutures(),...data.own})+"/"+NBA_FUTURES_SELECTIONS+" selections.":"Your Futures entry is not started."}</p>
        {data.locked&&data.entries.length?<div className="nba-hq-entrants">
          <h3>Futures participants</h3>
          {data.entries.map(e=><div key={e.profile_id}><span>{e.display_name}</span>
            <small>{e.complete?"COMPLETE":"PARTIAL"} · SCORE PENDING</small></div>)}
        </div>:null}
      </>:error?<p role="alert">{error}</p>:<p>{identity.profile?.id?"Loading entries…":"Sign in to view your entry."}</p>}
      <Link className="primary-action" to="/nba/picks">VIEW NBA FUTURES →</Link>
    </section>
  </div>;
}
