import type { ReactNode } from "react";
import { FighterPhoto } from "../rankings/FighterPhoto";
import {
  HIT_THE_NUMBER_STATS,
  type HitTheNumberPublicSetup,
  type HitTheNumberResult,
} from "./hitTheNumberEngine";
import {
  hitTheNumberSlotAcceptsFighter,
  type HitTheNumberFormatSetup,
} from "./hitTheNumberFormats";
import { getPlayFighter, type PlayFighter } from "./playFighterPool";

const HIT_THE_NUMBER_DIVISION_ABBREVIATIONS: Readonly<Record<string, string>> = {
  Strawweight: "SW",
  Flyweight: "FLW",
  Bantamweight: "BW",
  Featherweight: "FW",
  Lightweight: "LW",
  Welterweight: "WW",
  Middleweight: "MW",
  "Light Heavyweight": "LHW",
  Heavyweight: "HW",
  Openweight: "OW",
  "Women's Strawweight": "WSW",
  "Women's Flyweight": "WFLW",
  "Women's Bantamweight": "WBW",
  "Women's Featherweight": "WFW",
};

export function compactHitTheNumberDivisions(divisions: readonly string[]) {
  return divisions.map((division) => (
    HIT_THE_NUMBER_DIVISION_ABBREVIATIONS[division]
      ?? division.split(/\s+/).filter(Boolean).map((word) => word[0]?.toUpperCase() ?? "").join("")
  )).join(" · ");
}

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
  format,
  selectedIds,
  slotAssignments = [],
  activeSlotIndex = 0,
  selectionValid = true,
  result,
  search,
  onSearchChange,
  onToggleFighter,
  onSelectSlot,
  onLock,
  onBack,
  controls,
  resultActions,
  busy = false,
}: {
  setup: HitTheNumberPublicSetup;
  format?: HitTheNumberFormatSetup;
  selectedIds: readonly string[];
  slotAssignments?: readonly (string | null)[];
  activeSlotIndex?: number;
  selectionValid?: boolean;
  result: HitTheNumberResult | null;
  search: string;
  onSearchChange: (value: string) => void;
  onToggleFighter: (fighterId: string) => void;
  onSelectSlot?: (slotIndex: number) => void;
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
  const filterLabel = setup.filter.division
    ? `${setup.filter.division.toUpperCase()} ONLY`
    : setup.filter.gender
      ? `${setup.filter.gender.toUpperCase()} ONLY`
      : "ALL DIVISIONS";
  const poolLabel = setup.boardType === "open-roster" ? "OPEN ROSTER" : "RANDOM POOL";
  const formatLabel = format?.label.toUpperCase() ?? filterLabel;
  const configurationLabel = format?.configurationLabel?.toUpperCase() ?? null;
  const slotFormat = Boolean(format?.slots.length);
  const activeSlot = slotFormat
    ? format?.slots[activeSlotIndex] ?? format?.slots[0]
    : undefined;
  const candidateFighters = activeSlot
    ? fighters.filter((fighter) => hitTheNumberSlotAcceptsFighter(activeSlot, fighter.id))
    : fighters;
  const visibleFighters = candidateFighters.filter((fighter) => (
    fighter.name.toLowerCase().includes(search.trim().toLowerCase())
  ));
  const activeAssignedId = slotFormat ? slotAssignments[activeSlotIndex] ?? null : null;
  const pickedAll = selectedIds.length === setup.pickCount;
  const ready = pickedAll && selectionValid;
  const fullButInvalid = pickedAll && !selectionValid;
  const rosterInstruction = configurationLabel
    ? setup.boardType === "random-pool"
      ? `Pick ${setup.pickCount} from this pool`
      : `Pick ${setup.pickCount} from this theme`
    : setup.filter.division
      ? `${setup.filter.division} filter applied`
      : "Choose any eligible fighter";

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
          <span>{formatLabel}</span>
          {configurationLabel ? <span>{configurationLabel}</span> : null}
          {format?.formatId === "classic" ? <span>{filterLabel}</span> : null}
        </div>
      </section>

      {!result && controls ? controls : null}

      <div className="hit-number-play-area">
        <section className={`hit-number-selection surface-card${result ? " is-complete" : ""}`}>
          <div className="hit-number-section-heading">
            <div>
              <p className="eyebrow">YOUR PICKS</p>
              <h2>{selectedIds.length} / {setup.pickCount} selected</h2>
            </div>
            {!result ? <span>Stats stay hidden until you lock.</span> : null}
          </div>

          {slotFormat && format ? (
            <div className="hit-number-role-slots" data-testid="hit-number-role-slots">
              {format.slots.map((slot, index) => {
                const fighterId = slotAssignments[index] ?? null;
                const fighter = fighterId ? getPlayFighter(fighterId) : null;
                const value = fighterId ? resultValues.get(fighterId) : undefined;
                const active = !result && index === activeSlotIndex;
                return (
                  <button
                    type="button"
                    className={`hit-number-role-slot${active ? " is-active" : ""}${fighter ? " is-filled" : ""}`}
                    aria-label={`${slot.label}: ${fighter?.name ?? "empty"}`}
                    aria-pressed={active}
                    disabled={busy || Boolean(result)}
                    onClick={() => onSelectSlot?.(index)}
                    key={slot.id}
                  >
                    <span className="hit-number-role-slot__index">{index + 1}</span>
                    {fighter ? (
                      <FighterPhoto
                        name={fighter.name}
                        src={fighter.thumbUrl}
                        className="hit-number-role-slot__photo"
                      />
                    ) : (
                      <span className="hit-number-role-slot__empty">+</span>
                    )}
                    <span className="hit-number-role-slot__copy">
                      <small>{slot.label}</small>
                      <strong>{fighter?.name ?? "Choose fighter"}</strong>
                    </span>
                    <span className="hit-number-role-slot__state">
                      {result
                        ? <strong className="hit-number-stat-value">{value ?? "—"}</strong>
                        : active
                          ? "CHOOSING"
                          : fighter
                            ? "CHANGE"
                            : "TAP TO FILL"}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="hit-number-slots" data-testid="hit-number-slots">
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
          )}

          {result ? (
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
          ) : null}
        </section>

        {!result ? (
          <div className={`hit-number-lock-dock${ready ? " is-ready" : ""}`}>
            <button
              className={`hit-number-lock${ready ? " is-ready" : ""}`}
              type="button"
              disabled={!ready || busy}
              onClick={onLock}
            >
              {ready
                ? `${selectedIds.length}/${setup.pickCount} SELECTED · LOCK PICKS`
                : fullButInvalid
                  ? `${selectedIds.length}/${setup.pickCount} SELECTED · FILL REQUIRED ROLES`
                  : `${selectedIds.length}/${setup.pickCount} SELECTED`}
            </button>
          </div>
        ) : null}

        {!result ? (
          <section className="hit-number-roster surface-card">
            <div className="hit-number-section-heading">
              <div>
                <p className="eyebrow">{poolLabel}</p>
                <h2>
                  {slotFormat && activeSlot
                    ? activeSlot.label
                    : setup.boardType === "open-roster"
                      ? `${fighters.length} eligible fighters`
                      : `${fighters.length}-fighter pool`}
                </h2>
              </div>
              <span>
                {slotFormat
                  ? `${candidateFighters.length} eligible · choose one for this slot`
                  : rosterInstruction}
              </span>
            </div>
            {setup.boardType === "open-roster" ? (
              <label className="hit-number-search">
                <span>{activeSlot ? `SEARCH ${activeSlot.label.toUpperCase()}` : "SEARCH FIGHTERS"}</span>
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
                const selected = slotFormat
                  ? activeAssignedId === fighter.id
                  : selectedSet.has(fighter.id);
                const usedElsewhere = slotFormat && selectedSet.has(fighter.id) && !selected;
                return (
                  <button
                    type="button"
                    className={`hit-number-fighter-card${selected ? " is-selected" : ""}${usedElsewhere ? " is-used" : ""}`}
                    data-fighter-id={fighter.id}
                    data-divisions={fighter.divisions.join("|")}
                    aria-pressed={selected}
                    disabled={busy || usedElsewhere}
                    onClick={() => onToggleFighter(fighter.id)}
                    key={fighter.id}
                  >
                    <FighterPhoto name={fighter.name} src={fighter.thumbUrl} className="hit-number-fighter-card__photo" />
                    <span>
                      <strong>{fighter.name}</strong>
                      <small title={fighter.divisions.join(" · ")}>
                        {usedElsewhere ? "Already assigned" : compactHitTheNumberDivisions(fighter.divisions)}
                      </small>
                    </span>
                    <b>{selected ? "✓" : usedElsewhere ? "•" : "+"}</b>
                  </button>
                );
              })}
            </div>
            {!visibleFighters.length ? <p className="hit-number-empty">No eligible fighters match that search.</p> : null}
          </section>
        ) : null}
      </div>
    </>
  );
}
