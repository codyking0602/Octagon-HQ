import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Navigate, useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { MILLIONAIRE_LEVELS, type MillionaireChoiceId } from "../games/millionaireAuthority";
import {
  advanceMillionaireRuntime,
  createMillionaireState,
  currentMillionaireQuestion,
  millionaireCanWalkAway,
  type MillionaireLifeline,
  type MillionaireState,
  type MillionaireTransitionResult,
} from "../games/millionaireEngine";
import {
  MILLIONAIRE_ANSWER_REVEAL_HOLD_MS,
  MILLIONAIRE_BASE_PTS,
  MILLIONAIRE_DOUBLE_DIP_MISS_MS,
  MILLIONAIRE_REVEAL_DELAY_MS,
  MILLIONAIRE_TIME_BANK_MS,
  millionaireCasualRun,
  millionaireLeagueLabel,
  millionaireMoneyLabel,
  millionaireTimeLabel,
  millionaireTimeoutTransition,
  type MillionaireLeague,
} from "./MillionaireCasualModel";
import "./MillionaireCasualPage.css";
import "./MillionaireCasualPolish.css";
import "./MillionairePortrait.css";
import "./MillionairePortraitRefine.css";

type MillionaireCasualPageProps = { scope: "ufc" | "football" };
type PlayPhase = "answering" | "locked" | "revealed" | "settled";
type RevealState = { result: MillionaireTransitionResult; selectedChoiceId: MillionaireChoiceId | null } | null;

const lifelines: readonly { id: MillionaireLifeline; label: string; icon: string }[] = [
  { id: "fifty-fifty", label: "50:50", icon: "50:50" },
  { id: "stat-sheet", label: "STAT SHEET", icon: "▥" },
  { id: "double-dip", label: "DOUBLE DIP", icon: "↝" },
];

function HQMark({ onClick }: { onClick: () => void }) {
  return (
    <button className="millionaire-hq" type="button" onClick={onClick} aria-label="Back to games">
      <span aria-hidden="true" className="millionaire-hq__mark">⬡</span>
      <strong>THE HQ</strong>
    </button>
  );
}

function StudioBackdrop() {
  return (
    <>
      <div className="millionaire-arena" aria-hidden="true">
        <i className="millionaire-beam millionaire-beam--one" />
        <i className="millionaire-beam millionaire-beam--two" />
        <i className="millionaire-beam millionaire-beam--three" />
      </div>
      <div className="millionaire-crowd" aria-hidden="true" />
    </>
  );
}

function LeagueChooser({ onChoose, onBack }: { onChoose: (league: "nfl" | "cfb") => void; onBack: () => void }) {
  return (
    <div className="millionaire-shell millionaire-shell--chooser">
      <StudioBackdrop />
      <HQMark onClick={onBack} />
      <section className="millionaire-league-chooser" aria-labelledby="millionaire-league-title">
        <p>FOOTBALL DAILY</p>
        <h1 id="millionaire-league-title">MILLIONAIRE</h1>
        <span>Choose your game</span>
        <div>
          <button type="button" onClick={() => onChoose("nfl")}><strong>NFL</strong><small>Pro Football</small></button>
          <button type="button" onClick={() => onChoose("cfb")}><strong>CFB</strong><small>College Football</small></button>
        </div>
      </section>
    </div>
  );
}

function MillionaireRulesIntro({ league, onStart, onBack }: { league: MillionaireLeague; onStart: () => void; onBack: () => void }) {
  const run = useMemo(() => millionaireCasualRun(league), [league]);

  return (
    <div className="millionaire-shell millionaire-shell--rules">
      <StudioBackdrop />
      <HQMark onClick={onBack} />
      <section className="millionaire-rules" aria-labelledby="millionaire-rules-title">
        <header>
          <span>{millionaireLeagueLabel(league)} DAILY</span>
          <h1 id="millionaire-rules-title">MILLIONAIRE</h1>
          <p>8 questions. $500 to $1,000,000.</p>
        </header>

        <div className="millionaire-rules__body">
          <section className="millionaire-rules__ladder" aria-label="Money and points ladder">
            {MILLIONAIRE_LEVELS.slice().reverse().map((level, reverseIndex) => {
              const index = 7 - reverseIndex;
              const checkpoint = level === "Q3" || level === "Q6";
              return (
                <div key={level} className={checkpoint ? "is-checkpoint" : ""}>
                  <b>{index + 1}</b>
                  <strong>{millionaireMoneyLabel(run[index]!.money)}</strong>
                  <span>{MILLIONAIRE_BASE_PTS[level]} PTS</span>
                  {checkpoint ? <small>CHECKPOINT</small> : null}
                </div>
              );
            })}
          </section>

          <section className="millionaire-rules__how" aria-label="How to play">
            <h2>HOW TO PLAY</h2>
            <div className="millionaire-rules__quick">
              <p><strong>2:30 TIME BANK</strong><span>Shared across all 8. Time only breaks leaderboard ties.</span></p>
              <p><strong>$5,000 CHECKPOINT</strong><span>Clear Q3. Miss Q4–Q6: leave with $5,000.</span></p>
              <p><strong>$100,000 CHECKPOINT</strong><span>Clear Q6. Miss Q7–Q8: leave with $100,000.</span></p>
              <p><strong>WALK AWAY</strong><span>Before Q7/Q8, take your money or keep playing.</span></p>
            </div>
            <h3>LIFELINES</h3>
            <div className="millionaire-rules__lifelines">
              <p><b>50:50</b><span>Remove 2 wrong answers.</span></p>
              <p><b>STAT SHEET</b><span>Extra clue.</span></p>
              <p><b>DOUBLE DIP</b><span>2 attempts; no walk-away.</span></p>
            </div>
            <small>Each lifeline can be used once and costs 2 PTS. No lifelines on Q8. 50:50 and Double Dip cannot be used on the same question.</small>
          </section>
        </div>

        <button className="millionaire-rules__start" type="button" onClick={onStart}>START GAME</button>
      </section>
    </div>
  );
}

function useFullscreenGameChrome() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);
}

function MillionaireGame({ league, onBack, onChangeLeague }: { league: MillionaireLeague; onBack: () => void; onChangeLeague?: () => void }) {
  const run = useMemo(() => millionaireCasualRun(league), [league]);
  const [gameState, setGameState] = useState<MillionaireState>(() => createMillionaireState(run));
  const [timeRemainingMs, setTimeRemainingMs] = useState(MILLIONAIRE_TIME_BANK_MS);
  const [phase, setPhase] = useState<PlayPhase>("answering");
  const [selectedChoiceId, setSelectedChoiceId] = useState<MillionaireChoiceId | null>(null);
  const [doubleDipFlashChoiceId, setDoubleDipFlashChoiceId] = useState<MillionaireChoiceId | null>(null);
  const [reveal, setReveal] = useState<RevealState>(null);
  const [statSheetOpen, setStatSheetOpen] = useState(false);
  const [statSheetText, setStatSheetText] = useState("");
  const [walkPromptOpen, setWalkPromptOpen] = useState(false);
  const timerIds = useRef<number[]>([]);
  const timeoutQueued = useRef(false);

  useFullscreenGameChrome();

  const currentQuestion = currentMillionaireQuestion(run, gameState);
  const level = currentQuestion?.level ?? MILLIONAIRE_LEVELS[Math.min(7, gameState.completedQuestions)]!;
  const levelNumber = gameState.currentQuestionIndex + 1;
  const q8 = level === "Q8";
  const usedLifelines = Object.values(gameState.lifelinesUsed).filter(Boolean).length;

  function schedule(callback: () => void, delay: number) {
    const id = window.setTimeout(() => {
      timerIds.current = timerIds.current.filter((value) => value !== id);
      callback();
    }, delay);
    timerIds.current.push(id);
  }

  useEffect(() => () => { timerIds.current.forEach((id) => window.clearTimeout(id)); }, []);

  useEffect(() => {
    if (phase !== "answering" || gameState.status !== "playing" || timeRemainingMs <= 0) return undefined;
    const startedAt = performance.now();
    const startingMs = timeRemainingMs;
    const interval = window.setInterval(() => {
      setTimeRemainingMs(Math.max(0, startingMs - (performance.now() - startedAt)));
    }, 100);
    return () => window.clearInterval(interval);
  }, [phase, gameState.status, gameState.currentQuestionIndex]);

  function settleAfterReveal(result: MillionaireTransitionResult) {
    setGameState(result.state);
    setReveal(null);
    setSelectedChoiceId(null);
    setDoubleDipFlashChoiceId(null);
    setStatSheetOpen(false);
    setStatSheetText("");
    timeoutQueued.current = false;
    if (result.state.status !== "playing") {
      setWalkPromptOpen(false);
      setPhase("settled");
      return;
    }
    setPhase("answering");
    setWalkPromptOpen(millionaireCanWalkAway(result.state));
  }

  function queueReveal(result: MillionaireTransitionResult, choiceId: MillionaireChoiceId | null, delay = MILLIONAIRE_REVEAL_DELAY_MS[level]) {
    setPhase("locked");
    setSelectedChoiceId(choiceId);
    schedule(() => {
      setReveal({ result, selectedChoiceId: choiceId });
      setPhase("revealed");
      schedule(() => settleAfterReveal(result), MILLIONAIRE_ANSWER_REVEAL_HOLD_MS);
    }, delay);
  }

  useEffect(() => {
    if (timeRemainingMs > 0 || phase !== "answering" || gameState.status !== "playing" || timeoutQueued.current) return;
    timeoutQueued.current = true;
    queueReveal(millionaireTimeoutTransition(run, gameState), null);
  }, [timeRemainingMs, phase, gameState, run]);

  function answer(choiceId: MillionaireChoiceId) {
    if (phase !== "answering" || gameState.status !== "playing" || walkPromptOpen || !currentQuestion) return;
    if (gameState.questionState.removedChoiceIds.includes(choiceId) || gameState.questionState.doubleDipWrongChoiceIds.includes(choiceId)) return;
    const result = advanceMillionaireRuntime(run, gameState, { type: "answer", choiceId });
    if (result.answerOutcome === "double-dip-continue") {
      setGameState(result.state);
      setDoubleDipFlashChoiceId(choiceId);
      schedule(() => setDoubleDipFlashChoiceId(null), MILLIONAIRE_DOUBLE_DIP_MISS_MS);
      return;
    }
    queueReveal(result, choiceId);
  }

  function useLifeline(lifeline: MillionaireLifeline) {
    if (phase !== "answering" || gameState.status !== "playing" || walkPromptOpen || q8) return;
    if (lifeline === "stat-sheet" && gameState.questionState.statSheetRevealed) return;
    const result = advanceMillionaireRuntime(run, gameState, { type: "use_lifeline", lifeline });
    setGameState(result.state);
    if (result.lifelineReveal?.type === "stat-sheet") {
      setStatSheetText(result.lifelineReveal.text);
      setStatSheetOpen(true);
    }
  }

  function walkAway() {
    if (!millionaireCanWalkAway(gameState) || phase !== "answering") return;
    const result = advanceMillionaireRuntime(run, gameState, { type: "walk_away" });
    setGameState(result.state);
    setWalkPromptOpen(false);
    setPhase("settled");
  }

  function restart() {
    timerIds.current.forEach((id) => window.clearTimeout(id));
    timerIds.current = [];
    timeoutQueued.current = false;
    setGameState(createMillionaireState(run));
    setTimeRemainingMs(MILLIONAIRE_TIME_BANK_MS);
    setPhase("answering");
    setSelectedChoiceId(null);
    setDoubleDipFlashChoiceId(null);
    setReveal(null);
    setStatSheetOpen(false);
    setStatSheetText("");
    setWalkPromptOpen(false);
  }

  const correctChoiceId = reveal?.result.questionReveal?.correctChoiceId ?? null;
  const answerOutcome = reveal?.result.answerOutcome ?? null;
  const explanation = reveal?.result.questionReveal?.explanation ?? "";
  const timerUrgency = timeRemainingMs <= 15_000 ? " is-critical" : timeRemainingMs <= 35_000 ? " is-low" : "";

  return (
    <div className="millionaire-shell millionaire-shell--game">
      <img className="millionaire-locked-stage" src="data:image/webp;base64,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" alt="" aria-hidden="true" />
      <StudioBackdrop />
      <HQMark onClick={onBack} />
      <header className="millionaire-title"><span>{millionaireLeagueLabel(league)} DAILY</span><strong>MILLIONAIRE</strong></header>
      <section className="millionaire-stakes" aria-label={`Question ${levelNumber} value`}><strong>{millionaireMoneyLabel(currentQuestion?.money ?? gameState.currentMoney)}</strong><span>{MILLIONAIRE_BASE_PTS[level]} PTS</span></section>
      <div className={`millionaire-clock${timerUrgency}`} aria-label={`${millionaireTimeLabel(timeRemainingMs)} remaining`}><div><strong>{millionaireTimeLabel(timeRemainingMs)}</strong><span>TIME BANK</span></div></div>

      <aside className="millionaire-lifelines" aria-label="Lifelines">
        {lifelines.map((lifeline) => {
          const usageKey = lifeline.id === "fifty-fifty" ? "fiftyFifty" : lifeline.id === "stat-sheet" ? "statSheet" : "doubleDip";
          const used = gameState.lifelinesUsed[usageKey];
          const incompatible = (lifeline.id === "fifty-fifty" && gameState.questionState.doubleDipActive) || (lifeline.id === "double-dip" && gameState.questionState.fiftyFiftyApplied);
          const activeDoubleDip = lifeline.id === "double-dip" && gameState.questionState.doubleDipActive;
          const disabled = q8 || used || incompatible || phase !== "answering" || walkPromptOpen;
          return (
            <button key={lifeline.id} type="button" className={`${used ? "is-spent" : ""}${activeDoubleDip ? " is-active" : ""}`} disabled={disabled} onClick={() => useLifeline(lifeline.id)} aria-label={lifeline.label}>
              <b>{lifeline.icon}</b><span>{activeDoubleDip ? "2 PICKS" : lifeline.label}</span>
            </button>
          );
        })}
      </aside>

      <aside className="millionaire-ladder" aria-label="Money ladder">
        {MILLIONAIRE_LEVELS.slice().reverse().map((ladderLevel, reverseIndex) => {
          const index = 7 - reverseIndex;
          const completed = index < gameState.completedQuestions;
          const current = index === gameState.currentQuestionIndex && gameState.status === "playing";
          const checkpoint = ladderLevel === "Q3" || ladderLevel === "Q6";
          return (
            <div key={ladderLevel} className={`${current ? "is-current" : ""}${completed ? " is-complete" : ""}${checkpoint ? " is-checkpoint" : ""}`}>
              <b>{index + 1}</b><strong>{millionaireMoneyLabel(run[index]!.money)}</strong><span>{MILLIONAIRE_BASE_PTS[ladderLevel]} PTS</span>{checkpoint ? <small>CHECKPOINT</small> : null}
            </div>
          );
        })}
      </aside>

      {statSheetOpen ? (
        <section className="millionaire-stat-sheet" aria-label="Stat Sheet">
          <button type="button" onClick={() => setStatSheetOpen(false)} aria-label="Close Stat Sheet">×</button><span>STAT SHEET</span><strong>{millionaireLeagueLabel(league)}</strong><p>{statSheetText}</p>
        </section>
      ) : null}

      {walkPromptOpen && currentQuestion ? (
        <section className="millionaire-decision" aria-label="Walk away decision">
          <span>WALK AWAY?</span><strong>You have {millionaireMoneyLabel(gameState.currentMoney)} guaranteed.</strong><p>Play for {millionaireMoneyLabel(currentQuestion.money)} or walk away now.</p>
          <div>
            <button type="button" className="is-play" onClick={() => setWalkPromptOpen(false)}><small>PLAY FOR</small><b>{millionaireMoneyLabel(currentQuestion.money)}</b><em>{MILLIONAIRE_BASE_PTS[currentQuestion.level]} PTS</em></button>
            <button type="button" onClick={walkAway}><small>WALK AWAY WITH</small><b>{millionaireMoneyLabel(gameState.currentMoney)}</b><em>{MILLIONAIRE_BASE_PTS[MILLIONAIRE_LEVELS[Math.max(0, gameState.completedQuestions - 1)]!]} PTS</em></button>
          </div>
        </section>
      ) : null}

      {phase === "settled" ? (
        <section className="millionaire-results" aria-live="polite">
          <span>{gameState.status === "won" ? "MILLIONAIRE" : "YOU LEAVE WITH"}</span><strong>{millionaireMoneyLabel(gameState.finalMoney ?? 0)}</strong>
          <div className="millionaire-results__score"><b>{gameState.score}</b><small>PTS</small></div>
          <dl><div><dt>Questions correct</dt><dd>{gameState.completedQuestions} / 8</dd></div><div><dt>Lifelines used</dt><dd>{usedLifelines}{usedLifelines ? ` (-${usedLifelines * 2})` : ""}</dd></div><div><dt>Time remaining</dt><dd>{millionaireTimeLabel(timeRemainingMs)}</dd></div></dl>
          <div className="millionaire-results__actions"><button type="button" className="is-primary" onClick={restart}>PLAY AGAIN</button>{onChangeLeague ? <button type="button" onClick={onChangeLeague}>CHANGE LEAGUE</button> : null}<button type="button" onClick={onBack}>BACK TO GAMES</button></div>
        </section>
      ) : (
        <>
          <section className={`millionaire-question${phase === "locked" ? " is-locked" : ""}`} aria-live="polite"><strong>{currentQuestion?.prompt}</strong>{phase === "revealed" && explanation ? <small>{explanation}</small> : null}</section>
          <div className="millionaire-answers" aria-label="Answer choices">
            {currentQuestion?.choices.map((choice) => {
              const removed = gameState.questionState.removedChoiceIds.includes(choice.id);
              const doubleDipSpent = gameState.questionState.doubleDipWrongChoiceIds.includes(choice.id);
              const selected = selectedChoiceId === choice.id;
              const correct = phase === "revealed" && choice.id === correctChoiceId;
              const wrong = (phase === "revealed" && selected && answerOutcome === "wrong" && choice.id !== correctChoiceId) || doubleDipFlashChoiceId === choice.id;
              const className = [removed ? "is-removed" : "", doubleDipSpent ? "is-double-dip-spent" : "", selected && phase === "locked" ? "is-selected" : "", correct ? "is-correct" : "", wrong ? "is-wrong" : ""].filter(Boolean).join(" ");
              return <button key={choice.id} type="button" className={className} disabled={phase !== "answering" || removed || doubleDipSpent || walkPromptOpen} onClick={() => answer(choice.id)}><b>{choice.id}</b><span>{choice.text}</span></button>;
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function MillionaireCasualPage({ scope }: MillionaireCasualPageProps) {
  const identity = useIdentity();
  const navigate = useNavigate();
  const [footballLeague, setFootballLeague] = useState<"nfl" | "cfb" | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const backRoute = scope === "ufc" ? "/play" : "/football";

  if (!identity.profile?.canControlPicks) return <Navigate to={backRoute} replace />;

  let content;
  if (scope === "football" && footballLeague === null) {
    content = <LeagueChooser onChoose={(league) => { setFootballLeague(league); setGameStarted(false); }} onBack={() => navigate(backRoute)} />;
  } else {
    const league: MillionaireLeague = scope === "ufc" ? "ufc" : footballLeague!;
    const introBack = scope === "football" ? () => setFootballLeague(null) : () => navigate(backRoute);
    const changeLeague = scope === "football" ? () => { setGameStarted(false); setFootballLeague(null); } : undefined;
    content = gameStarted
      ? <MillionaireGame key={league} league={league} onBack={() => navigate(backRoute)} onChangeLeague={changeLeague} />
      : <MillionaireRulesIntro league={league} onStart={() => setGameStarted(true)} onBack={introBack} />;
  }

  return createPortal(content, document.body);
}
