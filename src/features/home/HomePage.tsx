import { Link } from "react-router-dom";
import { FighterPhoto } from "../rankings/FighterPhoto";
import { menAllTime } from "../rankings/rankingModel";

const hqStats = [
  { label: "Daily streak", value: "—" },
  { label: "Picks record", value: "—" },
  { label: "Favorite fighter", value: "Set yours" },
  { label: "Open challenges", value: "0" },
] as const;

export default function HomePage() {
  return (
    <div className="page home-page">
      <section className="page-heading">
        <p className="eyebrow">YOUR UFC HOME</p>
        <h1>Welcome to Octagon HQ</h1>
        <p>Rank fighters. Make picks. Challenge friends. Settle UFC debates.</p>
      </section>

      <section className="surface-card hq-card" aria-labelledby="your-hq-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PERSONALIZED</p>
            <h2 id="your-hq-title">Your HQ</h2>
          </div>
        </div>

        <div className="hq-card__grid">
          {hqStats.map((stat) => (
            <div className="stat-tile" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <Link className="primary-action" to="/rankings">Explore the rankings</Link>
      </section>

      <section className="surface-card board-preview" aria-labelledby="board-preview-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TOP OF THE BOARD</p>
            <h2 id="board-preview-title">UFC all-time</h2>
          </div>
          <Link className="text-link" to="/rankings">View all 80</Link>
        </div>
        <div className="board-preview__list">
          {menAllTime.slice(0, 3).map((fighter) => (
            <Link className="board-preview__row" to={`/fighters/${fighter.slug}`} key={fighter.slug}>
              <span className="board-preview__rank">{fighter.rank}</span>
              <FighterPhoto name={fighter.name} src={fighter.thumbUrl} />
              <span><strong>{fighter.name}</strong><small>{fighter.visibleStats.ufcRecord} UFC · {fighter.division}</small></span>
              <b>{fighter.ovr}</b>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
