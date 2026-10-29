import "./nbaCup2026.css";

/** Single, non-interactive tournament header for the Basketball Picks page. */
export function NbaCupHero(){
  return <header className="nba-cup-hero">
    <p className="nba-cup-hero__eyebrow">BASKETBALL HQ · 2026–27</p>
    <h1>NBA Cup 2026</h1>
    <p className="nba-cup-hero__description">Six group winners. One December knockout bracket.</p>
    <div className="nba-cup-hero__bottom"><span>GROUPS 30 PTS · KNOCKOUT 70 PTS</span></div>
  </header>;
}
