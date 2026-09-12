import { useMemo, useState } from "react";
import {
  WHO_AM_I_CLUE_LIMIT,
  WHO_AM_I_CLUES_PER_REVEAL,
  WHO_AM_I_RESCUE_GUESS_COUNT,
  WHO_AM_I_RESCUE_SCORE,
  WHO_AM_I_RESCUE_SECOND_SCORE,
  WHO_AM_I_WRONG_GUESS_PENALTY,
  whoAmIRecoveryScore,
  whoAmIScore,
  type WhoAmISubject,
} from "../games/whoAmIEngine";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((row): row is string => typeof row === "string") : [];
}

function subject(value: unknown): WhoAmISubject | null {
  const row = record(value);
  const kind = String(row.kind ?? "");
  if (typeof row.id !== "string" || typeof row.name !== "string" || !["fighter", "player", "coach"].includes(kind)) return null;
  return { id: row.id, name: row.name, kind: kind as WhoAmISubject["kind"] };
}

function normalized(value: string) {
  return value.trim().toLowerCase();
}

export function OfficialWhoAmIDailyView({
  projection,
  busy,
  onAdvance,
}: {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: JsonRecord) => void;
}) {
  const setup = projection.publicSetup;
  const state = projection.publicState;
  const sport = setup.sport === "football" ? "football" : "ufc";
  const football = sport === "football";
  const league = String(setup.league ?? state.league ?? (football ? "FOOTBALL" : "UFC"));
  const phase = String(state.phase ?? "playing");
  const revealedCount = Number(state.revealed_count ?? WHO_AM_I_CLUES_PER_REVEAL);
  const wrongGuesses = Number(state.wrong_guesses ?? 0);
  const rescueMisses = Number(state.recovery_wrong_guesses ?? 0);
  const rejected = new Set(strings(state.rejected_subject_ids));
  const rescueRejected = new Set(strings(state.recovery_rejected_subject_ids));
  const clues = records(state.clues);
  const subjects = records(setup.subjects).map(subject).filter(Boolean) as WhoAmISubject[];
  const rescueChoices = records(state.recovery_choices).map(subject).filter(Boolean) as WhoAmISubject[];
  const [guessSearch, setGuessSearch] = useState("");
  const [selectedGuess, setSelectedGuess] = useState<WhoAmISubject | null>(null);
  const [guessOpen, setGuessOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const attempt = projection.officialAttempt;
  const result = attempt?.publicResult ?? {};
  const reveal = record(projection.revealSetup);
  const identity = subject(reveal.identity);
  const finalGuessRequired = !attempt && phase === "playing" && revealedCount >= WHO_AM_I_CLUE_LIMIT;
  const currentScore = whoAmIScore(revealedCount, wrongGuesses);
  const nextCount = Math.min(WHO_AM_I_CLUE_LIMIT, revealedCount + WHO_AM_I_CLUES_PER_REVEAL);
  const nextScore = whoAmIScore(nextCount, wrongGuesses);
  const recoveryScore = whoAmIRecoveryScore(rescueMisses);

  const guessMatches = useMemo(() => {
    const query = normalized(guessSearch);
    if (query.length < 2) return [];
    return subjects
      .filter((candidate) => !rejected.has(candidate.id))
      .filter((candidate) => normalized(candidate.name).includes(query))
      .slice(0, 16);
  }, [guessSearch, subjects, state.rejected_subject_ids]);

  function submitNatural() {
    if (!selectedGuess || busy) return;
    onAdvance({ type: "guess", subject_id: selectedGuess.id });
    setSelectedGuess(null);
    setGuessSearch("");
    setGuessOpen(false);
  }

  const resultOutcome = String(result.outcome ?? state.outcome ?? "");
  const resultLabel = resultOutcome === "natural" ? "NATURAL SOLVE" : resultOutcome === "recovered" ? "RECOVERED" : "MISS";
  const revealClues = records(reveal.clues);

  return (
    <section className="twenty-questions-shell who-am-i-page" data-sport={sport} data-daily="true">
      <header className="twenty-questions-header">
        <div><p className="eyebrow">TODAY’S CHALLENGE · {football ? "FOOTBALL" : "UFC"}</p><h1>Who Am I?</h1></div>
        <span className="twenty-questions-league-pill">{league}</span>
      </header>

      {attempt ? (
        <section className={`twenty-questions-result is-${resultOutcome === "natural" ? "correct" : resultOutcome === "recovered" ? "rescued" : "incorrect"}`}>
          <p className="eyebrow">{resultLabel}</p>
          <h2>{identity?.name ?? "Identity revealed"}</h2>
          <p>{resultOutcome === "natural"
            ? `You solved it naturally with ${Number(result.revealed_count ?? revealedCount)} clues.`
            : resultOutcome === "recovered"
              ? "You saved the round on the Recovery Board."
              : "Both recovery picks missed."}</p>
          <div className="twenty-questions-result__score-block">
            <div className="twenty-questions-result__score">{attempt.normalizedScore}</div>
            <small>OFFICIAL SCORE</small>
          </div>
          <div className="twenty-questions-result__stats">
            <span><strong>{Number(result.revealed_count ?? revealedCount)}</strong> clues used</span>
            <span><strong>{Number(result.wrong_guesses ?? wrongGuesses)}</strong> natural misses</span>
            <span><strong>{resultLabel}</strong> outcome</span>
            <span><strong>{league}</strong> league</span>
          </div>
          <button className="twenty-questions-more" type="button" onClick={() => setReviewOpen((open) => !open)}>
            {reviewOpen ? "HIDE CLUES" : "REVIEW ALL CLUES"}
          </button>
          {reviewOpen ? (
            <div className="twenty-questions-result__clues" aria-label="Round clues">
              <div className="twenty-questions-review-grid">
                {Array.from({ length: Math.ceil(revealClues.length / WHO_AM_I_CLUES_PER_REVEAL) }, (_value, pairIndex) => {
                  const pair = revealClues.slice(pairIndex * WHO_AM_I_CLUES_PER_REVEAL, pairIndex * WHO_AM_I_CLUES_PER_REVEAL + WHO_AM_I_CLUES_PER_REVEAL);
                  return (
                    <section key={`pair-${pairIndex + 1}`} className="twenty-questions-review-pair">
                      <small>CLUES {pairIndex * 2 + 1}–{pairIndex * 2 + pair.length}</small>
                      {pair.map((entry, clueIndex) => (
                        <div key={String(entry.id ?? clueIndex)}>
                          <span>{pairIndex * 2 + clueIndex + 1}</span>
                          <strong>{String(entry.text ?? "")}</strong>
                        </div>
                      ))}
                    </section>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>
      ) : phase === "recovery" ? (
        <section className={`twenty-questions-guess is-final is-recovery${rescueMisses ? " has-miss" : ""}`} aria-label="Who Am I Recovery Board">
          <div className="twenty-questions-recovery-heading">
            <div>
              <p className="eyebrow">RECOVERY BOARD · PICK {Math.min(rescueMisses + 1, WHO_AM_I_RESCUE_GUESS_COUNT)} OF {WHO_AM_I_RESCUE_GUESS_COUNT}</p>
              <h2>{rescueMisses === 0 ? "Five names. Two picks." : "One pick left."}</h2>
            </div>
            <div className="twenty-questions-recovery-value"><strong>{recoveryScore}</strong><small>PTS</small></div>
          </div>
          <p className="twenty-questions-final-guess-copy">
            {rescueMisses === 0
              ? `Find the answer for ${WHO_AM_I_RESCUE_SCORE}. Miss once and the last pick drops to ${WHO_AM_I_RESCUE_SECOND_SCORE}.`
              : `Final pick. Find the answer for ${WHO_AM_I_RESCUE_SECOND_SCORE} points.`}
          </p>
          <div className="twenty-questions-guess-list twenty-questions-recovery-list">
            {rescueChoices.map((candidate) => {
              const isRejected = rescueRejected.has(candidate.id);
              return (
                <button
                  type="button"
                  key={candidate.id}
                  className={isRejected ? "is-rejected" : ""}
                  disabled={busy || isRejected}
                  onClick={() => onAdvance({ type: "recovery_guess", subject_id: candidate.id })}
                >
                  <strong>{candidate.name}</strong>
                  <small>{isRejected ? "Eliminated" : candidate.kind === "coach" ? "Head coach" : candidate.kind === "fighter" ? "Fighter" : "Player"}</small>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <>
          <section className="twenty-questions-scorebar" aria-label="Round status">
            <div className="twenty-questions-scorebar__stat"><small>CLUES</small><strong>{revealedCount}</strong></div>
            <div className="twenty-questions-scorebar__stat"><small>MISSES</small><strong>{wrongGuesses}</strong></div>
            <div className="twenty-questions-scorebar__stat"><small>SOLVE</small><strong>{currentScore}</strong></div>
            <div className={`twenty-questions-scorebar__actions${finalGuessRequired ? " is-final" : ""}`}>
              <button className="is-guess" type="button" disabled={busy} onClick={() => setGuessOpen(true)}>
                {finalGuessRequired ? `FINAL GUESS · ${currentScore} PTS` : `GUESS NOW · ${currentScore} PTS`}
              </button>
              {!finalGuessRequired ? (
                <button className="is-reveal" type="button" disabled={busy} onClick={() => onAdvance({ type: "reveal" })}>
                  REVEAL 2 · {nextScore} PTS
                </button>
              ) : null}
            </div>
          </section>

          <section className="twenty-questions-history" aria-labelledby="daily-who-am-i-clues">
            <div className="twenty-questions-section-heading">
              <div><p className="eyebrow">CLUES {revealedCount} / {WHO_AM_I_CLUE_LIMIT}</p><h2 id="daily-who-am-i-clues">What you know</h2></div>
              <span>PAIR {Math.ceil(revealedCount / 2)} OF {Math.ceil(WHO_AM_I_CLUE_LIMIT / 2)}</span>
            </div>
            <div className="twenty-questions-history-list who-am-i-clue-stack">
              {clues.map((entry, index) => (
                <article key={String(entry.id ?? index)} className={index >= clues.length - 2 ? "is-latest" : "is-previous"}>
                  <span>{index + 1}</span><div><strong>{String(entry.text ?? "")}</strong></div>
                </article>
              ))}
            </div>
            {finalGuessRequired ? (
              <div className="twenty-questions-final-alert">
                <strong>LAST CHANCE</strong>
                <span>One final open guess for {currentScore} points. Miss or skip it, and you’ll move to the Recovery Board at {WHO_AM_I_RESCUE_SCORE} points.</span>
              </div>
            ) : null}
          </section>

          {guessOpen || finalGuessRequired ? (
            <section className={`twenty-questions-guess${finalGuessRequired ? " is-final" : ""}`} aria-label="Guess the answer">
              <div className="twenty-questions-section-heading">
                <div><p className="eyebrow">{finalGuessRequired ? "LAST CHANCE · ONE NATURAL GUESS" : "GUESS NOW"}</p><h2>Who am I?</h2></div>
                <span>{finalGuessRequired ? `${currentScore} PTS · MISS → ${WHO_AM_I_RESCUE_SCORE} PTS` : `${currentScore} PTS · MISS −${WHO_AM_I_WRONG_GUESS_PENALTY}`}</span>
              </div>
              <input
                value={guessSearch}
                onChange={(event) => { setGuessSearch(event.target.value); setSelectedGuess(null); }}
                placeholder={football ? `Search ${league} names…` : "Search UFC fighters…"}
                aria-label="Search identities"
                autoComplete="off"
              />
              {!selectedGuess && guessMatches.length ? (
                <div className="twenty-questions-guess-list">
                  {guessMatches.map((candidate) => (
                    <button type="button" key={candidate.id} onClick={() => { setSelectedGuess(candidate); setGuessSearch(candidate.name); }}>
                      <strong>{candidate.name}</strong>
                      <small>{candidate.kind === "coach" ? "Head coach" : candidate.kind === "fighter" ? "Fighter" : "Player"}</small>
                    </button>
                  ))}
                </div>
              ) : null}
              {selectedGuess ? (
                <div className="twenty-questions-selected-guess">
                  <div><small>YOUR PICK</small><strong>{selectedGuess.name}</strong></div>
                  <button type="button" onClick={() => { setSelectedGuess(null); setGuessSearch(""); }}>CHANGE</button>
                </div>
              ) : null}
              {selectedGuess ? <button className="twenty-questions-primary" type="button" disabled={busy} onClick={submitNatural}>SUBMIT {selectedGuess.name.toUpperCase()} · {currentScore} PTS</button> : null}
              {!finalGuessRequired ? <button className="twenty-questions-more" type="button" onClick={() => setGuessOpen(false)}>BACK TO CLUES</button> : null}
              {finalGuessRequired ? (
                <button className="twenty-questions-more is-danger" type="button" disabled={busy} onClick={() => onAdvance({ type: "enter_recovery" })}>
                  SKIP TO RECOVERY · {WHO_AM_I_RESCUE_SCORE} PTS
                </button>
              ) : null}
            </section>
          ) : null}
        </>
      )}
    </section>
  );
}
