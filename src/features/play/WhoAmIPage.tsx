import { useEffect, useMemo, useRef, useState } from "react";
import {
  WHO_AM_I_CLUE_LIMIT,
  WHO_AM_I_CLUES_PER_REVEAL,
  WHO_AM_I_RESCUE_GUESS_COUNT,
  WHO_AM_I_RESCUE_SCORE,
  WHO_AM_I_RESCUE_SECOND_SCORE,
  WHO_AM_I_WRONG_GUESS_PENALTY,
  whoAmIRecoveryScore,
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
  const [rescueMisses, setRescueMisses] = useState(0);
  const [guessOpen, setGuessOpen] = useState(false);
  const [guessSearch, setGuessSearch] = useState("");
  const [selectedGuess, setSelectedGuess] = useState<WhoAmISubject | null>(null);
  const [guessNotice, setGuessNotice] = useState<{ name: string; score: number } | null>(null);
  const [rejectedSubjectIds, setRejectedSubjectIds] = useState<Set<string>>(() => new Set());
  const [rejectedRescueSubjectIds, setRejectedRescueSubjectIds] = useState<Set<string>>(() => new Set());
  const [rescueChoices, setRescueChoices] = useState<readonly WhoAmISubject[]>([]);
  const [reviewCluesOpen, setReviewCluesOpen] = useState(false);
  const latestClueRef = useRef<HTMLElement | null>(null);
  const shouldScrollAfterReveal = useRef(false);
  const guessInputRef = useRef<HTMLInputElement | null>(null);

  const football = sport === "football";
  const finalGuessRequired = phase === "playing" && revealedCount >= WHO_AM_I_CLUE_LIMIT;
  const recoveryScore = whoAmIRecoveryScore(rescueMisses);
  const score = whoAmIScore(revealedCount, wrongGuesses);
  const nextRevealedCount = Math.min(WHO_AM_I_CLUE_LIMIT, revealedCount + WHO_AM_I_CLUES_PER_REVEAL);
  const nextRevealScore = whoAmIScore(nextRevealedCount, wrongGuesses);
  const revealedClues = round.clues.slice(0, revealedCount);
  const latestPairStart = Math.max(0, revealedCount - WHO_AM_I_CLUES_PER_REVEAL);
  const cluePairs = useMemo(() => (
    Array.from({ length: Math.ceil(round.clues.length / WHO_AM_I_CLUES_PER_REVEAL) }, (_value, pairIndex) => (
      round.clues.slice(
        pairIndex * WHO_AM_I_CLUES_PER_REVEAL,
        pairIndex * WHO_AM_I_CLUES_PER_REVEAL + WHO_AM_I_CLUES_PER_REVEAL,
      )
    ))
  ), [round.clues]);

  const guessMatches = useMemo(() => {
    const query = normalized(guessSearch);
    if (query.length < 2) return [];
    return round.subjects
      .filter((subject) => !rejectedSubjectIds.has(subject.id))
      .filter((subject) => normalized(subject.name).includes(query))
      .slice(0, 16);
  }, [guessSearch, rejectedSubjectIds, round.subjects]);

  useEffect(() => {
    if (phase !== "playing" || !shouldScrollAfterReveal.current) return;
    shouldScrollAfterReveal.current = false;
    latestClueRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  }, [phase, revealedCount]);

  useEffect(() => {
    if (phase !== "playing" || (!guessOpen && !finalGuessRequired)) return;
    guessInputRef.current?.focus({ preventScroll: true });
  }, [finalGuessRequired, guessOpen, phase]);

  function resetRound() {
    setRound(createRound());
    setPhase("start");
    setResultState("incorrect");
    setRevealedCount(WHO_AM_I_CLUES_PER_REVEAL);
    setWrongGuesses(0);
    setRescueMisses(0);
    setGuessOpen(false);
    setGuessSearch("");
    setSelectedGuess(null);
    setGuessNotice(null);
    setRejectedSubjectIds(new Set());
    setRejectedRescueSubjectIds(new Set());
    setRescueChoices([]);
    setReviewCluesOpen(false);
    shouldScrollAfterReveal.current = false;
  }

  function openGuess() {
    setGuessOpen(true);
    setGuessSearch("");
    setSelectedGuess(null);
    setGuessNotice(null);
  }

  function closeGuess() {
    if (finalGuessRequired) return;
    setGuessOpen(false);
    setGuessSearch("");
    setSelectedGuess(null);
  }

  function revealMore() {
    if (phase !== "playing" || finalGuessRequired) return;
    shouldScrollAfterReveal.current = true;
    setRevealedCount(nextRevealedCount);
    setGuessNotice(null);
    setGuessSearch("");
    setSelectedGuess(null);
    setGuessOpen(nextRevealedCount >= WHO_AM_I_CLUE_LIMIT);
  }

  function openRescue(excludedSubjectIds = rejectedSubjectIds) {
    setRescueChoices(whoAmIRescueChoices(round, Math.random, excludedSubjectIds));
    setRescueMisses(0);
    setRejectedRescueSubjectIds(new Set());
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

    const missedName = selectedGuess.name;
    const nextWrongGuesses = wrongGuesses + 1;
    const nextRejectedSubjectIds = new Set([...rejectedSubjectIds, selectedGuess.id]);
    const nextScore = whoAmIScore(revealedCount, nextWrongGuesses);
    setWrongGuesses(nextWrongGuesses);
    setRejectedSubjectIds(nextRejectedSubjectIds);

    if (finalGuessRequired) {
      openRescue(nextRejectedSubjectIds);
      return;
    }

    setGuessNotice({ name: missedName, score: nextScore });
    setGuessSearch("");
    setSelectedGuess(null);
    setGuessOpen(false);
  }

  function submitRescueGuess(subject: WhoAmISubject) {
    if (phase !== "rescue" || rejectedRescueSubjectIds.has(subject.id)) return;
    if (subject.id === round.hiddenSubject.id) {
      setResultState("rescued");
      setPhase("result");
      return;
    }

    const nextMisses = rescueMisses + 1;
    setRejectedRescueSubjectIds((current) => new Set([...current, subject.id]));
    if (nextMisses >= WHO_AM_I_RESCUE_GUESS_COUNT) {
      setRescueMisses(nextMisses);
      setResultState("incorrect");
      setPhase("result");
      return;
    }
    setRescueMisses(nextMisses);
  }

  function forfeitRound() {
    setResultState("forfeit");
    setPhase("result");
    setGuessOpen(false);
  }

  const finalScore = resultState === "correct"
    ? whoAmIScore(revealedCount, wrongGuesses)
    : resultState === "rescued"
      ? recoveryScore
      : 0;
  const resultLabel = resultState === "correct"
    ? "NATURAL SOLVE"
    : resultState === "rescued"
      ? "RECOVERED"
      : resultState === "forfeit"
        ? "FORFEIT"
        : "MISS";

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
              Two clues at a time. Guess when you know it, or reveal the next pair and play for fewer points.
              A wrong natural guess costs {WHO_AM_I_WRONG_GUESS_PENALTY}.
            </p>
            <div className="twenty-questions-rules" aria-label="Who Am I scoring rules">
              <span><strong>2</strong> clues per reveal</span>
              <span><strong>100</strong> max points</span>
              <span><strong>{WHO_AM_I_RESCUE_SCORE}→{WHO_AM_I_RESCUE_SECOND_SCORE}</strong> recovery</span>
            </div>
            {football ? <p className="twenty-questions-disclosure">{round.league} is locked before clue one.</p> : null}
            <button className="twenty-questions-primary" type="button" onClick={() => setPhase("playing")}>START ROUND</button>
          </section>
        ) : null}

        {phase === "playing" ? (
          <>
            <section className="twenty-questions-scorebar" aria-label="Round status">
              <div className="twenty-questions-scorebar__stat"><small>CLUES</small><strong>{revealedCount}</strong></div>
              <div className="twenty-questions-scorebar__stat"><small>MISSES</small><strong>{wrongGuesses}</strong></div>
              <div className="twenty-questions-scorebar__stat"><small>SOLVE</small><strong>{score}</strong></div>
              <div className={`twenty-questions-scorebar__actions${finalGuessRequired ? " is-final" : ""}`} aria-label="Round decisions">
                <button className="is-guess" type="button" onClick={openGuess}>
                  {finalGuessRequired ? `FINAL GUESS · ${score}` : `GUESS NOW · ${score}`}
                </button>
                {!finalGuessRequired ? (
                  <button className="is-reveal" type="button" onClick={revealMore}>
                    REVEAL 2 · {nextRevealScore}
                  </button>
                ) : null}
              </div>
            </section>

            {guessNotice ? (
              <p className="twenty-questions-wrong-guess" role="status">
                <strong>MISS · −{WHO_AM_I_WRONG_GUESS_PENALTY} PTS</strong>
                <span>{guessNotice.name} isn&apos;t the answer. Solve value now {guessNotice.score} pts.</span>
              </p>
            ) : null}

            <section className="twenty-questions-history" aria-labelledby="who-am-i-clues-title">
              <div className="twenty-questions-section-heading">
                <div>
                  <p className="eyebrow">CLUES {revealedCount} / {WHO_AM_I_CLUE_LIMIT}</p>
                  <h2 id="who-am-i-clues-title">What you know</h2>
                </div>
                {!finalGuessRequired ? <span>Guess {score} · Reveal → {nextRevealScore}</span> : <span>Last chance · {score} pts</span>}
              </div>
              <div className="twenty-questions-history-list who-am-i-clue-stack">
                {revealedClues.map((entry, index) => {
                  const latest = index >= latestPairStart;
                  return (
                    <article
                      key={entry.id}
                      className={latest ? "is-latest" : "is-previous"}
                      ref={index === latestPairStart ? latestClueRef : undefined}
                    >
                      <span aria-label={`Clue ${index + 1}`}>{index + 1}</span>
                      <div><strong>{entry.text}</strong></div>
                    </article>
                  );
                })}
              </div>
              {finalGuessRequired ? (
                <div className="twenty-questions-final-alert" role="note">
                  <strong>LAST CHANCE</strong>
                  <span>One natural guess for {score} pts. Miss and the five-name Recovery Board takes over.</span>
                </div>
              ) : null}
            </section>

            {guessOpen || finalGuessRequired ? (
              <section className={`twenty-questions-guess${finalGuessRequired ? " is-final" : ""}`} aria-label="Guess the answer">
                <div className="twenty-questions-section-heading">
                  <div>
                    <p className="eyebrow">{finalGuessRequired ? "LAST CHANCE · ONE NATURAL GUESS" : "GUESS NOW"}</p>
                    <h2>Who am I?</h2>
                  </div>
                  <span>{finalGuessRequired ? `${score} pts · miss → recovery` : `${score} pts · miss −${WHO_AM_I_WRONG_GUESS_PENALTY}`}</span>
                </div>
                <input
                  ref={guessInputRef}
                  value={guessSearch}
                  onChange={(event) => {
                    setGuessSearch(event.target.value);
                    setSelectedGuess(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.preventDefault();
                  }}
                  placeholder={football ? `Search ${round.league} names…` : "Search UFC fighters…"}
                  aria-label="Search identities"
                  autoComplete="off"
                  enterKeyHint="search"
                />
                {!selectedGuess && guessMatches.length ? (
                  <div className="twenty-questions-guess-list">
                    {guessMatches.map((subject) => (
                      <button
                        type="button"
                        key={subject.id}
                        onClick={() => {
                          setSelectedGuess(subject);
                          setGuessSearch(subject.name);
                        }}
                      >
                        <strong>{subject.name}</strong>
                        <small>{subject.kind === "coach" ? "Head coach" : subject.kind === "fighter" ? "Fighter" : "Player"}</small>
                      </button>
                    ))}
                  </div>
                ) : null}
                {selectedGuess ? (
                  <div className="twenty-questions-selected-guess" aria-label="Selected guess">
                    <div>
                      <small>YOUR PICK</small>
                      <strong>{selectedGuess.name}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuess(null);
                        guessInputRef.current?.focus();
                      }}
                    >
                      CHANGE
                    </button>
                  </div>
                ) : null}
                {selectedGuess ? (
                  <button className="twenty-questions-primary" type="button" onClick={submitGuess}>
                    SUBMIT {selectedGuess.name.toUpperCase()} · {score} PTS
                  </button>
                ) : null}
                {!finalGuessRequired ? (
                  <button className="twenty-questions-more" type="button" onClick={closeGuess}>BACK TO CLUES</button>
                ) : null}
                <button className="twenty-questions-more is-danger" type="button" onClick={forfeitRound}>
                  REVEAL ANSWER · 0 PTS
                </button>
              </section>
            ) : null}
          </>
        ) : null}

        {phase === "rescue" ? (
          <section className={`twenty-questions-guess is-final is-recovery${rescueMisses ? " has-miss" : ""}`} aria-label="Who Am I rescue choice">
            <div className="twenty-questions-recovery-heading">
              <div>
                <p className="eyebrow">RECOVERY BOARD · PICK {Math.min(rescueMisses + 1, WHO_AM_I_RESCUE_GUESS_COUNT)} OF {WHO_AM_I_RESCUE_GUESS_COUNT}</p>
                <h2>{rescueMisses === 0 ? "Five names. Two picks." : "One pick left."}</h2>
              </div>
              <div className="twenty-questions-recovery-value">
                <strong>{recoveryScore}</strong>
                <small>PTS</small>
              </div>
            </div>
            <p className="twenty-questions-final-guess-copy">
              {rescueMisses === 0
                ? `Find the answer for ${WHO_AM_I_RESCUE_SCORE}. Miss once and the last pick drops to ${WHO_AM_I_RESCUE_SECOND_SCORE}.`
                : `Final pick. Find the answer for ${WHO_AM_I_RESCUE_SECOND_SCORE} points.`}
            </p>
            {rescueMisses === 1 ? <p className="twenty-questions-recovery-shift" role="status">MISS · 30 PTS LEFT</p> : null}
            <div className="twenty-questions-guess-list twenty-questions-recovery-list">
              {rescueChoices.map((subject) => {
                const rejected = rejectedRescueSubjectIds.has(subject.id);
                return (
                  <button
                    type="button"
                    key={subject.id}
                    className={rejected ? "is-rejected" : ""}
                    disabled={rejected}
                    onClick={() => submitRescueGuess(subject)}
                  >
                    <strong>{subject.name}</strong>
                    <small>{rejected ? "Eliminated" : subject.kind === "coach" ? "Head coach" : subject.kind === "fighter" ? "Fighter" : "Player"}</small>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {phase === "result" ? (
          <section className={`twenty-questions-result is-${resultState}`}>
            <p className="eyebrow">{resultLabel}</p>
            <h2>{round.hiddenSubject.name}</h2>
            <p>{resultState === "correct"
              ? `You solved it naturally with ${revealedCount} clues.`
              : resultState === "rescued"
                ? "You saved the round on the Recovery Board."
                : resultState === "forfeit"
                  ? "Answer revealed."
                  : "Both recovery picks missed."}</p>
            <div className="twenty-questions-result__score-block">
              <div className="twenty-questions-result__score">{finalScore}</div>
              <small>FINAL SCORE</small>
            </div>
            <div className="twenty-questions-result__stats">
              <span><strong>{revealedCount}</strong> clues used</span>
              <span><strong>{wrongGuesses}</strong> natural misses</span>
              <span><strong>{resultLabel}</strong> outcome</span>
              <span><strong>{round.league}</strong> league</span>
            </div>
            <button className="twenty-questions-more" type="button" onClick={() => setReviewCluesOpen((open) => !open)}>
              {reviewCluesOpen ? "HIDE CLUES" : "REVIEW ALL CLUES"}
            </button>
            {reviewCluesOpen ? (
              <div className="twenty-questions-result__clues" aria-label="Round clues">
                <div className="twenty-questions-review-grid">
                  {cluePairs.map((pair, pairIndex) => (
                    <section key={`pair-${pairIndex + 1}`} className="twenty-questions-review-pair">
                      <small>CLUES {pairIndex * WHO_AM_I_CLUES_PER_REVEAL + 1}–{pairIndex * WHO_AM_I_CLUES_PER_REVEAL + pair.length}</small>
                      {pair.map((entry, clueIndex) => (
                        <div key={entry.id}>
                          <span>{pairIndex * WHO_AM_I_CLUES_PER_REVEAL + clueIndex + 1}</span>
                          <strong>{entry.text}</strong>
                        </div>
                      ))}
                    </section>
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
