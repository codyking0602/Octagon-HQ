import { Link } from "react-router-dom";
import "../../styles/home-challenges.css";
import "../../styles/mlb-playoffs.css";

export default function MlbPlayoffsPage() {
  return (
    <div className="page mlb-play-page">
      <section className="play-landing-heading mlb-play-page__heading">
        <h1>Play</h1>
        <p>Postseason challenges.</p>
      </section>

      <Link
        className="home-challenge-card mlb-play-challenge-card"
        data-sport="mlb"
        to="/mlb/challenge"
        aria-label="Open MLB Find the Leader challenge"
      >
        <div className="home-challenge-card__copy">
          <div className="home-challenge-card__topline">
            <span>MLB PLAYOFF CHALLENGE</span>
            <small>READY</small>
          </div>
          <h3>Find the Leader</h3>
          <p>Two boards. One final score.</p>
        </div>
        <div className="home-challenge-card__result">
          <strong>PLAY NOW</strong>
          <span>OPEN <b aria-hidden="true">→</b></span>
        </div>
      </Link>
    </div>
  );
}
