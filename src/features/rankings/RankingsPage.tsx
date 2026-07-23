import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FighterPhoto } from "./FighterPhoto";
import {
  abbreviateDivisionLabel,
  categoryBadgeLabel,
  categoryDisplayRating,
  categorySupportCopy,
  divisionRoleLabel,
  shortEraName,
} from "./rankingDisplay";
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
  detail?: string;
  score: string | number;
  scoreLabel: string;
}

const categoryPillLabels: Record<RankingCategory, string> = {
  championship: "Championship",
  opponentQuality: "Opponent Quality",
  primeDominance: "Prime Dominance",
  longevity: "Elite Longevity",
  apexPeak: "Peak Apex",
  penalty: "Loss Context",
};

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
  const selectedEraData = eraOptions.find((era) => era.id === selectedEra) ?? null;
  const categoryCopy = rankingCategoryOptions.find(
    (category) => category.value === selectedCategory,
  )!;
  const searchableBoard = view === "p4p" || view === "women";

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
        title: "Division Rankings",
        description: "UFC-only divisional resume from the calculated GOAT model.",
        summaryLabel: `${divisionLabel(selectedDivision)} ranking summary`,
      };
    }
    if (view === "category") {
      return {
        title: "Category Leaders",
        description: "See who leads each scoring category.",
        summaryLabel: `${categoryCopy.label} ranking summary`,
      };
    }
    return {
      title: "UFC All-Time P4P",
      description: "The definitive pound-for-pound rankings.",
      summaryLabel: "P4P ranking summary",
    };
  }, [categoryCopy.label, selectedDivision, view]);

  const unsearchedRows = useMemo<PresentedRankingRow[]>(() => {
    if (view === "division") {
      return qualifiedDivisionBoard(selectedDivision).map((row) => ({
        fighter: row.fighter,
        displayRank: row.rank,
        meta: `${row.stats.ufcRecord} UFC · #${row.fighter.rank} P4P`,
        detail: divisionRoleLabel(row.role),
        score: `${Math.round(row.resumeSharePct)}%`,
        scoreLabel: "RESUME",
      }));
    }

    if (view === "category") {
      return categoryBoard(categoryGender, selectedCategory).map((fighter, index) => ({
        fighter,
        displayRank: index + 1,
        meta: `#${fighter.rank} P4P · ${fighter.visibleStats.ufcRecord} UFC · ${abbreviateDivisionLabel(fighter.division)}`,
        detail: categorySupportCopy(fighter, selectedCategory),
        score: categoryDisplayRating(categoryGender, selectedCategory, fighter),
        scoreLabel: categoryBadgeLabel(selectedCategory),
      }));
    }

    const board = view === "women" ? womenAllTime : menAllTime;
    return board
      .filter((fighter) => !selectedEra || fighterBelongsToEra(fighter, selectedEra))
      .map((fighter) => ({
        fighter,
        displayRank: fighter.rank,
        meta: `${fighter.visibleStats.ufcRecord} UFC · ${abbreviateDivisionLabel(fighter.division)}`,
        score: fighter.ovr,
        scoreLabel: "OVR",
      }));
  }, [categoryGender, selectedCategory, selectedDivision, selectedEra, view]);

  const filteredRows = useMemo(() => {
    if (!searchableBoard) return unsearchedRows;
    const normalized = query.trim().toLowerCase();
    if (!normalized) return unsearchedRows;
    return unsearchedRows.filter((row) =>
      `${row.fighter.name} ${row.fighter.division} ${row.meta}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, searchableBoard, unsearchedRows]);

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

      <nav className="ranking-view-tabs" aria-label="Ranking boards">
        {rankingViewOptions.map((option) => (
          <button
            type="button"
            key={option.value}
            className={view === option.value ? "is-active" : ""}
            aria-current={view === option.value ? "page" : undefined}
            onClick={() => changeView(option.value)}
          >
            {option.label}
          </button>
        ))}
      </nav>

      {searchableBoard ? (
        <section className="ranking-filter-stack" aria-label="Ranking filters">
          <label className="ranking-era-control">
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
                  <option value={era.id} key={era.id}>{shortEraName(era.name)}</option>
                ))}
              </select>
              <span aria-hidden="true">⌄</span>
            </span>
          </label>

          <div className="ranking-search-line" aria-label={heading.summaryLabel}>
            <label className="ranking-search ranking-search--compact">
              <span className="sr-only">Search {heading.title}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder={`Search ${unsearchedRows.length} fighters`}
              />
            </label>
            <span className="ranking-search-count" aria-label={`${filteredRows.length} fighters shown`}>
              {filteredRows.length}
            </span>
            {canClear ? (
              <button
                className="ranking-clear-icon"
                type="button"
                onClick={clearOptionalFilters}
                aria-label="Clear ranking filters"
              >
                ×
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {view === "division" ? (
        <>
          <section className="ranking-pill-grid ranking-pill-grid--divisions" aria-label="Choose division">
            {divisionOrder.map((division) => (
              <button
                type="button"
                key={division}
                className={selectedDivision === division ? "is-active" : ""}
                onClick={() => updateParameter("division", division)}
              >
                {divisionLabel(division)}
              </button>
            ))}
          </section>
          <section className="ranking-selection-card" aria-label={heading.summaryLabel}>
            <strong>{divisionLabel(selectedDivision)} · Men</strong>
            <p>
              Fighters need a UFC win and at least {DIVISION_RESUME_SHARE_MIN}% of their calculated UFC resume in this division.
            </p>
          </section>
        </>
      ) : null}

      {view === "category" ? (
        <>
          <section className="ranking-pill-grid ranking-pill-grid--categories" aria-label="Choose category">
            {rankingCategoryOptions.map((category) => (
              <button
                type="button"
                key={category.value}
                className={selectedCategory === category.value ? "is-active" : ""}
                onClick={() => updateParameter("category", category.value)}
              >
                {categoryPillLabels[category.value]}
              </button>
            ))}
          </section>
          <div className="ranking-gender-pills" role="group" aria-label="Category leaderboard">
            <button
              type="button"
              className={categoryGender === "men" ? "is-active" : ""}
              onClick={() => updateParameter("gender", "men")}
            >
              Men
            </button>
            <button
              type="button"
              className={categoryGender === "women" ? "is-active" : ""}
              onClick={() => updateParameter("gender", "women")}
            >
              Women
            </button>
          </div>
          <section className="ranking-selection-card" aria-label={heading.summaryLabel}>
            <strong>{categoryCopy.label} · {categoryGender === "women" ? "Women" : "Men"}</strong>
            <p>{categoryCopy.description}</p>
          </section>
        </>
      ) : null}

      {selectedEraData ? (
        <section className="ranking-era-card" aria-label={`${selectedEraData.name} context`}>
          <div>
            <span>Era</span>
            <strong>{selectedEraData.name} · {selectedEraData.years}</strong>
            <p>{selectedEraData.description}</p>
          </div>
          <a
            href={selectedEraData.fightUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch defining fight: ${selectedEraData.definingFight}`}
          >
            <span>Defining fight</span>
            <strong>{selectedEraData.definingFight}</strong>
            {selectedEraData.fightNote ? <small>{selectedEraData.fightNote}</small> : null}
          </a>
        </section>
      ) : null}

      <section className="ranking-list" aria-label={`${heading.title} list`}>
        {filteredRows.map((row) => (
          <article
            className={`ranking-row${row.detail ? " ranking-row--contextual" : ""}`}
            data-rank={row.displayRank}
            key={`${view}-${selectedDivision}-${selectedCategory}-${categoryGender}-${row.fighter.slug}`}
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
                <span className="ranking-row__meta">{row.meta}</span>
                {row.detail ? <span className="ranking-row__detail">{row.detail}</span> : null}
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
