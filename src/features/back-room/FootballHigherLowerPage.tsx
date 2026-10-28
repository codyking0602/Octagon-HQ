import { HigherLowerIntro, HigherLowerRoundHeader, HigherLowerPrompt, HigherLowerChoices, HigherLowerFeedback } from "../play/HigherLowerStandard";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/football-higher-lower.css";
import "../../styles/higher-lower-standard.css";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { createReplaySeed } from "../play/lineupModel";
import {
  asChallengeJson,
  challengeRecord,
  footballChallengeUrl,
} from "./footballChallengeRuntime";
import {
  FOOTBALL_HIGHER_LOWER_GAME_ID,
  FOOTBALL_HIGHER_LOWER_VERSION,
  createFootballHigherLowerBoard,
  footballHigherLowerAnswerIsCorrect,
  parseFootballHigherLowerBoard,
  type FootballHigherLowerBoard,
  type FootballHigherLowerChoice,
  type FootballHigherLowerScope,
} from "./footballHigherLowerModel";
import {
  footballHigherLowerBrandForSubject,
  type FootballHigherLowerBrand,
} from "./footballHigherLowerBranding";

interface HigherLowerAnswer {
  questionId: string;
  choice: FootballHigherLowerChoice;
  correct: boolean;
}

interface HigherLowerResult {
  score: number;
  correct: number;
  timeMs: number;
  answers: HigherLowerAnswer[];
}

const scopeOptions: readonly {
  scope: FootballHigherLowerScope;
  label: string;
  detail: string;
}[] = [
  { scope: "NFL", label: "NFL", detail: "NFL players, seasons, awards, draft and teams" },
  { scope: "CFB", label: "COLLEGE", detail: "College players, peak seasons, awards, draft and teams" },
  { scope: "MIXED", label: "MIXED", detail: "Five NFL and five college questions" },
];

function parseScope(value: string | null): FootballHigherLowerScope | null {
  return value === "NFL" || value === "CFB" || value === "MIXED" ? value : null;
}

function formatTime(timeMs: number) {
  const seconds = timeMs / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} sec`;
  const minutes = Math.floor(seconds / 60);
  const remainder = (seconds % 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${remainder}`;
}

function categoryLabel(category: string) {
  return category.replace("-", " ").toUpperCase();
}

function cardBrandStyle(brand: FootballHigherLowerBrand | null): CSSProperties | undefined {
  if (!brand) return undefined;
  return {
    "--hl-team-primary": brand.primaryColor,
    "--hl-team-secondary": brand.secondaryColor,
  } as CSSProperties;
}

function SetupScreen({
  scope,
  onScope,
  onStart,
}: {
  scope: FootballHigherLowerScope;
  onScope: (scope: FootballHigherLowerScope) => void;
  onStart: () => void;
}) {
  return (
    <main className="page football-higher-lower">
      <HigherLowerIntro sport="FOOTBALL" onStart={onStart}
        startLabel={"START " + (scope === "CFB" ? "COLLEGE" : scope) + " BOARD"}>
        <div className="higher-lower-scope-grid" aria-label="Choose Football board">
          {scopeOptions.map(option => <button type="button" key={option.scope}
            className={option.scope === scope ? "is-selected" : ""}
            aria-pressed={option.scope === scope}
            onClick={() => onScope(option.scope)}>
            <b>{option.label}</b><span>{option.detail}</span>
          </button>)}
        </div>
      </HigherLowerIntro>
    </main>
  );
}

export default function FootballHigherLowerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const challenges = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("higher-lower");
  const [scope, setScope] = useState<FootballHigherLowerScope>(() => parseScope(searchParams.get("scope")) ?? "NFL");
  const [board, setBoard] = useState<FootballHigherLowerBoard | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<HigherLowerAnswer[]>([]);
  const [revealedChoice, setRevealedChoice] = useState<FootballHigherLowerChoice | null>(null);
  const [result, setResult] = useState<HigherLowerResult | null>(null);
  const [challengeStatus, setChallengeStatus] = useState("");
  const activeTimerStartedAt = useRef<number | null>(null);
  const activeElapsedMs = useRef(0);
  const sharedSeed = searchParams.get("seed");
  useLayoutEffect(() => {
    if (board && !result) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [questionIndex, board?.seed, Boolean(result)]);

  const challengeBoard = useMemo(() => {
    const setup = challengeRecord(profileMatch.challenge?.setup);
    return parseFootballHigherLowerBoard(setup?.board);
  }, [profileMatch.challenge?.setup]);

  useEffect(() => {
    if (!challengeBoard) return;
    setScope(challengeBoard.scope);
    setBoard(challengeBoard);
    setQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    setRevealedChoice(null);
  }, [challengeBoard]);

  useEffect(() => {
    if (profileMatch.code || board || !sharedSeed) return;
    const sharedScope = parseScope(searchParams.get("scope")) ?? "NFL";
    setScope(sharedScope);
    setBoard(createFootballHigherLowerBoard(sharedSeed, sharedScope));
  }, [board, profileMatch.code, searchParams, sharedSeed]);

  useEffect(() => {
    if (!board || result) return undefined;

    activeElapsedMs.current = 0;
    activeTimerStartedAt.current = document.visibilityState === "visible" ? performance.now() : null;

    const pause = () => {
      if (activeTimerStartedAt.current == null) return;
      activeElapsedMs.current += performance.now() - activeTimerStartedAt.current;
      activeTimerStartedAt.current = null;
    };
    const resume = () => {
      if (activeTimerStartedAt.current != null || document.visibilityState !== "visible") return;
      activeTimerStartedAt.current = performance.now();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") resume();
      else pause();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", pause);
    window.addEventListener("pageshow", resume);

    return () => {
      pause();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", pause);
      window.removeEventListener("pageshow", resume);
    };
  }, [board?.seed, Boolean(result)]);

  function activePlayTimeMs() {
    const currentSlice = activeTimerStartedAt.current == null
      ? 0
      : performance.now() - activeTimerStartedAt.current;
    return Math.max(1, Math.round(activeElapsedMs.current + currentSlice));
  }

  function startNew(nextScope = scope) {
    const seed = createReplaySeed(FOOTBALL_HIGHER_LOWER_GAME_ID);
    setScope(nextScope);
    setBoard(createFootballHigherLowerBoard(seed, nextScope));
    setQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    setRevealedChoice(null);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finish(nextAnswers: HigherLowerAnswer[]) {
    if (!board) return;
    const correct = nextAnswers.filter((answer) => answer.correct).length;
    const timeMs = activePlayTimeMs();
    const nextResult: HigherLowerResult = {
      score: correct,
      correct,
      timeMs,
      answers: nextAnswers,
    };
    setResult(nextResult);
    profileMatch.submitResult(asChallengeJson(nextResult));
  }

  function answer(choice: FootballHigherLowerChoice) {
    if (!board || result || revealedChoice) return;
    const question = board.questions[questionIndex];
    if (!question) return;
    const correct = footballHigherLowerAnswerIsCorrect(question, choice);
    const nextAnswers = [...answers, { questionId: question.id, choice, correct }];
    setAnswers(nextAnswers);
    setRevealedChoice(choice);

    window.setTimeout(() => {
      if (questionIndex >= board.questions.length - 1) {
        finish(nextAnswers);
        setRevealedChoice(null);
        return;
      }
      setQuestionIndex((current) => current + 1);
      setRevealedChoice(null);
    }, 650);
  }

  async function challengeSomeone() {
    if (!board || !result) return;
    setChallengeStatus("");
    const status = await challenges.beginChallenge({
      gameId: "higher-lower",
      gameVersion: FOOTBALL_HIGHER_LOWER_VERSION,
      gameTitle: "Football Higher or Lower",
      summary: `${board.scope === "CFB" ? "College" : board.scope} · ${result.correct}/10 · ${formatTime(result.timeMs)}`,
      setup: asChallengeJson({ board }),
      creatorResult: asChallengeJson(result),
      shareTitle: "Football Higher or Lower Challenge",
      shareText: "I challenged you to the exact same 10-question Football Higher or Lower board.",
      shareUrl: footballChallengeUrl("/football/higher-lower", {
        seed: board.seed,
        scope: board.scope,
      }),
    });
    setChallengeStatus(status);
  }

  if (profileMatch.code && !profileMatch.challenge) {
    return (
      <main className="page football-higher-lower">
        <section className="higher-lower-loading">
          <p className="eyebrow">FOOTBALL CHALLENGE</p>
          <h1>HIGHER OR LOWER</h1>
          <p>{challenges.loading ? "Loading the frozen challenge board…" : "That challenge is not available on this profile."}</p>
          <button type="button" onClick={() => navigate("/football")}>BACK TO FOOTBALL HQ</button>
        </section>
      </main>
    );
  }

  if (profileMatch.challenge && !challengeBoard) {
    return (
      <main className="page football-higher-lower">
        <section className="higher-lower-loading">
          <p className="eyebrow">FOOTBALL CHALLENGE</p>
          <h1>HIGHER OR LOWER</h1>
          <p>This challenge board could not be verified.</p>
          <button type="button" onClick={() => navigate("/football")}>BACK TO FOOTBALL HQ</button>
        </section>
      </main>
    );
  }

  if (!board) {
    return <SetupScreen scope={scope} onScope={setScope} onStart={() => startNew(scope)} />;
  }

  if (result) {
    return (
      <main className="page football-higher-lower">
        {profileMatch.creator ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{profileMatch.creator.displayName} sent this exact Higher or Lower board.</strong>
            <small>Accuracy decides it. Time only breaks a tie.</small>
          </section>
        ) : null}

        <section className="higher-lower-result">
          <p className="eyebrow">{result.correct === 10 ? "PERFECT BOARD" : "FINAL RESULT"}</p>
          <h1>{result.correct} / 10</h1>
          <strong>{formatTime(result.timeMs)}</strong>
          <p>{result.correct === 10
            ? "Perfect. Nothing left for the tiebreaker unless your opponent matches it."
            : "Your accuracy is locked. Completion time matters only if your opponent matches your score."}</p>
        </section>

        <section className="higher-lower-review">
          <header>
            <span>QUESTION + FINAL NUMBERS</span>
            <strong>YOUR CALL</strong>
            <em>ANSWER</em>
          </header>
          {board.questions.map((question, index) => {
            const answerRow = result.answers[index];
            return (
              <div className={answerRow?.correct ? "is-correct" : "is-wrong"} key={question.id}>
                <span className="higher-lower-review__question">
                  <small>Q{index + 1} · {categoryLabel(question.category)} · {question.metricLabel}</small>
                  <span className="higher-lower-review__matchup">
                    <span>
                      <b>{question.known.name}</b>
                      <em>{question.known.formattedValue}</em>
                    </span>
                    <i aria-hidden="true">→</i>
                    <span>
                      <b>{question.hidden.name}</b>
                      <em>{question.hidden.formattedValue}</em>
                    </span>
                  </span>
                  <span className="higher-lower-review__context">
                    {question.known.context} vs {question.hidden.context}
                  </span>
                </span>
                <strong>{answerRow?.choice?.toUpperCase() ?? "—"}</strong>
                <em>{question.answer.toUpperCase()}</em>
              </div>
            );
          })}
        </section>

        <GameResultActions
          onChallenge={() => void challengeSomeone()}
          onReplay={() => startNew(board.scope)}
          onAllGames={() => navigate("/football")}
          replayLabel="NEW BOARD"
          status={challengeStatus}
        />
      </main>
    );
  }

  const question = board.questions[questionIndex]!;
  const knownBrand = footballHigherLowerBrandForSubject(question.known.subjectId);
  const hiddenBrand = footballHigherLowerBrandForSubject(question.hidden.subjectId);
  const answered = Boolean(revealedChoice);
  const wasCorrect = answered && footballHigherLowerAnswerIsCorrect(question, revealedChoice!);

  return (
    <main className="page football-higher-lower">
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent this exact Higher or Lower board.</strong>
          <small>Same questions, values and order. Accuracy first, time second.</small>
        </section>
      ) : null}

      <HigherLowerRoundHeader sport={board.scope === "CFB" ? "COLLEGE" : board.scope}
        index={questionIndex} correct={answers.filter(row => row.correct).length}
        completed={questionIndex + (answered ? 1 : 0)}
        onBack={() => navigate("/football")} backLabel="Back to Football HQ" />
      <HigherLowerPrompt category={categoryLabel(question.category)}
        metric={question.metricLabel} note={question.note} />

      <section className="higher-lower-matchup">
        <article
          className="higher-lower-card is-known"
          style={cardBrandStyle(knownBrand)}
        >
          <div className="higher-lower-card__identity">
            {knownBrand?.logoSrc ? (
              <span className="higher-lower-card__logo">
                <img src={knownBrand.logoSrc} alt="" aria-hidden="true" />
              </span>
            ) : null}
            <span>{question.known.context}</span>
          </div>
          <h3>{question.known.name}</h3>
          <strong>{question.known.formattedValue}</strong>
        </article>

        <div className="higher-lower-vs">VS</div>

        <article
          className={`higher-lower-card is-hidden${answered ? " is-revealed" : ""}`}
          style={cardBrandStyle(hiddenBrand)}
        >
          <div className="higher-lower-card__identity">
            {hiddenBrand?.logoSrc ? (
              <span className="higher-lower-card__logo">
                <img src={hiddenBrand.logoSrc} alt="" aria-hidden="true" />
              </span>
            ) : null}
            <span>{question.hidden.context}</span>
          </div>
          <h3>{question.hidden.name}</h3>
          <strong>{answered ? question.hidden.formattedValue : "?"}</strong>
        </article>
      </section>

      <HigherLowerChoices revealed={revealedChoice} answer={question.answer} onChoose={answer} />
      <HigherLowerFeedback correct={!answered ? null : wasCorrect}
        detail={answered ? question.hidden.formattedValue + " is " + question.answer + " than " + question.known.formattedValue + "." : undefined} />
    </main>
  );
}
