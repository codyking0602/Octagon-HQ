import { HigherLowerIntro, HigherLowerRoundHeader, HigherLowerPrompt, HigherLowerChoices, HigherLowerFeedback } from "./HigherLowerStandard";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FighterPhoto } from "../rankings/FighterPhoto";
import { createReplaySeed } from "./lineupModel";
import {
  createUfcHigherLowerBoard, UFC_HIGHER_LOWER_QUESTION_COUNT,
  type UfcHigherLowerChoice, type UfcHigherLowerBoard,
} from "./ufcHigherLowerModel";
import "../../styles/football-higher-lower.css";
import "../../styles/ufc-higher-lower.css";
import "../../styles/higher-lower-standard.css";

type Answer = { questionId: string; choice: UfcHigherLowerChoice; correct: boolean };
function UfcCard({ name, context, portrait, value, hidden, revealed = false }: {
  name: string; context: string; portrait: string; value: string; hidden?: boolean; revealed?: boolean;
}) {
  return <article className={"higher-lower-card ufc-hl__card " + (hidden ? "is-hidden" : revealed ? "is-revealed" : "is-known")}>
    <div className="higher-lower-card__identity"><span>{context}</span></div>
    <div className="ufc-hl__portrait"><FighterPhoto name={name} src={portrait} /></div>
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
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const [finished, setFinished] = useState(false);
  const hits = useMemo(() => answers.filter(a => a.correct).length, [answers]);
  useLayoutEffect(() => {
    if (board && !finished) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [index, board?.seed, finished]);

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
    }, 650);
  }
  const shell = "page football-higher-lower ufc-higher-lower";
  if (!board) return <main className={shell}>
    <HigherLowerIntro sport="UFC" onStart={start} />
  </main>;

  if (finished) return <main className={shell}>
    <section className="higher-lower-result">
      <p className="eyebrow">{hits === 10 ? "PERFECT BOARD" : "FINAL RESULT"}</p>
      <h1>{hits} / 10</h1>
      <strong>{hits === 10 ? "FLAWLESS" : hits >= 7 ? "STRONG WORK" : "RUN IT BACK"}</strong>
      <p>10 UFC-only matchups. Ready for another?</p>
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
    <HigherLowerRoundHeader sport="UFC" index={index} correct={hits}
      completed={index + (revealed ? 1 : 0)}
      onBack={() => navigate("/play")} backLabel="Back to UFC Play" />
    <HigherLowerPrompt category={current.category} metric={current.metricLabel} />
    <section className="higher-lower-matchup">
      <UfcCard name={current.known.name} context={current.known.context} portrait={current.known.photoSrc} value={current.known.formattedValue} />
      <div className="higher-lower-vs">VS</div>
      <UfcCard name={current.hidden.name} context={current.hidden.context} portrait={current.hidden.photoSrc} value={revealed ? current.hidden.formattedValue : "?"} hidden={!revealed} revealed={Boolean(revealed)} />
    </section>
    <HigherLowerChoices revealed={revealed} answer={current.answer} onChoose={answer} />
    <HigherLowerFeedback correct={revealed === null ? null : correct}
      detail={revealed ? current.hidden.name + ": " + current.hidden.formattedValue : undefined} />
  </main>;
}
