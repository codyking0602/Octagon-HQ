import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { canAccessNbaWhoAmIPreview } from "./NbaWhoAmIPreviewGate";
import "../../styles/nba-hq.css";
export default function NbaPlayPage(){
  const { profile } = useIdentity();
  return <div className="page nba-hq-page" data-sport="nba">
    <header className="nba-hq-hero"><p className="eyebrow">BASKETBALL HQ</p><h1>Basketball Games</h1>
      <p>Games join the lineup after the World Series. NBA Futures are open now.</p></header>
    <section className="surface-card nba-hq-notice">
      <h2>First up: NBA Futures</h2><p>Make your 30 over/under picks and the rest of your season predictions.</p>
      <Link className="primary-action" to="/nba/picks">OPEN NBA FUTURES →</Link>
    </section>
    {canAccessNbaWhoAmIPreview(profile) ? (
      <section className="surface-card nba-hq-notice" data-testid="nba-who-am-i-preview">
        <p className="eyebrow">OWNER PREVIEW · CONTENT CALIBRATION</p>
        <h2>NBA Who Am I?</h2>
        <p>Shared UFC / Football game, NBA branding, and two source-backed clue scripts per starter player. Not open to the public.</p>
        <Link className="primary-action" to="/nba/who-am-i">TEST NBA WHO AM I →</Link>
      </section>
    ) : null}
  </div>;
}
