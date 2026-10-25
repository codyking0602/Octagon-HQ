import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FighterPhoto } from "../rankings/FighterPhoto";
import { createReplaySeed } from "./lineupModel";
import {
  createUfcHigherLowerBoard, UFC_HIGHER_LOWER_QUESTION_COUNT,
  type UfcHigherLowerChoice, type UfcHigherLowerBoard,
} from "./ufcHigherLowerModel";
import "../../styles/football-higher-lower.css";
import "../../styles/ufc-higher-lower.css";

type Answer = { questionId: string; choice: UfcHigherLowerChoice; correct: boolean };
function UfcCard({ name, context, portrait, value, hidden }: {
  name: string; context: string; portrait: string; value: string; hidden?: boolean;
}) {
  return <article className={"higher-lower-card ufc-hl__card " + (hidden ? "is-hidden" : "is-known")}>
    <div className="ufc-hl__portrait"><FighterPhoto name={name} src={portrait} /></div>
    <div className="higher-lower-card__identity"><span>{context}</span></div>
    <h3>{name}</h3><strong>{value}</strong>
  </article>;
}

export default function UfcHigherLowerPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sharedSeed = params.get("seed");
  const [board, setBoard] = useState<UfcHigherLowerBoard | null>(() =>
    sharedSeed ? createUfcHigherLowerBoard(sharedSeed) : null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [revealed, setRevealed] = useState<UfcHigherLowerChoice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [finished, setFinished] = useState(false);
  const hits = useMemo(() => answers.filter(a => a.correct).length, [answers]);

  function start() {
    if (timer.current) clearTimeout(timer.current);
    setBoard(createUfcHigherLowerBoard(createReplaySeed("ufc-higher-lower")));
    setIndex(0); setAnswers([]); setRevealed(null); setFinished(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function answer(choice: UfcHigherLowerChoice) {
    if (!board || revealed || finished) return;
    const item = board.questions[index]!;
    const correct = item.answer === choice;
    setAnswers(current => [...current, { questionId: item.id, choice, correct }]);
    setRevealed(choice);
    timer.current = setTimeout(() => {
      if (index + 1 === UFC_HIGHER_LOWER_QUESTION_COUNT) setFinished(true);
      else setIndex(prev => prev + 1);
      setRevealed(null);
    }, 1050);
  }
  const shell = "page football-higher-lower ufc-higher-lower";
  if (!board) return <main className={shell}>
    <section className="higher-lower-hero ufc-hl__intro">
      <p className="eyebrow">UFC CHALLENGE</p><h1>HIGHER OR LOWER</h1>
      <strong>10 fighters. 10 comparisons. One shot at each.</strong>
      <p>Compare real UFC career statistics: wins, finishes, knockouts, submissions and title-fight victories. No total MMA records.</p>
      <p>Fights through August 18, 2026 · 3 approachable, 5 competitive, 2 tough.</p>
    </section>
    <button type="button" className="higher-lower-start" onClick={start}>START UFC BOARD</button>
  </main>;

  if (finished) return <main className={shell}>
    <section className="higher-lower-result">
      <p className="eyebrow">{hits === 10 ? "PERFECT BOARD" : "FINAL RESULT"}</p>
      <h1>{hits} / 10</h1>
      <strong>{hits === 10 ? "FLAWLESS" : hits >= 7 ? "STRONG WORK" : "RUN IT BACK"}</strong>
      <p>UFC-only results, frozen through August 18, 2026.</p>
    </section>
    <section className="higher-lower-review">
      <header><span>COMPARISON + FINAL NUMBERS</span><strong>YOUR CALL</strong><em>ANSWER</em></header>
      {board.questions.map((q, idx) => <div key={q.id} className={answers[idx]?.correct ? "is-correct" : "is-wrong"}>
        <span className="higher-lower-review__question">
          <small>Q{idx + 1} · {q.metricLabel}</small>
          <span className="higher-lower-review__matchup">
            <span><b>{q.known.name}</b><em>{q.known.formattedValue}</em></span>
            <i aria-hidden="true">→</i>
            <span><b>{q.hidden.name}</b><em>{q.hidden.formattedValue}</em></span>
          </span>
        </span>
        <strong>{answers[idx]?.choice.toUpperCase()}</strong><em>{q.answer.toUpperCase()}</em>
      </div>)}
    </section>
    <div className="higher-lower-controls"><button type="button" onClick={start}>NEW BOARD</button><button type="button" onClick={() => navigate("/play")}>ALL GAMES</button></div>
  </main>;

  const current = board.questions[index]!;
  const correct = revealed === current.answer;
  return <main className={shell}>
    <header className="higher-lower-game-header">
      <button type="button" onClick={() => navigate("/play")} aria-label="Back to UFC Play">←</button>
      <div><small>UFC · QUESTION {index + 1} OF 10</small><strong>HIGHER OR LOWER</strong></div>
      <span>{hits}/{answers.length}</span>
    </header>
    <div className="higher-lower-progress" aria-hidden="true">
      <i style={{ width: ((index + (revealed ? 1 : 0)) * 10) + "%" }} />
    </div>
    <section className="higher-lower-stat-label">
      <small>{current.difficulty.toUpperCase()} · OFFICIAL UFC STATISTICS</small>
      <h2>{current.metricLabel}</h2>
      <p>UFC fights only · through August 18, 2026</p>
    </section>
    <section className="higher-lower-matchup">
      <UfcCard name={current.known.name} context={current.known.context} portrait={current.known.photoSrc} value={current.known.formattedValue} />
      <div className="higher-lower-vs">VS</div>
      <UfcCard name={current.hidden.name} context={current.hidden.context} portrait={current.hidden.photoSrc} value={revealed ? current.hidden.formattedValue : "?"} hidden={!revealed} />
    </section>
    <section className="higher-lower-controls" aria-label="Higher or lower choice">
      <button type="button" disabled={Boolean(revealed)} className={revealed && current.answer === "higher" ? "is-answer" : revealed === "higher" ? "is-miss" : ""} onClick={() => answer("higher")}>↑ HIGHER</button>
      <button type="button" disabled={Boolean(revealed)} className={revealed && current.answer === "lower" ? "is-answer" : revealed === "lower" ? "is-miss" : ""} onClick={() => answer("lower")}>↓ LOWER</button>
    </section>
    {revealed ? <div role="status" className={"higher-lower-feedback is-visible " + (correct ? "is-correct" : "is-wrong")}>
      <strong>{correct ? "CORRECT" : "NOT QUITE"}</strong>
      <span>{current.hidden.name}: {current.hidden.formattedValue} · {current.answer.toUpperCase()}</span>
    </div> : null}
  </main>;
}
