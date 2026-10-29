import {Link} from "react-router-dom";
import "./nbaCup2026.css";

/** Shared event artwork on Basketball Picks and the Cup group-picks screen. */
export function NbaCupHero({linked=false}:{linked?:boolean}){
  const contents=<>
    <p className="nba-cup-hero__eyebrow">BASKETBALL HQ · 2026–27</p>
    <h1>NBA Cup 2026</h1>
    <p className="nba-cup-hero__description">Six group winners. One December knockout bracket.</p>
    <div className="nba-cup-hero__bottom">
      <span>GROUPS 30 PTS · KNOCKOUT 70 PTS</span>
      {linked?<strong>MAKE CUP PICKS <span aria-hidden="true">→</span></strong>:null}
    </div>
  </>;
  return linked
    ? <Link className="nba-cup-hero nba-cup-hero--linked" to="/nba/cup" aria-label="NBA Cup 2026: make group picks">{contents}</Link>
    : <header className="nba-cup-hero">{contents}</header>;
}
