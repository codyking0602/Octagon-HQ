import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FighterPhoto } from "../rankings/FighterPhoto";
import {
  HIT_THE_NUMBER_MIN_PICKS,
  HIT_THE_NUMBER_STATS,
  createHitTheNumberBoard,
  gradeHitTheNumberSelection,
  hitTheNumberEligibleFighters,
  type HitTheNumberBoard,
  type HitTheNumberBoardType,
  type HitTheNumberResult,
  type HitTheNumberStatId,
} from "./hitTheNumberEngine";
import {
  recordLineupCompletion,
  selectReplayLineup,
  type PlayLineupIdentity,
} from "./lineupModel";
import { getPlayFighter, type PlayFighter } from "./playFighterPool";

type CasualHitTheNumberConfig = {
  statId: HitTheNumberStatId;
  boardType: HitTheNumberBoardType;
  division?: string;
};

interface CasualHitTheNumberRun {
  board: HitTheNumberBoard;
  identity: PlayLineupIdentity;
}

const DEFAULT_CONFIG: CasualHitTheNumberConfig = {
  statId: "ufc-wins",
  boardType: "open-roster",
};

function scopeId(config: CasualHitTheNumberConfig) {
  return [config.statId, config.boardType, config.division ?? "all"].join(":");
}

function boardSignature(board: HitTheNumberBoard) {
  const setup = board.publicSetup;
  const pool = setup.boardType === "random-pool" ? setup.fighterIds.join(",") : "open";
  return [setup.statId, setup.boardType, setup.filter.division ?? "all", setup.pickCount, setup.target, pool].join("|");
}

function createCasualRun(config: CasualHitTheNumberConfig): CasualHitTheNumberRun {
  const selected = selectReplayLineup({
    gameId: "hit-the-number",
    scopeId: scopeId(config),
    lineupSize: 1,
    attempts: 12,
    build: (seed) => {
      const board = createHitTheNumberBoard({
        seed,
        statId: config.statId,
        boardType: config.boardType,
        filter: config.division ? { division: config.division } : {},
      });
      return {
        value: board,
        itemIds: [boardSignature(board)],
        fighterIds: board.publicSetup.boardType === "random-pool"
          ? board.publicSetup.fighterIds
          : [],
      };
    },
  });

  return { board: selected.value, identity: selected.identity };
}

function canBuildDivision(statId: HitTheNumberStatId, division: string) {
  try {
    createHitTheNumberBoard({
      seed: `division-check-${statId}-${division}`,
      statId,
      boardType: "open-roster",
      filter: { division },
      pickCount: HIT_THE_NUMBER_MIN_PICKS,
    });
    return true;
  } catch {
    return false;
  }
}

function divisionOptions(statId: HitTheNumberStatId) {
  const divisions = new Set(
    hitTheNumberEligibleFighters(statId).flatMap((fighter) => fighter.divisions),
  );
  return [...divisions]
    .filter((division) => canBuildDivision(statId, division))
    .sort((left, right) => left.localeCompare(right));
}

function setupFighters(board: HitTheNumberBoard) {
  const fighters = board.publicSetup.fighterIds
    .map((fighterId) => getPlayFighter(fighterId))
    .filter((fighter): fighter is PlayFighter => Boolean(fighter));
  return board.publicSetup.boardType === "open-roster"
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

export default function HitTheNumberPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<CasualHitTheNumberConfig>(DEFAULT_CONFIG);
  const [run, setRun] = useState<CasualHitTheNumberRun>(() => createCasualRun(DEFAULT_CONFIG));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<HitTheNumberResult | null>(null);
  const [search, setSearch] = useState("");

  const setup = run.board.publicSetup;
  const stat = HIT_THE_NUMBER_STATS.find((row) => row.id === setup.statId)!;
  const divisions = useMemo(() => divisionOptions(config.statId), [config.statId]);
  const fighters = useMemo(() => setupFighters(run.board), [run.board]);
  const selectedSet = new Set(selectedIds);
  const resultValues = new Map(result?.selections.map((selection) => [selection.fighterId, selection.value]) ?? []);
  const visibleFighters = fighters.filter((fighter) => fighter.name.toLowerCase().includes(search.trim().toLowerCase()));

  function resetWith(nextConfig: CasualHitTheNumberConfig) {
    setConfig(nextConfig);
    setRun(createCasualRun(nextConfig));
    setSelectedIds([]);
    setResult(null);
    setSearch("");
  }

  function chooseBoardType(boardType: HitTheNumberBoardType) {
    if (result || boardType === config.boardType) return;
    resetWith({ ...config, boardType });
  }

  function chooseStat(statId: HitTheNumberStatId) {
    if (result || statId === config.statId) return;
    const validDivisions = divisionOptions(statId);
    resetWith({
      ...config,
      statId,
      division: config.division && validDivisions.includes(config.division) ? config.division : undefined,
    });
  }

  function chooseDivision(division: string) {
    if (result) return;
    resetWith({ ...config, division: division || undefined });
  }

  function toggleFighter(fighterId: string) {
    if (result) return;
    if (selectedSet.has(fighterId)) {
      setSelectedIds((current) => current.filter((id) => id !== fighterId));
      return;
    }
    if (selectedIds.length >= setup.pickCount) return;
    setSelectedIds((current) => [...current, fighterId]);
  }

  function lockPicks() {
    if (result || selectedIds.length !== setup.pickCount) return;
    const next = gradeHitTheNumberSelection(setup, selectedIds);
    setResult(next);
    recordLineupCompletion(run.identity, {
      status: next.status,
      target: next.target,
      total: next.total,
      distance: next.distance,
      selectedFighterIds: [...selectedIds],
    });
  }

  const filterLabel = setup.filter.division ? `${setup.filter.division.toUpperCase()} ONLY` : "ALL DIVISIONS";
  const poolLabel = setup.boardType === "open-roster" ? "OPEN ROSTER" : "RANDOM POOL";

  return (
    <div className="page hit-number-page" data-challenge-id={run.identity.challengeId}>
      <section className="hit-number-heading">
        <button className="hit-number-back" type="button" onClick={() => navigate("/play")}>← ALL GAMES</button>
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

      <section className="hit-number-controls surface-card" aria-label="Hit the Number setup">
        <div className="hit-number-mode-toggle" aria-label="Roster mode">
          <button
            type="button"
            className={config.boardType === "open-roster" ? "is-active" : ""}
            aria-pressed={config.boardType === "open-roster"}
            disabled={Boolean(result)}
            onClick={() => chooseBoardType("open-roster")}
          >
            OPEN ROSTER
          </button>
          <button
            type="button"
            className={config.boardType === "random-pool" ? "is-active" : ""}
            aria-pressed={config.boardType === "random-pool"}
            disabled={Boolean(result)}
            onClick={() => chooseBoardType("random-pool")}
          >
            RANDOM POOL
          </button>
        </div>
        <label>
          <span>STAT</span>
          <select value={config.statId} disabled={Boolean(result)} onChange={(event) => chooseStat(event.target.value as HitTheNumberStatId)}>
            {HIT_THE_NUMBER_STATS.map((row) => <option value={row.id} key={row.id}>{row.label}</option>)}
          </select>
        </label>
        <label>
          <span>ROSTER FILTER</span>
          <select name="division" value={config.division ?? ""} disabled={Boolean(result)} onChange={(event) => chooseDivision(event.target.value)}>
            <option value="">All divisions</option>
            {divisions.map((division) => <option value={division} key={division}>{division}</option>)}
          </select>
        </label>
        {!result ? (
          <button className="hit-number-new-board" type="button" onClick={() => resetWith(config)}>NEW BOARD</button>
        ) : null}
      </section>

      <section className="hit-number-selection surface-card">
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
          <button
            className={`hit-number-lock${selectedIds.length === setup.pickCount ? " is-ready" : ""}`}
            type="button"
            disabled={selectedIds.length !== setup.pickCount}
            onClick={lockPicks}
          >
            LOCK PICKS
          </button>
        ) : (
          <div className={`hit-number-result is-${result.status}`}>
            <p>{resultLabel(result)}</p>
            <strong>{result.total}</strong>
            <span>TOTAL · TARGET {result.target}</span>
            <small>{resultDetail(result)}</small>
            <div className="hit-number-result__actions">
              <button type="button" onClick={() => resetWith(config)}>PLAY AGAIN</button>
              <button type="button" onClick={() => navigate("/play")}>ALL GAMES</button>
            </div>
          </div>
        )}
      </section>

      <section className="hit-number-roster surface-card">
        <div className="hit-number-section-heading">
          <div>
            <p className="eyebrow">{poolLabel}</p>
            <h2>{setup.boardType === "open-roster" ? `${fighters.length} eligible fighters` : `${fighters.length}-fighter pool`}</h2>
          </div>
          <span>{setup.filter.division ? `${setup.filter.division} filter applied` : "Choose any eligible fighter"}</span>
        </div>
        {setup.boardType === "open-roster" && !result ? (
          <label className="hit-number-search">
            <span>SEARCH FIGHTERS</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name" type="search" />
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
                disabled={Boolean(result)}
                onClick={() => toggleFighter(fighter.id)}
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
    </div>
  );
}
