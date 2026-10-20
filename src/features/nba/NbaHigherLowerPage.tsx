import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/football-higher-lower.css";
import "../../styles/nba-higher-lower.css";
import "../../styles/nba-game-actions.css";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { asChallengeJson, challengeRecord, footballChallengeUrl } from "../back-room/footballChallengeRuntime";
import { nbaHigherLowerIsGenericSilhouette, nbaHigherLowerPortraitSource } from "./nbaHigherLowerPortraits";
import {
  NBA_HIGHER_LOWER_VERSION, createNbaHigherLowerBoard, createNbaHigherLowerRun,
  createNbaHigherLowerDailyPreview, nbaHigherLowerAnswerIsCorrect,
  parseNbaHigherLowerBoard, recordLineupCompletion,
  type NbaHigherLowerBoard, type NbaHigherLowerQuestion, type NbaHigherLowerChoice, type NbaHigherLowerSubject,
} from "./nbaHigherLowerModel";
import type { PlayLineupIdentity } from "../play/lineupModel";

interface Answer { questionId: string; choice: NbaHigherLowerChoice; correct: boolean; }
interface Result { score: number; correct: number; timeMs: number; answers: Answer[]; }
const nbaTheme = { "--hl-team-primary": "#e49a3d", "--hl-team-secondary": "#f6cf93" } as CSSProperties;

function chicagoDay() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find(row => row.type === type)?.value ?? "00";
  return part("year") + "-" + part("month") + "-" + part("day");
}
function formatTime(ms: number) {
  const seconds = ms / 1000;
  return seconds < 60 ? seconds.toFixed(1) + " sec"
    : Math.floor(seconds / 60) + ":" + (seconds % 60).toFixed(1).padStart(4, "0");
}
function reviewContext(question: NbaHigherLowerQuestion): string | null {
  if (question.category === "career" || question.category === "awards") return null;
  if (question.category === "season") {
    const season = (year?: number) => year == null ? "" : (year - 1) + "–" + String(year).slice(-2);
    const known = season(question.known.season), hidden = season(question.hidden.season);
    return known === hidden ? known : known + " vs " + hidden;
  }
  const known = question.known.context.replace(" NBA DRAFT", "");
  const hidden = question.hidden.context.replace(" NBA DRAFT", "");
  return known === hidden ? known + " NBA Draft" : known + " vs " + hidden + " NBA Draft";
}
function NbaPortrait({ subject }: { subject: NbaHigherLowerSubject }) {
  const [failed, setFailed] = useState(false);
  const url = nbaHigherLowerPortraitSource(subject);
  const editorial = url != null && !url.includes("/headshots/nba/latest/");
  useEffect(() => setFailed(false), [url, subject.name]);
  const initials = subject.name.split(/\s+/).map(part => part[0]).filter(Boolean).slice(0, 2).join("");
  return <span className={"nba-higher-lower-portrait" + (editorial ? " is-editorial" : "")} role="img" aria-label={subject.name + " portrait"}>
    {url && !failed
      ? <img src={url} alt="" loading="eager" referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          onLoad={event => {
            if (!editorial && nbaHigherLowerIsGenericSilhouette(event.currentTarget)) setFailed(true);
          }} />
      : <b aria-hidden="true">{initials || "NBA"}</b>}
  </span>;
}
function ResultActions({ onReplay, onAllGames, status }: {
  onReplay: () => void; onAllGames: () => void; status: string;
}) {
  return <div className="game-result-actions-wrap">
    <div className="game-result-actions">
      <button className="primary-action" type="button" onClick={onReplay}>NEW BOARD</button>
      <button className="find-secondary-action" type="button" onClick={onAllGames}>ALL NBA GAMES</button>
    </div>
    <p className="game-action-status" role="status">{status}</p>
  </div>;
}
export default function NbaHigherLowerPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const challenges = usePlayChallenges();
  const match = useProfileChallengeMatch("higher-lower");
  const daily = params.get("mode") === "daily";
  const profileBoard = parseNbaHigherLowerBoard(challengeRecord(match.challenge?.setup)?.board);
  const sharedSeed = params.get("seed");
  const [board, setBoard] = useState<NbaHigherLowerBoard | null>(() =>
    daily ? createNbaHigherLowerDailyPreview(chicagoDay()).board : null);
  const [identity, setIdentity] = useState<PlayLineupIdentity | null>(() =>
    daily ? createNbaHigherLowerDailyPreview(chicagoDay()).identity : null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [revealed, setRevealed] = useState<NbaHigherLowerChoice | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState("");
  const timerStartedAt = useRef<number | null>(null);
  const boardHeaderRef = useRef<HTMLElement | null>(null);
  const accumulatedMs = useRef(0);

  useEffect(() => {
    if (!profileBoard) return;
    setBoard(profileBoard); setIdentity(null); setIndex(0); setAnswers([]);
    setRevealed(null); setResult(null);
  }, [match.challenge?.code]);
  useEffect(() => {
    if (match.code || board || !sharedSeed) return;
    setBoard(createNbaHigherLowerBoard(sharedSeed));
  }, [match.code, board, sharedSeed]);
  // A new question must never inherit the previous question's iPhone scroll
  // position and hide its heading under the sticky HQ navigation.
  useLayoutEffect(() => {
    if (!board || result) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    // Covers any nested scrolling region without scrolling the HQ shell away.
    boardHeaderRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [index, board?.seed, Boolean(result)]);
  useEffect(() => {
    if (!board || result) return;
    accumulatedMs.current = 0;
    timerStartedAt.current = document.visibilityState === "visible" ? performance.now() : null;
    const pause = () => {
      if (timerStartedAt.current == null) return;
      accumulatedMs.current += performance.now() - timerStartedAt.current;
      timerStartedAt.current = null;
    };
    const resume = () => {
      if (timerStartedAt.current != null || document.visibilityState !== "visible") return;
      timerStartedAt.current = performance.now();
    };
    const visibility = () => document.visibilityState === "visible" ? resume() : pause();
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", pause);
    window.addEventListener("pageshow", resume);
    return () => {
      pause();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", pause);
      window.removeEventListener("pageshow", resume);
    };
  }, [board?.seed, Boolean(result)]);
  function timeMs() {
    return Math.max(1, Math.round(accumulatedMs.current +
      (timerStartedAt.current == null ? 0 : performance.now() - timerStartedAt.current)));
  }
  function reset(nextBoard: NbaHigherLowerBoard, nextIdentity: PlayLineupIdentity | null) {
    setBoard(nextBoard); setIdentity(nextIdentity); setIndex(0); setAnswers([]);
    setRevealed(null); setResult(null); setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function newBoard() {
    if (daily) {
      const preview = createNbaHigherLowerDailyPreview(chicagoDay());
      reset(preview.board, preview.identity);
    } else if (match.code && board) {
      reset(board, null);
    } else {
      const next = createNbaHigherLowerRun();
      reset(next.board, next.identity);
    }
  }
  function answer(choice: NbaHigherLowerChoice) {
    if (!board || result || revealed) return;
    const question = board.questions[index];
    if (!question) return;
    const correct = nbaHigherLowerAnswerIsCorrect(question, choice);
    const nextAnswers = [...answers, { questionId: question.id, choice, correct }];
    setAnswers(nextAnswers);
    setRevealed(choice);
    window.setTimeout(() => {
      if (index === board.questions.length - 1) {
        const numberCorrect = nextAnswers.filter(item => item.correct).length;
        const final: Result = { score: numberCorrect, correct: numberCorrect, timeMs: timeMs(), answers: nextAnswers };
        setResult(final);
        if (identity) recordLineupCompletion(identity, final);
        match.submitResult(asChallengeJson(final));
      } else setIndex(current => current + 1);
      setRevealed(null);
    }, 650);
  }
  // Challenges still use the canonical frozen-board contract. Invitations are hidden
  // during owner-only playtesting so non-owners never receive an inaccessible link.
  async function challengeSomeone() {
    if (!board || !result) return;
    const outcome = await challenges.beginChallenge({
      gameId: "higher-lower", gameVersion: NBA_HIGHER_LOWER_VERSION,
      gameTitle: "NBA Higher or Lower",
      summary: "NBA · " + result.correct + "/10 · " + formatTime(result.timeMs),
      setup: asChallengeJson({ board }), creatorResult: asChallengeJson(result),
      shareTitle: "NBA Higher or Lower Challenge",
      shareText: "Play the exact same 10 NBA Higher or Lower questions.",
      shareUrl: footballChallengeUrl("/nba/higher-lower", { seed: board.seed }),
    });
    setStatus(outcome);
  }
  void challengeSomeone;
  const shell = "page football-higher-lower nba-higher-lower";
  if (match.code && !match.challenge) {
    return <main className={shell} style={nbaTheme}><section className="higher-lower-loading">
      <p className="eyebrow">NBA OWNER PREVIEW</p><h1>HIGHER OR LOWER</h1>
      <p>{challenges.loading ? "Loading the frozen challenge board…" : "This challenge is not available on this profile."}</p>
      <button type="button" onClick={() => navigate("/nba")}>BACK TO NBA HQ</button>
    </section></main>;
  }
  if (match.challenge && !profileBoard) {
    return <main className={shell} style={nbaTheme}><section className="higher-lower-loading">
      <h1>HIGHER OR LOWER</h1><p>This challenge board could not be verified.</p>
      <button type="button" onClick={() => navigate("/nba")}>BACK TO NBA HQ</button>
    </section></main>;
  }
  if (!board) return <main className={shell} style={nbaTheme}>
    <section className="higher-lower-hero nba-higher-lower-intro">
      <p className="eyebrow">NBA · OWNER PREVIEW</p>
      <h1>HIGHER OR LOWER</h1>
      <p className="nba-higher-lower-intro__copy">Ten quick comparisons. Know the player, make the call.</p>
      <div className="nba-higher-lower-intro__highlights" aria-label="Game rules">
        <span>10 QUESTIONS</span><span>EASY TO TOUGH</span><span>ACCURACY FIRST</span>
      </div>
      <p className="nba-higher-lower-intro__topics">Career &amp; season stats · 3-pointers · Honors · Draft picks</p>
      <button className="higher-lower-start" type="button" onClick={newBoard}>START NBA BOARD</button>
    </section>
  </main>;

  if (result) return <main className={shell} style={nbaTheme}>
    {daily && <p className="nba-higher-lower-preview">OWNER DAILY PREVIEW · Unranked. No Daily leaderboard score is submitted.</p>}
    <section className="higher-lower-result">
      <p className="eyebrow">{result.correct === 10 ? "PERFECT BOARD" : "FINAL RESULT"}</p>
      <h1>{result.correct} / 10</h1><strong>{formatTime(result.timeMs)}</strong>
      <p>Accuracy comes first. Time only decides a tied head-to-head challenge.</p>
    </section>
    <section className="higher-lower-review">
      <header><span>QUESTION · FINAL NUMBERS</span><strong>YOUR PICK</strong><em>ANSWER</em></header>
      {board.questions.map((question, number) => {
        const call = result.answers[number];
        return <div key={question.id} className={call?.correct ? "is-correct" : "is-wrong"}>
          <span className="higher-lower-review__question">
            <small>Q{number + 1} · {question.category.toUpperCase()} · {question.metricLabel}</small>
            <span className="higher-lower-review__matchup">
              <span><b>{question.known.name}</b><em>{question.known.formattedValue}</em></span>
              <i aria-hidden="true">→</i>
              <span><b>{question.hidden.name}</b><em>{question.hidden.formattedValue}</em></span>
            </span>
            {reviewContext(question) && <span className="higher-lower-review__context">{reviewContext(question)}</span>}
          </span>
          <strong>{call?.choice.toUpperCase() ?? "—"}</strong><em>{question.answer.toUpperCase()}</em>
        </div>;
      })}
    </section>
    <ResultActions onReplay={newBoard} onAllGames={() => navigate("/nba")} status={status} />
  </main>;

  const question = board.questions[index]!;
  const correct = revealed ? nbaHigherLowerAnswerIsCorrect(question, revealed) : false;
  return <main className={shell} style={nbaTheme}>
    {daily && <p className="nba-higher-lower-preview">OWNER DAILY PREVIEW · Not ranked</p>}
    {match.creator && <section className="challenge-game-banner">
      <span>PROFILE CHALLENGE</span><strong>{match.creator.displayName} sent this exact NBA Higher or Lower board.</strong>
      <small>Same questions and order. Accuracy first; time only breaks a tie.</small>
    </section>}
    <section className="higher-lower-game-header" ref={boardHeaderRef}>
      <button type="button" onClick={() => navigate("/nba")} aria-label="Back to NBA HQ">←</button>
      <div><small>NBA · QUESTION {index + 1} OF 10</small><strong>HIGHER OR LOWER</strong></div>
      <span>{answers.filter(row => row.correct).length}/{answers.length}</span>
    </section>
    <div className="higher-lower-progress" aria-hidden="true">
      <i style={{ width: ((index + (revealed ? 1 : 0)) / board.questions.length * 100) + "%" }} />
    </div>
    <section className="higher-lower-stat-label">
      <small>{question.category.toUpperCase()}</small><h2>{question.metricLabel}</h2>
      {question.note && <p>{question.note}</p>}
    </section>
    <section className="higher-lower-matchup">
      <article className="higher-lower-card is-known">
        <div className="higher-lower-card__identity"><span>{question.known.context}</span></div>
        <NbaPortrait subject={question.known} /><h3>{question.known.name}</h3>
        <strong>{question.known.formattedValue}</strong>
      </article>
      <div className="higher-lower-vs">VS</div>
      <article className={"higher-lower-card is-hidden" + (revealed ? " is-revealed" : "")}>
        <div className="higher-lower-card__identity"><span>{question.hidden.context}</span></div>
        <NbaPortrait subject={question.hidden} /><h3>{question.hidden.name}</h3>
        <strong>{revealed ? question.hidden.formattedValue : "?"}</strong>
      </article>
    </section>
    <section className="higher-lower-controls" aria-label="Higher or lower choice">
      <button type="button" disabled={Boolean(revealed)}
        className={revealed && question.answer === "higher" ? "is-answer" : revealed === "higher" ? "is-miss" : ""}
        onClick={() => answer("higher")}><b>↑</b><span>HIGHER</span></button>
      <button type="button" disabled={Boolean(revealed)}
        className={revealed && question.answer === "lower" ? "is-answer" : revealed === "lower" ? "is-miss" : ""}
        onClick={() => answer("lower")}><b>↓</b><span>LOWER</span></button>
    </section>
    <div className={"higher-lower-feedback" + (revealed ? " is-visible" : "")} role="status">
      {revealed && <><strong>{correct ? "CORRECT" : "MISS"}</strong>
        <span>{question.hidden.formattedValue} is {question.answer} than {question.known.formattedValue}.</span></>}
    </div>
  </main>;
}
