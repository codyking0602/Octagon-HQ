import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  AVERAGE_FAN_FANS,
  AVERAGE_FAN_REPORT_CARDS,
  AVERAGE_FAN_SUBJECTS,
  averageFanAnswersMatch,
  averageFanFanAnswer,
  scoreAverageFanBoard,
  scoreAverageFanFinal,
  type AverageFanFan,
  type AverageFanQuestion,
  type AverageFanSport,
} from "../games/averageFanEngine";
import { averageFanPreviewRun } from "../games/averageFanPreviewContent";
import {
  createMemberProfilesRepository,
  type MemberProfilesRepository,
} from "../members/memberProfilesRepository";
import type { MemberCardSummary } from "../members/memberProfilesModel";
import "./AverageFanCasualPage.css";

type Scope = "ufc" | "football";
type GamePhase = "board" | "final-decision" | "final-question" | "result";
type AnswerHelp = "peek" | "copy" | null;

interface AverageFanBoardResult {
  question: AverageFanQuestion;
  questionNumber: number;
  playerAnswer: string;
  correct: boolean;
  saved: boolean;
  saveConsumed: boolean;
  fanAnswer: string;
  fanCorrect: boolean;
  help: AnswerHelp;
  money: number;
}

interface AverageFanFinalResult {
  outcome: "walk-away" | "correct" | "wrong";
  playerAnswer: string | null;
  score: number;
  money: number;
}

const MONEY_LADDER = [
  1_000,
  2_000,
  5_000,
  10_000,
  25_000,
  50_000,
  100_000,
  175_000,
  300_000,
  500_000,
] as const;

const FAN_NAMES: Record<AverageFanFan, string> = {
  cody: "Cody",
  shane: "Shane",
  troy: "Troy",
  tyler: "Tyler",
  lib: "Lib",
};

function moneyLabel(value: number) {
  return "$" + value.toLocaleString("en-US");
}

function gradeLabel(grade: number) {
  if (grade === 1) return "1ST";
  if (grade === 2) return "2ND";
  if (grade === 3) return "3RD";
  return `${grade}TH`;
}

function sportLabel(sport: AverageFanSport) {
  if (sport === "cfb") return "COLLEGE FOOTBALL";
  return sport.toUpperCase();
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function fanReportCard(sport: AverageFanSport, fan: AverageFanFan) {
  return AVERAGE_FAN_REPORT_CARDS[sport][fan] as Record<string, string>;
}

function MemberPortrait({
  fan,
  members,
}: {
  fan: AverageFanFan;
  members: readonly MemberCardSummary[];
}) {
  const name = FAN_NAMES[fan];
  const member = members.find((candidate) => {
    const candidateName = normalizeName(candidate.displayName);
    const fanName = normalizeName(name);
    return candidateName === fanName || candidateName.split(" ")[0] === fanName;
  });
  if (member?.avatarPhotoData) {
    return <img src={member.avatarPhotoData} alt="" aria-hidden="true" />;
  }
  return <span aria-hidden="true">{member?.initials || initialsFor(name)}</span>;
}

function FanSelection({
  sport,
  members,
  selected,
  onSelect,
  onConfirm,
  onBack,
}: {
  sport: AverageFanSport;
  members: readonly MemberCardSummary[];
  selected: AverageFanFan | null;
  onSelect: (fan: AverageFanFan) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const subjects = AVERAGE_FAN_SUBJECTS[sport] as readonly string[];

  return (
    <div className="average-fan-stage">
      <button className="average-fan-back" type="button" onClick={onBack}>‹ HQ</button>
      <header className="average-fan-title">
        <small>OWNER PREVIEW · {sportLabel(sport)}</small>
        <h1>ARE YOU SMARTER THAN AN <em>AVERAGE FAN?</em></h1>
        <p>Pick one fan. You are stuck with them for the entire game.</p>
      </header>

      <section className="average-fan-report" aria-labelledby="average-fan-report-title">
        <div className="average-fan-report__heading">
          <span>CLASSMATE REPORT</span>
          <strong id="average-fan-report-title">CHOOSE YOUR FAN</strong>
          <small>Same overall IQ. Different subjects.</small>
        </div>

        <div className="average-fan-fan-grid">
          {AVERAGE_FAN_FANS.map((fan) => {
            const card = fanReportCard(sport, fan);
            const active = selected === fan;
            return (
              <button
                className={active ? "average-fan-card is-selected" : "average-fan-card"}
                type="button"
                onClick={() => onSelect(fan)}
                key={fan}
              >
                <span className="average-fan-card__portrait"><MemberPortrait fan={fan} members={members} /></span>
                <strong>{FAN_NAMES[fan]}</strong>
                <div className="average-fan-card__grades">
                  {subjects.map((subject) => (
                    <span key={subject}>
                      <small>{subject}</small>
                      <b>{card[subject]}</b>
                    </span>
                  ))}
                </div>
                <em>{active ? "SELECTED" : "SELECT"}</em>
              </button>
            );
          })}
        </div>
      </section>

      <button
        className="average-fan-primary average-fan-confirm"
        type="button"
        disabled={!selected}
        onClick={onConfirm}
      >
        CONFIRM {selected ? FAN_NAMES[selected].toUpperCase() : "FAN"}
      </button>
    </div>
  );
}

function FootballChooser({
  onChoose,
  onBack,
}: {
  onChoose: (sport: "nfl" | "cfb") => void;
  onBack: () => void;
}) {
  return (
    <div className="average-fan-stage average-fan-stage--chooser">
      <button className="average-fan-back" type="button" onClick={onBack}>‹ FOOTBALL HQ</button>
      <header className="average-fan-title">
        <small>OWNER PREVIEW</small>
        <h1>ARE YOU SMARTER THAN AN <em>AVERAGE FAN?</em></h1>
        <p>Choose the league for this QA run.</p>
      </header>
      <div className="average-fan-league-grid">
        <button type="button" onClick={() => onChoose("nfl")}>
          <span>NFL</span>
          <strong>PRO FOOTBALL</strong>
          <small>Players · Teams · History · X’s & O’s</small>
        </button>
        <button type="button" onClick={() => onChoose("cfb")}>
          <span>CFB</span>
          <strong>COLLEGE FOOTBALL</strong>
          <small>Players · Programs · Traditions · History</small>
        </button>
      </div>
    </div>
  );
}

function MoneyLadder({
  answered,
  activeQuestionNumber,
  final,
}: {
  answered: number;
  activeQuestionNumber?: number;
  final?: boolean;
}) {
  return (
    <aside className="average-fan-ladder" aria-label="Money ladder">
      <div className={final ? "is-active is-final" : ""}><b>FINAL</b><strong>$1,000,000</strong></div>
      {[...MONEY_LADDER].reverse().map((money, reverseIndex) => {
        const questionNumber = 10 - reverseIndex;
        const reached = questionNumber <= answered;
        const active = activeQuestionNumber === questionNumber;
        return (
          <div
            className={[reached ? "is-reached" : "", active ? "is-active" : ""].filter(Boolean).join(" ")}
            key={money}
          >
            <b>Q{questionNumber}</b>
            <strong>{moneyLabel(money)}</strong>
          </div>
        );
      })}
    </aside>
  );
}

function HelpRail({
  used,
  peeked,
  disabled,
  onPeek,
  onCopy,
}: {
  used: { peek: boolean; copy: boolean; save: boolean };
  peeked: boolean;
  disabled: boolean;
  onPeek: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="average-fan-help-rail" aria-label="Fan helps">
      <button type="button" disabled={used.peek || disabled} onClick={onPeek}>
        <span>👀</span><strong>PEEK</strong><small>{used.peek ? "USED" : peeked ? "OPEN" : "SEE THEIR ANSWER"}</small>
      </button>
      <button type="button" disabled={used.copy || disabled} onClick={onCopy}>
        <span>✍</span><strong>COPY</strong><small>{used.copy ? "USED" : "TRUST THEIR ANSWER"}</small>
      </button>
      <div className={used.save ? "is-used" : ""}>
        <span>★</span><strong>SAVE</strong><small>{used.save ? "USED" : "AUTO RESCUE"}</small>
      </div>
    </div>
  );
}

function QuestionInput({
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
  onSubmit: (value: string) => void;
}) {
  if (question.format === "three-choice") {
    return (
      <div className="average-fan-choices">
        {question.choices!.map((choice) => (
          <button type="button" disabled={disabled} key={choice} onClick={() => onSubmit(choice)}>{choice}</button>
        ))}
      </div>
    );
  }

  if (question.format === "true-false") {
    return (
      <div className="average-fan-choices average-fan-choices--binary">
        {["True", "False"].map((choice) => (
          <button type="button" disabled={disabled} key={choice} onClick={() => onSubmit(choice)}>{choice}</button>
        ))}
      </div>
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  }

  return (
    <form className="average-fan-short-answer" onSubmit={submit}>
      <input
        autoFocus
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type your answer"
        autoComplete="off"
        enterKeyHint="done"
      />
      <button type="submit" disabled={disabled || !value.trim()}>LOCK ANSWER</button>
    </form>
  );
}

function Board({
  sport,
  fan,
  questions,
  results,
  onChoose,
  onFinal,
  onBack,
}: {
  sport: AverageFanSport;
  fan: AverageFanFan;
  questions: readonly AverageFanQuestion[];
  results: readonly AverageFanBoardResult[];
  onChoose: (question: AverageFanQuestion) => void;
  onFinal: () => void;
  onBack: () => void;
}) {
  const answered = new Map(results.map((result) => [result.question.id, result]));
  const boardScore = scoreAverageFanBoard(
    results.filter((result) => !result.correct && !result.saved).map((result) => result.questionNumber),
  );

  return (
    <div className="average-fan-stage">
      <button className="average-fan-back" type="button" onClick={onBack}>‹ EXIT</button>
      <header className="average-fan-game-header">
        <div>
          <small>{sportLabel(sport)} · OWNER PREVIEW</small>
          <strong>ARE YOU SMARTER THAN AN AVERAGE FAN?</strong>
        </div>
        <span><small>YOUR FAN</small><b>{FAN_NAMES[fan]}</b></span>
        <span><small>BOARD SCORE</small><b>{boardScore}</b></span>
      </header>

      <div className="average-fan-board-layout">
        <main className="average-fan-board">
          {AVERAGE_FAN_SUBJECTS[sport].length ? [1, 2, 3, 4, 5].map((grade) => {
            const rows = questions.filter((question) => question.grade === grade);
            return (
              <section className="average-fan-grade-row" key={grade}>
                <header><b>{gradeLabel(grade)}</b><span>GRADE</span></header>
                <div>
                  {rows.map((question) => {
                    const result = answered.get(question.id);
                    return (
                      <button
                        className={result ? "average-fan-tile is-answered" : "average-fan-tile"}
                        type="button"
                        disabled={Boolean(result)}
                        onClick={() => onChoose(question)}
                        key={question.id}
                      >
                        <small>{question.format === "short-answer" ? "WRITE IT" : question.format === "three-choice" ? "3 CHOICES" : "TRUE / FALSE"}</small>
                        <strong>{question.subject}</strong>
                        {result ? <em>{result.saved ? "SAVED ✓" : result.correct ? "CORRECT ✓" : "MISS"}</em> : <span>CHOOSE</span>}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          }) : null}

          {results.length === 10 ? (
            <button className="average-fan-primary average-fan-final-cta" type="button" onClick={onFinal}>
              REVEAL FINAL SUBJECT
            </button>
          ) : (
            <p className="average-fan-board-note">Choose any open tile · {10 - results.length} questions left</p>
          )}
        </main>
        <MoneyLadder answered={results.length} />
      </div>
    </div>
  );
}

function QuestionScene({
  sport,
  fan,
  question,
  questionNumber,
  results,
  used,
  peeked,
  answerDraft,
  result,
  onDraft,
  onPeek,
  onAnswer,
  onContinue,
  onBack,
}: {
  sport: AverageFanSport;
  fan: AverageFanFan;
  question: AverageFanQuestion;
  questionNumber: number;
  results: readonly AverageFanBoardResult[];
  used: { peek: boolean; copy: boolean; save: boolean };
  peeked: boolean;
  answerDraft: string;
  result: AverageFanBoardResult | null;
  onDraft: (value: string) => void;
  onPeek: () => void;
  onAnswer: (value: string, help?: AnswerHelp) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const fanAnswer = averageFanFanAnswer(question, fan);
  const answered = result !== null;

  return (
    <div className="average-fan-stage">
      <button className="average-fan-back" type="button" onClick={onBack} disabled={answered}>‹ BOARD</button>
      <header className="average-fan-game-header">
        <div>
          <small>{sportLabel(sport)} · {gradeLabel(question.grade)} GRADE</small>
          <strong>{question.subject}</strong>
        </div>
        <span><small>QUESTION</small><b>{questionNumber}/10</b></span>
        <span><small>FOR</small><b>{moneyLabel(MONEY_LADDER[questionNumber - 1]!)}</b></span>
      </header>

      <div className="average-fan-question-layout">
        <main className={answered ? "average-fan-question is-result" : "average-fan-question"}>
          <div className="average-fan-question__meta">
            <span>{question.format === "short-answer" ? "SHORT ANSWER" : question.format === "three-choice" ? "THREE CHOICES" : "TRUE / FALSE"}</span>
            <b>{FAN_NAMES[fan]} IS LOCKED IN</b>
          </div>
          <h2>{question.prompt}</h2>

          {!answered && peeked ? (
            <div className="average-fan-peek">
              <small>{FAN_NAMES[fan].toUpperCase()} WROTE</small>
              <strong>{fanAnswer.answer}</strong>
            </div>
          ) : null}

          {!answered ? (
            <QuestionInput
              question={question}
              value={answerDraft}
              disabled={false}
              onChange={onDraft}
              onSubmit={(value) => onAnswer(value, null)}
            />
          ) : (
            <section className={result.saved ? "average-fan-reveal is-saved" : result.correct ? "average-fan-reveal is-correct" : "average-fan-reveal is-miss"}>
              <header>
                <span>{result.saved ? "SAVED BY YOUR FAN" : result.correct ? "CORRECT" : result.saveConsumed ? "SAVE MISSED" : "MISS"}</span>
                <strong>{result.saved || result.correct ? "✓" : "×"}</strong>
              </header>
              <div className="average-fan-reveal__answers">
                <p><small>YOUR ANSWER</small><b>{result.playerAnswer}</b></p>
                <p><small>CORRECT ANSWER</small><b>{question.answer}</b></p>
                <p><small>{FAN_NAMES[fan].toUpperCase()}</small><b>{result.fanAnswer}</b><em>{result.fanCorrect ? "RIGHT" : "WRONG"}</em></p>
              </div>
              <p>{question.explanation}</p>
              <button className="average-fan-primary" type="button" onClick={onContinue}>
                {results.length >= 10 ? "BACK TO BOARD" : "CHOOSE NEXT SUBJECT"}
              </button>
            </section>
          )}
        </main>

        <div className="average-fan-question-side">
          {!answered ? (
            <HelpRail
              used={used}
              peeked={peeked}
              disabled={answered}
              onPeek={onPeek}
              onCopy={() => onAnswer(fanAnswer.answer, "copy")}
            />
          ) : null}
          <MoneyLadder answered={results.length} activeQuestionNumber={answered ? undefined : questionNumber} />
        </div>
      </div>
    </div>
  );
}

function FinalDecision({
  sport,
  fan,
  question,
  boardScore,
  onWalk,
  onGo,
  onBack,
}: {
  sport: AverageFanSport;
  fan: AverageFanFan;
  question: AverageFanQuestion;
  boardScore: number;
  onWalk: () => void;
  onGo: () => void;
  onBack: () => void;
}) {
  return (
    <div className="average-fan-stage average-fan-stage--final">
      <button className="average-fan-back" type="button" onClick={onBack}>‹ BOARD</button>
      <header className="average-fan-title">
        <small>{sportLabel(sport)} · FINAL</small>
        <h1>THE <em>$1,000,000</em> QUESTION</h1>
        <p>The subject is all you get before you decide.</p>
      </header>

      <section className="average-fan-final-subject">
        <small>FINAL SUBJECT</small>
        <strong>{question.subject}</strong>
        <span>No Peek · No Copy · No Save</span>
      </section>

      <div className="average-fan-final-stakes">
        <article><small>WALK AWAY</small><strong>$500,000</strong><span>Bank {boardScore} HQ pts</span></article>
        <article><small>GO FOR IT</small><strong>$1,000,000</strong><span>Correct: {Math.min(100, boardScore + 10)} · Wrong: {Math.max(0, boardScore - 10)}</span></article>
      </div>

      <p className="average-fan-final-fan">{FAN_NAMES[fan]} is done helping. This one is all you.</p>

      <div className="average-fan-final-actions">
        <button type="button" onClick={onWalk}>WALK AWAY</button>
        <button className="average-fan-primary" type="button" onClick={onGo}>GO FOR $1,000,000</button>
      </div>
    </div>
  );
}

function FinalQuestion({
  sport,
  question,
  answerDraft,
  onDraft,
  onAnswer,
}: {
  sport: AverageFanSport;
  question: AverageFanQuestion;
  answerDraft: string;
  onDraft: (value: string) => void;
  onAnswer: (value: string) => void;
}) {
  return (
    <div className="average-fan-stage average-fan-stage--final">
      <header className="average-fan-game-header">
        <div><small>{sportLabel(sport)} · FINAL</small><strong>{question.subject}</strong></div>
        <span><small>VALUE</small><b>$1M</b></span>
        <span><small>HELPS</small><b>NONE</b></span>
      </header>

      <div className="average-fan-question-layout average-fan-question-layout--final">
        <main className="average-fan-question">
          <div className="average-fan-question__meta">
            <span>$1,000,000 QUESTION</span>
            <b>FINAL ANSWER</b>
          </div>
          <h2>{question.prompt}</h2>
          <QuestionInput
            question={question}
            value={answerDraft}
            disabled={false}
            onChange={onDraft}
            onSubmit={onAnswer}
          />
        </main>
        <div className="average-fan-question-side"><MoneyLadder answered={10} final /></div>
      </div>
    </div>
  );
}

function ResultScene({
  sport,
  fan,
  results,
  finalQuestion,
  finalResult,
  onReplay,
  onExit,
}: {
  sport: AverageFanSport;
  fan: AverageFanFan;
  results: readonly AverageFanBoardResult[];
  finalQuestion: AverageFanQuestion;
  finalResult: AverageFanFinalResult;
  onReplay: () => void;
  onExit: () => void;
}) {
  const unsavedMisses = results.filter((result) => !result.correct && !result.saved);
  return (
    <div className="average-fan-stage average-fan-stage--result">
      <header className="average-fan-title">
        <small>{sportLabel(sport)} · FINAL REPORT</small>
        <h1>{finalResult.score}<em>/100</em></h1>
        <p>{moneyLabel(finalResult.money)} · Played with {FAN_NAMES[fan]}</p>
      </header>

      <section className="average-fan-result-summary">
        <article><small>BOARD</small><strong>{scoreAverageFanBoard(unsavedMisses.map((row) => row.questionNumber))}</strong><span>{10 - unsavedMisses.length}/10 clean or saved</span></article>
        <article><small>FINAL</small><strong>{finalResult.outcome === "walk-away" ? "WALKED" : finalResult.outcome === "correct" ? "CORRECT" : "MISS"}</strong><span>{finalQuestion.subject}</span></article>
        <article><small>FINISH</small><strong>{finalResult.score}</strong><span>HQ leaderboard score</span></article>
      </section>

      <section className="average-fan-result-list" aria-label="Question recap">
        {results.map((result) => (
          <div key={result.question.id}>
            <span>Q{result.questionNumber}</span>
            <p><small>{gradeLabel(result.question.grade)} · {result.question.subject}</small><strong>{result.question.prompt}</strong></p>
            <b className={result.saved ? "is-saved" : result.correct ? "is-correct" : "is-miss"}>
              {result.saved ? "SAVED" : result.correct ? "✓" : "×"}
            </b>
          </div>
        ))}
        <div className="is-final">
          <span>FINAL</span>
          <p><small>{finalQuestion.subject}</small><strong>{finalQuestion.prompt}</strong></p>
          <b className={finalResult.outcome === "correct" ? "is-correct" : finalResult.outcome === "walk-away" ? "is-walk" : "is-miss"}>
            {finalResult.outcome === "correct" ? "✓" : finalResult.outcome === "walk-away" ? "WALK" : "×"}
          </b>
        </div>
      </section>

      <div className="average-fan-result-actions">
        <button type="button" onClick={onExit}>BACK TO HQ</button>
        <button className="average-fan-primary" type="button" onClick={onReplay}>PLAY PREVIEW AGAIN</button>
      </div>
    </div>
  );
}

export default function AverageFanCasualPage({ scope }: { scope: Scope }) {
  const navigate = useNavigate();
  const exitRoute = scope === "football" ? "/football" : "/play";
  const [sport, setSport] = useState<AverageFanSport | null>(scope === "ufc" ? "ufc" : null);
  const [members, setMembers] = useState<MemberCardSummary[]>([]);
  const [memberRepository] = useState<MemberProfilesRepository | null>(() => createMemberProfilesRepository());
  const [selectedFan, setSelectedFan] = useState<AverageFanFan | null>(null);
  const [fan, setFan] = useState<AverageFanFan | null>(null);
  const [phase, setPhase] = useState<GamePhase>("board");
  const [results, setResults] = useState<AverageFanBoardResult[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<AverageFanQuestion | null>(null);
  const [answerDraft, setAnswerDraft] = useState("");
  const [peeked, setPeeked] = useState(false);
  const [used, setUsed] = useState({ peek: false, copy: false, save: false });
  const [lastResult, setLastResult] = useState<AverageFanBoardResult | null>(null);
  const [finalResult, setFinalResult] = useState<AverageFanFinalResult | null>(null);

  const run = useMemo(() => sport ? averageFanPreviewRun(sport) : null, [sport]);
  const accentStyle = {
    "--average-fan-accent": sport === "ufc" ? "#b91c1c" : "#1f4e79",
    "--average-fan-accent-soft": sport === "ufc" ? "rgba(185,28,28,.24)" : "rgba(31,78,121,.28)",
  } as CSSProperties;

  useEffect(() => {
    document.documentElement.classList.add("average-fan-active");
    document.body.classList.add("average-fan-active");
    return () => {
      document.documentElement.classList.remove("average-fan-active");
      document.body.classList.remove("average-fan-active");
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!memberRepository) return () => { active = false; };
    void memberRepository.listMembers()
      .then((rows) => { if (active) setMembers(rows); })
      .catch(() => { if (active) setMembers([]); });
    return () => { active = false; };
  }, [memberRepository]);

  function resetRun(nextSport: AverageFanSport | null = sport) {
    setSport(nextSport);
    setSelectedFan(null);
    setFan(null);
    setPhase("board");
    setResults([]);
    setActiveQuestion(null);
    setAnswerDraft("");
    setPeeked(false);
    setUsed({ peek: false, copy: false, save: false });
    setLastResult(null);
    setFinalResult(null);
  }

  function chooseQuestion(question: AverageFanQuestion) {
    if (!fan || results.some((result) => result.question.id === question.id)) return;
    setActiveQuestion(question);
    setAnswerDraft("");
    setPeeked(false);
    setLastResult(null);
  }

  function peek() {
    if (used.peek || !activeQuestion || !fan) return;
    setUsed((current) => ({ ...current, peek: true }));
    setPeeked(true);
  }

  function answerBoard(value: string, help: AnswerHelp = null) {
    if (!activeQuestion || !fan || lastResult) return;
    const fanAnswer = averageFanFanAnswer(activeQuestion, fan);
    const correct = averageFanAnswersMatch(activeQuestion, value);
    const saveAvailable = !used.save;
    const saved = !correct && saveAvailable && fanAnswer.correct;
    const saveConsumed = !correct && saveAvailable;
    const questionNumber = results.length + 1;
    const result: AverageFanBoardResult = {
      question: activeQuestion,
      questionNumber,
      playerAnswer: value,
      correct,
      saved,
      saveConsumed,
      fanAnswer: fanAnswer.answer,
      fanCorrect: fanAnswer.correct,
      help: help ?? (peeked ? "peek" : null),
      money: MONEY_LADDER[questionNumber - 1]!,
    };
    setResults((current) => [...current, result]);
    setLastResult(result);
    setAnswerDraft("");
    setUsed((current) => ({
      peek: current.peek,
      copy: current.copy || help === "copy",
      save: current.save || saveConsumed,
    }));
  }

  function continueFromQuestion() {
    setActiveQuestion(null);
    setLastResult(null);
    setAnswerDraft("");
    setPeeked(false);
  }

  const unsavedMisses = results
    .filter((result) => !result.correct && !result.saved)
    .map((result) => result.questionNumber);
  const boardScore = scoreAverageFanBoard(unsavedMisses);

  function walkAway() {
    setFinalResult({
      outcome: "walk-away",
      playerAnswer: null,
      score: scoreAverageFanFinal(boardScore, "walk-away"),
      money: 500_000,
    });
    setPhase("result");
  }

  function answerFinal(value: string) {
    if (!run || finalResult) return;
    const correct = averageFanAnswersMatch(run.final, value);
    const outcome = correct ? "correct" : "wrong";
    setFinalResult({
      outcome,
      playerAnswer: value,
      score: scoreAverageFanFinal(boardScore, outcome),
      money: correct ? 1_000_000 : 25_000,
    });
    setPhase("result");
  }

  if (scope === "football" && !sport) {
    return (
      <div className="average-fan-shell" style={accentStyle}>
        <FootballChooser onChoose={setSport} onBack={() => navigate(exitRoute)} />
      </div>
    );
  }

  if (!sport || !run) return null;

  if (!fan) {
    return (
      <div className="average-fan-shell" style={accentStyle}>
        <FanSelection
          sport={sport}
          members={members}
          selected={selectedFan}
          onSelect={setSelectedFan}
          onConfirm={() => { if (selectedFan) setFan(selectedFan); }}
          onBack={() => scope === "football" ? resetRun(null) : navigate(exitRoute)}
        />
      </div>
    );
  }

  if (phase === "result" && finalResult) {
    return (
      <div className="average-fan-shell" style={accentStyle}>
        <ResultScene
          sport={sport}
          fan={fan}
          results={results}
          finalQuestion={run.final}
          finalResult={finalResult}
          onReplay={() => resetRun(sport)}
          onExit={() => navigate(exitRoute)}
        />
      </div>
    );
  }

  if (phase === "final-question") {
    return (
      <div className="average-fan-shell" style={accentStyle}>
        <FinalQuestion
          sport={sport}
          question={run.final}
          answerDraft={answerDraft}
          onDraft={setAnswerDraft}
          onAnswer={answerFinal}
        />
      </div>
    );
  }

  if (phase === "final-decision") {
    return (
      <div className="average-fan-shell" style={accentStyle}>
        <FinalDecision
          sport={sport}
          fan={fan}
          question={run.final}
          boardScore={boardScore}
          onWalk={walkAway}
          onGo={() => { setAnswerDraft(""); setPhase("final-question"); }}
          onBack={() => setPhase("board")}
        />
      </div>
    );
  }

  if (activeQuestion) {
    return (
      <div className="average-fan-shell" style={accentStyle}>
        <QuestionScene
          sport={sport}
          fan={fan}
          question={activeQuestion}
          questionNumber={lastResult?.questionNumber ?? results.length + (lastResult ? 0 : 1)}
          results={results}
          used={used}
          peeked={peeked}
          answerDraft={answerDraft}
          result={lastResult}
          onDraft={setAnswerDraft}
          onPeek={peek}
          onAnswer={answerBoard}
          onContinue={continueFromQuestion}
          onBack={() => { setActiveQuestion(null); setAnswerDraft(""); setPeeked(false); }}
        />
      </div>
    );
  }

  return (
    <div className="average-fan-shell" style={accentStyle}>
      <Board
        sport={sport}
        fan={fan}
        questions={run.board}
        results={results}
        onChoose={chooseQuestion}
        onFinal={() => setPhase("final-decision")}
        onBack={() => navigate(exitRoute)}
      />
    </div>
  );
}
