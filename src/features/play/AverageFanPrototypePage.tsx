import { useEffect, useMemo, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AVERAGE_FAN_PLAYABLE_GRADES,
  AVERAGE_FAN_REPORT_CARDS,
  AVERAGE_FAN_SUBJECTS,
  averageFanAnswersMatch,
  averageFanFanAnswer,
  scoreAverageFanBoard,
  scoreAverageFanFinal,
  type AverageFanFan,
  type AverageFanQuestion,
  type AverageFanReportGrade,
  type AverageFanSport,
} from "../games/averageFanEngine";
import {
  AVERAGE_FAN_MONEY_LADDER,
  averageFanGradeLabel,
  averageFanMoneyLabel,
  resolveAverageFanPreviewAnswer,
} from "./AverageFanPrototypeModel";
import { buildAverageFanCasualBoard } from "./averageFanCasualBoard";
import "./AverageFanPrototypePage.css";

type PrototypeScene = "intro" | "sport-select" | "fan-select" | "game";
type GamePhase = "board" | "question" | "reveal" | "verdict" | "final-decision" | "final-question" | "final-reveal" | "result";
type FinalOutcome = "walk-away" | "correct" | "wrong";

export type ResolvedQuestion = {
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

export const FAN_ORDER: readonly AverageFanFan[] = ["shane", "cody", "lib", "tyler", "troy"];
export const FAN_LABELS: Record<AverageFanFan, string> = {
  shane: "SHANE",
  cody: "CODY",
  lib: "LIB",
  tyler: "TYLER",
  troy: "TROY",
};

const AVERAGE_FAN_OPENING_STAGE_WIDTH = 1672;
const AVERAGE_FAN_OPENING_STAGE_HEIGHT = 941;
const AVERAGE_FAN_GAMEPLAY_STAGE_WIDTH = 1536;
const AVERAGE_FAN_GAMEPLAY_STAGE_HEIGHT = 864;
export const AVERAGE_FAN_GAMEPLAY_STAGE_SRC = "/assets/average-fan/average-fan-gameplay-stage.png";
const AVERAGE_FAN_PORTRAITS: Record<AverageFanFan, string> = {
  shane: "/assets/average-fan/average-fan-shane.png",
  cody: "/assets/average-fan/average-fan-cody.png",
  // The two source files were named opposite their pictured identities.
  lib: "/assets/average-fan/average-fan-tyler.png",
  tyler: "/assets/average-fan/average-fan-lib.png",
  troy: "/assets/average-fan/average-fan-troy.png",
};

// iOS landscape can report a smaller dynamic viewport than the usable stage; size the fixed scene against lvh.
function measureAverageFanLargeViewport() {
  const fallbackWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
  const fallbackHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  Object.assign(probe.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "100lvw",
    height: "100lvh",
    visibility: "hidden",
    pointerEvents: "none",
  });
  document.body.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  probe.remove();
  return {
    width: rect.width > 0 ? rect.width : fallbackWidth,
    height: rect.height > 0 ? rect.height : fallbackHeight,
  };
}

export function useAverageFanOpeningStageScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const syncScale = () => {
      const viewport = measureAverageFanLargeViewport();
      setScale(Math.min(
        viewport.width / AVERAGE_FAN_OPENING_STAGE_WIDTH,
        viewport.height / AVERAGE_FAN_OPENING_STAGE_HEIGHT,
      ));
    };

    syncScale();
    window.addEventListener("resize", syncScale);
    window.visualViewport?.addEventListener("resize", syncScale);
    return () => {
      window.removeEventListener("resize", syncScale);
      window.visualViewport?.removeEventListener("resize", syncScale);
    };
  }, []);

  return scale;
}

export function useAverageFanGameplayStageLayout() {
  const [layout, setLayout] = useState({ scale: 1, answerShift: 0 });

  useEffect(() => {
    const syncLayout = () => {
      const visualViewport = window.visualViewport;
      const activeElement = document.activeElement;
      const shortAnswerFocused = activeElement instanceof HTMLInputElement
        && activeElement.closest(".average-fan-short-answer") !== null;
      const keyboardOcclusion = shortAnswerFocused && visualViewport
        ? Math.max(0, window.innerHeight - visualViewport.height - visualViewport.offsetTop)
        : 0;
      const keyboardOpen = keyboardOcclusion > 80;
      const viewport = measureAverageFanLargeViewport();
      const scale = Math.min(
        viewport.width / AVERAGE_FAN_GAMEPLAY_STAGE_WIDTH,
        viewport.height / AVERAGE_FAN_GAMEPLAY_STAGE_HEIGHT,
      );

      setLayout({
        scale,
        answerShift: keyboardOpen
          ? Math.min(190, Math.round(keyboardOcclusion / Math.max(scale * 2, 0.01)))
          : 0,
      });
    };

    syncLayout();
    window.addEventListener("resize", syncLayout);
    window.visualViewport?.addEventListener("resize", syncLayout);
    window.visualViewport?.addEventListener("scroll", syncLayout);
    document.addEventListener("focusin", syncLayout);
    document.addEventListener("focusout", syncLayout);
    return () => {
      window.removeEventListener("resize", syncLayout);
      window.visualViewport?.removeEventListener("resize", syncLayout);
      window.visualViewport?.removeEventListener("scroll", syncLayout);
      document.removeEventListener("focusin", syncLayout);
      document.removeEventListener("focusout", syncLayout);
    };
  }, []);

  return layout;
}

export function useAverageFanScreenLock() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previous = {
      rootOverflow: root.style.overflow,
      rootOverscroll: root.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
    };

    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      root.style.overflow = previous.rootOverflow;
      root.style.overscrollBehavior = previous.rootOverscroll;
      body.style.overflow = previous.bodyOverflow;
      body.style.overscrollBehavior = previous.bodyOverscroll;
    };
  }, []);
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

export function RulesModal({ onClose }: { onClose: () => void }) {
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
          <article><b>1</b><span><strong>Pick your sport and fan.</strong> Your fan is locked for the whole run.</span></article>
          <article><b>2</b><span><strong>Work the board.</strong> Choose any of the 8 subject tiles from 2nd through 5th Grade.</span></article>
          <article><b>3</b><span><strong>Use your help.</strong> Peek, Copy and Save are each available once.</span></article>
          <article><b>4</b><span><strong>Finish strong.</strong> An unsaved miss ends the money run, but you keep playing for HQ points and the Final.</span></article>
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
      aria-label={`Select ${FAN_LABELS[fan]}`}
      aria-pressed={selected}
      onClick={onSelect}
    />
  );
}

function averageFanSubjectIcon(subject: string) {
  const icons: Record<string, string> = {
    Players: "●",
    Teams: "◆",
    "NFL History": "⌛",
    "X’s & O’s": "↗",
    Programs: "◆",
    Traditions: "★",
    "CFB History": "⌛",
    Fighters: "✦",
    Fights: "⚔",
    Championships: "★",
    "Octagon IQ": "⬡",
    "MLB History": "⌛",
    "Baseball IQ": "⬡",
  };
  return icons[subject] ?? "•";
}

function averageFanSubjectTone(subject: string) {
  const tones: Record<string, "red" | "blue" | "gold" | "purple"> = {
    Players: "red",
    Teams: "blue",
    "NFL History": "gold",
    "X’s & O’s": "purple",
    Programs: "blue",
    Traditions: "gold",
    "CFB History": "purple",
    Fighters: "red",
    Fights: "blue",
    Championships: "gold",
    "Octagon IQ": "purple",
    "MLB History": "gold",
    "Baseball IQ": "purple",
  };
  return tones[subject] ?? "blue";
}

export function SportSelector({
  onBack,
  onSelect,
}: {
  onBack: () => void;
  onSelect: (sport: "nfl" | "cfb" | "ufc") => void;
}) {
  const stageScale = useAverageFanOpeningStageScale();
  const sports = [
    { id: "ufc" as const, label: "UFC", detail: "Fighters • Fights • Championships • Octagon IQ" },
    { id: "nfl" as const, label: "NFL", detail: "Players • Teams • NFL History • X’s & O’s" },
    { id: "cfb" as const, label: "COLLEGE FOOTBALL", detail: "Players • Programs • Traditions • CFB History" },
  ];

  return (
    <div className="average-fan-intro average-fan-sport-select average-fan-intro--plate">
      <section
        className="average-fan-intro-stage"
        aria-label="Choose Average Fan sport"
        style={{ transform: `translate(-50%, -50%) scale(${stageScale})` }}
      >
        <img
          className="average-fan-intro-stage__plate"
          src="/assets/average-fan/average-fan-opening-stage.png"
          alt=""
          aria-hidden="true"
        />
        <section className="average-fan-sport-panel">
          <p>CHOOSE YOUR SPORT</p>
          <h2>WHO ARE YOU SMARTER THAN?</h2>
          <div className="average-fan-sport-options">
            {sports.map((sport) => (
              <button key={sport.id} type="button" onClick={() => onSelect(sport.id)}>
                <strong>{sport.label}</strong>
                <span>{sport.detail}</span>
              </button>
            ))}
          </div>
        </section>
      </section>
      <button className="average-fan-exit" type="button" onClick={onBack} aria-label="Back to opening screen">‹ BACK</button>
    </div>
  );
}

export function FanSelector({
  onBack,
  onConfirm,
  sport = "ufc",
}: {
  onBack: () => void;
  onConfirm: (fan: AverageFanFan) => void;
  sport?: AverageFanSport;
}) {
  const [selectedFan, setSelectedFan] = useState<AverageFanFan>("shane");
  const stageScale = useAverageFanOpeningStageScale();
  const rows = useMemo(() => {
    const subjects = AVERAGE_FAN_SUBJECTS[sport];
    const report = AVERAGE_FAN_REPORT_CARDS[sport][selectedFan] as Record<string, AverageFanReportGrade>;
    return subjects.map((subject) => ({ subject, grade: report[subject] }));
  }, [selectedFan, sport]);

  return (
    <div className="average-fan-selector average-fan-selector--plate">
      <section
        className="average-fan-selector-stage"
        aria-label="Select your fan"
        style={{ transform: `translate(-50%, -50%) scale(${stageScale})` }}
      >
        <img
          className="average-fan-selector-stage__plate"
          src="/assets/average-fan/average-fan-selector-stage.png"
          alt=""
          aria-hidden="true"
        />

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

        <section className="average-fan-report" aria-label={`${FAN_LABELS[selectedFan]} ${sport.toUpperCase()} report card`}>
          <h2>{FAN_LABELS[selectedFan]}</h2>
          <span className="average-fan-report__underline" aria-hidden="true" />
          <div className="average-fan-report__rows">
            {rows.map(({ subject, grade }) => (
              <div className="average-fan-report__row" key={subject}>
                <i aria-hidden="true">{averageFanSubjectIcon(subject)}</i>
                <span>{subject}</span>
                <strong data-grade={grade}>{grade}</strong>
              </div>
            ))}
          </div>
        </section>

        <button
          className="average-fan-select-button"
          type="button"
          onClick={() => onConfirm(selectedFan)}
        >
          <span aria-hidden="true">▶</span>
          <strong>SELECT FAN</strong>
        </button>
      </section>

      <button className="average-fan-exit" type="button" onClick={onBack} aria-label="Back to opening screen">‹ BACK</button>
    </div>
  );
}

export function GameplayFanDesk({ fan }: { fan: AverageFanFan }) {
  return (
    <aside className="average-fan-game-fan" aria-label={`${FAN_LABELS[fan]} at the fan desk`}>
      <img
        className="average-fan-game-fan__portrait"
        src={AVERAGE_FAN_PORTRAITS[fan]}
        alt=""
        aria-hidden="true"
      />
      <div className="average-fan-game-fan__desk-mask" aria-hidden="true" />
      <strong className="average-fan-game-fan__name">{FAN_LABELS[fan]}</strong>
    </aside>
  );
}

export function MoneyRail({
  completed,
  finalActive,
  lostAt,
}: {
  completed: number;
  finalActive: boolean;
  lostAt: number | null;
}) {
  const displayCompleted = lostAt ? Math.max(0, lostAt - 1) : completed;
  return (
    <aside
      className={`average-fan-money-rail${lostAt ? " is-frozen" : ""}`}
      aria-label={lostAt ? `Money ladder — run ended at question ${lostAt}` : "Money ladder"}
    >
      <div className={`average-fan-money-row average-fan-money-row--final${finalActive && !lostAt ? " is-current" : ""}`}>
        <strong>$1,000,000</strong>
      </div>
      {AVERAGE_FAN_MONEY_LADDER.slice().reverse().map((money, reverseIndex) => {
        const questionNumber = AVERAGE_FAN_MONEY_LADDER.length - reverseIndex;
        const current = !lostAt && !finalActive && completed < AVERAGE_FAN_MONEY_LADDER.length && questionNumber === completed + 1;
        const cleared = questionNumber <= displayCompleted;
        const lost = lostAt === questionNumber;
        return (
          <div
            className={`average-fan-money-row${current ? " is-current" : ""}${cleared ? " is-cleared" : ""}${lost ? " is-lost" : ""}`}
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

export function HelpRail({
  peekUsed,
  copyUsed,
  saveUsed,
  canUse,
  peekActive,
  onPeek,
  onCopy,
}: {
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
      <button
        type="button"
        className={`average-fan-help-button average-fan-help-button--peek${peekActive ? " is-active" : ""}${peekUsed ? " is-used" : ""}`}
        disabled={!canUse || peekUsed}
        onClick={onPeek}
        aria-label={peekUsed ? "Peek used" : "Peek at the fan's answer"}
      >
        <span className="average-fan-sr-only">{peekUsed ? "Peek used" : "Peek"}</span>
      </button>
      <button
        type="button"
        className={`average-fan-help-button average-fan-help-button--copy${copyUsed ? " is-used" : ""}`}
        disabled={!canUse || copyUsed}
        onClick={onCopy}
        aria-label={copyUsed ? "Copy used" : "Copy the fan's answer"}
      >
        <span className="average-fan-sr-only">{copyUsed ? "Copy used" : "Copy"}</span>
      </button>
      <div
        className={`average-fan-help-button average-fan-help-button--save${saveUsed ? " is-used" : ""}`}
        aria-label={saveUsed ? "Automatic save used" : "Automatic save available"}
      >
        <span className="average-fan-sr-only">{saveUsed ? "Save used" : "Automatic save available"}</span>
      </div>
    </aside>
  );
}

export function TileBoard({
  resolved,
  onSelect,
  questions,
}: {
  resolved: readonly ResolvedQuestion[];
  onSelect: (question: AverageFanQuestion) => void;
  questions: readonly AverageFanQuestion[];
}) {
  const resolvedIds = new Set(resolved.map((item) => item.question.id));
  return (
    <section className="average-fan-tile-board" aria-label="Question board">
      <header>
        <span>CHOOSE A SUBJECT</span>
        <strong>WORK THE BOARD</strong>
      </header>
      <div className="average-fan-grade-board">
        {AVERAGE_FAN_PLAYABLE_GRADES.map((grade) => {
          const gradeQuestions = questions.filter((question) => question.grade === grade);
          return (
            <div className="average-fan-grade-row" key={grade}>
              <b>{averageFanGradeLabel(grade)}</b>
              {gradeQuestions.map((question) => {
                const done = resolvedIds.has(question.id);
                return (
                  <button
                    key={question.id}
                    type="button"
                    className={done ? "is-done" : ""}
                    data-subject-tone={averageFanSubjectTone(question.subject)}
                    disabled={done}
                    onClick={() => onSelect(question)}
                  >
                    <span>{question.subject}</span>
                    {done ? <small>✓ ANSWERED</small> : null}
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

export function QuestionAnswerControl({
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
  if (question.format === "four-choice") {
    return (
      <div className="average-fan-choice-grid" data-choice-count={question.choices!.length}>
        {question.choices!.map((choice, index) => (
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
            <b aria-hidden="true">{String.fromCharCode(65 + index)}</b>
            <span>{choice}</span>
          </button>
        ))}
      </div>
    );
  }

  if (question.format === "true-false") {
    return (
      <div className="average-fan-choice-grid average-fan-choice-grid--tf" data-choice-count="2">
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
            <span>{choice}</span>
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
        value={value}
        inputMode="text"
        enterKeyHint="done"
        autoCapitalize="words"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type your answer"
        autoComplete="off"
      />
      <button type="submit" disabled={disabled || !value.trim()}>LOCK IT IN</button>
    </form>
  );
}

export function FinalDecision({
  boardScore,
  subject,
  moneyAlive,
  onWalk,
  onGo,
}: {
  boardScore: number;
  subject: string;
  moneyAlive: boolean;
  onWalk: () => void;
  onGo: () => void;
}) {
  const correctScore = Math.min(100, boardScore + 10);
  const wrongScore = Math.max(0, boardScore - 10);

  return (
    <section className="average-fan-final-card">
      <p>YOUR FINAL SUBJECT</p>
      <h2>{subject}</h2>
      <span className="average-fan-final-card__decision-copy">
        <strong>You have not seen the question yet.</strong> Choose now: bank your score, or risk 10 points to play the Final.
      </span>
      <div className="average-fan-final-stakes average-fan-final-stakes--three">
        <div>
          <small>BANK IT</small>
          <strong>{boardScore} PTS</strong>
          {moneyAlive ? <em>$500,000</em> : null}
        </div>
        <div className="is-upside">
          <small>FINAL CORRECT</small>
          <strong>{correctScore} PTS</strong>
          {moneyAlive ? <em>$1,000,000</em> : <em>+10</em>}
        </div>
        <div className="is-risk">
          <small>FINAL WRONG</small>
          <strong>{wrongScore} PTS</strong>
          <em>{moneyAlive ? "$25,000 · -10" : "-10"}</em>
        </div>
      </div>
      <strong className="average-fan-final-warning">Once you choose Play Final, you cannot walk away.</strong>
      <div className="average-fan-final-actions">
        <button type="button" onClick={onWalk}>BANK {boardScore} PTS</button>
        <button type="button" className="is-go" onClick={onGo}>PLAY FINAL — RISK 10</button>
      </div>
    </section>
  );
}

export type AverageFanSettledResult = {
  score: number;
  boardScore: number;
  boardClears: number;
  saves: number;
  finalOutcome: FinalOutcome;
  finalMoney: number | null;
  fan: AverageFanFan;
  resolved: Array<{
    order: number;
    id: string;
    grade: number;
    subject: string;
    prompt: string;
    playerAnswer: string;
    fanAnswer: string;
    correctAnswer: string;
    explanation: string;
    correct: boolean;
    copied: boolean;
    peekUsed: boolean;
    saveConsumed: boolean;
    saved: boolean;
  }>;
  finalQuestion: {
    id: string;
    subject: string;
    prompt: string;
    correctAnswer: string;
    explanation: string;
  };
  finalPlayerAnswer: string | null;
};

export function AverageFanGame({
  fan,
  questions,
  finalQuestion,
  onExit,
  onRestart,
  onSettled,
  initialQuestion = null,
}: {
  fan: AverageFanFan;
  questions: readonly AverageFanQuestion[];
  finalQuestion: AverageFanQuestion;
  onExit: () => void;
  onRestart: () => void;
  onSettled?: (result: AverageFanSettledResult) => void;
  initialQuestion?: AverageFanQuestion | null;
}) {
  const { scale: stageScale, answerShift } = useAverageFanGameplayStageLayout();
  const [phase, setPhase] = useState<GamePhase>(initialQuestion ? "question" : "board");
  const [current, setCurrent] = useState<AverageFanQuestion | null>(initialQuestion);
  const [answer, setAnswer] = useState("");
  const [resolved, setResolved] = useState<ResolvedQuestion[]>([]);
  const [peekUsed, setPeekUsed] = useState(false);
  const [copyUsed, setCopyUsed] = useState(false);
  const [saveUsed, setSaveUsed] = useState(false);
  const [peekActive, setPeekActive] = useState(false);
  const [lastResolution, setLastResolution] = useState<ResolvedQuestion | null>(null);
  const [verdictShown, setVerdictShown] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [finalOutcome, setFinalOutcome] = useState<FinalOutcome | null>(null);

  const fanAnswer = useMemo(
    () => current ? averageFanFanAnswer(current, fan) : null,
    [current, fan],
  );
  const unsavedMisses = resolved.filter((item) => !item.correct && !item.saved).map((item) => item.order);
  const boardScore = scoreAverageFanBoard(unsavedMisses);
  const completed = resolved.length;
  const firstUnsavedMiss = unsavedMisses[0] ?? null;
  const moneyAlive = firstUnsavedMiss === null;
  const finalScore = finalOutcome ? scoreAverageFanFinal(boardScore, finalOutcome) : boardScore;
  const finalMoney = moneyAlive
    ? (finalOutcome === "correct" ? 1_000_000 : finalOutcome === "wrong" ? 25_000 : 500_000)
    : null;

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
    // Paint the reveal before iOS starts settling the landscape keyboard/viewport.
    flushSync(() => {
      if (resolution.saveConsumed) setSaveUsed(true);
      setResolved((items) => [...items, item]);
      setLastResolution(item);
      setPhase("reveal");
    });
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
    const firstUnsurvivedMiss = Boolean(
      lastResolution
      && !lastResolution.correct
      && !lastResolution.saved
      && unsavedMisses.length === 1
      && !verdictShown
    );
    setCurrent(null);
    setAnswer("");
    setPeekActive(false);
    setLastResolution(null);
    if (firstUnsurvivedMiss) {
      setVerdictShown(true);
      setPhase("verdict");
      return;
    }
    if (resolved.length >= questions.length) setPhase("final-decision");
    else setPhase("board");
  }

  function continueAfterVerdict() {
    if (resolved.length >= questions.length) setPhase("final-decision");
    else setPhase("board");
  }

  function emitSettled(outcome: FinalOutcome, settledFinalAnswer: string | null = null) {
    const score = scoreAverageFanFinal(boardScore, outcome);
    const money = moneyAlive
      ? (outcome === "correct" ? 1_000_000 : outcome === "wrong" ? 25_000 : 500_000)
      : null;
    onSettled?.({
      score,
      boardScore,
      boardClears: resolved.filter((item) => item.correct || item.saved).length,
      saves: resolved.filter((item) => item.saved).length,
      finalOutcome: outcome,
      finalMoney: money,
      fan,
      resolved: resolved.map((item) => ({
        order: item.order,
        id: item.question.id,
        grade: item.question.grade,
        subject: item.question.subject,
        prompt: item.question.prompt,
        playerAnswer: item.playerAnswer,
        fanAnswer: item.fanAnswer,
        correctAnswer: item.question.answer,
        explanation: item.question.explanation,
        correct: item.correct,
        copied: item.copied,
        peekUsed: item.peekUsed,
        saveConsumed: item.saveConsumed,
        saved: item.saved,
      })),
      finalQuestion: {
        id: finalQuestion.id,
        subject: finalQuestion.subject,
        prompt: finalQuestion.prompt,
        correctAnswer: finalQuestion.answer,
        explanation: finalQuestion.explanation,
      },
      finalPlayerAnswer: outcome === "walk-away" ? null : (settledFinalAnswer ?? finalAnswer.trim()),
    });
  }

  function walkAway() {
    flushSync(() => {
      setFinalOutcome("walk-away");
      setPhase("result");
    });
    emitSettled("walk-away");
  }

  function submitFinal(valueOverride?: string) {
    const candidate = (valueOverride ?? finalAnswer).trim();
    if (!candidate || phase !== "final-question") return;
    if (valueOverride !== undefined) setFinalAnswer(candidate);
    const outcome: FinalOutcome = averageFanAnswersMatch(finalQuestion, candidate) ? "correct" : "wrong";
    flushSync(() => {
      setFinalOutcome(outcome);
      setPhase("final-reveal");
    });
    emitSettled(outcome, candidate);
  }

  const questionVisible = current && (phase === "question" || phase === "reveal");
  const railCompleted = phase === "reveal" ? Math.max(0, completed - 1) : completed;

  return (
    <div className="average-fan-game">
      <button className="average-fan-exit" type="button" onClick={onExit} aria-label="Exit Average Fan preview">‹ HQ</button>

      <section
        className="average-fan-game-stage"
        aria-label="Are You Smarter Than an Average Fan? gameplay"
        style={{
          transform: `translate(-50%, -50%) scale(${stageScale})`,
        }}
      >
        <img
          className="average-fan-game-stage__plate"
          src={AVERAGE_FAN_GAMEPLAY_STAGE_SRC}
          alt=""
          aria-hidden="true"
        />

        <div className={`average-fan-game-chalkboard${phase === "board" ? " is-board" : ""}`}>
          {phase === "board" ? (
            <TileBoard questions={questions} resolved={resolved} onSelect={chooseQuestion} />
          ) : questionVisible ? (
            <section className="average-fan-question-card">
              <header>
                <b>{averageFanGradeLabel(current.grade)}</b>
                <span>{current.subject}</span>
              </header>
              <h2>{current.prompt}</h2>
            </section>
          ) : phase === "verdict" ? (
            <section className="average-fan-verdict" role="status" aria-live="polite">
              <p>THE VERDICT</p>
              <h2>YOU ARE NOT SMARTER THAN AN AVERAGE FAN</h2>
              <strong>YOUR HQ SCORE IS STILL ALIVE</strong>
              <span>Finish the board and see how high you can score.</span>
              <button type="button" onClick={continueAfterVerdict}>KEEP PLAYING</button>
            </section>
          ) : phase === "final-decision" ? (
            <FinalDecision
              boardScore={boardScore}
              subject={finalQuestion.subject}
              moneyAlive={moneyAlive}
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
                <span>{finalQuestion.subject}</span>
              </header>
              <h2>{finalQuestion.prompt}</h2>
            </section>
          ) : phase === "result" && finalOutcome ? (
            <section className="average-fan-result">
              <p>FINAL REPORT</p>
              <h2>
                {moneyAlive
                  ? (finalOutcome === "correct" ? "$1,000,000" : finalOutcome === "walk-away" ? "$500,000" : "$25,000")
                  : `${finalScore} HQ PTS`}
              </h2>
              <span>
                {moneyAlive
                  ? (finalOutcome === "correct" ? "YOU ARE SMARTER THAN AN AVERAGE FAN" : finalOutcome === "walk-away" ? "MONEY BANKED" : "YOU ARE NOT SMARTER THAN AN AVERAGE FAN")
                  : "HQ RUN COMPLETE"}
              </span>
              <div className="average-fan-result-score">
                <strong>{finalScore}</strong>
                <small>HQ PTS</small>
              </div>
              <div className="average-fan-result-stats">
                <div><b>{resolved.filter((item) => item.correct || item.saved).length}/{questions.length}</b><span>Board clears</span></div>
                <div><b>{resolved.filter((item) => item.saved).length}</b><span>Saves</span></div>
                <div><b>{finalMoney ? averageFanMoneyLabel(finalMoney) : "ENDED"}</b><span>Money run</span></div>
              </div>
              <div className="average-fan-result-actions">
                <button type="button" onClick={onRestart}>PLAY AGAIN</button>
                <button type="button" onClick={onExit}>BACK TO HQ</button>
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
                {peekActive && fanAnswer ? (
                  <div className="average-fan-peek-banner">
                    <span><b>{FAN_LABELS[fan]} says:</b> {fanAnswer.answer}</span>
                  </div>
                ) : null}
                <QuestionAnswerControl
                  question={current}
                  value={answer}
                  disabled={false}
                  onChange={setAnswer}
                  onSubmit={submitCurrent}
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
                  <span><b>{FAN_LABELS[fan]} answered:</b> {lastResolution.fanAnswer}</span>
                </div>
                {lastResolution.saveConsumed ? (
                  <small>{lastResolution.saved ? "Your fan got it right — Save keeps the clean run alive." : "Save was used, but your fan missed too."}</small>
                ) : null}
                <button type="button" onClick={continueAfterReveal}>
                  {resolved.length >= questions.length ? "SEE FINAL SUBJECT" : "BACK TO BOARD"}
                </button>
              </div>
            ) : null}
          </div>
        ) : phase === "final-question" || phase === "final-reveal" ? (
          <div
            className="average-fan-answer-stage average-fan-answer-stage--final"
            data-format={finalQuestion.format}
            style={answerShift ? { transform: `translateY(-${answerShift}px)` } : undefined}
          >
            {phase === "final-question" ? (
              <QuestionAnswerControl
                question={finalQuestion}
                value={finalAnswer}
                disabled={false}
                onChange={setFinalAnswer}
                onSubmit={submitFinal}
              />
            ) : (
              <div className={`average-fan-reveal${finalOutcome === "correct" ? " is-correct" : " is-wrong"}`}>
                <strong>
                  {finalOutcome === "correct"
                    ? (moneyAlive ? "YOU'RE A MILLIONAIRE!" : "FINAL CORRECT +10")
                    : "FINAL MISS -10"}
                </strong>
                <p><b>Answer:</b> {finalQuestion.answer}</p>
                <p>{finalQuestion.explanation}</p>
                <button type="button" onClick={() => setPhase("result")}>SEE RESULTS</button>
              </div>
            )}
          </div>
        ) : null}

        <MoneyRail
          completed={railCompleted}
          finalActive={phase === "final-decision" || phase === "final-question" || phase === "final-reveal" || phase === "result"}
          lostAt={firstUnsavedMiss}
        />
        {phase === "board" || phase === "question" || phase === "reveal" ? (
          <HelpRail
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

        <GameplayFanDesk fan={fan} />
      </section>
    </div>
  );}

export default function AverageFanPrototypePage() {
  useAverageFanScreenLock();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const openingStageScale = useAverageFanOpeningStageScale();
  const requestedSport = searchParams.get("sport");
  const initialSport = requestedSport === "nfl" || requestedSport === "cfb" || requestedSport === "ufc"
    ? requestedSport
    : "ufc";
  const reviewGameplay = searchParams.get("screen") === "gameplay";
  const requestedFan = searchParams.get("fan") as AverageFanFan | null;
  const reviewFan = requestedFan && FAN_ORDER.includes(requestedFan) ? requestedFan : "cody";
  const [scene, setScene] = useState<PrototypeScene>(() => reviewGameplay ? "game" : "intro");
  const [casualSport, setCasualSport] = useState<"nfl" | "cfb" | "ufc">(initialSport);
  const [selectedFan, setSelectedFan] = useState<AverageFanFan>(() => reviewGameplay ? reviewFan : "shane");
  const [reviewQuestionEnabled, setReviewQuestionEnabled] = useState(reviewGameplay);
  const [gameKey, setGameKey] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);
  const casualBoard = useMemo(
    () => buildAverageFanCasualBoard(casualSport, `${casualSport}-owner-casual-${gameKey}`),
    [casualSport, gameKey],
  );
  const casualQuestions = casualBoard.questions;
  const casualFinal = casualBoard.finalQuestion;
  const reviewQuestion = casualQuestions.find((question) => question.format === "four-choice" && question.grade === 3)
    ?? casualQuestions.find((question) => question.format === "four-choice")
    ?? casualQuestions[0]!;
  const exitRoute = casualSport === "ufc" ? "/play" : "/football";

  if (scene === "sport-select") {
    return (
      <SportSelector
        onBack={() => setScene("intro")}
        onSelect={(sport) => {
          setCasualSport(sport);
          setReviewQuestionEnabled(false);
          setScene("fan-select");
        }}
      />
    );
  }

  if (scene === "fan-select") {
    return (
      <FanSelector
        sport={casualSport}
        onBack={() => setScene("sport-select")}
        onConfirm={(fan) => {
          setSelectedFan(fan);
          setReviewQuestionEnabled(false);
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
        questions={casualQuestions}
        finalQuestion={casualFinal}
        initialQuestion={reviewQuestionEnabled ? reviewQuestion : null}
        onExit={() => navigate(exitRoute)}
        onRestart={() => {
          setReviewQuestionEnabled(false);
          setGameKey((value) => value + 1);
          setScene("fan-select");
        }}
      />
    );
  }

  return (
    <div className="average-fan-intro average-fan-intro--plate">
      <section
        className="average-fan-intro-stage"
        aria-label="Are You Smarter Than an Average Fan? opening screen"
        style={{ transform: `translate(-50%, -50%) scale(${openingStageScale})` }}
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
            onClick={() => setScene("sport-select")}
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

      <button
        className="average-fan-exit"
        type="button"
        onClick={() => navigate(exitRoute)}
        aria-label="Exit Average Fan Casual"
      >
        ‹ HQ
      </button>

      {rulesOpen ? <RulesModal onClose={() => setRulesOpen(false)} /> : null}
    </div>
  );
}
