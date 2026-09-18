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
  const stagePlate = league === "ufc"
    ? "/assets/millionaire/ufc-final-host-plate.png"
    : "/assets/millionaire/millionaire-locked-reference.png";
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
    <div className={`millionaire-shell millionaire-shell--game millionaire-shell--${league} millionaire-shell--${level.toLowerCase()} millionaire-shell--${phase}`}>
      <img className="millionaire-locked-stage" src={stagePlate} alt="" aria-hidden="true" />
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
