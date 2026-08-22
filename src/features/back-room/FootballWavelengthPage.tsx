import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { recordLineupCompletion } from "../play/lineupModel";
import {
  clampWavelength,
  wavelengthDistanceCopy,
  wavelengthScore,
} from "../play/wavelengthEngine";
import {
  createFootballWavelengthRun,
  nextFootballWavelengthClue,
  type FootballWavelengthRound,
  type FootballWavelengthRun,
} from "./footballWavelengthModel";

export default function FootballWavelengthPage() {
  const navigate = useNavigate();
  const [run, setRun] = useState<FootballWavelengthRun>(() => createFootballWavelengthRun());
  const [round, setRound] = useState<FootballWavelengthRound>(run.initialRound);
  const [clueIndex, setClueIndex] = useState(0);
  const [guess, setGuess] = useState(50);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);
  const clue = round.clues[clueIndex]!;

  function reset(nextRun: FootballWavelengthRun) {
    setRun(nextRun);
    setRound(nextRun.initialRound);
    setClueIndex(0);
    setGuess(50);
    setGuesses([]);
    setComplete(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    reset(createFootballWavelengthRun());
  }

  function lockGuess() {
    if (complete) return;
    const locked = clampWavelength(guess);
    const nextGuesses = [...guesses, locked];
    setGuesses(nextGuesses);

    if (clueIndex === 3) {
      const score = wavelengthScore(locked, round.target);
      recordLineupCompletion(run.identity, {
        score,
        target: round.target,
        guesses: nextGuesses,
        clueIds: round.clues.map((item) => item.id),
      });
      setComplete(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const nextClue = nextFootballWavelengthClue(
      round,
      locked,
      clueIndex + 1,
      run.seed,
      guesses,
    );
    setRound((current) => ({ ...current, clues: [...current.clues, nextClue] }));
    setClueIndex((index) => index + 1);
  }

  if (complete) {
    const finalGuess = guesses[3]!;
    const distance = Math.abs(finalGuess - round.target);
    const score = wavelengthScore(finalGuess, round.target);

    return (
      <div className="page football-debate-page football-wavelength-page">
        <section className="football-debate-result-hero">
          <p className="eyebrow">FOOTBALL WAVELENGTH · FINAL SCORE</p>
          <strong>{score}<small>/100</small></strong>
          <span>{wavelengthDistanceCopy(distance)}</span>
        </section>

        <section className="football-wavelength-final-numbers">
          <div><small>HIDDEN NUMBER</small><strong>{round.target}</strong></div>
          <div><small>FINAL GUESS</small><strong>{finalGuess}</strong></div>
          <div><small>YOUR PATH</small><strong>{guesses.join(" → ")}</strong></div>
        </section>

        <section className="football-wavelength-reveal">
          <header>
            <p className="eyebrow">CLUE REVEAL</p>
            <h2>How the scale moved.</h2>
          </header>
          <div>
            {round.clues.map((item, index) => (
              <article key={item.id}>
                <b>{index + 1}</b>
                <span>
                  <small>{item.category}</small>
                  <strong>{item.text}</strong>
                </span>
                <em>{item.rating}</em>
              </article>
            ))}
          </div>
        </section>

        <div className="football-debate-actions">
          <button className="is-primary" type="button" onClick={startNew}>NEW WAVELENGTH</button>
          <button type="button" onClick={() => navigate("/back-room/football")}>ALL FOOTBALL GAMES</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page football-debate-page football-wavelength-page">
      <section className="football-wavelength-topline">
        <span>REPLAYABLE GAME</span>
        <b>CLUE {clueIndex + 1} OF 4</b>
      </section>

      <div className="football-wavelength-progress" aria-label="Football Wavelength clue progress">
        {[0, 1, 2, 3].map((index) => (
          <i className={`${index < clueIndex ? "is-complete" : ""}${index === clueIndex ? " is-current" : ""}`} key={index} />
        ))}
      </div>

      <section className="football-wavelength-clue" aria-live="polite">
        <div className="football-wavelength-clue__head">
          <span>{clue.category}</span>
          <b>CLUE {clueIndex + 1}</b>
        </div>
        <h1>{clue.text}</h1>
        <p>Where does it land on the Back Room’s 1–100 football scale?</p>
      </section>

      <section className="football-wavelength-guess-panel">
        <div className="football-wavelength-guess-value">
          <small>{clueIndex === 3 ? "FINAL ANSWER" : "YOUR GUESS"}</small>
          <strong>{guess}</strong>
        </div>
        <input
          aria-label="Football Wavelength guess from 1 to 100"
          type="range"
          min="1"
          max="100"
          step="1"
          value={guess}
          onChange={(event) => setGuess(clampWavelength(Number(event.target.value)))}
        />
        <div className="football-wavelength-scale"><span>1 · LOW</span><span>50 · MIDDLE</span><span>100 · HIGH</span></div>
        <button type="button" onClick={lockGuess}>
          {clueIndex === 3 ? "LOCK FINAL GUESS" : "LOCK GUESS & REVEAL NEXT CLUE"}
        </button>
      </section>

      <div className="football-wavelength-path">
        <small>YOUR PATH</small>
        <strong>{[0, 1, 2, 3].map((index) => guesses[index] ?? "—").join(" → ")}</strong>
      </div>
      <p className="football-wavelength-rules">Each clue reacts to your last guess. Only the fourth guess determines your score.</p>
    </div>
  );
}
