import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, FormEvent } from "react";
import { createPortal } from "react-dom";
import { Navigate, useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  FAMILY_FEUD_BOARD_ANSWER_COUNT,
  FAMILY_FEUD_FAST_MONEY_TIME_MS,
  FAMILY_FEUD_MAIN_ALSO_ACCEPTED_POINTS,
  FAMILY_FEUD_MAIN_BOARD_MAX,
  FAMILY_FEUD_MAIN_RAW_MAX,
  FAMILY_FEUD_FAST_MONEY_RAW_MAX,
  FAMILY_FEUD_STRIKES_PER_BOARD,
  createFamilyFeudState,
  familyFeudMainBoardScore,
  familyFeudScore,
  submitFamilyFeudFastMoneyAnswer,
  submitFamilyFeudMainAnswer,
  timeoutFamilyFeudFastMoney,
  type FamilyFeudOutcome,
  type FamilyFeudRankedAnswer,
  type FamilyFeudState,
  type FamilyFeudTransition,
} from "../games/familyFeudEngine";
import { isFamilyFeudPrototypeOwner } from "./familyFeudPrototypeAccess";
import { familyFeudPrototypePack } from "./familyFeudPrototypePacks";
import { buildSportsFeudPack } from "./sportsFeudDailyBanks";
import {
  SPORTS_FEUD_FAST_MONEY_STAGE_ASSET,
  SPORTS_FEUD_MAIN_STAGE_ASSET,
  sportsFeudHostAsset,
  type SportsFeudHostSport,
} from "./sportsFeudPresentation";
import "./FamilyFeudPrototypePage.css";
import "./SportsFeudRevealPass.css";

type PrototypeScope = "ufc" | "football";

interface FamilyFeudPrototypePageProps {
  scope: PrototypeScope;
  qaReplayDay?: string;
}

type PrototypeScene = "intro" | "main" | "fast-intro" | "fast" | "reveal" | "fast-recap" | "result";
type MainRevealPhase = "idle" | "suspense" | "correct" | "strike";
type FastRevealPhase = "answer" | "score" | "complete";

interface MainRevealState {
  phase: MainRevealPhase;
  transition: FamilyFeudTransition | null;
}

const MAIN_SUSPENSE_MS = 650;
const MAIN_REVEAL_HOLD_MS = 520;
const FAST_REVEAL_SUSPENSE_MS = 650;
const FAST_REVEAL_SCORE_HOLD_MS = 650;
const FAST_REVEAL_COMPLETE_HOLD_MS = 800;

function formatClock(ms: number) {
  return "0:" + String(Math.ceil(ms / 1000)).padStart(2, "0");
}

function feedbackCopy(outcome: FamilyFeudOutcome | null) {
  if (!outcome) return "";
  switch (outcome.type) {
    case "board-correct": return "+" + outcome.points + " HQ POINTS";
    case "board-strike": return "STRIKE — KEEP GOING";
    case "board-also-accepted": return "+" + outcome.points + " HQ POINTS";
    case "ambiguous": return "BE MORE SPECIFIC";
    case "already-guessed": return "ALREADY GUESSED";
    case "fast-money-answer": return "LOCKED";
    case "fast-money-timeout": return "TIME";
  }
}

function StagePlate({ fast = false }: { fast?: boolean }) {
  return (
    <img
      className={fast ? "feud-stage-plate feud-stage-plate--fast" : "feud-stage-plate feud-stage-plate--main"}
      src={fast ? SPORTS_FEUD_FAST_MONEY_STAGE_ASSET : SPORTS_FEUD_MAIN_STAGE_ASSET}
      alt=""
      aria-hidden="true"
    />
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
    <div className="feud-strikes" aria-label={strikes + " of " + FAMILY_FEUD_STRIKES_PER_BOARD + " strikes"}>
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

function FastMoneyHost({ asset }: { asset: string }) {
  return (
    <img
      className="feud-fast-host-asset"
      src={asset}
      alt=""
      aria-hidden="true"
      loading="eager"
      decoding="sync"
      fetchPriority="high"
    />
  );
}

function FamilyFeudPrototypeExperience({ scope, qaReplayDay }: FamilyFeudPrototypePageProps) {
  const navigate = useNavigate();
  const pack = useMemo(() => {
    if (!qaReplayDay) return familyFeudPrototypePack(scope);
    if (scope !== "ufc") throw new Error("Sports Feud QA replay is currently UFC-only.");
    return buildSportsFeudPack("ufc", qaReplayDay);
  }, [qaReplayDay, scope]);
  const [state, setState] = useState<FamilyFeudState>(() => createFamilyFeudState());
  const [scene, setScene] = useState<PrototypeScene>("intro");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FamilyFeudOutcome | null>(null);
  const [displayBoardIndex, setDisplayBoardIndex] = useState(0);
  const [boardReview, setBoardReview] = useState(false);
  const [timeRemainingMs, setTimeRemainingMs] = useState(FAMILY_FEUD_FAST_MONEY_TIME_MS);
  const [mainReveal, setMainReveal] = useState<MainRevealState>({ phase: "idle", transition: null });
  const [displayedMainPoints, setDisplayedMainPoints] = useState(0);
  const [fastRevealIndex, setFastRevealIndex] = useState(0);
  const [fastRevealPhase, setFastRevealPhase] = useState<FastRevealPhase>("answer");
  const [displayedFastTotal, setDisplayedFastTotal] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [viewportOffsetTop, setViewportOffsetTop] = useState(0);
  const deadlineRef = useRef(0);
  const timeoutQueuedRef = useRef(false);
  const baseViewportHeightRef = useRef(0);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const fastInputRef = useRef<HTMLInputElement>(null);
  const shouldRestoreMainInputRef = useRef(false);

  const exitRoute = scope === "football" ? "/football" : "/play";
  const hqName = scope === "football" ? "FOOTBALL HQ" : "UFC HQ";
  const hostSport: SportsFeudHostSport = scope === "ufc" ? "ufc" : "nfl";
  const hostAsset = useMemo(() => sportsFeudHostAsset(hostSport), [hostSport]);
  const score = familyFeudScore(pack, state);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.add("family-feud-prototype-active");
    body.classList.add("family-feud-prototype-active");
    window.scrollTo(0, 0);
    return () => {
      root.classList.remove("family-feud-prototype-active");
      body.classList.remove("family-feud-prototype-active");
      window.scrollTo(0, 0);
    };
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    const currentHeight = () => viewport?.height ?? window.innerHeight;
    baseViewportHeightRef.current = Math.max(window.innerHeight, currentHeight());

    const updateKeyboardInset = () => {
      const visibleHeight = currentHeight();
      const offsetTop = Math.max(0, viewport?.offsetTop ?? 0);
      const keyboardHeight = Math.max(
        0,
        baseViewportHeightRef.current - visibleHeight,
      );
      const isOpen = keyboardHeight >= 120;

      if (!isOpen) {
        baseViewportHeightRef.current = Math.max(window.innerHeight, visibleHeight);
        setKeyboardOpen(false);
        setKeyboardInset(0);
        setViewportOffsetTop(0);
        return;
      }

      const dockInset = Math.max(
        0,
        baseViewportHeightRef.current - visibleHeight - offsetTop,
      );
      setKeyboardOpen(true);
      setKeyboardInset(Math.round(dockInset));
      setViewportOffsetTop(Math.round(offsetTop));
    };

    updateKeyboardInset();
    viewport?.addEventListener("resize", updateKeyboardInset);
    viewport?.addEventListener("scroll", updateKeyboardInset);
    window.addEventListener("resize", updateKeyboardInset);

    return () => {
      viewport?.removeEventListener("resize", updateKeyboardInset);
      viewport?.removeEventListener("scroll", updateKeyboardInset);
      window.removeEventListener("resize", updateKeyboardInset);
    };
  }, []);

  useEffect(() => {
    if (scene !== "fast") return undefined;
    timeoutQueuedRef.current = false;
    deadlineRef.current = performance.now() + state.fastMoneyTimeRemainingMs;
    setTimeRemainingMs(state.fastMoneyTimeRemainingMs);
    const interval = window.setInterval(() => {
      setTimeRemainingMs(Math.max(0, deadlineRef.current - performance.now()));
    }, 80);
    return () => {
      window.clearInterval(interval);
    };
  }, [scene]);

  useEffect(() => {
    if (scene !== "fast" || timeRemainingMs > 0 || timeoutQueuedRef.current) return;
    timeoutQueuedRef.current = true;
    const transition = timeoutFamilyFeudFastMoney(state);
    setState(transition.state);
    beginFastReveal();
  }, [scene, state, timeRemainingMs]);

  useEffect(() => {
    const pending = mainReveal.transition;
    if (!pending || mainReveal.phase === "idle") return undefined;

    if (mainReveal.phase === "suspense") {
      const timer = window.setTimeout(() => {
        setState(pending.state);
        setMainReveal({
          phase: pending.outcome.type === "board-correct" || pending.outcome.type === "board-also-accepted" ? "correct" : "strike",
          transition: pending,
        });
      }, MAIN_SUSPENSE_MS);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      const settledBoard = pending.state.mainBoards[displayBoardIndex]!;
      const settled = settledBoard.revealedEntityIds.length >= FAMILY_FEUD_BOARD_ANSWER_COUNT
        || settledBoard.strikes >= FAMILY_FEUD_STRIKES_PER_BOARD;
      setBoardReview(settled);
      if (!settled) shouldRestoreMainInputRef.current = true;
      setMainReveal({ phase: "idle", transition: null });
    }, MAIN_REVEAL_HOLD_MS);

    return () => window.clearTimeout(timer);
  }, [displayBoardIndex, mainReveal]);

  useEffect(() => {
    const target = familyFeudMainBoardScore(pack, state, displayBoardIndex);
    setDisplayedMainPoints((current) => (current > target ? target : current));

    const timer = window.setInterval(() => {
      setDisplayedMainPoints((current) => {
        if (current >= target) {
          window.clearInterval(timer);
          return target;
        }
        return current + 1;
      });
    }, 28);

    return () => window.clearInterval(timer);
  }, [displayBoardIndex, pack, state]);

  useEffect(() => {
    if (
      scene !== "main"
      || boardReview
      || mainReveal.phase !== "idle"
      || !shouldRestoreMainInputRef.current
    ) return;

    shouldRestoreMainInputRef.current = false;
    mainInputRef.current?.focus({ preventScroll: true });
  }, [boardReview, mainReveal.phase, scene]);

  useEffect(() => {
    if (scene !== "reveal") return undefined;

    if (fastRevealPhase === "answer") {
      const timer = window.setTimeout(() => {
        setFastRevealPhase("score");
      }, FAST_REVEAL_SUSPENSE_MS);
      return () => window.clearTimeout(timer);
    }

    if (fastRevealPhase === "score") {
      const timer = window.setTimeout(() => {
        if (fastRevealIndex < 4) {
          setFastRevealIndex((current) => current + 1);
          setFastRevealPhase("answer");
        } else {
          setFastRevealPhase("complete");
        }
      }, FAST_REVEAL_SCORE_HOLD_MS);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setScene("fast-recap");
    }, FAST_REVEAL_COMPLETE_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [fastRevealIndex, fastRevealPhase, scene]);

  useEffect(() => {
    if (scene !== "reveal") return undefined;
    const scoredCount = Math.min(
      state.fastMoneyResults.length,
      fastRevealIndex + (fastRevealPhase === "answer" ? 0 : 1),
    );
    const target = state.fastMoneyResults
      .slice(0, scoredCount)
      .reduce((total, result) => total + result.points, 0);

    const timer = window.setInterval(() => {
      setDisplayedFastTotal((current) => {
        if (current >= target) {
          window.clearInterval(timer);
          return target;
        }
        return current + 1;
      });
    }, 28);

    return () => window.clearInterval(timer);
  }, [fastRevealIndex, fastRevealPhase, scene, state.fastMoneyResults]);

  function beginFastReveal() {
    fastInputRef.current?.blur();
    setAnswer("");
    setFeedback(null);
    setFastRevealIndex(0);
    setFastRevealPhase("answer");
    setDisplayedFastTotal(0);
    setScene("reveal");
  }

  function startGame() {
    setState(createFamilyFeudState());
    setDisplayBoardIndex(0);
    setBoardReview(false);
    setAnswer("");
    setFeedback(null);
    setTimeRemainingMs(FAMILY_FEUD_FAST_MONEY_TIME_MS);
    setMainReveal({ phase: "idle", transition: null });
    setDisplayedMainPoints(0);
    setFastRevealIndex(0);
    setFastRevealPhase("answer");
    setDisplayedFastTotal(0);
    shouldRestoreMainInputRef.current = false;
    setScene("main");
  }

  function submitMain(event: FormEvent) {
    event.preventDefault();
    if (!answer.trim() || boardReview || mainReveal.phase !== "idle") return;
    const transition = submitFamilyFeudMainAnswer(pack, state, answer);

    if (transition.outcome.type === "ambiguous" || transition.outcome.type === "already-guessed") {
      setFeedback(transition.outcome);
      if (transition.outcome.type === "already-guessed") setAnswer("");
      return;
    }

    mainInputRef.current?.blur();
    setAnswer("");
    setFeedback(null);
    setMainReveal({ phase: "suspense", transition });
  }

  function advanceBoard() {
    setFeedback(null);
    setAnswer("");
    setBoardReview(false);
    setMainReveal({ phase: "idle", transition: null });
    setDisplayedMainPoints(0);
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
    setFastRevealIndex(0);
    setFastRevealPhase("answer");
    setDisplayedFastTotal(0);
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

    if (transition.outcome.type === "ambiguous") {
      setFeedback(transition.outcome);
      return;
    }

    setState(transition.state);
    setFeedback(null);
    setAnswer("");
    if (transition.state.phase === "complete") beginFastReveal();
  }

  const mainQuestion = pack.mainBoards[displayBoardIndex]!;
  const mainBoardState = state.mainBoards[displayBoardIndex]!;
  const mainBoardPoints = familyFeudMainBoardScore(pack, state, displayBoardIndex);
  const foundIds = new Set(mainBoardState.revealedEntityIds);
  const foundMainAnswers = mainBoardState.revealedEntityIds
    .map((entityId) => {
      const ranked = mainQuestion.answers.find((row) => row.entityId === entityId);
      if (ranked) return ranked;
      if ((mainQuestion.alsoAcceptedEntityIds ?? []).includes(entityId)) {
        return { entityId, points: FAMILY_FEUD_MAIN_ALSO_ACCEPTED_POINTS };
      }
      return null;
    })
    .filter((row): row is FamilyFeudRankedAnswer => Boolean(row));
  const mainDisplayAnswers = foundMainAnswers;
  const newlyRevealedEntityId = mainReveal.phase === "correct"
    && (
      mainReveal.transition?.outcome.type === "board-correct"
      || mainReveal.transition?.outcome.type === "board-also-accepted"
    )
      ? mainReveal.transition.outcome.entityId
      : null;

  const currentFastQuestion = state.phase === "fast-money"
    ? pack.fastMoney[state.fastMoneyIndex] ?? null
    : null;

  const fastRevealRows = pack.fastMoney.map((question, index) => {
    const result = state.fastMoneyResults[index];
    const matchedEntity = result?.entityId
      ? pack.entities.find((candidate) => candidate.id === result.entityId)
      : null;
    return {
      prompt: question.prompt,
      answer: matchedEntity?.displayName ?? result?.submittedText ?? "NO ANSWER",
      points: result?.points ?? 0,
      counted: Boolean(result && result.points > 0),
      accepted: question.answers.map((rankedAnswer) => ({
        name: pack.entities.find((candidate) => candidate.id === rankedAnswer.entityId)?.displayName
          ?? rankedAnswer.entityId,
        points: rankedAnswer.points,
      })),
    };
  });
  const activeFastRevealRow = fastRevealRows[fastRevealIndex] ?? fastRevealRows[0]!;

  const view = (
    <main
      className={[
        "family-feud-prototype",
        "feud-scene--" + scene,
        keyboardOpen ? "is-keyboard-open" : "",
      ].filter(Boolean).join(" ")}
      data-scope={scope}
      data-scene={scene}
      data-main-reveal={mainReveal.phase}
      data-qa-replay-day={qaReplayDay ?? undefined}
      style={{
        "--feud-keyboard-inset": keyboardInset + "px",
        "--feud-viewport-offset": viewportOffsetTop + "px",
      } as CSSProperties}
    >
      <StagePlate />
      <StagePlate fast />
      {scene === "main" ? <FastMoneyHost asset={hostAsset} /> : null}
      <HQBackButton onClick={() => navigate(exitRoute)} />

      {scene === "intro" ? (
        <section className="feud-intro" aria-labelledby="feud-intro-title">
          <div className="feud-intro__eyebrow">{qaReplayDay ? `${hqName} · OWNER QA REPLAY` : `${hqName} · DAILY CHALLENGE`}</div>
          <Brand />
          <h1 id="feud-intro-title">Clear the board.</h1>
          <p>{qaReplayDay
            ? `Replay the ${qaReplayDay} UFC question set against the repaired answer bank. This run is local QA only and writes no Daily result or leaderboard score.`
            : "Find four good HQ answers before three strikes. Then finish five Fast Money prompts."}</p>
          <div className="feud-intro__rules">
            <span><b>2</b> BOARDS</span>
            <span><b>4</b> ANSWERS EACH</span>
            <span><b>0:50</b> FAST MONEY</span>
          </div>
          <button className="feud-primary-button" type="button" onClick={startGame}>{qaReplayDay ? "REPLAY SEPT 24 FEUD" : "PLAY SPORTS FEUD"}</button>
        </section>
      ) : null}

      {scene === "main" ? (
        <section className="feud-main-stage" aria-label={"Round " + (displayBoardIndex + 1)}>
          <header className="feud-main-stage__top">
            <Brand compact />
            <StrikeRail strikes={mainBoardState.strikes} />
          </header>

          <section className="feud-question-card">
            <span>WE ASKED {hqName}</span>
            <h1>{mainQuestion.prompt}</h1>
          </section>

          <section className={boardReview ? "feud-answer-board is-review" : "feud-answer-board"}>
            {Array.from({ length: FAMILY_FEUD_BOARD_ANSWER_COUNT }, (_value, index) => {
              const rankedAnswer = mainDisplayAnswers[index] ?? null;
              const found = Boolean(rankedAnswer && foundIds.has(rankedAnswer.entityId));
              const matchedEntity = rankedAnswer
                ? pack.entities.find((candidate) => candidate.id === rankedAnswer.entityId)
                : null;
              return (
                <div
                  className={[
                    "feud-answer-slot",
                    rankedAnswer ? "is-revealed" : "",
                    rankedAnswer?.entityId === newlyRevealedEntityId ? "is-new-reveal" : "",
                  ].filter(Boolean).join(" ")}
                  key={index}
                >
                  <b>{index + 1}</b>
                  <strong>{matchedEntity?.displayName ?? ""}</strong>
                  <span>{rankedAnswer?.points ?? ""}</span>
                </div>
              );
            })}
          </section>

          <div className="feud-main-score">
            <span>ROUND {displayBoardIndex + 1} POINTS</span>
            <strong>{displayedMainPoints}</strong>
            <em>/ {FAMILY_FEUD_MAIN_BOARD_MAX}</em>
          </div>

          {boardReview ? (
            <section className="feud-round-review feud-round-answer-reveal" aria-label={"Round " + (displayBoardIndex + 1) + " accepted answers"}>
              <small className="feud-round-review__title">ROUND {displayBoardIndex + 1} ANSWERS</small>
              <strong>
                {mainBoardState.revealedEntityIds.length >= FAMILY_FEUD_BOARD_ANSWER_COUNT
                  ? "BOARD CLEARED"
                  : "3 STRIKES — BOARD CLOSED"}
              </strong>
              <span>{mainBoardPoints}/{FAMILY_FEUD_MAIN_BOARD_MAX} HQ points banked.</span>
              <div className="feud-round-answer-grid">
                {mainQuestion.answers.map((rankedAnswer) => {
                  const entity = pack.entities.find((candidate) => candidate.id === rankedAnswer.entityId);
                  const found = foundIds.has(rankedAnswer.entityId);
                  return (
                    <div
                      className={found ? "feud-round-answer is-found" : "feud-round-answer"}
                      key={rankedAnswer.entityId}
                    >
                      <span>{found ? "✓" : ""}</span>
                      <strong>{entity?.displayName ?? rankedAnswer.entityId}</strong>
                      <b>{rankedAnswer.points}</b>
                    </div>
                  );
                })}
              </div>
              <button className="feud-primary-button" type="button" onClick={advanceBoard}>
                {state.phase === "fast-money" ? "GO TO FAST MONEY" : "ROUND 2"}
              </button>
            </section>
          ) : mainReveal.phase === "idle" ? (
            <form className="feud-answer-entry" onSubmit={submitMain}>
              {feedback && (
                feedback.type === "ambiguous"
                || feedback.type === "already-guessed"
              ) ? (
                <div className="feud-feedback" data-kind={feedback.type}>
                  {feedbackCopy(feedback)}
                </div>
              ) : null}
              <div className="feud-answer-entry__row">
                <input
                  ref={mainInputRef}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Type your answer"
                  autoCapitalize="words"
                  autoCorrect="off"
                  enterKeyHint="send"
                  aria-label="Your answer"
                />
                <button
                  type="submit"
                  aria-label="Submit answer"
                  onPointerDown={(event) => event.preventDefault()}
                >↑</button>
              </div>
            </form>
          ) : null}

          {mainReveal.phase === "strike" ? (
            <div className="feud-strike-slam" role="status" aria-label="Strike">
              <span>×</span>
            </div>
          ) : null}
        </section>
      ) : null}

      {scene === "fast-intro" ? (
        <section className="feud-fast-intro">
          <div className="feud-fast-intro__show">
            <div>
              <span className="feud-fast-intro__kicker">YOU MADE THE FINALE</span>
              <h1>FAST MONEY</h1>
              <div className="feud-fast-intro__clock">0:50</div>
            </div>
          </div>
          <p>Five prompts. One answer each. Points stay hidden until the clock stops.</p>
          <button className="feud-primary-button" type="button" onClick={startFastMoney}>START 50 SECONDS</button>
        </section>
      ) : null}

      {scene === "fast" ? (
        <section className="feud-fast-stage">
          <header>
            <Brand compact />
            <div className={timeRemainingMs <= 10_000 ? "feud-fast-clock is-low" : "feud-fast-clock"}>
              {formatClock(timeRemainingMs)}
            </div>
          </header>

          <div className="feud-fast-showdown">
            <section className="feud-fast-question">
              <span className="feud-fast-progress">{state.fastMoneyIndex + 1} OF 5</span>
              <small>{hqName} · FAST MONEY</small>
              <h1>{currentFastQuestion?.prompt}</h1>
              <div className="feud-fast-dots" aria-label="Fast Money progress">
                {Array.from({ length: 5 }, (_, index) => (
                  <i
                    className={index < state.fastMoneyIndex ? "is-done" : index === state.fastMoneyIndex ? "is-current" : ""}
                    key={index}
                  />
                ))}
              </div>
            </section>
          </div>

          <div className="feud-fast-board-progress" aria-label="Fast Money submitted answers">
            {Array.from({ length: 5 }, (_value, index) => {
              const result = state.fastMoneyResults[index];
              const matchedEntity = result?.entityId
                ? pack.entities.find((candidate) => candidate.id === result.entityId)
                : null;
              const displayAnswer = matchedEntity?.displayName ?? result?.submittedText ?? "";
              return (
                <div className={index < state.fastMoneyIndex ? "is-filled" : index === state.fastMoneyIndex ? "is-current" : ""} key={index}>
                  <span>{displayAnswer}</span>
                </div>
              );
            })}
          </div>

          <form className="feud-fast-entry" onSubmit={submitFastMoney}>
            {feedback?.type === "ambiguous" ? (
              <div className="feud-feedback" data-kind={feedback.type}>
                {feedbackCopy(feedback)}
              </div>
            ) : null}
            <div className="feud-fast-entry__row">
              <input
                ref={fastInputRef}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Type your answer"
                autoCapitalize="words"
                autoCorrect="off"
                enterKeyHint="send"
                aria-label="Fast Money answer"
              />
              <button
                type="submit"
                aria-label="Submit Fast Money answer"
                onPointerDown={(event) => event.preventDefault()}
              >↑</button>
            </div>
          </form>
        </section>
      ) : null}

      {scene === "reveal" ? (
        <section className="feud-reveal-stage" aria-label="Fast Money results reveal">
          <header className="feud-fast-reveal-scorebar">
            <span>FAST MONEY RESULTS</span>
            <strong>{displayedFastTotal}/{FAMILY_FEUD_FAST_MONEY_RAW_MAX}</strong>
          </header>

          <section className="feud-fast-reveal-question">
            <span>{fastRevealIndex + 1} OF 5</span>
            <h1>{activeFastRevealRow.prompt}</h1>
          </section>

          <div className="feud-fast-reveal-board" aria-label="Fast Money answer board">
            {fastRevealRows.map((row, index) => {
              const revealed = index < fastRevealIndex
                || (index === fastRevealIndex && fastRevealPhase !== "answer");
              const current = index === fastRevealIndex;
              return (
                <div
                  className={[
                    "feud-fast-reveal-row",
                    revealed ? "is-revealed" : "",
                    current ? "is-current" : "",
                    revealed && !row.counted ? "is-zero" : "",
                  ].filter(Boolean).join(" ")}
                  aria-live={current ? "polite" : undefined}
                  key={index}
                >
                  <strong>{revealed ? row.answer : ""}</strong>
                  <span>{revealed ? (row.counted ? row.points : "×") : ""}</span>
                </div>
              );
            })}
          </div>

          <div className="feud-fast-running-total" aria-label="Running Fast Money total">
            <span>RUNNING TOTAL</span>
            <strong>{displayedFastTotal}</strong>
          </div>
        </section>
      ) : null}

      {scene === "fast-recap" ? (
        <section className="feud-fast-recap" aria-label="Fast Money HQ answers">
          <header>
            <Brand compact />
            <div>
              <span>FAST MONEY</span>
              <strong>HQ ANSWERS</strong>
            </div>
            <b>{score.fastMoney}/{FAMILY_FEUD_FAST_MONEY_RAW_MAX}</b>
          </header>

          <div className="feud-fast-recap__list">
            {fastRevealRows.map((row, index) => (
              <article className="feud-fast-recap__card" key={index}>
                <div>
                  <b>{index + 1}</b>
                  <span>{row.prompt}</span>
                </div>
                <section>
                  {row.accepted.slice(0, 4).map((accepted) => (
                    <span key={accepted.name}>
                      {accepted.name} <b>{accepted.points}</b>
                    </span>
                  ))}
                  {row.accepted.length > 4 ? (
                    <small>+{row.accepted.length - 4} also accepted</small>
                  ) : null}
                </section>
              </article>
            ))}
          </div>

          <button className="feud-primary-button feud-reveal-next" type="button" onClick={() => setScene("result")}>
            VIEW HQ SCORE
          </button>
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
          <h1>{score.hq >= 90 ? "DOMINANT RUN" : score.hq >= 80 ? "GREAT RUN" : score.hq >= 65 ? "SOLID RUN" : "TOUGH RUN"}</h1>
          <div className="feud-result__equation" aria-label="HQ score calculation">
            <span><b>{score.main}</b><small>MAIN</small></span>
            <i>+</i>
            <span><b>{score.fastMoney}</b><small>FAST MONEY</small></span>
            <i>=</i>
            <span className="is-total"><b>{score.hq}</b><small>HQ SCORE</small></span>
          </div>
          <div className="feud-result__breakdown">
            <p><span>MAIN BOARDS</span><strong>{score.main}/{FAMILY_FEUD_MAIN_RAW_MAX}</strong></p>
            <p><span>FAST MONEY</span><strong>{score.fastMoney}/{FAMILY_FEUD_FAST_MONEY_RAW_MAX}</strong></p>
          </div>
          <button className="feud-primary-button" type="button" onClick={startGame}>PLAY AGAIN</button>
          <button className="feud-secondary-button" type="button" onClick={() => navigate(exitRoute)}>EXIT TO HQ</button>
        </section>
      ) : null}
    </main>
  );

  return createPortal(view, document.body);
}

export default function FamilyFeudPrototypePage({ scope, qaReplayDay }: FamilyFeudPrototypePageProps) {
  const identity = useIdentity();
  const exitRoute = scope === "football" ? "/football" : "/play";

  if (!identity.ready) return null;
  if (!isFamilyFeudPrototypeOwner(identity.profile)) {
    return <Navigate to={exitRoute} replace />;
  }

  return <FamilyFeudPrototypeExperience scope={scope} qaReplayDay={qaReplayDay} />;
}
