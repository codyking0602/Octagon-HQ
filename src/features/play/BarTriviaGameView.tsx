import type { ReactNode } from "react";
import {
  BAR_TRIVIA_BASE_POINTS,
  BAR_TRIVIA_MAX_WAGER,
  BAR_TRIVIA_ROUND_NAMES,
  barTriviaRoundForQuestion,
  barTriviaRoundNumber,
  barTriviaScoreBreakdown,
  type BarTriviaAnswerResult,
  type BarTriviaLeague,
  type BarTriviaQuestion,
  type BarTriviaState,
} from "../games/barTriviaEngine";
import "./BarTriviaCasualPage.css";

export type BarTriviaScope = "football" | "ufc" | "mlb";
export type BarTriviaScene = "league" | "intro" | "round-intro" | "question" | "wager" | "result";
export type BarTriviaDisplayQuestion = Omit<BarTriviaQuestion, "answer" | "explanation"> & {
  answer?: string;
  explanation?: string;
};

function leagueLabel(league: BarTriviaLeague) {
  if (league === "nfl") return "NFL";
  if (league === "cfb") return "COLLEGE FOOTBALL";
  if (league === "mlb") return "MLB";
  return "UFC";
}

function roundDeckCopy(league: BarTriviaLeague, index: number) {
  if (index === 0) {
    if (league === "ufc") {
      return "Start broad. Fighters, moments, and the stuff every fight fan should know.";
    }
    if (league === "mlb") {
      return "Start very broad. Famous players, nicknames, and baseball facts everyone should have a shot at.";
    }
    return "Start broad. Teams, traditions, and the stuff every football fan should know.";
  }
  if (index === 3) {
    return league === "mlb"
      ? "Still accessible, but now you need the famous records, numbers, and baseball history."
      : "The obvious stuff is gone. Time for traditions, oddities, nicknames, and history.";
  }
  return league === "mlb"
    ? "The baseball bar finally gets tougher. Three real calls before Last Call."
    : "Three tougher calls before Last Call.";
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

export function BarTriviaGameView({
  scope,
  league,
  scene,
  state,
  question,
  lastResult,
  selectedChoice = null,
  wagerDraft,
  availableCounts = { nfl: 0, cfb: 0, ufc: 0, mlb: 0 },
  onBack,
  onSelectLeague,
  onStart,
  onShowQuestions,
  onAnswer,
  onAdvance,
  onWagerChange,
  onLockWager,
  onPlayAgain,
  onChangeLeague,
  resultActions,
  ownerNote,
  busy = false,
}: {
  scope: BarTriviaScope;
  league: BarTriviaLeague | null;
  scene: BarTriviaScene;
  state: BarTriviaState;
  question: BarTriviaDisplayQuestion | null;
  lastResult: BarTriviaAnswerResult | null;
  selectedChoice?: string | null;
  wagerDraft: number;
  availableCounts?: Record<BarTriviaLeague, number>;
  onBack: () => void;
  onSelectLeague?: (league: BarTriviaLeague) => void;
  onStart: () => void;
  onShowQuestions: () => void;
  onAnswer: (choice: string) => void;
  onAdvance: () => void;
  onWagerChange: (wager: number) => void;
  onLockWager: () => void;
  onPlayAgain?: () => void;
  onChangeLeague?: () => void;
  resultActions?: ReactNode;
  ownerNote?: string | null;
  busy?: boolean;
}) {
  const displayedIndex = lastResult ? Math.max(0, state.index - 1) : state.index;
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

  return (
    <main className="bar-trivia" data-league={league ?? scope}>
      <div className="bar-trivia__ambient" aria-hidden="true" />
      <button className="bar-trivia__back" type="button" onClick={onBack}>
        ‹ {scope === "ufc" ? "UFC HQ" : scope === "mlb" ? "MLB PLAY" : "FOOTBALL HQ"}
      </button>

      {scene === "league" ? (
        <section className="bar-trivia__panel bar-trivia__league" aria-labelledby="bar-trivia-league-title">
          <p className="bar-trivia__kicker">TONIGHT'S GAME</p>
          <h1 id="bar-trivia-league-title">BAR TRIVIA</h1>
          <p>Pick a room. NFL and college stay completely separate.</p>
          <div className="bar-trivia__league-grid">
            <button type="button" onClick={() => onSelectLeague?.("nfl")}>
              <span>PRO FOOTBALL</span>
              <strong>NFL</strong>
              <small>{availableCounts.nfl} QUESTIONS IN THE BANK</small>
            </button>
            <button type="button" onClick={() => onSelectLeague?.("cfb")}>
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

          <button className="bar-trivia__primary" type="button" onClick={onStart} disabled={busy}>
            PULL UP A STOOL
          </button>
          {scope === "football" && onChangeLeague ? (
            <button className="bar-trivia__text-button" type="button" onClick={onChangeLeague}>
              CHANGE LEAGUE
            </button>
          ) : null}
        </section>
      ) : null}

      {scene === "round-intro" && league ? (
        <section className="bar-trivia__panel bar-trivia__round-intro" aria-labelledby="bar-trivia-round-title">
          {currentRoundIsDouble ? (
            <div className="bar-trivia__double-takeover" role="status">
              <span>ROUND {currentRoundNumber} · THIS IS THE</span>
              <strong>DOUBLE ROUND</strong>
              <b>EVERY QUESTION IS WORTH 2× BASE POINTS</b>
            </div>
          ) : (
            <span className="bar-trivia__round-number">ROUND {currentRoundNumber}</span>
          )}
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
          <button className="bar-trivia__primary" type="button" onClick={onShowQuestions}>
            {currentRoundIsDouble ? "START DOUBLE ROUND · 2×" : `START ROUND ${currentRoundNumber}`}
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
            disabled={busy}
            onChange={(event) => onWagerChange(Number(event.target.value))}
          />
          <div className="bar-trivia__wager-scale"><span>0</span><span>ON TOP OF THE BASE</span><span>10</span></div>
          <div className="bar-trivia__wager-note">
            <b>RIGHT:</b> earn the question + wager. <b>WRONG:</b> lose the wager.
          </div>
          <button className="bar-trivia__primary" type="button" onClick={onLockWager} disabled={busy}>
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
              <span>
                {displayedRoundIsDouble
                  ? `2× DOUBLE ROUND · ROUND ${barTriviaRoundNumber(question.round)}`
                  : question.round === "last-call"
                    ? "LAST CALL"
                    : `ROUND ${barTriviaRoundNumber(question.round)}`}
              </span>
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
                const selected = Boolean(!lastResult && selectedChoice === choice);
                const correct = Boolean(lastResult && question.answer && choice === question.answer);
                const wrong = Boolean(lastResult && choice === lastResult.choice && !lastResult.correct);
                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={Boolean(lastResult) || busy || Boolean(selectedChoice)}
                    aria-pressed={selected}
                    className={[
                      selected ? "is-selected" : "",
                      correct ? "is-correct" : "",
                      wrong ? "is-wrong" : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => onAnswer(choice)}
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
                <p>{question.explanation ?? ""}</p>
                <button className="bar-trivia__primary" type="button" onClick={onAdvance}>
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

          {resultActions ?? (
            <>
              {onPlayAgain ? <button className="bar-trivia__primary" type="button" onClick={onPlayAgain}>RUN IT BACK</button> : null}
              {scope === "football" && onChangeLeague ? (
                <button className="bar-trivia__secondary" type="button" onClick={onChangeLeague}>CHANGE LEAGUE</button>
              ) : null}
              <button className="bar-trivia__text-button" type="button" onClick={onBack}>BACK TO GAMES</button>
            </>
          )}
          {ownerNote ? <small className="bar-trivia__owner-note">{ownerNote}</small> : null}
        </section>
      ) : null}
    </main>
  );
}
