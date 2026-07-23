import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FighterPhoto } from "./FighterPhoto";
import { menAllTime } from "./rankingData";

export default function RankingsPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return menAllTime;
    return menAllTime.filter((fighter) =>
      `${fighter.name} ${fighter.division}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <div className="page rankings-page">
      <section className="page-heading rankings-heading">
        <p className="eyebrow">UFC ALL-TIME</p>
        <h1>Greatest UFC fighters</h1>
        <p>UFC-only résumé rankings built for serious debate and quick comparison.</p>
      </section>

      <label className="ranking-search">
        <span className="sr-only">Search rankings</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="search"
          placeholder="Search fighter or division"
        />
      </label>

      <section className="ranking-list" aria-label="UFC all-time rankings">
        {filtered.map((fighter) => (
          <Link className="ranking-row" to={`/fighters/${fighter.slug}`} key={fighter.slug}>
            <span className="ranking-row__rank">{fighter.rank}</span>
            <FighterPhoto name={fighter.name} src={fighter.thumbUrl} className="ranking-row__photo" />
            <span className="ranking-row__identity">
              <strong>{fighter.name}</strong>
              <span>{fighter.division}</span>
            </span>
            <span className="ranking-row__ovr">
              <strong>{fighter.ovr}</strong>
              <span>OVR</span>
            </span>
            <span className="ranking-row__chevron" aria-hidden="true">›</span>
          </Link>
        ))}
      </section>

      {filtered.length === 0 ? (
        <section className="surface-card empty-state">
          <h2>No fighter found</h2>
          <p>Try a different name or division.</p>
        </section>
      ) : null}
    </div>
  );
}
