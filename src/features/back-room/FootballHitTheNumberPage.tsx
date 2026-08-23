import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { recordLineupCompletion } from "../play/lineupModel";
import {
  FOOTBALL_HIT_THE_NUMBER_DEFAULT_BOARD_TYPE,
  createFootballHitTheNumberRun,
  footballHitTheNumberSelectionSatisfies,
  footballHitTheNumberValue,
  formatFootballHitTheNumberValue,
  getFootballHitTheNumberSubject,
  gradeFootballHitTheNumberSelection,
  type FootballHitTheNumberBoardType,
  type FootballHitTheNumberResult,
  type FootballHitTheNumberRun,
} from "./footballHitTheNumberModel";

function resultTitle(result: FootballHitTheNumberResult) {
  if (result.status === "perfect") return "PERFECT";
  if (result.status === "bust") return "BUST";
  return `${formatDistance(result.distance)} OFF`;
}

function formatDistance(value: number) {
  return Number.isInteger(value) ? value.toLocaleString("en-US") : value.toFixed(1);
}

export default function FootballHitTheNumberPage() {
  const navigate = useNavigate();
  const [boardType, setBoardType] = useState<FootballHitTheNumberBoardType>(FOOTBALL_HIT_THE_NUMBER_DEFAULT_BOARD_TYPE);
  const [run, setRun] = useState<FootballHitTheNumberRun>(() => createFootballHitTheNumberRun(FOOTBALL_HIT_THE_NUMBER_DEFAULT_BOARD_TYPE));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<FootballHitTheNumberResult | null>(null);
  const plan = run.plan;
  const selectionValid = footballHitTheNumberSelectionSatisfies(plan, selectedIds);

  function toggleSubject(subjectId: string) {
    if (result) return;
    setSelectedIds((current) => {
      if (current.includes(subjectId)) return current.filter((id) => id !== subjectId);
      if (current.length >= plan.pickCount) return current;
      return [...current, subjectId];
    });
  }

  function lockPicks() {
    if (!selectionValid || result) return;
    const next = gradeFootballHitTheNumberSelection(plan, selectedIds);
    recordLineupCompletion(run.identity, {
      score: next.score,
      boardType: plan.boardType,
      league: plan.league,
      formatId: plan.formatId,
      domainId: plan.domainId,
      metricId: plan.metricId,
      target: plan.target,
      total: next.total,
      selectedIds,
    });
    setResult(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew(nextBoardType = boardType) {
    setBoardType(nextBoardType);
    setRun(createFootballHitTheNumberRun(nextBoardType));
    setSelectedIds([]);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseBoardType(nextBoardType: FootballHitTheNumberBoardType) {
    if (nextBoardType === boardType) return;
    startNew(nextBoardType);
  }

  return (
    <div className="page football-debate-page football-hit-number-page">
      <section className="football-hit-number-hero">
        <div>
          <p className="eyebrow">HIT THE NUMBER · FOOTBALL</p>
          <span>{plan.formatLabel.toUpperCase()} · {plan.league}</span>
          <h1>{formatFootballHitTheNumberValue(plan, plan.target)}</h1>
          <strong>{plan.metricLabel.toUpperCase()}</strong>
          <p>Pick {plan.pickCount}. Get as close as possible without going over. Go over the target and you bust.</p>
        </div>
        <aside>
          <small>BOARD</small>
          <b>{plan.domainLabel}</b>
          <em>{plan.boardType === "open-roster" ? "Open Roster" : "Random Pool"}</em>
          {plan.configurationLabel ? <em>{plan.configurationLabel}</em> : null}
        </aside>
      </section>

      <section className="football-hit-number-rules" aria-label="Football Hit the Number roster mode">
        <small>ROSTER MODE</small>
        <div className="hit-number-mode-toggle">
          <button
            type="button"
            className={boardType === "open-roster" ? "is-active" : ""}
            aria-pressed={boardType === "open-roster"}
            onClick={() => chooseBoardType("open-roster")}
          >
            OPEN ROSTER
          </button>
          <button
            type="button"
            className={boardType === "random-pool" ? "is-active" : ""}
            aria-pressed={boardType === "random-pool"}
            onClick={() => chooseBoardType("random-pool")}
          >
            RANDOM POOL
          </button>
        </div>
      </section>

      {plan.slots.length ? (
        <section className="football-hit-number-rules" aria-label="Required lineup roles">
          <small>{plan.formatId === "one-from-each" ? "ONE FROM EACH" : "BUILD REQUIREMENTS"}</small>
          <div>{plan.slots.map((slot) => <span key={slot.id}>{slot.label}</span>)}</div>
        </section>
      ) : null}

      {result ? (
        <section className={`football-hit-number-result is-${result.status}`}>
          <p>{resultTitle(result)}</p>
          <strong>{formatFootballHitTheNumberValue(plan, result.total)}</strong>
          <span>TOTAL · TARGET {formatFootballHitTheNumberValue(plan, result.target)}</span>
          <div><small>SCORE</small><b>{result.score}<em>/100</em></b></div>
        </section>
      ) : (
        <section className="football-hit-number-selection">
          <span>{selectedIds.length} / {plan.pickCount} SELECTED</span>
          <strong>Stats stay hidden until you lock.</strong>
        </section>
      )}

      <section className="football-hit-number-grid" aria-label="Football Hit the Number pool">
        {plan.subjectIds.map((subjectId) => {
          const subject = getFootballHitTheNumberSubject(subjectId)!;
          const selected = selectedIds.includes(subjectId);
          const value = result ? footballHitTheNumberValue(subjectId, plan.metricId) : null;
          return (
            <button
              className={`${selected ? "is-selected" : ""}${result ? " is-revealed" : ""}`}
              type="button"
              aria-pressed={selected}
              disabled={Boolean(result)}
              onClick={() => toggleSubject(subjectId)}
              key={subjectId}
            >
              <small>{subject.subtitle}</small>
              <strong>{subject.name}</strong>
              <span>{result ? formatFootballHitTheNumberValue(plan, value!) : selected ? "SELECTED" : "TAP TO PICK"}</span>
            </button>
          );
        })}
      </section>

      {!result ? (
        <div className="football-hit-number-lock">
          <button type="button" disabled={!selectionValid} onClick={lockPicks}>
            {selectedIds.length < plan.pickCount
              ? `${selectedIds.length}/${plan.pickCount} SELECTED`
              : selectionValid
                ? "LOCK PICKS"
                : "FILL EVERY REQUIRED ROLE"}
          </button>
        </div>
      ) : (
        <div className="football-debate-actions">
          <button className="is-primary" type="button" onClick={() => startNew()}>NEW NUMBER</button>
          <button type="button" onClick={() => navigate("/back-room/football")}>ALL FOOTBALL GAMES</button>
        </div>
      )}
    </div>
  );
}
