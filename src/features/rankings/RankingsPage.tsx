import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FighterPhoto } from "./FighterPhoto";
import {
  DIVISION_RESUME_SHARE_MIN,
  categoryBoard,
  divisionLabel,
  divisionOrder,
  erasForBoard,
  fighterBelongsToEra,
  qualifiedDivisionBoard,
  rankingCategoryOptions,
  rankingViewOptions,
  type CategoryGender,
  type RankingCategory,
  type RankingDivision,
  type RankingView,
} from "./rankingControls";
import { menAllTime, womenAllTime, type RankingFighter } from "./rankingModel";
import { watchMomentFor } from "./rankingPresentation";
import "./RankingsPage.css";
import "./RankingsControls.css";

interface PresentedRankingRow {
  fighter: RankingFighter;
  displayRank: number;
  meta: string;
  score: string | number;
  scoreLabel: "OVR" | "DIV";
}

function validView(value: string | null): RankingView {
  return rankingViewOptions.some((option) => option.value === value)
    ? (value as RankingView)
    : "p4p";
}

function validCategory(value: string | null): RankingCategory {
  return rankingCategoryOptions.some((option) => option.value === value)
    ? (value as RankingCategory)
    : "championship";
}

function validDivision(value: string | null): RankingDivision {
  return divisionOrder.includes(value as RankingDivision)
    ? (value as RankingDivision)
    : divisionOrder[0];
}

function validGender(value: string | null): CategoryGender {
  return value === "women" ? "women" : "men";
}

export default function RankingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const view = validView(searchParams.get("view"));
  const selectedDivision = validDivision(searchParams.get("division"));
  const selectedCategory = validCategory(searchParams.get("category"));
  const categoryGender = validGender(searchParams.get("gender"));
  const eraBoard: CategoryGender = view === "women" ? "women" : "men";
  const eraOptions = erasForBoard(eraBoard);
  const requestedEra = searchParams.get("era");
  const selectedEra = eraOptions.some((era) => era.id === requestedEra) ? requestedEra : null;
  const categoryCopy = rankingCategoryOptions.find(
    (category) => category.value === selectedCategory,
  )!;

  const heading = useMemo(() => {
    if (view === "women") {
      return {
        title: "UFC Women's All-Time",
        description: "The definitive women's rankings.",
        summaryLabel: "Women ranking summary",
      };
    }
    if (view === "division") {
      return {
        title: `${divisionLabel(selectedDivision)} Rankings`,
        description: "UFC-only divisional resume, allocated from the same calculated GOAT model.",
        summaryLabel: `${divisionLabel(selectedDivision)} ranking summary`,
      };
    }
    if (view === "category") {
      return {
        title: `${categoryCopy.label} Leaders`,
        description: categoryCopy.description,
        summaryLabel: `${categoryCopy.label} ranking summary`,
      };
    }
    return {
      title: "UFC All-Time P4P",
      description: "The definitive pound-for-pound rankings.",
      summaryLabel: "P4P ranking summary",
    };
  }, [categoryCopy, selectedDivision, view]);

  const unsearchedRows = useMemo<PresentedRankingRow[]>(() => {
    if (view === "division") {
      return qualifiedDivisionBoard(selectedDivision).map((row) => ({
        fighter: row.fighter,
        displayRank: row.rank,
        meta: `${row.stats.ufcRecord} · ${Math.round(row.resumeSharePct)}% resume · Overall #${row.fighter.rank}`,
        score: row.divisionScore.toFixed(1),
        scoreLabel: "DIV",
      }));
    }

    if (view === "category") {
      return categoryBoard(categoryGender, selectedCategory).map((fighter, index) => ({
        fighter,
        displayRank: index + 1,
        meta: `Overall #${fighter.rank} · ${fighter.visibleStats.ufcRecord} · ${fighter.division}`,
        score: fighter.ovr,
        scoreLabel: "OVR",
      }));
    }

    const board = view === "women" ? womenAllTime : menAllTime;
    return board
      .filter((fighter) => !selectedEra || fighterBelongsToEra(fighter, selectedEra))
      .map((fighter) => ({
        fighter,
        displayRank: fighter.rank,
        meta: `${fighter.visibleStats.ufcRecord} · ${fighter.division}`,
        score: fighter.ovr,
        scoreLabel: "OVR",
      }));
  }, [categoryGender, selectedCategory, selectedDivision, selectedEra, view]);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return unsearchedRows;
    return unsearchedRows.filter((row) =>
      `${row.fighter.name} ${row.fighter.division} ${row.meta}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, unsearchedRows]);

  const countLabel =
    filteredRows.length === unsearchedRows.length
      ? "fighters"
      : `of ${unsearchedRows.length} fighters`;
  const canClear = Boolean(query.trim() || selectedEra);

  function changeView(nextView: RankingView) {
    const next = new URLSearchParams();
    if (nextView !== "p4p") next.set("view", nextView);
    if (nextView === "division") next.set("division", divisionOrder[0]);
    if (nextView === "category") {
      next.set("category", "championship");
      next.set("gender", "men");
    }
    setSearchParams(next);
    setQuery("");
  }

  function updateParameter(name: string, value: string | null) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next);
  }

  function clearOptionalFilters() {
    setQuery("");
    const next = new URLSearchParams(searchParams);
    next.delete("era");
    setSearchParams(next);
  }

  return (
    <div className="page rankings-page rankings-presentation">
      <section className="rankings-intro">
        <div className="rankings-intro__copy">
          <p className="eyebrow">Rankings</p>
          <h1>{heading.title}</h1>
          <p>{heading.description}</p>
        </div>
      </section>

      <section className="ranking-controls" aria-label="Ranking controls">
        <label className="ranking-control ranking-control--board">
          <span>Board</span>
          <span className="ranking-select-shell">
            <select
              aria-label="Ranking board"
              value={view}
              onChange={(event) => changeView(event.target.value as RankingView)}
            >
              {rankingViewOptions.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
            <span aria-hidden="true">⌄</span>
          </span>
        </label>

        {(view === "p4p" || view === "women") ? (
          <label className="ranking-control ranking-control--context">
            <span>Era</span>
            <span className="ranking-select-shell">
              <select
                aria-label="Ranking era"
                value={selectedEra ?? "all"}
                onChange={(event) =>
                  updateParameter("era", event.target.value === "all" ? null : event.target.value)
                }
              >
                <option value="all">All eras</option>
                {eraOptions.map((era) => (
                  <option value={era.id} key={era.id}>{era.name} · {era.years}</option>
                ))}
              </select>
              <span aria-hidden="true">⌄</span>
            </span>
          </label>
        ) : null}

        {view === "division" ? (
          <label className="ranking-control ranking-control--context">
            <span>Division</span>
            <span className="ranking-select-shell">
              <select
                aria-label="Ranking division"
                value={selectedDivision}
                onChange={(event) => updateParameter("division", event.target.value)}
              >
                {divisionOrder.map((division) => (
                  <option value={division} key={division}>{divisionLabel(division)}</option>
                ))}
              </select>
              <span aria-hidden="true">⌄</span>
            </span>
          </label>
        ) : null}

        {view === "category" ? (
          <>
            <label className="ranking-control ranking-control--context ranking-control--category">
              <span>Category</span>
              <span className="ranking-select-shell">
                <select
                  aria-label="Ranking category"
                  value={selectedCategory}
                  onChange={(event) => updateParameter("category", event.target.value)}
                >
                  {rankingCategoryOptions.map((category) => (
                    <option value={category.value} key={category.value}>{category.label}</option>
                  ))}
                </select>
                <span aria-hidden="true">⌄</span>
              </span>
            </label>
            <div className="ranking-control ranking-control--gender">
              <span>Board</span>
              <div className="ranking-gender-toggle" role="group" aria-label="Category leaderboard">
                <button
                  type="button"
                  className={categoryGender === "men" ? "is-active" : ""}
                  onClick={() => updateParameter("gender", "men")}
                >Men</button>
                <button
                  type="button"
                  className={categoryGender === "women" ? "is-active" : ""}
                  onClick={() => updateParameter("gender", "women")}
                >Women</button>
              </div>
            </div>
          </>
        ) : null}

        <label className="ranking-search ranking-search--controls">
          <span className="sr-only">Search {heading.title}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder="Search fighters"
          />
        </label>

        <div className="ranking-toolbar" aria-label={heading.summaryLabel}>
          <span className="ranking-count">
            <strong>{filteredRows.length}</strong>
            <span>{countLabel}</span>
          </span>
          {canClear ? (
            <button className="ranking-clear" type="button" onClick={clearOptionalFilters}>
              Clear
            </button>
          ) : null}
        </div>
      </section>

      {view === "division" ? (
        <p className="ranking-context-note">
          Fighters need a UFC win in the division and at least {DIVISION_RESUME_SHARE_MIN}% of their calculated UFC resume there.
        </p>
      ) : selectedEra ? (
        <p className="ranking-context-note">
          Showing fighters assigned to {eraOptions.find((era) => era.id === selectedEra)?.name} while preserving their all-time rank.
        </p>
      ) : null}

      <section className="ranking-list" aria-label={`${heading.title} list`}>
        {filteredRows.map((row) => (
          <article
            className="ranking-row"
            data-rank={row.displayRank}
            key={`${view}-${row.fighter.slug}`}
          >
            <Link
              className="ranking-row__profile"
              to={`/fighters/${row.fighter.slug}`}
              aria-label={`View ${row.fighter.name} profile`}
            >
              <span className="ranking-row__rank">{row.displayRank}</span>
              <FighterPhoto
                name={row.fighter.name}
                src={row.fighter.thumbUrl}
                className="ranking-row__photo"
              />
              <span className="ranking-row__identity">
                <strong>{row.fighter.name}</strong>
                <span>{row.meta}</span>
              </span>
              <span className="ranking-row__ovr">
                <strong>{row.score}</strong>
                <span>{row.scoreLabel}</span>
              </span>
            </Link>
            <a
              className="ranking-row__watch"
              href={watchMomentFor(row.fighter.slug)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch ${row.fighter.name} moment on YouTube`}
              title={`Watch ${row.fighter.name} moment`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 7.6v8.8L16 12 9 7.6Z" />
              </svg>
            </a>
          </article>
        ))}
      </section>

      {filteredRows.length === 0 ? (
        <section className="surface-card empty-state">
          <h2>No fighter found</h2>
          <p>Try a different name or filter.</p>
        </section>
      ) : null}
    </div>
  );
}
