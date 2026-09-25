import { Link } from "react-router-dom";
import "../../styles/mlb-playoffs.css";

export default function MlbPlayoffsPage() {
  return (
    <div className="page mlb-play-page">
      <section className="page-heading mlb-play-page__heading">
        <p className="eyebrow">MLB PLAYOFFS · PLAY</p>
        <h1>Featured Challenge</h1>
        <p>One handcrafted postseason game at a time.</p>
      </section>

      <section className="surface-card mlb-play-feature">
        <div className="mlb-play-feature__topline">
          <span>FIND THE LEADER</span>
          <small>OWNER DESIGN DEMO</small>
        </div>
        <div className="mlb-play-feature__body">
          <div>
            <p className="eyebrow">FEATURED CHALLENGE</p>
            <h2>Find the Leader</h2>
            <p>Same game loop and presentation as Football, rebuilt with a disposable MLB board.</p>
          </div>
          <div className="mlb-play-feature__meta">
            <span><b>10</b><small>PLAYERS</small></span>
            <span><b>1</b><small>LEADER</small></span>
          </div>
        </div>
        <Link className="primary-action" to="/mlb/challenge">PLAY DEMO →</Link>
      </section>
    </div>
  );
}
