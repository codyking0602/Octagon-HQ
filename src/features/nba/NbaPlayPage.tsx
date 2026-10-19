import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { canPreviewNbaWhoAmI } from "./NbaWhoAmIOwnerGate";
import "../../styles/nba-hq.css";
export default function NbaPlayPage(){
  const identity = useIdentity();
  return <div className="page nba-hq-page" data-sport="nba">
    <header className="nba-hq-hero"><p className="eyebrow">BASKETBALL HQ</p><h1>Basketball Games</h1>
      <p>Games join the lineup after the World Series. NBA Futures are open now.</p></header>
    {canPreviewNbaWhoAmI(identity.profile) ? (
      <section className="surface-card nba-hq-notice" aria-label="Owner NBA Who Am I calibration preview">
        <p className="eyebrow">OWNER PREVIEW · NOT PUBLIC</p>
        <h2>NBA Who Am I?</h2>
        <p>Play the complete authored NBA clue bank before the games launch.</p>
        <Link className="primary-action" to="/nba/who-am-i">PLAY NBA WHO AM I →</Link>
      </section>
    ) : null}
    {canPreviewNbaWhoAmI(identity.profile) ? (
      <section className="surface-card nba-hq-notice" aria-label="Owner NBA Hit the Number preview">
        <p className="eyebrow">OWNER PREVIEW · NOT PUBLIC</p>
        <h2>NBA Hit the Number</h2>
        <p>The Football game layout and scoring, with NBA per-game stats, four/five picks and curated pools.</p>
        <Link className="primary-action" to="/nba/hit-the-number">PLAY NBA HIT THE NUMBER →</Link>
      </section>
    ) : null}
    {canPreviewNbaWhoAmI(identity.profile) ? (
      <section className="surface-card nba-hq-notice" aria-label="Owner NBA Find the Leader preview">
        <p className="eyebrow">OWNER PREVIEW · NOT PUBLIC</p>
        <h2>NBA Find the Leader</h2>
        <p>Eliminate nine NBA decoys with career and season per-game statistics. Football gameplay, NBA headshots.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          <Link className="primary-action" to="/nba/find-leader">PLAY CASUAL →</Link>
          <Link className="secondary-action" to="/nba/find-leader/daily-preview">DAILY PREVIEW →</Link>
        </div>
      </section>
    ) : null}
    <section className="surface-card nba-hq-notice">
      <h2>First up: NBA Futures</h2><p>Make your 30 over/under picks and the rest of your season predictions.</p>
      <Link className="primary-action" to="/nba/picks">OPEN NBA FUTURES →</Link>
    </section>
  </div>;
}
