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
      <section className="surface-card nba-hq-notice" aria-label="NBA Find the Leader owner preview">
        <p className="eyebrow">OWNER PREVIEW · NOT PUBLIC</p>
        <h2>NBA Find the Leader</h2>
        <p>Eliminate nine players to find the leader. NBA legends, eras and season averages.</p>
        <div className="nba-find-preview-actions">
          <Link className="primary-action" to="/nba/find-the-leader">PLAY CASUAL →</Link>
          <Link className="secondary-action" to="/nba/find-the-leader?mode=daily">DAILY PREVIEW →</Link>
        </div>
      </section>
    ) : null}
    {canPreviewNbaWhoAmI(identity.profile) ? (
      <section className="surface-card nba-hq-notice" aria-label="NBA Higher or Lower owner preview">
        <p className="eyebrow">OWNER PREVIEW · NOT PUBLIC</p>
        <h2>NBA Higher or Lower</h2>
        <p>Ten fresh NBA comparisons — scoring averages, threes, All-Stars, All-NBA and draft.</p>
        <div className="nba-find-preview-actions">
          <Link className="primary-action" to="/nba/higher-lower">PLAY CASUAL →</Link>
          <Link className="secondary-action" to="/nba/higher-lower?mode=daily">DAILY PREVIEW →</Link>
        </div>
      </section>
    ) : null}
    {canPreviewNbaWhoAmI(identity.profile) ? (
      <section className="surface-card nba-hq-notice" aria-label="NBA Millionaire owner preview">
        <p className="eyebrow">OWNER PREVIEW · NOT PUBLIC</p>
        <h2>NBA Millionaire</h2>
        <p>Eight questions, three lifelines, the $1 million ladder and 240 source-backed questions. Same game as Football.</p>
        <div className="nba-find-preview-actions">
          <Link className="primary-action" to="/nba/millionaire">PLAY CASUAL →</Link>
          <Link className="secondary-action" to="/nba/millionaire?mode=daily">DAILY PREVIEW →</Link>
        </div>
      </section>
    ) : null}
    {canPreviewNbaWhoAmI(identity.profile) ? (
      <section className="surface-card nba-hq-notice" aria-label="NBA Sports Feud owner preview">
        <p className="eyebrow">OWNER PREVIEW · NOT PUBLIC</p>
        <h2>NBA Sports Feud</h2>
        <p>Two four-answer rounds, three strikes each, then five Fast Money prompts in 50 seconds. Curated NBA boards with editorial HQ points — not survey results.</p>
        <Link className="primary-action" to="/nba/sports-feud?mode=daily">DAILY PREVIEW →</Link>
      </section>
    ) : null}
    {canPreviewNbaWhoAmI(identity.profile) ? (
      <section className="surface-card nba-hq-notice" aria-label="NBA Average Fan owner preview">
        <p className="eyebrow">OWNER PREVIEW · NOT PUBLIC</p>
        <h2>NBA Average Fan</h2>
        <p>Eight classroom questions, five fans, three lifelines and a Final — basketball trivia built for regular fans.</p>
        <div className="nba-find-preview-actions">
          <Link className="primary-action" to="/nba/average-fan">PLAY CASUAL →</Link>
          <Link className="secondary-action" to="/nba/average-fan?mode=daily">DAILY PREVIEW →</Link>
        </div>
      </section>
    ) : null}
    {canPreviewNbaWhoAmI(identity.profile) ? (
      <section className="surface-card nba-hq-notice" aria-label="NBA Bar Trivia owner Daily preview">
        <p className="eyebrow">OWNER PREVIEW · NOT PUBLIC · DAILY ONLY</p>
        <h2>NBA Bar Trivia</h2>
        <p>Ten NBA questions, three escalating rounds and Last Call. Preview play never writes official Daily scores.</p>
        <Link className="primary-action" to="/nba/bar-trivia?mode=daily">TEST NBA BAR TRIVIA →</Link>
      </section>
    ) : null}
    {canPreviewNbaWhoAmI(identity.profile) ? (
      <section className="surface-card nba-hq-notice" aria-label="NBA Wavelength owner preview">
        <p className="eyebrow">OWNER PREVIEW · NOT PUBLIC</p>
        <h2>NBA Wavelength</h2>
        <p>Find two hidden numbers with four adaptive basketball clues each. Only final guesses score. Unranked Daily preview.</p>
        <div className="nba-find-preview-actions">
          <Link className="primary-action" to="/nba/wavelength">PLAY CASUAL →</Link>
          <Link className="secondary-action" to="/nba/wavelength?mode=daily">DAILY PREVIEW →</Link>
        </div>
      </section>
    ) : null}
    <section className="surface-card nba-hq-notice">
      <h2>First up: NBA Futures</h2><p>Make your 30 over/under picks and the rest of your season predictions.</p>
      <Link className="primary-action" to="/nba/picks">OPEN NBA FUTURES →</Link>
    </section>
  </div>;
}
