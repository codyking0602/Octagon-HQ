import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  FAMILY_FEUD_BOARD_ANSWER_COUNT,
  FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT,
  FAMILY_FEUD_FAST_MONEY_RAW_MAX,
  FAMILY_FEUD_FAST_MONEY_TIME_MS,
  FAMILY_FEUD_MAIN_BOARD_MAX,
  FAMILY_FEUD_MAIN_RAW_MAX,
  FAMILY_FEUD_STRIKES_PER_BOARD,
} from "../games/familyFeudEngine";
import type { TodayChallengeProjection } from "./todayChallengeRepository";
import type { TodayChallengeAdvanceOptions } from "./useTodayChallengeRuntime";
import {
  optimisticSportsFeudFastMoneyProjection,
  optimisticSportsFeudFastMoneyPublicState,
  optimisticSportsFeudFastMoneyTimeout,
} from "./sportsFeudDailyOptimistic";
import {
  SPORTS_FEUD_FAST_MONEY_STAGE_ASSET,
  SPORTS_FEUD_MAIN_STAGE_ASSET,
  sportsFeudHostAsset,
  type SportsFeudHostSport,
} from "./sportsFeudPresentation";
import "./FamilyFeudPrototypePage.css";
import "./SportsFeudRevealPass.css";

type JsonRecord = Record<string, unknown>;
type Scene = "intro" | "main" | "fast-intro" | "fast" | "reveal" | "fast-recap" | "result";
type MainRevealPhase = "idle" | "suspense" | "correct" | "strike";
type FastRevealPhase = "answer" | "score" | "complete";

const MAIN_SUSPENSE_MS = 650;
const MAIN_REVEAL_HOLD_MS = 520;
const FAST_REVEAL_SUSPENSE_MS = 650;
const FAST_REVEAL_SCORE_HOLD_MS = 650;
const FAST_REVEAL_COMPLETE_HOLD_MS = 800;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

function formatClock(ms: number) {
  return "0:" + String(Math.ceil(ms / 1000)).padStart(2, "0");
}

function entityName(value: unknown) {
  return String(record(value).display_name ?? "");
}

function boardHasProgress(board: JsonRecord) {
  return Number(board.strikes ?? 0) > 0
    || records(board.slots).some((slot) => slot.revealed === true);
}

function initialPresentation(projection: TodayChallengeProjection) {
  if (projection.officialAttempt) {
    return { scene: "result" as Scene, boardIndex: 1, boardReview: false };
  }

  const state = projection.publicState;
  const boards = records(state.main_boards);
  const activeBoardIndex = Math.max(0, Math.min(1, Number(state.main_board_index ?? 0)));

  if (state.phase === "fast-money") {
    const fast = record(state.fast_money);
    if (Number(fast.answered_count ?? 0) > 0) {
      return { scene: "fast" as Scene, boardIndex: 1, boardReview: false };
    }
    if (boards[1]?.settled === true) {
      return { scene: "main" as Scene, boardIndex: 1, boardReview: true };
    }
    return { scene: "fast-intro" as Scene, boardIndex: 1, boardReview: false };
  }

  const activeBoard = boards[activeBoardIndex] ?? {};
  if (activeBoardIndex > 0 && !boardHasProgress(activeBoard) && boards[activeBoardIndex - 1]?.settled === true) {
    return { scene: "main" as Scene, boardIndex: activeBoardIndex - 1, boardReview: true };
  }
  if (activeBoard.settled === true) {
    return { scene: "main" as Scene, boardIndex: activeBoardIndex, boardReview: true };
  }
  const progressed = activeBoardIndex > 0 || boards.some(boardHasProgress);
  return { scene: progressed ? "main" as Scene : "intro" as Scene, boardIndex: activeBoardIndex, boardReview: false };
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

function Host({ asset }: { asset: string }) {
  const deionClass = asset.endsWith("/3cfb.png") ? " is-cfb-deion" : "";
  return (
    <img
      className={"feud-fast-host-asset" + deionClass}
      src={asset}
      alt=""
      aria-hidden="true"
      loading="eager"
      decoding="sync"
      fetchPriority="high"
    />
  );
}

function roundScore(board: JsonRecord) {
  return records(board.slots).reduce((total, slot) => (
    total + (slot.found === true ? Number(slot.points ?? 0) : 0)
  ), 0);
}

export function OfficialSportsFeudDailyView({
  projection,
  busy,
  onAdvance,
  onExit,
}: {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (
    action: Record<string, unknown>,
    options?: TodayChallengeAdvanceOptions,
  ) => void;
  onExit?: () => void;
}) {
  const initial = initialPresentation(projection);
  const [scene, setScene] = useState<Scene>(() => initial.scene);
  const [displayState, setDisplayState] = useState<JsonRecord>(() => projection.publicState);
  const [displayBoardIndex, setDisplayBoardIndex] = useState(() => initial.boardIndex);
  const [boardReview, setBoardReview] = useState(() => initial.boardReview);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [mainRevealPhase, setMainRevealPhase] = useState<MainRevealPhase>("idle");
  const [timeRemainingMs, setTimeRemainingMs] = useState(FAMILY_FEUD_FAST_MONEY_TIME_MS);
  const [fastRevealIndex, setFastRevealIndex] = useState(0);
  const [fastRevealPhase, setFastRevealPhase] = useState<FastRevealPhase>("answer");
  const [displayedFastTotal, setDisplayedFastTotal] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [viewportOffsetTop, setViewportOffsetTop] = useState(0);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const fastInputRef = useRef<HTMLInputElement>(null);
  const pendingKindRef = useRef<"main" | null>(null);
  const fastLocalIndexRef = useRef(Number(record(projection.publicState.fast_money).answered_count ?? 0));
  const fastSessionClosedRef = useRef(false);
  const pendingBoardIndexRef = useRef(0);
  const submittedAtRef = useRef(0);
  const lastSubmittedRef = useRef("");
  const lastSeenRevisionRef = useRef(projection.progressRevision);
  const deadlineRef = useRef(0);
  const timeoutQueuedRef = useRef(false);
  const baseViewportHeightRef = useRef(0);

  const setup = projection.publicSetup;
  const domain = String(setup.presentation_domain ?? (projection.sport === "football" ? "nfl" : "ufc")) as SportsFeudHostSport;
  const hqName = domain === "cfb" ? "CFB HQ" : domain === "nfl" ? "NFL HQ" : "UFC HQ";
  const hostAsset = useMemo(
    () => sportsFeudHostAsset(domain, projection.centralDay),
    [domain, projection.centralDay],
  );

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

    const update = () => {
      const visibleHeight = currentHeight();
      const offsetTop = Math.max(0, viewport?.offsetTop ?? 0);
      const keyboardHeight = Math.max(0, baseViewportHeightRef.current - visibleHeight);
      const open = keyboardHeight >= 120;
      if (!open) {
        baseViewportHeightRef.current = Math.max(window.innerHeight, visibleHeight);
        setKeyboardOpen(false);
        setKeyboardInset(0);
        setViewportOffsetTop(0);
        return;
      }
      setKeyboardOpen(true);
      setKeyboardInset(Math.round(Math.max(0, baseViewportHeightRef.current - visibleHeight - offsetTop)));
      setViewportOffsetTop(Math.round(offsetTop));
    };

    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (projection.progressRevision === lastSeenRevisionRef.current) return;
    lastSeenRevisionRef.current = projection.progressRevision;
    const nextState = projection.publicState;
    const kind = pendingKindRef.current;

    if (kind === "main") {
      const response = record(nextState.last_feedback);
      const responseType = String(response.type ?? "");
      if (responseType === "ambiguous" || responseType === "already-guessed") {
        setDisplayState(nextState);
        setFeedback(responseType === "ambiguous" ? "BE MORE SPECIFIC" : "ALREADY GUESSED");
        if (responseType === "ambiguous") setAnswer(lastSubmittedRef.current);
        setMainRevealPhase("idle");
        pendingKindRef.current = null;
        return;
      }

      const elapsed = performance.now() - submittedAtRef.current;
      const delay = Math.max(0, MAIN_SUSPENSE_MS - elapsed);
      const boardIndex = pendingBoardIndexRef.current;
      const revealTimer = window.setTimeout(() => {
        setDisplayState(nextState);
        setMainRevealPhase(responseType === "correct" ? "correct" : "strike");
        const settleTimer = window.setTimeout(() => {
          const board = records(nextState.main_boards)[boardIndex] ?? {};
          setMainRevealPhase("idle");
          setBoardReview(board.settled === true);
          pendingKindRef.current = null;
          if (board.settled !== true) mainInputRef.current?.focus({ preventScroll: true });
        }, MAIN_REVEAL_HOLD_MS);
        return () => window.clearTimeout(settleTimer);
      }, delay);
      return () => window.clearTimeout(revealTimer);
    }

    setDisplayState(nextState);
    if (scene === "fast") {
      const nextFast = record(nextState.fast_money);
      fastLocalIndexRef.current = Number(nextFast.answered_count ?? fastLocalIndexRef.current);
      if (nextState.complete === true) {
        fastSessionClosedRef.current = true;
        fastInputRef.current?.blur();
        setFastRevealIndex(0);
        setFastRevealPhase("answer");
        setDisplayedFastTotal(0);
        setScene("reveal");
      } else if (nextFast.client_pending_complete !== true) {
        fastInputRef.current?.focus({ preventScroll: true });
      }
    }
  }, [projection.progressRevision, projection.publicState]);

  useEffect(() => {
    if (scene !== "fast") return undefined;
    timeoutQueuedRef.current = false;
    const stored = Number(record(displayState.fast_money).time_remaining_ms ?? FAMILY_FEUD_FAST_MONEY_TIME_MS);
    deadlineRef.current = performance.now() + stored;
    setTimeRemainingMs(stored);
    const interval = window.setInterval(() => {
      if (fastSessionClosedRef.current) return;
      setTimeRemainingMs(Math.max(0, deadlineRef.current - performance.now()));
    }, 80);
    return () => window.clearInterval(interval);
  }, [scene]);

  useEffect(() => {
    if (
      scene !== "fast"
      || timeRemainingMs > 0
      || timeoutQueuedRef.current
      || fastSessionClosedRef.current
    ) return;
    timeoutQueuedRef.current = true;
    fastSessionClosedRef.current = true;
    setDisplayState((current) => optimisticSportsFeudFastMoneyTimeout({
      ...projection,
      publicState: current,
    }).publicState);
    onAdvance(
      { type: "timeout" },
      {
        dedupeKey: "sports-feud:fast-money:timeout",
        optimisticUpdate: optimisticSportsFeudFastMoneyTimeout,
      },
    );
  }, [onAdvance, projection, scene, timeRemainingMs]);

  useEffect(() => {
    if (scene !== "reveal") return undefined;
    if (fastRevealPhase === "answer") {
      const timer = window.setTimeout(() => setFastRevealPhase("score"), FAST_REVEAL_SUSPENSE_MS);
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
    const timer = window.setTimeout(() => setScene("fast-recap"), FAST_REVEAL_COMPLETE_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [fastRevealIndex, fastRevealPhase, scene]);

  const fastState = record(displayState.fast_money);
  const fastResultsValue = fastState.results;
  const fastSubmittedValue = fastState.submitted_answers;
  const fastResults = useMemo(() => records(fastResultsValue), [fastResultsValue]);
  const fastSubmitted = useMemo(() => records(fastSubmittedValue), [fastSubmittedValue]);

  useEffect(() => {
    if (scene !== "reveal") return undefined;
    const scoredCount = Math.min(
      fastResults.length,
      fastRevealIndex + (fastRevealPhase === "answer" ? 0 : 1),
    );
    const target = fastResults
      .slice(0, scoredCount)
      .reduce((total, result) => total + Number(result.points ?? 0), 0);
    const interval = window.setInterval(() => {
      setDisplayedFastTotal((current) => {
        if (current >= target) {
          window.clearInterval(interval);
          return target;
        }
        return current + 1;
      });
    }, 28);
    return () => window.clearInterval(interval);
  }, [fastRevealIndex, fastRevealPhase, fastResults, scene]);

  const mainBoards = records(displayState.main_boards);
  const mainBoard = mainBoards[displayBoardIndex] ?? {};
  const slots = records(mainBoard.slots);
  const answerReveal = records(mainBoard.answer_reveal);
  const currentFastQuestion = record(fastState.current_question);
  const fastAnsweredCount = Math.min(
    FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT,
    Number(fastState.answered_count ?? 0),
  );
  const fastQuestionIndex = fastState.question_index == null
    ? Math.min(FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT - 1, fastAnsweredCount)
    : Math.max(0, Math.min(
        FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT - 1,
        Number(fastState.question_index ?? 0),
      ));
  const fastFinishing = fastState.client_pending_complete === true && !projection.officialAttempt;
  const finalScore = projection.officialAttempt?.normalizedScore ?? Number(displayState.hq_score ?? 0);
  const finalMain = projection.officialAttempt
    ? Number(projection.officialAttempt.publicResult.main_points ?? displayState.main_points ?? 0)
    : Number(displayState.main_points ?? 0);
  const finalFast = projection.officialAttempt
    ? Number(projection.officialAttempt.publicResult.fast_money_points ?? fastState.points ?? 0)
    : Number(fastState.points ?? 0);

  const fastRevealRows = Array.from({ length: 5 }, (_, index) => {
    const row = fastResults[index] ?? {};
    return {
      prompt: String(row.prompt ?? ""),
      answer: String(row.submitted_answer ?? "NO ANSWER"),
      points: Number(row.points ?? 0),
      counted: row.counted === true,
      accepted: records(row.accepted_answers).map((accepted) => ({
        name: entityName(accepted.entity),
        points: Number(accepted.points ?? 0),
      })),
    };
  });
  const activeFastRevealRow = fastRevealRows[fastRevealIndex] ?? fastRevealRows[0]!;

  function startGame() {
    setDisplayState(projection.publicState);
    setDisplayBoardIndex(Number(projection.publicState.main_board_index ?? 0));
    setBoardReview(false);
    setAnswer("");
    setFeedback(null);
    setMainRevealPhase("idle");
    setScene("main");
  }

  function submitMain(event: FormEvent) {
    event.preventDefault();
    const value = answer.trim();
    if (!value || busy || boardReview || mainRevealPhase !== "idle" || pendingKindRef.current) return;
    lastSubmittedRef.current = value;
    pendingKindRef.current = "main";
    pendingBoardIndexRef.current = displayBoardIndex;
    submittedAtRef.current = performance.now();
    setFeedback(null);
    setAnswer("");
    setMainRevealPhase("suspense");
    mainInputRef.current?.blur();
    onAdvance({ type: "answer", answer: value });
  }

  function advanceBoard() {
    setFeedback(null);
    setAnswer("");
    setBoardReview(false);
    setMainRevealPhase("idle");
    if (displayState.phase === "fast-money") {
      setScene("fast-intro");
      return;
    }
    setDisplayBoardIndex(Number(displayState.main_board_index ?? 1));
  }

  function startFastMoney() {
    const currentFast = record(displayState.fast_money);
    fastLocalIndexRef.current = Number(currentFast.answered_count ?? 0);
    fastSessionClosedRef.current = false;
    timeoutQueuedRef.current = false;
    setFeedback(null);
    setAnswer("");
    setFastRevealIndex(0);
    setFastRevealPhase("answer");
    setDisplayedFastTotal(0);
    setScene("fast");
  }

  function submitFast(event: FormEvent) {
    event.preventDefault();
    const value = answer.trim();
    if (!value || scene !== "fast" || fastSessionClosedRef.current) return;

    const questionIndex = fastLocalIndexRef.current;
    const prompts = records(setup.fast_money_prompts);
    const question = prompts[questionIndex];
    const questionId = String(question?.id ?? "");
    if (!questionId || questionIndex >= FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT) return;

    const capturedTimeRemainingMs = Math.max(
      0,
      Math.floor(deadlineRef.current - performance.now()),
    );
    if (capturedTimeRemainingMs <= 0) {
      setTimeRemainingMs(0);
      return;
    }

    const optimisticAction = {
      questionIndex,
      questionId,
      answer: value,
      timeRemainingMs: capturedTimeRemainingMs,
    };
    fastLocalIndexRef.current = questionIndex + 1;
    if (fastLocalIndexRef.current >= FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT) {
      fastSessionClosedRef.current = true;
    }

    setDisplayState((current) => optimisticSportsFeudFastMoneyPublicState(
      current,
      setup,
      optimisticAction,
    ));
    setTimeRemainingMs(capturedTimeRemainingMs);
    setFeedback(null);
    setAnswer("");
    if (!fastSessionClosedRef.current) {
      fastInputRef.current?.focus({ preventScroll: true });
    }

    onAdvance(
      {
        type: "answer",
        answer: value,
        question_id: questionId,
        question_index: questionIndex,
        time_remaining_ms: capturedTimeRemainingMs,
      },
      {
        dedupeKey: `sports-feud:fast-money:${questionIndex}:${questionId}`,
        optimisticUpdate: (current) => optimisticSportsFeudFastMoneyProjection(
          current,
          optimisticAction,
        ),
      },
    );
  }

  const view = (
    <main
      className={[
        "family-feud-prototype",
        "feud-scene--" + scene,
        keyboardOpen ? "is-keyboard-open" : "",
      ].filter(Boolean).join(" ")}
      data-scope={projection.sport === "football" ? "football" : "ufc"}
      data-scene={scene}
      data-main-reveal={mainRevealPhase}
      style={{
        "--feud-keyboard-inset": keyboardInset + "px",
        "--feud-viewport-offset": viewportOffsetTop + "px",
      } as CSSProperties}
    >
      <StagePlate />
      <StagePlate fast />
      {scene === "main" ? <Host asset={hostAsset} /> : null}
      {onExit ? <HQBackButton onClick={onExit} /> : null}

      {scene === "intro" ? (
        <section className="feud-intro" aria-labelledby="official-feud-intro-title">
          <div className="feud-intro__eyebrow">{hqName} · DAILY CHALLENGE</div>
          <Brand />
          <h1 id="official-feud-intro-title">Clear the board.</h1>
          <p>Find four good HQ answers before three strikes. Then finish five Fast Money prompts.</p>
          <div className="feud-intro__rules">
            <span><b>2</b> BOARDS</span>
            <span><b>4</b> ANSWERS EACH</span>
            <span><b>0:50</b> FAST MONEY</span>
          </div>
          <button className="feud-primary-button" type="button" onClick={startGame}>PLAY SPORTS FEUD</button>
        </section>
      ) : null}

      {scene === "main" ? (
        <section className="feud-main-stage" aria-label={"Round " + (displayBoardIndex + 1)}>
          <header className="feud-main-stage__top">
            <Brand compact />
            <StrikeRail strikes={Number(mainBoard.strikes ?? 0)} />
          </header>

          <section className="feud-question-card">
            <span>WE ASKED {hqName}</span>
            <h1>{String(mainBoard.prompt ?? "")}</h1>
          </section>

          <section className={boardReview ? "feud-answer-board is-review" : "feud-answer-board"}>
            {Array.from({ length: FAMILY_FEUD_BOARD_ANSWER_COUNT }, (_value, index) => {
              const slot = slots[index] ?? {};
              const revealed = slot.revealed === true && slot.found === true;
              return (
                <div className={revealed ? "feud-answer-slot is-revealed" : "feud-answer-slot"} key={index}>
                  <b>{index + 1}</b>
                  <strong>{revealed ? entityName(slot.entity) : ""}</strong>
                  <span>{revealed ? String(slot.points ?? "") : ""}</span>
                </div>
              );
            })}
          </section>

          <div className="feud-main-score">
            <span>ROUND {displayBoardIndex + 1} POINTS</span>
            <strong>{roundScore(mainBoard)}</strong>
            <em>/ {FAMILY_FEUD_MAIN_BOARD_MAX}</em>
          </div>

          {boardReview ? (
            <section className="feud-round-review feud-round-answer-reveal" aria-label={"Round " + (displayBoardIndex + 1) + " accepted answers"}>
              <small className="feud-round-review__title">ROUND {displayBoardIndex + 1} ANSWERS</small>
              <strong>
                {records(mainBoard.slots).filter((slot) => slot.found === true).length >= FAMILY_FEUD_BOARD_ANSWER_COUNT
                  ? "BOARD CLEARED"
                  : "3 STRIKES — BOARD CLOSED"}
              </strong>
              <span>{roundScore(mainBoard)}/{FAMILY_FEUD_MAIN_BOARD_MAX} HQ points banked.</span>
              <div className="feud-round-answer-grid">
                {answerReveal.map((row, index) => (
                  <div className={row.found === true ? "feud-round-answer is-found" : "feud-round-answer"} key={index}>
                    <span>{row.found === true ? "✓" : ""}</span>
                    <strong>{entityName(row.entity)}</strong>
                    <b>{Number(row.points ?? 0)}</b>
                  </div>
                ))}
              </div>
              <button className="feud-primary-button" type="button" onClick={advanceBoard}>
                {displayState.phase === "fast-money" ? "GO TO FAST MONEY" : "ROUND 2"}
              </button>
            </section>
          ) : mainRevealPhase === "idle" ? (
            <form className="feud-answer-entry" onSubmit={submitMain}>
              {feedback ? <div className="feud-feedback">{feedback}</div> : null}
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
                  disabled={busy}
                />
                <button type="submit" aria-label="Submit answer" onPointerDown={(event) => event.preventDefault()} disabled={busy}>↑</button>
              </div>
            </form>
          ) : null}

          {mainRevealPhase === "strike" ? (
            <div className="feud-strike-slam" role="status" aria-label="Strike"><span>×</span></div>
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
              <span className="feud-fast-progress">{fastFinishing ? 5 : fastQuestionIndex + 1} OF 5</span>
              <small>{hqName} · FAST MONEY</small>
              <h1>{fastFinishing ? "LOCKING OFFICIAL SCORE…" : String(currentFastQuestion.prompt ?? "")}</h1>
              <div className="feud-fast-dots" aria-label="Fast Money progress">
                {Array.from({ length: 5 }, (_, index) => (
                  <i
                    className={index < fastAnsweredCount
                      ? "is-done"
                      : !fastFinishing && index === fastQuestionIndex ? "is-current" : ""}
                    key={index}
                  />
                ))}
              </div>
            </section>
          </div>

          <div className="feud-fast-board-progress" aria-label="Fast Money submitted answers">
            {Array.from({ length: 5 }, (_value, index) => (
              <div className={index < fastAnsweredCount ? "is-filled" : !fastFinishing && index === fastQuestionIndex ? "is-current" : ""} key={index}>
                <span>{index < fastSubmitted.length ? String(fastSubmitted[index]?.submitted_answer ?? "") : ""}</span>
              </div>
            ))}
          </div>

          <form className="feud-fast-entry" onSubmit={submitFast}>
            {feedback ? <div className="feud-feedback">{feedback}</div> : null}
            <div className="feud-fast-entry__row">
              <input
                ref={fastInputRef}
                value={answer}
                onChange={(event) => {
                  if (!fastFinishing) setAnswer(event.target.value);
                }}
                placeholder="Type your answer"
                autoCapitalize="words"
                autoCorrect="off"
                enterKeyHint="send"
                aria-label="Fast Money answer"
                aria-busy={fastFinishing}
                disabled={fastFinishing}
              />
              <button
                type="submit"
                aria-label="Submit Fast Money answer"
                onPointerDown={(event) => event.preventDefault()}
                disabled={fastFinishing}
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
              const revealed = index < fastRevealIndex || (index === fastRevealIndex && fastRevealPhase !== "answer");
              return (
                <div
                  className={[
                    "feud-fast-reveal-row",
                    revealed ? "is-revealed" : "",
                    index === fastRevealIndex ? "is-current" : "",
                    revealed && !row.counted ? "is-zero" : "",
                  ].filter(Boolean).join(" ")}
                  key={index}
                >
                  <strong>{revealed ? row.answer : ""}</strong>
                  <span>{revealed ? (row.counted ? row.points : "×") : ""}</span>
                </div>
              );
            })}
          </div>
          <div className="feud-fast-running-total">
            <span>RUNNING TOTAL</span>
            <strong>{displayedFastTotal}</strong>
          </div>
        </section>
      ) : null}

      {scene === "fast-recap" ? (
        <section className="feud-fast-recap" aria-label="Fast Money HQ answers">
          <header>
            <Brand compact />
            <div><span>FAST MONEY</span><strong>HQ ANSWERS</strong></div>
            <b>{finalFast}/{FAMILY_FEUD_FAST_MONEY_RAW_MAX}</b>
          </header>
          <div className="feud-fast-recap__list">
            {fastRevealRows.map((row, index) => (
              <article className="feud-fast-recap__card" key={index}>
                <div><b>{index + 1}</b><span>{row.prompt}</span></div>
                <section>
                  {row.accepted.slice(0, 4).map((accepted) => (
                    <span key={accepted.name}>{accepted.name} <b>{accepted.points}</b></span>
                  ))}
                  {row.accepted.length > 4 ? <small>+{row.accepted.length - 4} also accepted</small> : null}
                </section>
              </article>
            ))}
          </div>
          <button className="feud-primary-button feud-reveal-next" type="button" onClick={() => setScene("result")}>VIEW HQ SCORE</button>
        </section>
      ) : null}

      {scene === "result" ? (
        <section className="feud-result">
          <Brand compact />
          <span className="feud-result__eyebrow">FINAL RESULT</span>
          <div className="feud-result__score"><strong>{finalScore}</strong><span>/100</span></div>
          <h1>{finalScore >= 90 ? "DOMINANT RUN" : finalScore >= 80 ? "GREAT RUN" : finalScore >= 65 ? "SOLID RUN" : "TOUGH RUN"}</h1>
          <div className="feud-result__equation" aria-label="HQ score calculation">
            <span><b>{finalMain}</b><small>MAIN</small></span>
            <i>+</i>
            <span><b>{finalFast}</b><small>FAST MONEY</small></span>
            <i>=</i>
            <span className="is-total"><b>{finalScore}</b><small>HQ SCORE</small></span>
          </div>
          <div className="feud-result__breakdown">
            <p><span>MAIN BOARDS</span><strong>{finalMain}/{FAMILY_FEUD_MAIN_RAW_MAX}</strong></p>
            <p><span>FAST MONEY</span><strong>{finalFast}/{FAMILY_FEUD_FAST_MONEY_RAW_MAX}</strong></p>
          </div>
          {onExit ? <button className="feud-primary-button" type="button" onClick={onExit}>CONTINUE</button> : null}
        </section>
      ) : null}
    </main>
  );

  return createPortal(view, document.body);
}

export default OfficialSportsFeudDailyView;
