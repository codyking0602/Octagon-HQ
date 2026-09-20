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
import {
  FAMILY_FEUD_BOARD_ANSWER_COUNT,
  FAMILY_FEUD_FAST_MONEY_TIME_MS,
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
} from "../games/familyFeudEngine";
import { isFamilyFeudPrototypeOwner } from "./familyFeudPrototypeAccess";
import { familyFeudPrototypePack } from "./familyFeudPrototypePacks";
import {
  SPORTS_FEUD_FAST_MONEY_STAGE_ASSET,
  SPORTS_FEUD_MAIN_STAGE_ASSET,
  sportsFeudHostAsset,
  type SportsFeudHostSport,
} from "./sportsFeudPresentation";
import "./FamilyFeudPrototypePage.css";

type PrototypeScope = "ufc" | "football";
type PrototypeScene = "intro" | "main" | "fast-intro" | "fast" | "reveal" | "result";

function formatClock(ms: number) {
  return "0:" + String(Math.ceil(ms / 1000)).padStart(2, "0");
}

function feedbackCopy(outcome: FamilyFeudOutcome | null) {
  if (!outcome) return "";
  switch (outcome.type) {
    case "board-correct": return "+" + outcome.points + " HQ POINTS";
    case "board-strike": return "STRIKE — KEEP GOING";
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
  return <img className="feud-fast-host-asset" src={asset} alt="" aria-hidden="true" />;
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
  const hqName = scope === "football" ? "FOOTBALL HQ" : "UFC HQ";
  const hostSport: SportsFeudHostSport = scope === "ufc" ? "ufc" : "nfl";
  const hostAsset = useMemo(() => sportsFeudHostAsset(hostSport), [hostSport]);
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
    }, 430);
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
    const settled = settledBoard.revealedEntityIds.length >= FAMILY_FEUD_BOARD_ANSWER_COUNT
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
  const mainBoardPoints = familyFeudMainBoardScore(pack, state, displayBoardIndex);
  const foundIds = new Set(mainBoardState.revealedEntityIds);
  const foundMainAnswers = mainBoardState.revealedEntityIds
    .map((entityId) => mainQuestion.answers.find((row) => row.entityId === entityId))
    .filter((row): row is FamilyFeudRankedAnswer => Boolean(row))
    .sort((left, right) => right.points - left.points || left.entityId.localeCompare(right.entityId));
  const missedReviewAnswers = boardReview && foundMainAnswers.length < FAMILY_FEUD_BOARD_ANSWER_COUNT
    ? mainQuestion.answers
        .filter((row) => !foundIds.has(row.entityId))
        .slice(0, FAMILY_FEUD_BOARD_ANSWER_COUNT - foundMainAnswers.length)
    : [];
  const mainDisplayAnswers = [...foundMainAnswers, ...missedReviewAnswers]
    .sort((left, right) => right.points - left.points || left.entityId.localeCompare(right.entityId));

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
  const revealedFastTotal = fastRevealRows
    .slice(0, revealCount)
    .reduce((total, row) => total + row.points, 0);

  const view = (
    <main className={"family-feud-prototype feud-scene--" + scene} data-scope={scope} data-scene={scene}>
      <StagePlate />
      <StagePlate fast />
      <HQBackButton onClick={() => navigate(exitRoute)} />

      {scene === "intro" ? (
        <section className="feud-intro" aria-labelledby="feud-intro-title">
          <div className="feud-intro__eyebrow">{hqName} · DAILY CHALLENGE</div>
          <Brand />
          <h1 id="feud-intro-title">Clear the board.</h1>
          <p>Find four good HQ answers before three strikes. Then finish five Fast Money prompts.</p>
          <div className="feud-intro__rules">
            <span><b>2</b> BOARDS</span>
            <span><b>4</b> ANSWERS EACH</span>
            <span><b>0:45</b> FAST MONEY</span>
          </div>
          <button className="feud-primary-button" type="button" onClick={startGame}>PLAY SPORTS FEUD</button>
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
                    rankedAnswer && !found ? "is-missed" : "",
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
            <strong>{mainBoardPoints}</strong>
            <em>/ {FAMILY_FEUD_MAIN_BOARD_MAX}</em>
          </div>

          {boardReview ? (
            <section className="feud-round-review">
              <strong>
                {mainBoardState.revealedEntityIds.length >= FAMILY_FEUD_BOARD_ANSWER_COUNT
                  ? "BOARD CLEARED"
                  : "3 STRIKES — BOARD CLOSED"}
              </strong>
              <span>{mainBoardPoints}/{FAMILY_FEUD_MAIN_BOARD_MAX} HQ points banked.</span>
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
          <div className="feud-fast-intro__show">
            <FastMoneyHost asset={hostAsset} />
            <div>
              <span className="feud-fast-intro__kicker">YOU MADE THE FINALE</span>
              <h1>FAST MONEY</h1>
              <div className="feud-fast-intro__clock">0:45</div>
            </div>
          </div>
          <p>Five prompts. One answer each. Points stay hidden until the clock stops.</p>
          <button className="feud-primary-button" type="button" onClick={startFastMoney}>START 45 SECONDS</button>
        </section>
      ) : null}

      {scene === "fast" ? (
        <section className="feud-fast-stage">
          <header>
            <Brand compact />
            <div className={timeRemainingMs <= 10_000 ? "feud-fast-clock is-low" : "feud-fast-clock"}>
              {formatClock(timeRemainingMs)}
            </div>
            <span className="feud-fast-progress">{state.fastMoneyIndex + 1} OF 5</span>
          </header>

          <div className="feud-fast-showdown">
            <FastMoneyHost asset={hostAsset} />
            <section className="feud-fast-question">
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
            <div className="feud-feedback" data-kind={feedback?.type ?? "idle"}>
              {feedbackCopy(feedback) || "ONE ANSWER — KEEP MOVING"}
            </div>
            <div className="feud-fast-entry__row">
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
              <button type="submit" aria-label="Submit Fast Money answer">↑</button>
            </div>
          </form>
        </section>
      ) : null}

      {scene === "reveal" ? (
        <section className="feud-reveal-stage">
          <header>
            <Brand compact />
            <span>FAST MONEY RESULTS</span>
            <strong>{revealedFastTotal}/{FAMILY_FEUD_FAST_MONEY_RAW_MAX}</strong>
          </header>

          <div className="feud-reveal-cards">
            {fastRevealRows.map((row, index) => (
              <article className={index < revealCount ? "feud-reveal-card is-revealed" : "feud-reveal-card"} key={index}>
                <div className="feud-reveal-card__prompt">
                  <b>{index + 1}</b>
                  <span>{index < revealCount ? row.prompt : "—"}</span>
                </div>
                {index < revealCount ? (
                  <>
                    <div className={row.counted ? "feud-reveal-card__you is-counted" : "feud-reveal-card__you is-x"}>
                      <small>YOU SAID</small>
                      <strong>{row.answer}</strong>
                      <b>{row.counted ? "+" + row.points : "X"}</b>
                    </div>
                    <div className="feud-reveal-card__hq">
                      <small>TOP HQ ANSWERS</small>
                      <div>
                        {row.accepted.slice(0, 4).map((accepted) => (
                          <span key={accepted.name}>
                            {accepted.name} <b>{accepted.points}</b>
                          </span>
                        ))}
                      </div>
                      {row.accepted.length > 4 ? (
                        <p className="feud-reveal-card__more">+{row.accepted.length - 4} also accepted</p>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </article>
            ))}
          </div>

          {revealCount >= 5 ? (
            <button className="feud-primary-button feud-reveal-next" type="button" onClick={() => setScene("result")}>
              VIEW HQ SCORE
            </button>
          ) : (
            <p className="feud-reveal-stage__wait">HQ BOARD REVEALING…</p>
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

export default function FamilyFeudPrototypePage({ scope }: { scope: PrototypeScope }) {
  const identity = useIdentity();
  const exitRoute = scope === "football" ? "/football" : "/play";

  if (!identity.ready) return null;
  if (!isFamilyFeudPrototypeOwner(identity.profile)) {
    return <Navigate to={exitRoute} replace />;
  }

  return <FamilyFeudPrototypeExperience scope={scope} />;
}
