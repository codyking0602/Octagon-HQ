import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FighterPhoto } from "./FighterPhoto";
import { menAllTime, womenAllTime } from "./rankingModel";
import { watchMomentFor } from "./rankingPresentation";
import "./RankingsPage.css";

const boards = {
  men: {
    label: "P4P",
    title: "UFC All-Time P4P",
    description: "The definitive pound-for-pound rankings.",
    fighters: menAllTime,
  },
  women: {
    label: "Women",
    title: "UFC Women's All-Time",
    description: "The definitive women's rankings.",
    fighters: womenAllTime,
  },
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
  const countLabel =
    filtered.length === selected.fighters.length
      ? "fighters"
      : `of ${selected.fighters.length} fighters`;

  return (
    <div className="page rankings-page rankings-presentation">
      <section className="rankings-intro">
        <div className="rankings-intro__copy">
          <p className="eyebrow">Rankings</p>
          <h1>{selected.title}</h1>
          <p>{selected.description}</p>
        </div>

        <label className="ranking-board-select">
          <span className="sr-only">Ranking board</span>
          <select
            aria-label="Ranking board"
            value={board}
            onChange={(event) => {
              setBoard(event.target.value as BoardKey);
              setQuery("");
            }}
          >
            {(Object.keys(boards) as BoardKey[]).map((key) => (
              <option value={key} key={key}>{boards[key].label}</option>
            ))}
          </select>
          <span className="ranking-board-select__chevron" aria-hidden="true">⌄</span>
        </label>
      </section>

      <div className="ranking-toolbar" aria-label={`${selected.label} ranking summary`}>
        <span className="ranking-count">
          <strong>{filtered.length}</strong>
          <span>{countLabel}</span>
        </span>
      </div>

      <label className="ranking-search">
        <span className="sr-only">Search {selected.label} rankings</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="search"
          placeholder="Search fighters"
        />
      </label>

      <section className="ranking-list" aria-label={`${selected.label} UFC all-time rankings`}>
        {filtered.map((fighter) => (
          <article className="ranking-row" data-rank={fighter.rank} key={fighter.slug}>
            <Link
              className="ranking-row__profile"
              to={`/fighters/${fighter.slug}`}
              aria-label={`View ${fighter.name} profile`}
            >
              <span className="ranking-row__rank">{fighter.rank}</span>
              <FighterPhoto
                name={fighter.name}
                src={fighter.thumbUrl}
                className="ranking-row__photo"
              />
              <span className="ranking-row__identity">
                <strong>{fighter.name}</strong>
                <span>{fighter.visibleStats.ufcRecord} · {fighter.division}</span>
              </span>
              <span className="ranking-row__ovr">
                <strong>{fighter.ovr}</strong>
                <span>OVR</span>
              </span>
              <span className="ranking-row__profile-chevron" aria-hidden="true">›</span>
            </Link>
            <a
              className="ranking-row__watch"
              href={watchMomentFor(fighter.slug)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch ${fighter.name} moment on YouTube`}
              title={`Watch ${fighter.name} moment`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 7.6v8.8L16 12 9 7.6Z" />
              </svg>
            </a>
          </article>
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
