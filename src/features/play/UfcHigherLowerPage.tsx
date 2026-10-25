import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createReplaySeed } from "./lineupModel";
import {
  UFC_HIGHER_LOWER_COUNT, UFC_HIGHER_LOWER_GAME_ID, UFC_HIGHER_LOWER_METRICS,
  createUfcHigherLowerBoard, type UfcHigherLowerBoard, type UfcHigherLowerChoice,
} from "./ufcHigherLowerModel";
import { UfcHigherLowerCard, UfcHigherLowerReview, type UfcHigherLowerAnswerRow } from "./UfcHigherLowerView";

export default function UfcHigherLowerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [board, setBoard] = useState<UfcHigherLowerBoard | null>(() => {
    const seed = searchParams.get("seed");
    return seed ? createUfcHigherLowerBoard(seed) : null;
  });
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<UfcHigherLowerAnswerRow[]>([]);
  const [revealChoice, setRevealChoice] = useState<UfcHigherLowerChoice | null>(null);
  const [complete, setComplete] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);
  function start() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setBoard(createUfcHigherLowerBoard(createReplaySeed(UFC_HIGHER_LOWER_GAME_ID)));
    setIndex(0); setAnswers([]); setRevealChoice(null); setComplete(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function choose(choice: UfcHigherLowerChoice) {
    if (!board || complete || revealChoice) return;
    const q = board.questions[index]!;
    const correct = choice === q.answer;
    setAnswers(previous => [...previous, { question_id: q.id, choice, correct }]);
    setRevealChoice(choice);
    advanceTimer.current = setTimeout(() => {
      if (index === UFC_HIGHER_LOWER_COUNT - 1) setComplete(true);
      else setIndex(current => current + 1);
      setRevealChoice(null);
      advanceTimer.current = null;
    }, 850);
  }
  const score = answers.filter(answer => answer.correct).length;
  const shell = "page football-higher-lower ufc-higher-lower";
  if (!board) return <main className={shell}>
    <section className="higher-lower-hero">
      <p className="eyebrow">UFC · CASUAL</p>
      <h1>HIGHER OR LOWER</h1>
      <strong>Ten fighter matchups. Two buttons. Real UFC numbers.</strong>
      <p>Compare wins, finishes, submissions, championship records and more.
        Fighter statistics are UFC-only, frozen to a verified source snapshot so generations stay comparable.</p>
      <div className="ufc-higher-lower__facts">
        <span>10 COMPARISONS</span><span>3 APPROACHABLE · 5 COMPETITIVE · 2 TOUGH</span><span>REPLAYABLE</span>
      </div>
      <button className="higher-lower-start" type="button" onClick={start}>START UFC BOARD</button>
    </section>
  </main>;
  if (complete) return <main className={shell}>
    <section className="higher-lower-result">
      <p className="eyebrow">{score === 10 ? "PERFECT BOARD" : "UFC HIGHER OR LOWER · FINAL RESULT"}</p>
      <h1>{score} / {UFC_HIGHER_LOWER_COUNT}</h1>
      <strong>{score * 10} / 100</strong>
      <p>Every fighter's final number is shown below. The next Casual board will be a fresh ten-question lineup.</p>
    </section>
    <UfcHigherLowerReview questions={board.questions} answers={answers} />
    <div className="ufc-higher-lower__actions">
      <button type="button" onClick={start}>NEW BOARD</button>
      <button type="button" onClick={() => navigate("/play")}>ALL GAMES</button>
    </div>
  </main>;
  const q = board.questions[index]!;
  const revealed = revealChoice !== null;
  const correct = revealChoice === q.answer;
  return <main className={shell}>
    <header className="higher-lower-game-header">
      <button type="button" onClick={() => navigate("/play")} aria-label="Back to UFC Play">←</button>
      <div><small>UFC CASUAL · Q{index + 1} OF {UFC_HIGHER_LOWER_COUNT}</small><strong>HIGHER OR LOWER</strong></div>
      <span>{score}/{answers.length}</span>
    </header>
    <div className="higher-lower-progress" aria-hidden="true">
      <i style={{ width: ((index + (revealed ? 1 : 0)) / UFC_HIGHER_LOWER_COUNT * 100) + "%" }} />
    </div>
    <section className="higher-lower-stat-label">
      <small>{UFC_HIGHER_LOWER_METRICS[q.metricKey].category.toUpperCase()}</small>
      <h2>{q.metricLabel}</h2>
      <p>{q.scopeLabel}</p>
    </section>
    <section className="higher-lower-matchup">
      <UfcHigherLowerCard subject={q.known} />
      <div className="higher-lower-vs">VS</div>
      <UfcHigherLowerCard subject={q.hidden} hidden revealed={revealed} />
    </section>
    <section className="higher-lower-controls" aria-label="Higher or lower choice">
      {(["higher","lower"] as const).map(choice => <button key={choice} type="button"
        disabled={revealed} onClick={() => choose(choice)}
        className={revealed && q.answer === choice ? "is-answer" : revealChoice === choice ? "is-miss" : ""}>
        <b aria-hidden="true">{choice === "higher" ? "↑" : "↓"}</b>{choice.toUpperCase()}
      </button>)}
    </section>
    <div className={"higher-lower-feedback" + (revealed ? " is-visible " + (correct ? "is-correct" : "is-wrong") : "")} role="status">
      {revealed ? <>
        <strong>{correct ? "CORRECT" : "NOT QUITE"}</strong>
        <span>{q.hidden.name}: {q.hidden.formattedValue}. {q.known.name}: {q.known.formattedValue}.</span>
      </> : null}
    </div>
  </main>;
}
