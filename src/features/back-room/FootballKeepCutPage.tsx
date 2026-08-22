import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { recordLineupCompletion } from "../play/lineupModel";
import { FootballSubjectVisual } from "./FootballSubjectVisual";
import {
  createRandomFootballKeepCutRun,
  scoreFootballKeepCutSelection,
  type FootballKeepCutRun,
} from "./footballKeepCutModel";
import type { FootballRankFiveItem } from "./footballRankFiveModel";

type Decision = "keep" | "cut";

function Tray({
  title,
  items,
  packId,
}: {
  title: Decision;
  items: FootballRankFiveItem[];
  packId: FootballKeepCutRun["pack"]["id"];
}) {
  return (
    <section className={`football-keep-cut-tray is-${title}`}>
      <header><strong>{title.toUpperCase()}</strong><span>{items.length}/4</span></header>
      <div>
        {Array.from({ length: 4 }, (_, index) => {
          const item = items[index];
          return item ? (
            <article key={item.id}>
              <FootballSubjectVisual className="football-keep-cut-tray__visual" item={item} packId={packId} />
              <span><strong>{item.name}</strong><small>{item.league}</small></span>
            </article>
          ) : <i aria-hidden="true" key={index}>{index + 1}</i>;
        })}
      </div>
    </section>
  );
}

function ResultList({
  title,
  items,
  packId,
}: {
  title: string;
  items: FootballRankFiveItem[];
  packId: FootballKeepCutRun["pack"]["id"];
}) {
  return (
    <section className="football-debate-result-list">
      <p className="eyebrow">{title}</p>
      <div>
        {items.map((item, index) => (
          <article key={item.id}>
            <b>#{index + 1}</b>
            <FootballSubjectVisual item={item} packId={packId} />
            <span><strong>{item.name}</strong><small>{item.subtitle}</small></span>
            <em>{item.league}</em>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function FootballKeepCutPage() {
  const navigate = useNavigate();
  const [run, setRun] = useState<FootballKeepCutRun>(() => createRandomFootballKeepCutRun());
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const complete = decisions.length === run.lineup.length;
  const kept = run.lineup.filter((_item, index) => decisions[index] === "keep");
  const cut = run.lineup.filter((_item, index) => decisions[index] === "cut");
  const current = run.lineup[decisions.length];
  const result = useMemo(() => {
    if (!complete) return null;
    return scoreFootballKeepCutSelection(run.lineup, kept.map((item) => item.id));
  }, [complete, kept, run.lineup]);

  function reset(nextRun: FootballKeepCutRun) {
    setRun(nextRun);
    setDecisions([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    reset(createRandomFootballKeepCutRun(run.pack.id));
  }

  function decide(decision: Decision) {
    if (!current || complete) return;
    if (decision === "keep" && kept.length >= 4) return;
    if (decision === "cut" && cut.length >= 4) return;
    const next = [...decisions, decision];
    setDecisions(next);
    if (next.length === run.lineup.length) {
      const finalKept = run.lineup.filter((_item, index) => next[index] === "keep");
      const finalResult = scoreFootballKeepCutSelection(run.lineup, finalKept.map((item) => item.id));
      recordLineupCompletion(run.identity, {
        packId: run.pack.id,
        keptIds: finalResult.kept.map((item) => item.id),
        cutIds: finalResult.cut.map((item) => item.id),
        score: finalResult.score,
        correctComparisons: finalResult.correctComparisons,
      });
    }
  }

  if (result) {
    return (
      <div className="page football-debate-page football-keep-cut-page">
        <section className="football-debate-result-hero">
          <p className="eyebrow">THE BACK ROOM · KEEP 4 / CUT 4</p>
          <strong>{result.score}<small>/100</small></strong>
          <span>{result.label} · {result.topFourKept}/4 Back Room keeps</span>
        </section>

        <div className="football-debate-result-grid">
          <ResultList title="YOUR FOUR" items={result.kept} packId={run.pack.id} />
          <ResultList title="BACK ROOM FOUR" items={result.topFour} packId={run.pack.id} />
        </div>

        <div className="football-debate-actions">
          <button className="is-primary" type="button" onClick={startNew}>NEW LINEUP</button>
          <button type="button" onClick={() => navigate("/back-room/football")}>ALL FOOTBALL GAMES</button>
        </div>
      </div>
    );
  }

  const keepFull = kept.length >= 4;
  const cutFull = cut.length >= 4;
  const instruction = keepFull
    ? "KEEP IS FULL — THIS ONE HAS TO GO"
    : cutFull
      ? "CUT IS FULL — THIS ONE HAS TO STAY"
      : "MAKE THE CALL. IT LOCKS IMMEDIATELY.";

  return (
    <div className="page football-debate-page football-keep-cut-page">
      <section className="football-debate-intro">
        <div>
          <p className="eyebrow">THE BACK ROOM · FOOTBALL</p>
          <h1>{run.pack.prompt}</h1>
          <p>{run.pack.intro}</p>
        </div>
        <div className="football-debate-category">
          <small>CURRENT CATEGORY</small>
          <strong>{run.pack.name}</strong>
          <button type="button" onClick={startNew}>NEW LINEUP</button>
        </div>
      </section>

      <section className="football-keep-cut-board">
        <header><strong>REVEAL {decisions.length + 1} OF 8</strong><span>{run.pack.name}</span></header>
        <div className="football-keep-cut-trays">
          <Tray title="keep" items={kept} packId={run.pack.id} />
          <Tray title="cut" items={cut} packId={run.pack.id} />
        </div>

        {current ? (
          <article className="football-keep-cut-current">
            <FootballSubjectVisual item={current} packId={run.pack.id} />
            <div>
              <p className="eyebrow">{current.league} · LOCKED DECISION</p>
              <h2>{current.name}</h2>
              <p>{current.subtitle}</p>
              <small className={keepFull || cutFull ? "is-forced" : ""}>{instruction}</small>
            </div>
            <div className="football-keep-cut-current__actions">
              <button className="is-keep" type="button" disabled={keepFull} onClick={() => decide("keep")}>KEEP</button>
              <button className="is-cut" type="button" disabled={cutFull} onClick={() => decide("cut")}>CUT</button>
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
