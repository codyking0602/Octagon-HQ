import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { recordLineupCompletion } from "../play/lineupModel";
import {
  createFootballHitTheNumberRun,
  footballHitTheNumberSelectionSatisfies,
  footballHitTheNumberValue,
  formatFootballHitTheNumberValue,
  getFootballHitTheNumberSubject,
  gradeFootballHitTheNumberSelection,
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
  const [run, setRun] = useState<FootballHitTheNumberRun>(() => createFootballHitTheNumberRun());
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

  function startNew() {
    setRun(createFootballHitTheNumberRun());
    setSelectedIds([]);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="page football-debate-page football-hit-number-page">
      <section className="football-hit-number-hero">
        <div>
          <p className="eyebrow">HIT THE NUMBER · FOOTBALL</p>
          <span>{plan.formatLabel.toUpperCase()}</span>
          <h1>{formatFootballHitTheNumberValue(plan, plan.target)}</h1>
          <strong>{plan.metricLabel.toUpperCase()}</strong>
          <p>Pick four. Get as close as possible without going over. Go over the target and you bust.</p>
        </div>
        <aside>
          <small>BOARD</small>
          <b>{plan.domainLabel}</b>
          {plan.configurationLabel ? <em>{plan.configurationLabel}</em> : null}
        </aside>
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
          <button className="is-primary" type="button" onClick={startNew}>NEW NUMBER</button>
          <button type="button" onClick={() => navigate("/back-room/football")}>ALL FOOTBALL GAMES</button>
        </div>
      )}
    </div>
  );
}
