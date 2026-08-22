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
  getFootballWavelengthAxis,
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
  const axis = getFootballWavelengthAxis(clue.axisId);

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
            <h2>How the room moved you.</h2>
          </header>
          <div>
            {round.clues.map((item, index) => {
              const revealAxis = getFootballWavelengthAxis(item.axisId);
              return (
                <article key={item.id}>
                  <b>{index + 1}</b>
                  <span>
                    <small>{revealAxis.left} ↔ {revealAxis.right}</small>
                    <strong>{item.text}</strong>
                  </span>
                  <em>{item.rating}</em>
                </article>
              );
            })}
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
      <section className="football-debate-intro">
        <div>
          <p className="eyebrow">THE BACK ROOM · FOOTBALL WAVELENGTH</p>
          <h1>Find the hidden number.</h1>
          <p>Four football arguments. One hidden spot from 1–100. Every clue reacts to your last guess.</p>
        </div>
        <div className="football-debate-category">
          <small>CLUE PROGRESS</small>
          <strong>{clueIndex + 1} OF 4</strong>
          <button type="button" onClick={startNew}>NEW WAVELENGTH</button>
        </div>
      </section>

      <div className="football-wavelength-progress" aria-label="Football Wavelength clue progress">
        {[0, 1, 2, 3].map((index) => (
          <i className={`${index < clueIndex ? "is-complete" : ""}${index === clueIndex ? " is-current" : ""}`} key={index} />
        ))}
      </div>

      <section className="football-wavelength-clue" aria-live="polite">
        <div className="football-wavelength-axis-head">
          <span>{axis.name}</span>
          <b>CLUE {clueIndex + 1}</b>
        </div>
        <div className="football-wavelength-axis-copy">
          <span>{axis.left}</span><i>↔</i><span>{axis.right}</span>
        </div>
        <h2>{clue.text}</h2>
        <p>Where is the hidden number relative to this football clue?</p>
      </section>

      <section className="football-wavelength-guess-panel">
        <div className="football-wavelength-guess-value"><small>YOUR GUESS</small><strong>{guess}</strong></div>
        <input
          aria-label="Football Wavelength guess"
          type="range"
          min="1"
          max="100"
          value={guess}
          onChange={(event) => setGuess(Number(event.target.value))}
        />
        <div className="football-wavelength-scale"><span>1</span><span>50</span><span>100</span></div>
        <button type="button" onClick={lockGuess}>LOCK GUESS</button>
      </section>

      {guesses.length ? (
        <section className="football-wavelength-path">
          <small>LOCKED PATH</small>
          <strong>{guesses.join(" → ")}</strong>
        </section>
      ) : null}
    </div>
  );
}
