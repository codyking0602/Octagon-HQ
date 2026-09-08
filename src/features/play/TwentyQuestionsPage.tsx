import { useMemo, useState } from "react";
import {
  formatTwentyQuestionsScoreImpact,
  TWENTY_QUESTIONS_LIMIT,
  TWENTY_QUESTIONS_START_SCORE,
  twentyQuestionsFinalScore,
  twentyQuestionsScoreAfterQuestion,
  twentyQuestionsScoreAfterWrongGuess,
  type TwentyQuestionsQuestion,
  type TwentyQuestionsSport,
  type TwentyQuestionsSubject,
} from "../games/twentyQuestionsEngine";
import type { TwentyQuestionsRound } from "../games/twentyQuestionsRuntime";

type Phase = "start" | "playing" | "result";
type ResultState = "correct" | "out-of-questions";

type AskedQuestion = {
  question: TwentyQuestionsQuestion;
  answer: boolean;
};

function normalized(value: string) {
  return value.trim().toLowerCase();
}

function roundLabel(round: TwentyQuestionsRound) {
  return round.universe.league === "UFC" ? "UFC" : round.universe.league;
}

interface TwentyQuestionsPageProps {
  sport: TwentyQuestionsSport;
  createRound: () => TwentyQuestionsRound;
}

export default function TwentyQuestionsPage({ sport, createRound }: TwentyQuestionsPageProps) {
  const [round, setRound] = useState<TwentyQuestionsRound>(() => createRound());
  const [phase, setPhase] = useState<Phase>("start");
  const [resultState, setResultState] = useState<ResultState>("out-of-questions");
  const [score, setScore] = useState(TWENTY_QUESTIONS_START_SCORE);
  const [asked, setAsked] = useState<AskedQuestion[]>([]);
  const [questionSearch, setQuestionSearch] = useState("");
  const [visibleQuestionLimit, setVisibleQuestionLimit] = useState(36);
  const [guessOpen, setGuessOpen] = useState(false);
  const [guessSearch, setGuessSearch] = useState("");
  const [selectedGuess, setSelectedGuess] = useState<TwentyQuestionsSubject | null>(null);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [guessNotice, setGuessNotice] = useState<string | null>(null);

  const usedQuestionIds = useMemo(() => new Set(asked.map((entry) => entry.question.id)), [asked]);
  const availableQuestions = useMemo(() => {
    const query = normalized(questionSearch);
    return round.universe.questions
      .filter((question) => !usedQuestionIds.has(question.id))
      .filter((question) => !query || normalized(question.label).includes(query))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [questionSearch, round.universe.questions, usedQuestionIds]);

  const guessMatches = useMemo(() => {
    const query = normalized(guessSearch);
    if (query.length < 2) return [];
    return round.universe.subjects
      .filter((subject) => normalized(subject.name).includes(query))
      .slice(0, 12);
  }, [guessSearch, round.universe.subjects]);

  function resetRound() {
    setRound(createRound());
    setPhase("start");
    setResultState("out-of-questions");
    setScore(TWENTY_QUESTIONS_START_SCORE);
    setAsked([]);
    setQuestionSearch("");
    setVisibleQuestionLimit(36);
    setGuessOpen(false);
    setGuessSearch("");
    setSelectedGuess(null);
    setWrongGuesses(0);
    setGuessNotice(null);
  }

  function askQuestion(question: TwentyQuestionsQuestion) {
    if (phase !== "playing" || asked.length >= TWENTY_QUESTIONS_LIMIT || usedQuestionIds.has(question.id)) return;
    const answer = question.answer(round.hiddenSubject.id);
    const nextAsked = [...asked, { question, answer }];
    setAsked(nextAsked);
    setScore((current) => twentyQuestionsScoreAfterQuestion(current, question.internalCost));
    setQuestionSearch("");
    setVisibleQuestionLimit(36);
    if (nextAsked.length >= TWENTY_QUESTIONS_LIMIT) {
      setResultState("out-of-questions");
      setPhase("result");
      setGuessOpen(false);
    }
  }

  function submitGuess() {
    if (phase !== "playing" || !selectedGuess) return;
    if (selectedGuess.id === round.hiddenSubject.id) {
      setResultState("correct");
      setPhase("result");
      setGuessOpen(false);
      setGuessNotice(null);
      return;
    }
    setScore((current) => twentyQuestionsScoreAfterWrongGuess(current));
    setWrongGuesses((current) => current + 1);
    setGuessNotice(`${selectedGuess.name} is not the answer. −10 pts.`);
    setGuessSearch("");
    setSelectedGuess(null);
  }

  const finalScore = twentyQuestionsFinalScore(score);
  const football = sport === "football";

  return (
    <main className="page twenty-questions-page" data-sport={sport}>
      <section className="twenty-questions-shell">
        <header className="twenty-questions-header">
          <div>
            <p className="eyebrow">{football ? "FOOTBALL GAMES" : "UFC GAMES"}</p>
            <h1>20 Questions</h1>
          </div>
          {phase !== "start" ? <span className="twenty-questions-league-pill">{roundLabel(round)}</span> : null}
        </header>

        {phase === "start" ? (
          <section className="twenty-questions-start">
            <div className="twenty-questions-start__mark">?</div>
            <p className="twenty-questions-start__league">
              {football ? `${roundLabel(round)} ROUND` : "UFC ROUND"}
            </p>
            <h2>Find the hidden {football ? "player or head coach" : "fighter"}.</h2>
            <p>
              Ask up to 10 factual Yes/No questions, or guess the identity at any time.
              Every question shows exactly how many score points it will cost before you ask it.
            </p>
            <div className="twenty-questions-rules" aria-label="20 Questions scoring rules">
              <span><strong>100</strong> starting score</span>
              <span><strong>10</strong> questions max</span>
              <span><strong>−10</strong> wrong guess</span>
            </div>
            {football ? <p className="twenty-questions-disclosure">League is locked and revealed before the first question.</p> : null}
            <button className="twenty-questions-primary" type="button" onClick={() => setPhase("playing")}>START ROUND</button>
          </section>
        ) : null}

        {phase === "playing" ? (
          <>
            <section className="twenty-questions-scorebar" aria-label="Round status">
              <div><small>QUESTIONS</small><strong>{asked.length} / {TWENTY_QUESTIONS_LIMIT}</strong></div>
              <div><small>SCORE</small><strong>{score.toFixed(1)}</strong></div>
              <button type="button" onClick={() => setGuessOpen((open) => !open)}>GUESS</button>
            </section>

            {guessOpen ? (
              <section className="twenty-questions-guess" aria-label="Guess the identity">
                <div className="twenty-questions-section-heading">
                  <div><p className="eyebrow">GUESS ANYTIME</p><h2>Who is it?</h2></div>
                  <span>Wrong guess −10 pts</span>
                </div>
                <input
                  value={guessSearch}
                  onChange={(event) => {
                    setGuessSearch(event.target.value);
                    setSelectedGuess(null);
                    setGuessNotice(null);
                  }}
                  placeholder={football ? `Search the full ${roundLabel(round)} roster…` : "Search the full UFC roster…"}
                  aria-label="Search identities"
                />
                {guessMatches.length ? (
                  <div className="twenty-questions-guess-list">
                    {guessMatches.map((subject) => (
                      <button
                        type="button"
                        key={subject.id}
                        className={selectedGuess?.id === subject.id ? "is-selected" : ""}
                        onClick={() => setSelectedGuess(subject)}
                      >
                        <strong>{subject.name}</strong>
                        <small>{subject.kind === "coach" ? "Head coach" : subject.kind === "fighter" ? "Fighter" : "Player"}</small>
                      </button>
                    ))}
                  </div>
                ) : null}
                {selectedGuess ? (
                  <button className="twenty-questions-primary" type="button" onClick={submitGuess}>GUESS {selectedGuess.name.toUpperCase()}</button>
                ) : null}
                {guessNotice ? <p className="twenty-questions-wrong-guess" role="status">{guessNotice}</p> : null}
              </section>
            ) : null}

            {asked.length ? (
              <section className="twenty-questions-history" aria-labelledby="twenty-questions-history-title">
                <div className="twenty-questions-section-heading">
                  <div><p className="eyebrow">ANSWER HISTORY</p><h2 id="twenty-questions-history-title">What you know</h2></div>
                </div>
                <div className="twenty-questions-history-list">
                  {[...asked].reverse().map((entry, reverseIndex) => (
                    <article key={entry.question.id}>
                      <span className={entry.answer ? "is-yes" : "is-no"}>{entry.answer ? "YES" : "NO"}</span>
                      <div>
                        <strong>{entry.question.label}</strong>
                        <small>Question {asked.length - reverseIndex} · {formatTwentyQuestionsScoreImpact(entry.question.internalCost)}</small>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="twenty-questions-bank" aria-labelledby="twenty-questions-bank-title">
              <div className="twenty-questions-section-heading">
                <div><p className="eyebrow">QUESTION BANK</p><h2 id="twenty-questions-bank-title">Choose your next question</h2></div>
                <span>Score impact shown first</span>
              </div>
              <input
                value={questionSearch}
                onChange={(event) => {
                  setQuestionSearch(event.target.value);
                  setVisibleQuestionLimit(36);
                }}
                placeholder="Search questions…"
                aria-label="Search questions"
              />
              <div className="twenty-questions-question-list">
                {availableQuestions.slice(0, visibleQuestionLimit).map((question) => (
                  <button type="button" key={question.id} onClick={() => askQuestion(question)}>
                    <span>{question.label}</span>
                    <strong>{formatTwentyQuestionsScoreImpact(question.internalCost)}</strong>
                  </button>
                ))}
              </div>
              {availableQuestions.length > visibleQuestionLimit ? (
                <button className="twenty-questions-more" type="button" onClick={() => setVisibleQuestionLimit((current) => current + 36)}>SHOW MORE QUESTIONS</button>
              ) : null}
            </section>
          </>
        ) : null}

        {phase === "result" ? (
          <section className="twenty-questions-result">
            <p className="eyebrow">{resultState === "correct" ? "CORRECT" : "OUT OF QUESTIONS"}</p>
            <div className="twenty-questions-result__score">{finalScore}</div>
            <small>FINAL SCORE</small>
            <h2>{round.hiddenSubject.name}</h2>
            <p>{resultState === "correct" ? "You found the hidden identity." : "The 10-question limit was reached before a correct guess."}</p>
            <div className="twenty-questions-result__stats">
              <span><strong>{asked.length}</strong> questions used</span>
              <span><strong>{wrongGuesses}</strong> wrong guesses</span>
              <span><strong>{roundLabel(round)}</strong> universe</span>
            </div>
            <button className="twenty-questions-primary" type="button" onClick={resetRound}>PLAY AGAIN</button>
          </section>
        ) : null}
      </section>
    </main>
  );
}
