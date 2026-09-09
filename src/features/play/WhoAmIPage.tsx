import { useMemo, useState } from "react";
import {
  WHO_AM_I_CLUE_LIMIT,
  WHO_AM_I_CLUES_PER_REVEAL,
  WHO_AM_I_RESCUE_SCORE,
  WHO_AM_I_WRONG_GUESS_PENALTY,
  whoAmIRescueChoices,
  whoAmIScore,
  type WhoAmIRound,
  type WhoAmISport,
  type WhoAmISubject,
} from "../games/whoAmIEngine";

type Phase = "start" | "playing" | "rescue" | "result";
type ResultState = "correct" | "rescued" | "incorrect" | "forfeit";

function normalized(value: string) {
  return value.trim().toLowerCase();
}

interface WhoAmIPageProps {
  sport: WhoAmISport;
  createRound: () => WhoAmIRound;
}

export default function WhoAmIPage({ sport, createRound }: WhoAmIPageProps) {
  const [round, setRound] = useState<WhoAmIRound>(() => createRound());
  const [phase, setPhase] = useState<Phase>("start");
  const [resultState, setResultState] = useState<ResultState>("incorrect");
  const [revealedCount, setRevealedCount] = useState(WHO_AM_I_CLUES_PER_REVEAL);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [guessOpen, setGuessOpen] = useState(false);
  const [guessSearch, setGuessSearch] = useState("");
  const [selectedGuess, setSelectedGuess] = useState<WhoAmISubject | null>(null);
  const [guessNotice, setGuessNotice] = useState<string | null>(null);
  const [rejectedSubjectIds, setRejectedSubjectIds] = useState<Set<string>>(() => new Set());
  const [rescueChoices, setRescueChoices] = useState<readonly WhoAmISubject[]>([]);
  const [reviewCluesOpen, setReviewCluesOpen] = useState(false);

  const football = sport === "football";
  const finalGuessRequired = phase === "playing" && revealedCount >= WHO_AM_I_CLUE_LIMIT;
  const score = whoAmIScore(revealedCount, wrongGuesses);
  const revealedClues = round.clues.slice(0, revealedCount);
  const guessMatches = useMemo(() => {
    const query = normalized(guessSearch);
    if (query.length < 2) return [];
    return round.subjects
      .filter((subject) => !rejectedSubjectIds.has(subject.id))
      .filter((subject) => normalized(subject.name).includes(query))
      .slice(0, 16);
  }, [guessSearch, rejectedSubjectIds, round.subjects]);

  function resetRound() {
    setRound(createRound());
    setPhase("start");
    setResultState("incorrect");
    setRevealedCount(WHO_AM_I_CLUES_PER_REVEAL);
    setWrongGuesses(0);
    setGuessOpen(false);
    setGuessSearch("");
    setSelectedGuess(null);
    setGuessNotice(null);
    setRejectedSubjectIds(new Set());
    setRescueChoices([]);
    setReviewCluesOpen(false);
  }

  function revealMore() {
    if (phase !== "playing" || finalGuessRequired) return;
    const nextCount = Math.min(WHO_AM_I_CLUE_LIMIT, revealedCount + WHO_AM_I_CLUES_PER_REVEAL);
    setRevealedCount(nextCount);
    setGuessNotice(null);
    if (nextCount >= WHO_AM_I_CLUE_LIMIT) {
      setGuessOpen(true);
      setGuessSearch("");
      setSelectedGuess(null);
    }
  }

  function openRescue() {
    setRescueChoices(whoAmIRescueChoices(round));
    setSelectedGuess(null);
    setGuessOpen(false);
    setGuessNotice(null);
    setPhase("rescue");
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

    if (finalGuessRequired) {
      setWrongGuesses((current) => current + 1);
      openRescue();
      return;
    }

    setWrongGuesses((current) => current + 1);
    setRejectedSubjectIds((current) => new Set([...current, selectedGuess.id]));
    setGuessNotice(`${selectedGuess.name} is not the answer. −${WHO_AM_I_WRONG_GUESS_PENALTY} pts.`);
    setGuessSearch("");
    setSelectedGuess(null);
  }

  function submitRescueGuess(subject: WhoAmISubject) {
    if (phase !== "rescue") return;
    setResultState(subject.id === round.hiddenSubject.id ? "rescued" : "incorrect");
    setPhase("result");
  }

  function forfeitRound() {
    if (finalGuessRequired) {
      openRescue();
      return;
    }
    setResultState("forfeit");
    setPhase("result");
    setGuessOpen(false);
  }

  const finalScore = resultState === "correct"
    ? whoAmIScore(revealedCount, wrongGuesses)
    : resultState === "rescued"
      ? WHO_AM_I_RESCUE_SCORE
      : 0;

  return (
    <main className="page twenty-questions-page who-am-i-page" data-sport={sport}>
      <section className="twenty-questions-shell">
        <header className="twenty-questions-header">
          <div>
            <p className="eyebrow">{football ? "FOOTBALL GAMES" : "UFC GAMES"}</p>
            <h1>Who Am I?</h1>
          </div>
          {phase !== "start" ? <span className="twenty-questions-league-pill">{round.league}</span> : null}
        </header>

        {phase === "start" ? (
          <section className="twenty-questions-start">
            <div className="twenty-questions-start__mark">?</div>
            <p className="twenty-questions-start__league">{round.league} ROUND</p>
            <h2>How early can you recognize the hidden {football ? "player or head coach" : "fighter"}?</h2>
            <p>
              You get two clues at a time. Guess whenever you know it, or reveal another pair.
              The clues get stronger as the round goes on, and earlier answers score more.
            </p>
            <div className="twenty-questions-rules" aria-label="Who Am I scoring rules">
              <span><strong>10</strong> clues max</span>
              <span><strong>5</strong> guess windows</span>
              <span><strong>{WHO_AM_I_RESCUE_SCORE}</strong> rescue pts</span>
            </div>
            {football ? <p className="twenty-questions-disclosure">League is locked and revealed before the first clue.</p> : null}
            <button className="twenty-questions-primary" type="button" onClick={() => setPhase("playing")}>START ROUND</button>
          </section>
        ) : null}

        {phase === "playing" ? (
          <>
            <section className="twenty-questions-scorebar" aria-label="Round status">
              <div><small>CLUES SHOWN</small><strong>{revealedCount}</strong></div>
              <div><small>WINDOW</small><strong>{Math.ceil(revealedCount / 2)} / 5</strong></div>
              <div><small>SCORE</small><strong>{score}</strong></div>
              <button type="button" onClick={() => setGuessOpen((open) => finalGuessRequired ? true : !open)}>
                {finalGuessRequired ? "FINAL GUESS" : "GUESS"}
              </button>
            </section>

            <section className="twenty-questions-history" aria-labelledby="who-am-i-clues-title">
              <div className="twenty-questions-section-heading">
                <div>
                  <p className="eyebrow">CLUES {revealedCount} / {WHO_AM_I_CLUE_LIMIT}</p>
                  <h2 id="who-am-i-clues-title">What you know</h2>
                </div>
              </div>
              <div className="twenty-questions-history-list">
                {revealedClues.map((entry, index) => (
                  <article key={entry.id}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{entry.text}</strong>
                      <small>Clue {index + 1}</small>
                    </div>
                  </article>
                ))}
              </div>
              {!finalGuessRequired ? (
                <button className="twenty-questions-primary" type="button" onClick={revealMore}>REVEAL 2 MORE CLUES</button>
              ) : (
                <p className="twenty-questions-final-guess-copy">All 10 clues are out. Guess now, or use the four-choice rescue for {WHO_AM_I_RESCUE_SCORE} points.</p>
              )}
            </section>

            {guessOpen || finalGuessRequired ? (
              <section className={`twenty-questions-guess${finalGuessRequired ? " is-final" : ""}`} aria-label="Guess the identity">
                <div className="twenty-questions-section-heading">
                  <div>
                    <p className="eyebrow">{finalGuessRequired ? "FINAL GUESS" : "GUESS ANYTIME"}</p>
                    <h2>Who am I?</h2>
                  </div>
                  <span>{finalGuessRequired ? "60 pts" : `Wrong guess −${WHO_AM_I_WRONG_GUESS_PENALTY} pts`}</span>
                </div>
                <input
                  value={guessSearch}
                  onChange={(event) => {
                    setGuessSearch(event.target.value);
                    setSelectedGuess(null);
                    setGuessNotice(null);
                  }}
                  placeholder={football ? `Search ${round.league} identities…` : "Search UFC fighters…"}
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
                <button className="twenty-questions-more" type="button" onClick={forfeitRound}>
                  {finalGuessRequired ? `SHOW 4 CHOICES — ${WHO_AM_I_RESCUE_SCORE} PTS` : "FORFEIT / REVEAL ANSWER"}
                </button>
              </section>
            ) : null}
          </>
        ) : null}

        {phase === "rescue" ? (
          <section className="twenty-questions-guess is-final" aria-label="Who Am I rescue choice">
            <div className="twenty-questions-section-heading">
              <div>
                <p className="eyebrow">ONE LAST SHOT</p>
                <h2>Pick the answer</h2>
              </div>
              <span>{WHO_AM_I_RESCUE_SCORE} pts</span>
            </div>
            <p className="twenty-questions-final-guess-copy">One of these four is the hidden identity. Choose carefully.</p>
            <div className="twenty-questions-guess-list">
              {rescueChoices.map((subject) => (
                <button type="button" key={subject.id} onClick={() => submitRescueGuess(subject)}>
                  <strong>{subject.name}</strong>
                  <small>{subject.kind === "coach" ? "Head coach" : subject.kind === "fighter" ? "Fighter" : "Player"}</small>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {phase === "result" ? (
          <section className="twenty-questions-result">
            <p className="eyebrow">{resultState === "correct" ? "SOLVED" : resultState === "rescued" ? "RESCUED" : resultState === "forfeit" ? "FORFEITED" : "NOT SOLVED"}</p>
            <h2>{round.hiddenSubject.name}</h2>
            <p>{resultState === "correct"
              ? `You recognized the hidden ${round.hiddenSubject.kind}.`
              : resultState === "rescued"
                ? `You found the hidden ${round.hiddenSubject.kind} on the rescue board.`
                : resultState === "forfeit"
                  ? "You revealed the hidden identity."
                  : "Your last shot missed. This was the hidden identity."}</p>
            <div className="twenty-questions-result__score-block">
              <div className="twenty-questions-result__score">{finalScore}</div>
              <small>FINAL SCORE</small>
            </div>
            <div className="twenty-questions-result__stats">
              <span><strong>{revealedCount}</strong> clues used</span>
              <span><strong>{wrongGuesses}</strong> wrong guesses</span>
              <span><strong>{round.league}</strong> universe</span>
            </div>
            <button className="twenty-questions-more" type="button" onClick={() => setReviewCluesOpen((open) => !open)}>
              {reviewCluesOpen ? "HIDE CLUES" : "REVIEW ALL CLUES"}
            </button>
            {reviewCluesOpen ? (
              <div className="twenty-questions-result__clues" aria-label="Round clues">
                <div className="twenty-questions-history-list">
                  {round.clues.map((entry, index) => (
                    <article key={entry.id}>
                      <span>{index + 1}</span>
                      <div><strong>{entry.text}</strong><small>Clue {index + 1}</small></div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
            <button className="twenty-questions-primary" type="button" onClick={resetRound}>PLAY AGAIN</button>
          </section>
        ) : null}
      </section>
    </main>
  );
}
