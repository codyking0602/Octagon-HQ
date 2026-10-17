import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { NBA_FUTURES_SELECTIONS,emptyNbaFutures,nbaFuturesProgress } from "./nbaFutures";
import { loadNbaFutures } from "./nbaFuturesRepository";
import "../../styles/nba-hq.css";

export function NbaHomeHq({signedIn}:{signedIn:boolean}) {
  const [count,setCount]=useState<number|null>(null);
  const [locked,setLocked]=useState(false);
  useEffect(()=>{
    let mounted=true;
    if(!signedIn){setCount(null);return()=>{mounted=false}};
    void loadNbaFutures().then(s=>{
      if(!mounted)return;
      setCount(s.own?nbaFuturesProgress({...emptyNbaFutures(),...s.own}):0);
      setLocked(s.locked);
    }).catch(()=>{if(mounted)setCount(null)});
    return()=>{mounted=false};
  },[signedIn]);
  return <section className="home-section nba-home-hq" data-home-section="nba-hq" aria-label="Basketball HQ">
    <header className="nba-home-hq-heading"><div><p className="eyebrow">BASKETBALL HQ</p><h2>2026–27 NBA Season</h2></div><span>🏀</span></header>
    <Link className="nba-home-futures" to="/nba/picks" aria-label="Open NBA Futures">
      <div className="nba-home-futures-top"><span>NBA FUTURES</span><b>{locked?"LOCKED":"OPEN NOW"}</b></div>
      <strong>Predict the season</strong>
      <small>30 team win totals · Playoffs · Awards · Champion</small>
      <div className="nba-home-futures-bottom"><span>{count===null?"100 POSSIBLE POINTS":count+" / "+NBA_FUTURES_SELECTIONS+" PICKS"}</span><b>OPEN FUTURES →</b></div>
    </Link>
    <Link className="nba-home-championship" to="/championship/nba">
      <strong>Basketball Championship</strong><small>Futures 15% · Cup 10% · Playoffs 55% · Games 20%</small><span aria-hidden="true">↗</span>
    </Link>
  </section>;
}
