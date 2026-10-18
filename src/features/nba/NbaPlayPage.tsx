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
        <p>Review the first authored NBA player batch before the games launch.</p>
        <Link className="primary-action" to="/nba/who-am-i">PLAY NBA WHO AM I →</Link>
      </section>
    ) : null}
    <section className="surface-card nba-hq-notice">
      <h2>First up: NBA Futures</h2><p>Make your 30 over/under picks and the rest of your season predictions.</p>
      <Link className="primary-action" to="/nba/picks">OPEN NBA FUTURES →</Link>
    </section>
  </div>;
}
