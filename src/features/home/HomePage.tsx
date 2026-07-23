import { Link } from "react-router-dom";

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
          <span className="status-pill">V2</span>
        </div>

        <div className="hq-card__grid">
          {hqStats.map((stat) => (
            <div className="stat-tile" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <Link className="primary-action" to="/rankings">
          Explore the rankings
        </Link>
      </section>

      <section className="surface-card build-card">
        <p className="eyebrow">FOUNDATION ACTIVE</p>
        <h2>Built to stay fast</h2>
        <p>Each destination now loads independently. War Room remains completely invisible unless access is granted.</p>
      </section>
    </div>
  );
}
