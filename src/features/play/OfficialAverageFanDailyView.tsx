import { useEffect, useMemo, useState } from "react";
import {
  type AverageFanFan,
  type AverageFanQuestion,
  type AverageFanSport,
} from "../games/averageFanEngine";
import {
  AVERAGE_FAN_GAMEPLAY_STAGE_SRC,
  FAN_LABELS,
  FanSelector,
  FinalDecision,
  GameplayFanDesk,
  HelpRail,
  MoneyRail,
  QuestionAnswerControl,
  RulesModal,
  TileBoard,
  type ResolvedQuestion,
  useAverageFanGameplayStageLayout,
  useAverageFanOpeningStageScale,
  useAverageFanScreenLock,
} from "./AverageFanPrototypePage";
import { averageFanMoneyLabel } from "./AverageFanPrototypeModel";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function records(value: unknown) {
  return Array.isArray(value)
    ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

function question(value: unknown, fallbackSport: AverageFanSport): AverageFanQuestion | null {
  const row = record(value);
  const grade = Number(row.grade);
  const format = row.format;
  if (
    typeof row.id !== "string"
    || !row.id
    || !Number.isInteger(grade)
    || grade < 1
    || grade > 5
    || typeof row.subject !== "string"
    || (format !== "short-answer" && format !== "four-choice" && format !== "true-false")
  ) return null;
  const rawChoices = Array.isArray(row.choices)
    ? row.choices.filter((choice): choice is string => typeof choice === "string")
    : [];
  const choices = rawChoices.length === 4
    ? rawChoices as [string, string, string, string]
    : undefined;
  return {
    id: row.id,
    sport: row.sport === "nfl" || row.sport === "cfb" || row.sport === "ufc"
      ? row.sport
      : fallbackSport,
    grade: grade as 1 | 2 | 3 | 4 | 5,
    subject: row.subject as AverageFanQuestion["subject"],
    format,
    prompt: typeof row.prompt === "string" ? row.prompt : "",
    answer: "",
    aliases: [],
    ...(choices ? { choices } : {}),
    explanation: "",
    contentType: "evergreen",
    difficultyNudge: 0,
    protectedFinal: false,
  };
}

function resolvedQuestions(value: unknown, sport: AverageFanSport): ResolvedQuestion[] {
  return records(value).flatMap((row) => {
    const parsedQuestion = question(row.question, sport);
    if (!parsedQuestion) return [];
    return [{
      question: parsedQuestion,
      playerAnswer: String(row.player_answer ?? ""),
      fanAnswer: String(row.fan_answer ?? ""),
      correct: row.correct === true,
      peekUsed: row.peek_used === true,
      copied: row.copied === true,
      saveConsumed: row.save_consumed === true,
      saved: row.saved === true,
      order: Number(row.order ?? 0),
    }];
  });
}

function sportFromProjection(projection: TodayChallengeProjection): AverageFanSport {
  const value = projection.publicSetup.sport;
  return value === "nfl" || value === "cfb" || value === "ufc" ? value : "ufc";
}

export function OfficialAverageFanDailyView({
  projection,
  busy,
  onAdvance,
  onExit,
}: {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: Record<string, unknown>) => void;
  onExit: () => void;
}) {
  useAverageFanScreenLock();
  const openingScale = useAverageFanOpeningStageScale();
  const { scale: stageScale, answerShift } = useAverageFanGameplayStageLayout();
  const state = projection.publicState;
  const sport = sportFromProjection(projection);
  const fan = typeof state.fan === "string" ? state.fan as AverageFanFan : null;
  const phase = String(state.phase ?? "fan-select");
  const resolved = useMemo(() => resolvedQuestions(state.resolved, sport), [sport, state.resolved]);
  const board = useMemo(
    () => records(projection.publicSetup.board)
      .map((row) => question(row, sport))
      .filter((row): row is AverageFanQuestion => Boolean(row)),
    [projection.publicSetup.board, sport],
  );
  const current = question(state.current_question, sport);
  const finalQuestion = question(state.final_question, sport);
  const lastResolution = record(state.last_resolution);
  const completed = resolved.length;
  const boardScore = Number(state.board_score ?? projection.officialAttempt?.publicResult.board_score ?? 90);
  const finalOutcome = typeof state.final_outcome === "string"
    ? state.final_outcome as "walk-away" | "correct" | "wrong"
    : null;
  const finalScore = Number(
    state.final_score
    ?? projection.officialAttempt?.normalizedScore
    ?? boardScore,
  );
  const finalMoney = finalOutcome === "correct" ? 1_000_000 : finalOutcome === "wrong" ? 25_000 : 500_000;
  const [scene, setScene] = useState<"intro" | "fan-select" | "game">(() => fan ? "game" : "intro");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [showFinalResult, setShowFinalResult] = useState(phase === "result");

  useEffect(() => {
    if (fan) setScene("game");
  }, [fan]);

  useEffect(() => {
    setAnswer("");
  }, [current?.id, finalQuestion?.id]);

  if (!fan && scene === "intro") {
    return (
      <div className="average-fan-intro average-fan-intro--plate">
        <section
          className="average-fan-intro-stage"
          aria-label="Are You Smarter Than an Average Fan? opening screen"
          style={{ transform: `translate(-50%, -50%) scale(${openingScale})` }}
        >
          <img
            className="average-fan-intro-stage__plate"
            src="/assets/average-fan/average-fan-opening-stage.png"
            alt=""
            aria-hidden="true"
          />
          <div className="average-fan-intro-stage__actions">
            <button
              className="average-fan-intro-stage__button average-fan-intro-stage__button--start"
              type="button"
              onClick={() => setScene("fan-select")}
            >
              <span aria-hidden="true">▶</span>
              <strong>START</strong>
            </button>
            <button
              className="average-fan-intro-stage__button average-fan-intro-stage__button--rules"
              type="button"
              onClick={() => setRulesOpen(true)}
            >
              <span aria-hidden="true">▤</span>
              <strong>HOW TO PLAY</strong>
            </button>
          </div>
        </section>
        <button className="average-fan-exit" type="button" onClick={onExit} aria-label="Exit Average Fan">‹ HQ</button>
        {rulesOpen ? <RulesModal onClose={() => setRulesOpen(false)} /> : null}
      </div>
    );
  }

  if (!fan) {
    return (
      <FanSelector
        sport={sport}
        onBack={() => setScene("intro")}
        onConfirm={(selectedFan) => {
          if (!busy) onAdvance({ fan: selectedFan });
        }}
      />
    );
  }

  const questionVisible = current && (phase === "question" || phase === "reveal");
  const finalReveal = phase === "final-reveal" && !showFinalResult;
  const resultVisible = phase === "result" || (phase === "final-reveal" && showFinalResult);
  const railCompleted = phase === "reveal" ? Math.max(0, completed - 1) : completed;
  const peekAnswer = typeof state.peek_answer === "string" ? state.peek_answer : null;
  const finalSubject = String(state.final_subject ?? finalQuestion?.subject ?? "");
  const finalCorrectAnswer = String(state.final_correct_answer ?? "");
  const finalExplanation = String(state.final_explanation ?? "");

  return (
    <div className="average-fan-game">
      <button className="average-fan-exit" type="button" onClick={onExit} aria-label="Exit Average Fan">‹ HQ</button>
      <section
        className="average-fan-game-stage"
        aria-label="Are You Smarter Than an Average Fan? gameplay"
        style={{ transform: `translate(-50%, -50%) scale(${stageScale})` }}
      >
        <img className="average-fan-game-stage__plate" src={AVERAGE_FAN_GAMEPLAY_STAGE_SRC} alt="" aria-hidden="true" />
        <div className={`average-fan-game-chalkboard${phase === "board" ? " is-board" : ""}`}>
          {phase === "board" ? (
            <TileBoard
              questions={board}
              resolved={resolved}
              onSelect={(selected) => {
                if (!busy) onAdvance({ question_id: selected.id });
              }}
            />
          ) : questionVisible ? (
            <section className="average-fan-question-card">
              <header>
                <b>{current.grade === 1 ? "1ST GRADE" : current.grade === 2 ? "2ND GRADE" : current.grade === 3 ? "3RD GRADE" : `${current.grade}TH GRADE`}</b>
                <span>{current.subject}</span>
              </header>
              <h2>{current.prompt}</h2>
            </section>
          ) : phase === "final-decision" ? (
            <FinalDecision
              boardScore={boardScore}
              subject={finalSubject}
              onWalk={() => { if (!busy) onAdvance({ final_decision: "walk-away" }); }}
              onGo={() => { if (!busy) onAdvance({ final_decision: "go" }); }}
            />
          ) : phase === "final-question" || finalReveal ? (
            <section className="average-fan-question-card average-fan-question-card--final">
              <header><b>FINAL</b><span>{finalQuestion?.subject ?? finalSubject}</span></header>
              <h2>{finalQuestion?.prompt ?? ""}</h2>
            </section>
          ) : resultVisible && finalOutcome ? (
            <section className="average-fan-result">
              <p>FINAL REPORT</p>
              <h2>{finalOutcome === "correct" ? "$1,000,000" : finalOutcome === "walk-away" ? "$500,000" : "$25,000"}</h2>
              <span>{finalOutcome === "correct" ? "SMARTER THAN AN AVERAGE FAN" : finalOutcome === "walk-away" ? "MONEY BANKED" : "SO CLOSE"}</span>
              <div className="average-fan-result-score"><strong>{finalScore}</strong><small>HQ PTS</small></div>
              <div className="average-fan-result-stats">
                <div><b>{resolved.filter((item) => item.correct || item.saved).length}/10</b><span>Board clears</span></div>
                <div><b>{resolved.filter((item) => item.saved).length}</b><span>Saves</span></div>
                <div><b>{averageFanMoneyLabel(finalMoney)}</b><span>Final money</span></div>
              </div>
              <div className="average-fan-result-actions">
                <button type="button" onClick={onExit}>{projection.sport === "football" ? "FOOTBALL HQ" : "BACK TO HQ"}</button>
              </div>
            </section>
          ) : null}
        </div>

        {questionVisible ? (
          <div
            className="average-fan-answer-stage"
            data-format={current.format}
            style={answerShift ? { transform: `translateY(-${answerShift}px)` } : undefined}
          >
            {phase === "question" ? (
              <>
                {peekAnswer ? (
                  <div className="average-fan-peek-banner">
                    <span><b>{FAN_LABELS[fan]} says:</b> {peekAnswer}</span>
                  </div>
                ) : null}
                <QuestionAnswerControl
                  question={current}
                  value={answer}
                  disabled={busy}
                  onChange={setAnswer}
                  onSubmit={(value) => {
                    const candidate = (value ?? answer).trim();
                    if (candidate && !busy) onAdvance({ answer: candidate });
                  }}
                />
              </>
            ) : (
              <div className={`average-fan-reveal${lastResolution.correct === true || lastResolution.saved === true ? " is-correct" : " is-wrong"}`}>
                <strong>{lastResolution.correct === true ? "CORRECT" : lastResolution.saved === true ? "SAVED!" : "NOT QUITE"}</strong>
                <p><b>Answer:</b> {String(lastResolution.correct_answer ?? "")}</p>
                <p>{String(lastResolution.explanation ?? "")}</p>
                <div className="average-fan-reveal__fan">
                  <span><b>{FAN_LABELS[fan]} answered:</b> {String(lastResolution.fan_answer ?? "")}</span>
                </div>
                {lastResolution.save_consumed === true ? (
                  <small>{lastResolution.saved === true ? "Your fan got it right — Save keeps the clean run alive." : "Save was used, but your fan missed too."}</small>
                ) : null}
                <button type="button" disabled={busy} onClick={() => onAdvance({ continue: true })}>
                  {resolved.length >= 10 ? "SEE FINAL SUBJECT" : "BACK TO BOARD"}
                </button>
              </div>
            )}
          </div>
        ) : phase === "final-question" || finalReveal ? (
          <div
            className="average-fan-answer-stage average-fan-answer-stage--final"
            data-format={finalQuestion?.format ?? "short-answer"}
            style={answerShift ? { transform: `translateY(-${answerShift}px)` } : undefined}
          >
            {phase === "final-question" && finalQuestion ? (
              <QuestionAnswerControl
                question={finalQuestion}
                value={answer}
                disabled={busy}
                onChange={setAnswer}
                onSubmit={(value) => {
                  const candidate = (value ?? answer).trim();
                  if (candidate && !busy) onAdvance({ answer: candidate });
                }}
              />
            ) : (
              <div className={`average-fan-reveal${finalOutcome === "correct" ? " is-correct" : " is-wrong"}`}>
                <strong>{finalOutcome === "correct" ? "YOU'RE A MILLIONAIRE!" : "FINAL MISS"}</strong>
                <p><b>Answer:</b> {finalCorrectAnswer}</p>
                <p>{finalExplanation}</p>
                <button type="button" onClick={() => setShowFinalResult(true)}>SEE RESULTS</button>
              </div>
            )}
          </div>
        ) : null}

        <MoneyRail
          completed={railCompleted}
          finalActive={phase === "final-decision" || phase === "final-question" || phase === "final-reveal" || resultVisible}
        />
        {phase === "board" || phase === "question" || phase === "reveal" ? (
          <HelpRail
            peekUsed={state.peek_used === true}
            copyUsed={state.copy_used === true}
            saveUsed={state.save_used === true}
            canUse={phase === "question" && !busy}
            peekActive={Boolean(peekAnswer)}
            onPeek={() => { if (!busy) onAdvance({ peek: true }); }}
            onCopy={() => { if (!busy) onAdvance({ copy: true }); }}
          />
        ) : null}
        <GameplayFanDesk fan={fan} />
      </section>
    </div>
  );
}

export default OfficialAverageFanDailyView;
