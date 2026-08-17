import type { ReactNode } from "react";
import { FighterPhoto } from "../rankings/FighterPhoto";
import {
  HIT_THE_NUMBER_STATS,
  type HitTheNumberPublicSetup,
  type HitTheNumberResult,
} from "./hitTheNumberEngine";
import { getPlayFighter, type PlayFighter } from "./playFighterPool";

function setupFighters(setup: HitTheNumberPublicSetup) {
  const fighters = setup.fighterIds
    .map((fighterId) => getPlayFighter(fighterId))
    .filter((fighter): fighter is PlayFighter => Boolean(fighter));
  return setup.boardType === "open-roster"
    ? fighters.sort((left, right) => left.name.localeCompare(right.name))
    : fighters;
}

function resultLabel(result: HitTheNumberResult) {
  if (result.status === "perfect") return "PERFECT";
  if (result.status === "bust") return "BUST";
  return `${result.distance} OFF`;
}

function resultDetail(result: HitTheNumberResult) {
  if (result.status === "perfect") return `You hit ${result.target} exactly.`;
  if (result.status === "bust") return `You went over by ${result.distance}.`;
  return `You finished ${result.distance} below the target.`;
}

export function HitTheNumberGameView({
  setup,
  selectedIds,
  result,
  search,
  onSearchChange,
  onToggleFighter,
  onLock,
  onBack,
  controls,
  resultActions,
  busy = false,
}: {
  setup: HitTheNumberPublicSetup;
  selectedIds: readonly string[];
  result: HitTheNumberResult | null;
  search: string;
  onSearchChange: (value: string) => void;
  onToggleFighter: (fighterId: string) => void;
  onLock: () => void;
  onBack?: () => void;
  controls?: ReactNode;
  resultActions?: ReactNode;
  busy?: boolean;
}) {
  const stat = HIT_THE_NUMBER_STATS.find((row) => row.id === setup.statId)!;
  const fighters = setupFighters(setup);
  const selectedSet = new Set(selectedIds);
  const resultValues = new Map(
    result?.selections.map((selection) => [selection.fighterId, selection.value]) ?? [],
  );
  const visibleFighters = fighters.filter((fighter) => (
    fighter.name.toLowerCase().includes(search.trim().toLowerCase())
  ));
  const filterLabel = setup.filter.division
    ? `${setup.filter.division.toUpperCase()} ONLY`
    : setup.filter.gender
      ? `${setup.filter.gender.toUpperCase()} ONLY`
      : "ALL DIVISIONS";
  const poolLabel = setup.boardType === "open-roster" ? "OPEN ROSTER" : "RANDOM POOL";
  const ready = selectedIds.length === setup.pickCount;

  return (
    <>
      <section className="hit-number-heading">
        {onBack ? (
          <button className="hit-number-back" type="button" onClick={onBack}>← ALL GAMES</button>
        ) : null}
        <p className="eyebrow">HIT THE NUMBER</p>
        <div className="hit-number-target" aria-label={`Target ${setup.target}`}>
          <span>TARGET</span>
          <strong>{setup.target}</strong>
          <small>{stat.label.toUpperCase()}</small>
        </div>
        <p className="hit-number-rule">Get as close as possible without going over. Go over the target and you bust.</p>
        <div className="hit-number-meta" aria-label="Current challenge rules">
          <span>PICK {setup.pickCount}</span>
          <span>{poolLabel}</span>
          <span>{filterLabel}</span>
        </div>
      </section>

      {!result && controls ? controls : null}

      <section className={`hit-number-selection surface-card${result ? " is-complete" : ""}`}>
        <div className="hit-number-section-heading">
          <div>
            <p className="eyebrow">YOUR PICKS</p>
            <h2>{selectedIds.length} / {setup.pickCount} selected</h2>
          </div>
          {!result ? <span>Stats stay hidden until you lock.</span> : null}
        </div>

        <div className="hit-number-slots">
          {Array.from({ length: setup.pickCount }, (_, index) => {
            const fighterId = selectedIds[index];
            const fighter = fighterId ? getPlayFighter(fighterId) : null;
            const value = fighterId ? resultValues.get(fighterId) : undefined;
            return (
              <div className={`hit-number-slot${fighter ? " is-filled" : ""}`} key={index}>
                <b>{index + 1}</b>
                {fighter ? (
                  <>
                    <FighterPhoto name={fighter.name} src={fighter.thumbUrl} className="hit-number-slot__photo" />
                    <span>{fighter.name}</span>
                    {result ? <strong className="hit-number-stat-value">{value}</strong> : <small>SELECTED</small>}
                  </>
                ) : (
                  <span className="hit-number-slot__empty">EMPTY</span>
                )}
              </div>
            );
          })}
        </div>

        {!result ? (
          <div className={`hit-number-lock-dock${ready ? " is-ready" : ""}`}>
            <button
              className={`hit-number-lock${ready ? " is-ready" : ""}`}
              type="button"
              disabled={!ready || busy}
              onClick={onLock}
            >
              {ready ? `${selectedIds.length}/${setup.pickCount} SELECTED · LOCK PICKS` : `${selectedIds.length}/${setup.pickCount} SELECTED`}
            </button>
          </div>
        ) : (
          <div className={`hit-number-result is-${result.status}`}>
            <p>{resultLabel(result)}</p>
            <strong className="hit-number-result__total">{result.total}</strong>
            <span>TOTAL · TARGET {result.target}</span>
            <small>{resultDetail(result)}</small>
            <div className="hit-number-result__score" aria-label={`Score ${result.score} out of 100`}>
              <span>SCORE</span>
              <strong>{result.score}</strong>
              <small>/100</small>
            </div>
            {resultActions}
          </div>
        )}
      </section>

      {!result ? (
        <section className="hit-number-roster surface-card">
          <div className="hit-number-section-heading">
            <div>
              <p className="eyebrow">{poolLabel}</p>
              <h2>{setup.boardType === "open-roster" ? `${fighters.length} eligible fighters` : `${fighters.length}-fighter pool`}</h2>
            </div>
            <span>{setup.filter.division ? `${setup.filter.division} filter applied` : "Choose any eligible fighter"}</span>
          </div>
          {setup.boardType === "open-roster" ? (
            <label className="hit-number-search">
              <span>SEARCH FIGHTERS</span>
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search by name"
                type="search"
              />
            </label>
          ) : null}
          <div className="hit-number-fighter-grid">
            {visibleFighters.map((fighter) => {
              const selected = selectedSet.has(fighter.id);
              return (
                <button
                  type="button"
                  className={`hit-number-fighter-card${selected ? " is-selected" : ""}`}
                  data-divisions={fighter.divisions.join("|")}
                  aria-pressed={selected}
                  disabled={busy}
                  onClick={() => onToggleFighter(fighter.id)}
                  key={fighter.id}
                >
                  <FighterPhoto name={fighter.name} src={fighter.thumbUrl} className="hit-number-fighter-card__photo" />
                  <span>
                    <strong>{fighter.name}</strong>
                    <small>{fighter.divisions.join(" · ")}</small>
                  </span>
                  <b>{selected ? "✓" : "+"}</b>
                </button>
              );
            })}
          </div>
          {!visibleFighters.length ? <p className="hit-number-empty">No eligible fighters match that search.</p> : null}
        </section>
      ) : null}
    </>
  );
}
