import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  AVERAGE_FAN_REPORT_CARDS,
  AVERAGE_FAN_SUBJECTS,
  averageFanAnswersMatch,
  averageFanFanAnswer,
  scoreAverageFanBoard,
  scoreAverageFanFinal,
  type AverageFanFan,
  type AverageFanQuestion,
  type AverageFanReportGrade,
} from "../games/averageFanEngine";
import {
  AVERAGE_FAN_MONEY_LADDER,
  AVERAGE_FAN_UFC_PREVIEW_BOARD,
  AVERAGE_FAN_UFC_PREVIEW_FINAL,
  averageFanGradeLabel,
  averageFanMoneyLabel,
  resolveAverageFanPreviewAnswer,
} from "./AverageFanPrototypeModel";
import "./AverageFanPrototypePage.css";

type PrototypeScene = "intro" | "fan-select" | "game";
type GamePhase = "board" | "question" | "reveal" | "final-decision" | "final-question" | "final-reveal" | "result";
type FinalOutcome = "walk-away" | "correct" | "wrong";

type ResolvedQuestion = {
  question: AverageFanQuestion;
  playerAnswer: string;
  fanAnswer: string;
  correct: boolean;
  peekUsed: boolean;
  copied: boolean;
  saveConsumed: boolean;
  saved: boolean;
  order: number;
};

const FAN_ORDER: readonly AverageFanFan[] = ["shane", "cody", "lib", "tyler", "troy"];
const FAN_LABELS: Record<AverageFanFan, string> = {
  shane: "SHANE",
  cody: "CODY",
  lib: "LIB",
  tyler: "TYLER",
  troy: "TROY",
};

function AverageFanLogo() {
  return (
    <div className="average-fan-logo" aria-label="Are You Smarter Than an Average Fan?">
      <span className="average-fan-logo__top">ARE YOU</span>
      <strong className="average-fan-logo__hero">SMARTER</strong>
      <span className="average-fan-logo__mid">THAN AN</span>
      <strong className="average-fan-logo__bottom">AVERAGE FAN?</strong>
    </div>
  );
}

function ChalkDoodles() {
  return (
    <div className="average-fan-chalk" aria-hidden="true">
      <span className="average-fan-chalk__football">Football</span>
      <span className="average-fan-chalk__ufc">UFC</span>
      <span className="average-fan-chalk__college">College<br />Sports</span>
      <i className="average-fan-chalk__ball" />
      <i className="average-fan-chalk__goalpost" />
      <i className="average-fan-chalk__glove">✦</i>
      <i className="average-fan-chalk__route route-a">↗</i>
      <i className="average-fan-chalk__route route-b">↙</i>
      <i className="average-fan-chalk__route route-c">↘</i>
    </div>
  );
}

function HostArt({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`average-fan-host${compact ? " average-fan-host--compact" : ""}`} aria-label="Pat McAfee host">
      <div className="average-fan-host__hair" />
      <div className="average-fan-host__head">
        <i className="average-fan-host__eye eye-left" />
        <i className="average-fan-host__eye eye-right" />
        <i className="average-fan-host__smile" />
      </div>
      <div className="average-fan-host__neck" />
      <div className="average-fan-host__torso">
        <span className="average-fan-host__lapel lapel-left" />
        <span className="average-fan-host__lapel lapel-right" />
        <span className="average-fan-host__shirt" />
      </div>
      <div className="average-fan-host__arm">
        <span className="average-fan-host__hand" />
      </div>
      <span className="average-fan-host__watch" />
    </div>
  );
}

function StudioBackdrop() {
  return (
    <div className="average-fan-studio" aria-hidden="true">
      <i className="average-fan-light light-one" />
      <i className="average-fan-light light-two" />
      <i className="average-fan-light light-three" />
      <i className="average-fan-light light-four" />
      <div className="average-fan-stands" />
    </div>
  );
}

function StudioProps() {
  return (
    <div className="average-fan-props" aria-hidden="true">
      <div className="average-fan-books">
        <span>FOOTBALL</span>
        <span>UFC</span>
        <span>COLLEGE SPORTS</span>
      </div>
      <div className="average-fan-football" />
      <div className="average-fan-mug">FOR<br />THE<br />FANS.</div>
      <div className="average-fan-nameplate">FOR THE FANS</div>
      <div className="average-fan-mini-player">1</div>
    </div>
  );
}

function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="average-fan-rules-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="average-fan-rules"
        role="dialog"
        aria-modal="true"
        aria-labelledby="average-fan-rules-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="average-fan-rules__close" type="button" onClick={onClose} aria-label="Close how to play">×</button>
        <p>HOW TO PLAY</p>
        <h2 id="average-fan-rules-title">ARE YOU SMARTER THAN AN AVERAGE FAN?</h2>
        <div className="average-fan-rules__grid">
          <article><b>1</b><span><strong>Pick your fan.</strong> Your fan is locked for the whole run.</span></article>
          <article><b>2</b><span><strong>Work the board.</strong> Choose any of the 10 grade-and-subject tiles.</span></article>
          <article><b>3</b><span><strong>Use your help.</strong> Peek, Copy and Save are each available once.</span></article>
          <article><b>4</b><span><strong>Make the final call.</strong> After 10 questions, see the Final subject and choose whether to walk or go for $1,000,000.</span></article>
        </div>
      </section>
    </div>
  );
}

function FanAvatar({ fan, large = false }: { fan: AverageFanFan; large?: boolean }) {
  const hasGlasses = fan === "shane" || fan === "cody";
  return (
    <span
      className={`average-fan-avatar average-fan-avatar--${fan}${large ? " is-large" : ""}`}
      aria-hidden="true"
    >
      <i className="average-fan-avatar__hair" />
      <i className="average-fan-avatar__head">
        <b className="average-fan-avatar__eye eye-a" />
        <b className="average-fan-avatar__eye eye-b" />
        {hasGlasses ? <b className="average-fan-avatar__glasses" /> : null}
        {fan === "tyler" ? <b className="average-fan-avatar__mustache" /> : null}
        <b className="average-fan-avatar__smile" />
      </i>
      <i className="average-fan-avatar__body" />
    </span>
  );
}

function FanCard({
  fan,
  selected,
  onSelect,
}: {
  fan: AverageFanFan;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`average-fan-card average-fan-card--${fan}${selected ? " is-selected" : ""}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <FanAvatar fan={fan} />
      <strong>{FAN_LABELS[fan]}</strong>
    </button>
  );
}

function FanSelector({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: (fan: AverageFanFan) => void;
}) {
  const [selectedFan, setSelectedFan] = useState<AverageFanFan>("shane");
  const sport = "ufc" as const;

  const rows = useMemo(() => {
    const subjects = AVERAGE_FAN_SUBJECTS[sport];
    const report = AVERAGE_FAN_REPORT_CARDS[sport][selectedFan] as Record<string, AverageFanReportGrade>;
    return subjects.map((subject) => ({ subject, grade: report[subject] }));
  }, [selectedFan]);

  return (
    <div className="average-fan-selector">
      <StudioBackdrop />
      <button className="average-fan-exit" type="button" onClick={onBack} aria-label="Back to opening screen">‹ BACK</button>

      <section className="average-fan-selector-board" aria-labelledby="average-fan-selector-title">
        <div className="average-fan-selector-title" id="average-fan-selector-title">Select Your Fan</div>

        <div className="average-fan-card-grid" aria-label="Fans">
          {FAN_ORDER.map((fan) => (
            <FanCard
              key={fan}
              fan={fan}
              selected={fan === selectedFan}
              onSelect={() => setSelectedFan(fan)}
            />
          ))}
        </div>

        <section className="average-fan-report" aria-label={`${FAN_LABELS[selectedFan]} UFC report card`}>
          <h2>{FAN_LABELS[selectedFan]}</h2>
          <span className="average-fan-report__underline" aria-hidden="true" />
          <div className="average-fan-report__rows">
            {rows.map(({ subject, grade }) => (
              <div className="average-fan-report__row" key={subject}>
                <span>{subject}</span>
                <strong data-grade={grade}>{grade}</strong>
              </div>
            ))}
          </div>
        </section>

        <div className="average-fan-selector-hero">
          <span className="average-fan-selector-crown" aria-hidden="true">♛</span>
          <FanAvatar fan={selectedFan} large />
          <span className="average-fan-selector-pedestal" aria-hidden="true" />
        </div>

        <button
          className="average-fan-select-button"
          type="button"
          onClick={() => onConfirm(selectedFan)}
        >
          <span aria-hidden="true">▶</span>
          SELECT FAN
        </button>
      </section>

      <StudioProps />
    </div>
  );
}

function MoneyRail({ completed }: { completed: number }) {
  return (
    <aside className="average-fan-money-rail" aria-label="Money ladder">
      {AVERAGE_FAN_MONEY_LADDER.slice().reverse().map((money, reverseIndex) => {
        const questionNumber = AVERAGE_FAN_MONEY_LADDER.length - reverseIndex;
        const current = completed < 10 && questionNumber === completed + 1;
        const cleared = questionNumber <= completed;
        return (
          <div
            className={`average-fan-money-row${current ? " is-current" : ""}${cleared ? " is-cleared" : ""}`}
            key={money}
          >
            <small>{questionNumber}</small>
            <strong>{averageFanMoneyLabel(money)}</strong>
          </div>
        );
      })}
    </aside>
  );
}

function HelpRail({
  fan,
  peekUsed,
  copyUsed,
  saveUsed,
  canUse,
  peekActive,
  onPeek,
  onCopy,
}: {
  fan: AverageFanFan;
  peekUsed: boolean;
  copyUsed: boolean;
  saveUsed: boolean;
  canUse: boolean;
  peekActive: boolean;
  onPeek: () => void;
  onCopy: () => void;
}) {
  return (
    <aside className="average-fan-help-rail" aria-label="Fan help">
      <div className="average-fan-help-fan">
        <FanAvatar fan={fan} />
        <strong>{FAN_LABELS[fan]}</strong>
      </div>
      <button
        type="button"
        className={`average-fan-help-button${peekActive ? " is-active" : ""}`}
        disabled={!canUse || peekUsed}
        onClick={onPeek}
      >
        <strong>PEEK</strong>
        <span>{peekUsed ? "USED" : "See the fan's answer"}</span>
      </button>
      <button
        type="button"
        className="average-fan-help-button"
        disabled={!canUse || copyUsed}
        onClick={onCopy}
      >
        <strong>COPY</strong>
        <span>{copyUsed ? "USED" : "Lock the fan's answer"}</span>
      </button>
      <div className={`average-fan-help-button average-fan-help-button--save${saveUsed ? " is-used" : ""}`}>
        <strong>SAVE</strong>
        <span>{saveUsed ? "USED" : "Auto-rescues one miss"}</span>
      </div>
    </aside>
  );
}

function TileBoard({
  resolved,
  onSelect,
}: {
  resolved: readonly ResolvedQuestion[];
  onSelect: (question: AverageFanQuestion) => void;
}) {
  const resolvedIds = new Set(resolved.map((item) => item.question.id));
  return (
    <section className="average-fan-tile-board" aria-label="Question board">
      <header>
        <span>CHOOSE A SUBJECT</span>
        <strong>WORK THE BOARD</strong>
      </header>
      <div className="average-fan-grade-board">
        {[1, 2, 3, 4, 5].map((grade) => {
          const questions = AVERAGE_FAN_UFC_PREVIEW_BOARD.filter((question) => question.grade === grade);
          return (
            <div className="average-fan-grade-row" key={grade}>
              <b>{averageFanGradeLabel(grade).replace(" Grade", "")}</b>
              {questions.map((question) => {
                const done = resolvedIds.has(question.id);
                return (
                  <button
                    key={question.id}
                    type="button"
                    className={done ? "is-done" : ""}
                    disabled={done}
                    onClick={() => onSelect(question)}
                  >
                    <span>{question.subject}</span>
                    <small>{done ? "✓ ANSWERED" : averageFanGradeLabel(grade)}</small>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function QuestionAnswerControl({
  question,
  value,
  disabled,
  onChange,
  onSubmit,
}: {
  question: AverageFanQuestion;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: (value?: string) => void;
}) {
  if (question.format === "three-choice") {
    return (
      <div className="average-fan-choice-grid">
        {question.choices!.map((choice) => (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            className={value === choice ? "is-selected" : ""}
            onClick={() => {
              onChange(choice);
              onSubmit(choice);
            }}
          >
            {choice}
          </button>
        ))}
      </div>
    );
  }

  if (question.format === "true-false") {
    return (
      <div className="average-fan-choice-grid average-fan-choice-grid--tf">
        {["True", "False"].map((choice) => (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            className={value === choice ? "is-selected" : ""}
            onClick={() => {
              onChange(choice);
              onSubmit(choice);
            }}
          >
            {choice}
          </button>
        ))}
      </div>
    );
  }

  return (
    <form
      className="average-fan-short-answer"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSubmit(value);
      }}
    >
      <input
        autoFocus
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type your answer"
        autoComplete="off"
      />
      <button type="submit" disabled={disabled || !value.trim()}>LOCK IT IN</button>
    </form>
  );
}

function FinalDecision({
  boardScore,
  subject,
  onWalk,
  onGo,
}: {
  boardScore: number;
  subject: string;
  onWalk: () => void;
  onGo: () => void;
}) {
  return (
    <section className="average-fan-final-card">
      <p>FINAL QUESTION</p>
      <h2>{subject}</h2>
      <span>You've cleared the board with <strong>{boardScore} HQ PTS</strong>.</span>
      <div className="average-fan-final-stakes">
        <div><small>WALK AWAY</small><strong>$500,000</strong></div>
        <div><small>GO FOR IT</small><strong>$1,000,000</strong></div>
      </div>
      <div className="average-fan-final-actions">
        <button type="button" onClick={onWalk}>WALK AWAY</button>
        <button type="button" className="is-go" onClick={onGo}>GO FOR $1M</button>
      </div>
    </section>
  );
}

function AverageFanGame({
  fan,
  onExit,
  onRestart,
}: {
  fan: AverageFanFan;
  onExit: () => void;
  onRestart: () => void;
}) {
  const [phase, setPhase] = useState<GamePhase>("board");
  const [current, setCurrent] = useState<AverageFanQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [resolved, setResolved] = useState<ResolvedQuestion[]>([]);
  const [peekUsed, setPeekUsed] = useState(false);
  const [copyUsed, setCopyUsed] = useState(false);
  const [saveUsed, setSaveUsed] = useState(false);
  const [peekActive, setPeekActive] = useState(false);
  const [lastResolution, setLastResolution] = useState<ResolvedQuestion | null>(null);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [finalOutcome, setFinalOutcome] = useState<FinalOutcome | null>(null);

  const fanAnswer = useMemo(
    () => current ? averageFanFanAnswer(current, fan) : null,
    [current, fan],
  );
  const unsavedMisses = resolved.filter((item) => !item.correct && !item.saved).map((item) => item.order);
  const boardScore = scoreAverageFanBoard(unsavedMisses);
  const completed = resolved.length;
  const currentMoney = completed ? AVERAGE_FAN_MONEY_LADDER[Math.min(completed, 10) - 1]! : 0;
  const finalScore = finalOutcome ? scoreAverageFanFinal(boardScore, finalOutcome) : boardScore;
  const finalMoney = finalOutcome === "correct" ? 1_000_000 : finalOutcome === "wrong" ? 25_000 : 500_000;

  function chooseQuestion(question: AverageFanQuestion) {
    setCurrent(question);
    setAnswer("");
    setPeekActive(false);
    setLastResolution(null);
    setPhase("question");
  }

  function resolveAnswer(playerAnswer: string, copied = false) {
    if (!current || phase !== "question" || !fanAnswer) return;
    const resolution = resolveAverageFanPreviewAnswer({
      question: current,
      fan,
      playerAnswer,
      saveAvailable: !saveUsed,
    });
    if (resolution.saveConsumed) setSaveUsed(true);

    const item: ResolvedQuestion = {
      question: current,
      playerAnswer,
      fanAnswer: resolution.fanAnswer.answer,
      correct: resolution.correct,
      peekUsed: peekActive,
      copied,
      saveConsumed: resolution.saveConsumed,
      saved: resolution.saved,
      order: resolved.length + 1,
    };
    setResolved((items) => [...items, item]);
    setLastResolution(item);
    setPhase("reveal");
  }

  function submitCurrent(valueOverride?: string) {
    const candidate = (valueOverride ?? answer).trim();
    if (!candidate) return;
    if (valueOverride !== undefined) setAnswer(candidate);
    resolveAnswer(candidate);
  }

  function copyFan() {
    if (!current || !fanAnswer || copyUsed || phase !== "question") return;
    setCopyUsed(true);
    setAnswer(fanAnswer.answer);
    resolveAnswer(fanAnswer.answer, true);
  }

  function continueAfterReveal() {
    setCurrent(null);
    setAnswer("");
    setPeekActive(false);
    setLastResolution(null);
    if (resolved.length >= 10) setPhase("final-decision");
    else setPhase("board");
  }

  function walkAway() {
    setFinalOutcome("walk-away");
    setPhase("result");
  }

  function submitFinal(valueOverride?: string) {
    const candidate = (valueOverride ?? finalAnswer).trim();
    if (!candidate || phase !== "final-question") return;
    if (valueOverride !== undefined) setFinalAnswer(candidate);
    const correct = averageFanAnswersMatch(AVERAGE_FAN_UFC_PREVIEW_FINAL, candidate);
    setFinalOutcome(correct ? "correct" : "wrong");
    setPhase("final-reveal");
  }

  const questionVisible = current && (phase === "question" || phase === "reveal");
  const displayedQuestionNumber = phase === "reveal" && lastResolution
    ? lastResolution.order
    : Math.min(resolved.length + 1, 10);
  const displayedQuestionMoney = AVERAGE_FAN_MONEY_LADDER[displayedQuestionNumber - 1]!;
  const railCompleted = phase === "reveal" ? Math.max(0, completed - 1) : completed;

  return (
    <div className="average-fan-game">
      <StudioBackdrop />
      <button className="average-fan-exit" type="button" onClick={onExit} aria-label="Exit Average Fan preview">‹ HQ</button>

      <div className="average-fan-game-stage">
        <HostArt compact />
        <div className="average-fan-game-chalkboard">
          {phase === "board" ? (
            <TileBoard resolved={resolved} onSelect={chooseQuestion} />
          ) : questionVisible ? (
            <section className="average-fan-question-card">
              <header>
                <b>{averageFanGradeLabel(current.grade)}</b>
                <span>{current.subject}</span>
                <small>Q{displayedQuestionNumber} · {averageFanMoneyLabel(displayedQuestionMoney)}</small>
              </header>
              <h2>{current.prompt}</h2>

              {phase === "question" ? (
                <>
                  {peekActive && fanAnswer ? (
                    <div className="average-fan-peek-banner">
                      <FanAvatar fan={fan} />
                      <span><b>{FAN_LABELS[fan]} says:</b> {fanAnswer.answer}</span>
                    </div>
                  ) : null}
                  <QuestionAnswerControl
                    question={current}
                    value={answer}
                    disabled={false}
                    onChange={setAnswer}
                    onSubmit={(value) => value ? resolveAnswer(value) : submitCurrent()}
                  />
                </>
              ) : lastResolution ? (
                <div className={`average-fan-reveal${lastResolution.correct || lastResolution.saved ? " is-correct" : " is-wrong"}`}>
                  <strong>
                    {lastResolution.correct
                      ? "CORRECT"
                      : lastResolution.saved
                        ? "SAVED!"
                        : "NOT QUITE"}
                  </strong>
                  <p><b>Answer:</b> {current.answer}</p>
                  <p>{current.explanation}</p>
                  <div className="average-fan-reveal__fan">
                    <FanAvatar fan={fan} />
                    <span><b>{FAN_LABELS[fan]} answered:</b> {lastResolution.fanAnswer}</span>
                  </div>
                  {lastResolution.saveConsumed ? (
                    <small>{lastResolution.saved ? "Your fan got it right — Save keeps the clean run alive." : "Save was used, but your fan missed too."}</small>
                  ) : null}
                  <button type="button" onClick={continueAfterReveal}>
                    {resolved.length >= 10 ? "SEE FINAL SUBJECT" : "BACK TO BOARD"}
                  </button>
                </div>
              ) : null}
            </section>
          ) : phase === "final-decision" ? (
            <FinalDecision
              boardScore={boardScore}
              subject={AVERAGE_FAN_UFC_PREVIEW_FINAL.subject}
              onWalk={walkAway}
              onGo={() => {
                setFinalAnswer("");
                setPhase("final-question");
              }}
            />
          ) : phase === "final-question" || phase === "final-reveal" ? (
            <section className="average-fan-question-card average-fan-question-card--final">
              <header>
                <b>FINAL</b>
                <span>{AVERAGE_FAN_UFC_PREVIEW_FINAL.subject}</span>
                <small>$1,000,000</small>
              </header>
              <h2>{AVERAGE_FAN_UFC_PREVIEW_FINAL.prompt}</h2>
              {phase === "final-question" ? (
                <QuestionAnswerControl
                  question={AVERAGE_FAN_UFC_PREVIEW_FINAL}
                  value={finalAnswer}
                  disabled={false}
                  onChange={setFinalAnswer}
                  onSubmit={submitFinal}
                />
              ) : (
                <div className={`average-fan-reveal${finalOutcome === "correct" ? " is-correct" : " is-wrong"}`}>
                  <strong>{finalOutcome === "correct" ? "YOU'RE A MILLIONAIRE!" : "FINAL MISS"}</strong>
                  <p><b>Answer:</b> {AVERAGE_FAN_UFC_PREVIEW_FINAL.answer}</p>
                  <p>{AVERAGE_FAN_UFC_PREVIEW_FINAL.explanation}</p>
                  <button type="button" onClick={() => setPhase("result")}>SEE RESULTS</button>
                </div>
              )}
            </section>
          ) : phase === "result" && finalOutcome ? (
            <section className="average-fan-result">
              <p>FINAL REPORT</p>
              <h2>{finalOutcome === "correct" ? "$1,000,000" : finalOutcome === "walk-away" ? "$500,000" : "$25,000"}</h2>
              <span>{finalOutcome === "correct" ? "SMARTER THAN AN AVERAGE FAN" : finalOutcome === "walk-away" ? "MONEY BANKED" : "SO CLOSE"}</span>
              <div className="average-fan-result-score">
                <strong>{finalScore}</strong>
                <small>HQ PTS</small>
              </div>
              <div className="average-fan-result-stats">
                <div><b>{resolved.filter((item) => item.correct || item.saved).length}/10</b><span>Board clears</span></div>
                <div><b>{resolved.filter((item) => item.saved).length}</b><span>Saves</span></div>
                <div><b>{averageFanMoneyLabel(finalMoney)}</b><span>Final money</span></div>
              </div>
              <div className="average-fan-result-actions">
                <button type="button" onClick={onRestart}>PLAY AGAIN</button>
                <button type="button" onClick={onExit}>BACK TO HQ</button>
              </div>
            </section>
          ) : null}
        </div>

        <MoneyRail completed={railCompleted} />
        {phase === "board" || phase === "question" || phase === "reveal" ? (
          <HelpRail
            fan={fan}
            peekUsed={peekUsed}
            copyUsed={copyUsed}
            saveUsed={saveUsed}
            canUse={phase === "question"}
            peekActive={peekActive}
            onPeek={() => {
              if (phase !== "question" || peekUsed) return;
              setPeekUsed(true);
              setPeekActive(true);
            }}
            onCopy={copyFan}
          />
        ) : null}

        <div className="average-fan-game-scorebar">
          <span><small>YOUR FAN</small><strong>{FAN_LABELS[fan]}</strong></span>
          <span><small>BOARD</small><strong>{completed}/10</strong></span>
          <span><small>MONEY</small><strong>{completed ? averageFanMoneyLabel(currentMoney) : "$0"}</strong></span>
          <span><small>HQ SCORE</small><strong>{boardScore}</strong></span>
        </div>
      </div>
    </div>
  );
}

export default function AverageFanPrototypePage() {
  const navigate = useNavigate();
  const [scene, setScene] = useState<PrototypeScene>("intro");
  const [selectedFan, setSelectedFan] = useState<AverageFanFan>("shane");
  const [gameKey, setGameKey] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);

  if (scene === "fan-select") {
    return (
      <FanSelector
        onBack={() => setScene("intro")}
        onConfirm={(fan) => {
          setSelectedFan(fan);
          setGameKey((value) => value + 1);
          setScene("game");
        }}
      />
    );
  }

  if (scene === "game") {
    return (
      <AverageFanGame
        key={gameKey}
        fan={selectedFan}
        onExit={() => navigate("/play")}
        onRestart={() => {
          setGameKey((value) => value + 1);
          setScene("fan-select");
        }}
      />
    );
  }

  return (
    <div className="average-fan-intro">
      <button
        className="average-fan-exit"
        type="button"
        onClick={() => navigate("/play")}
        aria-label="Exit Average Fan preview"
      >
        ‹ HQ
      </button>

      <StudioBackdrop />

      <section className="average-fan-board" aria-label="Average Fan opening screen">
        <ChalkDoodles />
        <AverageFanLogo />
        <p className="average-fan-tagline">Pick your fan. Work the board. Go for $1,000,000.</p>
      </section>

      <HostArt />
      <StudioProps />

      <div className="average-fan-intro-actions">
        <button
          className="average-fan-intro-button average-fan-intro-button--start"
          type="button"
          onClick={() => setScene("fan-select")}
        >
          <span aria-hidden="true">▶</span>
          START
        </button>
        <button
          className="average-fan-intro-button average-fan-intro-button--rules"
          type="button"
          onClick={() => setRulesOpen(true)}
        >
          <span aria-hidden="true">▤</span>
          HOW TO PLAY
        </button>
      </div>

      {rulesOpen ? <RulesModal onClose={() => setRulesOpen(false)} /> : null}
    </div>
  );
}
