import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  buildFactCheckRun,
  createFactCheckState,
  submitFactCheckAnswer,
  type FactCheckAnswerResult,
  type FactCheckItem,
  type FactCheckState,
} from "../games/factCheckEngine";
import { FOOTBALL_FACT_CHECK_BANK } from "./footballFactCheckBank";
import "./FootballFactCheckPreviewPage.css";

type Scene = "intro" | "play" | "result";

function formatLabel(item: FactCheckItem) {
  switch (item.format) {
    case "true_false": return "TRUE OR FALSE";
    case "before_after": return "BEFORE OR AFTER";
    case "over_under": return "OVER OR UNDER";
    case "either_or": return "PICK ONE";
  }
}

function newRun() {
  return buildFactCheckRun(FOOTBALL_FACT_CHECK_BANK);
}

export default function FootballFactCheckPreviewPage() {
  const navigate = useNavigate();
  const [scene, setScene] = useState<Scene>("intro");
  const [run, setRun] = useState<readonly FactCheckItem[]>(() => newRun());
  const [state, setState] = useState<FactCheckState>(() => createFactCheckState());
  const [lastResult, setLastResult] = useState<FactCheckAnswerResult | null>(null);
  const [lockArmed, setLockArmed] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const question = lastResult
    ? run[Math.max(0, state.index - 1)]
    : run[state.index];

  function start() {
    setRun(newRun());
    setState(createFactCheckState());
    setLastResult(null);
    setLockArmed(false);
    setElapsedSeconds(0);
    setStartedAt(Date.now());
    setScene("play");
  }

  function answer(choice: string) {
    if (lastResult || !question) return;
    const transition = submitFactCheckAnswer(run, state, choice, lockArmed);
    setState(transition.state);
    setLastResult(transition.result);
    setLockArmed(false);
  }

  function advance() {
    if (!lastResult) return;
    if (state.complete) {
      setElapsedSeconds(Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
      setScene("result");
      return;
    }
    setLastResult(null);
  }

  const correctCount = state.answers.filter((answerResult) => answerResult.correct).length;

  return (
    <main className="football-fact-check">
      <button
        className="football-fact-check__back"
        type="button"
        onClick={() => navigate("/football")}
      >
        ‹ FOOTBALL HQ
      </button>

      {scene === "intro" ? (
        <section className="football-fact-check__intro">
          <p className="football-fact-check__eyebrow">OWNER LAB · FOOTBALL</p>
          <h1>FACT CHECK</h1>
          <p className="football-fact-check__lede">
            Ten quick calls. The questions get tougher as you go.
          </p>

          <div className="football-fact-check__rules">
            <div><strong>10</strong><span>QUESTIONS</span></div>
            <div><strong>2</strong><span>LOCK ITS</span></div>
            <div><strong>1</strong><span>TEST RUN</span></div>
          </div>

          <div className="football-fact-check__rule-copy">
            <p><b>Build a streak.</b> Correct answers become more valuable as the streak grows.</p>
            <p><b>Lock It.</b> Arm it before an answer to double a correct score — or lose that question value if you miss.</p>
            <p><b>For this preview:</b> your finish time is recorded so we can decide whether Daily should be one run or two.</p>
          </div>

          <button className="football-fact-check__primary" type="button" onClick={start}>
            START FACT CHECK
          </button>
        </section>
      ) : null}

      {scene === "play" && question ? (
        <section className="football-fact-check__game">
          <header className="football-fact-check__hud">
            <div>
              <span>QUESTION</span>
              <strong>{Math.min(state.index + (lastResult ? 0 : 1), run.length)} / {run.length}</strong>
            </div>
            <div>
              <span>SCORE</span>
              <strong>{state.score}</strong>
            </div>
            <div>
              <span>STREAK</span>
              <strong>{state.streak}</strong>
            </div>
          </header>

          <div className="football-fact-check__progress" aria-hidden="true">
            <span style={{ width: ((state.index + (lastResult ? 0 : 1)) / run.length) * 100 + "%" }} />
          </div>

          <article className={lastResult ? "football-fact-check__card is-reveal" : "football-fact-check__card"}>
            <div className="football-fact-check__meta">
              <span>{formatLabel(question)}</span>
              <span>{question.league.toUpperCase()}</span>
            </div>
            <h2>{question.prompt}</h2>

            <div className="football-fact-check__choices">
              {question.choices.map((choice) => {
                const isCorrect = lastResult && choice === question.answer;
                const isWrongPick = lastResult && choice === lastResult.choice && !lastResult.correct;
                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={Boolean(lastResult)}
                    className={[
                      isCorrect ? "is-correct" : "",
                      isWrongPick ? "is-wrong" : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => answer(choice)}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            {!lastResult ? (
              <button
                className={lockArmed ? "football-fact-check__lock is-armed" : "football-fact-check__lock"}
                type="button"
                disabled={state.locksRemaining <= 0}
                onClick={() => setLockArmed((armed) => !armed)}
              >
                <span>{lockArmed ? "LOCKED IN" : "LOCK IT"}</span>
                <small>{state.locksRemaining} REMAINING</small>
              </button>
            ) : (
              <div className={lastResult.correct ? "football-fact-check__reveal is-correct" : "football-fact-check__reveal is-wrong"}>
                <p className="football-fact-check__verdict">
                  {lastResult.correct ? "CORRECT" : "MISS"}
                  {lastResult.lockUsed ? " · LOCK IT" : ""}
                  <b>{lastResult.points > 0 ? "+" : ""}{lastResult.points}</b>
                </p>
                <p>{question.explanation}</p>
                <button className="football-fact-check__primary" type="button" onClick={advance}>
                  {state.complete ? "SEE RESULTS" : "NEXT →"}
                </button>
              </div>
            )}
          </article>
        </section>
      ) : null}

      {scene === "result" ? (
        <section className="football-fact-check__result">
          <p className="football-fact-check__eyebrow">OWNER PLAYTEST COMPLETE</p>
          <h1>{state.score}</h1>
          <p className="football-fact-check__result-label">TEST SCORE</p>

          <div className="football-fact-check__result-grid">
            <div><strong>{correctCount}/10</strong><span>CORRECT</span></div>
            <div><strong>{state.bestStreak}</strong><span>BEST STREAK</span></div>
            <div><strong>{elapsedSeconds}s</strong><span>PLAY TIME</span></div>
          </div>

          <p className="football-fact-check__result-note">
            This is a local owner preview. It does not write a Daily result or leaderboard score.
          </p>

          <button className="football-fact-check__primary" type="button" onClick={start}>
            PLAY ANOTHER
          </button>
          <button className="football-fact-check__secondary" type="button" onClick={() => navigate("/football")}>
            BACK TO FOOTBALL HQ
          </button>
        </section>
      ) : null}
    </main>
  );
}
