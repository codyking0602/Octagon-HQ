import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { Navigate, useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import type { IdentityProfile } from "../identity/identityModel";
import {
  FAMILY_FEUD_FAST_MONEY_TIME_MS,
  FAMILY_FEUD_STRIKES_PER_BOARD,
  createFamilyFeudState,
  familyFeudScore,
  submitFamilyFeudFastMoneyAnswer,
  submitFamilyFeudMainAnswer,
  timeoutFamilyFeudFastMoney,
  type FamilyFeudOutcome,
  type FamilyFeudState,
} from "../games/familyFeudEngine";
import { familyFeudPrototypePack } from "./familyFeudPrototypePacks";
import "./FamilyFeudPrototypePage.css";

type PrototypeScope = "ufc" | "football";
type PrototypeScene = "intro" | "main" | "fast-intro" | "fast" | "reveal" | "result";

function formatClock(ms: number) {
  return `0:${String(Math.ceil(ms / 1000)).padStart(2, "0")}`;
}

function feedbackCopy(outcome: FamilyFeudOutcome | null) {
  if (!outcome) return "";
  switch (outcome.type) {
    case "board-correct": return `#${outcome.slotIndex + 1} — ${outcome.points} POINTS`;
    case "board-strike": return "STRIKE";
    case "ambiguous": return "BE MORE SPECIFIC";
    case "already-guessed": return "ALREADY GUESSED";
    case "fast-money-answer": return "LOCKED";
    case "fast-money-timeout": return "TIME";
  }
}

function StageLights() {
  return (
    <div className="feud-stage-lights" aria-hidden="true">
      {Array.from({ length: 22 }, (_, index) => <i key={index} />)}
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "feud-brand is-compact" : "feud-brand"} aria-label="Sports Feud">
      <span>SPORTS</span>
      <strong>FEUD</strong>
    </div>
  );
}

function StrikeRail({ strikes }: { strikes: number }) {
  return (
    <div className="feud-strikes" aria-label={`${strikes} of ${FAMILY_FEUD_STRIKES_PER_BOARD} strikes`}>
      {Array.from({ length: FAMILY_FEUD_STRIKES_PER_BOARD }, (_, index) => (
        <span className={index < strikes ? "is-on" : ""} key={index}>×</span>
      ))}
    </div>
  );
}

function HQBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="feud-back" type="button" onClick={onClick} aria-label="Exit Sports Feud">
      <span aria-hidden="true">‹</span>
      HQ
    </button>
  );
}

export function isFamilyFeudPrototypeOwner(profile: IdentityProfile | null) {
  return Boolean(
    profile?.canControlPicks
    && profile.displayName.trim().toUpperCase() === "CODY"
  );
}

function FamilyFeudPrototypeExperience({ scope }: { scope: PrototypeScope }) {
  const navigate = useNavigate();
  const pack = useMemo(() => familyFeudPrototypePack(scope), [scope]);
  const [state, setState] = useState<FamilyFeudState>(() => createFamilyFeudState());
  const [scene, setScene] = useState<PrototypeScene>("intro");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FamilyFeudOutcome | null>(null);
  const [displayBoardIndex, setDisplayBoardIndex] = useState(0);
  const [boardReview, setBoardReview] = useState(false);
  const [timeRemainingMs, setTimeRemainingMs] = useState(FAMILY_FEUD_FAST_MONEY_TIME_MS);
  const [revealCount, setRevealCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const deadlineRef = useRef(0);
  const timeoutQueuedRef = useRef(false);

  const exitRoute = scope === "football" ? "/football" : "/play";
  const otherScopeRoute = scope === "football" ? "/play/sports-feud" : "/football/sports-feud";
  const score = familyFeudScore(pack, state);

  useEffect(() => {
    document.body.classList.add("family-feud-prototype-active");
    return () => document.body.classList.remove("family-feud-prototype-active");
  }, []);

  useEffect(() => {
    if (scene !== "main" || boardReview) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [scene, displayBoardIndex, boardReview]);

  useEffect(() => {
    if (scene !== "fast") return undefined;
    timeoutQueuedRef.current = false;
    deadlineRef.current = performance.now() + state.fastMoneyTimeRemainingMs;
    setTimeRemainingMs(state.fastMoneyTimeRemainingMs);
    const interval = window.setInterval(() => {
      setTimeRemainingMs(Math.max(0, deadlineRef.current - performance.now()));
    }, 80);
    const focusId = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(focusId);
    };
  }, [scene]);

  useEffect(() => {
    if (scene !== "fast" || timeRemainingMs > 0 || timeoutQueuedRef.current) return;
    timeoutQueuedRef.current = true;
    const transition = timeoutFamilyFeudFastMoney(state);
    setState(transition.state);
    setFeedback(transition.outcome);
    setScene("reveal");
  }, [scene, state, timeRemainingMs]);

  useEffect(() => {
    if (scene !== "reveal") return undefined;
    setRevealCount(0);
    const interval = window.setInterval(() => {
      setRevealCount((current) => {
        if (current >= 5) {
          window.clearInterval(interval);
          return current;
        }
        return current + 1;
      });
    }, 620);
    return () => window.clearInterval(interval);
  }, [scene]);

  function startGame() {
    setState(createFamilyFeudState());
    setDisplayBoardIndex(0);
    setBoardReview(false);
    setAnswer("");
    setFeedback(null);
    setTimeRemainingMs(FAMILY_FEUD_FAST_MONEY_TIME_MS);
    setRevealCount(0);
    setScene("main");
  }

  function submitMain(event: FormEvent) {
    event.preventDefault();
    if (!answer.trim() || boardReview) return;
    const activeBoardIndex = displayBoardIndex;
    const transition = submitFamilyFeudMainAnswer(pack, state, answer);
    setState(transition.state);
    setFeedback(transition.outcome);

    if (transition.outcome.type !== "ambiguous") setAnswer("");

    const settledBoard = transition.state.mainBoards[activeBoardIndex]!;
    const settled = settledBoard.revealedEntityIds.length >= 6
      || settledBoard.strikes >= FAMILY_FEUD_STRIKES_PER_BOARD;
    if (settled) setBoardReview(true);
  }

  function advanceBoard() {
    setFeedback(null);
    setAnswer("");
    setBoardReview(false);
    if (state.phase === "fast-money") {
      setScene("fast-intro");
      return;
    }
    setDisplayBoardIndex(state.mainBoardIndex);
  }

  function startFastMoney() {
    timeoutQueuedRef.current = false;
    setFeedback(null);
    setAnswer("");
    setTimeRemainingMs(state.fastMoneyTimeRemainingMs);
    setScene("fast");
  }

  function submitFastMoney(event: FormEvent) {
    event.preventDefault();
    if (!answer.trim() || scene !== "fast") return;
    const transition = submitFamilyFeudFastMoneyAnswer(
      pack,
      state,
      answer,
      Math.floor(timeRemainingMs),
    );
    setState(transition.state);
    setFeedback(transition.outcome);

    if (transition.outcome.type === "ambiguous") {
      window.setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    setAnswer("");
    if (transition.state.phase === "complete") {
      setScene("reveal");
      return;
    }
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  const mainQuestion = pack.mainBoards[displayBoardIndex]!;
  const mainBoardState = state.mainBoards[displayBoardIndex]!;
  const currentFastQuestion = state.phase === "fast-money"
    ? pack.fastMoney[state.fastMoneyIndex] ?? null
    : null;

  const fastRevealRows = pack.fastMoney.map((question, index) => {
    const result = state.fastMoneyResults[index];
    const entity = result?.entityId
      ? pack.entities.find((candidate) => candidate.id === result.entityId)
      : null;
    return {
      prompt: question.prompt,
      answer: entity?.displayName ?? result?.submittedText ?? "NO ANSWER",
      points: result?.points ?? 0,
    };
  });
  const revealedFastTotal = fastRevealRows
    .slice(0, revealCount)
    .reduce((total, row) => total + row.points, 0);

  const view = (
    <main className={`family-feud-prototype feud-scene--${scene}`} data-scope={scope} data-scene={scene}>
      <StageLights />
      <HQBackButton onClick={() => navigate(exitRoute)} />

      {scene === "intro" ? (
        <section className="feud-intro" aria-labelledby="feud-intro-title">
          <div className="feud-intro__eyebrow">{scope === "football" ? "FOOTBALL HQ" : "UFC HQ"} · PLAYABLE PROTOTYPE</div>
          <Brand />
          <h1 id="feud-intro-title">Can you clear the board?</h1>
          <p>Two boards. Three strikes each. Then 30 seconds of Fast Money.</p>
          <div className="feud-intro__rules">
            <span><b>2</b> BOARDS</span>
            <span><b>6</b> ANSWERS EACH</span>
            <span><b>0:30</b> FAST MONEY</span>
          </div>
          <button className="feud-primary-button" type="button" onClick={startGame}>START FEUD</button>
          <button className="feud-scope-switch" type="button" onClick={() => navigate(otherScopeRoute)}>
            TRY {scope === "football" ? "UFC" : "FOOTBALL"} VERSION
          </button>
          <small>Prototype content is fixed so the viewing experience can be tested before Daily integration.</small>
        </section>
      ) : null}

      {scene === "main" ? (
        <section className="feud-main-stage" aria-label={`Round ${displayBoardIndex + 1}`}>
          <header className="feud-main-stage__top">
            <Brand compact />
            <StrikeRail strikes={mainBoardState.strikes} />
          </header>

          <section className="feud-question-card">
            <span>ROUND {displayBoardIndex + 1}</span>
            <h1>{mainQuestion.prompt}</h1>
          </section>

          <section className={boardReview ? "feud-answer-board is-review" : "feud-answer-board"}>
            {mainQuestion.answers.map((rankedAnswer, index) => {
              const found = mainBoardState.revealedEntityIds.includes(rankedAnswer.entityId);
              const visible = found || boardReview;
              const entity = pack.entities.find((candidate) => candidate.id === rankedAnswer.entityId)!;
              return (
                <div
                  className={[
                    "feud-answer-slot",
                    visible ? "is-revealed" : "",
                    boardReview && !found ? "is-missed" : "",
                  ].filter(Boolean).join(" ")}
                  key={rankedAnswer.entityId}
                >
                  <b>{index + 1}</b>
                  <strong>{visible ? entity.displayName : ""}</strong>
                  <span>{visible ? rankedAnswer.points : ""}</span>
                </div>
              );
            })}
          </section>

          <div className="feud-main-score">
            <span>BOARD POINTS</span>
            <strong>{score.main}</strong>
          </div>

          {boardReview ? (
            <section className="feud-round-review">
              <strong>
                {mainBoardState.revealedEntityIds.length === 6 ? "BOARD CLEARED" : "ROUND COMPLETE"}
              </strong>
              <button className="feud-primary-button" type="button" onClick={advanceBoard}>
                {state.phase === "fast-money" ? "GO TO FAST MONEY" : "ROUND 2"}
              </button>
            </section>
          ) : (
            <form className="feud-answer-entry" onSubmit={submitMain}>
              <div className="feud-feedback" data-kind={feedback?.type ?? "idle"}>
                {feedbackCopy(feedback) || "TYPE AN ANSWER — SPELLING IS FORGIVEN"}
              </div>
              <div className="feud-answer-entry__row">
                <input
                  ref={inputRef}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Type your answer"
                  autoCapitalize="words"
                  autoCorrect="off"
                  enterKeyHint="send"
                  aria-label="Your answer"
                />
                <button type="submit" aria-label="Submit answer">↑</button>
              </div>
            </form>
          )}
        </section>
      ) : null}

      {scene === "fast-intro" ? (
        <section className="feud-fast-intro">
          <Brand compact />
          <span className="feud-fast-intro__kicker">YOU MADE THE FINALE</span>
          <h1>FAST MONEY</h1>
          <div className="feud-fast-intro__clock">0:30</div>
          <p>Five prompts. One answer each. The clock starts when you tap below.</p>
          <button className="feud-primary-button" type="button" onClick={startFastMoney}>START 30 SECONDS</button>
        </section>
      ) : null}

      {scene === "fast" ? (
        <section className="feud-fast-stage">
          <header>
            <Brand compact />
            <div className={timeRemainingMs <= 10_000 ? "feud-fast-clock is-low" : "feud-fast-clock"}>
              {formatClock(timeRemainingMs)}
            </div>
            <span>{state.fastMoneyIndex + 1} OF 5</span>
          </header>

          <section className="feud-fast-question">
            <small>FAST MONEY</small>
            <h1>{currentFastQuestion?.prompt}</h1>
          </section>

          <form className="feud-fast-entry" onSubmit={submitFastMoney}>
            <div className="feud-feedback" data-kind={feedback?.type ?? "idle"}>
              {feedbackCopy(feedback) || "ONE ANSWER — KEEP MOVING"}
            </div>
            <input
              ref={inputRef}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Type your answer"
              autoCapitalize="words"
              autoCorrect="off"
              enterKeyHint="send"
              aria-label="Fast Money answer"
            />
            <button type="submit">SUBMIT</button>
          </form>

          <div className="feud-fast-progress" aria-label="Fast Money progress">
            {Array.from({ length: 5 }, (_, index) => (
              <span className={index < state.fastMoneyIndex ? "is-locked" : index === state.fastMoneyIndex ? "is-current" : ""} key={index}>
                <b>{index + 1}</b>
                <i>{index < state.fastMoneyIndex ? "LOCKED" : ""}</i>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {scene === "reveal" ? (
        <section className="feud-reveal-stage">
          <header>
            <Brand compact />
            <span>FAST MONEY RESULTS</span>
          </header>
          <section className="feud-reveal-board">
            {fastRevealRows.map((row, index) => (
              <div className={index < revealCount ? "is-revealed" : ""} key={index}>
                <b>{index + 1}</b>
                <strong>{index < revealCount ? row.answer : "—"}</strong>
                <span>{index < revealCount ? row.points : ""}</span>
              </div>
            ))}
          </section>
          <div className="feud-reveal-total">
            <span>TOTAL</span>
            <strong>{revealedFastTotal}</strong>
          </div>
          {revealCount >= 5 ? (
            <button className="feud-primary-button" type="button" onClick={() => setScene("result")}>VIEW HQ SCORE</button>
          ) : (
            <p className="feud-reveal-stage__wait">SURVEY BOARD REVEALING…</p>
          )}
        </section>
      ) : null}

      {scene === "result" ? (
        <section className="feud-result">
          <Brand compact />
          <span className="feud-result__eyebrow">FINAL RESULT</span>
          <div className="feud-result__score">
            <strong>{score.hq}</strong>
            <span>/100</span>
          </div>
          <h1>{score.hq >= 90 ? "DOMINANT BOARD" : score.hq >= 80 ? "GREAT RUN" : score.hq >= 65 ? "SOLID RUN" : "TOUGH BOARD"}</h1>
          <div className="feud-result__breakdown">
            <p><span>MAIN BOARDS</span><strong>{score.main}/200</strong></p>
            <p><span>FAST MONEY</span><strong>{score.fastMoney}/200</strong></p>
            <p><span>RAW FEUD POINTS</span><strong>{score.raw}/400</strong></p>
          </div>
          <button className="feud-primary-button" type="button" onClick={startGame}>PLAY AGAIN</button>
          <button className="feud-secondary-button" type="button" onClick={() => navigate(exitRoute)}>EXIT TO HQ</button>
        </section>
      ) : null}
    </main>
  );

  return createPortal(view, document.body);
}

export default function FamilyFeudPrototypePage({ scope }: { scope: PrototypeScope }) {
  const identity = useIdentity();
  const exitRoute = scope === "football" ? "/football" : "/play";

  if (!identity.ready) return null;
  if (!isFamilyFeudPrototypeOwner(identity.profile)) {
    return <Navigate to={exitRoute} replace />;
  }

  return <FamilyFeudPrototypeExperience scope={scope} />;
}
