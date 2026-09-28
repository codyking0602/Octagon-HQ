import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BAR_TRIVIA_BASE_POINTS,
  BAR_TRIVIA_MAX_WAGER,
  BAR_TRIVIA_RECENT_MEMORY_SIZE,
  BAR_TRIVIA_ROUND_NAMES,
  barTriviaRoundForQuestion,
  barTriviaRoundNumber,
  barTriviaScoreBreakdown,
  buildBarTriviaRun,
  createBarTriviaState,
  pickBarTriviaDoubleRound,
  setBarTriviaWager,
  submitBarTriviaAnswer,
  type BarTriviaAnswerResult,
  type BarTriviaLeague,
  type BarTriviaQuestion,
  type BarTriviaState,
} from "../games/barTriviaEngine";
import { BAR_TRIVIA_QUESTION_BANK } from "./barTriviaQuestionBank";
import "./BarTriviaCasualPage.css";

type BarTriviaScope = "football" | "ufc";
type Scene = "league" | "intro" | "round-intro" | "question" | "wager" | "result";

function leagueLabel(league: BarTriviaLeague) {
  if (league === "nfl") return "NFL";
  if (league === "cfb") return "COLLEGE FOOTBALL";
  return "UFC";
}

function storageKey(league: BarTriviaLeague) {
  return `octagon:bar-trivia:${league}:recent:v1`;
}

function recentQuestionIds(league: BarTriviaLeague) {
  if (typeof window === "undefined") return [] as string[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(league)) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function rememberQuestionIds(league: BarTriviaLeague, ids: readonly string[]) {
  if (typeof window === "undefined") return;
  const next = [...new Set([...ids, ...recentQuestionIds(league)])]
    .slice(0, BAR_TRIVIA_RECENT_MEMORY_SIZE);
  try {
    window.localStorage.setItem(storageKey(league), JSON.stringify(next));
  } catch {
    // Casual play remains available if local storage is unavailable.
  }
}

function buildRun(league: BarTriviaLeague) {
  return buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, league, {
    recentQuestionIds: recentQuestionIds(league),
  });
}

function roundDeckCopy(league: BarTriviaLeague, index: number) {
  if (index === 0) {
    return league === "ufc"
      ? "Start broad. Fighters, moments, and the stuff every fight fan should know."
      : "Start broad. Teams, traditions, and the stuff every football fan should know.";
  }
  if (index === 3) {
    return "The obvious stuff is gone. Time for traditions, oddities, nicknames, and history.";
  }
  return "Three tougher calls before Last Call.";
}

function choiceLetter(index: number) {
  return ["A", "B", "C", "D"][index] ?? "";
}

function formatRaw(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function streakCopy(streak: number) {
  if (streak >= 7) return "ON FIRE · ×1.25";
  if (streak >= 5) return "HOT STREAK · ×1.15";
  if (streak >= 3) return "STREAK BOOST · ×1.10";
  if (streak === 2) return "2 STRAIGHT · BOOST NEXT";
  if (streak === 1) return "1 IN A ROW";
  return "BUILD A STREAK";
}

export default function BarTriviaCasualPage({ scope }: { scope: BarTriviaScope }) {
  const navigate = useNavigate();
  const fixedLeague: BarTriviaLeague | null = scope === "ufc" ? "ufc" : null;
  const [league, setLeague] = useState<BarTriviaLeague | null>(fixedLeague);
  const [scene, setScene] = useState<Scene>(scope === "ufc" ? "intro" : "league");
  const [run, setRun] = useState<readonly BarTriviaQuestion[]>([]);
  const [state, setState] = useState<BarTriviaState>(() => createBarTriviaState());
  const [lastResult, setLastResult] = useState<BarTriviaAnswerResult | null>(null);
  const [wagerDraft, setWagerDraft] = useState(BAR_TRIVIA_MAX_WAGER);

  const backRoute = scope === "ufc" ? "/play" : "/football";
  const displayedIndex = lastResult ? Math.max(0, state.index - 1) : state.index;
  const question = run[displayedIndex] ?? null;
  const currentRound = barTriviaRoundForQuestion(state.index);
  const displayedRound = barTriviaRoundForQuestion(displayedIndex);
  const roundName = league ? BAR_TRIVIA_ROUND_NAMES[league][currentRound] : "";
  const currentRoundNumber = barTriviaRoundNumber(currentRound);
  const displayedRoundQuestionNumber = displayedRound === "round1"
    ? displayedIndex + 1
    : displayedRound === "round2"
      ? displayedIndex - 2
      : displayedRound === "round3"
        ? displayedIndex - 5
        : 1;
  const activeStreak = state.streak;
  const scoreLabel = `${state.score}/100`;
  const scoring = barTriviaScoreBreakdown(state);
  const currentRoundIsDouble = currentRound === state.doubleRound;
  const displayedRoundIsDouble = displayedRound === state.doubleRound;
  const currentBase = BAR_TRIVIA_BASE_POINTS[currentRound];

  const availableCounts = useMemo(() => ({
    nfl: BAR_TRIVIA_QUESTION_BANK.filter((item) => item.league === "nfl").length,
    cfb: BAR_TRIVIA_QUESTION_BANK.filter((item) => item.league === "cfb").length,
    ufc: BAR_TRIVIA_QUESTION_BANK.filter((item) => item.league === "ufc").length,
  }), []);

  function selectLeague(nextLeague: BarTriviaLeague) {
    setLeague(nextLeague);
    setScene("intro");
  }

  function startGame() {
    if (!league) return;
    const nextRun = buildRun(league);
    rememberQuestionIds(league, nextRun.map((item) => item.id));
    setRun(nextRun);
    setState(createBarTriviaState(pickBarTriviaDoubleRound()));
    setLastResult(null);
    setWagerDraft(BAR_TRIVIA_MAX_WAGER);
    setScene("round-intro");
  }

  function answer(choice: string) {
    if (!question || lastResult) return;
    const transition = submitBarTriviaAnswer(run, state, choice);
    setState(transition.state);
    setLastResult(transition.result);
  }

  function advance() {
    if (!lastResult) return;
    setLastResult(null);

    if (state.complete) {
      setScene("result");
      return;
    }
    if (state.index === 9) {
      setScene("wager");
      return;
    }
    if (state.index === 3 || state.index === 6) {
      setScene("round-intro");
      return;
    }
    setScene("question");
  }

  function lockWager() {
    setState((current) => setBarTriviaWager(current, wagerDraft));
    setLastResult(null);
    setScene("question");
  }

  function playAgain() {
    startGame();
  }

  function changeLeague() {
    setLeague(null);
    setRun([]);
    setState(createBarTriviaState());
    setLastResult(null);
    setScene("league");
  }

  return (
    <main className="bar-trivia" data-league={league ?? scope}>
      <div className="bar-trivia__ambient" aria-hidden="true" />
      <button className="bar-trivia__back" type="button" onClick={() => navigate(backRoute)}>
        ‹ {scope === "ufc" ? "UFC HQ" : "FOOTBALL HQ"}
      </button>

      {scene === "league" ? (
        <section className="bar-trivia__panel bar-trivia__league" aria-labelledby="bar-trivia-league-title">
          <p className="bar-trivia__kicker">TONIGHT'S GAME</p>
          <h1 id="bar-trivia-league-title">BAR TRIVIA</h1>
          <p>Pick a room. NFL and college stay completely separate.</p>
          <div className="bar-trivia__league-grid">
            <button type="button" onClick={() => selectLeague("nfl")}>
              <span>PRO FOOTBALL</span>
              <strong>NFL</strong>
              <small>{availableCounts.nfl} QUESTIONS IN THE BANK</small>
            </button>
            <button type="button" onClick={() => selectLeague("cfb")}>
              <span>SATURDAY FOOTBALL</span>
              <strong>CFB</strong>
              <small>{availableCounts.cfb} QUESTIONS IN THE BANK</small>
            </button>
          </div>
        </section>
      ) : null}

      {scene === "intro" && league ? (
        <section className="bar-trivia__panel bar-trivia__intro" aria-labelledby="bar-trivia-title">
          <div className="bar-trivia__sign">
            <span>OCTAGON HQ PRESENTS</span>
            <h1 id="bar-trivia-title">BAR TRIVIA</h1>
            <b>{leagueLabel(league)}</b>
          </div>

          <div className="bar-trivia__round-list">
            <div><span>ROUND 1</span><strong>{BAR_TRIVIA_ROUND_NAMES[league].round1}</strong><small>10 BASE</small></div>
            <div><span>ROUND 2</span><strong>{BAR_TRIVIA_ROUND_NAMES[league].round2}</strong><small>12 BASE</small></div>
            <div><span>ROUND 3</span><strong>{BAR_TRIVIA_ROUND_NAMES[league].round3}</strong><small>14 BASE</small></div>
            <div className="is-last-call"><span>FINAL</span><strong>Last Call</strong><small>16 + WAGER</small></div>
          </div>

          <div className="bar-trivia__rules">
            <p><b>Round values climb.</b> One of the first three rounds will be the <b>Double Round</b>.</p>
            <p><b>Streak heat:</b> the longer your streak, the higher your multiplier.</p>
            <p><b>Last Call:</b> your 0–10 wager sits on top of the final question — win it or lose it.</p>
          </div>

          <button className="bar-trivia__primary" type="button" onClick={startGame}>
            PULL UP A STOOL
          </button>
          {scope === "football" ? (
            <button className="bar-trivia__text-button" type="button" onClick={changeLeague}>
              CHANGE LEAGUE
            </button>
          ) : null}
        </section>
      ) : null}

      {scene === "round-intro" && league ? (
        <section className="bar-trivia__panel bar-trivia__round-intro" aria-labelledby="bar-trivia-round-title">
          <span className="bar-trivia__round-number">ROUND {currentRoundNumber}</span>
          {currentRoundIsDouble ? <div className="bar-trivia__double-banner">DOUBLE ROUND · 2× BASE</div> : null}
          <h1 id="bar-trivia-round-title">{roundName}</h1>
          <p>{roundDeckCopy(league, state.index)}</p>
          <div className="bar-trivia__round-value">
            <span>BASE VALUE</span>
            <strong>{currentBase}{currentRoundIsDouble ? " × 2" : ""}</strong>
          </div>
          <div className="bar-trivia__scoreboard-mini">
            <span>SCORE</span>
            <strong>{scoreLabel}</strong>
          </div>
          <button className="bar-trivia__primary" type="button" onClick={() => setScene("question")}>
            START ROUND {currentRoundNumber}
          </button>
        </section>
      ) : null}

      {scene === "wager" && league ? (
        <section className="bar-trivia__panel bar-trivia__wager" aria-labelledby="bar-trivia-wager-title">
          <p className="bar-trivia__kicker">LAST CALL</p>
          <h1 id="bar-trivia-wager-title">PUT SOMETHING ON IT.</h1>
          <p>Your tab is <b>{scoreLabel}</b>. Last Call still carries its <b>16-point base</b>; your wager is extra.</p>
          <div className="bar-trivia__wager-value">
            <strong>{wagerDraft}</strong>
            <span>POINT{wagerDraft === 1 ? "" : "S"}</span>
          </div>
          <input
            aria-label="Last Call wager"
            type="range"
            min="0"
            max={BAR_TRIVIA_MAX_WAGER}
            step="1"
            value={wagerDraft}
            onChange={(event) => setWagerDraft(Number(event.target.value))}
          />
          <div className="bar-trivia__wager-scale"><span>0</span><span>ON TOP OF THE BASE</span><span>10</span></div>
          <div className="bar-trivia__wager-note">
            <b>RIGHT:</b> earn the question + wager. <b>WRONG:</b> lose the wager.
          </div>
          <button className="bar-trivia__primary" type="button" onClick={lockWager}>
            LOCK WAGER · {wagerDraft}
          </button>
        </section>
      ) : null}

      {scene === "question" && league && question ? (
        <section
          className="bar-trivia__game bar-trivia__venue"
          data-league={league}
          data-double={displayedRoundIsDouble ? "true" : "false"}
          aria-live="polite"
        >
          <header className="bar-trivia__hud">
            <div>
              <span>{question.round === "last-call" ? "LAST CALL" : `ROUND ${barTriviaRoundNumber(question.round)}`}</span>
              <strong>{question.round === "last-call" ? "FINAL QUESTION" : `QUESTION ${displayedRoundQuestionNumber} OF 3`}</strong>
            </div>
            <div>
              <span>SCORE</span>
              <strong>{scoreLabel}</strong>
            </div>
          </header>

          <div className="bar-trivia__streak" data-streak={activeStreak}>
            <div className="bar-trivia__streak-bulbs" aria-hidden="true">
              {Array.from({ length: 7 }, (_, index) => (
                <span key={index} className={index < Math.min(activeStreak, 7) ? "is-hot" : ""} />
              ))}
            </div>
            <strong>{streakCopy(activeStreak)}</strong>
          </div>

          <article className={lastResult ? "bar-trivia__question-card is-reveal" : "bar-trivia__question-card"}>
            <h2>{question.prompt}</h2>

            <div className="bar-trivia__answers">
              {question.choices.map((choice, index) => {
                const correct = Boolean(lastResult && choice === question.answer);
                const wrong = Boolean(lastResult && choice === lastResult.choice && !lastResult.correct);
                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={Boolean(lastResult)}
                    className={[correct ? "is-correct" : "", wrong ? "is-wrong" : ""].filter(Boolean).join(" ")}
                    onClick={() => answer(choice)}
                  >
                    <b>{choiceLetter(index)}</b>
                    <span>{choice}</span>
                  </button>
                );
              })}
            </div>

            {lastResult ? (
              <div className={lastResult.correct ? "bar-trivia__reveal is-correct" : "bar-trivia__reveal is-wrong"}>
                <div className="bar-trivia__reveal-heading">
                  <span>{lastResult.correct ? "THAT'S RIGHT" : "NOT TONIGHT"}</span>
                  <strong>
                    {lastResult.points > 0 ? "+" : ""}{lastResult.points} SCORE
                  </strong>
                </div>
                <div className="bar-trivia__reveal-math">
                  {lastResult.correct ? (
                    <>
                      <span>{lastResult.basePoints} base</span>
                      {lastResult.doubleRoundBonus > 0 ? <span>+{formatRaw(lastResult.doubleRoundBonus)} double</span> : null}
                      {lastResult.streakBonus > 0 ? <span>+{formatRaw(lastResult.streakBonus)} streak</span> : null}
                      {lastResult.wagerDelta > 0 ? <span>+{formatRaw(lastResult.wagerDelta)} wager</span> : null}
                    </>
                  ) : lastResult.wagerDelta < 0 ? (
                    <span>{formatRaw(lastResult.wagerDelta)} wager</span>
                  ) : (
                    <span>0 points</span>
                  )}
                </div>
                <p>{question.explanation}</p>
                <button className="bar-trivia__primary" type="button" onClick={advance}>
                  {state.complete ? "CLOSE THE TAB" : state.index === 9 ? "LAST CALL →" : state.index === 3 || state.index === 6 ? "NEXT ROUND →" : "NEXT QUESTION →"}
                </button>
              </div>
            ) : null}
          </article>
        </section>
      ) : null}

      {scene === "result" && league ? (
        <section className="bar-trivia__panel bar-trivia__result" aria-labelledby="bar-trivia-result-title">
          <p className="bar-trivia__kicker">TAB CLOSED · {leagueLabel(league)}</p>
          <div className="bar-trivia__receipt">
            <span>FINAL SCORE</span>
            <h1 id="bar-trivia-result-title">{state.score}<small>/100</small></h1>

            <div className="bar-trivia__receipt-summary">
              <p><span>CORRECT</span><b>{state.correctCount}/10</b></p>
              <p><span>BEST STREAK</span><b>{state.bestStreak}</b></p>
            </div>

            <div className="bar-trivia__receipt-breakdown">
              <small>SCORING</small>
              <p><span>DOUBLE ROUND</span><b>+{formatRaw(scoring.doubleRoundBonus)}</b></p>
              <p><span>STREAK HEAT</span><b>+{formatRaw(scoring.streakBonus)}</b></p>
              <p>
                <span>LAST CALL</span>
                <b>{scoring.wagerDelta > 0 ? "+" : ""}{formatRaw(scoring.wagerDelta)}</b>
              </p>
            </div>
          </div>

          <button className="bar-trivia__primary" type="button" onClick={playAgain}>RUN IT BACK</button>
          {scope === "football" ? (
            <button className="bar-trivia__secondary" type="button" onClick={changeLeague}>CHANGE LEAGUE</button>
          ) : null}
          <button className="bar-trivia__text-button" type="button" onClick={() => navigate(backRoute)}>BACK TO GAMES</button>
          <small className="bar-trivia__owner-note">Owner-only Casual preview. No Daily result, streak, or leaderboard write.</small>
        </section>
      ) : null}
    </main>
  );
}
