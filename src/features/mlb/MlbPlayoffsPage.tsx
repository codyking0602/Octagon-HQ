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
          <span>WHO AM I</span>
          <small>POSTSEASON EDITION</small>
        </div>
        <div className="mlb-play-feature__body">
          <div>
            <p className="eyebrow">FEATURED CHALLENGE</p>
            <h2>October Legend</h2>
            <p>Four clues. One postseason icon.</p>
          </div>
          <div className="mlb-play-feature__meta">
            <span><b>4</b><small>CLUES</small></span>
            <span><b>1</b><small>ANSWER</small></span>
          </div>
        </div>
        <Link className="primary-action" to="/mlb/challenge">PLAY CHALLENGE →</Link>
      </section>
    </div>
  );
}
