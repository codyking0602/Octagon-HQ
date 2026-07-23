import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FighterPhoto } from "./FighterPhoto";
import { menAllTime, womenAllTime } from "./rankingModel";

const boards = {
  men: { label: "Overall", fighters: menAllTime },
  women: { label: "Women", fighters: womenAllTime },
} as const;

type BoardKey = keyof typeof boards;

export default function RankingsPage() {
  const [board, setBoard] = useState<BoardKey>("men");
  const [query, setQuery] = useState("");
  const selected = boards[board];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return selected.fighters;
    return selected.fighters.filter((fighter) =>
      `${fighter.name} ${fighter.division}`.toLowerCase().includes(normalized),
    );
  }, [query, selected]);
  const averageOvr = Math.round(
    selected.fighters.reduce((sum, fighter) => sum + fighter.ovr, 0) /
      selected.fighters.length,
  );

  return (
    <div className="page rankings-page">
      <section className="page-heading rankings-heading">
        <p className="eyebrow">UFC ALL-TIME</p>
        <h1>Greatest UFC fighters</h1>
        <p>All 80 fighters are recalculated from the complete UFC-only facts model.</p>
      </section>

      <div className="ranking-board-tabs" role="group" aria-label="Ranking board">
        {(Object.keys(boards) as BoardKey[]).map((key) => (
          <button
            className={board === key ? "is-active" : ""}
            key={key}
            type="button"
            aria-pressed={board === key}
            onClick={() => {
              setBoard(key);
              setQuery("");
            }}
          >
            {boards[key].label}
            <span>{boards[key].fighters.length}</span>
          </button>
        ))}
      </div>

      <section className="ranking-kpis" aria-label={`${selected.label} ranking summary`}>
        <div><strong>{selected.fighters.length}</strong><span>Fighters</span></div>
        <div><strong>{selected.fighters[0].name}</strong><span>Current #1</span></div>
        <div><strong>{averageOvr}</strong><span>Average OVR</span></div>
      </section>

      <label className="ranking-search">
        <span className="sr-only">Search {selected.label} rankings</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="search"
          placeholder="Search fighter or division"
        />
      </label>

      <section className="ranking-list" aria-label={`${selected.label} UFC all-time rankings`}>
        {filtered.map((fighter) => (
          <Link className="ranking-row" to={`/fighters/${fighter.slug}`} key={fighter.slug}>
            <span className="ranking-row__rank">{fighter.rank}</span>
            <FighterPhoto name={fighter.name} src={fighter.thumbUrl} className="ranking-row__photo" />
            <span className="ranking-row__identity">
              <strong>{fighter.name}</strong>
              <span>{fighter.visibleStats.ufcRecord} UFC · {fighter.division}</span>
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
