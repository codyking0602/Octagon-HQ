import { useEffect, useMemo, useRef } from "react";
import { GameResultActions } from "./GameResultActions";
import {
  WHO_AM_I_CLUE_LIMIT,
  WHO_AM_I_CLUES_PER_REVEAL,
  WHO_AM_I_RESCUE_GUESS_COUNT,
  WHO_AM_I_RESCUE_SCORE,
  WHO_AM_I_RESCUE_SECOND_SCORE,
  WHO_AM_I_WRONG_GUESS_PENALTY,
  type WhoAmISport,
  type WhoAmISubject,
} from "../games/whoAmIEngine";

export type WhoAmIPresentationPhase = "start" | "playing" | "rescue" | "result";
export type WhoAmIPresentationResultState = "correct" | "rescued" | "incorrect";

export interface WhoAmIPresentationClue {
  id: string;
  text: string;
}

export interface WhoAmIPresentationNotice {
  name: string;
  score: number;
}

export interface WhoAmIPresentationProps {
  sport: WhoAmISport;
  league: string;
  phase: WhoAmIPresentationPhase;
  revealedCount: number;
  wrongGuesses: number;
  rescueMisses: number;
  score: number;
  nextRevealScore: number;
  recoveryScore: number;
  clues: readonly WhoAmIPresentationClue[];
  allClues: readonly WhoAmIPresentationClue[];
  guessOpen: boolean;
  guessSearch: string;
  selectedGuess: WhoAmISubject | null;
  guessMatches: readonly WhoAmISubject[];
  guessNotice: WhoAmIPresentationNotice | null;
  rescueChoices: readonly WhoAmISubject[];
  rejectedRescueSubjectIds: ReadonlySet<string>;
  reviewOpen: boolean;
  resultState: WhoAmIPresentationResultState;
  resultLabel: string;
  resultName: string;
  finalScore: number;
  finalScoreLabel?: string;
  busy?: boolean;
  daily?: boolean;
  dailyContext?: string;
  challengeFrom?: string;
  challengeStatus?: string;
  onChallenge?: () => void;
  onAllGames?: () => void;
  onStart?: () => void;
  onOpenGuess: () => void;
  onRevealMore: () => void;
  onGuessSearchChange: (value: string) => void;
  onSelectGuess: (subject: WhoAmISubject) => void;
  onChangeGuess: () => void;
  onSubmitGuess: () => void;
  onCloseGuess: () => void;
  onEnterRecovery: () => void;
  onRecoveryGuess: (subject: WhoAmISubject) => void;
  onToggleReview: () => void;
  onReplay?: () => void;
}

function subjectRole(subject: WhoAmISubject) {
  if (subject.kind === "coach") return "Head coach";
  if (subject.kind === "fighter") return "Fighter";
  return "Player";
}

export default function WhoAmIPresentation({
  sport,
  league,
  phase,
  revealedCount,
  wrongGuesses,
  rescueMisses,
  score,
  nextRevealScore,
  recoveryScore,
  clues,
  allClues,
  guessOpen,
  guessSearch,
  selectedGuess,
  guessMatches,
  guessNotice,
  rescueChoices,
  rejectedRescueSubjectIds,
  reviewOpen,
  resultState,
  resultLabel,
  resultName,
  finalScore,
  finalScoreLabel,
  busy = false,
  daily = false,
  dailyContext,
  challengeFrom,
  challengeStatus = "",
  onChallenge,
  onAllGames,
  onStart,
  onOpenGuess,
  onRevealMore,
  onGuessSearchChange,
  onSelectGuess,
  onChangeGuess,
  onSubmitGuess,
  onCloseGuess,
  onEnterRecovery,
  onRecoveryGuess,
  onToggleReview,
  onReplay,
}: WhoAmIPresentationProps) {
  const football = sport === "football";
  const finalGuessRequired = phase === "playing" && revealedCount >= WHO_AM_I_CLUE_LIMIT;
  const latestPairStart = Math.max(0, revealedCount - WHO_AM_I_CLUES_PER_REVEAL);
  const cluePairs = useMemo(() => (
    Array.from({ length: Math.ceil(allClues.length / WHO_AM_I_CLUES_PER_REVEAL) }, (_value, pairIndex) => (
      allClues.slice(
        pairIndex * WHO_AM_I_CLUES_PER_REVEAL,
        pairIndex * WHO_AM_I_CLUES_PER_REVEAL + WHO_AM_I_CLUES_PER_REVEAL,
      )
    ))
  ), [allClues]);
  const latestClueRef = useRef<HTMLElement | null>(null);
  const guessInputRef = useRef<HTMLInputElement | null>(null);
  const previousRevealedCount = useRef(revealedCount);

  useEffect(() => {
    const previous = previousRevealedCount.current;
    previousRevealedCount.current = revealedCount;
    if (phase !== "playing" || revealedCount <= previous) return;
    latestClueRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  }, [phase, revealedCount]);

  useEffect(() => {
    if (phase !== "playing" || (!guessOpen && !finalGuessRequired) || selectedGuess) return;
    guessInputRef.current?.focus({ preventScroll: true });
  }, [finalGuessRequired, guessOpen, phase, selectedGuess]);

  return (
    <main className="page twenty-questions-page who-am-i-page" data-sport={sport} data-daily={daily ? "true" : undefined}>
      {challengeFrom ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{challengeFrom} sent this exact Who Am I board.</strong>
          <small>Play the same hidden identity and clue progression. Both scores reveal after you finish.</small>
        </section>
      ) : null}
      <section className="twenty-questions-shell">
        <header className="twenty-questions-header">
          <div>
            <p className="eyebrow">{daily ? `TODAY’S CHALLENGE · ${football ? "FOOTBALL" : "UFC"}` : football ? "FOOTBALL GAMES" : "UFC GAMES"}</p>
            <h1>Who Am I?</h1>
            {dailyContext ? <span className="twenty-questions-daily-context">{dailyContext}</span> : null}
          </div>
          {phase !== "start" ? <span className="twenty-questions-league-pill">{league}</span> : null}
        </header>

        {phase === "start" ? (
          <section className="twenty-questions-start">
            <div className="twenty-questions-start__mark">?</div>
            <p className="twenty-questions-start__league">{league} ROUND</p>
            <h2>How early can you recognize the hidden {football ? "player or head coach" : "fighter"}?</h2>
            <p>
              Two clues at a time. Guess when you know it. Every reveal lowers the score, and a wrong guess costs{" "}
              {WHO_AM_I_WRONG_GUESS_PENALTY} points.
            </p>
            <div className="twenty-questions-rules" aria-label="Who Am I scoring rules">
              <span><strong>{WHO_AM_I_CLUES_PER_REVEAL}</strong> clues per reveal</span>
              <span><strong>{WHO_AM_I_CLUE_LIMIT}</strong> total clues</span>
              <span><strong>100</strong> max points</span>
            </div>
            {football ? <p className="twenty-questions-disclosure">{league} is locked before clue one.</p> : null}
            <button className="twenty-questions-primary" type="button" onClick={onStart}>START ROUND</button>
          </section>
        ) : null}

        {phase === "playing" ? (
          <>
            <section className="twenty-questions-scorebar" aria-label="Round status">
              <div className="twenty-questions-scorebar__stat"><small>CLUES</small><strong>{revealedCount}</strong></div>
              <div className="twenty-questions-scorebar__stat"><small>MISSES</small><strong>{wrongGuesses}</strong></div>
              <div className="twenty-questions-scorebar__stat"><small>SOLVE</small><strong>{score}</strong></div>
              <div className={`twenty-questions-scorebar__actions${finalGuessRequired ? " is-final" : ""}`} aria-label="Round decisions">
                <button className="is-guess" type="button" disabled={busy} onClick={onOpenGuess}>
                  {finalGuessRequired ? `FINAL GUESS · ${score} PTS` : `GUESS NOW · ${score} PTS`}
                </button>
                {!finalGuessRequired ? (
                  <button className="is-reveal" type="button" disabled={busy} onClick={onRevealMore}>
                    REVEAL 2 · {nextRevealScore} PTS
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
                <span>PAIR {Math.ceil(revealedCount / WHO_AM_I_CLUES_PER_REVEAL)} OF {Math.ceil(WHO_AM_I_CLUE_LIMIT / WHO_AM_I_CLUES_PER_REVEAL)}</span>
              </div>
              <div className="twenty-questions-history-list who-am-i-clue-stack">
                {clues.map((entry, index) => {
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
                  <span>
                    One final open guess for {score} points. Miss or skip it, and you&apos;ll move to the Recovery Board
                    at {WHO_AM_I_RESCUE_SCORE} points.
                  </span>
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
                  <span>{finalGuessRequired
                    ? `${score} PTS · MISS → ${WHO_AM_I_RESCUE_SCORE} PTS`
                    : `${score} PTS · MISS −${WHO_AM_I_WRONG_GUESS_PENALTY}`}</span>
                </div>
                <input
                  ref={guessInputRef}
                  value={guessSearch}
                  onChange={(event) => onGuessSearchChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.preventDefault();
                  }}
                  placeholder={football ? `Search ${league} names…` : "Search UFC fighters…"}
                  aria-label="Search identities"
                  autoComplete="off"
                  enterKeyHint="search"
                />
                {!selectedGuess && guessMatches.length ? (
                  <div className="twenty-questions-guess-list">
                    {guessMatches.map((subject) => (
                      <button type="button" key={subject.id} onClick={() => onSelectGuess(subject)}>
                        <strong>{subject.name}</strong>
                        <small>{subjectRole(subject)}</small>
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
                    <button type="button" onClick={onChangeGuess}>CHANGE</button>
                  </div>
                ) : null}
                {selectedGuess ? (
                  <button className="twenty-questions-primary" type="button" disabled={busy} onClick={onSubmitGuess}>
                    SUBMIT {selectedGuess.name.toUpperCase()} · {score} PTS
                  </button>
                ) : null}
                {!finalGuessRequired ? (
                  <button className="twenty-questions-more" type="button" onClick={onCloseGuess}>BACK TO CLUES</button>
                ) : null}
                {finalGuessRequired ? (
                  <button className="twenty-questions-more is-danger" type="button" disabled={busy} onClick={onEnterRecovery}>
                    SKIP TO RECOVERY · {WHO_AM_I_RESCUE_SCORE} PTS
                  </button>
                ) : null}
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
                    disabled={busy || rejected}
                    onClick={() => onRecoveryGuess(subject)}
                  >
                    <strong>{subject.name}</strong>
                    <small>{rejected ? "Eliminated" : subjectRole(subject)}</small>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {phase === "result" ? (
          <section className={`twenty-questions-result is-${resultState}`}>
            <p className="eyebrow">{resultLabel}</p>
            <h2>{resultName}</h2>
            <p>{resultState === "correct"
              ? `You solved it naturally with ${revealedCount} clues.`
              : resultState === "rescued"
                ? "You saved the round on the Recovery Board."
                : "Both recovery picks missed."}</p>
            <div className="twenty-questions-result__score-block">
              <div className="twenty-questions-result__score">{finalScore}</div>
              <small>{finalScoreLabel ?? (daily ? "OFFICIAL SCORE" : "FINAL SCORE")}</small>
            </div>
            <div className="twenty-questions-result__stats">
              <span><strong>{revealedCount}</strong> clues used</span>
              <span><strong>{wrongGuesses}</strong> natural misses</span>
              <span><strong>{resultLabel}</strong> outcome</span>
              <span><strong>{league}</strong> league</span>
            </div>
            <button className="twenty-questions-more" type="button" onClick={onToggleReview}>
              {reviewOpen ? "HIDE CLUES" : "REVIEW ALL CLUES"}
            </button>
            {reviewOpen ? (
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
            {!daily && onChallenge && onReplay && onAllGames ? (
              <GameResultActions
                onChallenge={onChallenge}
                onReplay={onReplay}
                onAllGames={onAllGames}
                status={challengeStatus}
              />
            ) : onReplay ? (
              <button className="twenty-questions-primary" type="button" onClick={onReplay}>PLAY AGAIN</button>
            ) : null}
          </section>
        ) : null}
      </section>
    </main>
  );
}
