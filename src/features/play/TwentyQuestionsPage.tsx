import { useMemo, useState } from "react";
import {
  formatTwentyQuestionsScoreImpact,
  TWENTY_QUESTIONS_FINAL_GUESS_CHOICE_LIMIT,
  TWENTY_QUESTIONS_LIMIT,
  TWENTY_QUESTIONS_START_SCORE,
  twentyQuestionsEligibleQuestions,
  twentyQuestionsFinalGuessChoices,
  twentyQuestionsFinalScore,
  twentyQuestionsRecommendedQuestions,
  twentyQuestionsRequiresFinalGuess,
  twentyQuestionsScoreAfterQuestion,
  twentyQuestionsScoreAfterWrongGuess,
  type TwentyQuestionsQuestion,
  type TwentyQuestionsSport,
  type TwentyQuestionsSubject,
} from "../games/twentyQuestionsEngine";
import type { TwentyQuestionsRound } from "../games/twentyQuestionsRuntime";

type Phase = "start" | "playing" | "result";
type ResultState = "correct" | "incorrect" | "forfeit";

type AskedQuestion = {
  question: TwentyQuestionsQuestion;
  answer: boolean;
};

type QuestionCategoryKey = "role" | "era" | "career" | "achievements" | "affiliations" | "matchups";

const QUESTION_CATEGORY_ORDER: readonly QuestionCategoryKey[] = [
  "role",
  "era",
  "career",
  "achievements",
  "affiliations",
  "matchups",
];

const INITIAL_CATEGORY_LIMIT = 5;
const CATEGORY_EXPANSION_STEP = 5;
const RECOMMENDED_QUESTION_LIMIT = 5;
const COMPACT_HISTORY_LIMIT = 3;

function normalized(value: string) {
  return value.trim().toLowerCase();
}

function roundLabel(round: TwentyQuestionsRound) {
  return round.universe.league === "UFC" ? "UFC" : round.universe.league;
}

function questionCategory(question: TwentyQuestionsQuestion): QuestionCategoryKey {
  const id = question.id.toLowerCase();
  if (
    id.startsWith("identity:")
    || id.startsWith("division:")
    || id.startsWith("role:")
    || id.startsWith("position:")
    || id.startsWith("position-family:")
  ) return "role";
  if (id.startsWith("era:") || id.includes(":era:") || id.includes("longevity")) return "era";
  if (id.startsWith("faced:") || id.startsWith("beat:")) return "matchups";
  if (/(franchise|program|conference|college|school|team):/.test(id)) return "affiliations";
  if (/(title|champ|award|mvp|all-pro|pro-bowl|heisman|super-bowl|playoff|trophy|honor)/.test(id)) return "achievements";
  return "career";
}

function questionCategoryLabel(category: QuestionCategoryKey, sport: TwentyQuestionsSport) {
  if (sport === "ufc") {
    const labels: Record<QuestionCategoryKey, string> = {
      role: "Division",
      era: "Era & UFC Tenure",
      career: "Career & Results",
      achievements: "Championships & Accomplishments",
      affiliations: "Teams & Affiliations",
      matchups: "Opponents",
    };
    return labels[category];
  }
  const labels: Record<QuestionCategoryKey, string> = {
    role: "Position & Role",
    era: "Era & Longevity",
    career: "Career Production",
    achievements: "Championships & Awards",
    affiliations: "Teams, Schools & Conferences",
    matchups: "Matchups",
  };
  return labels[category];
}

function remainingSubjectsForAnswers(
  subjects: readonly TwentyQuestionsSubject[],
  asked: readonly AskedQuestion[],
  rejectedSubjectIds: ReadonlySet<string>,
) {
  return subjects.filter((subject) => (
    !rejectedSubjectIds.has(subject.id)
    && asked.every((entry) => entry.question.answer(subject.id) === entry.answer)
  ));
}

interface TwentyQuestionsPageProps {
  sport: TwentyQuestionsSport;
  createRound: () => TwentyQuestionsRound;
}

export default function TwentyQuestionsPage({ sport, createRound }: TwentyQuestionsPageProps) {
  const [round, setRound] = useState<TwentyQuestionsRound>(() => createRound());
  const [phase, setPhase] = useState<Phase>("start");
  const [resultState, setResultState] = useState<ResultState>("incorrect");
  const [score, setScore] = useState(TWENTY_QUESTIONS_START_SCORE);
  const [asked, setAsked] = useState<AskedQuestion[]>([]);
  const [questionSearch, setQuestionSearch] = useState("");
  const [categoryLimits, setCategoryLimits] = useState<Partial<Record<QuestionCategoryKey, number>>>({});
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [reviewCluesOpen, setReviewCluesOpen] = useState(false);
  const [guessOpen, setGuessOpen] = useState(false);
  const [guessSearch, setGuessSearch] = useState("");
  const [selectedGuess, setSelectedGuess] = useState<TwentyQuestionsSubject | null>(null);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [rejectedSubjectIds, setRejectedSubjectIds] = useState<Set<string>>(() => new Set());
  const [guessNotice, setGuessNotice] = useState<string | null>(null);

  const usedQuestionIds = useMemo(() => new Set(asked.map((entry) => entry.question.id)), [asked]);
  const unaskedQuestions = useMemo(() => round.universe.questions
    .filter((question) => !usedQuestionIds.has(question.id))
    .sort((left, right) => left.label.localeCompare(right.label)), [round.universe.questions, usedQuestionIds]);
  const remainingSubjects = useMemo(
    () => remainingSubjectsForAnswers(round.universe.subjects, asked, rejectedSubjectIds),
    [asked, rejectedSubjectIds, round.universe.subjects],
  );
  const finalGuessRequired = phase === "playing"
    && twentyQuestionsRequiresFinalGuess(asked.length, remainingSubjects.length);
  const eligibleQuestions = useMemo(
    () => twentyQuestionsEligibleQuestions(unaskedQuestions, remainingSubjects),
    [remainingSubjects, unaskedQuestions],
  );
  const recommendedQuestions = useMemo(
    () => twentyQuestionsRecommendedQuestions(eligibleQuestions, remainingSubjects, RECOMMENDED_QUESTION_LIMIT),
    [eligibleQuestions, remainingSubjects],
  );
  const recommendedQuestionIds = useMemo(
    () => new Set(recommendedQuestions.map((question) => question.id)),
    [recommendedQuestions],
  );
  const searchResults = useMemo(() => {
    const query = normalized(questionSearch);
    if (!query) return [];
    return eligibleQuestions.filter((question) => normalized(question.label).includes(query));
  }, [eligibleQuestions, questionSearch]);
  const categorizedQuestions = useMemo(() => QUESTION_CATEGORY_ORDER
    .map((category) => ({
      category,
      label: questionCategoryLabel(category, sport),
      questions: eligibleQuestions.filter((question) => (
        !recommendedQuestionIds.has(question.id) && questionCategory(question) === category
      )),
    }))
    .filter((group) => group.questions.length > 0), [eligibleQuestions, recommendedQuestionIds, sport]);

  const finalGuessChoices = useMemo(
    () => twentyQuestionsFinalGuessChoices(
      round.universe.subjects,
      remainingSubjects,
      round.hiddenSubject.id,
      TWENTY_QUESTIONS_FINAL_GUESS_CHOICE_LIMIT,
    ),
    [remainingSubjects, round.hiddenSubject.id, round.universe.subjects],
  );
  const guessMatches = useMemo(() => {
    const query = normalized(guessSearch);
    const guessPool = finalGuessRequired ? finalGuessChoices : round.universe.subjects;
    if (!query) return finalGuessRequired ? finalGuessChoices : [];
    if (query.length < 2) return [];
    return guessPool
      .filter((subject) => normalized(subject.name).includes(query))
      .slice(0, TWENTY_QUESTIONS_FINAL_GUESS_CHOICE_LIMIT);
  }, [finalGuessChoices, finalGuessRequired, guessSearch, round.universe.subjects]);

  const finalScore = twentyQuestionsFinalScore(score);
  const football = sport === "football";

  function resetRound() {
    setRound(createRound());
    setPhase("start");
    setResultState("incorrect");
    setScore(TWENTY_QUESTIONS_START_SCORE);
    setAsked([]);
    setQuestionSearch("");
    setCategoryLimits({});
    setHistoryExpanded(false);
    setReviewCluesOpen(false);
    setGuessOpen(false);
    setGuessSearch("");
    setSelectedGuess(null);
    setWrongGuesses(0);
    setRejectedSubjectIds(new Set());
    setGuessNotice(null);
  }

  function askQuestion(question: TwentyQuestionsQuestion) {
    if (phase !== "playing" || asked.length >= TWENTY_QUESTIONS_LIMIT || usedQuestionIds.has(question.id)) return;
    const answer = question.answer(round.hiddenSubject.id);
    const nextAsked = [...asked, { question, answer }];
    setAsked(nextAsked);
    setScore((current) => twentyQuestionsScoreAfterQuestion(current, question.internalCost));
    setQuestionSearch("");
    setCategoryLimits({});
    if (nextAsked.length >= TWENTY_QUESTIONS_LIMIT) {
      setGuessOpen(true);
      setGuessSearch("");
      setSelectedGuess(null);
      setGuessNotice(null);
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

    const finalGuess = finalGuessRequired;
    setScore((current) => twentyQuestionsScoreAfterWrongGuess(current));
    setWrongGuesses((current) => current + 1);
    if (finalGuess) {
      setResultState("incorrect");
      setPhase("result");
      setGuessOpen(false);
      setGuessNotice(null);
      return;
    }

    setRejectedSubjectIds((current) => {
      const next = new Set(current);
      next.add(selectedGuess.id);
      return next;
    });
    setGuessNotice(`${selectedGuess.name} is not the answer. −10 pts.`);
    setGuessSearch("");
    setSelectedGuess(null);
  }

  function forfeitRound() {
    if (phase !== "playing") return;
    setResultState("forfeit");
    setPhase("result");
    setGuessOpen(false);
    setGuessNotice(null);
  }

  function renderQuestionButton(question: TwentyQuestionsQuestion) {
    return (
      <button type="button" key={question.id} onClick={() => askQuestion(question)}>
        <span>{question.label}</span>
        <strong>{formatTwentyQuestionsScoreImpact(question.internalCost)}</strong>
      </button>
    );
  }

  function renderAskedEntries(entries: readonly AskedQuestion[]) {
    return entries.map((entry) => {
      const questionNumber = asked.findIndex((candidate) => candidate.question.id === entry.question.id) + 1;
      return (
        <article key={entry.question.id}>
          <span className={entry.answer ? "is-yes" : "is-no"}>{entry.answer ? "YES" : "NO"}</span>
          <div>
            <strong>{entry.question.label}</strong>
            <small>Question {questionNumber} · {formatTwentyQuestionsScoreImpact(entry.question.internalCost)}</small>
          </div>
        </article>
      );
    });
  }

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
              After question 10, you must guess or reveal the answer.
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
              <div><small>QUESTIONS LEFT</small><strong>{TWENTY_QUESTIONS_LIMIT - asked.length}</strong></div>
              <div><small>{football ? "PEOPLE LEFT" : "FIGHTERS LEFT"}</small><strong>{remainingSubjects.length}</strong></div>
              <div><small>SCORE</small><strong>{score.toFixed(1)}</strong></div>
              <button
                type="button"
                onClick={() => {
                  if (!finalGuessRequired) setGuessOpen((open) => !open);
                }}
              >
                {finalGuessRequired ? "FINAL GUESS" : "GUESS"}
              </button>
            </section>

            {guessOpen || finalGuessRequired ? (
              <section className={`twenty-questions-guess${finalGuessRequired ? " is-final" : ""}`} aria-label="Guess the identity">
                <div className="twenty-questions-section-heading">
                  <div>
                    <p className="eyebrow">{finalGuessRequired ? "FINAL GUESS" : "GUESS ANYTIME"}</p>
                    <h2>{finalGuessRequired ? "Make your final guess. Who is it?" : "Who is it?"}</h2>
                  </div>
                  <span>{finalGuessRequired ? "Guess or reveal the answer · wrong guess −10 pts" : "Wrong guess −10 pts"}</span>
                </div>
                {finalGuessRequired ? (
                  <p className="twenty-questions-final-guess-copy">
                    Choose from the final identity board below, search it, or reveal the answer.
                  </p>
                ) : null}
                <input
                  value={guessSearch}
                  onChange={(event) => {
                    setGuessSearch(event.target.value);
                    setSelectedGuess(null);
                    setGuessNotice(null);
                  }}
                  placeholder={finalGuessRequired
                    ? "Search final identity board…"
                    : football
                      ? `Search ${roundLabel(round)} identities…`
                      : "Search UFC fighters…"}
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
                <button className="twenty-questions-more" type="button" onClick={forfeitRound}>FORFEIT / REVEAL ANSWER</button>
              </section>
            ) : null}

            {asked.length ? (
              <section className="twenty-questions-history" aria-labelledby="twenty-questions-history-title">
                <div className="twenty-questions-section-heading">
                  <div><p className="eyebrow">ASKED {asked.length} / {TWENTY_QUESTIONS_LIMIT}</p><h2 id="twenty-questions-history-title">What you know</h2></div>
                </div>
                <div className="twenty-questions-history-list">
                  {renderAskedEntries(
                    historyExpanded
                      ? [...asked].reverse()
                      : [...asked].reverse().slice(0, COMPACT_HISTORY_LIMIT),
                  )}
                </div>
                {asked.length > COMPACT_HISTORY_LIMIT ? (
                  <button
                    className="twenty-questions-more"
                    type="button"
                    onClick={() => setHistoryExpanded((expanded) => !expanded)}
                  >
                    {historyExpanded ? "COLLAPSE CLUES" : `SHOW ALL ${asked.length} CLUES`}
                  </button>
                ) : null}
              </section>
            ) : null}

            {!finalGuessRequired ? (
              <section className="twenty-questions-bank" aria-labelledby="twenty-questions-bank-title">
                <div className="twenty-questions-section-heading">
                  <div><p className="eyebrow">QUESTION BANK</p><h2 id="twenty-questions-bank-title">Choose your next question</h2></div>
                </div>
                <input
                  value={questionSearch}
                  onChange={(event) => setQuestionSearch(event.target.value)}
                  placeholder="Search questions…"
                  aria-label="Search questions"
                />

                {questionSearch.trim() ? (
                  <section className="twenty-questions-category" aria-labelledby="twenty-questions-search-results-title">
                    <div className="twenty-questions-category__heading">
                      <h3 id="twenty-questions-search-results-title">Search results</h3>
                      <span>{searchResults.length}</span>
                    </div>
                    <div className="twenty-questions-question-list">
                      {searchResults.map(renderQuestionButton)}
                    </div>
                    {!searchResults.length ? <p className="twenty-questions-empty">No matching questions.</p> : null}
                  </section>
                ) : (
                  <>
                    <section className="twenty-questions-category twenty-questions-recommended" aria-labelledby="twenty-questions-recommended-title">
                      <div className="twenty-questions-category__heading">
                        <div>
                          <p className="eyebrow">BEST CLUES RIGHT NOW</p>
                          <h3 id="twenty-questions-recommended-title">Recommended</h3>
                        </div>
                        <span>{recommendedQuestions.length}</span>
                      </div>
                      {recommendedQuestions.length ? (
                        <div className="twenty-questions-question-list">
                          {recommendedQuestions.map(renderQuestionButton)}
                        </div>
                      ) : (
                        <p className="twenty-questions-empty">
                          {remainingSubjects.length <= 1 ? "One identity remains. Guess or reveal the answer." : "No remaining question cleanly splits the current pool."}
                        </p>
                      )}
                    </section>

                    {categorizedQuestions.map((group) => {
                      const visibleLimit = categoryLimits[group.category] ?? INITIAL_CATEGORY_LIMIT;
                      const visibleQuestions = group.questions.slice(0, visibleLimit);
                      const hasMore = group.questions.length > visibleLimit;
                      return (
                        <section
                          className="twenty-questions-category"
                          key={group.category}
                          aria-labelledby={`twenty-questions-category-${group.category}`}
                        >
                          <div className="twenty-questions-category__heading">
                            <h3 id={`twenty-questions-category-${group.category}`}>{group.label}</h3>
                            <span>{group.questions.length}</span>
                          </div>
                          <div className="twenty-questions-question-list">
                            {visibleQuestions.map(renderQuestionButton)}
                          </div>
                          <div className="twenty-questions-category__actions">
                            {hasMore ? (
                              <button
                                className="twenty-questions-more"
                                type="button"
                                onClick={() => setCategoryLimits((current) => ({
                                  ...current,
                                  [group.category]: visibleLimit + CATEGORY_EXPANSION_STEP,
                                }))}
                              >
                                SHOW 5 MORE
                              </button>
                            ) : null}
                            {visibleLimit > INITIAL_CATEGORY_LIMIT ? (
                              <button
                                className="twenty-questions-more"
                                type="button"
                                onClick={() => setCategoryLimits((current) => ({
                                  ...current,
                                  [group.category]: INITIAL_CATEGORY_LIMIT,
                                }))}
                              >
                                COLLAPSE
                              </button>
                            ) : null}
                          </div>
                        </section>
                      );
                    })}
                  </>
                )}
              </section>
            ) : null}
          </>
        ) : null}

        {phase === "result" ? (
          <section className="twenty-questions-result">
            <p className="eyebrow">{resultState === "correct" ? "SOLVED" : resultState === "forfeit" ? "FORFEITED" : "NOT SOLVED"}</p>
            <h2>{round.hiddenSubject.name}</h2>
            <p>{resultState === "correct"
              ? "You found the hidden identity."
              : resultState === "forfeit"
                ? "You revealed the hidden identity."
                : "Your final guess missed. This was the hidden identity."}</p>
            <div className="twenty-questions-result__score-block">
              <div className="twenty-questions-result__score">{finalScore}</div>
              <small>FINAL SCORE</small>
            </div>
            <div className="twenty-questions-result__stats">
              <span><strong>{asked.length}</strong> questions used</span>
              <span><strong>{wrongGuesses}</strong> wrong guesses</span>
              <span><strong>{roundLabel(round)}</strong> universe</span>
            </div>
            {asked.length ? (
              <>
                <button className="twenty-questions-more" type="button" onClick={() => setReviewCluesOpen((open) => !open)}>
                  {reviewCluesOpen ? "HIDE CLUES" : "REVIEW CLUES"}
                </button>
                {reviewCluesOpen ? (
                  <div className="twenty-questions-result__clues" aria-label="Round clues">
                    <div className="twenty-questions-history-list">
                      {renderAskedEntries(asked)}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
            <button className="twenty-questions-primary" type="button" onClick={resetRound}>PLAY AGAIN</button>
          </section>
        ) : null}
      </section>
    </main>
  );
}
