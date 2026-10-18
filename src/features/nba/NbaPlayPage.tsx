import { Link } from "react-router-dom";
import "../../styles/nba-hq.css";
export default function NbaPlayPage(){
  return <div className="page nba-hq-page" data-sport="nba">
    <header className="nba-hq-hero"><p className="eyebrow">BASKETBALL HQ</p><h1>Basketball Games</h1>
      <p>Games join the lineup after the World Series. NBA Futures are open now.</p></header>
    <section className="surface-card nba-hq-notice">
      <h2>First up: NBA Futures</h2><p>Make your 30 over/under picks and the rest of your season predictions.</p>
      <Link className="primary-action" to="/nba/picks">OPEN NBA FUTURES →</Link>
    </section>
  </div>;
}
